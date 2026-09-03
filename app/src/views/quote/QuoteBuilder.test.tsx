import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QuoteBuilder } from "./QuoteBuilder";
import { EntityLens } from "../../shell/lens/EntityLens";
import type { QuoteData } from "./QuoteViewer";
import type { BOMItem } from "../../store/selectors/derived";
import "../../locales/i18n";

const mockBOMItems: BOMItem[] = [
  {
    deviceTypeId: "core-610",
    name: "Q-SYS Core 610 Audio Processor",
    manufacturer: "QSC",
    quantity: 2,
    unitPrice: 15000,
    designators: ["DSP-01", "DSP-02"],
  },
  {
    deviceTypeId: "mxa920-w",
    name: "Shure MXA920 Ceiling Array Mic",
    manufacturer: "Shure",
    quantity: 4,
    unitPrice: 2500,
    designators: ["MIC-01", "MIC-02", "MIC-03", "MIC-04"],
  },
];

const mockExecuteGovernedAction = vi.fn().mockImplementation(async (_req, options) => {
  const resultState = {
    status: "resolved",
    isResolved: true,
    isSubmitting: false,
    isPendingApproval: false,
    isRejected: false,
    isFailed: false,
    isIdle: false,
    data: { quoteId: "quo-test-123" },
  };
  options?.onStatusChange?.("resolved", resultState);
  return resultState;
});

vi.mock("../../store/selectors/derived", () => ({
  useBOM: () => mockBOMItems,
  useCableScheduleRows: () => [],
}));

vi.mock("../../shell/action/envelope", () => ({
  executeGovernedAction: (...args: any[]) => mockExecuteGovernedAction(...args),
  createInitialActionState: (overrides?: any) => {
    const status = overrides?.status || "idle";
    return {
      status,
      isIdle: status === "idle",
      isSubmitting: status === "submitting",
      isPendingApproval: status === "pending-approval",
      isResolved: status === "resolved",
      isRejected: status === "rejected",
      isFailed: status === "failed",
      ...overrides,
    };
  },
}));

