import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { findingRegistry, STOCK_INTELLIGENCE_PRODUCER_ID } from '../../shell/finding/registry';
import type { Finding } from '../../shell/finding/types';

export interface DemandForecastItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  currentStock: number;
  forecast30d: number;
  stockoutDays: number;
  growthTrend: string;
  velocity: 'Critical' | 'High' | 'Moderate' | 'Low';
}

export interface RestockAdvisoryItem {
  id: string;
  sku: string;
  name: string;
  currentStock: number;
  safetyStock: number;
  suggestedReorderQty: number;
  vendor: string;
  vendorCode: string;
  leadTimeDays: number;
  urgency: 'critical' | 'urgent' | 'advisory';
  estimatedCost: number;
  status: 'pending' | 'ordered' | 'acknowledged';
}

export interface DeadStockItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  daysDormant: number;
  unitsOnHand: number;
  unitValue: number;
  tiedCapital: number;
  recommendedAction: string;
  actionType: 'discount' | 'disposal' | 'liquidate';
  dispositionStatus: 'idle' | 'in_progress' | 'completed';
}

export interface StockIntelligenceProps {
  title?: string;
  className?: string;
  onNavigate?: (path: string, entity?: any) => void;
  'data-entity-type'?: string;
  'data-entity-id'?: string;
  [key: string]: any;
}

export const DEFAULT_DEMAND_FORECASTS: DemandForecastItem[] = [
  {
    id: 'df-1',
    sku: 'CBL-001',
    name: 'Cat6 Cable 300m',
    category: 'Cables & Connectivity',
    currentStock: 45,
    forecast30d: 75,
    stockoutDays: 8,
    growthTrend: '+18.4%',
    velocity: 'High',
  },
  {
    id: 'df-2',
    sku: 'RTR-002',
    name: 'Enterprise Router 9000',
    category: 'Networking Hardware',
    currentStock: 12,
    forecast30d: 16,
    stockoutDays: 0,
    growthTrend: '+35.0%',
    velocity: 'Critical',
  },
  {
    id: 'df-3',
    sku: 'DSP-CORE-08',
    name: 'DSP Core 8-Channel Processor',
    category: 'Audio Processing',
    currentStock: 14,
    forecast30d: 10,
    stockoutDays: 42,
    growthTrend: '+5.2%',
    velocity: 'Moderate',
  },
  {
    id: 'df-4',
    sku: 'LED-PAN-50',
    name: 'Direct-View LED Panel 500x500mm',
    category: 'Video Wall Systems',
    currentStock: 28,
    forecast30d: 40,
    stockoutDays: 14,
    growthTrend: '+22.5%',
    velocity: 'High',
  },
];

export const DEFAULT_RESTOCK_ADVISORIES: RestockAdvisoryItem[] = [
  {
    id: 'ra-1',
    sku: 'CBL-001',
    name: 'Cat6 Cable 300m',
    currentStock: 45,
    safetyStock: 50,
    suggestedReorderQty: 100,
    vendor: 'Apex Distributing',
    vendorCode: 'APEX-DIST-01',
    leadTimeDays: 14,
    urgency: 'urgent',
    estimatedCost: 12000,
    status: 'pending',
  },
  {
    id: 'ra-2',
    sku: 'RTR-002',
    name: 'Enterprise Router 9000',
    currentStock: 12,
    safetyStock: 15,
    suggestedReorderQty: 8,
    vendor: 'NetWave Systems',
    vendorCode: 'NETW-09',
    leadTimeDays: 7,
    urgency: 'critical',
    estimatedCost: 11600,
    status: 'pending',
  },
  {
    id: 'ra-3',
    sku: 'CON-HDMI-4K',
    name: 'Active Optical HDMI 2.1 Cable 15m',
    currentStock: 6,
    safetyStock: 10,
    suggestedReorderQty: 25,
    vendor: 'Apex Distributing',
    vendorCode: 'APEX-DIST-01',
    leadTimeDays: 10,
    urgency: 'advisory',
    estimatedCost: 1250,
    status: 'pending',
  },
];

