import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { SpaceHierarchy } from "./SpaceHierarchy";
import "../../locales/i18n";

describe("SpaceHierarchy", () => {
  it("renders correctly", () => {
    render(
      <MemoryRouter>
        <SpaceHierarchy />
      </MemoryRouter>
    );
    expect(screen.getByTestId("space-hierarchy-surface")).toBeTruthy();
  });
});
