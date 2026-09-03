import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { SourcingDesk } from "./SourcingDesk";
import "../../locales/i18n";

describe("SourcingDesk", () => {
  it("renders correctly", () => {
    render(
      <MemoryRouter>
        <SourcingDesk />
      </MemoryRouter>
    );
    expect(screen.getByTestId("sourcing-desk-dashboard")).toBeInTheDocument();
  });
});
