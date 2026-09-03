import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent, within } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import {
  SalesPerformanceLens,
  type SalesPerformanceData,
} from "./SalesPerformanceLens";
import { EntityLens } from "../EntityLens";
import "../../../locales/i18n";

describe("Batch 169 (EN.W8) — Sales Performance Lens", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  const customPerformanceData: SalesPerformanceData = {
    period: "Q3 2026",
    currency: "EUR",
    targets: {
      revenueTarget: 2000000,
      revenueActual: 1650000,
      revenueAttainmentPercent: 82.5,
      marginTargetPercent: 32.0,
      marginActualPercent: 34.2,
      dealsTarget: 40,
      dealsActual: 34,
      pipelineCoverageTarget: 3.0,
      pipelineCoverageActual: 3.2,
    },
    stats: {
      winRatePercent: 38.5,
      winRateTrend: { value: "+3.2%", direction: "up", label: "vs last Q" },
      avgDealSize: 48529,
      avgDealSizeTrend: { value: "+12%", direction: "up" },
      salesCycleDays: 36,
      salesCycleTrend: { value: "-4 days", direction: "up", label: "faster" },
      pipelineVelocityDaily: 22500,
      openPipelineValue: 5280000,
      activeDealsCount: 58,
    },
    sellers: [
      {
        id: "seller-1",
        name: "Kari Nordmann",
        role: "Senior Enterprise AE",
        territory: "Nordics Enterprise",
        quota: 600000,
        actual: 640000,
        attainmentPercent: 106.7,
        pipeline: 1850000,
        wonDealsCount: 12,
        activeDealsCount: 18,
        winRatePercent: 44.0,
        status: "success",
      },
      {
        id: "seller-2",
        name: "Ola Hansen",
        role: "Commercial AE",
        territory: "Norway Public Sector",
        quota: 500000,
        actual: 450000,
        attainmentPercent: 90.0,
        pipeline: 1200000,
        wonDealsCount: 10,
        activeDealsCount: 14,
        winRatePercent: 37.5,
        status: "normal",
      },
      {
        id: "seller-3",
        name: "Astrid Lind",
        role: "Strategic Accounts AE",
        territory: "Sweden & Denmark",
        quota: 550000,
        actual: 410000,
        attainmentPercent: 74.5,
        pipeline: 1450000,
        wonDealsCount: 8,
        activeDealsCount: 16,
        winRatePercent: 33.3,
        status: "warning",
      },
      {
        id: "seller-4",
        name: "Lars Holm",
        role: "Mid-Market AE",
        territory: "Finland & Baltics",
        quota: 350000,
        actual: 150000,
        attainmentPercent: 42.9,
        pipeline: 780000,
        wonDealsCount: 4,
        activeDealsCount: 10,
        winRatePercent: 25.0,
        status: "critical",
      },
    ],
    managerView: {
      teamName: "Nordic Commercial Sales Team",
      managerName: "Henrik Ibsen",
      totalTeamQuota: 2000000,
      totalTeamActual: 1650000,
      teamAttainmentPercent: 82.5,
      gapToQuota: 350000,
      projectedFinish: 1920000,
      teams: [
        {
          id: "team-nordics-ent",
          name: "Nordics Enterprise",
          quota: 600000,
          actual: 640000,
          attainmentPercent: 106.7,
          headcount: 1,
          openPipeline: 1850000,
        },
        {
          id: "team-norway-pub",
          name: "Norway Public Sector",
          quota: 500000,
          actual: 450000,
          attainmentPercent: 90.0,
          headcount: 1,
          openPipeline: 1200000,
        },
        {
          id: "team-swe-den",
          name: "Sweden & Denmark",
          quota: 550000,
          actual: 410000,
          attainmentPercent: 74.5,
          headcount: 1,
          openPipeline: 1450000,
        },
        {
          id: "team-fin-balt",
          name: "Finland & Baltics",
          quota: 350000,
          actual: 150000,
          attainmentPercent: 42.9,
          headcount: 1,
          openPipeline: 780000,
        },
      ],
    },
  };

  it("proves SalesPerformanceLens renders the cockpit shell and BaseLens conformance", () => {
    render(
      <SalesPerformanceLens
        data={customPerformanceData}
        title="Sales Performance Cockpit"
      />
    );

    const cockpitEl = screen.getByTestId("sales-performance-lens");
    expect(cockpitEl).toBeDefined();
    expect(cockpitEl.getAttribute("data-lens-kind")).toBe("cockpit");
    expect(screen.getByText("Sales Performance Cockpit")).toBeDefined();
    expect(screen.getByTestId("period-selector")).toBeDefined();
  });

  it("proves SalesPerformanceLens renders targets vs actuals section with figures and attainment metrics", () => {
    render(<SalesPerformanceLens data={customPerformanceData} />);

    const targetsSection = screen.getByTestId("cockpit-section-targets");
    expect(targetsSection).toBeDefined();

    const revFig = screen.getByTestId("figure-revenue-attainment");
    expect(revFig).toBeDefined();
    expect(within(revFig).getByText("82.5%")).toBeDefined();
    expect(within(revFig).getByText("1,650,000")).toBeDefined();
    expect(within(revFig).getByText("2,000,000 EUR")).toBeDefined();

    expect(screen.getByTestId("figure-margin")).toBeDefined();
    expect(screen.getByText("34.2%")).toBeDefined();

    expect(screen.getByTestId("figure-deals")).toBeDefined();
    expect(screen.getByText("34")).toBeDefined();

    expect(screen.getByTestId("figure-coverage")).toBeDefined();
    expect(screen.getByText("3.2x")).toBeDefined();
  });

  it("proves SalesPerformanceLens renders stats section with velocity, win rates, and trends", () => {
    render(<SalesPerformanceLens data={customPerformanceData} />);

    const statsSection = screen.getByTestId("cockpit-section-stats");
    expect(statsSection).toBeDefined();

    const winRateFig = screen.getByTestId("figure-win-rate");
    expect(winRateFig).toBeDefined();
    expect(within(winRateFig).getByText("38.5%")).toBeDefined();
    expect(within(winRateFig).getByText(/3\.2%/)).toBeDefined();

    const avgDealFig = screen.getByTestId("figure-avg-deal");
    expect(avgDealFig).toBeDefined();
    expect(within(avgDealFig).getByText("48,529")).toBeDefined();

    const cycleFig = screen.getByTestId("figure-sales-cycle");
    expect(cycleFig).toBeDefined();
    expect(within(cycleFig).getByText("36")).toBeDefined();

    const pipelineFig = screen.getByTestId("figure-open-pipeline");
    expect(pipelineFig).toBeDefined();
    expect(within(pipelineFig).getByText("5,280,000")).toBeDefined();
  });

  it("proves SalesPerformanceLens renders seller detail section with individual quota attainment", () => {
    render(<SalesPerformanceLens data={customPerformanceData} />);

    const sellerSection = screen.getByTestId("cockpit-section-sellers");
    expect(sellerSection).toBeDefined();

    const card1 = screen.getByTestId("seller-card-seller-1");
    expect(card1).toBeDefined();
    expect(within(card1).getByText("Kari Nordmann")).toBeDefined();
    expect(within(card1).getByText("106.7%")).toBeDefined();

    const card2 = screen.getByTestId("seller-card-seller-2");
    expect(card2).toBeDefined();
    expect(within(card2).getByText("Ola Hansen")).toBeDefined();
    expect(within(card2).getByText("90.0%")).toBeDefined();

    const card3 = screen.getByTestId("seller-card-seller-3");
    expect(card3).toBeDefined();
    expect(within(card3).getByText("Astrid Lind")).toBeDefined();
    expect(within(card3).getByText("74.5%")).toBeDefined();

    const card4 = screen.getByTestId("seller-card-seller-4");
    expect(card4).toBeDefined();
    expect(within(card4).getByText("Lars Holm")).toBeDefined();
    expect(within(card4).getByText("42.9%")).toBeDefined();
  });

  it("proves SalesPerformanceLens renders manager view aggregating team performance and leaderboard", () => {
    render(<SalesPerformanceLens data={customPerformanceData} />);

    const managerSection = screen.getByTestId("cockpit-section-manager");
    expect(managerSection).toBeDefined();

    expect(screen.getByText("Henrik Ibsen")).toBeDefined();
    expect(screen.getByText("Nordic Commercial Sales Team")).toBeDefined();

    expect(screen.getByTestId("figure-gap-quota")).toBeDefined();
    expect(screen.getByText("350,000")).toBeDefined();

    expect(screen.getByTestId("figure-projected-finish")).toBeDefined();
    expect(screen.getByText("1,920,000")).toBeDefined();

    const teamTable = screen.getByTestId("manager-team-table");
    expect(teamTable).toBeDefined();
    expect(within(teamTable).getByText("Nordics Enterprise")).toBeDefined();
    expect(within(teamTable).getByText("Norway Public Sector")).toBeDefined();
    expect(within(teamTable).getByText("Sweden & Denmark")).toBeDefined();
    expect(within(teamTable).getByText("Finland & Baltics")).toBeDefined();
  });

  it("proves all cockpit figures and seller cards expose drill-through affordances to GridLenses", () => {
    const handleDrillThrough = vi.fn();
    const handleNavigate = vi.fn();

    render(
      <SalesPerformanceLens
        data={customPerformanceData}
        onDrillThrough={handleDrillThrough}
        onNavigate={handleNavigate}
      />
    );

    const revenueFig = screen.getByTestId("figure-revenue-attainment");
    expect(revenueFig.getAttribute("data-target-grid")).toBe("DealsGridLens");
    fireEvent.click(revenueFig);
    expect(handleDrillThrough).toHaveBeenCalledWith(
      expect.objectContaining({
        targetGridLens: "DealsGridLens",
        metric: "revenue",
      })
    );

    const pipelineFig = screen.getByTestId("figure-open-pipeline");
    expect(pipelineFig.getAttribute("data-target-grid")).toBe("PipelineGridLens");
    fireEvent.click(pipelineFig);
    expect(handleDrillThrough).toHaveBeenCalledWith(
      expect.objectContaining({
        targetGridLens: "PipelineGridLens",
        metric: "openPipeline",
      })
    );

    const seller1Drill = screen.getByTestId("drill-seller-seller-1");
    expect(seller1Drill.getAttribute("data-target-grid")).toBe("DealsGridLens");
    fireEvent.click(seller1Drill);
    expect(handleDrillThrough).toHaveBeenCalledWith(
      expect.objectContaining({
        targetGridLens: "DealsGridLens",
        sellerId: "seller-1",
      })
    );
  });

  it("proves EntityLens mounts SalesPerformanceLens for SALES_PERFORMANCE entities and performance view mode", () => {
    const { unmount } = render(
      <MemoryRouter initialEntries={["/e/SALES_PERFORMANCE/overview"]}>
        <Routes>
          <Route
            path="/e/:type/:id"
            element={<EntityLens entityType="SALES_PERFORMANCE" entityId="overview" />}
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId("sales-performance-lens")).toBeDefined();
    expect(screen.getByTestId("cockpit-section-targets")).toBeDefined();
    expect(screen.getByTestId("cockpit-section-manager")).toBeDefined();

    unmount();

    render(
      <MemoryRouter initialEntries={["/e/SALES/overview?view=performance"]}>
        <Routes>
          <Route
            path="/e/:type/:id"
            element={<EntityLens entityType="SALES" entityId="overview" viewMode="performance" />}
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId("sales-performance-lens")).toBeDefined();
  });
});
