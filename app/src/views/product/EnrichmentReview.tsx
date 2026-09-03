import React, { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { executeGovernedAction } from "../../shell/action/envelope";
import { GovernedActionStatus } from "../../shell/action/GovernedActionStatus";
import type { GovernedActionState } from "../../shell/action/types";

export type EnrichmentStatus = "pending" | "approved" | "rejected";

export interface EnrichmentFieldDiff {
  key: string;
  label: string;
  currentValue: string | number | boolean | string[] | null | undefined;
  suggestedValue: string | number | boolean | string[] | null | undefined;
  status: EnrichmentStatus;
  confidence?: number;
  reason?: string;
}

export interface EnrichmentItem {
  id: string;
  productId: string;
  productSku: string;
  productName: string;
  category?: string;
  manufacturer?: string;
  source: string;
  sourceDocument?: string;
  confidence: number;
  status: EnrichmentStatus;
  createdAt?: string;
  fields: EnrichmentFieldDiff[];
  approvalId?: string;
}

export interface EnrichmentReviewProps {
  title?: string;
  items?: EnrichmentItem[];
  selectedItemId?: string;
  fetchFn?: typeof fetch;
  actionApiUrl?: string;
  onNavigate?: (path: string, entity?: any) => void;
  onApproveField?: (itemId: string, fieldKey: string) => void;
  onRejectField?: (itemId: string, fieldKey: string) => void;
  onApproveItem?: (itemId: string) => void;
  onRejectItem?: (itemId: string) => void;
  className?: string;
  "data-entity-type"?: string;
  "data-entity-id"?: string;
}

export const DEFAULT_ENRICHMENT_ITEMS: EnrichmentItem[] = [
  {
    id: "enrich-001",
    productId: "prod-spk-bose-fs2c",
    productSku: "FS2C-W-8R",
    productName: "Bose FreeSpace FS2C In-Ceiling Loudspeaker",
    category: "Loudspeakers",
    manufacturer: "Bose Professional",
    source: "AI Datasheet Extractor v2.4",
    sourceDocument: "Bose_FS2C_Datasheet_2026.pdf",
    confidence: 0.95,
    status: "pending",
    createdAt: "2026-09-02T10:30:00Z",
    fields: [
      {
        key: "description",
        label: "Product Description",
        currentValue: "Ceiling speaker",
        suggestedValue:
          "High-performance 2.25-inch full-range transducer in-ceiling loudspeaker for background music and speech reproduction in commercial installations.",
        status: "pending",
        confidence: 0.96,
        reason: "Extracted from page 1 product overview section",
      },
      {
        key: "frequencyRange",
        label: "Frequency Range (-10 dB)",
        currentValue: "95 Hz – 16 kHz",
        suggestedValue: "83 Hz – 19 kHz (-10 dB)",
        status: "pending",
        confidence: 0.98,
        reason: "Extracted from technical specifications table",
      },
      {
        key: "nominalCoverage",
        label: "Nominal Coverage Angle",
        currentValue: null,
        suggestedValue: "170° conical",
        status: "pending",
        confidence: 0.94,
        reason: "Extracted from beamwidth section",
      },
      {
        key: "rohsCompliance",
        label: "RoHS Compliant",
        currentValue: false,
        suggestedValue: true,
        status: "pending",
        confidence: 0.92,
        reason: "Certificate of compliance reference found on page 4",
      },
    ],
  },
  {
    id: "enrich-002",
    productId: "prod-spk-qsc-ad-c6t",
    productSku: "AD-C6T-WH",
    productName: "QSC AcousticDesign AD-C6T 6.5\" Ceiling Speaker",
    category: "Loudspeakers",
    manufacturer: "QSC",
    source: "Vendor Catalog Synchronization",
    sourceDocument: "QSC_AD_Series_Specs_RevC.pdf",
    confidence: 0.88,
    status: "pending",
    createdAt: "2026-09-02T11:15:00Z",
    fields: [
      {
        key: "powerHandling",
        label: "Power Handling",
        currentValue: "200W",
        suggestedValue: "200W continuous / 300W peak",
        status: "pending",
        confidence: 0.91,
        reason: "Updated power handling rating from manufacturer revised spec",
      },
      {
        key: "capabilities",
        label: "Product Capabilities",
        currentValue: ["8Ω", "200W", "ceiling"],
        suggestedValue: [
          "8Ω",
          "70V/100V transformer",
          "200W",
          "ceiling",
          "in-ceiling",
          "EN54-24 certified",
        ],
        status: "pending",
        confidence: 0.86,
        reason: "Capabilities inferred from standard compliance declaration",
      },
    ],
  },
  {
    id: "enrich-003",
    productId: "prod-sw-cisco-9300",
    productSku: "C9300-24UX-A",
    productName: "Cisco Catalyst 9300 24-Port UPOE Switch",
    category: "Network Switches",
    manufacturer: "Cisco Systems",
    source: "Hardware Architecture Classifier",
    sourceDocument: "Cisco_9300_Series_Hardware_Guide.pdf",
    confidence: 0.93,
    status: "pending",
    createdAt: "2026-09-02T12:00:00Z",
    fields: [
      {
        key: "poeBudget",
        label: "PoE Power Budget",
        currentValue: "490W",
        suggestedValue: "560W default (expandable to 1100W with dual PSU)",
        status: "pending",
        confidence: 0.95,
        reason: "Power supply matrix specifications page 12",
      },
    ],
  },
];

function formatValue(value: string | number | boolean | string[] | null | undefined): string {
  if (value === null || value === undefined || value === "") {
    return "";
  }
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }
  if (Array.isArray(value)) {
    return value.join(", ");
  }
  return String(value);
}

