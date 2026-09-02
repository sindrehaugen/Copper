import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { ENTITY_TYPES, type EntityType } from "@copper/schema";
import {
  FacetRegistry,
  facetRegistry,
  registerFacet,
  clearFacetRegistry,
} from "../../../../app/src/shell/facet/registry";
import {
  createSummaryFacet,
  createTimelineFacet,
  createDocumentsFacet,
  createNotesFacet,
  createSpendFacet,
  createTelemetryFacet,
} from "../../../../app/src/shell/facet/kinds";
import type { Facet } from "../../../../app/src/shell/facet/types";
import type { LensKind } from "../../../../app/src/shell/lens/types";

// ============================================================================
// Default Facet Registration Helpers
// ============================================================================

export function createDefaultFacets(): Facet<unknown>[] {
  return [
    createSummaryFacet({
      id: "summary",
      entity: ["*"],
      weight: 10,
      title: "Summary",
    }) as Facet<unknown>,
    createTimelineFacet({
      id: "timeline",
      entity: [
        "TICKET",
        "PROJECT_PROJECT",
        "PROJECT_GATE",
        "PROJECT_TASK",
        "LEAD",
        "OPPORTUNITY",
        "DEAL",
        "WORK_ORDER",
        "AGREEMENT",
        "INVENTORY_RMA",
      ],
      weight: 30,
      title: "Timeline",
    }) as Facet<unknown>,
    createNotesFacet({
      id: "notes",
      entity: [
        "TICKET",
        "CUSTOMER",
        "LEAD",
        "OPPORTUNITY",
        "DEAL",
        "VENDOR",
        "CONTRACTOR",
        "PROJECT_PROJECT",
        "PROJECT_TASK",
        "WORK_ORDER",
      ],
      weight: 40,
      title: "Notes",
    }) as Facet<unknown>,
    createDocumentsFacet({
      id: "documents",
      entity: [
        "AGREEMENT",
        "AGREEMENT_TERM",
        "AGREEMENT_SIGNATURE",
        "SIGNED_BASELINE",
        "CERT",
        "VENDORS_CERT",
        "INVOICE",
        "PROJECT_PROJECT",
        "PROJECT_CASE_STUDY",
        "PO",
        "GOODS_RECEIPT",
      ],
      weight: 50,
      title: "Documents",
    }) as Facet<unknown>,
    createSpendFacet({
      id: "spend",
      entity: [
        "QUOTE",
        "PO",
        "PO_LINE",
        "INVOICE",
        "MARGIN",
        "PERIOD",
        "POSTING",
        "PROCUREMENT_MATCH",
      ],
      weight: 60,
      title: "Spend",
    }) as Facet<unknown>,
    createTelemetryFacet({
      id: "telemetry",
      entity: [
        "ASSET",
        "DEVICE",
        "PORT",
        "SIGNAL_CHAIN",
        "RACK",
        "FUNCTIONAL_LOCATION",
        "ROOM",
      ],
      weight: 70,
      title: "Telemetry",
    }) as Facet<unknown>,
  ];
}

export function registerDefaultFacets(): () => void {
  const facets = createDefaultFacets();
  const unregisterFns = facets.map((f) => registerFacet(f));
  return () => {
    unregisterFns.forEach((unreg) => unreg());
  };
}

// ============================================================================
// Live NCE Engine Surface Catalog & Representation
// (CL3 / OB.W7 / QA.W5 - Contract-G: The graph is the router)
// ============================================================================

export interface LiveEngineSurface {
  id: string;
  name: string;
  liveEndpoints: string[];
  associatedEntityTypes: EntityType[];
  representedFacets: string[];
  representedLensKinds: LensKind[];
  status: "LIVE" | "HOLD-NCE";
}

/**
 * The 10 Native Live NCE Engine Surfaces per CL3 State Registry & Surface Census.
 * Every live native engine must be represented by registered facets and lenses.
 */
