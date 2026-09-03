import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { SpendAdvisors } from "./SpendAdvisors";
import "../../locales/i18n";

describe("SpendAdvisors", () => {
  it("renders correctly", () => {
    render(
      <MemoryRouter>
        <SpendAdvisors />
      </MemoryRouter>
    );
    expect(screen.getByTestId("spend-advisors-surface")).toBeTruthy();
  });
});
