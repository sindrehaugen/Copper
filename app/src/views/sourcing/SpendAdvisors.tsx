import React, { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";

export type RebateStatus = "in_reach" | "on_track" | "at_risk" | "achieved";
export type MoveSpendImpact = "high" | "medium" | "low";
export type MoveSpendType = "tier_accelerator" | "margin_protector" | "rebate_capture" | "freight_reduction";

export interface RebateTier {
  name: string;
  threshold: number;
  rebatePct: number;
}

export interface RebateForecastItem {
  id: string;
  vendorName: string;
  vendorCode: string;
  category: string;
  currentSpend: number;
  currentTier: string;
  currentRebatePct: number;
  accruedRebate: number;
  nextTier: string;
  nextTierThreshold: number;
  nextTierRebatePct: number;
  gapToNextTier: number;
  projectedRebateAtNextTier: number;
  incrementalGain: number;
  daysRemaining: number;
  period: string;
  status: RebateStatus;
  qualifyingSkus: number;
  tiers: RebateTier[];
  agreementTerms: string;
}

export interface SkuDeltaItem {
  sku: string;
  description: string;
  qty: number;
  sourcePrice: number;
  targetPrice: number;
}

export interface MoveSpendRecommendationItem {
  id: string;
  title: string;
  type: MoveSpendType;
  impactLevel: MoveSpendImpact;
  sourceVendor: string;
  sourceVendorCode: string;
  targetVendor: string;
  targetVendorCode: string;
  category: string;
  candidateSpendAmount: number;
  directPriceVariance: number;
  unlockedRebateYield: number;
  netFinancialBenefit: number;
  leadTimeImpactDays: number;
  specParity: string;
  riskScore: "low" | "medium" | "high";
  rationale: string;
  skuDetails: SkuDeltaItem[];
  status: "recommended" | "bookmarked" | "dismissed";
}

export interface SpendAdvisorsProps {
  title?: string;
  className?: string;
  onNavigate?: (path: string, entity?: any) => void;
  "data-entity-type"?: string;
  "data-entity-id"?: string;
  initialRebateForecasts?: RebateForecastItem[];
  initialMoveSpendRecommendations?: MoveSpendRecommendationItem[];
  initialSimulatorVendorId?: string;
  [key: string]: any;
}

export const DEFAULT_REBATE_FORECASTS: RebateForecastItem[] = [
  {
    id: "rebate-apex-01",
    vendorName: "Apex Distributing",
    vendorCode: "APEX-DIST-01",
    category: "Displays & Video",
    currentSpend: 285000,
    currentTier: "Tier 2 (Silver)",
    currentRebatePct: 4.5,
    accruedRebate: 12825,
    nextTier: "Tier 3 (Gold)",
    nextTierThreshold: 300000,
    nextTierRebatePct: 6.5,
    gapToNextTier: 15000,
    projectedRebateAtNextTier: 19500,
    incrementalGain: 6675,
    daysRemaining: 18,
    period: "Q3 FY26",
    status: "in_reach",
    qualifyingSkus: 480,
    tiers: [
      { name: "Tier 1 (Bronze)", threshold: 100000, rebatePct: 2.5 },
      { name: "Tier 2 (Silver)", threshold: 200000, rebatePct: 4.5 },
      { name: "Tier 3 (Gold)", threshold: 300000, rebatePct: 6.5 },
      { name: "Tier 4 (Platinum)", threshold: 450000, rebatePct: 8.0 },
    ],
    agreementTerms: "Net 30 commercial terms. Rebates calculated retroactively on cumulative quarterly net spend.",
  },
  {
    id: "rebate-qsc-02",
    vendorName: "Q-SYS Systems",
    vendorCode: "QSYS-COMM-02",
    category: "Audio & DSP",
    currentSpend: 142000,
    currentTier: "Tier 1 (Standard)",
    currentRebatePct: 3.0,
    accruedRebate: 4260,
    nextTier: "Tier 2 (Advantage)",
    nextTierThreshold: 175000,
    nextTierRebatePct: 5.5,
    gapToNextTier: 33000,
    projectedRebateAtNextTier: 9625,
    incrementalGain: 5365,
    daysRemaining: 24,
    period: "Q3 FY26",
    status: "on_track",
    qualifyingSkus: 185,
    tiers: [
      { name: "Tier 1 (Standard)", threshold: 75000, rebatePct: 3.0 },
      { name: "Tier 2 (Advantage)", threshold: 175000, rebatePct: 5.5 },
      { name: "Tier 3 (Premier)", threshold: 250000, rebatePct: 7.5 },
    ],
    agreementTerms: "Hardware and software licensing eligible. Disbursed as end-of-year cash credit.",
  },
  {
    id: "rebate-crest-03",
    vendorName: "Crestron Electronics",
    vendorCode: "CREST-SYS-04",
    category: "Control & Automation",
    currentSpend: 192000,
    currentTier: "Tier 1 (Authorized)",
    currentRebatePct: 3.5,
    accruedRebate: 6720,
    nextTier: "Tier 2 (Elite)",
    nextTierThreshold: 220000,
    nextTierRebatePct: 6.0,
    gapToNextTier: 28000,
    projectedRebateAtNextTier: 13200,
    incrementalGain: 6480,
    daysRemaining: 31,
    period: "Q3 FY26",
    status: "in_reach",
    qualifyingSkus: 340,
    tiers: [
      { name: "Tier 1 (Authorized)", threshold: 100000, rebatePct: 3.5 },
      { name: "Tier 2 (Elite)", threshold: 220000, rebatePct: 6.0 },
      { name: "Tier 3 (Diamond)", threshold: 350000, rebatePct: 8.5 },
    ],
    agreementTerms: "Requires Silver certified engineering team. Retroactive rebate on DM-NVX and control processors.",
  },
  {
    id: "rebate-shure-04",
    vendorName: "Shure Commercial",
    vendorCode: "SHURE-MIC-09",
    category: "Microphones & Conferencing",
    currentSpend: 98000,
    currentTier: "Tier 2 (Preferred)",
    currentRebatePct: 4.0,
    accruedRebate: 3920,
    nextTier: "Tier 3 (Enterprise)",
    nextTierThreshold: 110000,
    nextTierRebatePct: 5.5,
    gapToNextTier: 12000,
    projectedRebateAtNextTier: 6050,
    incrementalGain: 2130,
    daysRemaining: 12,
    period: "Q3 FY26",
    status: "in_reach",
    qualifyingSkus: 115,
    tiers: [
      { name: "Tier 1 (Associate)", threshold: 50000, rebatePct: 2.0 },
      { name: "Tier 2 (Preferred)", threshold: 80000, rebatePct: 4.0 },
      { name: "Tier 3 (Enterprise)", threshold: 110000, rebatePct: 5.5 },
    ],
    agreementTerms: "Quarterly cutoff at calendar quarter end. Includes Microflex Advance line.",
  },
  {
    id: "rebate-gavl-05",
    vendorName: "Global AV Logistics",
    vendorCode: "GAVL-CORP-02",
    category: "Infrastructure & Cabling",
    currentSpend: 310000,
    currentTier: "Tier 3 (Master)",
    currentRebatePct: 7.0,
    accruedRebate: 21700,
    nextTier: "Tier 4 (Strategic Partner)",
    nextTierThreshold: 450000,
    nextTierRebatePct: 8.5,
    gapToNextTier: 140000,
    projectedRebateAtNextTier: 38250,
    incrementalGain: 16550,
    daysRemaining: 45,
    period: "Q3 FY26",
    status: "at_risk",
    qualifyingSkus: 920,
    tiers: [
      { name: "Tier 1 (Basic)", threshold: 100000, rebatePct: 3.0 },
      { name: "Tier 2 (Select)", threshold: 200000, rebatePct: 5.0 },
      { name: "Tier 3 (Master)", threshold: 300000, rebatePct: 7.0 },
      { name: "Tier 4 (Strategic Partner)", threshold: 450000, rebatePct: 8.5 },
    ],
    agreementTerms: "Covers bulk cabling, racks, power distribution, and patch panels.",
  },
];

export const DEFAULT_MOVE_SPEND_RECOMMENDATIONS: MoveSpendRecommendationItem[] = [
  {
    id: "rec-apex-disp-01",
    title: "Consolidate 18x Commercial 75-Inch Displays to Apex Distributing",
    type: "tier_accelerator",
    impactLevel: "high",
    sourceVendor: "Spot Market Distributor (B-Stock Direct)",
    sourceVendorCode: "SPOT-MKT-09",
    targetVendor: "Apex Distributing",
    targetVendorCode: "APEX-DIST-01",
    category: "Displays & Video",
    candidateSpendAmount: 16200,
    directPriceVariance: 360,
    unlockedRebateYield: 6675,
    netFinancialBenefit: 6315,
    leadTimeImpactDays: -4,
    specParity: "100% Identical OEM",
    riskScore: "low",
    rationale: "Reallocating 18 uncommitted 75-inch panels closes the $15k deficit to Apex Tier 3, elevating rebate on all $300k spend from 4.5% to 6.5%.",
    skuDetails: [
      { sku: "DISP-75-4K-PRO", description: "75-inch 4K UHD Commercial Display 500nit", qty: 18, sourcePrice: 880, targetPrice: 900 },
    ],
    status: "recommended",
  },
  {
    id: "rec-qsc-dsp-02",
    title: "Shift 6x Core DSP Processors to Q-SYS Direct Program",
    type: "margin_protector",
    impactLevel: "high",
    sourceVendor: "Regional AV Broker",
    sourceVendorCode: "REG-AV-03",
    targetVendor: "Q-SYS Systems",
    targetVendorCode: "QSYS-COMM-02",
    category: "Audio & DSP",
    candidateSpendAmount: 34800,
    directPriceVariance: -1200,
    unlockedRebateYield: 5365,
    netFinancialBenefit: 6565,
    leadTimeImpactDays: 0,
    specParity: "Exact Part Match",
    riskScore: "low",
    rationale: "Reallocates 6 Core DSP processors away from broker. Unlocks Tier 2 5.5% rebate on all Q-SYS orders while trimming invoice price directly.",
    skuDetails: [
      { sku: "DSP-CORE-110F", description: "Unified Core Processor 8x8 Mic/Line I/O", qty: 6, sourcePrice: 6000, targetPrice: 5800 },
    ],
    status: "recommended",
  },
  {
    id: "rec-shure-mic-03",
    title: "Consolidate Ceiling Array Microphones to Shure Enterprise",
    type: "tier_accelerator",
    impactLevel: "medium",
    sourceVendor: "Nordic Sound Fulfillment",
    sourceVendorCode: "NSF-SUP-01",
    targetVendor: "Shure Commercial",
    targetVendorCode: "SHURE-MIC-09",
    category: "Microphones & Conferencing",
    candidateSpendAmount: 14400,
    directPriceVariance: 0,
    unlockedRebateYield: 2130,
    netFinancialBenefit: 2130,
    leadTimeImpactDays: -2,
    specParity: "Official Certified",
    riskScore: "low",
    rationale: "Consolidating 4 ceiling array units unlocks Tier 3 rebate (5.5%) with only 12 days remaining in the quarter.",
    skuDetails: [
      { sku: "MIC-CEIL-MXA920", description: "Steerable Ceiling Array Microphone Dante", qty: 4, sourcePrice: 3600, targetPrice: 3600 },
    ],
    status: "recommended",
  },
  {
    id: "rec-crestron-nvx-04",
    title: "Re-align 14x AV-over-IP Endpoints to Crestron Elite Agreement",
    type: "rebate_capture",
    impactLevel: "medium",
    sourceVendor: "Unassigned Sourcing Queue",
    sourceVendorCode: "UNASSIGNED-00",
    targetVendor: "Crestron Electronics",
    targetVendorCode: "CREST-SYS-04",
    category: "Control & Automation",
    candidateSpendAmount: 29400,
    directPriceVariance: 280,
    unlockedRebateYield: 6480,
    netFinancialBenefit: 6200,
    leadTimeImpactDays: 1,
    specParity: "Verified Compatible",
    riskScore: "low",
    rationale: "Assigning 14 uncommitted DM-NVX endpoints pushes spend to $221.4k, crossing the threshold for retroactive 6.0% rebate.",
    skuDetails: [
      { sku: "NVX-E30-4K", description: "DM NVX 4K60 4:4:4 HDR Network AV Encoder", qty: 14, sourcePrice: 2080, targetPrice: 2100 },
    ],
    status: "recommended",
  },
];

export function SpendAdvisors({
  title,
  className = "",
  "data-entity-type": dataEntityType,
  "data-entity-id": dataEntityId,
  initialRebateForecasts = DEFAULT_REBATE_FORECASTS,
  initialMoveSpendRecommendations = DEFAULT_MOVE_SPEND_RECOMMENDATIONS,
  initialSimulatorVendorId,
}: SpendAdvisorsProps) {
  const { t } = useTranslation();

  // Navigation tab
  const [activeTab, setActiveTab] = useState<"overview" | "rebate" | "moveSpend" | "whatIf">("overview");

  // State for Rebate Forecast
  const [rebateForecasts] = useState<RebateForecastItem[]>(initialRebateForecasts);
  const [rebateSearchQuery, setRebateSearchQuery] = useState<string>("");
  const [rebateCategoryFilter, setRebateCategoryFilter] = useState<string>("all");
  const [selectedVendorForTierDrawer, setSelectedVendorForTierDrawer] = useState<RebateForecastItem | null>(null);

  // State for Move-Spend Recommender
  const [moveSpendRecommendations, setMoveSpendRecommendations] = useState<MoveSpendRecommendationItem[]>(
    initialMoveSpendRecommendations
  );
  const [moveSpendImpactFilter, setMoveSpendImpactFilter] = useState<string>("all");
  const [selectedRecForSkuDrawer, setSelectedRecForSkuDrawer] = useState<MoveSpendRecommendationItem | null>(null);

  // State for Spend What-If Simulator
  const [simVendorId, setSimVendorId] = useState<string>(
    initialSimulatorVendorId || DEFAULT_REBATE_FORECASTS[0]?.vendorCode || "APEX-DIST-01"
  );
  const [simShiftAmount, setSimShiftAmount] = useState<number>(20000);
  const [simVolumeMultiplier, setSimVolumeMultiplier] = useState<number>(1.0);
  const [simIncludeTierRebate, setSimIncludeTierRebate] = useState<boolean>(true);
  const [simApplyEarlyPay, setSimApplyEarlyPay] = useState<boolean>(false);
  const [simIncludeFreightBuffer, setSimIncludeFreightBuffer] = useState<boolean>(false);

  // KPI calculations across the advisory surface
  const kpis = useMemo(() => {
    const totalMonitoredSpend = rebateForecasts.reduce((acc, curr) => acc + curr.currentSpend, 0);
    const accruedRebate = rebateForecasts.reduce((acc, curr) => acc + curr.accruedRebate, 0);
    const projectedGain = rebateForecasts.reduce((acc, curr) => acc + curr.incrementalGain, 0);
    const activeOpportunitiesBenefit = moveSpendRecommendations
      .filter((r) => r.status !== "dismissed")
      .reduce((acc, curr) => acc + curr.netFinancialBenefit, 0);

    return {
      totalMonitoredSpend,
      accruedRebate,
      projectedGain,
      activeOpportunitiesBenefit,
    };
  }, [rebateForecasts, moveSpendRecommendations]);

  // Filtered Rebate Forecasts
  const filteredRebates = useMemo(() => {
    return rebateForecasts.filter((item) => {
      if (rebateCategoryFilter !== "all" && item.category !== rebateCategoryFilter) {
        return false;
      }
      if (rebateSearchQuery.trim()) {
        const q = rebateSearchQuery.toLowerCase();
        const matches =
          item.vendorName.toLowerCase().includes(q) ||
          item.vendorCode.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [rebateForecasts, rebateCategoryFilter, rebateSearchQuery]);

  // Filtered Move-Spend Recommendations
  const filteredMoveSpend = useMemo(() => {
    return moveSpendRecommendations.filter((item) => {
      if (moveSpendImpactFilter !== "all" && item.impactLevel !== moveSpendImpactFilter) {
        return false;
      }
      return true;
    });
  }, [moveSpendRecommendations, moveSpendImpactFilter]);

  // Toggle bookmark action (advisory only)
  const handleToggleBookmark = useCallback((id: string) => {
    setMoveSpendRecommendations((prev) =>
      prev.map((rec) => {
        if (rec.id !== id) return rec;
        const nextStatus = rec.status === "bookmarked" ? "recommended" : "bookmarked";
        return { ...rec, status: nextStatus };
      })
    );
  }, []);

  // Dismiss recommendation action (advisory only)
  const handleToggleDismiss = useCallback((id: string) => {
    setMoveSpendRecommendations((prev) =>
      prev.map((rec) => {
        if (rec.id !== id) return rec;
        const nextStatus = rec.status === "dismissed" ? "recommended" : "dismissed";
        return { ...rec, status: nextStatus };
      })
    );
  }, []);

  // Send Move-Spend Recommendation to What-If Simulator
  const handleSimulateRecommendation = useCallback((rec: MoveSpendRecommendationItem) => {
    setSimVendorId(rec.targetVendorCode);
    setSimShiftAmount(rec.candidateSpendAmount);
    setSimVolumeMultiplier(1.0);
    setSimIncludeTierRebate(true);
    setActiveTab("whatIf");
  }, []);

  // Preset Handlers for Simulator
  const handleApplyPreset = useCallback((preset: "maxRebate" | "dsp" | "conservative") => {
    if (preset === "maxRebate") {
      setSimVendorId("APEX-DIST-01");
      setSimShiftAmount(25000);
      setSimVolumeMultiplier(1.0);
      setSimIncludeTierRebate(true);
      setSimApplyEarlyPay(true);
      setSimIncludeFreightBuffer(false);
    } else if (preset === "dsp") {
      setSimVendorId("QSYS-COMM-02");
      setSimShiftAmount(35000);
      setSimVolumeMultiplier(1.0);
      setSimIncludeTierRebate(true);
      setSimApplyEarlyPay(false);
      setSimIncludeFreightBuffer(false);
    } else {
      setSimVendorId("APEX-DIST-01");
      setSimShiftAmount(0);
      setSimVolumeMultiplier(1.0);
      setSimIncludeTierRebate(false);
      setSimApplyEarlyPay(false);
      setSimIncludeFreightBuffer(false);
    }
  }, []);

  // Simulator Target Vendor
  const simVendor = useMemo(() => {
    return rebateForecasts.find((v) => v.vendorCode === simVendorId) || rebateForecasts[0];
  }, [rebateForecasts, simVendorId]);

  // Simulator Computed Results
  const simulationResults = useMemo(() => {
    if (!simVendor) {
      return {
        baselineSpend: 0,
        simulatedSpend: 0,
        baseRebateValue: 0,
        simulatedRebateValue: 0,
        rebateDelta: 0,
        earlyPayYield: 0,
        freightBufferCost: 0,
        netOutlay: 0,
        netImprovement: 0,
        effectiveMarginUplift: "0.00",
        tierUnlocked: false,
        achievedTierName: "",
        achievedRebatePct: 0,
      };
    }

    const baselineSpend = simVendor.currentSpend;
    const additionalSpend = Math.round(simShiftAmount * simVolumeMultiplier);
    const simulatedSpend = baselineSpend + additionalSpend;
    const baseRebateValue = Math.round(baselineSpend * (simVendor.currentRebatePct / 100));

    // Determine target tier rate under simulation
    let achievedRebatePct = simVendor.currentRebatePct;
    let achievedTierName = simVendor.currentTier;
    let tierUnlocked = false;

    if (simIncludeTierRebate && simVendor.tiers && simVendor.tiers.length > 0) {
      // Find highest tier achieved
      const sortedTiers = [...simVendor.tiers].sort((a, b) => b.threshold - a.threshold);
      const unlocked = sortedTiers.find((t) => simulatedSpend >= t.threshold);
      if (unlocked) {
        achievedRebatePct = unlocked.rebatePct;
        achievedTierName = unlocked.name;
        if (simulatedSpend >= simVendor.nextTierThreshold) {
          tierUnlocked = true;
        }
      }
    }

    const simulatedRebateValue = Math.round(simulatedSpend * (achievedRebatePct / 100));
    const rebateDelta = simulatedRebateValue - baseRebateValue;
    const earlyPayYield = simApplyEarlyPay ? Math.round(simulatedSpend * 0.02) : 0;
    const freightBufferCost = simIncludeFreightBuffer ? Math.round(simulatedSpend * 0.05) : 0;

    const netOutlay = simulatedSpend - simulatedRebateValue - earlyPayYield + freightBufferCost;
    const netImprovement = rebateDelta + earlyPayYield - freightBufferCost;
    const effectiveMarginUplift = simulatedSpend > 0 ? ((netImprovement / simulatedSpend) * 100).toFixed(2) : "0.00";

    return {
      baselineSpend,
      simulatedSpend,
      baseRebateValue,
      simulatedRebateValue,
      rebateDelta,
      earlyPayYield,
      freightBufferCost,
      netOutlay,
      netImprovement,
      effectiveMarginUplift,
      tierUnlocked,
      achievedTierName,
      achievedRebatePct,
    };
  }, [
    simVendor,
    simShiftAmount,
    simVolumeMultiplier,
    simIncludeTierRebate,
    simApplyEarlyPay,
    simIncludeFreightBuffer,
  ]);

  return (
    <div
      className={`flex flex-col h-full w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-y-auto ${className}`}
      data-testid="spend-advisors-surface"
      data-entity-type={dataEntityType}
      data-entity-id={dataEntityId}
    >
      {/* 1. Header Bar */}
      <header className="flex-none p-5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span
                className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 font-mono text-xs font-semibold uppercase tracking-wider"
                data-testid="spend-advisors-badge"
              >
                {t("sourcing.spendAdvisors.badge", "SPEND ADVISORY")}
              </span>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50" data-testid="spend-advisors-title">
                {title || t("sourcing.spendAdvisors.title", "Spend Advisors")}
              </h1>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {t(
                "sourcing.spendAdvisors.subtitle",
                "Strategic cockpit for rebate tier forecasting, move-spend opportunities, and what-if margin modeling."
              )}
            </p>
          </div>

          {/* Advisory Surface Governance Notice */}
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs"
            data-testid="advisory-disclaimer-banner"
          >
            <span className="font-semibold">{t("sourcing.spendAdvisors.disclaimer", "Advisory Surface: Purchasing workflows and PO execution must be completed in authorized ERP systems. Direct PO generation is disabled.")}</span>
          </div>
        </div>

        {/* 2. Top-Level Metric Strip */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4" data-testid="spend-advisors-kpi-strip">
          <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">
              {t("sourcing.spendAdvisors.kpi.totalMonitoredSpend", "Total Monitored Spend")}
            </span>
            <div className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-100 tabular-nums">
              <span>{t("sourcing.spendAdvisors.currencySymbol", "$")}</span>
              <span>{kpis.totalMonitoredSpend.toLocaleString()}</span>
            </div>
          </div>

          <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">
              {t("sourcing.spendAdvisors.kpi.accruedRebate", "Accrued Rebate Value")}
            </span>
            <div className="mt-1 text-lg font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              <span>{t("sourcing.spendAdvisors.currencySymbol", "$")}</span>
              <span>{kpis.accruedRebate.toLocaleString()}</span>
            </div>
          </div>

          <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">
              {t("sourcing.spendAdvisors.kpi.projectedGain", "Projected Tier Unlock Gain")}
            </span>
            <div className="mt-1 text-lg font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
              <span>{t("sourcing.spendAdvisors.currencySymbol", "$")}</span>
              <span>{kpis.projectedGain.toLocaleString()}</span>
            </div>
          </div>

          <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">
              {t("sourcing.spendAdvisors.kpi.activeOpportunities", "Move-Spend Potential")}
            </span>
            <div className="mt-1 text-lg font-bold text-blue-600 dark:text-blue-400 tabular-nums">
              <span>{t("sourcing.spendAdvisors.currencySymbol", "$")}</span>
              <span>{kpis.activeOpportunitiesBenefit.toLocaleString()}</span>
            </div>
          </div>
        </section>

        {/* 3. Navigation Tabs */}
        <nav className="flex items-center gap-2 mt-4 border-b border-slate-200 dark:border-slate-800" data-testid="spend-advisors-tabs">
          <button
            type="button"
            className={`pb-2.5 px-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === "overview"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
            data-testid="tab-overview"
            onClick={() => setActiveTab("overview")}
          >
            {t("sourcing.spendAdvisors.tabs.overview", "Advisory Cockpit")}
          </button>
          <button
            type="button"
            className={`pb-2.5 px-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === "rebate"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
            data-testid="tab-rebate-forecast"
            onClick={() => setActiveTab("rebate")}
          >
            {t("sourcing.spendAdvisors.tabs.rebateForecast", "Rebate Forecast")}
          </button>
          <button
            type="button"
            className={`pb-2.5 px-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === "moveSpend"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
            data-testid="tab-move-spend"
            onClick={() => setActiveTab("moveSpend")}
          >
            {t("sourcing.spendAdvisors.tabs.moveSpend", "Move-Spend Recommender")}
          </button>
          <button
            type="button"
            className={`pb-2.5 px-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === "whatIf"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
            data-testid="tab-what-if"
            onClick={() => setActiveTab("whatIf")}
          >
            {t("sourcing.spendAdvisors.tabs.whatIf", "Spend What-If Simulator")}
          </button>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="p-6 space-y-8 flex-1">
        {/* ========================================================================= */}
        {/* SECTION 1: REBATE FORECAST                                               */}
        {/* ========================================================================= */}
        {(activeTab === "overview" || activeTab === "rebate") && (
          <section className="space-y-4" data-testid="section-rebate-forecast">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span>{t("sourcing.spendAdvisors.rebate.title", "Rebate Forecast")}</span>
                  <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                    <span>({filteredRebates.length})</span>
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t(
                    "sourcing.spendAdvisors.rebate.subtitle",
                    "Track spend thresholds, accrued rebate cashbacks, and countdowns to next tier milestones."
                  )}
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  value={rebateSearchQuery}
                  onChange={(e) => setRebateSearchQuery(e.target.value)}
                  placeholder={t(
                    "sourcing.spendAdvisors.rebate.searchPlaceholder",
                    "Filter vendors by name, code or category..."
                  )}
                  className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  data-testid="rebate-search-input"
                />

                <select
                  value={rebateCategoryFilter}
                  onChange={(e) => setRebateCategoryFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  data-testid="rebate-category-select"
                >
                  <option value="all">
                    {t("sourcing.spendAdvisors.rebate.categoryAll", "All Commodities")}
                  </option>
                  <option value="Displays & Video">
                    {t("sourcing.spendAdvisors.categoryDisplay", "Displays & Video")}
                  </option>
                  <option value="Audio & DSP">
                    {t("sourcing.spendAdvisors.categoryAudio", "Audio & DSP")}
                  </option>
                  <option value="Control & Automation">
                    {t("sourcing.spendAdvisors.categoryControl", "Control & Automation")}
                  </option>
                  <option value="Microphones & Conferencing">
                    {t("sourcing.spendAdvisors.categoryMics", "Microphones & Conferencing")}
                  </option>
                  <option value="Infrastructure & Cabling">
                    {t("sourcing.spendAdvisors.categoryInfra", "Infrastructure & Cabling")}
                  </option>
                </select>
              </div>
            </div>

            {/* Rebate Forecast Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" data-testid="rebate-forecast-grid">
              {filteredRebates.map((item) => {
                const progressPct = Math.min(100, Math.round((item.currentSpend / item.nextTierThreshold) * 100));

                return (
                  <article
                    key={item.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between gap-4"
                    data-testid={`rebate-card-${item.vendorCode}`}
                  >
                    <div>
                      {/* Top Row: Vendor & Status Badge */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                              {item.vendorName}
                            </h3>
                            <span className="text-xs px-1.5 py-0.5 rounded font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              {item.vendorCode}
                            </span>
                          </div>
                          <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
                            {item.category}
                          </span>
                        </div>

                        <span
                          className={`text-xs px-2 py-0.5 rounded font-medium ${
                            item.status === "in_reach"
                              ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300"
                              : item.status === "on_track"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : item.status === "achieved"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          }`}
                        >
                          {item.status === "in_reach"
                            ? t("sourcing.spendAdvisors.rebate.status.in_reach", "Tier In Reach")
                            : item.status === "on_track"
                            ? t("sourcing.spendAdvisors.rebate.status.on_track", "On Track")
                            : item.status === "achieved"
                            ? t("sourcing.spendAdvisors.rebate.status.achieved", "Top Tier Achieved")
                            : t("sourcing.spendAdvisors.rebate.status.at_risk", "Gap At Risk")}
                        </span>
                      </div>

                      {/* Tier Progress Bar */}
                      <div className="mt-4 space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-medium">
                          <span className="text-slate-600 dark:text-slate-300">{item.currentTier}</span>
                          <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{item.nextTier}</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-300"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                          <span>
                            {t("sourcing.spendAdvisors.currencySymbol", "$")}
                            {item.currentSpend.toLocaleString()}
                          </span>
                          <span>
                            {t("sourcing.spendAdvisors.rebate.threshold", "Threshold")}: {t("sourcing.spendAdvisors.currencySymbol", "$")}
                            {item.nextTierThreshold.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Financial Detail Matrix */}
                      <div className="grid grid-cols-2 gap-2 mt-4 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-xs">
                        <div>
                          <span className="text-slate-500 dark:text-slate-400 block">
                            {t("sourcing.spendAdvisors.rebate.accruedValue", "Accrued Rebate")}
                          </span>
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            {t("sourcing.spendAdvisors.currencySymbol", "$")}
                            {item.accruedRebate.toLocaleString()}
                          </span>
                          <span className="text-slate-500 dark:text-slate-400 ml-1">
                            ({item.currentRebatePct}{t("sourcing.spendAdvisors.percentSymbol", "%")})
                          </span>
                        </div>

                        <div>
                          <span className="text-slate-500 dark:text-slate-400 block">
                            {t("sourcing.spendAdvisors.rebate.incrementalGain", "Incremental Gain")}
                          </span>
                          <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                            {t("sourcing.spendAdvisors.plus", "+")}{t("sourcing.spendAdvisors.currencySymbol", "$")}
                            {item.incrementalGain.toLocaleString()}
                          </span>
                          <span className="text-slate-500 dark:text-slate-400 ml-1">
                            ({item.nextTierRebatePct}{t("sourcing.spendAdvisors.percentSymbol", "%")})
                          </span>
                        </div>

                        <div>
                          <span className="text-slate-500 dark:text-slate-400 block">
                            {t("sourcing.spendAdvisors.rebate.gap", "Spend Deficit to Unlock")}
                          </span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {t("sourcing.spendAdvisors.currencySymbol", "$")}
                            {item.gapToNextTier.toLocaleString()}
                          </span>
                        </div>

                        <div>
                          <span className="text-slate-500 dark:text-slate-400 block">
                            {t("sourcing.spendAdvisors.rebate.period", "Period")} / {t("sourcing.spendAdvisors.rebate.daysRemaining", "Remaining")}
                          </span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {item.period} {t("sourcing.spendAdvisors.dash", "-")} {item.daysRemaining} {t("sourcing.spendAdvisors.days", "days")}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action: Inspect Tiers (Advisory only) */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {item.qualifyingSkus} {t("sourcing.spendAdvisors.skus", "SKUs")}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedVendorForTierDrawer(item)}
                        className="px-2.5 py-1 text-xs font-medium rounded text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors"
                        data-testid={`inspect-tier-btn-${item.vendorCode}`}
                      >
                        {t("sourcing.spendAdvisors.rebate.inspectTiers", "Inspect Tier Structure")}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* SECTION 2: MOVE-SPEND RECOMMENDER                                         */}
        {/* ========================================================================= */}
        {(activeTab === "overview" || activeTab === "moveSpend") && (
          <section className="space-y-4" data-testid="section-move-spend-recommender">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span>{t("sourcing.spendAdvisors.moveSpend.title", "Move-Spend Recommender")}</span>
                  <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                    <span>({filteredMoveSpend.length})</span>
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t(
                    "sourcing.spendAdvisors.moveSpend.subtitle",
                    "Prescriptive recommendations to reallocate uncommitted spend across suppliers to capture volume rebates and optimize margin."
                  )}
                </p>
              </div>

              {/* Impact Filter */}
              <div className="flex items-center gap-2">
                <select
                  value={moveSpendImpactFilter}
                  onChange={(e) => setMoveSpendImpactFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  data-testid="move-spend-impact-filter"
                >
                  <option value="all">
                    {t("sourcing.spendAdvisors.moveSpend.filterImpactAll", "All Impact Levels")}
                  </option>
                  <option value="high">
                    {t("sourcing.spendAdvisors.moveSpend.filterImpactHigh", "High Impact")}
                  </option>
                  <option value="medium">
                    {t("sourcing.spendAdvisors.moveSpend.filterImpactMedium", "Medium Impact")}
                  </option>
                  <option value="low">
                    {t("sourcing.spendAdvisors.moveSpend.filterImpactLow", "Low Impact")}
                  </option>
                </select>
              </div>
            </div>

            {/* Move-Spend Recommendation Cards */}
            <div className="space-y-3" data-testid="move-spend-recommendations-list">
              {filteredMoveSpend.map((rec) => {
                const isDismissed = rec.status === "dismissed";
                const isBookmarked = rec.status === "bookmarked";

                return (
                  <article
                    key={rec.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isDismissed
                        ? "border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900/40 opacity-60"
                        : isBookmarked
                        ? "border-indigo-300 dark:border-indigo-800 bg-indigo-50/20 dark:bg-indigo-950/20"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs"
                    }`}
                    data-testid={`move-spend-card-${rec.id}`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`text-xs px-2 py-0.5 rounded font-semibold ${
                              rec.impactLevel === "high"
                                ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                                : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                            }`}
                          >
                            {rec.impactLevel === "high"
                              ? t("sourcing.spendAdvisors.moveSpend.filterImpactHigh", "High Impact")
                              : t("sourcing.spendAdvisors.moveSpend.filterImpactMedium", "Medium Impact")}
                          </span>

                          <span className="text-xs px-2 py-0.5 rounded font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {rec.type === "tier_accelerator"
                              ? t("sourcing.spendAdvisors.moveSpend.types.tier_accelerator", "Tier Accelerator")
                              : rec.type === "margin_protector"
                              ? t("sourcing.spendAdvisors.moveSpend.types.margin_protector", "Margin Protector")
                              : rec.type === "rebate_capture"
                              ? t("sourcing.spendAdvisors.moveSpend.types.rebate_capture", "Rebate Capture")
                              : t("sourcing.spendAdvisors.moveSpend.types.freight_reduction", "Freight Reduction")}
                          </span>

                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {rec.category}
                          </span>
                        </div>

                        <h3 className="mt-1.5 text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {rec.title}
                        </h3>

                        {/* Rationale */}
                        <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 max-w-3xl">
                          {rec.rationale}
                        </p>
                      </div>

                      {/* Financial Impact Tile */}
                      <div className="text-right flex flex-col items-end">
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {t("sourcing.spendAdvisors.moveSpend.netBenefit", "Net Financial Gain")}
                        </span>
                        <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                          {t("sourcing.spendAdvisors.plus", "+")}{t("sourcing.spendAdvisors.currencySymbol", "$")}
                          {rec.netFinancialBenefit.toLocaleString()}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {t("sourcing.spendAdvisors.moveSpend.candidateSpend", "Candidate Spend")}: {t("sourcing.spendAdvisors.currencySymbol", "$")}
                          {rec.candidateSpendAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Routing Details: Source -> Target */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block">
                          {t("sourcing.spendAdvisors.moveSpend.sourceVendor", "Source Vendor")}
                        </span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {rec.sourceVendor}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400 block font-mono">
                          {rec.sourceVendorCode}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block">
                          {t("sourcing.spendAdvisors.moveSpend.targetVendor", "Target Vendor (Preferred)")}
                        </span>
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                          {rec.targetVendor}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400 block font-mono">
                          {rec.targetVendorCode}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block">
                          {t("sourcing.spendAdvisors.moveSpend.leadTimeDelta", "Lead Time Delta")}
                        </span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {rec.leadTimeImpactDays <= 0 ? (
                            <span>
                              {rec.leadTimeImpactDays} {t("sourcing.spendAdvisors.days", "days")}
                            </span>
                          ) : (
                            <span>
                              {t("sourcing.spendAdvisors.plus", "+")}{rec.leadTimeImpactDays} {t("sourcing.spendAdvisors.days", "days")}
                            </span>
                          )}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400 block">
                          {rec.specParity}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block">
                          {t("sourcing.spendAdvisors.moveSpend.rebateUplift", "Rebate Pool Uplift")}
                        </span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {t("sourcing.spendAdvisors.plus", "+")}{t("sourcing.spendAdvisors.currencySymbol", "$")}
                          {rec.unlockedRebateYield.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Advisory Action Bar: STRICTLY ADVISORY (NO PO OR ORDER GENERATION) */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-xs text-slate-500 dark:text-slate-400 italic">
                        {t(
                          "sourcing.spendAdvisors.moveSpend.advisoryBanner",
                          "Advisory Recommendation Only. Generating POs or altering purchase commitments requires procurement approval."
                        )}
                      </span>

                      <div className="flex items-center gap-2">
                        {/* Inspect SKUs */}
                        <button
                          type="button"
                          onClick={() => setSelectedRecForSkuDrawer(rec)}
                          className="px-2.5 py-1 text-xs font-medium rounded border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                          data-testid={`inspect-skus-btn-${rec.id}`}
                        >
                          {t("sourcing.spendAdvisors.moveSpend.actionInspect", "Inspect SKUs")}
                        </button>

                        {/* Bookmark */}
                        <button
                          type="button"
                          onClick={() => handleToggleBookmark(rec.id)}
                          className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                            isBookmarked
                              ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300"
                              : "border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                          }`}
                          data-testid={`bookmark-btn-${rec.id}`}
                        >
                          {isBookmarked
                            ? t("sourcing.spendAdvisors.moveSpend.actionBookmarked", "Bookmarked")
                            : t("sourcing.spendAdvisors.moveSpend.actionBookmark", "Bookmark Advisory")}
                        </button>

                        {/* Simulate in What-If */}
                        <button
                          type="button"
                          onClick={() => handleSimulateRecommendation(rec)}
                          className="px-3 py-1 text-xs font-medium rounded bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                          data-testid={`simulate-btn-${rec.id}`}
                        >
                          {t("sourcing.spendAdvisors.moveSpend.actionSimulate", "Simulate in What-If")}
                        </button>

                        {/* Dismiss */}
                        <button
                          type="button"
                          onClick={() => handleToggleDismiss(rec.id)}
                          className="px-2 py-1 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                          data-testid={`dismiss-btn-${rec.id}`}
                        >
                          {isDismissed
                            ? t("sourcing.spendAdvisors.moveSpend.actionDismissed", "Dismissed")
                            : t("sourcing.spendAdvisors.moveSpend.actionDismiss", "Dismiss")}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* SECTION 3: SPEND WHAT-IF SIMULATOR                                       */}
        {/* ========================================================================= */}
        {(activeTab === "overview" || activeTab === "whatIf") && (
          <section className="space-y-4" data-testid="section-what-if-simulator">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  {t("sourcing.spendAdvisors.whatIf.title", "Spend What-If Simulator")}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t(
                    "sourcing.spendAdvisors.whatIf.subtitle",
                    "Model hypothetical spend shifts, project volume variations, and evaluate margin sensitivity before committing purchase orders."
                  )}
                </p>
              </div>

              {/* Scenario Presets */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  {t("sourcing.spendAdvisors.whatIf.presetsLabel", "Scenario Presets")}:
                </span>
                <button
                  type="button"
                  onClick={() => handleApplyPreset("maxRebate")}
                  className="px-2.5 py-1 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 transition-colors"
                  data-testid="preset-max-rebate-btn"
                >
                  {t("sourcing.spendAdvisors.whatIf.presetMaxRebate", "Max Rebate Acceleration")}
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset("dsp")}
                  className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                  data-testid="preset-dsp-btn"
                >
                  {t("sourcing.spendAdvisors.whatIf.presetDsp", "Audio / DSP Consolidation")}
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset("conservative")}
                  className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                  data-testid="preset-conservative-btn"
                >
                  {t("sourcing.spendAdvisors.whatIf.presetConservative", "Baseline Conservative")}
                </button>
              </div>
            </div>

            {/* Simulator Split Cockpit: Controls vs Output Matrix */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Controls Column (5 cols) */}
              <div
                className="lg:col-span-5 p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4"
                data-testid="simulator-controls"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    {t("sourcing.spendAdvisors.whatIf.controls.title", "Simulation Parameters")}
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset("conservative")}
                    className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    data-testid="simulator-reset-btn"
                  >
                    {t("sourcing.spendAdvisors.whatIf.controls.reset", "Reset Simulation")}
                  </button>
                </div>

                {/* Target Preferred Vendor */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    {t("sourcing.spendAdvisors.whatIf.controls.targetVendor", "Target Preferred Supplier")}
                  </label>
                  <select
                    value={simVendorId}
                    onChange={(e) => setSimVendorId(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                    data-testid="simulator-vendor-select"
                  >
                    {rebateForecasts.map((v) => (
                      <option key={v.vendorCode} value={v.vendorCode}>
                        {v.vendorName} ({v.vendorCode})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Hypothetical Spend Shift Slider */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {t("sourcing.spendAdvisors.whatIf.controls.shiftAmount", "Hypothetical Spend Shift")}
                    </span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
                      {t("sourcing.spendAdvisors.currencySymbol", "$")}{simShiftAmount.toLocaleString()}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100000"
                    step="5000"
                    value={simShiftAmount}
                    onChange={(e) => setSimShiftAmount(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                    data-testid="simulator-shift-slider"
                  />
                  <div className="flex items-center justify-between text-xs text-slate-500 mt-0.5">
                    <span>{t("sourcing.spendAdvisors.currencySymbol", "$")}0</span>
                    <span>{t("sourcing.spendAdvisors.currencySymbol", "$")}50,000</span>
                    <span>{t("sourcing.spendAdvisors.currencySymbol", "$")}100,000</span>
                  </div>
                </div>

                {/* Project Volume Multiplier */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    {t("sourcing.spendAdvisors.whatIf.controls.volumeMultiplier", "Project Volume Multiplier")}
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[1.0, 1.25, 1.5, 2.0].map((mult) => (
                      <button
                        key={mult}
                        type="button"
                        onClick={() => setSimVolumeMultiplier(mult)}
                        className={`py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                          simVolumeMultiplier === mult
                            ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold"
                            : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                        }`}
                        data-testid={`volume-mult-btn-${mult}`}
                      >
                        <span>{mult}{t("sourcing.spendAdvisors.multiplierX", "x")}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Toggles */}
                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={simIncludeTierRebate}
                      onChange={(e) => setSimIncludeTierRebate(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                      data-testid="toggle-tier-rebate"
                    />
                    <span>
                      {t(
                        "sourcing.spendAdvisors.whatIf.controls.toggleTierRebate",
                        "Include Cumulative Tier Rebate Unlock"
                      )}
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={simApplyEarlyPay}
                      onChange={(e) => setSimApplyEarlyPay(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                      data-testid="toggle-early-pay"
                    />
                    <span>
                      {t(
                        "sourcing.spendAdvisors.whatIf.controls.toggleEarlyPay",
                        "Apply Early Payment Discount (2% 10 Net 30)"
                      )}
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={simIncludeFreightBuffer}
                      onChange={(e) => setSimIncludeFreightBuffer(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                      data-testid="toggle-freight-buffer"
                    />
                    <span>
                      {t(
                        "sourcing.spendAdvisors.whatIf.controls.toggleFreightSurcharge",
                        "Expedited Logistics Buffer (+5%)"
                      )}
                    </span>
                  </label>
                </div>
              </div>

              {/* Output Results Matrix Column (7 cols) */}
              <div
                className="lg:col-span-7 p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between gap-5"
                data-testid="simulator-results-panel"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        {t("sourcing.spendAdvisors.whatIf.results.title", "Simulated Financial Impact")}
                      </h3>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {simVendor.vendorName} ({simVendor.category})
                      </span>
                    </div>

                    {simulationResults.tierUnlocked && (
                      <span
                        className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold text-xs animate-pulse"
                        data-testid="tier-unlocked-badge"
                      >
                        {t("sourcing.spendAdvisors.whatIf.results.tierUnlockedBadge", "New Rebate Tier Unlocked")}
                      </span>
                    )}
                  </div>

                  {/* Impact Tiles Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                      <span className="text-xs text-slate-500 dark:text-slate-400 block">
                        {t("sourcing.spendAdvisors.whatIf.results.baselineSpend", "Baseline Cumulative Spend")}
                      </span>
                      <span className="text-sm font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                        {t("sourcing.spendAdvisors.currencySymbol", "$")}{simulationResults.baselineSpend.toLocaleString()}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                      <span className="text-xs text-slate-500 dark:text-slate-400 block">
                        {t("sourcing.spendAdvisors.whatIf.results.simulatedSpend", "Simulated Total Spend")}
                      </span>
                      <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
                        {t("sourcing.spendAdvisors.currencySymbol", "$")}{simulationResults.simulatedSpend.toLocaleString()}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                      <span className="text-xs text-slate-500 dark:text-slate-400 block">
                        {t("sourcing.spendAdvisors.whatIf.results.rebateDelta", "Net Rebate Yield Delta")}
                      </span>
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                        {t("sourcing.spendAdvisors.plus", "+")}{t("sourcing.spendAdvisors.currencySymbol", "$")}{simulationResults.rebateDelta.toLocaleString()}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                      <span className="text-xs text-slate-500 dark:text-slate-400 block">
                        {t("sourcing.spendAdvisors.whatIf.results.netCost", "Net Sourcing Outlay")}
                      </span>
                      <span className="text-sm font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                        {t("sourcing.spendAdvisors.currencySymbol", "$")}{simulationResults.netOutlay.toLocaleString()}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                      <span className="text-xs text-emerald-800 dark:text-emerald-300 block font-medium">
                        {t("sourcing.spendAdvisors.whatIf.results.netSavings", "Net Financial Improvement")}
                      </span>
                      <span className="text-base font-extrabold text-emerald-700 dark:text-emerald-300 tabular-nums">
                        {t("sourcing.spendAdvisors.plus", "+")}{t("sourcing.spendAdvisors.currencySymbol", "$")}{simulationResults.netImprovement.toLocaleString()}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800">
                      <span className="text-xs text-indigo-800 dark:text-indigo-300 block font-medium">
                        {t("sourcing.spendAdvisors.whatIf.results.marginImpact", "Effective Margin Uplift")}
                      </span>
                      <span className="text-base font-extrabold text-indigo-700 dark:text-indigo-300 tabular-nums">
                        {t("sourcing.spendAdvisors.plus", "+")}{simulationResults.effectiveMarginUplift}{t("sourcing.spendAdvisors.percentSymbol", "%")}
                      </span>
                    </div>
                  </div>

                  {/* Supplementary simulation line items if activated */}
                  {(simApplyEarlyPay || simIncludeFreightBuffer) && (
                    <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-600 dark:text-slate-300">
                      {simApplyEarlyPay && (
                        <span>
                          {t("sourcing.spendAdvisors.whatIf.results.earlyPayGain", "Early Payment Discount Yield")}: {t("sourcing.spendAdvisors.plus", "+")}{t("sourcing.spendAdvisors.currencySymbol", "$")}{simulationResults.earlyPayYield.toLocaleString()}
                        </span>
                      )}
                      {simIncludeFreightBuffer && (
                        <span className="text-rose-600 dark:text-rose-400">
                          {t("sourcing.spendAdvisors.whatIf.results.freightBufferCost", "Logistics Buffer Cost")}: {t("sourcing.spendAdvisors.dash", "-")}{t("sourcing.spendAdvisors.currencySymbol", "$")}{simulationResults.freightBufferCost.toLocaleString()}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom Insight Box */}
                <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs">
                  <span className="font-semibold text-slate-900 dark:text-slate-100 block mb-1">
                    {t("sourcing.spendAdvisors.whatIf.results.insightTitle", "Simulation Advisory Insight")}
                  </span>
                  <p className="text-slate-600 dark:text-slate-300">
                    {t(
                      "sourcing.spendAdvisors.whatIf.results.insightText",
                      "Simulating this spend reallocation captures higher retroactive rebates across qualifying orders without introducing supplier delivery bottlenecks."
                    )}
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* ========================================================================= */}
      {/* DRAWER 1: REBATE TIER DETAILS DRAWER                                      */}
      {/* ========================================================================= */}
      {selectedVendorForTierDrawer && (
        <aside
          className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl z-50 p-6 flex flex-col justify-between"
          data-testid="rebate-tier-drawer"
        >
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {t("sourcing.spendAdvisors.rebate.drawer.title", "Vendor Rebate Agreement Structure")}
                </h3>
                <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                  {selectedVendorForTierDrawer.vendorName} ({selectedVendorForTierDrawer.vendorCode})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVendorForTierDrawer(null)}
                className="text-xs px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                data-testid="close-tier-drawer-btn"
              >
                {t("sourcing.spendAdvisors.rebate.drawer.close", "Close Details")}
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {/* Tiers Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="border-b border-slate-200 dark:border-slate-700 text-slate-500 font-medium">
                    <tr>
                      <th className="py-2">{t("sourcing.spendAdvisors.rebate.drawer.tierName", "Tier Name")}</th>
                      <th className="py-2 text-right">{t("sourcing.spendAdvisors.rebate.drawer.spendThreshold", "Spend Threshold")}</th>
                      <th className="py-2 text-right">{t("sourcing.spendAdvisors.rebate.drawer.rebatePercentage", "Rebate %")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {selectedVendorForTierDrawer.tiers.map((tier) => (
                      <tr key={tier.name}>
                        <td className="py-2 font-medium text-slate-900 dark:text-slate-100">{tier.name}</td>
                        <td className="py-2 text-right tabular-nums text-slate-700 dark:text-slate-300">
                          {t("sourcing.spendAdvisors.currencySymbol", "$")}{tier.threshold.toLocaleString()}
                        </td>
                        <td className="py-2 text-right font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                          {tier.rebatePct}{t("sourcing.spendAdvisors.percentSymbol", "%")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Scope & Terms */}
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 space-y-2 text-xs">
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                    {t("sourcing.spendAdvisors.rebate.drawer.qualifyingCategories", "Qualifying Commodity Scope")}
                  </span>
                  <span className="text-slate-600 dark:text-slate-400">
                    {selectedVendorForTierDrawer.category} ({selectedVendorForTierDrawer.qualifyingSkus} {t("sourcing.spendAdvisors.skus", "SKUs")})
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                    {t("sourcing.spendAdvisors.rebate.drawer.agreementNotes", "Contractual Terms & Governance")}
                  </span>
                  <span className="text-slate-600 dark:text-slate-400">
                    {selectedVendorForTierDrawer.agreementTerms}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-center">
            <button
              type="button"
              onClick={() => setSelectedVendorForTierDrawer(null)}
              className="w-full py-2 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              {t("sourcing.spendAdvisors.rebate.drawer.close", "Close Details")}
            </button>
          </div>
        </aside>
      )}

      {/* ========================================================================= */}
      {/* DRAWER 2: MOVE-SPEND SKU BREAKDOWN DRAWER                                 */}
      {/* ========================================================================= */}
      {selectedRecForSkuDrawer && (
        <aside
          className="fixed inset-y-0 right-0 w-full max-w-lg bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl z-50 p-6 flex flex-col justify-between"
          data-testid="move-spend-sku-drawer"
        >
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {t("sourcing.spendAdvisors.moveSpend.drawer.title", "Candidate SKU Shift Breakdown")}
                </h3>
                <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                  {selectedRecForSkuDrawer.title}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRecForSkuDrawer(null)}
                className="text-xs px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                data-testid="close-sku-drawer-btn"
              >
                {t("sourcing.spendAdvisors.moveSpend.drawer.close", "Close SKU Breakdown")}
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="border-b border-slate-200 dark:border-slate-700 text-slate-500 font-medium">
                    <tr>
                      <th className="py-2">{t("sourcing.spendAdvisors.moveSpend.drawer.sku", "SKU Identifier")}</th>
                      <th className="py-2 text-right">{t("sourcing.spendAdvisors.moveSpend.drawer.qty", "Quantity")}</th>
                      <th className="py-2 text-right">{t("sourcing.spendAdvisors.moveSpend.drawer.sourcePrice", "Source Unit Price")}</th>
                      <th className="py-2 text-right">{t("sourcing.spendAdvisors.moveSpend.drawer.targetPrice", "Target Unit Price")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {selectedRecForSkuDrawer.skuDetails.map((sku) => (
                      <tr key={sku.sku}>
                        <td className="py-2">
                          <span className="font-mono font-medium text-slate-900 dark:text-slate-100 block">{sku.sku}</span>
                          <span className="text-slate-500 text-xs">{sku.description}</span>
                        </td>
                        <td className="py-2 text-right font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                          {sku.qty}
                        </td>
                        <td className="py-2 text-right text-slate-600 dark:text-slate-400 tabular-nums">
                          {t("sourcing.spendAdvisors.currencySymbol", "$")}{sku.sourcePrice.toLocaleString()}
                        </td>
                        <td className="py-2 text-right font-medium text-indigo-600 dark:text-indigo-400 tabular-nums">
                          {t("sourcing.spendAdvisors.currencySymbol", "$")}{sku.targetPrice.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Rationale reminder */}
              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200 block mb-1">
                  {t("sourcing.spendAdvisors.moveSpend.rationale", "Advisory Rationale")}
                </span>
                <p className="text-slate-600 dark:text-slate-400">{selectedRecForSkuDrawer.rationale}</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-center">
            <button
              type="button"
              onClick={() => setSelectedRecForSkuDrawer(null)}
              className="w-full py-2 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              {t("sourcing.spendAdvisors.moveSpend.drawer.close", "Close SKU Breakdown")}
            </button>
          </div>
        </aside>
      )}
    </div>
  );
}
