import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import React, { useState } from "react";
import { t } from "i18next";
import "../../locales/i18n";

import { LensErrorBoundary } from "./LensErrorBoundary";
import { ErrorState } from "./ErrorState";
import { NotFoundState } from "./NotFoundState";
import {
  BaseLens,
  EntityLens,
  GridLens,
  CanvasLens,
  BoardLens,
  CockpitLens,
} from "../lens";

// Helper component that throws an error when triggered
function CrashingChild({ shouldThrow = true, message = "Facet crashed unexpectedly" }: { shouldThrow?: boolean; message?: string }) {
  if (shouldThrow) {
    throw new Error(message);
  }
  return <div data-testid="recovered-child">{t("test.recovered", "Child rendered successfully")}</div>;
}

// Stateful component to test error boundary recovery / retry
function RecoverableParent() {
  const [hasError, setHasError] = useState(true);

  return (
    <LensErrorBoundary onReset={() => setHasError(false)}>
      <CrashingChild shouldThrow={hasError} message="Temporary glitch" />
    </LensErrorBoundary>
  );
}

describe("Batch 138 (SH.W10) Error Boundaries & Honest Degradation", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  describe("LensErrorBoundary Component", () => {
    it("catches thrown child error and renders ErrorState with retry button", () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const onErrorSpy = vi.fn();

      render(
        <LensErrorBoundary onError={onErrorSpy}>
          <CrashingChild message="Render failure in lens child" />
        </LensErrorBoundary>
      );

      const alertEl = screen.getByRole("alert");
      expect(alertEl).toBeDefined();
      expect(screen.getByText("Render failure in lens child")).toBeDefined();
      expect(screen.queryByTestId("recovered-child")).toBeNull();
      expect(onErrorSpy).toHaveBeenCalledTimes(1);

      consoleErrorSpy.mockRestore();
    });

    it("resets and recovers child state when retry button is clicked", () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      render(<RecoverableParent />);

      expect(screen.getByRole("alert")).toBeDefined();
      expect(screen.getByText("Temporary glitch")).toBeDefined();

      const retryBtn = screen.getByRole("button", { name: new RegExp(t("common.retry", "Retry"), "i") });
      fireEvent.click(retryBtn);

      expect(screen.queryByRole("alert")).toBeNull();
      expect(screen.getByTestId("recovered-child")).toBeDefined();

      consoleErrorSpy.mockRestore();
    });

    it("supports custom fallback renderer if supplied", () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      render(
        <LensErrorBoundary
          fallback={(err, reset) => (
            <div data-testid="custom-fallback">
              <span>{err.message}</span>
              <button type="button" onClick={reset}>
                {t("common.retry", "Retry")}
              </button>
            </div>
          )}
        >
          <CrashingChild message="Custom fallback trigger" />
        </LensErrorBoundary>
      );

      expect(screen.getByTestId("custom-fallback")).toBeDefined();
      expect(screen.getByText("Custom fallback trigger")).toBeDefined();

      consoleErrorSpy.mockRestore();
    });
  });

  describe("Per-Lens Error Boundary Integration (All 5 Lens Kinds)", () => {
    it("BaseLens catches child crash and preserves LensHeader intact", () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const onRetry = vi.fn();

      render(
        <BaseLens
          title="Audio System Schematic"
          subtitle="Building A • Floor 2"
          badge="Live"
          lensKind="canvas"
          actions={<button type="button" data-testid="lens-action-btn">{t("common.settings", "Settings")}</button>}
          onRetry={onRetry}
        >
          <CrashingChild message="Canvas WebGL context lost" />
        </BaseLens>
      );

      // LensHeader elements MUST remain mounted and visible
      expect(screen.getByText("Audio System Schematic")).toBeDefined();
      expect(screen.getByText("Building A • Floor 2")).toBeDefined();
      expect(screen.getByText("Live")).toBeDefined();
      expect(screen.getByTestId("lens-action-btn")).toBeDefined();

      // Lens body displays the caught ErrorState
      expect(screen.getByRole("alert")).toBeDefined();
      expect(screen.getByText("Canvas WebGL context lost")).toBeDefined();

      const retryBtn = screen.getByRole("button", { name: new RegExp(t("common.retry", "Retry"), "i") });
      fireEvent.click(retryBtn);
      expect(onRetry).toHaveBeenCalledTimes(1);

      consoleErrorSpy.mockRestore();
    });

    const lenses = [
      { name: "EntityLens", Component: EntityLens, kind: "entity" },
      { name: "GridLens", Component: GridLens, kind: "grid" },
      { name: "CanvasLens", Component: CanvasLens, kind: "canvas" },
      { name: "BoardLens", Component: BoardLens, kind: "board" },
      { name: "CockpitLens", Component: CockpitLens, kind: "cockpit" },
    ] as const;

    lenses.forEach(({ name, Component, kind }) => {
      it(`${name} catches thrown error in its children and degrades gracefully`, () => {
        const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

        render(
          <Component title={`${name} Surface`} lensKind={kind}>
            <CrashingChild message={`${name} child explosion`} />
          </Component>
        );

        // Header survives
        expect(screen.getByText(`${name} Surface`)).toBeDefined();

        // ErrorState rendered inside lens body
        const alertEl = screen.getByRole("alert");
        expect(alertEl).toBeDefined();
        expect(screen.getByText(`${name} child explosion`)).toBeDefined();

        consoleErrorSpy.mockRestore();
      });
    });
  });

  describe("Honest Error State & Degradation Handling", () => {
    it("renders honest governance-disabled / method-not-found for code -32005", () => {
      render(
        <ErrorState
          error={{ code: -32005, message: "Method not found or capability disabled" }}
        />
      );

      const alertEl = screen.getByRole("alert");
      expect(alertEl).toBeDefined();
      // Must render translation or honest text for -32005
      const matches = screen.getAllByText(/32005/i);
      expect(matches.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByTestId("error-code-badge")).toBeDefined();
      // Must NOT be confused with 404
      expect(screen.queryByText(/404 Not Found/i)).toBeNull();
    });

    it("renders honest NCE-unreachable state for network / connection failures", () => {
      render(
        <ErrorState
          error={{ code: "ECONNREFUSED", message: "Failed to connect to NCE backend" }}
        />
      );

      const alertEl = screen.getByRole("alert");
      expect(alertEl).toBeDefined();
      expect(screen.getByText(/Failed to connect to NCE backend/i)).toBeDefined();
      expect(screen.getByTestId("error-code-badge")).toBeDefined();
    });

    it("renders standard Error object messages honestly", () => {
      render(
        <ErrorState
          error={new Error("Invariant violation: port count exceeded")}
        />
      );

      expect(screen.getByText("Invariant violation: port count exceeded")).toBeDefined();
    });

    it("renders string error payloads honestly", () => {
      render(
        <ErrorState
          error="Direct string error explanation"
        />
      );

      expect(screen.getByText("Direct string error explanation")).toBeDefined();
    });
  });

  describe("404 Route & Honest Not Found State", () => {
    it("NotFoundState renders a genuine 404 Not Found state instead of -32005 error", () => {
      render(<NotFoundState pathname="/unknown/route/test" />);

      // Must render genuine 404 Not Found
      expect(screen.getByText(t("nav.notFound", "404 Not Found"))).toBeDefined();

      // Must NOT render -32005 governance error or NCE connection error
      expect(screen.queryByText(/32005/i)).toBeNull();
      expect(screen.queryByText(/Method not found/i)).toBeNull();
    });
  });
});
