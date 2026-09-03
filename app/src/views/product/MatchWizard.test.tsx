import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, within, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { MatchWizard, type BomLineItem } from "./MatchWizard";
import { EntityLens } from "../../shell/lens/EntityLens";
import type { ProductItem } from "../../shell/lens/product/CatalogBrowserLens";
import "../../locales/i18n";

const MOCK_CATALOG: ProductItem[] = [
  {
    id: "prod-spk-bose-fs2c",
    sku: "FS2C-W-8R",
    name: "Bose FreeSpace FS2C In-Ceiling Loudspeaker",
    manufacturer: "Bose Professional",
    category: "Loudspeakers",
    status: "in_stock",
    capabilities: ["8Ω", "200W", "ceiling", "in-ceiling"],
    specs: { impedance: "8Ω", power: "200W" },
    stock: { onHand: 48, available: 36, reserved: 12 },
    pricing: { currency: "EUR", listPrice: 189 },
  },
  {
    id: "prod-spk-qsc-ad-c6t",
    sku: "AD-C6T-WH",
    name: "QSC AcousticDesign AD-C6T 6.5\" Ceiling Speaker",
    manufacturer: "QSC",
    category: "Loudspeakers",
    status: "in_stock",
    capabilities: ["8Ω", "200W", "ceiling", "in-ceiling"],
    specs: { impedance: "8Ω", power: "200W" },
    stock: { onHand: 24, available: 18, reserved: 6 },
    pricing: { currency: "EUR", listPrice: 245 },
  },
  {
    id: "prod-sw-cisco-9300",
    sku: "C9300-24UX-A",
    name: "Cisco Catalyst 9300 24-Port UPOE/PoE++ Switch",
    manufacturer: "Cisco Systems",
    category: "Network Switches",
    status: "in_stock",
    capabilities: ["PoE++", "24p", "Layer 3"],
    specs: { ports: "24p", poe: "PoE++" },
    stock: { onHand: 10, available: 8, reserved: 2 },
    pricing: { currency: "EUR", listPrice: 3850 },
  },
];

const SAMPLE_BOM_LINES: BomLineItem[] = [
  {
    id: "line-1",
    lineNumber: 1,
    rawText: "Bose FreeSpace FS2C In-Ceiling Loudspeaker White",
    partNumber: "FS2C-W-8R",
    manufacturer: "Bose Professional",
    quantity: 8,
  },
  {
    id: "line-2",
    lineNumber: 2,
    rawText: "QSC 6.5 inch ceiling speaker 200W",
    quantity: 4,
  },
  {
    id: "line-3",
    lineNumber: 3,
    rawText: "Custom Fabricated Steel Rack Support Arm 2U",
    quantity: 2,
  },
];

