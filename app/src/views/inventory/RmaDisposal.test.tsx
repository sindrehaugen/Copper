import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
afterEach(() => cleanup());
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { RmaDisposal } from "./RmaDisposal";
import "../../locales/i18n";

describe("RmaDisposal", () => {
  it("renders correctly", () => {
    render(
      <MemoryRouter>
        <RmaDisposal />
      </MemoryRouter>
    );
    expect(screen.getByTestId("rma-disposal-surface")).toBeTruthy();
  });

  it("handles restock action", () => {
    render(
      <MemoryRouter>
        <RmaDisposal />
      </MemoryRouter>
    );

    const rmaInput = screen.getByPlaceholderText("e.g. RMA-9092");
    const skuInput = screen.getByPlaceholderText("e.g. RTR-002-SN1234");
    const conditionSelect = screen.getByRole("combobox");

    fireEvent.change(rmaInput, { target: { value: "RMA-111" } });
    fireEvent.change(skuInput, { target: { value: "SKU-222" } });
    fireEvent.change(conditionSelect, { target: { value: "new_open_box" } });

    const restockBtn = screen.getByRole("button", { name: /Restock to Inventory/i });
    expect((restockBtn as HTMLButtonElement).disabled).toBe(false);
    
    fireEvent.click(restockBtn);

    const feedback = screen.getByTestId("rma-feedback");
    expect(feedback.textContent).toContain("restock");
    
  });

  it("handles weee disposal action", () => {
    render(
      <MemoryRouter>
        <RmaDisposal />
      </MemoryRouter>
    );

    const rmaInput = screen.getByPlaceholderText("e.g. RMA-9092");
    const skuInput = screen.getByPlaceholderText("e.g. RTR-002-SN1234");
    const conditionSelect = screen.getByRole("combobox");

    fireEvent.change(rmaInput, { target: { value: "RMA-333" } });
    fireEvent.change(skuInput, { target: { value: "SKU-444" } });
    fireEvent.change(conditionSelect, { target: { value: "doa" } });

    const disposeBtn = screen.getByRole("button", { name: /WEEE Disposal/i });
    expect((disposeBtn as HTMLButtonElement).disabled).toBe(false);
    
    fireEvent.click(disposeBtn);

    const feedback = screen.getByTestId("rma-feedback");
    expect(feedback.textContent).toContain("WEEE disposal");
    
  });
});