describe("B167 — QuoteBuilder Component", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  const sampleQuoteData: QuoteData = {
    id: "quo-test-001",
    title: "Auditorium Sound System Upgrade",
    customerName: "Nordic Corp AS",
    customerId: "cust-nordic-01",
    status: "draft",
    version: "v1.0",
    currency: "EUR",
    validUntil: "2026-12-31",
    taxPercent: 25,
    lineItems: [
      {
        id: "item-1",
        name: "DSP Main Processor",
        manufacturer: "QSC",
        sku: "CORE-110F",
        quantity: 1,
        unitCost: 2000,
        unitPrice: 4000,
        totalPrice: 4000,
      },
      {
        id: "item-2",
        name: "Wireless Boundary Mic",
        manufacturer: "Shure",
        sku: "MXA310",
        quantity: 2,
        unitCost: 500,
        unitPrice: 1000,
        totalPrice: 2000,
      },
    ],
  };

  it("1. renders QuoteBuilder with provided initial quote data and computes metrics", () => {
    render(<QuoteBuilder data={sampleQuoteData} />);

    expect(screen.getByTestId("quote-builder")).toBeDefined();
    const titleInput = screen.getByTestId("input-quote-title") as HTMLInputElement;
    expect(titleInput.value).toBe("Auditorium Sound System Upgrade");

    const customerInput = screen.getByTestId("input-customer-name") as HTMLInputElement;
    expect(customerInput.value).toBe("Nordic Corp AS");

    // Subtotal = 4000 + 2000 = 6000
    const subtotal = screen.getByTestId("quote-subtotal");
    expect(subtotal.textContent).toContain("6,000");

    // Total Cost = 2000*1 + 500*2 = 3000
    const cost = screen.getByTestId("quote-total-cost");
    expect(cost.textContent).toContain("3,000");

    // Tax = 25% of 6000 = 1500
    const tax = screen.getByTestId("quote-tax");
    expect(tax.textContent).toContain("1,500");

    // Grand total = 6000 + 1500 = 7500
    const grandTotal = screen.getByTestId("quote-grand-total");
    expect(grandTotal.textContent).toContain("7,500");
  });

  it("2. implements margin calculation: (Total Price - Total Cost) / Total Price * 100", () => {
    render(<QuoteBuilder data={sampleQuoteData} />);

    // Total price = 6000, Total cost = 3000 -> Margin = (6000 - 3000) / 6000 * 100 = 50%
    const margin = screen.getByTestId("quote-margin");
    expect(margin.textContent).toContain("50%");
  });

  it("3. proves margin advisory label reflects tiers: healthy (>=35%), moderate (15%-34%), critical (<15%)", () => {
    // Initial data has 50% margin -> Healthy tier (>= 35%)
    const { rerender } = render(<QuoteBuilder data={sampleQuoteData} />);

    const badgeHealthy = screen.getByTestId("margin-advisory-badge");
    expect(badgeHealthy.getAttribute("data-margin-tier")).toBe("healthy");
    expect(badgeHealthy.textContent).toMatch(/healthy margin/i);

    // Update item-1 cost from 2000 to 3200 and item-2 cost from 500 to 800
    // Total price = 6000. Total cost = 3200 + 1600 = 4800. Margin = (6000 - 4800)/6000 = 20% -> Moderate tier
    const costInput1 = screen.getByTestId("input-item-cost-item-1") as HTMLInputElement;
    fireEvent.change(costInput1, { target: { value: "3200" } });

    const costInput2 = screen.getByTestId("input-item-cost-item-2") as HTMLInputElement;
    fireEvent.change(costInput2, { target: { value: "800" } });

    const badgeModerate = screen.getByTestId("margin-advisory-badge");
    expect(badgeModerate.getAttribute("data-margin-tier")).toBe("moderate");
    expect(badgeModerate.textContent).toMatch(/moderate margin/i);

    // Update item-1 cost to 3700 and item-2 cost to 900
    // Total cost = 3700 + 1800 = 5500. Margin = (6000 - 5500) / 6000 = 8.3% -> Critical tier (< 15%)
    fireEvent.change(costInput1, { target: { value: "3700" } });
    fireEvent.change(costInput2, { target: { value: "900" } });

    const badgeCritical = screen.getByTestId("margin-advisory-badge");
    expect(badgeCritical.getAttribute("data-margin-tier")).toBe("critical");
    expect(badgeCritical.textContent).toMatch(/low margin/i);
  });

  it("4. supports importing items from design BOM using useBOM hook", () => {
    // Start with empty quote
    render(<QuoteBuilder data={{ id: "quo-empty", title: "Empty Quote", lineItems: [] }} />);

    expect(screen.getByTestId("quote-empty-items-row")).toBeDefined();

    const importBomBtn = screen.getByTestId("btn-import-bom");
    fireEvent.click(importBomBtn);

    // After import, mockBOMItems (2 items: core-610 and mxa920-w) should be present
    expect(screen.queryByTestId("quote-empty-items-row")).toBeNull();
    expect(screen.getByDisplayValue("Q-SYS Core 610 Audio Processor")).toBeDefined();
    expect(screen.getByDisplayValue("Shure MXA920 Ceiling Array Mic")).toBeDefined();

    // Check financial totals updated from imported items
    const subtotal = screen.getByTestId("quote-subtotal");
    expect(subtotal.textContent).not.toBe("EUR 0");
  });

  it("5. supports adding manual line items and editing them", () => {
    render(<QuoteBuilder data={{ id: "quo-manual", title: "Manual Quote", lineItems: [] }} />);

    const addBtn = screen.getByTestId("btn-add-line-item");
    fireEvent.click(addBtn);

    // Empty row is replaced with the new line item
    expect(screen.queryByTestId("quote-empty-items-row")).toBeNull();

    // Find the input for item name
    const nameInputs = screen.getAllByPlaceholderText(/Product or service name/i);
    expect(nameInputs.length).toBe(1);

    fireEvent.change(nameInputs[0], { target: { value: "Custom Acoustic Panels" } });
    expect((nameInputs[0] as HTMLInputElement).value).toBe("Custom Acoustic Panels");

    // Change quantity and price
    const qtyInputs = screen.getAllByDisplayValue("1");
    const qtyInput = qtyInputs[0];
    fireEvent.change(qtyInput, { target: { value: "5" } });

    const priceInputs = screen.getAllByDisplayValue("0");
    // Unit price is one of the inputs initialized to 0
    fireEvent.change(priceInputs[1], { target: { value: "200" } });

    // Subtotal should update
    const subtotal = screen.getByTestId("quote-subtotal");
    expect(subtotal.textContent).toContain("1,000");
  });

  it("6. supports deleting line items", () => {
    render(<QuoteBuilder data={sampleQuoteData} />);

    // Initially 2 line items
    expect(screen.getByTestId("line-item-row-item-1")).toBeDefined();
    expect(screen.getByTestId("line-item-row-item-2")).toBeDefined();

    const deleteBtnItem1 = screen.getByTestId("btn-delete-item-item-1");
    fireEvent.click(deleteBtnItem1);

    // item-1 is removed, item-2 remains
    expect(screen.queryByTestId("line-item-row-item-1")).toBeNull();
    expect(screen.getByTestId("line-item-row-item-2")).toBeDefined();

    // Subtotal now only has item-2 (2000)
    const subtotal = screen.getByTestId("quote-subtotal");
    expect(subtotal.textContent).toContain("2,000");
  });

  it("7. wraps quote submission in executeGovernedAction calling /api/sales/quotes with sales.quote.submit", async () => {
    render(<QuoteBuilder data={sampleQuoteData} />);

    const submitBtn = screen.getByTestId("btn-submit-quote");
    fireEvent.click(submitBtn);

    expect(mockExecuteGovernedAction).toHaveBeenCalledTimes(1);
    expect(mockExecuteGovernedAction).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "sales.quote.submit",
        url: "/api/sales/quotes",
        params: expect.objectContaining({
          quote: expect.objectContaining({
            id: "quo-test-001",
            title: "Auditorium Sound System Upgrade",
            customerName: "Nordic Corp AS",
            status: "in_review",
            subtotal: 6000,
            marginPercent: 50,
          }),
        }),
      }),
      expect.any(Object)
    );
  });

  it("8. supports saving draft quote via onSave callback", () => {
    const handleSave = vi.fn();
    render(<QuoteBuilder data={sampleQuoteData} onSave={handleSave} />);

    const saveBtn = screen.getByTestId("btn-save-quote");
    fireEvent.click(saveBtn);

    expect(handleSave).toHaveBeenCalledTimes(1);
    expect(handleSave).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "quo-test-001",
        title: "Auditorium Sound System Upgrade",
        customerName: "Nordic Corp AS",
      })
    );

    // Shows save notice toast
    expect(screen.getByTestId("quote-save-notice")).toBeDefined();
  });

  it("9. proves EntityLens mounts QuoteBuilder when isQuoteBuilder prop is true", () => {
    render(
      <MemoryRouter>
        <EntityLens
          entityType="QUOTE"
          entityId="quo-test-001"
          isQuoteBuilder={true}
          quoteData={sampleQuoteData}
        />
      </MemoryRouter>
    );

    expect(screen.getByTestId("quote-builder")).toBeDefined();
    expect(screen.getByTestId("input-quote-title")).toBeDefined();
    expect(screen.getByTestId("quote-financial-summary")).toBeDefined();
    expect(screen.getByTestId("margin-advisory-badge")).toBeDefined();
  });
});