export function EnrichmentReview({
  title,
  items: initialItems = DEFAULT_ENRICHMENT_ITEMS,
  selectedItemId,
  fetchFn = typeof fetch !== "undefined" ? fetch : undefined,
  actionApiUrl = "/api/product/enrichment/review",
  onNavigate,
  onApproveField,
  onRejectField,
  onApproveItem,
  onRejectItem,
  className = "",
  "data-entity-type": dataEntityType = "PRODUCT_ENRICHMENT",
  "data-entity-id": dataEntityId,
}: EnrichmentReviewProps) {
  const { t } = useTranslation();
  const [items, setItems] = useState<EnrichmentItem[]>(initialItems);
  const [activeFilter, setActiveFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [actionStates, setActionStates] = useState<Record<string, GovernedActionState>>({});

  const counts = useMemo(() => {
    let pending = 0;
    let approved = 0;
    let rejected = 0;
    for (const item of items) {
      if (item.status === "pending") pending++;
      else if (item.status === "approved") approved++;
      else if (item.status === "rejected") rejected++;
    }
    return {
      total: items.length,
      pending,
      approved,
      rejected,
    };
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (activeFilter === "pending" && item.status !== "pending") return false;
      if (activeFilter === "approved" && item.status !== "approved") return false;
      if (activeFilter === "rejected" && item.status !== "rejected") return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesProduct =
          item.productName.toLowerCase().includes(q) ||
          item.productSku.toLowerCase().includes(q) ||
          (item.manufacturer && item.manufacturer.toLowerCase().includes(q)) ||
          item.source.toLowerCase().includes(q);
        const matchesField = item.fields.some(
          (f) =>
            f.label.toLowerCase().includes(q) ||
            formatValue(f.currentValue).toLowerCase().includes(q) ||
            formatValue(f.suggestedValue).toLowerCase().includes(q)
        );
        return matchesProduct || matchesField;
      }

      return true;
    });
  }, [items, activeFilter, searchQuery]);

  const handleApproveField = useCallback(
    async (itemId: string, fieldKey: string) => {
      onApproveField?.(itemId, fieldKey);

      setItems((prevItems) =>
        prevItems.map((item) => {
          if (item.id !== itemId) return item;
          const updatedFields = item.fields.map((field) =>
            field.key === fieldKey ? { ...field, status: "approved" as EnrichmentStatus } : field
          );
          const allResolved = updatedFields.every((f) => f.status !== "pending");
          const anyApproved = updatedFields.some((f) => f.status === "approved");
          const newStatus: EnrichmentStatus = allResolved
            ? anyApproved
              ? "approved"
              : "rejected"
            : item.status;
          return {
            ...item,
            fields: updatedFields,
            status: newStatus,
          };
        })
      );
    },
    [onApproveField]
  );

  const handleRejectField = useCallback(
    (itemId: string, fieldKey: string) => {
      onRejectField?.(itemId, fieldKey);

      setItems((prevItems) =>
        prevItems.map((item) => {
          if (item.id !== itemId) return item;
          const updatedFields = item.fields.map((field) =>
            field.key === fieldKey ? { ...field, status: "rejected" as EnrichmentStatus } : field
          );
          const allResolved = updatedFields.every((f) => f.status !== "pending");
          const anyApproved = updatedFields.some((f) => f.status === "approved");
          const newStatus: EnrichmentStatus = allResolved
            ? anyApproved
              ? "approved"
              : "rejected"
            : item.status;
          return {
            ...item,
            fields: updatedFields,
            status: newStatus,
          };
        })
      );
    },
    [onRejectField]
  );

  const handleApproveItem = useCallback(
    async (itemId: string) => {
      onApproveItem?.(itemId);

      if (fetchFn) {
        try {
          const actionPromise = executeGovernedAction(
            {
              action: "product.enrichment.approve",
              endpoint: actionApiUrl,
              params: { enrichmentId: itemId },
            },
            {
              fetch: fetchFn,
              onStatusChange: (status, state) => { console.log("STATUS_CHANGE", status, state.approvalId);
                setActionStates((prev) => ({ ...prev, [itemId]: state }));
                if (state.status === "pending-approval") {
                  setItems((prev) =>
                    prev.map((item) =>
                      item.id === itemId
                        ? { ...item, approvalId: state.approvalId }
                        : item
                    )
                  );
                }
              },
            }
          );

          const result = await actionPromise;
          if (result.isPendingApproval) {
            setItems((prev) =>
              prev.map((item) =>
                item.id === itemId
                  ? { ...item, approvalId: result.approvalId }
                  : item
              )
            );
            return;
          }
        } catch {
          // Keep local transition on error / offline fallback
        }
      }

      setItems((prevItems) =>
        prevItems.map((item) => {
          if (item.id !== itemId) return item;
          return {
            ...item,
            status: "approved",
            fields: item.fields.map((f) => ({ ...f, status: "approved" })),
          };
        })
      );
    },
    [onApproveItem, fetchFn, actionApiUrl]
  );

  const handleRejectItem = useCallback(
    (itemId: string) => {
      onRejectItem?.(itemId);

      setItems((prevItems) =>
        prevItems.map((item) => {
          if (item.id !== itemId) return item;
          return {
            ...item,
            status: "rejected",
            fields: item.fields.map((f) => ({ ...f, status: "rejected" })),
          };
        })
      );
    },
    [onRejectItem]
  );

  return (
    <div
      className={`flex flex-col h-full w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-y-auto ${className}`}
      data-testid="enrichment-review-surface"
      data-entity-type={dataEntityType}
      data-entity-id={dataEntityId}
    >
      {/* Header Bar */}
      <header className="flex-none p-5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono text-xs font-semibold">
                {t("enrichment.queueBadge", "QUEUE")}
              </span>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                {title || t("enrichment.title", "Product Enrichment Review Queue")}
              </h1>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {t(
                "enrichment.subtitle",
                "Review AI-suggested product attribute enrichments against golden records before publication."
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className="text-xs font-mono px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
              data-testid="endpoint-indicator"
            >
              {actionApiUrl}
            </span>
          </div>
        </div>

        {/* ADR-0030 Policy Banner */}
        <aside
          className="mt-4 p-3.5 rounded-lg border border-amber-300 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 flex items-start gap-3 shadow-xs"
          data-testid="adr-0030-policy-banner"
          aria-label={t("enrichment.policy.title", "ADR-0030 Flagged Suggestions Policy")}
        >
          <span className="flex-none mt-0.5 text-amber-600 dark:text-amber-400">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </span>
          <div className="text-xs leading-relaxed">
            <span className="font-bold mr-1">
              {t("enrichment.policy.title", "ADR-0030 Policy")}:
            </span>
            <span>
              {t(
                "enrichment.policy.text",
                "AI enrichments are staged as flagged suggestions and must NEVER be treated as authoritative facts. Human verification and approval is required before merging into the product golden record."
              )}
            </span>
          </div>
        </aside>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {t("enrichment.kpi.totalQueue", "Total In Queue")}
            </div>
            <div
              className="mt-1 text-lg font-bold text-slate-800 dark:text-slate-100"
              data-testid="kpi-total-queue"
            >
              {counts.total}
            </div>
          </div>
          <div className="p-3 rounded-lg border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20">
            <div className="text-[11px] font-medium text-amber-700 dark:text-amber-400">
              {t("enrichment.kpi.pendingSuggestions", "Pending Flagged Suggestions")}
            </div>
            <div
              className="mt-1 text-lg font-bold text-amber-800 dark:text-amber-300"
              data-testid="kpi-pending-suggestions"
            >
              {counts.pending}
            </div>
          </div>
          <div className="p-3 rounded-lg border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20">
            <div className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
              {t("enrichment.kpi.approved", "Approved Enrichments")}
            </div>
            <div
              className="mt-1 text-lg font-bold text-emerald-800 dark:text-emerald-300"
              data-testid="kpi-approved"
            >
              {counts.approved}
            </div>
          </div>
          <div className="p-3 rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20">
            <div className="text-[11px] font-medium text-rose-700 dark:text-rose-400">
              {t("enrichment.kpi.rejected", "Rejected Enrichments")}
            </div>
            <div
              className="mt-1 text-lg font-bold text-rose-800 dark:text-rose-300"
              data-testid="kpi-rejected"
            >
              {counts.rejected}
            </div>
          </div>
        </div>
      </header>

      {/* Filter Tabs & Search Bar */}
      <div className="flex-none p-4 border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeFilter === "all"}
            onClick={() => setActiveFilter("all")}
            data-testid="tab-all"
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition ${
              activeFilter === "all"
                ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            {t("enrichment.filter.all", "All Suggestions")}
            <span className="ml-1.5 opacity-80">{`(${counts.total})`}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeFilter === "pending"}
            onClick={() => setActiveFilter("pending")}
            data-testid="tab-pending"
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition ${
              activeFilter === "pending"
                ? "bg-amber-600 text-white dark:bg-amber-500 dark:text-slate-950"
                : "text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/50"
            }`}
          >
            {t("enrichment.filter.pending", "Pending Review")}
            <span className="ml-1.5 opacity-80">{`(${counts.pending})`}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeFilter === "approved"}
            onClick={() => setActiveFilter("approved")}
            data-testid="tab-approved"
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition ${
              activeFilter === "approved"
                ? "bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950"
                : "text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
            }`}
          >
            {t("enrichment.filter.approved", "Approved")}
            <span className="ml-1.5 opacity-80">{`(${counts.approved})`}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeFilter === "rejected"}
            onClick={() => setActiveFilter("rejected")}
            data-testid="tab-rejected"
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition ${
              activeFilter === "rejected"
                ? "bg-rose-600 text-white dark:bg-rose-500 dark:text-slate-950"
                : "text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50"
            }`}
          >
            {t("enrichment.filter.rejected", "Rejected")}
            <span className="ml-1.5 opacity-80">{`(${counts.rejected})`}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder={t("enrichment.searchPlaceholder", "Search product, SKU, field...")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="enrichment-search-input"
            className="w-64 px-3 py-1.5 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Main Review List */}
      <main className="flex-1 p-5 space-y-6">
        {filteredItems.map((item) => {
          const actionState = actionStates[item.id];
          const isPendingGovApproval = Boolean(item.approvalId);

          return (
            <article
              key={item.id}
              data-testid={`enrichment-card-${item.id}`}
              className={`rounded-xl border transition shadow-xs overflow-hidden bg-white dark:bg-slate-900 ${
                selectedItemId === item.id
                  ? "border-blue-400 dark:border-blue-600 ring-1 ring-blue-400/50"
                  : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              {/* Product Header & AI Flagged Suggestion Metadata */}
              <div className="p-4 bg-slate-50/80 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onNavigate?.(`/e/PRODUCT/${item.productId}`, item)}
                      className="text-left font-bold text-base text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                    >
                      {item.productName}
                    </button>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold">
                      {item.productSku}
                    </span>
                    {item.manufacturer && (
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {item.manufacturer}
                      </span>
                    )}
                  </div>

                  {/* AI Suggestion Flag & Provenance Callout */}
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                    {/* Visual Suggestion Flag Badge (never fact) */}
                    <span
                      data-testid={`flagged-suggestion-${item.id}`}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-700"
                    >
                      <svg
                        className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{t("enrichment.badge.aiSuggestion", "Flagged AI Suggestion")}</span>
                    </span>

                    {/* Confidence score */}
                    <span
                      data-testid={`confidence-badge-${item.id}`}
                      className={`font-mono font-semibold px-2 py-0.5 rounded text-[11px] ${
                        item.confidence >= 0.9
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                      }`}
                    >
                      {`${Math.round(item.confidence * 100)}% ${t("enrichment.confidence", "Confidence")}`}
                    </span>

                    {/* Provenance source */}
                    <span className="text-slate-500 dark:text-slate-400">
                      {`${t("enrichment.source", "Source")}: ${item.source}`}
                    </span>
                    {item.sourceDocument && (
                      <span className="text-slate-400 font-mono text-[11px]">
                        {`(${item.sourceDocument})`}
                      </span>
                    )}
                  </div>
                </div>

                {/* Item-level bulk actions */}
                <div className="flex items-center gap-2">
                  {item.status === "pending" && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleRejectItem(item.id)}
                        data-testid={`btn-reject-item-${item.id}`}
                        className="px-3 py-1.5 text-xs font-semibold rounded-md border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                      >
                        {t("enrichment.actions.rejectAll", "Reject All")}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApproveItem(item.id)}
                        data-testid={`btn-approve-item-${item.id}`}
                        className="px-3 py-1.5 text-xs font-semibold rounded-md bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-xs"
                      >
                        {t("enrichment.actions.approveAll", "Approve All")}
                      </button>
                    </>
                  )}
                  {item.status !== "pending" && (
                    <span
                      data-testid={`item-status-${item.id}`}
                      className={`px-2.5 py-1 text-xs font-bold rounded-md uppercase tracking-wider ${
                        item.status === "approved"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                      }`}
                    >
                      {item.status === "approved"
                        ? t("enrichment.status.approved", "Approved")
                        : t("enrichment.status.rejected", "Rejected")}
                    </span>
                  )}
                </div>
              </div>

              {/* Governed Action Status Banner */}
              {actionState && <GovernedActionStatus state={actionState} />}

              {/* 202 Pending Approval Banner */}
              {isPendingGovApproval && (
                <div
                  data-testid={`enrichment-pending-approval-${item.id}`}
                  className="p-3 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-200 flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  <span>
                    {`${t("enrichment.governed.pending", "Pending Commercial Governance Approval")} (ID: ${item.approvalId})`}
                  </span>
                </div>
              )}

              {/* Golden-Record Diff Container (Requirement 2) */}
              <div
                className="p-4 space-y-4"
                data-testid={`golden-record-diff-${item.id}`}
              >
                {/* Diff Column Titles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-2 border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                    <span>{t("enrichment.goldenRecordHeader", "Current Golden Record (Authoritative)")}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>{t("enrichment.suggestedHeader", "AI Proposed Enrichment (Flagged Suggestion)")}</span>
                  </div>
                </div>

                {/* Diff Rows */}
                {item.fields.map((field) => {
                  const currentStr = formatValue(field.currentValue);
                  const suggestedStr = formatValue(field.suggestedValue);
                  const isPendingField = field.status === "pending";

                  return (
                    <div
                      key={field.key}
                      data-testid={`diff-row-${item.id}-${field.key}`}
                      className="p-3 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-2.5"
                    >
                      {/* Field Label & Reason */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {field.label}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">
                            {`(${field.key})`}
                          </span>
                        </div>

                        {/* Field level action buttons */}
                        <div className="flex items-center gap-1.5">
                          {isPendingField ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleRejectField(item.id, field.key)}
                                data-testid={`btn-reject-field-${item.id}-${field.key}`}
                                className="px-2.5 py-1 text-[11px] font-semibold rounded border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition"
                              >
                                {t("enrichment.actions.rejectField", "Reject")}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleApproveField(item.id, field.key)}
                                data-testid={`btn-approve-field-${item.id}-${field.key}`}
                                className="px-2.5 py-1 text-[11px] font-semibold rounded bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-2xs"
                              >
                                {t("enrichment.actions.acceptField", "Accept")}
                              </button>
                            </>
                          ) : (
                            <span
                              data-testid={`field-status-${item.id}-${field.key}`}
                              className={`text-[11px] font-bold px-2 py-0.5 rounded capitalize ${
                                field.status === "approved"
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                  : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                              }`}
                            >
                              {field.status === "approved"
                                ? t("enrichment.status.approved", "Approved")
                                : t("enrichment.status.rejected", "Rejected")}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Side-by-Side Golden Record Diff */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        {/* Current Golden Record Value */}
                        <div
                          data-testid={`diff-current-${item.id}-${field.key}`}
                          className="p-2.5 rounded-md border border-rose-200/70 dark:border-rose-950/60 bg-rose-50/40 dark:bg-rose-950/10 text-slate-700 dark:text-slate-300"
                        >
                          <div className="text-[10px] font-bold uppercase tracking-wider text-rose-800 dark:text-rose-400 mb-1">
                            {t("enrichment.tag.currentGolden", "Current (Golden Record)")}
                          </div>
                          <div className="font-mono break-words leading-relaxed">
                            {currentStr ? (
                              <span className="line-through decoration-rose-400 opacity-80">
                                {currentStr}
                              </span>
                            ) : (
                              <span className="italic text-slate-400 dark:text-slate-500">
                                {t("enrichment.nullValue", "— None (Not set) —")}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Suggested AI Value (Flagged) */}
                        <div
                          data-testid={`diff-suggested-${item.id}-${field.key}`}
                          className="p-2.5 rounded-md border border-emerald-300/80 dark:border-emerald-800/80 bg-emerald-50/60 dark:bg-emerald-950/20 text-emerald-950 dark:text-emerald-100"
                        >
                          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 mb-1">
                            <span>{t("enrichment.tag.aiSuggested", "Suggested (AI Enrichment)")}</span>
                            {field.confidence !== undefined && (
                              <span className="font-mono">
                                {`${Math.round(field.confidence * 100)}%`}
                              </span>
                            )}
                          </div>
                          <div className="font-mono break-words font-medium leading-relaxed">
                            {suggestedStr || (
                              <span className="italic text-slate-400 dark:text-slate-500">
                                {t("enrichment.emptyValue", "— Empty —")}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Reasoning / Extraction note */}
                      {field.reason && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 italic">
                          <span>{t("enrichment.reasonPrefix", "Reasoning")}:</span>
                          <span>{field.reason}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </article>
          );
        })}

        {filteredItems.length === 0 && (
          <div
            className="p-12 text-center rounded-xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900"
            data-testid="enrichment-empty-state"
          >
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              {t("enrichment.noItems", "No enrichment suggestions match the current criteria.")}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default EnrichmentReview;
