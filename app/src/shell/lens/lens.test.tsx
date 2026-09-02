import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { t } from "i18next";
import "../../locales/i18n";

import {
  EntityLens,
  GridLens,
  CanvasLens,
  BoardLens,
  CockpitLens,
  CockpitFigure,
  CockpitSection,
  DrillThroughControl,
  CockpitRuleViolationError,
  LensHeader,
  BaseLens,
} from "./index";

describe("Batch 135 (SH.W7) Lens Primitives", () => {
  afterEach(() => {
    cleanup();
  });

  describe("BaseLens and LensHeader primitives", () => {
    it("renders LensHeader with breadcrumbs and actions directly", () => {
      const onBreadcrumbClick = vi.fn();
      render(
        <LensHeader
          title={t("test.headerTitle", "Custom Header")}
          subtitle={t("test.headerSubtitle", "Subtitle detail")}
          lensKind="entity"
          badge={<span data-testid="header-badge">{t("test.badge", "Beta")}</span>}
          actions={<button type="button" data-testid="header-action">{t("test.action", "Save")}</button>}
          breadcrumbs={[
            { label: t("nav.now", "Now"), onClick: onBreadcrumbClick },
            { label: t("nav.rooms", "Rooms") },
          ]}
        />
      );

      expect(screen.getByText(t("test.headerTitle", "Custom Header"))).toBeDefined();
      expect(screen.getByText(t("test.headerSubtitle", "Subtitle detail"))).toBeDefined();
      expect(screen.getByTestId("header-badge")).toBeDefined();
      expect(screen.getByTestId("header-action")).toBeDefined();

      const crumbBtn = screen.getByRole("button", { name: t("nav.now", "Now") });
      fireEvent.click(crumbBtn);
      expect(onBreadcrumbClick).toHaveBeenCalledTimes(1);
    });

    it("renders BaseLens with custom children slot", () => {
      render(
        <BaseLens
          title={t("test.baseTitle", "Base Shell")}
          lensKind="canvas"
          dataTestId="custom-base-lens"
        >
          <div data-testid="base-custom-slot">{t("test.customSlot", "Custom Canvas Content")}</div>
        </BaseLens>
      );

      const baseEl = screen.getByTestId("custom-base-lens");
      expect(baseEl.getAttribute("data-lens-kind")).toBe("canvas");
      expect(screen.getByTestId("base-custom-slot")).toBeDefined();
    });
  });

  describe("All 5 Lens Shells: Common Headers & States", () => {
    const lensKinds = [
      { name: "EntityLens", Component: EntityLens, kind: "entity" },
      { name: "GridLens", Component: GridLens, kind: "grid" },
      { name: "CanvasLens", Component: CanvasLens, kind: "canvas" },
      { name: "BoardLens", Component: BoardLens, kind: "board" },
      { name: "CockpitLens", Component: CockpitLens, kind: "cockpit" },
    ] as const;

    lensKinds.forEach(({ name, Component, kind }) => {
      describe(`${name} (${kind})`, () => {
        it("renders common header with title, subtitle, badge, and actions", () => {
          render(
            <Component
              title={`${name} Title`}
              subtitle={`${name} Subtitle`}
              badge={<span data-testid="test-badge">{t("test.badge", "Active")}</span>}
              actions={<button type="button" data-testid="test-action">{t("test.action", "Action")}</button>}
            >
              <div data-testid="lens-content">{t("test.lensContent", "Lens Content")}</div>
            </Component>
          );

          expect(screen.getByText(`${name} Title`)).toBeDefined();
          expect(screen.getByText(`${name} Subtitle`)).toBeDefined();
          expect(screen.getByTestId("test-badge")).toBeDefined();
          expect(screen.getByTestId("test-action")).toBeDefined();
          expect(screen.getByTestId("lens-content")).toBeDefined();

          const lensEl = screen.getByTestId(`lens-${kind}`);
          expect(lensEl.getAttribute("data-lens-kind")).toBe(kind);
        });

        it("renders loading state when isLoading is true", () => {
          render(
            <Component
              title={`${name} Title`}
              isLoading={true}
            >
              <div data-testid="lens-content">{t("test.lensContent", "Lens Content")}</div>
            </Component>
          );

          const statusEl = screen.getByRole("status");
          expect(statusEl).toBeDefined();
          expect(screen.queryByTestId("lens-content")).toBeNull();
        });

        it("renders error state when error is provided and handles retry", () => {
          const onRetry = vi.fn();
          render(
            <Component
              title={`${name} Title`}
              error="Failed to load lens data"
              onRetry={onRetry}
            >
              <div data-testid="lens-content">{t("test.lensContent", "Lens Content")}</div>
            </Component>
          );

          const alertEl = screen.getByRole("alert");
          expect(alertEl).toBeDefined();
          expect(screen.getByText("Failed to load lens data")).toBeDefined();
          expect(screen.queryByTestId("lens-content")).toBeNull();

          const retryBtn = screen.getByRole("button", { name: /retry/i });
          fireEvent.click(retryBtn);
          expect(onRetry).toHaveBeenCalledTimes(1);
        });

        it("renders empty state when isEmpty is true", () => {
          render(
            <Component
              title={`${name} Title`}
              isEmpty={true}
            >
              <div data-testid="lens-content">{t("test.lensContent", "Lens Content")}</div>
            </Component>
          );

          expect(screen.getByText(/no data/i)).toBeDefined();
          expect(screen.queryByTestId("lens-content")).toBeNull();
        });
      });
    });
  });

  describe("Cockpit Rule: Figures Must Drill Through to GridLens", () => {
    it("throws CockpitRuleViolationError when CockpitFigure is rendered without onDrillThrough", () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      expect(() => {
        render(
          // @ts-expect-error onDrillThrough is missing to test runtime enforcement
          <CockpitFigure label="Total Margin" value="34.5%" />
        );
      }).toThrow(CockpitRuleViolationError);

      expect(() => {
        render(
          <CockpitFigure label="Total Margin" value="34.5%" onDrillThrough={null as any} />
        );
      }).toThrow(/Cockpit Rule/i);

      consoleErrorSpy.mockRestore();
    });

    it("throws CockpitRuleViolationError when DrillThroughControl is rendered without onDrillThrough", () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      expect(() => {
        render(
          // @ts-expect-error onDrillThrough is missing to test runtime enforcement
          <DrillThroughControl>
            <span>{t("test.figureNum", "42")}</span>
          </DrillThroughControl>
        );
      }).toThrow(CockpitRuleViolationError);

      consoleErrorSpy.mockRestore();
    });

    it("renders CockpitFigure properly and triggers onDrillThrough on click and keyboard", () => {
      const onDrillThrough = vi.fn();
      render(
        <CockpitFigure
          label="Open Quotes"
          value={128}
          unit="quotes"
          trend={{ value: "+12%", direction: "up", label: "vs last month" }}
          onDrillThrough={onDrillThrough}
          targetGridLens="sales-quotes-grid"
          dataTestId="open-quotes-metric"
        />
      );

      const figureEl = screen.getByTestId("open-quotes-metric");
      expect(figureEl).toBeDefined();
      expect(screen.getByText("Open Quotes")).toBeDefined();
      expect(screen.getByText("128")).toBeDefined();
      expect(screen.getByText("quotes")).toBeDefined();
      expect(screen.getByText(/vs last month/)).toBeDefined();

      // Click triggers drill-through
      fireEvent.click(figureEl);
      expect(onDrillThrough).toHaveBeenCalledTimes(1);

      // Keyboard (Enter) triggers drill-through
      fireEvent.keyDown(figureEl, { key: "Enter", code: "Enter" });
      expect(onDrillThrough).toHaveBeenCalledTimes(2);

      // Keyboard (Space) triggers drill-through
      fireEvent.keyDown(figureEl, { key: " ", code: "Space" });
      expect(onDrillThrough).toHaveBeenCalledTimes(3);
    });

    it("renders DrillThroughControl wrapping custom figures and triggers drill-through", () => {
      const onDrillThrough = vi.fn();
      render(
        <DrillThroughControl
          onDrillThrough={onDrillThrough}
          targetGridLens="inventory-grid"
          dataTestId="stock-drilldown"
        >
          <span className="custom-metric">{t("test.units", "1,450 Units")}</span>
        </DrillThroughControl>
      );

      const controlEl = screen.getByTestId("stock-drilldown");
      expect(controlEl).toBeDefined();
      expect(screen.getByText("1,450 Units")).toBeDefined();

      fireEvent.click(controlEl);
      expect(onDrillThrough).toHaveBeenCalledTimes(1);
    });

    it("renders CockpitLens hosting multiple compliant CockpitFigures in a CockpitSection", () => {
      const drillToQuotes = vi.fn();
      const drillToRevenue = vi.fn();

      render(
        <CockpitLens
          title="Commercial Cockpit"
          subtitle="Real-time sales & pipeline KPIs"
          badge="Live"
        >
          <CockpitSection title="Commercial Overview" description="Key performance indicators">
            <CockpitFigure
              label="Pipeline Value"
              value="$4.2M"
              onDrillThrough={drillToRevenue}
              targetGridLens="deals-grid"
              dataTestId="metric-pipeline"
            />
            <CockpitFigure
              label="Pending Quotes"
              value={42}
              onDrillThrough={drillToQuotes}
              targetGridLens="quotes-grid"
              dataTestId="metric-quotes"
            />
          </CockpitSection>
        </CockpitLens>
      );

      expect(screen.getByText("Commercial Cockpit")).toBeDefined();
      expect(screen.getByText("Commercial Overview")).toBeDefined();
      expect(screen.getByText("Key performance indicators")).toBeDefined();
      expect(screen.getByText("Pipeline Value")).toBeDefined();
      expect(screen.getByText("$4.2M")).toBeDefined();
      expect(screen.getByText("Pending Quotes")).toBeDefined();
      expect(screen.getByText("42")).toBeDefined();

      fireEvent.click(screen.getByTestId("metric-pipeline"));
      expect(drillToRevenue).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByTestId("metric-quotes"));
      expect(drillToQuotes).toHaveBeenCalledTimes(1);
    });
  });
});
