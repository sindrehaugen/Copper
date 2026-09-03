import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, within, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import {
  EnrichmentReview,
  DEFAULT_ENRICHMENT_ITEMS,
  type EnrichmentItem,
} from "./EnrichmentReview";
import { EntityLens } from "../../shell/lens/EntityLens";
import "../../locales/i18n";


class MockEventSource {
  constructor(url) {
    this.url = url;
    setTimeout(() => {
      if (this.onmessage) {
        this.onmessage({ data: JSON.stringify({ type: "completed" }) });
      }
    }, 10);
  }
  close() {}
}
global.EventSource = MockEventSource;


const MOCK_ITEMS: EnrichmentItem[] = [
  {
    id: "enrich-test-1",
    productId: "prod-spk-bose-fs2c",
    productSku: "FS2C-W-8R",
    productName: "Bose FreeSpace FS2C In-Ceiling Loudspeaker",
    category: "Loudspeakers",
    manufacturer: "Bose Professional",
    source: "AI Datasheet Extractor v2.4",
    sourceDocument: "Bose_FS2C_Datasheet_2026.pdf",
    confidence: 0.95,
    status: "pending",
    createdAt: "2026-09-02T10:30:00Z",
    fields: [
      {
        key: "description",
        label: "Product Description",
        currentValue: "Ceiling speaker",
        suggestedValue: "High-performance full-range in-ceiling loudspeaker",
        status: "pending",
        confidence: 0.96,
        reason: "Extracted from overview",
      },
      {
        key: "nominalCoverage",
        label: "Nominal Coverage Angle",
        currentValue: null,
        suggestedValue: "170° conical",
        status: "pending",
        confidence: 0.94,
        reason: "Extracted from beamwidth section",
      },
    ],
  },
  {
    id: "enrich-test-2",
    productId: "prod-spk-qsc-ad-c6t",
    productSku: "AD-C6T-WH",
    productName: "QSC AcousticDesign AD-C6T 6.5\" Ceiling Speaker",
    category: "Loudspeakers",
    manufacturer: "QSC",
    source: "Vendor Catalog Synchronization",
    confidence: 0.88,
    status: "pending",
    fields: [
      {
        key: "powerHandling",
        label: "Power Handling",
        currentValue: "200W",
        suggestedValue: "200W continuous / 300W peak",
        status: "pending",
        confidence: 0.91,
      },
    ],
  },
];

