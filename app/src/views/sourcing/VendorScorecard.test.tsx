import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { VendorScorecard } from "./VendorScorecard";
import "../../locales/i18n";

describe("VendorScorecard", () => {
  it("renders correctly without crashing", () => {
    render(
      <MemoryRouter>
        <VendorScorecard />
      </MemoryRouter>
    );
    expect(screen.getByTestId("vendor-scorecard-surface")).toBeTruthy();
  });
});
