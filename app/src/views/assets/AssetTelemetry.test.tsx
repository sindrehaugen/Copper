import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AssetTelemetry } from "./AssetTelemetry";
import "../../locales/i18n";

describe("AssetTelemetry", () => {
  it("renders correctly", () => {
    render(
      <MemoryRouter>
        <AssetTelemetry />
      </MemoryRouter>
    );
    expect(screen.getByTestId("asset-telemetry-surface")).toBeTruthy();
  });
});
