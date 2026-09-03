import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { MorningBrief } from "./MorningBrief";
import "../../locales/i18n";

describe("MorningBrief", () => {
  it("renders correctly", () => {
    render(
      <MemoryRouter>
        <MorningBrief />
      </MemoryRouter>
    );
    expect(screen.getByTestId("morning-brief-surface")).toBeTruthy();
  });
});
