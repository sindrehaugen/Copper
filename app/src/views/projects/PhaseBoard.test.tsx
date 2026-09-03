import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { PhaseBoard } from "./PhaseBoard";
import "../../locales/i18n";

describe("PhaseBoard", () => {
  it("renders correctly", () => {
    render(
      <MemoryRouter>
        <PhaseBoard />
      </MemoryRouter>
    );
    expect(screen.getAllByTestId("phase-board-surface")).toBeTruthy();
  });

  it("handles advancing phase", () => {
    render(
      <MemoryRouter>
        <PhaseBoard />
      </MemoryRouter>
    );
    
    const btns = screen.getAllByTestId("advance-phase-btn");
    fireEvent.click(btns[0]);
    
    expect(screen.getAllByTestId("phase-feedback")).toBeTruthy();
  });
});
