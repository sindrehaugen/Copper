export * from "./types";
export * from "./capability";
export * from "./registry";
export * from "./useFacetLoader";
export * from "./FacetCard";
export * from "./FacetContainer";
export * from "./kinds";

import type { Facet } from "./types";
import { registerFacet } from "./registry";
import {
  createSummaryFacet,
  createTimelineFacet,
  createDocumentsFacet,
  createNotesFacet,
  createSpendFacet,
  createTelemetryFacet,
} from "./kinds";

/**
 * Default facet definitions wired across all 29+ domain entity types.
 * (Batch 143 / OB.W5 - Contract-G: The graph is the router)
 */
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

/**
 * Registers default facet kinds into the facet registry.
 */
export function registerDefaultFacets(): () => void {
  const facets = createDefaultFacets();
  const unregisterFns = facets.map((f) => registerFacet(f));
  return () => {
    unregisterFns.forEach((unreg) => unreg());
  };
}

// Auto-register default facets on module initialization
registerDefaultFacets();