export const DEFAULT_DEAD_STOCK_ITEMS: DeadStockItem[] = [
  {
    id: 'ds-1',
    sku: 'AUD-SPL-04',
    name: 'Analog Audio Splitter 4-Ch',
    category: 'Legacy Audio',
    daysDormant: 210,
    unitsOnHand: 68,
    unitValue: 50,
    tiedCapital: 3400,
    recommendedAction: 'Clearance Discounting',
    actionType: 'discount',
    dispositionStatus: 'idle',
  },
  {
    id: 'ds-2',
    sku: 'VGA-EXT-100',
    name: 'VGA over Cat5 Extender Kit',
    category: 'Legacy Video',
    daysDormant: 340,
    unitsOnHand: 24,
    unitValue: 85,
    tiedCapital: 2040,
    recommendedAction: 'WEEE Disposal / Recycle',
    actionType: 'disposal',
    dispositionStatus: 'idle',
  },
  {
    id: 'ds-3',
    sku: 'DVI-D-CBL-03',
    name: 'DVI-D Single Link 3m Cable',
    category: 'Cables & Connectivity',
    daysDormant: 275,
    unitsOnHand: 110,
    unitValue: 12,
    tiedCapital: 1320,
    recommendedAction: 'Liquidate to Secondary Market',
    actionType: 'liquidate',
    dispositionStatus: 'idle',
  },
  {
    id: 'ds-4',
    sku: 'PSU-LEG-12V',
    name: 'Proprietary 12V Rack Power Unit',
    category: 'Power & Infrastructure',
    daysDormant: 185,
    unitsOnHand: 15,
    unitValue: 190,
    tiedCapital: 2850,
    recommendedAction: 'Bundle Promotion',
    actionType: 'discount',
    dispositionStatus: 'idle',
  },
  {
    id: 'ds-5',
    sku: 'CAM-SD-001',
    name: 'Legacy SD Composite PTZ Camera',
    category: 'Video Cameras',
    daysDormant: 410,
    unitsOnHand: 7,
    unitValue: 405,
    tiedCapital: 2840,
    recommendedAction: 'WEEE Disposal / Recycle',
    actionType: 'disposal',
    dispositionStatus: 'idle',
  },
];