export const LIVE_NCE_ENGINES: Record<string, LiveEngineSurface> = {
  M1_PROCUREMENT: {
    id: "M1",
    name: "Procurement",
    liveEndpoints: [
      "/api/procurement/rank",
      "/api/procurement/tco",
      "/api/procurement/match",
      "/api/procurement/pos",
    ],
    associatedEntityTypes: ["PO", "PO_LINE", "PROCUREMENT_MATCH"],
    representedFacets: ["summary", "spend", "documents"],
    representedLensKinds: ["grid", "entity", "cockpit"],
    status: "LIVE",
  },
  M2_PRODUCT: {
    id: "M2",
    name: "Product",
    liveEndpoints: [
      "/api/product/search",
      "/api/product/enrichment/review",
    ],
    associatedEntityTypes: ["PRODUCT", "PRODUCT_SKU"],
    representedFacets: ["summary"],
    representedLensKinds: ["grid", "entity"],
    status: "LIVE",
  },
  M3_AGREEMENTS: {
    id: "M3",
    name: "Agreements",
    liveEndpoints: [
      "/api/agreements",
      "/api/agreements/coverage",
      "/api/agreements/extract",
      "/api/agreements/review",
    ],
    associatedEntityTypes: ["AGREEMENT", "AGREEMENT_TERM", "AGREEMENT_SIGNATURE"],
    representedFacets: ["summary", "timeline", "documents"],
    representedLensKinds: ["grid", "entity"],
    status: "LIVE",
  },
  M4_VENDORS: {
    id: "M4",
    name: "Vendors",
    liveEndpoints: [
      "/api/vendors",
      "/api/vendors/contractors",
      "/api/vendors/scorecards",
    ],
    associatedEntityTypes: ["VENDOR", "CONTRACTOR", "CERT", "VENDORS_CERT"],
    representedFacets: ["summary", "notes", "documents"],
    representedLensKinds: ["grid", "entity"],
    status: "LIVE",
  },
  M5_SALES: {
    id: "M5",
    name: "Sales",
    liveEndpoints: [
      "/api/sales/dashboard",
      "/api/sales/overview",
      "/api/sales/customers",
      "/api/sales/quotes",
    ],
    associatedEntityTypes: [
      "CUSTOMER",
      "LEAD",
      "OPPORTUNITY",
      "DEAL",
      "QUOTE",
      "SIGNED_BASELINE",
    ],
    representedFacets: ["summary", "timeline", "notes", "spend", "documents"],
    representedLensKinds: ["board", "cockpit", "grid", "entity"],
    status: "LIVE",
  },
  M6_SYSTEM_DESIGN: {
    id: "M6",
    name: "System Design",
    liveEndpoints: [
      "/api/system-design/topology",
      "/api/system-design/geometry",
      "/api/system-design/devices",
      "/api/system-design/cables",
    ],
    associatedEntityTypes: [
      "FUNCTIONAL_LOCATION",
      "ROOM",
      "DESIGN",
      "DESIGN_LINE",
      "DEVICE",
      "PORT",
      "SIGNAL_CHAIN",
      "RACK",
      "CABLE",
    ],
    representedFacets: ["summary", "telemetry"],
    representedLensKinds: ["canvas", "grid", "entity"],
    status: "LIVE",
  },
  M7_PROJECT: {
    id: "M7",
    name: "Project",
    liveEndpoints: [
      "/api/projects",
      "/api/projects/gates",
      "/api/projects/tasks",
      "/api/projects/case-studies",
    ],
    associatedEntityTypes: [
      "PROJECT_PROJECT",
      "PROJECT_GATE",
      "PROJECT_TASK",
      "PROJECT_CASE_STUDY",
    ],
    representedFacets: ["summary", "timeline", "notes", "documents"],
    representedLensKinds: ["board", "cockpit", "grid", "entity"],
    status: "LIVE",
  },
  M8_ECONOMY: {
    id: "M8",
    name: "Economy",
    liveEndpoints: [
      "/api/economy/margin",
      "/api/economy/periods",
      "/api/economy/postings",
      "/api/economy/invoices",
    ],
    associatedEntityTypes: ["INVOICE", "POSTING", "PERIOD", "MARGIN"],
    representedFacets: ["summary", "spend", "documents"],
    representedLensKinds: ["cockpit", "grid", "entity"],
    status: "LIVE",
  },
  M9_ASSETS: {
    id: "M9",
    name: "Assets",
    liveEndpoints: [
      "/api/assets",
      "/api/assets/{id}",
      "/api/assets/{id}/lifecycle",
      "/api/assets/{id}/telemetry",
    ],
    associatedEntityTypes: ["ASSET"],
    representedFacets: ["summary", "telemetry"],
    representedLensKinds: ["grid", "entity"],
    status: "LIVE",
  },
  M11_INVENTORY: {
    id: "M11",
    name: "Inventory",
    liveEndpoints: [
      "/api/inventory/stock",
      "/api/inventory/movements",
      "/api/inventory/goods-receipt",
      "/api/inventory/rma",
    ],
    associatedEntityTypes: [
      "STOCK_LOCATION",
      "INVENTORY_ITEM",
      "GOODS_RECEIPT",
      "INVENTORY_RMA",
    ],
    representedFacets: ["summary", "timeline", "documents"],
    representedLensKinds: ["grid", "entity"],
    status: "LIVE",
  },
};

