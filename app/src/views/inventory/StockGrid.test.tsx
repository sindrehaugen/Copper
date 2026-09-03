import { describe, it, expect, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { StockGrid } from "./StockGrid";
import "../../locales/i18n";

describe("StockGrid", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders without crashing and displays table headers including Actions", () => {
    render(
      <MemoryRouter>
        <StockGrid />
      </MemoryRouter>
    );
    expect(screen.getByTestId("stock-grid-surface")).toBeTruthy();
    expect(screen.getByRole("columnheader", { name: /actions/i })).toBeTruthy();
    expect(screen.getByRole("columnheader", { name: /sku/i })).toBeTruthy();
    expect(screen.getByRole("columnheader", { name: /product name/i })).toBeTruthy();
    expect(screen.getByRole("columnheader", { name: /on hand/i })).toBeTruthy();
    expect(screen.getByRole("columnheader", { name: /reserved/i })).toBeTruthy();
    expect(screen.getByRole("columnheader", { name: /available/i })).toBeTruthy();
  });

  it("renders Reserve, Release, Consume, and Transfer buttons for each row", () => {
    render(
      <MemoryRouter>
        <StockGrid />
      </MemoryRouter>
    );

    const reserveButtons = screen.getAllByRole("button", { name: /reserve/i });
    const releaseButtons = screen.getAllByRole("button", { name: /release/i });
    const consumeButtons = screen.getAllByRole("button", { name: /consume/i });
    const transferButtons = screen.getAllByRole("button", { name: /transfer/i });

    // In default loc-1, there are 2 items: st-1 and st-2
    expect(reserveButtons).toHaveLength(2);
    expect(releaseButtons).toHaveLength(2);
    expect(consumeButtons).toHaveLength(2);
    expect(transferButtons).toHaveLength(2);
  });

  it("handles Reserve action (increases reserved, decreases available)", () => {
    render(
      <MemoryRouter>
        <StockGrid />
      </MemoryRouter>
    );

    const rows = screen.getAllByRole("row");
    // Row 0 is header, Row 1 is Cat6 Cable (onHand: 45, reserved: 5, available: 40)
    const firstRow = rows[1];
    expect(within(firstRow).getByText("40")).toBeTruthy();
    expect(within(firstRow).getByText("5")).toBeTruthy();

    const reserveBtn = within(firstRow).getByRole("button", { name: /reserve/i });
    expect(reserveBtn.disabled).toBe(false);

    fireEvent.click(reserveBtn);

    // After reserving 1: available becomes 39, reserved becomes 6
    expect(within(firstRow).getByText("39")).toBeTruthy();
    expect(within(firstRow).getByText("6")).toBeTruthy();
  });

  it("disables Reserve button when available is 0", () => {
    render(
      <MemoryRouter>
        <StockGrid />
      </MemoryRouter>
    );

    const rows = screen.getAllByRole("row");
    // Row 2 is Enterprise Router 9000 (available: 0)
    const routerRow = rows[2];
    const reserveBtn = within(routerRow).getByRole("button", { name: /reserve/i });
    expect(reserveBtn.disabled).toBe(true);
  });

  it("handles Release action (decreases reserved, increases available)", () => {
    render(
      <MemoryRouter>
        <StockGrid />
      </MemoryRouter>
    );

    const rows = screen.getAllByRole("row");
    // Row 1 is Cat6 Cable (reserved: 5, available: 40)
    const firstRow = rows[1];
    const releaseBtn = within(firstRow).getByRole("button", { name: /release/i });
    expect(releaseBtn.disabled).toBe(false);

    fireEvent.click(releaseBtn);

    // After releasing 1: reserved becomes 4, available becomes 41
    expect(within(firstRow).getByText("4")).toBeTruthy();
    expect(within(firstRow).getByText("41")).toBeTruthy();
  });

  it("disables Release button when reserved is 0", () => {
    render(
      <MemoryRouter>
        <StockGrid locationId="loc-2" />
      </MemoryRouter>
    );

    const rows = screen.getAllByRole("row");
    // In loc-2: Cat6 Cable has reserved: 0
    const itemRow = rows[1];
    const releaseBtn = within(itemRow).getByRole("button", { name: /release/i });
    expect(releaseBtn.disabled).toBe(true);
  });

  it("handles Consume action (decreases onHand and available)", () => {
    render(
      <MemoryRouter>
        <StockGrid />
      </MemoryRouter>
    );

    const rows = screen.getAllByRole("row");
    // Row 1 is Cat6 Cable (onHand: 45, available: 40)
    const firstRow = rows[1];
    const consumeBtn = within(firstRow).getByRole("button", { name: /consume/i });
    expect(consumeBtn.disabled).toBe(false);

    fireEvent.click(consumeBtn);

    // After consuming 1: onHand becomes 44, available becomes 39
    expect(within(firstRow).getByText("44")).toBeTruthy();
    expect(within(firstRow).getByText("39")).toBeTruthy();
  });

  it("disables Consume button when available is 0", () => {
    render(
      <MemoryRouter>
        <StockGrid />
      </MemoryRouter>
    );

    const rows = screen.getAllByRole("row");
    // Row 2 is Enterprise Router 9000 (available: 0)
    const routerRow = rows[2];
    const consumeBtn = within(routerRow).getByRole("button", { name: /consume/i });
    expect(consumeBtn.disabled).toBe(true);
  });

  it("handles Transfer action and displays dismissable flash feedback", () => {
    render(
      <MemoryRouter>
        <StockGrid />
      </MemoryRouter>
    );

    expect(screen.queryByTestId("stock-flash-message")).toBeNull();

    const transferButtons = screen.getAllByRole("button", { name: /transfer/i });
    fireEvent.click(transferButtons[0]);

    const flashMsg = screen.getByTestId("stock-flash-message");
    expect(flashMsg).toBeTruthy();
    expect(flashMsg.textContent).toContain("transfer");

    const dismissBtn = screen.getByRole("button", { name: /dismiss/i });
    fireEvent.click(dismissBtn);

    expect(screen.queryByTestId("stock-flash-message")).toBeNull();
  });
});

