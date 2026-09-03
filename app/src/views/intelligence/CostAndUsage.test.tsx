import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { CostAndUsage } from "./CostAndUsage";
import "../../locales/i18n";

describe("CostAndUsage", () => {
  it("renders correctly", () => {
    render(
      <MemoryRouter>
        <CostAndUsage />
      </MemoryRouter>
    );
    expect(screen.getByTestId("cost-usage-surface")).toBeTruthy();
  });
});
