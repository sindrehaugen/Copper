import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { ENTITY_TYPES } from "@copper/schema";
import "../../locales/i18n";
import { EntityLens } from "./EntityLens";
import {
  getFacetsForEntity,
  registerDefaultFacets,
  clearFacetRegistry,
} from "../facet";
import { findingRegistry } from "../finding";

describe("Lens & Facet Assembly (Batch 143 / OB.W5)", () => {
  beforeEach(() => {
    registerDefaultFacets();
  });

  afterEach(() => {
    cleanup();
    clearFacetRegistry();
    findingRegistry.clearAll();
    vi.restoreAllMocks();
  });

  describe("Facet Registry Population across Entity Types", () => {
    it("proves the registry is populated with the correct facets for ASSET (Summary + Telemetry)", () => {
      const assetFacets = getFacetsForEntity("ASSET");
      const facetIds = assetFacets.map((f) => f.id);
      expect(facetIds).toContain("summary");
      expect(facetIds).toContain("telemetry");
      expect(facetIds).not.toContain("spend");
      expect(facetIds).not.toContain("notes");
      expect(facetIds).not.toContain("timeline");
      expect(facetIds).not.toContain("documents");
    });

    it("proves the registry is populated with the correct facets for QUOTE (Summary + Spend)", () => {
      const quoteFacets = getFacetsForEntity("QUOTE");
      const facetIds = quoteFacets.map((f) => f.id);
      expect(facetIds).toContain("summary");
      expect(facetIds).toContain("spend");
      expect(facetIds).not.toContain("telemetry");
      expect(facetIds).not.toContain("notes");
      expect(facetIds).not.toContain("timeline");
    });

    it("proves the registry is populated with the correct facets for TICKET (Summary + Timeline + Notes)", () => {
      const ticketFacets = getFacetsForEntity("TICKET");
      const facetIds = ticketFacets.map((f) => f.id);
      expect(facetIds).toContain("summary");
      expect(facetIds).toContain("timeline");
      expect(facetIds).toContain("notes");
      expect(facetIds).not.toContain("spend");
      expect(facetIds).not.toContain("telemetry");
    });

    it("proves every canonical entity type has at least one registered facet (Summary coverage)", () => {
      for (const entityType of ENTITY_TYPES) {
        const facets = getFacetsForEntity(entityType);
        expect(facets.length).toBeGreaterThanOrEqual(1);
        const facetIds = facets.map((f) => f.id);
        expect(facetIds).toContain("summary");
      }
    });
  });

  describe("Findings Tray Mount in EntityLens Header", () => {
    it("proves the Findings Tray is mounted within EntityLens header", () => {
      render(
        <MemoryRouter initialEntries={["/e/ASSET/ast-101"]}>
          <Routes>
            <Route path="/e/:type/:id" element={<EntityLens />} />
          </Routes>
        </MemoryRouter>
      );

      const findingsTray = screen.getByTestId("findings-tray");
      expect(findingsTray).toBeDefined();

      const toggleBtn = screen.getByTestId("findings-tray-toggle-btn");
      expect(toggleBtn).toBeDefined();
    });

    it("proves entity-scoped findings are accessible through Findings Tray within EntityLens", () => {
      findingRegistry.setProducerFindings("test-producer", [
        {
          id: "finding-asset-1",
          severity: "blocker",
          rule: "RULE-ASSET-OFFLINE",
          message: "Asset is offline and unreachable",
          entityRef: { type: "ASSET", id: "ast-101" },
          provenanceRef: "prov://m9/asset/ast-101",
        },
      ]);

      render(
        <MemoryRouter initialEntries={["/e/ASSET/ast-101"]}>
          <Routes>
            <Route path="/e/:type/:id" element={<EntityLens />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByTestId("findings-tray")).toBeDefined();
      expect(screen.getByTestId("entity-findings-badge")).toBeDefined();
      expect(screen.getByText("RULE-ASSET-OFFLINE")).toBeDefined();

      // Open tray
      const toggleBtn = screen.getByTestId("findings-tray-toggle-btn");
      fireEvent.click(toggleBtn);

      expect(screen.getByTestId("findings-tray-content")).toBeDefined();
      expect(screen.getByTestId("finding-item-finding-asset-1")).toBeDefined();
    });

    it("renders registered facets inside EntityLens body via FacetContainer", async () => {
      render(
        <MemoryRouter initialEntries={["/e/ASSET/ast-101"]}>
          <Routes>
            <Route path="/e/:type/:id" element={<EntityLens />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId("facet-card-summary")).toBeDefined();
        expect(screen.getByTestId("facet-card-telemetry")).toBeDefined();
      });
    });
  });
});