// ============================================================================
// Coverage Verification Functions (Rule 1 & Rule 2)
// ============================================================================

export interface EntitySummaryCoverageResult {
  isComplete: boolean;
  totalTypes: number;
  coveredTypes: number;
  missingEntityTypes: string[];
  errorMessages: string[];
}

/**
 * Checks that every canonical entity type in the given list has at least one registered summary facet.
 */
export function checkEntitySummaryCoverage(
  registry: FacetRegistry,
  entityTypes: readonly string[] = ENTITY_TYPES
): EntitySummaryCoverageResult {
  const missingEntityTypes: string[] = [];
  const errorMessages: string[] = [];

  for (const entityType of entityTypes) {
    const facets = registry.getFacetsForEntity(entityType);
    const hasSummary = facets.some(
      (f) => f.id === "summary" || f.title?.toLowerCase() === "summary"
    );

    if (!hasSummary) {
      missingEntityTypes.push(entityType);
      errorMessages.push(`Entity type '${entityType}' is missing a summary facet`);
    }
  }

  const coveredTypes = entityTypes.length - missingEntityTypes.length;

  return {
    isComplete: missingEntityTypes.length === 0,
    totalTypes: entityTypes.length,
    coveredTypes,
    missingEntityTypes,
    errorMessages,
  };
}

/**
 * Asserts entity summary coverage and throws a descriptive error if any entity type lacks a summary facet.
 */
export function assertEntitySummaryCoverage(
  registry: FacetRegistry,
  entityTypes: readonly string[] = ENTITY_TYPES
): void {
  const result = checkEntitySummaryCoverage(registry, entityTypes);
  if (!result.isComplete) {
    throw new Error(
      `Entity Summary Coverage Violation: ${result.missingEntityTypes.length} entity types missing summary facet.\n` +
        result.errorMessages.join("\n")
    );
  }
}

export interface EngineSurfaceCoverageResult {
  isComplete: boolean;
  totalEngines: number;
  coveredEngines: number;
  missingEngines: string[];
  errorMessages: string[];
}

/**
 * Checks that every live NCE engine surface is represented by registered facets and lenses.
 */
export function checkEngineSurfaceCoverage(
  registry: FacetRegistry,
  engines: Record<string, LiveEngineSurface> = LIVE_NCE_ENGINES
): EngineSurfaceCoverageResult {
  const missingEngines: string[] = [];
  const errorMessages: string[] = [];

  for (const [key, engine] of Object.entries(engines)) {
    if (engine.status !== "LIVE") continue;

    // 1. Must have live endpoints defined
    if (!engine.liveEndpoints || engine.liveEndpoints.length === 0) {
      missingEngines.push(key);
      errorMessages.push(`Engine '${engine.name}' (${engine.id}) has no declared live endpoints`);
      continue;
    }

    // 2. Must have at least one registered lens kind
    if (!engine.representedLensKinds || engine.representedLensKinds.length === 0) {
      missingEngines.push(key);
      errorMessages.push(`Engine '${engine.name}' (${engine.id}) has no registered lens representation`);
      continue;
    }

    // 3. Must have registered facet coverage across its associated entity types
    let totalFacetsForEngine = 0;
    for (const entityType of engine.associatedEntityTypes) {
      const facets = registry.getFacetsForEntity(entityType);
      totalFacetsForEngine += facets.length;
    }

    if (totalFacetsForEngine === 0) {
      missingEngines.push(key);
      errorMessages.push(
        `Engine '${engine.name}' (${engine.id}) is missing registered facet representation for entity types: ${engine.associatedEntityTypes.join(", ")}`
      );
    }
  }

  const liveEngineCount = Object.values(engines).filter((e) => e.status === "LIVE").length;
  const coveredEngines = liveEngineCount - missingEngines.length;

  return {
    isComplete: missingEngines.length === 0,
    totalEngines: liveEngineCount,
    coveredEngines,
    missingEngines,
    errorMessages,
  };
}