describe("Batch 174 (EN.W13) — Product Enrichment Review Queue", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("1. proves AI enrichments render as flagged suggestions (never as facts)", () => {
    render(<EnrichmentReview items={MOCK_ITEMS} />);

    // ADR-0030 policy banner must be visible and explicitly declare suggestions policy
    const policyBanner = screen.getByTestId("adr-0030-policy-banner");
    expect(policyBanner).toBeDefined();
    expect(policyBanner.textContent).toContain("ADR-0030");
    expect(policyBanner.textContent?.toLowerCase()).toContain("flagged suggestions");
    expect(policyBanner.textContent?.toLowerCase()).toContain("never");

    // Check item 1 has flagged AI suggestion badge
    const flagBadge = screen.getByTestId("flagged-suggestion-enrich-test-1");
    expect(flagBadge).toBeDefined();
    expect(flagBadge.textContent).toContain("Flagged AI Suggestion");

    // Confidence badge is rendered
    const confBadge = screen.getByTestId("confidence-badge-enrich-test-1");
    expect(confBadge.textContent).toContain("95%");

    // Verify endpoint indicator
    expect(screen.getByTestId("endpoint-indicator").textContent).toBe(
      "/api/product/enrichment/review"
    );

    // Verify KPI counters
    expect(screen.getByTestId("kpi-total-queue").textContent).toBe("2");
    expect(screen.getByTestId("kpi-pending-suggestions").textContent).toBe("2");
    expect(screen.getByTestId("kpi-approved").textContent).toBe("0");
    expect(screen.getByTestId("kpi-rejected").textContent).toBe("0");
  });

  it("2. shows a golden-record diff (current vs suggested values)", () => {
    render(<EnrichmentReview items={MOCK_ITEMS} />);

    const diffContainer = screen.getByTestId("golden-record-diff-enrich-test-1");
    expect(diffContainer).toBeDefined();

    // Field 1: description
    const currentDesc = screen.getByTestId("diff-current-enrich-test-1-description");
    const suggestedDesc = screen.getByTestId("diff-suggested-enrich-test-1-description");
    expect(currentDesc.textContent).toContain("Ceiling speaker");
    expect(suggestedDesc.textContent).toContain(
      "High-performance full-range in-ceiling loudspeaker"
    );

    // Field 2: nominalCoverage (currentValue is null)
    const currentCoverage = screen.getByTestId(
      "diff-current-enrich-test-1-nominalCoverage"
    );
    const suggestedCoverage = screen.getByTestId(
      "diff-suggested-enrich-test-1-nominalCoverage"
    );
    expect(currentCoverage.textContent).toContain("— None (Not set) —");
    expect(suggestedCoverage.textContent).toContain("170° conical");
  });

  it("3. allows field-by-field approval and rejection with status updates", () => {
    const handleApproveField = vi.fn();
    const handleRejectField = vi.fn();

    render(
      <EnrichmentReview
        items={MOCK_ITEMS}
        onApproveField={handleApproveField}
        onRejectField={handleRejectField}
      />
    );

    // Accept field: description
    const approveDescBtn = screen.getByTestId(
      "btn-approve-field-enrich-test-1-description"
    );
    fireEvent.click(approveDescBtn);
    expect(handleApproveField).toHaveBeenCalledWith(
      "enrich-test-1",
      "description"
    );

    // Now description field shows approved badge
    const descStatus = screen.getByTestId(
      "field-status-enrich-test-1-description"
    );
    expect(descStatus.textContent).toContain("Approved");

    // Reject field: nominalCoverage
    const rejectCoverageBtn = screen.getByTestId(
      "btn-reject-field-enrich-test-1-nominalCoverage"
    );
    fireEvent.click(rejectCoverageBtn);
    expect(handleRejectField).toHaveBeenCalledWith(
      "enrich-test-1",
      "nominalCoverage"
    );

    const coverageStatus = screen.getByTestId(
      "field-status-enrich-test-1-nominalCoverage"
    );
    expect(coverageStatus.textContent).toContain("Rejected");

    // Since all fields are resolved, the item itself moves to approved (because one was approved)
    const itemStatus = screen.getByTestId("item-status-enrich-test-1");
    expect(itemStatus.textContent).toContain("Approved");
  });

  it("7. renders default items when no items prop is provided", () => {
    render(<EnrichmentReview />);

    expect(screen.getByTestId("enrichment-review-surface")).toBeDefined();
    expect(screen.getByTestId("kpi-total-queue").textContent).toBe(
      String(DEFAULT_ENRICHMENT_ITEMS.length)
    );
  });

  it("8. proves scoped diff elements within a card are accessible", () => {
    render(<EnrichmentReview items={MOCK_ITEMS} />);

    const card = screen.getByTestId("enrichment-card-enrich-test-1");
    expect(within(card).getByTestId("flagged-suggestion-enrich-test-1")).toBeDefined();
    expect(within(card).getByTestId("golden-record-diff-enrich-test-1")).toBeDefined();
  });

  it("9. proves EntityLens integrates and mounts EnrichmentReview appropriately", () => {
    render(
      <MemoryRouter>
        <EntityLens
          entityType="PRODUCT"
          viewMode="enrichment"
          enrichmentProps={{
            items: MOCK_ITEMS,
          }}
        />
      </MemoryRouter>
    );

    expect(screen.getByTestId("enrichment-review-surface")).toBeDefined();
    expect(screen.getByTestId("adr-0030-policy-banner")).toBeDefined();
    expect(screen.getByTestId("enrichment-card-enrich-test-1")).toBeDefined();
  });
});

