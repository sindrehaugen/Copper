import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { FinanceWBS } from "./FinanceWBS";
import "../../locales/i18n";

describe("FinanceWBS", () => {
  it("renders correctly", () => {
    render(
      <MemoryRouter>
        <FinanceWBS />
      </MemoryRouter>
    );
    expect(screen.getByTestId("finance-wbs-surface")).toBeTruthy();
  });
});
