import React, { useState, useMemo } from "react";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import { BaseLens } from "../BaseLens";
import { CockpitFigure, CockpitSection, DrillThroughControl } from "../CockpitLens";
import type { BaseLensProps, CockpitTrend, CockpitFigureStatus } from "../types";

export interface SalesAttainmentTargets {
  revenueTarget: number;
  revenueActual: number;
  revenueAttainmentPercent?: number | undefined;
  marginTargetPercent: number;
  marginActualPercent: number;
  dealsTarget: number;
  dealsActual: number;
  pipelineCoverageTarget: number;
  pipelineCoverageActual: number;
}

export interface SalesPerformanceStats {
  winRatePercent: number;
  winRateTrend?: CockpitTrend | undefined;
  avgDealSize: number;
  avgDealSizeTrend?: CockpitTrend | undefined;
  salesCycleDays: number;
  salesCycleTrend?: CockpitTrend | undefined;
  pipelineVelocityDaily?: number | undefined;
  openPipelineValue: number;
  activeDealsCount: number;
}

export interface SellerPerformanceDetail {
  id: string;
  name: string;
  role: string;
  territory: string;
  quota: number;
  actual: number;
  attainmentPercent: number;
  pipeline: number;
  wonDealsCount: number;
  activeDealsCount: number;
  winRatePercent: number;
  status: CockpitFigureStatus;
  avatarUrl?: string | undefined;
}

export interface TeamRollupDetail {
  id: string;
  name: string;
  quota: number;
  actual: number;
  attainmentPercent: number;
  headcount: number;
  openPipeline: number;
}

export interface ManagerTeamAggregation {
  teamName: string;
  managerName: string;
  totalTeamQuota: number;
  totalTeamActual: number;
  teamAttainmentPercent: number;
  gapToQuota: number;
  projectedFinish: number;
  teams: TeamRollupDetail[];
}

export interface SalesPerformanceData {
  period?: string | undefined;
  currency?: string | undefined;
  targets: SalesAttainmentTargets;
  stats: SalesPerformanceStats;
  sellers: SellerPerformanceDetail[];
  managerView: ManagerTeamAggregation;
}

export interface SalesDrillThroughDetail {
  targetGridLens: string;
  metric?: string | undefined;
  sellerId?: string | undefined;
  teamId?: string | undefined;
  period?: string | undefined;
  filter?: Record<string, string | number> | undefined;
}

export interface SalesPerformanceLensProps extends Partial<BaseLensProps> {
  data?: SalesPerformanceData | null | undefined;
  onDrillThrough?: ((detail: SalesDrillThroughDetail) => void | Promise<void>) | undefined;
  onNavigate?: ((path: string, entity?: any) => void) | undefined;
  currency?: string | undefined;
  period?: string | undefined;
  onPeriodChange?: ((period: string) => void) | undefined;
  viewMode?: ("all" | "manager" | "sellers" | string) | undefined;
}

