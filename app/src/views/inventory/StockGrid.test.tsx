import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { StockGrid } from "./StockGrid";
import "../../locales/i18n";

describe("StockGrid", () => {
  it("renders without crashing", () => {
    render(
      <MemoryRouter>
        <StockGrid />
      </MemoryRouter>
    );
    expect(screen.getByTestId("stock-grid-surface")).toBeTruthy();
  });
});
