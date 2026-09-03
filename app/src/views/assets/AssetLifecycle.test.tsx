import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AssetLifecycle } from "./AssetLifecycle";
import "../../locales/i18n";

describe("AssetLifecycle", () => {
  it("renders correctly", () => {
    render(
      <MemoryRouter>
        <AssetLifecycle />
      </MemoryRouter>
    );
    expect(screen.getByTestId("asset-lifecycle-surface")).toBeTruthy();
  });
});
