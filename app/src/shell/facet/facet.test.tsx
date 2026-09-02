import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";
import { t } from "i18next";
import {
  registerFacet,
  getFacetsForEntity,
  clearFacetRegistry,
  type Facet,
  type FacetRenderProps,
  FacetContainer,
} from "./index";
import { EntityLens } from "../lens/EntityLens";
import "../../locales/i18n";

describe("Facet Contract & Registry (Batch 140 / OB.W2)", () => {
  beforeEach(() => {
    clearFacetRegistry();
  });

  afterEach(() => {
    cleanup();
    clearFacetRegistry();
    vi.restoreAllMocks();
  });

  describe("Facet Registry", () => {
    it("correctly registers and retrieves facets by entity type in ascending weight order", () => {
      const summaryFacet: Facet<{ label: string }> = {
        id: "asset-summary",
        entity: ["ASSET"],
        weight: 10,
        load: async () => ({ label: "Asset Summary Data" }),
        Render: ({ data }: FacetRenderProps<{ label: string }>) => (
          <div data-testid="facet-asset-summary">{data?.label}</div>
        ),
      };

      const telemetryFacet: Facet<{ telemetry: string }> = {
        id: "asset-telemetry",
        entity: ["ASSET"],
        weight: 50,
        load: async () => ({ telemetry: "Telemetry Active" }),
        Render: ({ data }: FacetRenderProps<{ telemetry: string }>) => (
          <div data-testid="facet-asset-telemetry">{data?.telemetry}</div>
        ),
      };

      const sharedTimelineFacet: Facet<{ events: number }> = {
        id: "timeline-facet",
        entity: ["ASSET", "QUOTE", "FUNCTIONAL_LOCATION"],
        weight: 30,
        load: async () => ({ events: 5 }),
        Render: ({ data }: FacetRenderProps<{ events: number }>) => (
          <div data-testid="facet-timeline">{t("test.events", "Events: {{count}}", { count: data?.events })}</div>
        ),
      };

      const quoteOnlyFacet: Facet<{ total: number }> = {
        id: "quote-totals",
        entity: ["QUOTE"],
        weight: 5,
        load: async () => ({ total: 1000 }),
        Render: ({ data }: FacetRenderProps<{ total: number }>) => (
          <div data-testid="facet-quote-totals">{t("test.total", "Total: {{total}}", { total: data?.total })}</div>
        ),
      };

      const wildcardFacet: Facet<{ note: string }> = {
        id: "audit-notes",
        entity: ["*"],
        weight: 100,
        load: async () => ({ note: "Universal audit note" }),
        Render: ({ data }: FacetRenderProps<{ note: string }>) => (
          <div data-testid="facet-audit-notes">{data?.note}</div>
        ),
      };

      registerFacet(summaryFacet);
      registerFacet(telemetryFacet);
      registerFacet(sharedTimelineFacet);
      registerFacet(quoteOnlyFacet);
      registerFacet(wildcardFacet);

      // ASSET should match summary (10), timeline (30), telemetry (50), wildcard (100)
      const assetFacets = getFacetsForEntity("ASSET");
      expect(assetFacets.map((f) => f.id)).toEqual([
        "asset-summary",
        "timeline-facet",
        "asset-telemetry",
        "audit-notes",
      ]);

      // QUOTE should match quote-totals (5), timeline (30), wildcard (100)
      const quoteFacets = getFacetsForEntity("QUOTE");
      expect(quoteFacets.map((f) => f.id)).toEqual([
        "quote-totals",
        "timeline-facet",
        "audit-notes",
      ]);

      // UNKNOWN entity should only match wildcard (100)
      const otherFacets = getFacetsForEntity("CUSTOM_UNKNOWN_TYPE");
      expect(otherFacets.map((f) => f.id)).toEqual(["audit-notes"]);
    });

    it("supports unregistering a facet via unregisterFacet or returned cleanup callback", () => {
      const facet: Facet = {
        id: "temp-facet",
        entity: ["ASSET"],
        weight: 1,
        load: async () => ({}),
        Render: () => <div>{t("test.temp", "Temp")}</div>,
      };

      const unregister = registerFacet(facet);
      expect(getFacetsForEntity("ASSET")).toHaveLength(1);

      unregister();
      expect(getFacetsForEntity("ASSET")).toHaveLength(0);
    });
  });

  describe("Independent Cancellable Loading", () => {
    it("proves independent loading: fast facet renders immediately without waiting for slow facet", async () => {
      let resolveSlow: (val: { text: string }) => void = () => {};
      const slowPromise = new Promise<{ text: string }>((resolve) => {
        resolveSlow = resolve;
      });

      const fastFacet: Facet<{ message: string }> = {
        id: "fast-facet",
        entity: ["ASSET"],
        weight: 10,
        load: async () => {
          return { message: "Fast Data Ready" };
        },
        Render: ({ data, isLoading }) => (
          <div data-testid="fast-facet">
            {isLoading ? t("test.loadingFast", "Loading Fast...") : data?.message}
          </div>
        ),
      };

      const slowFacet: Facet<{ text: string }> = {
        id: "slow-facet",
        entity: ["ASSET"],
        weight: 20,
        load: async () => {
          return slowPromise;
        },
        Render: ({ data, isLoading }) => (
          <div data-testid="slow-facet">
            {isLoading ? t("test.loadingSlow", "Loading Slow...") : data?.text}
          </div>
        ),
      };

      registerFacet(fastFacet);
      registerFacet(slowFacet);

      render(<FacetContainer entityType="ASSET" entityId="ast-101" />);

      // Fast facet should be loaded almost immediately
      await waitFor(() => {
        expect(screen.getByTestId("fast-facet").textContent).toBe("Fast Data Ready");
      });

      // Slow facet should still be in loading state
      expect(screen.getByTestId("slow-facet").textContent).toBe("Loading Slow...");

      // Now resolve slow facet
      resolveSlow({ text: "Slow Data Finished" });

      await waitFor(() => {
        expect(screen.getByTestId("slow-facet").textContent).toBe("Slow Data Finished");
      });
    });

    it("proves cancellable loading via AbortController when entity changes or component unmounts", async () => {
      let abortedSignal: boolean | null = null;
      let abortCallCount = 0;

      const cancellableFacet: Facet<{ status: string }> = {
        id: "cancellable-facet",
        entity: ["ASSET"],
        weight: 10,
        load: async ({ signal }) => {
          return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
              resolve({ status: "done" });
            }, 500);

            signal.addEventListener("abort", () => {
              clearTimeout(timer);
              abortedSignal = signal.aborted;
              abortCallCount++;
              reject(new DOMException("Aborted", "AbortError"));
            });
          });
        },
        Render: ({ data, isLoading }) => (
          <div data-testid="cancellable-facet">
            {isLoading ? t("test.loadingCancellable", "Loading Cancellable...") : data?.status}
          </div>
        ),
      };

      registerFacet(cancellableFacet);

      const { rerender, unmount } = render(
        <FacetContainer entityType="ASSET" entityId="ast-first" />
      );

      expect(screen.getByTestId("cancellable-facet").textContent).toBe("Loading Cancellable...");

      // Changing entityId should cancel the previous in-flight request
      rerender(<FacetContainer entityType="ASSET" entityId="ast-second" />);

      await waitFor(() => {
        expect(abortedSignal).toBe(true);
        expect(abortCallCount).toBeGreaterThanOrEqual(1);
      });

      // Unmounting should abort active loads as well
      unmount();
      expect(abortCallCount).toBeGreaterThanOrEqual(2);
    });
  });

  describe("Capability Gate", () => {
    it("proves that a facet is hidden with no gap if its required capability is missing", () => {
      const standardFacet: Facet = {
        id: "standard-summary",
        entity: ["ASSET"],
        weight: 10,
        load: async () => ({ info: "Always Visible" }),
        Render: () => <div data-testid="facet-standard">{t("test.stdSummary", "Standard Summary")}</div>,
      };

      const systemDesignFacet: Facet = {
        id: "system-design-facet",
        entity: ["ASSET"],
        weight: 20,
        requires: ["ENGINE_SYSTEM_DESIGN"],
        load: async () => ({ design: "Active" }),
        Render: () => <div data-testid="facet-design">{t("test.designTopo", "Design Topology")}</div>,
      };

      const telemetryFacet: Facet = {
        id: "telemetry-facet",
        entity: ["ASSET"],
        weight: 30,
        requires: ["ENGINE_ASSET_TELEMETRY"],
        load: async () => ({ telemetry: "100W" }),
        Render: () => <div data-testid="facet-telemetry">{t("test.telemetryFeed", "Telemetry Feed")}</div>,
      };

      registerFacet(standardFacet);
      registerFacet(systemDesignFacet);
      registerFacet(telemetryFacet);

      // Case 1: Session has only ENGINE_SYSTEM_DESIGN capability
      const { rerender } = render(
        <FacetContainer
          entityType="ASSET"
          entityId="ast-1"
          capabilities={["ENGINE_SYSTEM_DESIGN"]}
        />
      );

      expect(screen.getByTestId("facet-standard")).toBeDefined();
      expect(screen.getByTestId("facet-design")).toBeDefined();
      expect(screen.queryByTestId("facet-telemetry")).toBeNull();

      // Case 2: Session has no capabilities
      rerender(
        <FacetContainer
          entityType="ASSET"
          entityId="ast-1"
          capabilities={[]}
        />
      );

      expect(screen.getByTestId("facet-standard")).toBeDefined();
      expect(screen.queryByTestId("facet-design")).toBeNull();
      expect(screen.queryByTestId("facet-telemetry")).toBeNull();

      // Case 3: Session gains all capabilities
      rerender(
        <FacetContainer
          entityType="ASSET"
          entityId="ast-1"
          capabilities={["ENGINE_SYSTEM_DESIGN", "ENGINE_ASSET_TELEMETRY"]}
        />
      );

      expect(screen.getByTestId("facet-standard")).toBeDefined();
      expect(screen.getByTestId("facet-design")).toBeDefined();
      expect(screen.getByTestId("facet-telemetry")).toBeDefined();
    });
  });

  describe("Error Containment", () => {
    it("contains errors to individual facet cards without crashing the container or sibling facets", async () => {
      const normalFacet: Facet = {
        id: "normal-facet",
        entity: ["ASSET"],
        weight: 10,
        load: async () => ({ status: "OK" }),
        Render: () => <div data-testid="facet-healthy">{t("test.healthyFacet", "Healthy Facet")}</div>,
      };

      const failingFacet: Facet = {
        id: "failing-facet",
        entity: ["ASSET"],
        weight: 20,
        load: async () => {
          throw new Error("Network timeout loading facet");
        },
        Render: () => <div>{t("test.shouldNotRender", "Should not render")}</div>,
      };

      registerFacet(normalFacet);
      registerFacet(failingFacet);

      render(<FacetContainer entityType="ASSET" entityId="ast-error-test" />);

      // Normal facet is intact
      await waitFor(() => {
        expect(screen.getByTestId("facet-healthy")).toBeDefined();
      });

      // Failing facet shows an isolated error state
      await waitFor(() => {
        const errorEl = screen.getByTestId("facet-card-error-failing-facet");
        expect(errorEl).toBeDefined();
        expect(errorEl.textContent).toContain("Network timeout loading facet");
      });
    });
  });

  describe("EntityLens Integration", () => {
    it("maps EntityLens entityType to registered facets and renders them into the lens body", async () => {
      const assetInfoFacet: Facet<{ name: string }> = {
        id: "asset-info",
        entity: ["ASSET"],
        weight: 10,
        load: async () => ({ name: "Core Switch 48-Port" }),
        Render: ({ data }) => <div data-testid="lens-asset-info">{data?.name}</div>,
      };

      registerFacet(assetInfoFacet);

      render(
        <MemoryRouter initialEntries={["/e/ASSET/ast-9000"]}>
          <Routes>
            <Route path="/e/:type/:id" element={<EntityLens />} />
          </Routes>
        </MemoryRouter>
      );

      const lensEl = screen.getByTestId("lens-entity");
      expect(lensEl.getAttribute("data-entity-type")).toBe("ASSET");
      expect(lensEl.getAttribute("data-entity-id")).toBe("ast-9000");

      await waitFor(() => {
        expect(screen.getByTestId("lens-asset-info").textContent).toBe("Core Switch 48-Port");
      });
    });
  });
});
