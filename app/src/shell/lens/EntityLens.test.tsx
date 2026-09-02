import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { t } from "i18next";
import { EntityLens } from "./EntityLens";
import "../../locales/i18n";

describe("EntityLens & Universal Route /e/:type/:id (Batch 139 / OB.W1)", () => {
  afterEach(() => {
    cleanup();
  });

  it("resolves route /e/:type/:id and mounts EntityLens with route parameters", () => {
    render(
      <MemoryRouter initialEntries={["/e/FUNCTIONAL_LOCATION/room-auditorium-01"]}>
        <Routes>
          <Route path="/e/:type/:id" element={<EntityLens />} />
        </Routes>
      </MemoryRouter>
    );

    const lensEl = screen.getByTestId("lens-entity");
    expect(lensEl).toBeDefined();
    expect(lensEl.getAttribute("data-entity-type")).toBe("FUNCTIONAL_LOCATION");
    expect(lensEl.getAttribute("data-entity-id")).toBe("room-auditorium-01");

    // Title should contain resolved type label and ID
    expect(screen.getByText(/Location room-auditorium-01/i)).toBeDefined();
  });

  it("mounts EntityLens for various entity types via route", () => {
    const testCases = [
      { type: "ASSET", id: "ast-9988", expectedLabel: "Asset ast-9988" },
      { type: "QUOTE", id: "q-2026-001", expectedLabel: "Quote q-2026-001" },
      { type: "TICKET", id: "t-404", expectedLabel: "Ticket t-404" },
      { type: "PO_LINE", id: "pol-10", expectedLabel: "PO Line pol-10" },
      { type: "GOODS_RECEIPT", id: "gr-55", expectedLabel: "Goods Receipt gr-55" },
    ];

    for (const tc of testCases) {
      render(
        <MemoryRouter initialEntries={[`/e/${tc.type}/${tc.id}`]}>
          <Routes>
            <Route path="/e/:type/:id" element={<EntityLens />} />
          </Routes>
        </MemoryRouter>
      );

      const lensEl = screen.getByTestId("lens-entity");
      expect(lensEl.getAttribute("data-entity-type")).toBe(tc.type);
      expect(lensEl.getAttribute("data-entity-id")).toBe(tc.id);
      expect(screen.getByText(new RegExp(tc.expectedLabel, "i"))).toBeDefined();

      cleanup();
    }
  });

  it("renders EntityLens when passed explicit props", () => {
    render(
      <EntityLens
        entityType="QUOTE"
        entityId="quote-alpha"
        title="Custom Quote Surface"
        subtitle="Active Commercial Quote"
      >
        <div data-testid="quote-facet">{t("test.facetContent", "Facet Content")}</div>
      </EntityLens>
    );

    const lensEl = screen.getByTestId("lens-entity");
    expect(lensEl.getAttribute("data-entity-type")).toBe("QUOTE");
    expect(lensEl.getAttribute("data-entity-id")).toBe("quote-alpha");
    expect(screen.getByText("Custom Quote Surface")).toBeDefined();
    expect(screen.getByText("Active Commercial Quote")).toBeDefined();
    expect(screen.getByTestId("quote-facet")).toBeDefined();
  });
});