/**
 * Asserts live engine surface coverage and throws if any live engine lacks representation.
 */
export function assertEngineSurfaceCoverage(
  registry: FacetRegistry,
  engines: Record<string, LiveEngineSurface> = LIVE_NCE_ENGINES
): void {
  const result = checkEngineSurfaceCoverage(registry, engines);
  if (!result.isComplete) {
    throw new Error(
      `Engine Surface Coverage Violation: ${result.missingEngines.length} engines missing representation.\n` +
        result.errorMessages.join("\n")
    );
  }
}

// ============================================================================
// Test Suite: Suite-Wide Coverage Assertions (Batch 145 / OB.W7)
// ============================================================================

describe("Suite-Wide Coverage Assertions (Batch 145 / OB.W7 / QA.W5)", () => {
  beforeEach(() => {
    registerDefaultFacets();
  });

  afterEach(() => {
    clearFacetRegistry();
  });

  describe("Rule 1: Canonical Entity Type Summary Facet Coverage", () => {
    it("proves the canonical entity registry contains all 42 expected entity types", () => {
      expect(ENTITY_TYPES.length).toBe(42);
      expect(ENTITY_TYPES).toContain("ASSET");
      expect(ENTITY_TYPES).toContain("QUOTE");
      expect(ENTITY_TYPES).toContain("FUNCTIONAL_LOCATION");
      expect(ENTITY_TYPES).toContain("TICKET");
      expect(ENTITY_TYPES).toContain("STOCK_LOCATION");
      expect(ENTITY_TYPES).toContain("PO");
    });

    it("proves every canonical entity type in @copper/schema has at least one registered summary facet in facetRegistry", () => {
      const coverage = checkEntitySummaryCoverage(facetRegistry, ENTITY_TYPES);
      expect(coverage.isComplete).toBe(true);
      expect(coverage.coveredTypes).toBe(ENTITY_TYPES.length);
      expect(coverage.missingEntityTypes).toEqual([]);
      expect(coverage.errorMessages).toEqual([]);

      // Double-check per entity type
      for (const entityType of ENTITY_TYPES) {
        const facets = facetRegistry.getFacetsForEntity(entityType);
        expect(
          facets.length,
          `Entity type '${entityType}' has no facets registered in facetRegistry`
        ).toBeGreaterThanOrEqual(1);

        const summaryFacet = facets.find((f) => f.id === "summary");
        expect(
          summaryFacet,
          `Entity type '${entityType}' is missing a summary facet`
        ).toBeDefined();
      }
    });

    it("passes assertion runner assertEntitySummaryCoverage against live facetRegistry", () => {
      expect(() => assertEntitySummaryCoverage(facetRegistry, ENTITY_TYPES)).not.toThrow();
    });
  });

  describe("§6.4 RED-First Verification: Failure when facet is missing", () => {
    it("fails with exact gap message \"Entity type 'ASSET' is missing a summary facet\" when ASSET is omitted", () => {
      const testRegistry = new FacetRegistry();

      // Register summary facet for all types EXCEPT ASSET
      testRegistry.register(
        createSummaryFacet({
          id: "summary",
          entity: ENTITY_TYPES.filter((t) => t !== "ASSET"),
          weight: 10,
          title: "Summary",
        })
      );

      const result = checkEntitySummaryCoverage(testRegistry, ENTITY_TYPES);
      expect(result.isComplete).toBe(false);
      expect(result.missingEntityTypes).toContain("ASSET");
      expect(result.errorMessages).toContain("Entity type 'ASSET' is missing a summary facet");

      expect(() => assertEntitySummaryCoverage(testRegistry, ENTITY_TYPES)).toThrow(
        "Entity type 'ASSET' is missing a summary facet"
      );
    });

    it("fails with exact gap message \"Entity type 'QUOTE' is missing a summary facet\" when QUOTE is omitted", () => {
      const testRegistry = new FacetRegistry();

      // Register non-summary facets only (e.g. spend facet for QUOTE)
      testRegistry.register(
        createSpendFacet({
          id: "spend",
          entity: ["QUOTE"],
          weight: 60,
          title: "Spend",
        })
      );

      const result = checkEntitySummaryCoverage(testRegistry, ["QUOTE"]);
      expect(result.isComplete).toBe(false);
      expect(result.missingEntityTypes).toEqual(["QUOTE"]);
      expect(result.errorMessages).toEqual(["Entity type 'QUOTE' is missing a summary facet"]);

      expect(() => assertEntitySummaryCoverage(testRegistry, ["QUOTE"])).toThrow(
        "Entity type 'QUOTE' is missing a summary facet"
      );
    });

    it("fails and enumerates multiple missing entity types when registry is completely empty", () => {
      const emptyRegistry = new FacetRegistry();

      const result = checkEntitySummaryCoverage(emptyRegistry, ["ASSET", "QUOTE", "TICKET"]);
      expect(result.isComplete).toBe(false);
      expect(result.missingEntityTypes).toEqual(["ASSET", "QUOTE", "TICKET"]);
      expect(result.errorMessages).toEqual([
        "Entity type 'ASSET' is missing a summary facet",
        "Entity type 'QUOTE' is missing a summary facet",
        "Entity type 'TICKET' is missing a summary facet",
      ]);

      expect(() =>
        assertEntitySummaryCoverage(emptyRegistry, ["ASSET", "QUOTE", "TICKET"])
      ).toThrow("Entity type 'ASSET' is missing a summary facet");
    });
  });

  describe("Rule 2: Live NCE Engine Surface Representation", () => {
    it("proves all 10 live NCE vertical engines are defined and categorized", () => {
      const liveEngineKeys = Object.keys(LIVE_NCE_ENGINES);
      expect(liveEngineKeys.length).toBe(10);
      expect(liveEngineKeys).toEqual([
        "M1_PROCUREMENT",
        "M2_PRODUCT",
        "M3_AGREEMENTS",
        "M4_VENDORS",
        "M5_SALES",
        "M6_SYSTEM_DESIGN",
        "M7_PROJECT",
        "M8_ECONOMY",
        "M9_ASSETS",
        "M11_INVENTORY",
      ]);
    });

    it("verifies every live NCE engine has registered facet and lens representation", () => {
      const result = checkEngineSurfaceCoverage(facetRegistry, LIVE_NCE_ENGINES);
      expect(result.isComplete).toBe(true);
      expect(result.coveredEngines).toBe(10);
      expect(result.missingEngines).toEqual([]);
      expect(result.errorMessages).toEqual([]);

      for (const [key, engine] of Object.entries(LIVE_NCE_ENGINES)) {
        // Assert live endpoints are declared
        expect(
          engine.liveEndpoints.length,
          `Engine ${engine.name} (${key}) has no live endpoints`
        ).toBeGreaterThanOrEqual(1);

        // Assert lens representation
        expect(
          engine.representedLensKinds.length,
          `Engine ${engine.name} (${key}) has no registered lens kinds`
        ).toBeGreaterThanOrEqual(1);

        // Assert facet representation in facetRegistry
        for (const entityType of engine.associatedEntityTypes) {
          const facets = facetRegistry.getFacetsForEntity(entityType);
          expect(
            facets.length,
            `Engine ${engine.name} (${key}) has entity type '${entityType}' with 0 facets in registry`
          ).toBeGreaterThanOrEqual(1);

          const summaryFacet = facets.find((f) => f.id === "summary");
          expect(
            summaryFacet,
            `Engine ${engine.name} (${key}) entity type '${entityType}' is missing summary facet`
          ).toBeDefined();
        }
      }
    });

    it("passes assertion runner assertEngineSurfaceCoverage against live registry", () => {
      expect(() => assertEngineSurfaceCoverage(facetRegistry, LIVE_NCE_ENGINES)).not.toThrow();
    });

    it("§6.4 RED-First: fails when an engine has no facet representation in registry", () => {
      const customRegistry = new FacetRegistry();

      // Only register facets for M1 Procurement, omitting M9 Assets, M2 Product, etc.
      customRegistry.register(
        createSummaryFacet({
          id: "summary",
          entity: ["PO", "PO_LINE", "PROCUREMENT_MATCH"],
          weight: 10,
          title: "Summary",
        })
      );

      const result = checkEngineSurfaceCoverage(customRegistry, LIVE_NCE_ENGINES);
      expect(result.isComplete).toBe(false);
      expect(result.missingEngines).toContain("M9_ASSETS");
      expect(result.errorMessages).toContain(
        "Engine 'Assets' (M9) is missing registered facet representation for entity types: ASSET"
      );

      expect(() => assertEngineSurfaceCoverage(customRegistry, LIVE_NCE_ENGINES)).toThrow(
        "Engine 'Assets' (M9) is missing registered facet representation for entity types: ASSET"
      );
    });
  });
});
