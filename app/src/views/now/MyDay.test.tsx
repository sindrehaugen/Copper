import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { MyDay } from "./MyDay";
import "../../locales/i18n";

describe("MyDay", () => {
  it("renders correctly", () => {
    render(
      <MemoryRouter>
        <MyDay />
      </MemoryRouter>
    );
    expect(screen.getByTestId("my-day-surface")).toBeTruthy();
  });
});