export const DEFAULT_SALES_PERFORMANCE_DATA: SalesPerformanceData = {
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

function formatNumber(val: number, minimumFractionDigits = 0, maximumFractionDigits = 0): string {
  return val.toLocaleString("en-US", {
    minimumFractionDigits,
    maximumFractionDigits,
  });
}

function getAttainmentStatus(percent: number): CockpitFigureStatus {
  if (percent >= 100) return "success";
  if (percent >= 80) return "normal";
  if (percent >= 60) return "warning";
  return "critical";
}

export const SalesPerformanceLens: FC<SalesPerformanceLensProps> = ({
  data: explicitData,
  onDrillThrough,
  onNavigate,
  currency: currencyProp,
  period: periodProp,
  onPeriodChange,
  viewMode: viewModeProp = "all",
  title: titleProp,
  subtitle: subtitleProp,
  badge: badgeProp,
  className = "",
  ...baseLensProps
}) => {
  const { t } = useTranslation();
  const resolvedInitialView: "all" | "manager" | "sellers" =
    viewModeProp === "manager" ? "manager" : viewModeProp === "sellers" ? "sellers" : "all";
  const [activeViewMode, setActiveViewMode] = useState<"all" | "manager" | "sellers">(resolvedInitialView);
  const [selectedPeriod, setSelectedPeriod] = useState<string>(
    periodProp || explicitData?.period || DEFAULT_SALES_PERFORMANCE_DATA.period || "Q3 2026"
  );

  const data: SalesPerformanceData = useMemo(() => {
    return explicitData ?? DEFAULT_SALES_PERFORMANCE_DATA;
  }, [explicitData]);

  const currency = currencyProp || data.currency || "EUR";
  const { targets, stats, sellers, managerView } = data;

  const handlePeriodSelect = (period: string) => {
    setSelectedPeriod(period);
    onPeriodChange?.(period);
  };

  const handleDrill = (detail: SalesDrillThroughDetail) => {
    if (onDrillThrough) {
      onDrillThrough(detail);
    } else if (onNavigate) {
      const queryParams = new URLSearchParams();
      queryParams.set("view", "grid");
      queryParams.set("targetLens", detail.targetGridLens);
      if (detail.sellerId) queryParams.set("seller", detail.sellerId);
      if (detail.teamId) queryParams.set("team", detail.teamId);
      if (detail.metric) queryParams.set("metric", detail.metric);
      onNavigate(`/grid/sales?${queryParams.toString()}`);
    }
  };

  const revenueAttainment = targets.revenueAttainmentPercent ?? (
    targets.revenueTarget > 0 ? (targets.revenueActual / targets.revenueTarget) * 100 : 0
  );

  const revenueStatus = getAttainmentStatus(revenueAttainment);

  const title = titleProp ?? t("sales.performanceCockpitTitle", "Sales Performance Cockpit");
  const subtitle = subtitleProp ?? t("sales.performanceCockpitSubtitle", "Revenue Targets, Seller Detail & Manager Aggregation");

  const badge = badgeProp ?? (
    <span
      className={`copper-badge ${
        revenueStatus === "success"
          ? "copper-badge-success"
          : revenueStatus === "critical"
          ? "copper-badge-danger"
          : "copper-badge-info"
      }`}
      data-testid="performance-attainment-badge"
    >
      {`${formatNumber(revenueAttainment, 1, 1)}% ${t("sales.attainmentBadge", "Attainment")}`}
    </span>
  );

  const periodOptions = ["Q1 2026", "Q2 2026", "Q3 2026", "Q4 2026", "FY2026"];

  return (
    <BaseLens
      {...baseLensProps}
      title={title}
      subtitle={subtitle}
      badge={badge}
      lensKind="cockpit"
      dataTestId="sales-performance-lens"
      className={`copper-sales-performance-lens ${className}`.trim()}
      headerSlot={
        <div
          className="copper-sales-performance-header-controls"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          {/* Period selector */}
          <div
            className="copper-period-selector-wrapper"
            data-testid="period-selector"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <label
              htmlFor="sales-period-select"
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--copper-on-surface-variant, #99a1ab)",
              }}
            >
              {t("sales.periodLabel", "Period:")}
            </label>
            <select
              id="sales-period-select"
              value={selectedPeriod}
              onChange={(e) => handlePeriodSelect(e.target.value)}
              className="copper-period-select"
              style={{
                backgroundColor: "var(--md-sys-color-surface-container, #24292f)",
                color: "var(--md-sys-color-on-surface, #f0f6fc)",
                border: "1px solid var(--md-sys-color-outline-variant, #30363d)",
                borderRadius: "var(--md-sys-shape-corner-small, 4px)",
                padding: "4px 8px",
                fontSize: "12px",
                fontVariantNumeric: "tabular-nums",
                cursor: "pointer",
              }}
            >
              {periodOptions.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* View mode switcher */}
          <div
            className="copper-view-mode-buttons"
            role="group"
            aria-label={t("sales.viewModeGroup", "View Mode")}
            style={{
              display: "inline-flex",
              backgroundColor: "var(--md-sys-color-surface-container, #24292f)",
              borderRadius: "var(--md-sys-shape-corner-small, 4px)",
              padding: "2px",
              border: "1px solid var(--md-sys-color-outline-variant, #30363d)",
            }}
          >
            <button
              type="button"
              onClick={() => setActiveViewMode("all")}
              style={{
                backgroundColor: activeViewMode === "all" ? "var(--copper-primary, #b87333)" : "transparent",
                color: activeViewMode === "all" ? "var(--copper-on-primary, #ffffff)" : "var(--copper-on-surface-variant, #99a1ab)",
                border: "none",
                borderRadius: "3px",
                padding: "4px 8px",
                fontSize: "11px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {t("sales.viewAll", "Full Cockpit")}
            </button>
            <button
              type="button"
              onClick={() => setActiveViewMode("manager")}
              style={{
                backgroundColor: activeViewMode === "manager" ? "var(--copper-primary, #b87333)" : "transparent",
                color: activeViewMode === "manager" ? "var(--copper-on-primary, #ffffff)" : "var(--copper-on-surface-variant, #99a1ab)",
                border: "none",
                borderRadius: "3px",
                padding: "4px 8px",
                fontSize: "11px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {t("sales.viewManager", "Manager View")}
            </button>
            <button
              type="button"
              onClick={() => setActiveViewMode("sellers")}
              style={{
                backgroundColor: activeViewMode === "sellers" ? "var(--copper-primary, #b87333)" : "transparent",
                color: activeViewMode === "sellers" ? "var(--copper-on-primary, #ffffff)" : "var(--copper-on-surface-variant, #99a1ab)",
                border: "none",
                borderRadius: "3px",
                padding: "4px 8px",
                fontSize: "11px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {t("sales.viewSellers", "Sellers Detail")}
            </button>
          </div>
        </div>
      }
    >
      <div
        className="copper-sales-performance-content"
        style={{ display: "flex", flexDirection: "column", gap: "24px" }}
      >
        {/* SECTION 1: TARGETS VS ACTUALS */}
        {(activeViewMode === "all" || activeViewMode === "manager") && (
          <div data-testid="cockpit-section-targets">
            <CockpitSection
              title={t("sales.targetsSectionTitle", "Revenue Targets & Quota Attainment")}
              description={t(
                "sales.targetsSectionDesc",
                "Actual closed business versus quarterly quotas with attainment progress"
              )}
            >
              {/* Figure 1: Revenue Attainment */}
              <CockpitFigure
                label={t("sales.targetRevenueLabel", "Closed Revenue / Quota")}
                value={`${formatNumber(revenueAttainment, 1, 1)}%`}
                unit={
                  <span
                    style={{
                      fontSize: "12px",
                      color: "var(--copper-on-surface-variant, #99a1ab)",
                      marginLeft: "6px",
                    }}
                  >
                    <span>{formatNumber(targets.revenueActual)}</span>
                    <span> / </span>
                    <span>{`${formatNumber(targets.revenueTarget)} ${currency}`}</span>
                  </span>
                }
                status={revenueStatus}
                targetGridLens="DealsGridLens"
                drillThroughLabel={t("sales.drillRevenueDeals", "Drill to Won Deals Grid")}
                dataTestId="figure-revenue-attainment"
                onDrillThrough={() =>
                  handleDrill({
                    targetGridLens: "DealsGridLens",
                    metric: "revenue",
                    period: selectedPeriod,
                  })
                }
              />

              {/* Figure 2: Margin Target vs Actual */}
              <CockpitFigure
                label={t("sales.targetMarginLabel", "Gross Margin (Actual vs Target)")}
                value={`${formatNumber(targets.marginActualPercent, 1, 1)}%`}
                unit={
                  <span
                    style={{
                      fontSize: "12px",
                      color: "var(--copper-on-surface-variant, #99a1ab)",
                      marginLeft: "6px",
                    }}
                  >
                    {t("sales.targetSuffix", `(Target: ${formatNumber(targets.marginTargetPercent, 1, 1)}%)`, {
                      target: formatNumber(targets.marginTargetPercent, 1, 1),
                    })}
                  </span>
                }
                status={
                  targets.marginActualPercent >= targets.marginTargetPercent ? "success" : "warning"
                }
                targetGridLens="QuotesGridLens"
                drillThroughLabel={t("sales.drillMarginQuotes", "Drill to Quotes & Margin Grid")}
                dataTestId="figure-margin"
                onDrillThrough={() =>
                  handleDrill({
                    targetGridLens: "QuotesGridLens",
                    metric: "margin",
                    period: selectedPeriod,
                  })
                }
              />

              {/* Figure 3: Deals Won */}
              <CockpitFigure
                label={t("sales.targetDealsLabel", "Closed Won Deals")}
                value={String(targets.dealsActual)}
                unit={
                  <span
                    style={{
                      fontSize: "12px",
                      color: "var(--copper-on-surface-variant, #99a1ab)",
                      marginLeft: "6px",
                    }}
                  >
                    {t("sales.dealsTargetSuffix", `of ${targets.dealsTarget} target`, {
                      target: targets.dealsTarget,
                    })}
                  </span>
                }
                status={targets.dealsActual >= targets.dealsTarget ? "success" : "normal"}
                targetGridLens="DealsGridLens"
                drillThroughLabel={t("sales.drillWonDeals", "Drill to Closed Deals Grid")}
                dataTestId="figure-deals"
                onDrillThrough={() =>
                  handleDrill({
                    targetGridLens: "DealsGridLens",
                    metric: "deals",
                    period: selectedPeriod,
                  })
                }
              />

              {/* Figure 4: Pipeline Coverage */}
              <CockpitFigure
                label={t("sales.pipelineCoverageLabel", "Pipeline Coverage")}
                value={`${formatNumber(targets.pipelineCoverageActual, 1, 1)}x`}
                unit={
                  <span
                    style={{
                      fontSize: "12px",
                      color: "var(--copper-on-surface-variant, #99a1ab)",
                      marginLeft: "6px",
                    }}
                  >
                    {t("sales.coverageTargetSuffix", `(Target: ${targets.pipelineCoverageTarget}x)`, {
                      target: targets.pipelineCoverageTarget,
                    })}
                  </span>
                }
                status={
                  targets.pipelineCoverageActual >= targets.pipelineCoverageTarget
                    ? "success"
                    : "warning"
                }
                targetGridLens="PipelineGridLens"
                drillThroughLabel={t("sales.drillPipeline", "Drill to Pipeline Grid")}
                dataTestId="figure-coverage"
                onDrillThrough={() =>
                  handleDrill({
                    targetGridLens: "PipelineGridLens",
                    metric: "coverage",
                    period: selectedPeriod,
                  })
                }
              />
            </CockpitSection>
          </div>
        )}

        {/* SECTION 2: STATS & VELOCITY */}
        {(activeViewMode === "all" || activeViewMode === "manager") && (
          <div data-testid="cockpit-section-stats">
            <CockpitSection
              title={t("sales.statsSectionTitle", "Sales Velocity & Conversion Stats")}
              description={t(
                "sales.statsSectionDesc",
                "Key performance metrics, conversion cycles, and active pipeline health"
              )}
            >
              {/* Stat 1: Win Rate */}
              <CockpitFigure
                label={t("sales.winRateLabel", "Win Rate")}
                value={`${formatNumber(stats.winRatePercent, 1, 1)}%`}
                trend={stats.winRateTrend}
                status={stats.winRatePercent >= 35 ? "success" : "normal"}
                targetGridLens="DealsGridLens"
                drillThroughLabel={t("sales.drillWinLoss", "Drill to Win/Loss Analysis Grid")}
                dataTestId="figure-win-rate"
                onDrillThrough={() =>
                  handleDrill({
                    targetGridLens: "DealsGridLens",
                    metric: "winRate",
                    period: selectedPeriod,
                  })
                }
              />

              {/* Stat 2: Avg Deal Size */}
              <CockpitFigure
                label={t("sales.avgDealLabel", "Average Deal Size")}
                value={formatNumber(stats.avgDealSize)}
                unit={currency}
                trend={stats.avgDealSizeTrend}
                status="normal"
                targetGridLens="DealsGridLens"
                drillThroughLabel={t("sales.drillAvgDeals", "Drill to Deal Size Distribution")}
                dataTestId="figure-avg-deal"
                onDrillThrough={() =>
                  handleDrill({
                    targetGridLens: "DealsGridLens",
                    metric: "avgDealSize",
                    period: selectedPeriod,
                  })
                }
              />

              {/* Stat 3: Sales Cycle Length */}
              <CockpitFigure
                label={t("sales.salesCycleLabel", "Sales Cycle Length")}
                value={String(stats.salesCycleDays)}
                unit={t("sales.daysUnit", "Days")}
                trend={stats.salesCycleTrend}
                status="normal"
                targetGridLens="OpportunitiesGridLens"
                drillThroughLabel={t("sales.drillCycleAge", "Drill to Opportunity Age Grid")}
                dataTestId="figure-sales-cycle"
                onDrillThrough={() =>
                  handleDrill({
                    targetGridLens: "OpportunitiesGridLens",
                    metric: "salesCycle",
                    period: selectedPeriod,
                  })
                }
              />

              {/* Stat 4: Open Pipeline Value */}
              <CockpitFigure
                label={t("sales.openPipelineLabel", "Open Active Pipeline")}
                value={formatNumber(stats.openPipelineValue)}
                unit={currency}
                trend={{
                  value: `${stats.activeDealsCount} deals`,
                  direction: "neutral",
                }}
                status="normal"
                targetGridLens="PipelineGridLens"
                drillThroughLabel={t("sales.drillOpenPipeline", "Drill to Active Pipeline Grid")}
                dataTestId="figure-open-pipeline"
                onDrillThrough={() =>
                  handleDrill({
                    targetGridLens: "PipelineGridLens",
                    metric: "openPipeline",
                    period: selectedPeriod,
                  })
                }
              />
            </CockpitSection>
          </div>
        )}

        {/* SECTION 3: MANAGER VIEW & TEAM AGGREGATION */}
        {(activeViewMode === "all" || activeViewMode === "manager") && (
          <div data-testid="cockpit-section-manager">
            <section className="copper-cockpit-section">
              <div className="copper-cockpit-section-header">
                <div>
                  <h2 className="copper-cockpit-section-title">
                    {t("sales.managerViewTitle", "Manager View: Team Quota & Rollup")}
                  </h2>
                  <p className="copper-cockpit-section-description">
                    <span>{t("sales.managerLeader", "Manager: ")}</span>
                    <strong>{managerView.managerName}</strong>
                    <span> · </span>
                    <span>{managerView.teamName}</span>
                  </p>
                </div>
              </div>

              {/* Manager Top-line Rollup Figures */}
              <div className="copper-cockpit-grid" style={{ marginBottom: "16px" }}>
                <CockpitFigure
                  label={t("sales.gapToQuotaLabel", "Gap to Target Quota")}
                  value={formatNumber(managerView.gapToQuota)}
                  unit={currency}
                  status={managerView.gapToQuota > 0 ? "warning" : "success"}
                  targetGridLens="PipelineGridLens"
                  drillThroughLabel={t("sales.drillGapPipeline", "Drill to Gap Closing Pipeline")}
                  dataTestId="figure-gap-quota"
                  onDrillThrough={() =>
                    handleDrill({
                      targetGridLens: "PipelineGridLens",
                      metric: "gapToQuota",
                      period: selectedPeriod,
                    })
                  }
                />

                <CockpitFigure
                  label={t("sales.projectedFinishLabel", "Projected Quarter Finish")}
                  value={formatNumber(managerView.projectedFinish)}
                  unit={currency}
                  status="normal"
                  targetGridLens="ForecastGridLens"
                  drillThroughLabel={t("sales.drillForecast", "Drill to Team Forecast Grid")}
                  dataTestId="figure-projected-finish"
                  onDrillThrough={() =>
                    handleDrill({
                      targetGridLens: "ForecastGridLens",
                      metric: "projectedFinish",
                      period: selectedPeriod,
                    })
                  }
                />

                <CockpitFigure
                  label={t("sales.teamAttainmentLabel", "Aggregate Team Attainment")}
                  value={`${formatNumber(managerView.teamAttainmentPercent, 1, 1)}%`}
                  unit={
                    <span
                      style={{
                        fontSize: "12px",
                        color: "var(--copper-on-surface-variant, #99a1ab)",
                        marginLeft: "6px",
                      }}
                    >
                      {`${formatNumber(managerView.totalTeamActual)} / ${formatNumber(
                        managerView.totalTeamQuota
                      )} ${currency}`}
                    </span>
                  }
                  status={getAttainmentStatus(managerView.teamAttainmentPercent)}
                  targetGridLens="DealsGridLens"
                  drillThroughLabel={t("sales.drillTeamDeals", "Drill to Team Deals Grid")}
                  dataTestId="figure-team-attainment"
                  onDrillThrough={() =>
                    handleDrill({
                      targetGridLens: "DealsGridLens",
                      metric: "teamAttainment",
                      period: selectedPeriod,
                    })
                  }
                />
              </div>

              {/* Team Breakdown Table */}
              <div
                className="copper-manager-team-table-container"
                data-testid="manager-team-table"
                style={{
                  backgroundColor: "var(--md-sys-color-surface-container, #24292f)",
                  borderRadius: "var(--md-sys-shape-corner-medium, 8px)",
                  border: "1px solid var(--md-sys-color-outline-variant, #30363d)",
                  overflowX: "auto",
                }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    textAlign: "left",
                    fontSize: "13px",
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        borderBottom: "1px solid var(--md-sys-color-outline-variant, #30363d)",
                        color: "var(--copper-on-surface-variant, #99a1ab)",
                      }}
                    >
                      <th style={{ padding: "10px 14px", fontWeight: 600 }}>{t("sales.teamTerritory", "Territory / Pod")}</th>
                      <th style={{ padding: "10px 14px", fontWeight: 600, textAlign: "right" }}>{t("sales.quota", "Quota")}</th>
                      <th style={{ padding: "10px 14px", fontWeight: 600, textAlign: "right" }}>{t("sales.closedWon", "Closed Actual")}</th>
                      <th style={{ padding: "10px 14px", fontWeight: 600, textAlign: "right" }}>{t("sales.attainment", "Attainment")}</th>
                      <th style={{ padding: "10px 14px", fontWeight: 600, textAlign: "right" }}>{t("sales.pipeline", "Open Pipeline")}</th>
                      <th style={{ padding: "10px 14px", fontWeight: 600, textAlign: "center" }}>{t("sales.actions", "Grid Drill-Through")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {managerView.teams.map((tm) => {
                      const tmStatus = getAttainmentStatus(tm.attainmentPercent);
                      return (
                        <tr
                          key={tm.id}
                          style={{
                            borderBottom: "1px solid var(--md-sys-color-outline-variant, #30363d)",
                          }}
                        >
                          <td style={{ padding: "10px 14px", fontWeight: 600 }}>
                            <div>{tm.name}</div>
                            <div
                              style={{
                                fontSize: "11px",
                                color: "var(--copper-on-surface-variant, #99a1ab)",
                              }}
                            >
                              {`${tm.headcount} ${t("sales.headcountRep", "AE(s)")}`}
                            </div>
                          </td>
                          <td
                            style={{
                              padding: "10px 14px",
                              textAlign: "right",
                              fontVariantNumeric: "tabular-nums",
                            }}
                          >
                            {`${formatNumber(tm.quota)} ${currency}`}
                          </td>
                          <td
                            style={{
                              padding: "10px 14px",
                              textAlign: "right",
                              fontWeight: 600,
                              fontVariantNumeric: "tabular-nums",
                            }}
                          >
                            {`${formatNumber(tm.actual)} ${currency}`}
                          </td>
                          <td style={{ padding: "10px 14px", textAlign: "right" }}>
                            <span
                              className={`copper-badge ${
                                tmStatus === "success"
                                  ? "copper-badge-success"
                                  : tmStatus === "critical"
                                  ? "copper-badge-danger"
                                  : tmStatus === "warning"
                                  ? "copper-badge-warning"
                                  : "copper-badge-info"
                              }`}
                              style={{ fontVariantNumeric: "tabular-nums" }}
                            >
                              {`${formatNumber(tm.attainmentPercent, 1, 1)}%`}
                            </span>
                          </td>
                          <td
                            style={{
                              padding: "10px 14px",
                              textAlign: "right",
                              fontVariantNumeric: "tabular-nums",
                            }}
                          >
                            {`${formatNumber(tm.openPipeline)} ${currency}`}
                          </td>
                          <td style={{ padding: "10px 14px", textAlign: "center" }}>
                            <DrillThroughControl
                              targetGridLens="TeamPipelineGridLens"
                              label={t("sales.drillTeamGrid", `View ${tm.name} in Grid`, {
                                team: tm.name,
                              })}
                              dataTestId={`drill-team-${tm.id}`}
                              onDrillThrough={() =>
                                handleDrill({
                                  targetGridLens: "TeamPipelineGridLens",
                                  teamId: tm.id,
                                  period: selectedPeriod,
                                })
                              }
                            >
                              <span style={{ fontSize: "12px", textDecoration: "underline" }}>
                                {t("sales.openInGrid", "Open Grid →")}
                              </span>
                            </DrillThroughControl>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {/* SECTION 4: SELLER DETAIL */}
        {(activeViewMode === "all" || activeViewMode === "sellers") && (
          <div data-testid="cockpit-section-sellers">
            <section className="copper-cockpit-section">
              <div className="copper-cockpit-section-header">
                <div>
                  <h2 className="copper-cockpit-section-title">
                    {t("sales.sellersSectionTitle", "Seller Performance & Quota Attainment")}
                  </h2>
                  <p className="copper-cockpit-section-description">
                    {t(
                      "sales.sellersSectionDesc",
                      "Individual account executive scorecards, win rates, and pipeline coverage"
                    )}
                  </p>
                </div>
              </div>

              <div
                className="copper-sellers-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: "16px",
                }}
              >
                {sellers.map((seller) => {
                  return (
                    <div
                      key={seller.id}
                      className="copper-seller-card"
                      data-testid={`seller-card-${seller.id}`}
                      style={{
                        backgroundColor: "var(--md-sys-color-surface-container, #24292f)",
                        borderRadius: "var(--md-sys-shape-corner-medium, 8px)",
                        border: "1px solid var(--md-sys-color-outline-variant, #30363d)",
                        padding: "16px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                      }}
                    >
                      {/* Seller Header */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          justifyContent: "space-between",
                          gap: "8px",
                        }}
                      >
                        <div>
                          <h3
                            style={{
                              margin: 0,
                              fontSize: "15px",
                              fontWeight: 600,
                              color: "var(--md-sys-color-on-surface, #f0f6fc)",
                            }}
                          >
                            {seller.name}
                          </h3>
                          <div
                            style={{
                              fontSize: "12px",
                              color: "var(--copper-on-surface-variant, #99a1ab)",
                            }}
                          >
                            {seller.role}
                          </div>
                          <div
                            style={{
                              fontSize: "11px",
                              color: "var(--copper-secondary, #3a6e6a)",
                              fontWeight: 500,
                            }}
                          >
                            {seller.territory}
                          </div>
                        </div>

                        <span
                          className={`copper-badge ${
                            seller.status === "success"
                              ? "copper-badge-success"
                              : seller.status === "critical"
                              ? "copper-badge-danger"
                              : seller.status === "warning"
                              ? "copper-badge-warning"
                              : "copper-badge-info"
                          }`}
                          style={{ fontVariantNumeric: "tabular-nums" }}
                        >
                          {`${formatNumber(seller.attainmentPercent, 1, 1)}%`}
                        </span>
                      </div>

                      {/* Quota Progress Bar */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: "12px",
                            fontVariantNumeric: "tabular-nums",
                          }}
                        >
                          <span style={{ color: "var(--copper-on-surface-variant, #99a1ab)" }}>
                            {t("sales.quotaProgress", "Actual / Quota:")}
                          </span>
                          <span style={{ fontWeight: 600 }}>
                            {`${formatNumber(seller.actual)} / ${formatNumber(seller.quota)} ${currency}`}
                          </span>
                        </div>
                        <div
                          style={{
                            width: "100%",
                            height: "6px",
                            backgroundColor: "var(--md-sys-color-surface-container-high, #30363d)",
                            borderRadius: "3px",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${Math.min(100, seller.attainmentPercent)}%`,
                              height: "100%",
                              backgroundColor:
                                seller.status === "success"
                                  ? "var(--copper-secondary, #3a6e6a)"
                                  : seller.status === "critical"
                                  ? "var(--copper-severity-blocker, #cf222e)"
                                  : seller.status === "warning"
                                  ? "var(--copper-severity-risk, #d29922)"
                                  : "var(--copper-primary, #b87333)",
                              transition: "width 200ms ease",
                            }}
                          />
                        </div>
                      </div>

                      {/* Seller Metrics Table */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "8px",
                          fontSize: "12px",
                          fontVariantNumeric: "tabular-nums",
                          backgroundColor: "var(--md-sys-color-surface-container-low, #1c2128)",
                          padding: "10px",
                          borderRadius: "6px",
                        }}
                      >
                        <div>
                          <div style={{ color: "var(--copper-on-surface-variant, #99a1ab)", fontSize: "11px" }}>
                            {t("sales.winRate", "Win Rate")}
                          </div>
                          <div style={{ fontWeight: 600 }}>{`${formatNumber(seller.winRatePercent, 1, 1)}%`}</div>
                        </div>
                        <div>
                          <div style={{ color: "var(--copper-on-surface-variant, #99a1ab)", fontSize: "11px" }}>
                            {t("sales.wonDeals", "Won Deals")}
                          </div>
                          <div style={{ fontWeight: 600 }}>{seller.wonDealsCount}</div>
                        </div>
                        <div>
                          <div style={{ color: "var(--copper-on-surface-variant, #99a1ab)", fontSize: "11px" }}>
                            {t("sales.openPipeline", "Pipeline")}
                          </div>
                          <div style={{ fontWeight: 600 }}>{`${formatNumber(seller.pipeline)} ${currency}`}</div>
                        </div>
                        <div>
                          <div style={{ color: "var(--copper-on-surface-variant, #99a1ab)", fontSize: "11px" }}>
                            {t("sales.activeDeals", "Active Deals")}
                          </div>
                          <div style={{ fontWeight: 600 }}>{seller.activeDealsCount}</div>
                        </div>
                      </div>

                      {/* Drill-through action */}
                      <div style={{ marginTop: "auto", paddingTop: "6px" }}>
                        <DrillThroughControl
                          targetGridLens="DealsGridLens"
                          label={t("sales.drillSellerDeals", `View ${seller.name} Deals in Grid`, {
                            name: seller.name,
                          })}
                          dataTestId={`drill-seller-${seller.id}`}
                          onDrillThrough={() =>
                            handleDrill({
                              targetGridLens: "DealsGridLens",
                              sellerId: seller.id,
                              period: selectedPeriod,
                            })
                          }
                          className="copper-seller-drill-button"
                        >
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              fontSize: "12px",
                              fontWeight: 600,
                              color: "var(--copper-primary, #b87333)",
                            }}
                          >
                            <span>{t("sales.viewSellersDeals", "View Deals in Grid →")}</span>
                          </span>
                        </DrillThroughControl>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}
      </div>
    </BaseLens>
  );
};