export function StockIntelligence({
  title,
  className = '',
}: StockIntelligenceProps) {
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<'all' | 'demand' | 'restock' | 'dead_stock'>('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [demandItems] = useState<DemandForecastItem[]>(DEFAULT_DEMAND_FORECASTS);
  const [restockItems, setRestockItems] = useState<RestockAdvisoryItem[]>(DEFAULT_RESTOCK_ADVISORIES);
  const [deadStockItems, setDeadStockItems] = useState<DeadStockItem[]>(DEFAULT_DEAD_STOCK_ITEMS);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'info'; message: string } | null>(null);

  // Mount/Unmount Finding lifecycle
  useEffect(() => {
    const mockFindings: Finding[] = [
      {
        id: 'si-restock-adv-cbl001',
        severity: 'advice',
        rule: 'reorder-lead-time-advisory',
        message: t(
          'inventory.stockIntel.findingRestockCbl001',
          'Restock advisory: Cat6 Cable 300m (CBL-001) projected stockout in 8 days with 14-day vendor lead time'
        ),
        entityRef: {
          type: 'PRODUCT_SKU',
          id: 'CBL-001',
        },
        evidence: {
          sku: 'CBL-001',
          currentStock: 45,
          projectedStockoutDays: 8,
          leadTimeDays: 14,
          suggestedReorder: 100,
        },
        provenanceRef: 'prov://inventory/stock-intelligence/advisory/CBL-001',
        fix: {
          id: 'fix-restock-cbl001',
          label: t('inventory.stockIntel.fixGeneratePo', 'Generate replenishment PO'),
          apply: () => {
            findingRegistry.clearFinding('si-restock-adv-cbl001');
          },
        },
        producerId: STOCK_INTELLIGENCE_PRODUCER_ID,
        timestamp: Date.now(),
      },
      {
        id: 'si-restock-risk-rtr002',
        severity: 'risk',
        rule: 'stockout-risk-zero-available',
        message: t(
          'inventory.stockIntel.findingRestockRtr002',
          'Stockout risk: Enterprise Router 9000 (RTR-002) has 0 available units with pending commitments'
        ),
        entityRef: {
          type: 'PRODUCT_SKU',
          id: 'RTR-002',
        },
        evidence: {
          sku: 'RTR-002',
          onHand: 12,
          reserved: 12,
          available: 0,
        },
        provenanceRef: 'prov://inventory/stock-intelligence/stockout/RTR-002',
        fix: {
          id: 'fix-restock-rtr002',
          label: t('inventory.stockIntel.fixExpediteOrder', 'Expedite vendor PO'),
          apply: () => {
            findingRegistry.clearFinding('si-restock-risk-rtr002');
          },
        },
        producerId: STOCK_INTELLIGENCE_PRODUCER_ID,
        timestamp: Date.now(),
      },
      {
        id: 'si-dead-stock-aud004',
        severity: 'advice',
        rule: 'dead-stock-capital-recovery',
        message: t(
          'inventory.stockIntel.findingDeadStockAud004',
          'Dead stock advisory: Analog Audio Splitter 4-Ch (AUD-SPL-04) has 0 movement in 210 days ($3,400 tied capital)'
        ),
        entityRef: {
          type: 'PRODUCT_SKU',
          id: 'AUD-SPL-04',
        },
        evidence: {
          sku: 'AUD-SPL-04',
          daysDormant: 210,
          onHand: 68,
          tiedCapital: 3400,
        },
        provenanceRef: 'prov://inventory/stock-intelligence/dead-stock/AUD-SPL-04',
        fix: {
          id: 'fix-dead-stock-aud004',
          label: t('inventory.stockIntel.fixDiscountClearance', 'Mark for clearance discounting'),
          apply: () => {
            findingRegistry.clearFinding('si-dead-stock-aud004');
          },
        },
        producerId: STOCK_INTELLIGENCE_PRODUCER_ID,
        timestamp: Date.now(),
      },
    ];

    findingRegistry.addFindings(STOCK_INTELLIGENCE_PRODUCER_ID, mockFindings);

    return () => {
      findingRegistry.clearProducerFindings(STOCK_INTELLIGENCE_PRODUCER_ID);
    };
  }, [t]);

  // Calculations for metrics
  const totalDeadStockCapital = useMemo(
    () => deadStockItems.reduce((acc, item) => acc + item.tiedCapital, 0),
    [deadStockItems]
  );

  const totalRestockPipelineCost = useMemo(
    () => restockItems.reduce((acc, item) => acc + item.estimatedCost, 0),
    [restockItems]
  );

  const pendingRestockCount = useMemo(
    () => restockItems.filter((i) => i.status === 'pending').length,
    [restockItems]
  );

  const handleReorder = (item: RestockAdvisoryItem) => {
    setRestockItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, status: 'ordered' } : i))
    );
    setFeedback({
      type: 'success',
      message: t(
        'inventory.stockIntel.reorderFeedback',
        'Reorder requisition submitted for {{sku}} ({{qty}} units to {{vendor}})',
        {
          sku: item.sku,
          qty: item.suggestedReorderQty,
          vendor: item.vendor,
        }
      ),
    });
  };

  const handleAcknowledge = (item: RestockAdvisoryItem) => {
    setRestockItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, status: 'acknowledged' } : i))
    );
    setFeedback({
      type: 'info',
      message: t(
        'inventory.stockIntel.acknowledgeFeedback',
        'Restock advisory acknowledged for {{sku}}',
        { sku: item.sku }
      ),
    });
  };

  const handleDeadStockAction = (item: DeadStockItem) => {
    setDeadStockItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, dispositionStatus: 'in_progress' } : i))
    );
    setFeedback({
      type: 'success',
      message: t(
        'inventory.stockIntel.deadStockFeedback',
        'Disposition initiated for {{sku}}: {{action}}',
        {
          sku: item.sku,
          action: item.recommendedAction,
        }
      ),
    });
  };

  const term = searchFilter.trim().toLowerCase();
  const filteredDemand = useMemo(
    () =>
      demandItems.filter(
        (i) =>
          !term ||
          i.sku.toLowerCase().includes(term) ||
          i.name.toLowerCase().includes(term) ||
          i.category.toLowerCase().includes(term)
      ),
    [demandItems, term]
  );

  const filteredRestock = useMemo(
    () =>
      restockItems.filter(
        (i) =>
          !term ||
          i.sku.toLowerCase().includes(term) ||
          i.name.toLowerCase().includes(term) ||
          i.vendor.toLowerCase().includes(term)
      ),
    [restockItems, term]
  );

  const filteredDeadStock = useMemo(
    () =>
      deadStockItems.filter(
        (i) =>
          !term ||
          i.sku.toLowerCase().includes(term) ||
          i.name.toLowerCase().includes(term) ||
          i.category.toLowerCase().includes(term)
      ),
    [deadStockItems, term]
  );

  return (
    <div
      className={`flex flex-col h-full w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 ${className}`}
      data-testid="stock-intelligence-surface"
    >
      {/* Header bar */}
      <header className="p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                {t('inventory.stockIntel.badge', 'AI & Predictive Analytics')}
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {title ?? t('inventory.stockIntel.dashboardTitle', 'Stock Intelligence')}
              </h1>
            </div>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {t(
                'inventory.stockIntel.subtitle',
                'Predictive demand forecasting, restock optimization, and dead stock mitigation'
              )}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setFeedback({
                  type: 'info',
                  message: t('inventory.stockIntel.exportTriggered', 'Forecast data exported to CSV report'),
                });
              }}
              data-testid="stock-intel-export-button"
              className="px-3 py-2 text-sm font-medium rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors shadow-sm"
            >
              {t('inventory.stockIntel.btnExport', 'Export Report')}
            </button>
            <button
              type="button"
              onClick={() => {
                setFeedback({
                  type: 'info',
                  message: t('inventory.stockIntel.refreshedFeedback', 'Predictive metrics recalculated successfully'),
                });
              }}
              data-testid="stock-intel-refresh-button"
              className="px-3 py-2 text-sm font-medium rounded-md bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-sm"
            >
              {t('inventory.stockIntel.btnRefresh', 'Refresh Analysis')}
            </button>
          </div>
        </div>

        {/* Search & Navigation Tabs */}
        <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              data-testid="tab-all"
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {t('inventory.stockIntel.tabAll', 'All Insights')}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('demand')}
              data-testid="tab-demand"
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'demand'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {t('inventory.stockIntel.demandForecast', 'Demand Forecast')}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('restock')}
              data-testid="tab-restock"
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'restock'
                  ? 'bg-amber-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {t('inventory.stockIntel.restockAdvisories', 'Restock Advisories')}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('dead_stock')}
              data-testid="tab-dead-stock"
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'dead_stock'
                  ? 'bg-rose-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {t('inventory.stockIntel.deadStock', 'Dead Stock')}
            </button>
          </div>

          <div className="w-full md:w-72">
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder={t('inventory.stockIntel.searchPlaceholder', 'Filter by SKU, product, or category...')}
              data-testid="search-input"
              className="w-full px-3 py-1.5 text-sm rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 overflow-auto p-6 space-y-6">
        {/* Feedback Alert */}
        {feedback && (
          <div
            role="status"
            data-testid="stock-intel-feedback"
            className={`p-4 rounded-lg text-sm flex items-center justify-between border shadow-sm ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800'
                : 'bg-blue-50 text-blue-900 dark:bg-blue-950/60 dark:text-blue-200 border-blue-200 dark:border-blue-800'
            }`}
          >
            <span className="font-medium">{feedback.message}</span>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              data-testid="stock-intel-dismiss-feedback"
              className="text-xs font-semibold px-2.5 py-1 rounded bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 transition-colors"
            >
              {t('common.dismiss', 'Dismiss')}
            </button>
          </div>
        )}

        {/* 3 Main Metric Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* 1. Demand Forecast Card */}
          <div
            data-testid="demand-forecast-card"
            className="p-5 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-gradient-to-br from-blue-50/70 to-white dark:from-blue-950/40 dark:to-slate-900 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                  {t('inventory.stockIntel.demandForecast', 'Demand Forecast')}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/80 dark:text-blue-300">
                  {t('inventory.stockIntel.forecastPeriod', '30-Day Run Rate')}
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-blue-900 dark:text-blue-100">
                  {t('inventory.stockIntel.demandMetricVal', '+18.4%')}
                </span>
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                  {t('inventory.stockIntel.demandGrowthMoM', 'MoM projected')}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {t('inventory.stockIntel.demandMetricSub', 'Projected 30-Day Demand Growth')}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-blue-100 dark:border-blue-900/40 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">
                  {t('inventory.stockIntel.highVelocitySkus', 'High Velocity SKUs')}
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{demandItems.length}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">
                  {t('inventory.stockIntel.projectedStockouts', 'Stockouts <14d')}
                </span>
                <span className="font-semibold text-rose-600 dark:text-rose-400">2</span>
              </div>
            </div>
          </div>

          {/* 2. Restock Advisories Card */}
          <div
            data-testid="restock-advisories-card"
            className="p-5 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-gradient-to-br from-amber-50/70 to-white dark:from-amber-950/40 dark:to-slate-900 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  {t('inventory.stockIntel.restockAdvisories', 'Restock Advisories')}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/80 dark:text-amber-300">
                  {t('inventory.stockIntel.restockCountBadge', '{{count}} Active', { count: pendingRestockCount })}
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-amber-900 dark:text-amber-100">
                  {t('inventory.stockIntel.restockMetricVal', '3 Active')}
                </span>
                <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                  {t('inventory.stockIntel.restockUrgentSub', '2 Critical / Urgent')}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {t('inventory.stockIntel.restockMetricSub', 'Active Replenishment Advisories')}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-amber-100 dark:border-amber-900/40 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">
                  {t('inventory.stockIntel.estReorderCost', 'Est. Reorder Cost')}
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {t('inventory.stockIntel.currencyAmount', '${{amount}}', { amount: totalRestockPipelineCost.toLocaleString() })}
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">
                  {t('inventory.stockIntel.avgLeadTime', 'Avg Lead Time')}
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {t('inventory.stockIntel.avgDaysVal', '10.3 days')}
                </span>
              </div>
            </div>
          </div>

          {/* 3. Dead Stock Card */}
          <div
            data-testid="dead-stock-card"
            className="p-5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-gradient-to-br from-rose-50/70 to-white dark:from-rose-950/40 dark:to-slate-900 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                  {t('inventory.stockIntel.deadStock', 'Dead Stock')}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-900/80 dark:text-rose-300">
                  {t('inventory.stockIntel.deadStockCountBadge', '{{count}} Dormant', { count: deadStockItems.length })}
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-rose-900 dark:text-rose-100">
                  {t('inventory.stockIntel.currencyAmount', '${{amount}}', { amount: totalDeadStockCapital.toLocaleString() })}
                </span>
                <span className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                  {t('inventory.stockIntel.dormantDuration', '>180 Days')}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {t('inventory.stockIntel.deadStockMetricSub', 'Capital Tied in Inactive Items')}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-rose-100 dark:border-rose-900/40 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">
                  {t('inventory.stockIntel.salvagePotential', 'Salvage Potential')}
                </span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {t('inventory.stockIntel.salvageVal', '$3,800')}
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">
                  {t('inventory.stockIntel.holdingCost', 'Carrying Cost')}
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {t('inventory.stockIntel.carryingCostVal', '$620/mo')}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 1: Demand Forecast Table */}
        {(activeTab === 'all' || activeTab === 'demand') && (
          <section
            data-testid="demand-forecast-section"
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
          >
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                  {t('inventory.stockIntel.sectionDemandTitle', 'Demand Forecast & Consumption Velocity')}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {t(
                    'inventory.stockIntel.sectionDemandDesc',
                    'ML-driven run-rate predictions across rolling 30-day procurement horizons'
                  )}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="p-3 font-medium border-b border-slate-200 dark:border-slate-800">
                      {t('inventory.stockIntel.colSku', 'SKU')}
                    </th>
                    <th className="p-3 font-medium border-b border-slate-200 dark:border-slate-800">
                      {t('inventory.stockIntel.colProduct', 'Product Name')}
                    </th>
                    <th className="p-3 font-medium border-b border-slate-200 dark:border-slate-800">
                      {t('inventory.stockIntel.colCategory', 'Category')}
                    </th>
                    <th className="p-3 font-medium border-b border-slate-200 dark:border-slate-800 text-right">
                      {t('inventory.stockIntel.colOnHand', 'On Hand')}
                    </th>
                    <th className="p-3 font-medium border-b border-slate-200 dark:border-slate-800 text-right">
                      {t('inventory.stockIntel.colForecast30d', '30d Forecast')}
                    </th>
                    <th className="p-3 font-medium border-b border-slate-200 dark:border-slate-800 text-right">
                      {t('inventory.stockIntel.colStockoutHorizon', 'Stockout In')}
                    </th>
                    <th className="p-3 font-medium border-b border-slate-200 dark:border-slate-800 text-right">
                      {t('inventory.stockIntel.colTrend', 'Growth Trend')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {filteredDemand.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
                        {t('inventory.stockIntel.noResults', 'No items match your filter criteria.')}
                      </td>
                    </tr>
                  ) : (
                    filteredDemand.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                          {item.sku}
                        </td>
                        <td className="p-3 font-medium text-slate-900 dark:text-slate-100">
                          {item.name}
                        </td>
                        <td className="p-3 text-xs text-slate-500 dark:text-slate-400">
                          {item.category}
                        </td>
                        <td className="p-3 text-right tabular-nums font-medium text-slate-800 dark:text-slate-200">
                          {item.currentStock}
                        </td>
                        <td className="p-3 text-right tabular-nums font-semibold text-blue-600 dark:text-blue-400">
                          {item.forecast30d}
                        </td>
                        <td className="p-3 text-right tabular-nums">
                          {item.stockoutDays === 0 ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300">
                              {t('inventory.stockIntel.stockoutImmediate', 'Depleted / 0 Days')}
                            </span>
                          ) : item.stockoutDays <= 14 ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                              {t('inventory.stockIntel.daysCount', '{{count}} days', { count: item.stockoutDays })}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-600 dark:text-slate-300">
                              {t('inventory.stockIntel.daysCount', '{{count}} days', { count: item.stockoutDays })}
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right tabular-nums font-semibold text-emerald-600 dark:text-emerald-400">
                          {item.growthTrend}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Section 2: Restock Advisories Table */}
        {(activeTab === 'all' || activeTab === 'restock') && (
          <section
            data-testid="restock-advisories-section"
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
          >
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                  {t('inventory.stockIntel.sectionRestockTitle', 'Automated Restock Advisories')}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {t(
                    'inventory.stockIntel.sectionRestockDesc',
                    'Algorithmic replenishment triggers factoring in supplier lead times and safety thresholds'
                  )}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="p-3 font-medium border-b border-slate-200 dark:border-slate-800">
                      {t('inventory.stockIntel.colSku', 'SKU')}
                    </th>
                    <th className="p-3 font-medium border-b border-slate-200 dark:border-slate-800">
                      {t('inventory.stockIntel.colProduct', 'Product Name')}
                    </th>
                    <th className="p-3 font-medium border-b border-slate-200 dark:border-slate-800 text-right">
                      {t('inventory.stockIntel.colCurrentStock', 'Stock / Safety')}
                    </th>
                    <th className="p-3 font-medium border-b border-slate-200 dark:border-slate-800 text-right">
                      {t('inventory.stockIntel.colReorderQty', 'Suggested Reorder')}
                    </th>
                    <th className="p-3 font-medium border-b border-slate-200 dark:border-slate-800">
                      {t('inventory.stockIntel.colVendor', 'Vendor / Lead Time')}
                    </th>
                    <th className="p-3 font-medium border-b border-slate-200 dark:border-slate-800 text-right">
                      {t('inventory.stockIntel.colEstCost', 'Est. Cost')}
                    </th>
                    <th className="p-3 font-medium border-b border-slate-200 dark:border-slate-800">
                      {t('inventory.stockIntel.colStatus', 'Urgency')}
                    </th>
                    <th className="p-3 font-medium border-b border-slate-200 dark:border-slate-800 text-right">
                      {t('inventory.stockIntel.colActions', 'Actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {filteredRestock.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
                        {t('inventory.stockIntel.noResults', 'No items match your filter criteria.')}
                      </td>
                    </tr>
                  ) : (
                    filteredRestock.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                          {item.sku}
                        </td>
                        <td className="p-3 font-medium text-slate-900 dark:text-slate-100">
                          {item.name}
                        </td>
                        <td className="p-3 text-right tabular-nums text-xs">
                          <span className="font-semibold text-slate-900 dark:text-slate-100">{item.currentStock}</span>
                          <span className="text-slate-400 dark:text-slate-500">
                            {t('inventory.stockIntel.safetyStockFormat', ' / {{safety}}', { safety: item.safetyStock })}
                          </span>
                        </td>
                        <td className="p-3 text-right tabular-nums font-bold text-amber-600 dark:text-amber-400">
                          {item.suggestedReorderQty}
                        </td>
                        <td className="p-3 text-xs text-slate-600 dark:text-slate-300">
                          <div className="font-medium text-slate-800 dark:text-slate-200">{item.vendor}</div>
                          <div className="text-slate-400 text-[11px]">
                            {t('inventory.stockIntel.leadTimeFormat', '{{days}}d lead time', { days: item.leadTimeDays })}
                          </div>
                        </td>
                        <td className="p-3 text-right tabular-nums font-medium text-slate-700 dark:text-slate-300">
                          {t('inventory.stockIntel.currencyAmount', '${{amount}}', { amount: item.estimatedCost.toLocaleString() })}
                        </td>
                        <td className="p-3">
                          {item.urgency === 'critical' ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300">
                              {t('inventory.stockIntel.urgencyCritical', 'Critical')}
                            </span>
                          ) : item.urgency === 'urgent' ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                              {t('inventory.stockIntel.urgencyUrgent', 'Urgent')}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300">
                              {t('inventory.stockIntel.urgencyAdvisory', 'Advisory')}
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {item.status === 'ordered' ? (
                              <span className="px-2.5 py-1 text-xs font-semibold rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                                {t('inventory.stockIntel.statusOrdered', 'Ordered')}
                              </span>
                            ) : item.status === 'acknowledged' ? (
                              <span className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                {t('inventory.stockIntel.statusAcknowledged', 'Acknowledged')}
                              </span>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleReorder(item)}
                                  data-testid={`reorder-button-${item.sku}`}
                                  className="px-2.5 py-1 text-xs font-semibold rounded bg-amber-600 hover:bg-amber-700 text-white transition-colors shadow-xs"
                                >
                                  {t('inventory.stockIntel.btnReorder', 'Reorder')}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleAcknowledge(item)}
                                  data-testid={`acknowledge-button-${item.sku}`}
                                  className="px-2.5 py-1 text-xs font-medium rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                                >
                                  {t('inventory.stockIntel.btnDismiss', 'Acknowledge')}
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Section 3: Dead Stock Table */}
        {(activeTab === 'all' || activeTab === 'dead_stock') && (
          <section
            data-testid="dead-stock-section"
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
          >
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                  {t('inventory.stockIntel.sectionDeadStockTitle', 'Dead Stock & Capital Recovery')}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {t(
                    'inventory.stockIntel.sectionDeadStockDesc',
                    'Dormant inventory tracking with disposition recommendations to release trapped working capital'
                  )}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="p-3 font-medium border-b border-slate-200 dark:border-slate-800">
                      {t('inventory.stockIntel.colSku', 'SKU')}
                    </th>
                    <th className="p-3 font-medium border-b border-slate-200 dark:border-slate-800">
                      {t('inventory.stockIntel.colProduct', 'Product Name')}
                    </th>
                    <th className="p-3 font-medium border-b border-slate-200 dark:border-slate-800 text-right">
                      {t('inventory.stockIntel.colDormantDays', 'Dormant Days')}
                    </th>
                    <th className="p-3 font-medium border-b border-slate-200 dark:border-slate-800 text-right">
                      {t('inventory.stockIntel.colQty', 'Units On Hand')}
                    </th>
                    <th className="p-3 font-medium border-b border-slate-200 dark:border-slate-800 text-right">
                      {t('inventory.stockIntel.colTiedCapital', 'Tied Capital')}
                    </th>
                    <th className="p-3 font-medium border-b border-slate-200 dark:border-slate-800">
                      {t('inventory.stockIntel.colRecommendation', 'Disposition Recommendation')}
                    </th>
                    <th className="p-3 font-medium border-b border-slate-200 dark:border-slate-800 text-right">
                      {t('inventory.stockIntel.colActions', 'Actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {filteredDeadStock.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
                        {t('inventory.stockIntel.noResults', 'No items match your filter criteria.')}
                      </td>
                    </tr>
                  ) : (
                    filteredDeadStock.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-mono text-xs font-semibold text-rose-600 dark:text-rose-400">
                          {item.sku}
                        </td>
                        <td className="p-3 font-medium text-slate-900 dark:text-slate-100">
                          {item.name}
                        </td>
                        <td className="p-3 text-right tabular-nums text-xs font-bold text-rose-600 dark:text-rose-400">
                          {t('inventory.stockIntel.dormantDaysCount', '{{count}}d', { count: item.daysDormant })}
                        </td>
                        <td className="p-3 text-right tabular-nums text-slate-700 dark:text-slate-300">
                          {item.unitsOnHand}
                        </td>
                        <td className="p-3 text-right tabular-nums font-bold text-slate-900 dark:text-slate-100">
                          {t('inventory.stockIntel.currencyAmount', '${{amount}}', { amount: item.tiedCapital.toLocaleString() })}
                        </td>
                        <td className="p-3 text-xs">
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {item.recommendedAction}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {item.dispositionStatus === 'in_progress' ? (
                              <span className="px-2.5 py-1 text-xs font-semibold rounded bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                                {t('inventory.stockIntel.statusInProgress', 'In Progress')}
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleDeadStockAction(item)}
                                data-testid={`dead-stock-action-${item.sku}`}
                                className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors shadow-xs ${
                                  item.actionType === 'discount'
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                    : item.actionType === 'disposal'
                                    ? 'bg-rose-600 hover:bg-rose-700 text-white'
                                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                }`}
                              >
                                {item.actionType === 'discount'
                                  ? t('inventory.stockIntel.actionDiscount', 'Apply Clearance')
                                  : item.actionType === 'disposal'
                                  ? t('inventory.stockIntel.actionDisposal', 'WEEE Scrap')
                                  : t('inventory.stockIntel.actionLiquidate', 'Liquidate')}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
