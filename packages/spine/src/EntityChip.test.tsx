import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { EntityChip } from "./EntityChip";

describe("EntityChip Component (@copper/spine / packages/spine)", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders typed entity chip for FUNCTIONAL_LOCATION with icon and code", () => {
    render(
      <EntityChip
        type="FUNCTIONAL_LOCATION"
        id="FL-101"
        code="FL-101"
        label="Auditorium"
      />
    );

    expect(screen.getByText("Auditorium")).toBeDefined();
    expect(screen.getByText("FL-101")).toBeDefined();
    const chip = screen.getByTestId("entity-chip-functional_location");
    expect(chip.getAttribute("data-entity-type")).toBe("FUNCTIONAL_LOCATION");
  });

  it("renders ASSET chip with score and status", () => {
    render(
      <EntityChip
        type="ASSET"
        id="AST-502"
        code="AST-502"
        label="Cisco Codec Pro"
        score={0.95}
        status="active"
      />
    );

    expect(screen.getByText("Cisco Codec Pro")).toBeDefined();
    expect(screen.getByText("AST-502")).toBeDefined();
    expect(screen.getByText("95%")).toBeDefined();
    expect(screen.getByText("• active")).toBeDefined();
  });

  it("renders compact and outline variants", () => {
    const { rerender } = render(
      <EntityChip type="QUOTE" code="Q-2026-001" variant="compact" />
    );
    expect(screen.getByTestId("entity-chip-quote")).toBeDefined();

    rerender(<EntityChip type="QUOTE" code="Q-2026-001" variant="outline" />);
    expect(screen.getByTestId("entity-chip-quote")).toBeDefined();
  });
});
