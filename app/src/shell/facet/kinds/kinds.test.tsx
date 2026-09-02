import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import {
  registerFacet,
  clearFacetRegistry,
  FacetContainer,
  SummaryFacet,
  createSummaryFacet,
  TimelineFacet,
  createTimelineFacet,
  DocumentsFacet,
  createDocumentsFacet,
  NotesFacet,
  createNotesFacet,
  SpendFacet,
  createSpendFacet,
  TelemetryFacet,
  createTelemetryFacet,
  type SummaryFacetData,
  type TimelineFacetData,
  type DocumentsFacetData,
  type NotesFacetData,
  type SpendFacetData,
  type TelemetryFacetData,
} from "../index";
import "../../../locales/i18n";

describe("Reusable Facet Kinds (Batch 141 / OB.W3)", () => {
  beforeEach(() => {
    clearFacetRegistry();
  });

  afterEach(() => {
    cleanup();
    clearFacetRegistry();
    vi.restoreAllMocks();
  });

  describe("Contract Conformance & Instantiation", () => {
    it("instantiates SummaryFacet and verifies contract properties", () => {
      const facet = createSummaryFacet({
        id: "asset-summary-test",
        entity: ["ASSET", "FUNCTIONAL_LOCATION"],
        weight: 15,
        title: "Asset Overview",
        requires: ["ENGINE_SYSTEM_DESIGN"],
      });

      expect(facet.id).toBe("asset-summary-test");
      expect(facet.entity).toEqual(["ASSET", "FUNCTIONAL_LOCATION"]);
      expect(facet.weight).toBe(15);
      expect(facet.title).toBe("Asset Overview");
      expect(facet.requires).toEqual(["ENGINE_SYSTEM_DESIGN"]);
      expect(typeof facet.load).toBe("function");
      expect(typeof facet.Render).toBe("function");
    });

    it("instantiates TimelineFacet and verifies contract properties", () => {
      const facet = createTimelineFacet({
        id: "quote-timeline-test",
        entity: ["QUOTE", "PROJECT"],
        weight: 25,
        title: "Quote History",
      });

      expect(facet.id).toBe("quote-timeline-test");
      expect(facet.entity).toEqual(["QUOTE", "PROJECT"]);
      expect(facet.weight).toBe(25);
      expect(facet.title).toBe("Quote History");
      expect(typeof facet.load).toBe("function");
      expect(typeof facet.Render).toBe("function");
    });

    it("instantiates DocumentsFacet and verifies contract properties", () => {
      const facet = createDocumentsFacet({
        id: "vendor-docs-test",
        entity: ["VENDOR", "AGREEMENT"],
        weight: 35,
        title: "Attached Documents",
      });

      expect(facet.id).toBe("vendor-docs-test");
      expect(facet.entity).toEqual(["VENDOR", "AGREEMENT"]);
      expect(facet.weight).toBe(35);
      expect(facet.title).toBe("Attached Documents");
      expect(typeof facet.load).toBe("function");
      expect(typeof facet.Render).toBe("function");
    });

    it("instantiates NotesFacet and verifies contract properties", () => {
      const facet = createNotesFacet({
        id: "ticket-notes-test",
        entity: ["TICKET", "WORK_ORDER"],
        weight: 45,
        title: "Work Notes",
      });

      expect(facet.id).toBe("ticket-notes-test");
      expect(facet.entity).toEqual(["TICKET", "WORK_ORDER"]);
      expect(facet.weight).toBe(45);
      expect(facet.title).toBe("Work Notes");
      expect(typeof facet.load).toBe("function");
      expect(typeof facet.Render).toBe("function");
    });

    it("instantiates SpendFacet and verifies contract properties", () => {
      const facet = createSpendFacet({
        id: "po-spend-test",
        entity: ["PO_LINE", "QUOTE"],
        weight: 55,
        title: "Financial Breakdown",
      });

      expect(facet.id).toBe("po-spend-test");
      expect(facet.entity).toEqual(["PO_LINE", "QUOTE"]);
      expect(facet.weight).toBe(55);
      expect(facet.title).toBe("Financial Breakdown");
      expect(typeof facet.load).toBe("function");
      expect(typeof facet.Render).toBe("function");
    });

    it("instantiates TelemetryFacet and verifies contract properties", () => {
      const facet = createTelemetryFacet({
        id: "asset-telemetry-test",
        entity: ["ASSET", "RACK"],
        weight: 65,
        title: "Device Telemetry",
        requires: ["ENGINE_ASSET_TELEMETRY"],
      });

      expect(facet.id).toBe("asset-telemetry-test");
      expect(facet.entity).toEqual(["ASSET", "RACK"]);
      expect(facet.weight).toBe(65);
      expect(facet.title).toBe("Device Telemetry");
      expect(facet.requires).toEqual(["ENGINE_ASSET_TELEMETRY"]);
      expect(typeof facet.load).toBe("function");
      expect(typeof facet.Render).toBe("function");
    });
  });

  describe("Mock State Rendering & Multi-Entity Generics", () => {
    it("renders SummaryFacet mock data correctly across multiple entity types", async () => {
      const mockAssetSummary: SummaryFacetData = {
        title: "Cisco Catalyst 9300",
        description: "Primary distribution switch in Rack R-01",
        status: { label: "Operational", variant: "success" },
        properties: [
          { label: "IP Address", value: "10.0.1.25" },
          { label: "Serial Number", value: "FOC2412X09" },
          { label: "Firmware", value: "v17.9.2" },
        ],
        metrics: [
          { label: "Port Utilization", value: "78%" },
          { label: "Power Draw", value: "145W" },
        ],
      };

      const assetSummaryFacet = SummaryFacet({
        id: "summary-asset",
        entity: ["ASSET"],
        load: async () => mockAssetSummary,
      });

      const mockQuoteSummary: SummaryFacetData = {
        title: "AV Upgrade Phase 2",
        description: "Boardroom dual-display and conferencing setup",
        status: { label: "In Review", variant: "warning" },
        properties: [
          { label: "Customer", value: "Acme Corp" },
          { label: "Valid Until", value: "2026-10-01" },
        ],
        metrics: [
          { label: "Total Value", value: "$45,200" },
          { label: "Margin", value: "32%" },
        ],
      };

      const quoteSummaryFacet = SummaryFacet({
        id: "summary-quote",
        entity: ["QUOTE"],
        load: async () => mockQuoteSummary,
      });

      registerFacet(assetSummaryFacet);
      registerFacet(quoteSummaryFacet);

      // Render ASSET
      const { rerender } = render(
        <FacetContainer entityType="ASSET" entityId="ast-001" />
      );

      await waitFor(() => {
        expect(screen.getByTestId("facet-summary-title").textContent).toBe("Cisco Catalyst 9300");
        expect(screen.getByText("Primary distribution switch in Rack R-01")).toBeDefined();
        expect(screen.getByText("Operational")).toBeDefined();
        expect(screen.getByText("10.0.1.25")).toBeDefined();
        expect(screen.getByText("78%")).toBeDefined();
      });

      // Render QUOTE
      rerender(<FacetContainer entityType="QUOTE" entityId="quo-002" />);

      await waitFor(() => {
        expect(screen.getByTestId("facet-summary-title").textContent).toBe("AV Upgrade Phase 2");
        expect(screen.getByText("Boardroom dual-display and conferencing setup")).toBeDefined();
        expect(screen.getByText("In Review")).toBeDefined();
        expect(screen.getByText("Acme Corp")).toBeDefined();
        expect(screen.getByText("$45,200")).toBeDefined();
      });
    });

    it("renders TimelineFacet mock events correctly", async () => {
      const mockTimeline: TimelineFacetData = {
        events: [
          {
            id: "evt-1",
            timestamp: "2026-09-01T14:30:00Z",
            title: "Firmware Updated",
            description: "Upgraded to 17.9.2 by Admin",
            actor: { name: "System Admin" },
            category: "maintenance",
            status: "completed",
          },
          {
            id: "evt-2",
            timestamp: "2026-08-28T09:15:00Z",
            title: "Port Flap Detected",
            description: "Interface Gi1/0/24 link state down",
            category: "alert",
            status: "failed",
          },
        ],
      };

      const timelineFacet = TimelineFacet({
        id: "timeline-universal",
        entity: ["ASSET", "FUNCTIONAL_LOCATION"],
        load: async () => mockTimeline,
      });

      registerFacet(timelineFacet);

      render(<FacetContainer entityType="ASSET" entityId="ast-001" />);

      await waitFor(() => {
        expect(screen.getByText("Firmware Updated")).toBeDefined();
        expect(screen.getByText("Upgraded to 17.9.2 by Admin")).toBeDefined();
        expect(screen.getByText("System Admin")).toBeDefined();
        expect(screen.getByText("Port Flap Detected")).toBeDefined();
      });
    });

    it("renders DocumentsFacet mock files correctly", async () => {
      const mockDocs: DocumentsFacetData = {
        documents: [
          {
            id: "doc-1",
            title: "As-Built Schematic Diagram",
            filename: "schematic-v2.pdf",
            fileType: "pdf",
            sizeBytes: 2048576,
            updatedAt: "2026-08-30",
            category: "Drawings",
          },
          {
            id: "doc-2",
            title: "Commissioning Sign-off",
            filename: "signoff.docx",
            fileType: "docx",
            sizeBytes: 524288,
            updatedAt: "2026-09-01",
            category: "Sign-offs",
          },
        ],
      };

      const docsFacet = DocumentsFacet({
        id: "documents-universal",
        entity: ["FUNCTIONAL_LOCATION", "PROJECT"],
        load: async () => mockDocs,
      });

      registerFacet(docsFacet);

      render(<FacetContainer entityType="FUNCTIONAL_LOCATION" entityId="loc-100" />);

      await waitFor(() => {
        expect(screen.getByText("As-Built Schematic Diagram")).toBeDefined();
        expect(screen.getByText("schematic-v2.pdf")).toBeDefined();
        expect(screen.getByText("Commissioning Sign-off")).toBeDefined();
      });
    });

    it("renders NotesFacet mock notes correctly", async () => {
      const mockNotes: NotesFacetData = {
        notes: [
          {
            id: "note-1",
            author: { name: "Sarah Tech" },
            content: "Checked rack cable dressing; all runs labelled properly.",
            createdAt: "2026-09-02T10:00:00Z",
            isPinned: true,
            tags: ["inspection", "cabling"],
          },
          {
            id: "note-2",
            author: { name: "Mike Engineer" },
            content: "Replaced faulty patch cord on port 12.",
            createdAt: "2026-09-01T16:00:00Z",
            tags: ["repair"],
          },
        ],
      };

      const notesFacet = NotesFacet({
        id: "notes-universal",
        entity: ["ASSET", "TICKET"],
        load: async () => mockNotes,
      });

      registerFacet(notesFacet);

      render(<FacetContainer entityType="TICKET" entityId="tkt-500" />);

      await waitFor(() => {
        expect(screen.getByText("Checked rack cable dressing; all runs labelled properly.")).toBeDefined();
        expect(screen.getByText("Sarah Tech")).toBeDefined();
        expect(screen.getByText("Replaced faulty patch cord on port 12.")).toBeDefined();
      });
    });

    it("renders SpendFacet financial figures and breakdown correctly", async () => {
      const mockSpend: SpendFacetData = {
        currency: "EUR",
        totalBudget: 100000,
        totalSpend: 74500,
        committedSpend: 15000,
        variance: 10500,
        breakdown: [
          {
            id: "sp-1",
            category: "Hardware",
            description: "Core Switch & PoE Injectors",
            amount: 52000,
            currency: "EUR",
            status: "actual",
          },
          {
            id: "sp-2",
            category: "Labour",
            description: "Cabling Installation & Testing",
            amount: 22500,
            currency: "EUR",
            status: "actual",
          },
          {
            id: "sp-3",
            category: "Licenses",
            description: "Annual Controller License",
            amount: 15000,
            currency: "EUR",
            status: "committed",
          },
        ],
      };

      const spendFacet = SpendFacet({
        id: "spend-universal",
        entity: ["PROJECT", "QUOTE"],
        load: async () => mockSpend,
      });

      registerFacet(spendFacet);

      render(<FacetContainer entityType="PROJECT" entityId="prj-88" />);

      await waitFor(() => {
        expect(screen.getByTestId("facet-spend-total").textContent).toContain("74,500");
        expect(screen.getByText("Core Switch & PoE Injectors")).toBeDefined();
        expect(screen.getByText("Cabling Installation & Testing")).toBeDefined();
      });
    });

    it("renders TelemetryFacet metrics and health status correctly", async () => {
      const mockTelemetry: TelemetryFacetData = {
        status: "healthy",
        lastPing: "2026-09-02T22:00:00Z",
        metrics: [
          {
            id: "m-temp",
            name: "Internal Temperature",
            value: 42.5,
            unit: "°C",
            status: "normal",
          },
          {
            id: "m-fan",
            name: "Fan Speed",
            value: 3200,
            unit: "RPM",
            status: "normal",
          },
          {
            id: "m-cpu",
            name: "CPU Load",
            value: 88,
            unit: "%",
            status: "warning",
          },
        ],
      };

      const telemetryFacet = TelemetryFacet({
        id: "telemetry-universal",
        entity: ["ASSET"],
        load: async () => mockTelemetry,
      });

      registerFacet(telemetryFacet);

      render(<FacetContainer entityType="ASSET" entityId="ast-999" />);

      await waitFor(() => {
        expect(screen.getByText("Internal Temperature")).toBeDefined();
        expect(screen.getByText("42.5")).toBeDefined();
        expect(screen.getByText("°C")).toBeDefined();
        expect(screen.getByText("Fan Speed")).toBeDefined();
        expect(screen.getByText("CPU Load")).toBeDefined();
      });
    });

    it("renders empty states gracefully across all facet kinds", async () => {
      const emptySummary = SummaryFacet({
        id: "empty-summary",
        entity: ["ASSET"],
        load: async () => ({ properties: [] }),
      });

      const emptyTimeline = TimelineFacet({
        id: "empty-timeline",
        entity: ["ASSET"],
        load: async () => ({ events: [] }),
      });

      const emptyDocs = DocumentsFacet({
        id: "empty-docs",
        entity: ["ASSET"],
        load: async () => ({ documents: [] }),
      });

      const emptyNotes = NotesFacet({
        id: "empty-notes",
        entity: ["ASSET"],
        load: async () => ({ notes: [] }),
      });

      const emptySpend = SpendFacet({
        id: "empty-spend",
        entity: ["ASSET"],
        load: async () => ({ currency: "USD", totalSpend: 0, breakdown: [] }),
      });

      const emptyTelemetry = TelemetryFacet({
        id: "empty-telemetry",
        entity: ["ASSET"],
        load: async () => ({ status: "unknown", metrics: [] }),
      });

      registerFacet(emptySummary);
      registerFacet(emptyTimeline);
      registerFacet(emptyDocs);
      registerFacet(emptyNotes);
      registerFacet(emptySpend);
      registerFacet(emptyTelemetry);

      render(<FacetContainer entityType="ASSET" entityId="ast-empty" />);

      await waitFor(() => {
        expect(screen.getByTestId("facet-empty-summary")).toBeDefined();
        expect(screen.getByTestId("facet-empty-timeline")).toBeDefined();
        expect(screen.getByTestId("facet-empty-documents")).toBeDefined();
        expect(screen.getByTestId("facet-empty-notes")).toBeDefined();
        expect(screen.getByTestId("facet-empty-spend")).toBeDefined();
        expect(screen.getByTestId("facet-empty-telemetry")).toBeDefined();
      });
    });
  });
});
