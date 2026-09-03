import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import {
  CustomerSurface,
  type CustomerSurfaceData,
} from "./CustomerSurface";
import { EntityLens } from "../../shell/lens/EntityLens";
import "../../locales/i18n";

describe("Batch 166 (EN.W5) — Customer Surface & EntityLens Integration", () => {
  afterEach(() => {
    cleanup();
  });

  const mockCustomerData: CustomerSurfaceData = {
    customerId: "cust-nordic-corp",
    customerName: "Nordic Enterprise AS",
    tier: "enterprise",
    status: "active",
    primaryContact: {
      name: "Astrid Lindgren",
      email: "astrid@nordiccorp.no",
      phone: "+47 21 00 00 00",
      role: "VP Infrastructure",
    },
    accountManager: "Sindre Haugen",
    industry: "Financial & Media",
    currency: "EUR",
    quotes: [
      {
        id: "quo-2026-001",
        title: "HQ Audio Visual Modernization",
        value: 145000,
        currency: "EUR",
        status: "approved",
        validUntil: "2026-12-31",
        marginPercent: 34.5,
        createdAt: "2026-08-15",
      },
      {
        id: "quo-2026-002",
        title: "Video Wall Video Conference Suite",
        value: 78000,
        currency: "EUR",
        status: "in_review",
        validUntil: "2026-11-15",
        marginPercent: 28.0,
        createdAt: "2026-09-01",
      },
    ],
    agreements: [
      {
        id: "agr-sla-gold",
        name: "Mission Critical Gold SLA",
        type: "sla",
        status: "active",
        startDate: "2026-01-01",
        endDate: "2027-01-01",
        annualValue: 36000,
        tier: "Gold 24/7",
      },
      {
        id: "agr-maint-01",
        name: "Hardware Preventive Maintenance",
        type: "maintenance",
        status: "active",
        startDate: "2026-03-01",
        endDate: "2027-03-01",
        annualValue: 18500,
      },
    ],
    rooms: [
      {
        id: "loc-room-auditorium",
        name: "Auditorium Main Stage",
        siteName: "Oslo HQ Campus",
        buildingName: "Building A",
        floorName: "Level 1",
        deviceCount: 24,
        status: "operational",
      },
      {
        id: "loc-room-boardroom",
        name: "Executive Boardroom",
        siteName: "Oslo HQ Campus",
        buildingName: "Building A",
        floorName: "Level 8",
        deviceCount: 14,
        status: "operational",
      },
    ],
    assets: [
      {
        id: "ast-qsys-core",
        name: "Q-SYS Core 510i",
        model: "Core 510i",
        manufacturer: "QSC",
        roomId: "loc-room-auditorium",
        roomName: "Auditorium Main Stage",
        status: "active",
        serialNumber: "QSC-510-9988",
      },
      {
        id: "ast-samsung-wall",
        name: "Samsung The Wall 146-inch",
        model: "IW0084A",
        manufacturer: "Samsung",
        roomId: "loc-room-auditorium",
        roomName: "Auditorium Main Stage",
        status: "active",
        serialNumber: "SAM-WALL-4411",
      },
    ],
    tickets: [
      {
        id: "tkt-901",
        title: "Wireless mic battery drop on Stage Left",
        priority: "high",
        status: "in_progress",
        assignedTo: "Kari Nordmann",
        roomName: "Auditorium Main Stage",
        createdAt: "2026-09-02T10:30:00Z",
      },
      {
        id: "tkt-882",
        title: "Quarterly firmware audit and patch",
        priority: "low",
        status: "open",
        assignedTo: "Lars Hansen",
        createdAt: "2026-09-01T08:00:00Z",
      },
    ],
    spend: {
      currency: "EUR",
      totalSpend: 259000,
      ytdSpend: 84000,
      lifetimeValue: 450000,
      committedSpend: 54500,
      breakdown: [
        {
          id: "sp-hw",
          category: "Hardware & Racks",
          description: "Core DSP, Microphones, Displays",
          amount: 185000,
          percentage: 71,
        },
        {
          id: "sp-serv",
          category: "Managed Services & SLAs",
          description: "Gold 24/7 SLA & Field Dispatch",
          amount: 54500,
          percentage: 21,
        },
        {
          id: "sp-lic",
          category: "Software Licenses",
          description: "AV Management & Monitoring",
          amount: 19500,
          percentage: 8,
        },
      ],
    },
    health: {
      overallScore: 92,
      status: "healthy",
      trend: "improving",
      nps: 68,
      slaCompliancePercent: 99.8,
      ticketsOpenCount: 2,
      lastReviewDate: "2026-08-20",
      riskFactors: [],
      internalNotes: "Strong account relationship. Customer evaluating Phase 3 expansion for Trondheim branch.",
    },
  };

  it("proves CustomerSurface renders all expected facets (Quotes, Agreements, Rooms, Assets, Tickets, Spend, Health) when internal", () => {
    render(
      <MemoryRouter>
        <CustomerSurface data={mockCustomerData} isInternal={true} />
      </MemoryRouter>
    );

    // Root container & Header
    expect(screen.getByTestId("customer-surface")).toBeDefined();
    expect(screen.getByTestId("customer-surface-header")).toBeDefined();
    expect(screen.getByText("Nordic Enterprise AS")).toBeDefined();
    expect(screen.getByText(/cust-nordic-corp/i)).toBeDefined();
    expect(screen.getByText(/Astrid Lindgren/i)).toBeDefined();

    // All 7 Facets must be present
    // 1. Quotes
    expect(screen.getByTestId("facet-customer-quotes")).toBeDefined();
    expect(screen.getByText("HQ Audio Visual Modernization")).toBeDefined();
    expect(screen.getByText("Video Wall Video Conference Suite")).toBeDefined();

    // 2. Agreements
    expect(screen.getByTestId("facet-customer-agreements")).toBeDefined();
    expect(screen.getByText("Mission Critical Gold SLA")).toBeDefined();
    expect(screen.getByText("Hardware Preventive Maintenance")).toBeDefined();

    // 3. Rooms
    expect(screen.getByTestId("facet-customer-rooms")).toBeDefined();
    expect(screen.getByText("Auditorium Main Stage")).toBeDefined();
    expect(screen.getByText("Executive Boardroom")).toBeDefined();

    // 4. Assets
    expect(screen.getByTestId("facet-customer-assets")).toBeDefined();
    expect(screen.getByText("Q-SYS Core 510i")).toBeDefined();
    expect(screen.getByText("Samsung The Wall 146-inch")).toBeDefined();

    // 5. Tickets
    expect(screen.getByTestId("facet-customer-tickets")).toBeDefined();
    expect(screen.getByText("Wireless mic battery drop on Stage Left")).toBeDefined();
    expect(screen.getByText("Quarterly firmware audit and patch")).toBeDefined();

    // 6. Spend
    expect(screen.getByTestId("facet-customer-spend")).toBeDefined();
    expect(screen.getByTestId("customer-spend-total")).toBeDefined();
    expect(screen.getByText("Hardware & Racks")).toBeDefined();

    // 7. Health (Internal-Only)
    expect(screen.getByTestId("facet-customer-health")).toBeDefined();
    expect(screen.getByTestId("customer-health-score").textContent).toContain("92");
    expect(screen.getByText("Strong account relationship. Customer evaluating Phase 3 expansion for Trondheim branch.")).toBeDefined();
  });

  it("proves the 'Health' facet is strictly gated by an internal-only flag (isInternal=false)", () => {
    render(
      <MemoryRouter>
        <CustomerSurface data={mockCustomerData} isInternal={false} />
      </MemoryRouter>
    );

    expect(screen.getByTestId("customer-surface")).toBeDefined();

    // Health facet and tab must be completely absent from the DOM
    expect(screen.queryByTestId("facet-customer-health")).toBeNull();
    expect(screen.queryByTestId("tab-customer-health")).toBeNull();
    expect(screen.queryByText("Strong account relationship. Customer evaluating Phase 3 expansion for Trondheim branch.")).toBeNull();

    // The other 6 facets must still be rendered
    expect(screen.getByTestId("facet-customer-quotes")).toBeDefined();
    expect(screen.getByTestId("facet-customer-agreements")).toBeDefined();
    expect(screen.getByTestId("facet-customer-rooms")).toBeDefined();
    expect(screen.getByTestId("facet-customer-assets")).toBeDefined();
    expect(screen.getByTestId("facet-customer-tickets")).toBeDefined();
    expect(screen.getByTestId("facet-customer-spend")).toBeDefined();
  });

  it("supports tab filtering between unified 'All' view and specific facets", () => {
    render(
      <MemoryRouter>
        <CustomerSurface data={mockCustomerData} isInternal={true} />
      </MemoryRouter>
    );

    // Click 'Quotes' tab
    const quotesTab = screen.getByTestId("tab-customer-quotes");
    fireEvent.click(quotesTab);

    // In filtered tab view, Quotes facet is rendered
    expect(screen.getByTestId("facet-customer-quotes")).toBeDefined();
    // Agreements facet is hidden in quotes tab view
    expect(screen.queryByTestId("facet-customer-agreements")).toBeNull();

    // Click 'All' tab
    const allTab = screen.getByTestId("tab-customer-all");
    fireEvent.click(allTab);

    // All facets restored
    expect(screen.getByTestId("facet-customer-quotes")).toBeDefined();
    expect(screen.getByTestId("facet-customer-agreements")).toBeDefined();
    expect(screen.getByTestId("facet-customer-rooms")).toBeDefined();
  });

  it("renders honest degraded states when facet data is empty", () => {
    const emptyData: CustomerSurfaceData = {
      customerId: "cust-empty-001",
      customerName: "Brand New Customer LLC",
      quotes: [],
      agreements: [],
      rooms: [],
      assets: [],
      tickets: [],
      spend: null,
      health: null,
    };

    render(
      <MemoryRouter>
        <CustomerSurface data={emptyData} isInternal={true} />
      </MemoryRouter>
    );

    expect(screen.getByTestId("customer-surface")).toBeDefined();
    expect(screen.getByTestId("facet-customer-quotes-degraded")).toBeDefined();
    expect(screen.getByTestId("facet-customer-agreements-degraded")).toBeDefined();
    expect(screen.getByTestId("facet-customer-rooms-degraded")).toBeDefined();
    expect(screen.getByTestId("facet-customer-assets-degraded")).toBeDefined();
    expect(screen.getByTestId("facet-customer-tickets-degraded")).toBeDefined();
    expect(screen.getByTestId("facet-customer-spend-degraded")).toBeDefined();
    expect(screen.getByTestId("facet-customer-health-degraded")).toBeDefined();
  });

  it("integrates into EntityLens so that /e/CUSTOMER/:id routes to CustomerSurface", () => {
    render(
      <MemoryRouter initialEntries={["/e/CUSTOMER/cust-nordic-corp"]}>
        <Routes>
          <Route path="/e/:type/:id" element={<EntityLens customerData={mockCustomerData} />} />
        </Routes>
      </MemoryRouter>
    );

    const lensEl = screen.getByTestId("lens-entity");
    expect(lensEl).toBeDefined();
    expect(lensEl.getAttribute("data-entity-type")).toBe("CUSTOMER");
    expect(lensEl.getAttribute("data-entity-id")).toBe("cust-nordic-corp");

    // CustomerSurface must be mounted
    expect(screen.getByTestId("customer-surface")).toBeDefined();
    expect(screen.getByText("Nordic Enterprise AS")).toBeDefined();
    expect(screen.getByTestId("facet-customer-quotes")).toBeDefined();
  });
});