describe("Batch 173 (EN.W12) — BOM Match Wizard & ADR-0030 No-Guess Tiering", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("proves ADR-0030 no-guess tiering: fuzzy matches are proposals in the merge queue, NEVER auto-accepted facts", () => {
    render(
      <MatchWizard
        bomLines={SAMPLE_BOM_LINES}
        catalogProducts={MOCK_CATALOG}
      />
    );

    // Verify ADR-0030 compliance banner
    expect(screen.getByTestId("adr-0030-policy-banner")).toBeDefined();
    expect(screen.getByTestId("adr-0030-policy-banner").textContent).toContain("ADR-0030");

    // Line 1 is hard key (exact SKU match) -> should be auto-linked
    const line1 = screen.getByTestId("bom-line-line-1");
    expect(within(line1).getByTestId("badge-tier-hard-key")).toBeDefined();
    expect(within(line1).getByText(/Hard Key/i)).toBeDefined();

    // Line 2 is fuzzy (name/capability match to QSC) -> MUST NOT be auto-linked!
    const line2 = screen.getByTestId("bom-line-line-2");
    expect(within(line2).getByTestId("badge-tier-fuzzy")).toBeDefined();
    expect(within(line2).getByTestId("proposal-flag-line-2")).toBeDefined();
    // Confirms it is rendered as a PROPOSAL requiring human review, NOT linked fact
    expect(within(line2).queryByTestId("badge-tier-hard-key")).toBeNull();
    expect(within(line2).getByTestId("btn-confirm-proposal-line-2")).toBeDefined();

    // Line 3 is unmatched
    const line3 = screen.getByTestId("bom-line-line-3");
    expect(within(line3).getByTestId("badge-tier-unmatched")).toBeDefined();

    // Verify KPI counters reflect tiering
    expect(screen.getByTestId("kpi-hard-key-matches").textContent).toBe("1");
    expect(screen.getByTestId("kpi-fuzzy-proposals").textContent).toBe("1");
    expect(screen.getByTestId("kpi-unmatched").textContent).toBe("1");
  });

  it("filters to Merge Queue and allows confirming a proposed fuzzy match into a linked fact", async () => {
    const handleConfirm = vi.fn();
    render(
      <MatchWizard
        bomLines={SAMPLE_BOM_LINES}
        catalogProducts={MOCK_CATALOG}
        onConfirmMatch={handleConfirm}
      />
    );

    // Switch tab to Merge Queue
    const mergeQueueTab = screen.getByTestId("tab-merge-queue");
    fireEvent.click(mergeQueueTab);

    // Only proposals in the Merge Queue should be visible
    expect(screen.queryByTestId("bom-line-line-1")).toBeNull();
    expect(screen.getByTestId("bom-line-line-2")).toBeDefined();
    expect(screen.queryByTestId("bom-line-line-3")).toBeNull();

    // Confirm proposal for line 2
    const confirmBtn = screen.getByTestId("btn-confirm-proposal-line-2");
    fireEvent.click(confirmBtn);

    expect(handleConfirm).toHaveBeenCalledWith("line-2", "prod-spk-qsc-ad-c6t");

    // Once confirmed, it is no longer in the pending Merge Queue
    expect(screen.queryByTestId("bom-line-line-2")).toBeNull();
    expect(screen.getByTestId("merge-queue-proposals-count").textContent).toBe("0");

    // Switch to All Lines to verify it is now confirmed / linked
    const allTab = screen.getByTestId("tab-all-lines");
    fireEvent.click(allTab);

    const line2 = screen.getByTestId("bom-line-line-2");
    expect(within(line2).getByTestId("badge-tier-fuzzy-confirmed")).toBeDefined();
  });

  it("allows rejecting a fuzzy proposal, moving it to unmatched", () => {
    const handleReject = vi.fn();
    render(
      <MatchWizard
        bomLines={SAMPLE_BOM_LINES}
        catalogProducts={MOCK_CATALOG}
        onRejectMatch={handleReject}
      />
    );

    const rejectBtn = screen.getByTestId("btn-reject-proposal-line-2");
    fireEvent.click(rejectBtn);

    expect(handleReject).toHaveBeenCalledWith("line-2");

    const line2 = screen.getByTestId("bom-line-line-2");
    expect(within(line2).getByTestId("badge-tier-unmatched")).toBeDefined();
  });

  it("supports manual catalog capability search to match an unmatched line", () => {
    const handleOverride = vi.fn();
    render(
      <MatchWizard
        bomLines={SAMPLE_BOM_LINES}
        catalogProducts={MOCK_CATALOG}
        onOverrideMatch={handleOverride}
      />
    );

    // Open search for line 3
    const matchManualBtn = screen.getByTestId("btn-match-manual-line-3");
    fireEvent.click(matchManualBtn);

    // Dialog opens
    const searchModal = screen.getByTestId("catalog-match-modal");
    expect(searchModal).toBeDefined();

    // Search for switch
    const searchInput = screen.getByTestId("modal-catalog-search-input");
    fireEvent.change(searchInput, { target: { value: "PoE++ 24p" } });

    // Select Cisco switch
    const selectBtn = screen.getByTestId("btn-select-prod-sw-cisco-9300");
    fireEvent.click(selectBtn);

    expect(handleOverride).toHaveBeenCalledWith(
      "line-3",
      expect.objectContaining({ id: "prod-sw-cisco-9300" })
    );
  });

  it("proves governed action envelope handles 202 Accepted pending-approval state", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      status: 202,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({
        status: "pending-approval",
        approval_id: "appr-match-4567",
        message: "Match requires commercial supervisor review",
      }),
    });

    render(
      <MatchWizard
        bomLines={SAMPLE_BOM_LINES}
        catalogProducts={MOCK_CATALOG}
        fetchFn={mockFetch as any}
      />
    );

    const confirmBtn = screen.getByTestId("btn-confirm-proposal-line-2");
    fireEvent.click(confirmBtn);

    // Governed action envelope triggers and renders pending-approval state
    const pendingStatus = await screen.findByTestId("governed-action-pending-approval");
    expect(pendingStatus).toBeDefined();
    expect(pendingStatus.textContent).toContain("appr-match-4567");
  });

  it("proves EntityLens mounts MatchWizard appropriately for match viewMode or BOM_MATCH entity", () => {
    render(
      <MemoryRouter>
        <EntityLens
          entityType="PRODUCT"
          viewMode="match"
          matchWizardProps={{
            bomLines: SAMPLE_BOM_LINES,
            catalogProducts: MOCK_CATALOG,
          }}
        />
      </MemoryRouter>
    );

    expect(screen.getByTestId("match-wizard-surface")).toBeDefined();
    expect(screen.getByTestId("adr-0030-policy-banner")).toBeDefined();
  });
});
