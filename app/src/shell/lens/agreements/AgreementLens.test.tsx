import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent, within } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import {
  AgreementLens,
  type AgreementItem,
} from "./AgreementLens";
import { EntityLens } from "../EntityLens";
import "../../../locales/i18n";

describe("Batch 170 (EN.W9) — AgreementLens & Agreement Book", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  const testAgreementItem: AgreementItem = {
    id: "agr-2026-gold",
    name: "Enterprise Mission Critical AV Support & SLA",
    customerId: "cust-nordic-corp",
    customerName: "Nordic Enterprise AS",
    type: "sla",
    status: "active",
    term: {
      startDate: "2026-01-01",
      endDate: "2027-01-01",
      renewalDate: "2026-11-01",
      renewalNoticeDays: 60,
      autoRenew: true,
      remainingDays: 120,
    },
    value: {
      annualValue: 72000,
      monthlyValue: 6000,
      currency: "EUR",
      billingCadence: "annual",
      paymentTerms: "Net 30",
    },
    sla: {
      tier: "Gold 24/7",
      responseTime: "15 min (Critical)",
      resolutionTime: "4h MTTR",
      uptimeCommitment: "99.9%",
      coverageHours: "24/7/365",
      preventativeMaintenanceVisits: 4,
      penaltyClause: "5% credit per 0.1% breach",
    },
    scope: {
      locations: [
        { id: "loc-oslo-hq", name: "Oslo HQ Campus", roomCount: 12 },
        { id: "loc-bergen-hub", name: "Bergen Innovation Hub", roomCount: 4 },
      ],
      deviceCount: 96,
      notes: "Covers all high-impact boardrooms, auditorium, and digital video wall",
    },
    signature: {
      signedAt: "2025-12-15T14:30:00Z",
      signedBy: "Kari Nordmann",
      signerRole: "VP IT Infrastructure",
      contractHash: "sha256-a9b8c7d6e5f41234",
    },
  };

  describe("Individual Agreement Details Surface", () => {
    it("renders individual agreement details correctly including term, value, and SLA tiers", () => {
      render(
        <MemoryRouter>
          <AgreementLens
            entityId="agr-2026-gold"
            agreements={[testAgreementItem]}
          />
        </MemoryRouter>
      );

      // Verify Entity lens container
      const lensEl = screen.getByTestId("lens-entity");
      expect(lensEl).toBeDefined();
      expect(lensEl.getAttribute("data-entity-type")).toBe("AGREEMENT");
      expect(lensEl.getAttribute("data-entity-id")).toBe("agr-2026-gold");

      // Verify agreement title, customer, and badges
      expect(screen.getByText("Enterprise Mission Critical AV Support & SLA")).toBeDefined();
      expect(screen.getAllByText(/Nordic Enterprise AS/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Gold 24\/7/i).length).toBeGreaterThan(0);

      // Verify Term Section
      const termSection = screen.getByTestId("agreement-term-section");
      expect(termSection).toBeDefined();
      expect(within(termSection).getByText(/2026-01-01/)).toBeDefined();
      expect(within(termSection).getByText(/2027-01-01/)).toBeDefined();
      expect(within(termSection).getByText(/Auto-Renew/i)).toBeDefined();
      expect(within(termSection).getByText(/120/)).toBeDefined();

      // Verify Value Section
      const valueSection = screen.getByTestId("agreement-value-section");
      expect(valueSection).toBeDefined();
      expect(within(valueSection).getByText(/72,000/)).toBeDefined();
      expect(within(valueSection).getByText(/6,000/)).toBeDefined();
      expect(within(valueSection).getAllByText(/EUR/i).length).toBeGreaterThan(0);
      expect(within(valueSection).getByText(/Net 30/i)).toBeDefined();

      // Verify SLA Section
      const slaSection = screen.getByTestId("agreement-sla-section");
      expect(slaSection).toBeDefined();
      expect(within(slaSection).getByText(/15 min \(Critical\)/i)).toBeDefined();
      expect(within(slaSection).getByText(/4h MTTR/i)).toBeDefined();
      expect(within(slaSection).getByText(/99\.9%/)).toBeDefined();
      expect(within(slaSection).getByText(/24\/7\/365/)).toBeDefined();

      // Verify Scope Section
      const scopeSection = screen.getByTestId("agreement-scope-section");
      expect(scopeSection).toBeDefined();
      expect(within(scopeSection).getByText(/Oslo HQ Campus/i)).toBeDefined();
      expect(within(scopeSection).getByText(/96/)).toBeDefined();
    });
  });

  describe("Renewal Calendar & Grid Aggregated View (Module Root)", () => {
    it("renders the renewal calendar and grid when viewing module root with no specific ID", () => {
      render(
        <MemoryRouter>
          <AgreementLens
            entityId=""
            agreements={[testAgreementItem]}
          />
        </MemoryRouter>
      );

      // Verify Grid lens container
      const lensEl = screen.getByTestId("lens-grid");
      expect(lensEl).toBeDefined();
      expect(lensEl.getAttribute("data-lens-kind")).toBe("grid");

      // Verify aggregated renewal calendar is rendered
      const renewalCalendar = screen.getByTestId("renewal-calendar");
      expect(renewalCalendar).toBeDefined();

      // Verify calendar shows renewal periods/quarters
      expect(screen.getByText(/Q4 2026/i)).toBeDefined();
      expect(within(renewalCalendar).getByText(/Enterprise Mission Critical AV Support & SLA/i)).toBeDefined();

      // Verify agreements grid table is rendered
      const gridView = screen.getByTestId("agreements-grid");
      expect(gridView).toBeDefined();
      expect(within(gridView).getByText("Enterprise Mission Critical AV Support & SLA")).toBeDefined();
      expect(within(gridView).getByText(/72,000/)).toBeDefined();
    });

    it("allows switching between Renewal Calendar and Grid View tabs", () => {
      render(
        <MemoryRouter>
          <AgreementLens
            entityId=""
            agreements={[testAgreementItem]}
          />
        </MemoryRouter>
      );

      const calendarTabBtn = screen.getByTestId("tab-renewal-calendar");
      const gridTabBtn = screen.getByTestId("tab-agreements-grid");

      expect(calendarTabBtn).toBeDefined();
      expect(gridTabBtn).toBeDefined();

      // Click Grid View
      fireEvent.click(gridTabBtn);
      expect(screen.getByTestId("agreements-grid")).toBeDefined();

      // Click Renewal Calendar
      fireEvent.click(calendarTabBtn);
      expect(screen.getByTestId("renewal-calendar")).toBeDefined();
    });

    it("triggers onNavigate when selecting an agreement from the grid or calendar", () => {
      const handleNavigate = vi.fn();

      render(
        <MemoryRouter>
          <AgreementLens
            entityId=""
            agreements={[testAgreementItem]}
            onNavigate={handleNavigate}
          />
        </MemoryRouter>
      );

      const openButton = screen.getByTestId("view-agreement-agr-2026-gold");
      fireEvent.click(openButton);

      expect(handleNavigate).toHaveBeenCalledWith("/e/AGREEMENT/agr-2026-gold", expect.anything());
    });
  });

  describe("EntityLens Integration (/e/AGREEMENT/:id and /e/AGREEMENT)", () => {
    it("routes /e/AGREEMENT/:id to AgreementLens details view", () => {
      render(
        <MemoryRouter initialEntries={["/e/AGREEMENT/agr-2026-gold"]}>
          <Routes>
            <Route
              path="/e/:type/:id"
              element={
                <EntityLens
                  agreementProps={{
                    agreements: [testAgreementItem],
                  }}
                />
              }
            />
          </Routes>
        </MemoryRouter>
      );

      const lensEl = screen.getByTestId("lens-entity");
      expect(lensEl).toBeDefined();
      expect(lensEl.getAttribute("data-entity-type")).toBe("AGREEMENT");
      expect(lensEl.getAttribute("data-entity-id")).toBe("agr-2026-gold");

      expect(screen.getByText("Enterprise Mission Critical AV Support & SLA")).toBeDefined();
      expect(screen.getByTestId("agreement-term-section")).toBeDefined();
      expect(screen.getByTestId("agreement-sla-section")).toBeDefined();
    });

    it("routes /e/AGREEMENT to AgreementLens root grid and renewal calendar view", () => {
      render(
        <MemoryRouter initialEntries={["/e/AGREEMENT"]}>
          <Routes>
            <Route
              path="/e/:type"
              element={
                <EntityLens
                  agreementProps={{
                    agreements: [testAgreementItem],
                  }}
                />
              }
            />
          </Routes>
        </MemoryRouter>
      );

      const lensEl = screen.getByTestId("lens-grid");
      expect(lensEl).toBeDefined();
      expect(lensEl.getAttribute("data-lens-kind")).toBe("grid");

      expect(screen.getByTestId("renewal-calendar")).toBeDefined();
      expect(screen.getByTestId("agreements-grid")).toBeDefined();
    });
  });
});
