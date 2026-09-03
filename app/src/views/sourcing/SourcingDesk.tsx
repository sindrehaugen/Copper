import React, { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";

export type SupplierTier = "preferred" | "approved" | "standard" | "under_review";
export type PriceIndex = "budget" | "competitive" | "premium";
export type TcoRecommendationTag = "best_value" | "hidden_costs" | "secondary_source";
export type SyncFeedStatus = "synced" | "syncing" | "delayed" | "error";

export interface SupplierRankingItem {
  id: string;
  rank: number;
  supplierName: string;
  code: string;
  category: string;
  compositeScore: number;
  leadTimeDays: number;
  otdRate: number;
  qualityRating: number;
  priceIndex: PriceIndex;
  rebatePercentage: number;
  status: SupplierTier;
  activeSkusCount: number;
  contactEmail: string;
}

export interface TcoCostBreakdown {
  supplierId: string;
  supplierName: string;
  basePrice: number;
  freightCost: number;
  dutiesAndTariffs: number;
  holdingCost: number;
  warrantyRiskCost: number;
  rebateDiscount: number;
  netTco: number;
  leadTimeDays: number;
  recommendationTag: TcoRecommendationTag;
}

export interface TcoScenario {
  id: string;
  name: string;
  description: string;
  targetQuantity: number;
  options: TcoCostBreakdown[];
}

export interface VendorSyncFeed {
  id: string;
  vendorName: string;
  status: SyncFeedStatus;
  lastSync: string;
  skuCount: number;
  errorCount: number;
  feedType: "API" | "EDI" | "FTP";
}

export interface CatalogSyncStatus {
  overallHealth: "healthy" | "syncing" | "degraded";
  lastSyncTimestamp: string;
  totalSyncedSkus: number;
  connectedFeedsCount: number;
  totalFeedsCount: number;
  feeds: VendorSyncFeed[];
}

export interface SourcingDeskProps {
  title?: string;
  className?: string;
  onNavigate?: (path: string, entity?: any) => void;
  "data-entity-type"?: string;
  "data-entity-id"?: string;
  initialRankings?: SupplierRankingItem[];
  initialTcoScenarios?: TcoScenario[];
  initialSyncStatus?: CatalogSyncStatus;
}

export const DEFAULT_SUPPLIER_RANKINGS: SupplierRankingItem[] = [
  {
    id: "sup-apex-01",
    rank: 1,
    supplierName: "Apex Distributing",
    code: "APEX-DIST-01",
    category: "Displays & Video",
    compositeScore: 96.4,
    leadTimeDays: 2,
    otdRate: 98.5,
    qualityRating: 4.9,
    priceIndex: "competitive",
    rebatePercentage: 4.5,
    status: "preferred",
    activeSkusCount: 4820,
    contactEmail: "orders@apexdist.example.com",
  },
  {
    id: "sup-gavl-02",
    rank: 2,
    supplierName: "Global AV Logistics",
    code: "GAVL-CORP-02",
    category: "Audio & DSP",
    compositeScore: 92.1,
    leadTimeDays: 3,
    otdRate: 95.8,
    qualityRating: 4.7,
    priceIndex: "competitive",
    rebatePercentage: 3.5,
    status: "approved",
    activeSkusCount: 3450,
    contactEmail: "supply@globalav.example.com",
  },
  {
    id: "sup-dse-03",
    rank: 3,
    supplierName: "DirectSource Electronics",
    code: "DSE-DIRECT-03",
    category: "Displays & Video",
    compositeScore: 87.8,
    leadTimeDays: 5,
    otdRate: 91.2,
    qualityRating: 4.3,
    priceIndex: "budget",
    rebatePercentage: 2.0,
    status: "standard",
    activeSkusCount: 5120,
    contactEmail: "quotes@directsource.example.com",
  },
  {
    id: "sup-ppi-04",
    rank: 4,
    supplierName: "Pacific Pro Infrastructure",
    code: "PPI-RACK-04",
    category: "Infrastructure & Racks",
    compositeScore: 85.3,
    leadTimeDays: 4,
    otdRate: 93.0,
    qualityRating: 4.6,
    priceIndex: "competitive",
    rebatePercentage: 2.5,
    status: "approved",
    activeSkusCount: 2190,
    contactEmail: "ops@pacificpro.example.com",
  },
  {
    id: "sup-nuc-05",
    rank: 5,
    supplierName: "Nordic UC Systems",
    code: "NUC-NORDIC-05",
    category: "Unified Comms",
    compositeScore: 81.0,
    leadTimeDays: 7,
    otdRate: 88.4,
    qualityRating: 4.1,
    priceIndex: "premium",
    rebatePercentage: 1.5,
    status: "under_review",
    activeSkusCount: 1430,
    contactEmail: "contact@nordicuc.example.com",
  },
];

export const DEFAULT_TCO_SCENARIOS: TcoScenario[] = [
  {
    id: "scenario-boardroom",
    name: "Enterprise Boardroom Video & Audio BOM (12 Rooms)",
    description: "12x Dual 85 inch 4K Displays, PTZ Framing Cameras, DSP Amplifiers, Ceiling Mic Arrays",
    targetQuantity: 12,
    options: [
      {
        supplierId: "sup-apex-01",
        supplierName: "Apex Distributing",
        basePrice: 42500,
        freightCost: 1200,
        dutiesAndTariffs: 0,
        holdingCost: 450,
        warrantyRiskCost: 380,
        rebateDiscount: 1912,
        netTco: 42618,
        leadTimeDays: 2,
        recommendationTag: "best_value",
      },
      {
        supplierId: "sup-dse-03",
        supplierName: "DirectSource Electronics",
        basePrice: 39800,
        freightCost: 2800,
        dutiesAndTariffs: 850,
        holdingCost: 1150,
        warrantyRiskCost: 1420,
        rebateDiscount: 796,
        netTco: 45224,
        leadTimeDays: 5,
        recommendationTag: "hidden_costs",
      },
      {
        supplierId: "sup-gavl-02",
        supplierName: "Global AV Logistics",
        basePrice: 41200,
        freightCost: 1600,
        dutiesAndTariffs: 0,
        holdingCost: 680,
        warrantyRiskCost: 650,
        rebateDiscount: 1442,
        netTco: 42688,
        leadTimeDays: 3,
        recommendationTag: "secondary_source",
      },
    ],
  },
  {
    id: "scenario-auditorium",
    name: "Campus Auditorium Dual 4K LED Display Package",
    description: "0.9mm MicroLED Video Wall, High-Efficiency Power Racks, Redundant Processors",
    targetQuantity: 2,
    options: [
      {
        supplierId: "sup-apex-01",
        supplierName: "Apex Distributing",
        basePrice: 118000,
        freightCost: 3500,
        dutiesAndTariffs: 0,
        holdingCost: 1200,
        warrantyRiskCost: 1100,
        rebateDiscount: 5310,
        netTco: 118490,
        leadTimeDays: 4,
        recommendationTag: "best_value",
      },
      {
        supplierId: "sup-ppi-04",
        supplierName: "Pacific Pro Infrastructure",
        basePrice: 122000,
        freightCost: 4100,
        dutiesAndTariffs: 1200,
        holdingCost: 1850,
        warrantyRiskCost: 1900,
        rebateDiscount: 3050,
        netTco: 128000,
        leadTimeDays: 6,
        recommendationTag: "secondary_source",
      },
    ],
  },
];

export const DEFAULT_CATALOG_SYNC_STATUS: CatalogSyncStatus = {
  overallHealth: "healthy",
  lastSyncTimestamp: "2026-09-03T09:30:00Z",
  totalSyncedSkus: 17010,
  connectedFeedsCount: 5,
  totalFeedsCount: 5,
  feeds: [
    {
      id: "feed-wesco",
      vendorName: "Wesco / Anixter",
      status: "synced",
      lastSync: "12m ago",
      skuCount: 8450,
      errorCount: 0,
      feedType: "EDI",
    },
    {
      id: "feed-tdsynnex",
      vendorName: "TD Synnex AV",
      status: "synced",
      lastSync: "18m ago",
      skuCount: 4210,
      errorCount: 0,
      feedType: "API",
    },
    {
      id: "feed-ingram",
      vendorName: "Ingram Micro Pro",
      status: "synced",
      lastSync: "25m ago",
      skuCount: 2650,
      errorCount: 0,
      feedType: "API",
    },
    {
      id: "feed-crestron",
      vendorName: "Crestron Direct",
      status: "synced",
      lastSync: "1h ago",
      skuCount: 1120,
      errorCount: 0,
      feedType: "EDI",
    },
    {
      id: "feed-biamp",
      vendorName: "Biamp Systems Feed",
      status: "synced",
      lastSync: "2h ago",
      skuCount: 580,
      errorCount: 0,
      feedType: "FTP",
    },
  ],
};

export function SourcingDesk({
  title,
  className = "",
  "data-entity-type": dataEntityType = "SOURCING",
  "data-entity-id": dataEntityId = "sourcing-desk",
  initialRankings = DEFAULT_SUPPLIER_RANKINGS,
  initialTcoScenarios = DEFAULT_TCO_SCENARIOS,
  initialSyncStatus = DEFAULT_CATALOG_SYNC_STATUS,
}: SourcingDeskProps) {
  const { t } = useTranslation();

  // Navigation & active views
  const [activeTab, setActiveTab] = useState<"all" | "rank" | "tco" | "sync">("all");

  // Sync state
  const [syncStatus, setSyncStatus] = useState<CatalogSyncStatus>(initialSyncStatus);
  const [showFeedDetails, setShowFeedDetails] = useState<boolean>(false);
  const [syncTriggerMessage, setSyncTriggerMessage] = useState<string>("");

  // Supplier ranking state
  const [rankings] = useState<SupplierRankingItem[]>(initialRankings);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"rank" | "score" | "leadTime" | "otd" | "rebate">("rank");
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);

  // TCO Comparator state
  const [scenarios] = useState<TcoScenario[]>(initialTcoScenarios);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(
    initialTcoScenarios[0]?.id || "scenario-boardroom"
  );
  const [expeditedShipping, setExpeditedShipping] = useState<boolean>(false);
  const [applyRebates, setApplyRebates] = useState<boolean>(true);
  const [selectedAwardSupplierId, setSelectedAwardSupplierId] = useState<string | null>(null);

  // Sync Action Handler
  const handleTriggerSync = useCallback(() => {
    setSyncStatus((prev) => ({
      ...prev,
      overallHealth: "syncing",
      lastSyncTimestamp: new Date().toISOString(),
    }));
    setSyncTriggerMessage(t("sourcing.sync.syncTriggered", "Synchronization job dispatched to pipeline worker."));

    setTimeout(() => {
      setSyncStatus((prev) => ({
        ...prev,
        overallHealth: "healthy",
      }));
    }, 800);
  }, [t]);

  // Ranking filtering & sorting
  const filteredRankings = useMemo(() => {
    return rankings
      .filter((item) => {
        if (categoryFilter !== "all" && item.category !== categoryFilter) return false;
        if (tierFilter !== "all" && item.status !== tierFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matches =
            item.supplierName.toLowerCase().includes(q) ||
            item.code.toLowerCase().includes(q) ||
            item.category.toLowerCase().includes(q);
          if (!matches) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "rank") return a.rank - b.rank;
        if (sortBy === "score") return b.compositeScore - a.compositeScore;
        if (sortBy === "leadTime") return a.leadTimeDays - b.leadTimeDays;
        if (sortBy === "otd") return b.otdRate - a.otdRate;
        if (sortBy === "rebate") return b.rebatePercentage - a.rebatePercentage;
        return 0;
      });
  }, [rankings, categoryFilter, tierFilter, searchQuery, sortBy]);

  // Selected supplier details
  const selectedSupplier = useMemo(() => {
    if (!selectedSupplierId) return null;
    return rankings.find((s) => s.id === selectedSupplierId) || null;
  }, [rankings, selectedSupplierId]);

  // Active TCO scenario
  const currentScenario = useMemo(() => {
    return scenarios.find((sc) => sc.id === selectedScenarioId) || scenarios[0];
  }, [scenarios, selectedScenarioId]);

  // Evaluated TCO options based on toggles
  const evaluatedTcoOptions = useMemo(() => {
    if (!currentScenario) return [];
    return currentScenario.options.map((opt) => {
      const freight = expeditedShipping ? Math.round(opt.freightCost * 1.25) : opt.freightCost;
      const leadTime = expeditedShipping ? Math.max(1, Math.round(opt.leadTimeDays * 0.5)) : opt.leadTimeDays;
      const holding = expeditedShipping ? Math.round(opt.holdingCost * 0.5) : opt.holdingCost;
      const rebate = applyRebates ? opt.rebateDiscount : 0;
      const calculatedNet = opt.basePrice + freight + opt.dutiesAndTariffs + holding + opt.warrantyRiskCost - rebate;

      return {
        ...opt,
        freightCost: freight,
        leadTimeDays: leadTime,
        holdingCost: holding,
        rebateDiscount: rebate,
        netTco: calculatedNet,
      };
    });
  }, [currentScenario, expeditedShipping, applyRebates]);

  // KPI calculations for rankings
  const kpiStats = useMemo(() => {
    const total = rankings.length;
    const avgScore = total > 0 ? (rankings.reduce((sum, r) => sum + r.compositeScore, 0) / total).toFixed(1) : "0";
    const avgLeadTime = total > 0 ? (rankings.reduce((sum, r) => sum + r.leadTimeDays, 0) / total).toFixed(1) : "0";
    const preferredCount = rankings.filter((r) => r.status === "preferred").length;
    return { total, avgScore, avgLeadTime, preferredCount };
  }, [rankings]);

  return (
    <div
      className={`flex flex-col h-full w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-y-auto ${className}`}
      data-testid="sourcing-desk-surface"
      data-entity-type={dataEntityType}
      data-entity-id={dataEntityId}
    >
      {/* Header Bar */}
      <header className="flex-none p-5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono text-xs font-semibold">
                {t("sourcing.badge", "SOURCING")}
              </span>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                {title || t("sourcing.title", "Strategic Sourcing Desk")}
              </h1>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {t(
                "sourcing.subtitle",
                "Supplier ranking intelligence, Total Cost of Ownership (TCO) simulation, and multi-vendor catalog synchronization."
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className="text-xs font-mono px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
              data-testid="endpoint-rank"
            >
              {t("sourcing.endpointRank", "/api/sourcing/rank")}
            </span>
            <span
              className="text-xs font-mono px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
              data-testid="endpoint-tco"
            >
              {t("sourcing.endpointTco", "/api/sourcing/tco")}
            </span>
            <span
              className="text-xs font-mono px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
              data-testid="endpoint-sync"
            >
              {t("sourcing.endpointSync", "/api/sourcing/catalog-sync")}
            </span>
          </div>
        </div>

        {/* View Tabs */}
        <nav className="flex items-center gap-2 mt-4 border-b border-slate-200 dark:border-slate-800">
          <button
            type="button"
            className={`pb-2.5 px-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === "all"
                ? "border-emerald-600 text-emerald-600 dark:text-emerald-400 dark:border-emerald-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
            data-testid="tab-overview"
            onClick={() => setActiveTab("all")}
          >
            {t("sourcing.tabs.all", "Overview")}
          </button>
          <button
            type="button"
            className={`pb-2.5 px-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === "rank"
                ? "border-emerald-600 text-emerald-600 dark:text-emerald-400 dark:border-emerald-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
            data-testid="tab-ranking"
            onClick={() => setActiveTab("rank")}
          >
            {t("sourcing.tabs.rank", "Supplier Rankings")}
          </button>
          <button
            type="button"
            className={`pb-2.5 px-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === "tco"
                ? "border-emerald-600 text-emerald-600 dark:text-emerald-400 dark:border-emerald-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
            data-testid="tab-tco"
            onClick={() => setActiveTab("tco")}
          >
            {t("sourcing.tabs.tco", "TCO Comparator")}
          </button>
          <button
            type="button"
            className={`pb-2.5 px-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === "sync"
                ? "border-emerald-600 text-emerald-600 dark:text-emerald-400 dark:border-emerald-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
            data-testid="tab-sync"
            onClick={() => setActiveTab("sync")}
          >
            {t("sourcing.tabs.sync", "Catalog Sync Feeds")}
          </button>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="p-6 space-y-6 flex-1">
        {/* 1. Catalog Sync Status Indicator / Banner */}
        {(activeTab === "all" || activeTab === "sync") && (
          <section
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs"
            data-testid="catalog-sync-banner"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    syncStatus.overallHealth === "healthy"
                      ? "bg-emerald-500"
                      : syncStatus.overallHealth === "syncing"
                      ? "bg-blue-500 animate-ping"
                      : "bg-amber-500"
                  }`}
                  data-testid="catalog-sync-indicator"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {t("sourcing.sync.title", "Catalog Synchronization Status")}
                    </h2>
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-medium ${
                        syncStatus.overallHealth === "healthy"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : syncStatus.overallHealth === "syncing"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                      }`}
                      data-testid="catalog-sync-status-badge"
                    >
                      {syncStatus.overallHealth === "healthy"
                        ? t("sourcing.sync.statusHealthy", "Healthy / Up-to-Date")
                        : syncStatus.overallHealth === "syncing"
                        ? t("sourcing.sync.statusSyncing", "Synchronizing Feeds...")
                        : t("sourcing.sync.statusDegraded", "Sync Degraded")}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {t("sourcing.sync.subtitle", "Real-time pricing feeds and vendor catalog parity")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6 text-xs text-slate-600 dark:text-slate-300">
                <div>
                  <span className="block text-slate-400 dark:text-slate-500">
                    {t("sourcing.sync.lastSyncLabel", "Last Synced")}
                  </span>
                  <span className="font-medium" data-testid="catalog-last-sync">
                    {syncStatus.lastSyncTimestamp}
                  </span>
                </div>
                <div>
                  <span className="block text-slate-400 dark:text-slate-500">
                    {t("sourcing.sync.totalSkusLabel", "Active Catalog SKUs")}
                  </span>
                  <span className="font-medium" data-testid="catalog-total-skus">
                    {syncStatus.totalSyncedSkus.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="block text-slate-400 dark:text-slate-500">
                    {t("sourcing.sync.activeFeedsLabel", "Feeds Online")}
                  </span>
                  <span className="font-medium" data-testid="catalog-active-feeds">
                    {syncStatus.connectedFeedsCount}
                    {t("sourcing.slash", "/")}
                    {syncStatus.totalFeedsCount}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
                    data-testid="btn-sync-now"
                    onClick={handleTriggerSync}
                  >
                    {t("sourcing.sync.syncNow", "Sync Feeds Now")}
                  </button>
                  <button
                    type="button"
                    className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    data-testid="btn-toggle-sync-details"
                    onClick={() => setShowFeedDetails((prev) => !prev)}
                  >
                    {showFeedDetails
                      ? t("sourcing.sync.hideDetails", "Hide Feed Details")
                      : t("sourcing.sync.toggleDetails", "Show Feed Details")}
                  </button>
                </div>
              </div>
            </div>

            {syncTriggerMessage && (
              <div
                className="mt-3 p-2.5 text-xs rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                data-testid="sync-trigger-message"
              >
                {syncTriggerMessage}
              </div>
            )}

            {showFeedDetails && (
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 overflow-x-auto" data-testid="sync-feeds-detail-table">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                      <th className="pb-2 font-medium">{t("sourcing.sync.vendor", "Vendor Feed")}</th>
                      <th className="pb-2 font-medium">{t("sourcing.sync.protocol", "Protocol")}</th>
                      <th className="pb-2 font-medium">{t("sourcing.sync.skuCount", "SKUs Indexed")}</th>
                      <th className="pb-2 font-medium">{t("sourcing.sync.lastSyncLabel", "Last Synced")}</th>
                      <th className="pb-2 font-medium">{t("sourcing.sync.feedStatus", "Feed Status")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {syncStatus.feeds.map((feed) => (
                      <tr key={feed.id} data-testid={`sync-feed-row-${feed.id}`}>
                        <td className="py-2.5 font-medium text-slate-800 dark:text-slate-200">{feed.vendorName}</td>
                        <td className="py-2.5 font-mono text-slate-500">{feed.feedType}</td>
                        <td className="py-2.5 text-slate-600 dark:text-slate-300">{feed.skuCount.toLocaleString()}</td>
                        <td className="py-2.5 text-slate-500">{feed.lastSync}</td>
                        <td className="py-2.5">
                          <span
                            className={`px-2 py-0.5 rounded text-2xs font-semibold ${
                              feed.status === "synced"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                            }`}
                          >
                            {feed.status === "synced"
                              ? t("sourcing.sync.synced", "Synchronized")
                              : t("sourcing.sync.syncing", "In Progress")}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* 2. Supplier Ranking Section */}
        {(activeTab === "all" || activeTab === "rank") && (
          <section
            className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4"
            data-testid="supplier-ranking-section"
          >
            {/* Section Header & KPIs */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {t("sourcing.rank.title", "Supplier Ranking")}
                  </h2>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {t("sourcing.endpointRank", "/api/sourcing/rank")}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {t(
                    "sourcing.rank.subtitle",
                    "Algorithmic composite ranking based on delivery SLA, quality history, and price competitiveness."
                  )}
                </p>
              </div>

              {/* KPI metrics */}
              <div className="flex items-center gap-4 text-xs">
                <div className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400 block">
                    {t("sourcing.rank.totalSuppliers", "Active Ranked Suppliers")}
                  </span>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-100" data-testid="kpi-total-suppliers">
                    {kpiStats.total}
                  </span>
                </div>
                <div className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400 block">
                    {t("sourcing.rank.avgScore", "Average Score")}
                  </span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400" data-testid="kpi-avg-score">
                    {kpiStats.avgScore}
                  </span>
                </div>
                <div className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400 block">
                    {t("sourcing.rank.preferredSuppliers", "Preferred Partners")}
                  </span>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400" data-testid="kpi-preferred-count">
                    {kpiStats.preferredCount}
                  </span>
                </div>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <input
                type="text"
                placeholder={t("sourcing.rank.searchPlaceholder", "Filter suppliers by name, code or category...")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 min-w-[240px] px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                data-testid="input-supplier-search"
              />

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                data-testid="select-supplier-category"
              >
                <option value="all">{t("sourcing.rank.categoryAll", "All Commodities")}</option>
                <option value="Displays & Video">{t("sourcing.rank.categoryDisplay", "Displays & Video")}</option>
                <option value="Audio & DSP">{t("sourcing.rank.categoryAudio", "Audio & DSP")}</option>
                <option value="Unified Comms">{t("sourcing.rank.categoryUc", "Unified Comms")}</option>
                <option value="Infrastructure & Racks">{t("sourcing.rank.categoryInfra", "Infrastructure & Racks")}</option>
              </select>

              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                data-testid="select-supplier-tier"
              >
                <option value="all">{t("sourcing.rank.tierAll", "All Tiers")}</option>
                <option value="preferred">{t("sourcing.rank.status.preferred", "Preferred Partner")}</option>
                <option value="approved">{t("sourcing.rank.status.approved", "Approved Supplier")}</option>
                <option value="standard">{t("sourcing.rank.status.standard", "Standard Vendor")}</option>
                <option value="under_review">{t("sourcing.rank.status.under_review", "Under Review")}</option>
              </select>

              <div className="flex items-center gap-1 text-xs text-slate-500">
                <span>{t("sourcing.rank.sortBy", "Sort by:")}</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  data-testid="select-supplier-sort"
                >
                  <option value="rank">{t("sourcing.rank.sortRank", "Rank (Best First)")}</option>
                  <option value="score">{t("sourcing.rank.sortScore", "Score (High to Low)")}</option>
                  <option value="leadTime">{t("sourcing.rank.sortLeadTime", "Lead Time (Fastest First)")}</option>
                  <option value="otd">{t("sourcing.rank.sortOtd", "On-Time Delivery (Highest First)")}</option>
                  <option value="rebate">{t("sourcing.rank.sortRebate", "Rebate Tier (Highest First)")}</option>
                </select>
              </div>
            </div>

            {/* Ranking Table */}
            <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs" data-testid="supplier-ranking-table">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 font-medium">
                  <tr>
                    <th className="py-3 px-3">{t("sourcing.table.rank", "Rank")}</th>
                    <th className="py-3 px-3">{t("sourcing.table.supplier", "Supplier")}</th>
                    <th className="py-3 px-3">{t("sourcing.table.category", "Commodity")}</th>
                    <th className="py-3 px-3">{t("sourcing.table.score", "Sourcing Score")}</th>
                    <th className="py-3 px-3">{t("sourcing.table.leadTime", "Lead Time")}</th>
                    <th className="py-3 px-3">{t("sourcing.table.otd", "On-Time Delivery")}</th>
                    <th className="py-3 px-3">{t("sourcing.table.pricingIndex", "Price Level")}</th>
                    <th className="py-3 px-3">{t("sourcing.table.rebate", "Rebate Tier")}</th>
                    <th className="py-3 px-3">{t("sourcing.table.status", "Status")}</th>
                    <th className="py-3 px-3 text-right">{t("sourcing.table.actions", "Actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredRankings.map((item) => {
                    const isSelected = selectedSupplierId === item.id;
                    return (
                      <tr
                        key={item.id}
                        data-testid={`supplier-row-${item.id}`}
                        onClick={() => setSelectedSupplierId(isSelected ? null : item.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-emerald-50/70 dark:bg-emerald-950/30"
                            : "hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                        }`}
                      >
                        <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-100">
                          <span
                            className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${
                              item.rank === 1
                                ? "bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200"
                                : item.rank === 2
                                ? "bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200"
                                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                            }`}
                            data-testid={`supplier-rank-badge-${item.id}`}
                          >
                            {t("sourcing.rankPrefix", "#")}
                            {item.rank}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-900 dark:text-slate-100" data-testid={`supplier-name-${item.id}`}>
                            {item.supplierName}
                          </div>
                          <div className="text-2xs text-slate-500 font-mono">
                            {item.code}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                          {item.category}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900 dark:text-slate-100" data-testid={`supplier-score-${item.id}`}>
                              {item.compositeScore}
                            </span>
                            <span className="text-2xs text-slate-400">
                              {t("sourcing.scoreOutOf", "/ 100")}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-700 dark:text-slate-300" data-testid={`supplier-leadtime-${item.id}`}>
                          {item.leadTimeDays}
                          <span className="ml-1 text-slate-400">{t("sourcing.days", "days")}</span>
                        </td>
                        <td className="py-3 px-3 text-slate-700 dark:text-slate-300 font-medium" data-testid={`supplier-otd-${item.id}`}>
                          {item.otdRate}
                          {t("sourcing.percentSymbol", "%")}
                        </td>
                        <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                          <span className="capitalize">
                            {item.priceIndex === "budget"
                              ? t("sourcing.rank.priceIndex.budget", "Budget Friendly")
                              : item.priceIndex === "competitive"
                              ? t("sourcing.rank.priceIndex.competitive", "Market Competitive")
                              : t("sourcing.rank.priceIndex.premium", "Premium Tier")}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-700 dark:text-slate-300" data-testid={`supplier-rebate-${item.id}`}>
                          {item.rebatePercentage}
                          {t("sourcing.percentSymbol", "%")}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-2xs font-semibold ${
                              item.status === "preferred"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                : item.status === "approved"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                                : item.status === "standard"
                                ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                            }`}
                            data-testid={`supplier-status-${item.id}`}
                          >
                            {item.status === "preferred"
                              ? t("sourcing.rank.status.preferred", "Preferred Partner")
                              : item.status === "approved"
                              ? t("sourcing.rank.status.approved", "Approved Supplier")
                              : item.status === "standard"
                              ? t("sourcing.rank.status.standard", "Standard Vendor")
                              : t("sourcing.rank.status.under_review", "Under Review")}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            type="button"
                            className="px-2.5 py-1 text-xs rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
                            data-testid={`btn-inspect-${item.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSupplierId(item.id);
                            }}
                          >
                            {t("sourcing.table.viewDetails", "Inspect")}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Selected Supplier Detail Drawer */}
            {selectedSupplier && (
              <div
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3"
                data-testid="supplier-detail-drawer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {t("sourcing.rank.drawerTitle", "Supplier Scorecard Details")}
                    </span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {selectedSupplier.supplierName}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="text-xs px-2 py-1 rounded text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    data-testid="btn-close-supplier-detail"
                    onClick={() => setSelectedSupplierId(null)}
                  >
                    {t("sourcing.rank.drawerClose", "Close Details")}
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs pt-1">
                  <div>
                    <span className="text-slate-400 block">{t("sourcing.rank.contact", "Contact")}</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">{selectedSupplier.contactEmail}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">{t("sourcing.rank.qualityRating", "Quality Rating")}</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedSupplier.qualityRating} {t("sourcing.scoreOutOf", "/ 100")}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">{t("sourcing.rank.activeSkus", "Catalog SKUs")}</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{selectedSupplier.activeSkusCount.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">{t("sourcing.rank.historicalOtd", "Historical OTD Rate")}</span>
                    <span className="font-semibold text-emerald-600">{selectedSupplier.otdRate}{t("sourcing.percentSymbol", "%")}</span>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* 3. TCO Comparator (Total Cost of Ownership) */}
        {(activeTab === "all" || activeTab === "tco") && (
          <section
            className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-5"
            data-testid="tco-comparator-section"
          >
            {/* Section Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {t("sourcing.tco.title", "TCO Comparator")}
                  </h2>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {t("sourcing.endpointTco", "/api/sourcing/tco")}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {t(
                    "sourcing.tco.subtitle",
                    "Total Cost of Ownership analysis modeling hidden logistics, holding tariffs, and risk factors."
                  )}
                </p>
              </div>

              {/* Scenario selector */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  {t("sourcing.tco.selectScenario", "Sourcing Scenario:")}
                </span>
                <select
                  value={selectedScenarioId}
                  onChange={(e) => setSelectedScenarioId(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  data-testid="select-tco-scenario"
                >
                  {scenarios.map((sc) => (
                    <option key={sc.id} value={sc.id}>
                      {sc.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Scenario Description & Interactive Toggles */}
            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block" data-testid="tco-scenario-name">
                  {currentScenario?.name}
                </span>
                <span className="text-slate-500 dark:text-slate-400 text-2xs">
                  {currentScenario?.description}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-5">
                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={expeditedShipping}
                    onChange={(e) => setExpeditedShipping(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    data-testid="toggle-expedited-shipping"
                  />
                  <span className="text-slate-700 dark:text-slate-300">
                    {t("sourcing.tco.expeditedFreight", "Expedited Freight Mode (+25% shipping, -50% lead time)")}
                  </span>
                </label>

                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={applyRebates}
                    onChange={(e) => setApplyRebates(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    data-testid="toggle-volume-rebate"
                  />
                  <span className="text-slate-700 dark:text-slate-300">
                    {t("sourcing.tco.applyRebates", "Deduct Contract Rebate Tier")}
                  </span>
                </label>
              </div>
            </div>

            {/* TCO Option Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5" data-testid="tco-comparison-grid">
              {evaluatedTcoOptions.map((opt) => {
                const isAwarded = selectedAwardSupplierId === opt.supplierId;
                const isBestValue = opt.recommendationTag === "best_value";
                return (
                  <div
                    key={opt.supplierId}
                    data-testid={`tco-card-${opt.supplierId}`}
                    className={`p-4 rounded-xl border flex flex-col justify-between transition-all shadow-xs ${
                      isAwarded
                        ? "border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 ring-2 ring-emerald-500/50"
                        : isBestValue
                        ? "border-emerald-300 dark:border-emerald-700/60 bg-white dark:bg-slate-900"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                    }`}
                  >
                    <div>
                      {/* Card Header & Tag */}
                      <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div>
                          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100" data-testid={`tco-supplier-name-${opt.supplierId}`}>
                            {opt.supplierName}
                          </h3>
                          <div className="text-2xs text-slate-500 mt-0.5">
                            {t("sourcing.tco.leadTime", "Delivery Lead Time")}:
                            <span className="font-semibold text-slate-700 dark:text-slate-300 ml-1" data-testid={`tco-leadtime-${opt.supplierId}`}>
                              {opt.leadTimeDays} {t("sourcing.days", "days")}
                            </span>
                          </div>
                        </div>

                        <span
                          className={`text-2xs px-2 py-0.5 rounded font-semibold ${
                            opt.recommendationTag === "best_value"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : opt.recommendationTag === "hidden_costs"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                          }`}
                          data-testid={`tco-recommendation-${opt.supplierId}`}
                        >
                          {opt.recommendationTag === "best_value"
                            ? t("sourcing.tco.tags.best_value", "Lowest Total TCO")
                            : opt.recommendationTag === "hidden_costs"
                            ? t("sourcing.tco.tags.hidden_costs", "Sticker Price Trap")
                            : t("sourcing.tco.tags.secondary_source", "Approved Secondary")}
                        </span>
                      </div>

                      {/* Net TCO Highlight */}
                      <div className="py-4 text-center">
                        <span className="text-2xs text-slate-400 uppercase tracking-wider block">
                          {t("sourcing.tco.netTotal", "Net Total Cost of Ownership")}
                        </span>
                        <div
                          className={`text-2xl font-extrabold tracking-tight mt-1 ${
                            isBestValue ? "text-emerald-600 dark:text-emerald-400" : "text-slate-800 dark:text-slate-100"
                          }`}
                          data-testid={`tco-net-total-${opt.supplierId}`}
                        >
                          {t("sourcing.currencySymbol", "$")}
                          {opt.netTco.toLocaleString()}
                        </div>
                      </div>

                      {/* Cost Factors Breakdown */}
                      <dl className="space-y-1.5 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex justify-between text-slate-600 dark:text-slate-400">
                          <dt>{t("sourcing.tco.basePrice", "Base Invoice Price")}</dt>
                          <dd className="font-medium text-slate-800 dark:text-slate-200" data-testid={`tco-base-${opt.supplierId}`}>
                            {t("sourcing.currencySymbol", "$")}{opt.basePrice.toLocaleString()}
                          </dd>
                        </div>
                        <div className="flex justify-between text-slate-600 dark:text-slate-400">
                          <dt>{t("sourcing.tco.freight", "Freight & Logistics")}</dt>
                          <dd className="font-medium text-slate-800 dark:text-slate-200" data-testid={`tco-freight-${opt.supplierId}`}>
                            {t("sourcing.currencySymbol", "$")}{opt.freightCost.toLocaleString()}
                          </dd>
                        </div>
                        <div className="flex justify-between text-slate-600 dark:text-slate-400">
                          <dt>{t("sourcing.tco.tariffs", "Customs & Tariffs")}</dt>
                          <dd className="font-medium text-slate-800 dark:text-slate-200" data-testid={`tco-tariffs-${opt.supplierId}`}>
                            {t("sourcing.currencySymbol", "$")}{opt.dutiesAndTariffs.toLocaleString()}
                          </dd>
                        </div>
                        <div className="flex justify-between text-slate-600 dark:text-slate-400">
                          <dt>{t("sourcing.tco.holdingCost", "Holding & Carrying Cost")}</dt>
                          <dd className="font-medium text-slate-800 dark:text-slate-200" data-testid={`tco-holding-${opt.supplierId}`}>
                            {t("sourcing.currencySymbol", "$")}{opt.holdingCost.toLocaleString()}
                          </dd>
                        </div>
                        <div className="flex justify-between text-slate-600 dark:text-slate-400">
                          <dt>{t("sourcing.tco.warrantyRisk", "Warranty / RMA Risk Cost")}</dt>
                          <dd className="font-medium text-slate-800 dark:text-slate-200" data-testid={`tco-risk-${opt.supplierId}`}>
                            {t("sourcing.currencySymbol", "$")}{opt.warrantyRiskCost.toLocaleString()}
                          </dd>
                        </div>
                        <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                          <dt>{t("sourcing.tco.rebateDeduction", "Rebate Deduction")}</dt>
                          <dd className="font-semibold" data-testid={`tco-rebate-${opt.supplierId}`}>
                            {t("sourcing.dash", "-")}
                            {t("sourcing.currencySymbol", "$")}
                            {opt.rebateDiscount.toLocaleString()}
                          </dd>
                        </div>
                      </dl>
                    </div>

                    {/* Award Button */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        className={`w-full py-2 text-xs font-semibold rounded-lg transition-colors shadow-xs ${
                          isAwarded
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200"
                        }`}
                        data-testid={`btn-select-award-${opt.supplierId}`}
                        onClick={() => setSelectedAwardSupplierId(isAwarded ? null : opt.supplierId)}
                      >
                        {isAwarded
                          ? t("sourcing.tco.awardSelected", "Selected Sourcing Route")
                          : t("sourcing.tco.selectAward", "Select for Award")}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sourcing Intelligence Insight Banner */}
            <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-start gap-3">
              <span className="p-1 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-xs">
                {t("sourcing.infoIcon", "i")}
              </span>
              <div className="text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {t("sourcing.tco.insights.title", "TCO Sourcing Insight")}
                </span>
                <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                  {t(
                    "sourcing.tco.insights.advice",
                    "Lower invoice prices often mask elevated freight and defect rates. Evaluating Net TCO protects project margin."
                  )}
                </p>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
