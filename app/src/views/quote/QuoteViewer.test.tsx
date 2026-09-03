import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { QuoteViewer, type QuoteData } from "./QuoteViewer";
import { EntityLens } from "../../shell/lens/EntityLens";
import { maskingStore } from "../../shell/masking/masking-store.js";
import { useDocumentStore } from "../../store/documentStore";
import "../../locales/i18n";

describe("Batch 168 (EN.W7) — Quote and Signed-Baseline Viewer", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    maskingStore.setMasked(false);
    useDocumentStore.getState().reset();
  });

  const mockQuoteData: QuoteData = {
    id: "quo-2026-8801",
    title: "Nordic Auditorium AV Upgrade",
    customerName: "Nordic Enterprise AS",
    customerId: "cust-nordic-corp",
    status: "approved",
    version: "v2.1",
    currency: "EUR",
    createdAt: "2026-08-25",
    validUntil: "2026-11-30",
    publicUrl: "https://copper.app/public/quote/quo-2026-8801",
    subtotal: 125000,
    taxPercent: 25,
    taxAmount: 31250,
    total: 156250,
    marginPercent: 32.5,
    internalNotes: "Strategic account discount applied (10% on Core hardware).",
    lineItems: [
      {
        id: "line-1",
        name: "Q-SYS Core 610 Processor",
        manufacturer: "QSC",
        sku: "QSC-CORE-610",
        quantity: 2,
        unitPrice: 28500,
        totalPrice: 57000,
        designators: ["DSP-01", "DSP-02"],
      },
      {
        id: "line-2",
        name: "Shure MXA920 Ceiling Array Mic",
        manufacturer: "Shure",
        sku: "SHU-MXA920-W",
        quantity: 8,
        unitPrice: 4200,
        totalPrice: 33600,
        designators: ["MIC-01", "MIC-02", "MIC-03", "MIC-04"],
      },
      {
        id: "line-3",
        name: "Genelec 8430A IP Studio Monitor",
        manufacturer: "Genelec",
        sku: "GEN-8430A",
        quantity: 6,
        unitPrice: 1950,
        totalPrice: 11700,
      },
      {
        id: "line-4",
        name: "Installation & Commissioning Engineering",
        manufacturer: "Copper Services",
        sku: "SRV-COMMISSION",
        quantity: 45,
        unitPrice: 504.44,
        totalPrice: 22700,
        unit: "hours",
      },
    ],
  };

  const mockSignedBaselineData: QuoteData = {
    id: "bsl-2026-9042",
    title: "Executive Boardroom Final Audio Baseline",
    customerName: "Equinor Energy ASA",
    customerId: "cust-equinor",
    status: "signed_baseline",
    version: "v1.0-FINAL",
    currency: "EUR",
    createdAt: "2026-08-10",
    validUntil: "2027-08-10",
    publicUrl: "https://copper.app/public/quote/bsl-2026-9042",
    subtotal: 84000,
    taxPercent: 25,
    taxAmount: 21000,
    total: 105000,
    isSignedBaseline: true,
    baselineDetails: {
      signedAt: "2026-08-20T14:30:00Z",
      signedBy: "Astrid Lindgren",
      signerRole: "VP Infrastructure & Operations",
      contractHash: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      effectiveDate: "2026-09-01",
      snapshotId: "snap-baseline-9042",
    },
    lineItems: [
      {
        id: "bsl-item-1",
        name: "Biamp TesiraFORTE DAN AI",
        manufacturer: "Biamp",
        sku: "BMP-TESIRA-DAN",
        quantity: 1,
        unitPrice: 34000,
        totalPrice: 34000,
      },
      {
        id: "bsl-item-2",
        name: "Cisco Room Bar Pro Bundle",
        manufacturer: "Cisco",
        sku: "CS-BARPRO-K9",
        quantity: 2,
        unitPrice: 25000,
        totalPrice: 50000,
      },
    ],
  };

  it("proves QuoteViewer renders quote data correctly", () => {
    render(<QuoteViewer data={mockQuoteData} />);

    // 1. Header & Identity
    expect(screen.getByTestId("quote-viewer")).toBeDefined();
    expect(screen.getByText("Nordic Auditorium AV Upgrade")).toBeDefined();
    expect(screen.getByText("quo-2026-8801")).toBeDefined();
    expect(screen.getByText(/Nordic Enterprise AS/i)).toBeDefined();
    expect(screen.getByTestId("quote-status-badge").textContent).toMatch(/approved/i);

    // 2. Financial Summary
    expect(screen.getByTestId("quote-subtotal").textContent).toContain("125,000");
    expect(screen.getByTestId("quote-grand-total").textContent).toContain("156,250");
    expect(screen.getByTestId("quote-tax").textContent).toContain("31,250");

    // 3. Line Items
    expect(screen.getByText("Q-SYS Core 610 Processor")).toBeDefined();
    expect(screen.getByText("Shure MXA920 Ceiling Array Mic")).toBeDefined();
    expect(screen.getByText("Genelec 8430A IP Studio Monitor")).toBeDefined();
    expect(screen.getByText("Installation & Commissioning Engineering")).toBeDefined();

    // 4. Public Link
    const publicLinkInput = screen.getByTestId("quote-public-link") as HTMLInputElement;
    expect(publicLinkInput.value).toBe("https://copper.app/public/quote/quo-2026-8801");
  });

  it("proves QuoteViewer locks into read-only mode with frozen state styling when the entity is a signed BASELINE", () => {
    render(
      <QuoteViewer
        entityType="BASELINE"
        entityId="bsl-2026-9042"
        data={mockSignedBaselineData}
      />
    );

    const viewer = screen.getByTestId("quote-viewer");
    expect(viewer.getAttribute("data-frozen")).toBe("true");

    // 1. Frozen Signed Baseline Banner
    const frozenBanner = screen.getByTestId("frozen-baseline-banner");
    expect(frozenBanner).toBeDefined();
    expect(frozenBanner.textContent).toMatch(/FROZEN SIGNED BASELINE/i);
    expect(frozenBanner.textContent).toMatch(/Locked by Contract/i);
    expect(frozenBanner.textContent).toMatch(/Astrid Lindgren/i);
    expect(frozenBanner.textContent).toMatch(/sha256:e3b0c442/i);

    // 2. Frozen badge
    expect(screen.getByTestId("quote-frozen-lock-badge")).toBeDefined();

    // 3. Mutable action controls must not exist or must be disabled
    expect(screen.queryByTestId("btn-edit-quote")).toBeNull();
    expect(screen.queryByTestId("btn-submit-quote")).toBeNull();

    // 4. Line items remain visible in locked view
    expect(screen.getByText("Biamp TesiraFORTE DAN AI")).toBeDefined();
    expect(screen.getByText("Cisco Room Bar Pro Bundle")).toBeDefined();
  });

  it("proves EntityLens mounts QuoteViewer when entityType is QUOTE", () => {
    render(
      <MemoryRouter initialEntries={["/e/QUOTE/quo-2026-8801"]}>
        <Routes>
          <Route
            path="/e/:type/:id"
            element={<EntityLens quoteData={mockQuoteData} />}
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId("quote-viewer")).toBeDefined();
    expect(screen.getByText("Nordic Auditorium AV Upgrade")).toBeDefined();
    expect(screen.getByTestId("quote-grand-total").textContent).toContain("156,250");
  });

  it("proves EntityLens mounts QuoteViewer in frozen read-only mode when entityType is BASELINE", () => {
    render(
      <MemoryRouter initialEntries={["/e/BASELINE/bsl-2026-9042"]}>
        <Routes>
          <Route
            path="/e/:type/:id"
            element={<EntityLens quoteData={mockSignedBaselineData} />}
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId("quote-viewer")).toBeDefined();
    const frozenBanner = screen.getByTestId("frozen-baseline-banner");
    expect(frozenBanner).toBeDefined();
    expect(frozenBanner.textContent).toMatch(/FROZEN SIGNED BASELINE/i);
  });

  it("proves Customer View masking redacts internal margin and internal notes", () => {
    maskingStore.setMasked(true);

    render(<QuoteViewer data={mockQuoteData} />);

    // Customer view masking: margin and internal notes must not be rendered
    expect(screen.queryByTestId("quote-margin")).toBeNull();
    expect(screen.queryByTestId("quote-internal-notes")).toBeNull();

    // Turn off customer view: margin and notes appear
    cleanup();
    maskingStore.setMasked(false);
    render(<QuoteViewer data={mockQuoteData} />);

    expect(screen.getByTestId("quote-margin")).toBeDefined();
    expect(screen.getByTestId("quote-margin").textContent).toContain("32.5%");
    expect(screen.getByTestId("quote-internal-notes")).toBeDefined();
    expect(screen.getByText(/Strategic account discount applied/i)).toBeDefined();
  });

  it("copies public link to clipboard upon button click", async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(<QuoteViewer data={mockQuoteData} />);

    const copyBtn = screen.getByTestId("btn-copy-public-link");
    fireEvent.click(copyBtn);

    expect(writeTextMock).toHaveBeenCalledWith("https://copper.app/public/quote/quo-2026-8801");
    expect(await screen.findByText(/Copied/i)).toBeDefined();
  });
});
