import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AssetRegister } from "./AssetRegister";
import "../../locales/i18n";

describe("AssetRegister", () => {
  it("renders correctly", () => {
    render(
      <MemoryRouter>
        <AssetRegister />
      </MemoryRouter>
    );
    expect(screen.getByTestId("asset-register-surface")).toBeTruthy();
  });
});
