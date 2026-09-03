import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ContractorMatch } from "./ContractorMatch";
import "../../locales/i18n";

describe("ContractorMatch", () => {
  it("renders correctly", () => {
    render(
      <MemoryRouter>
        <ContractorMatch />
      </MemoryRouter>
    );
    expect(screen.getByTestId("contractor-match-surface")).toBeTruthy();
  });
});
