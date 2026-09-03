/* eslint-disable i18next/no-literal-string */
/* eslint-disable jsx-a11y/no-autofocus */
import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  DEFAULT_CATALOG_PRODUCTS,
  type ProductItem,
} from "../../shell/lens/product/CatalogBrowserLens";
import { useBOM } from "../../store/selectors/derived";
import { executeGovernedAction } from "../../shell/action/envelope";
import { GovernedActionStatus } from "../../shell/action/GovernedActionStatus";
import type { GovernedActionState } from "../../shell/action/types";

export type MatchTier = "hard_key" | "fuzzy" | "unmatched";
export type MatchStatus = "linked" | "proposed" | "unmatched" | "pending-approval";

export interface BomLineItem {
  id: string;
  lineNumber: number | string;
  rawText: string;
  partNumber?: string;
  sku?: string;
  manufacturer?: string;
  quantity?: number;
  unitPrice?: number;
  designators?: string[];
  matchTier?: MatchTier;
  status?: MatchStatus;
  matchedProductId?: string;
  matchedProduct?: ProductItem;
  confidence?: number;
  matchReasons?: string[];
  approvalId?: string;
}

export interface MatchWizardProps {
  title?: string;
  bomLines?: BomLineItem[];
  catalogProducts?: ProductItem[];
  fetchFn?: typeof fetch;
  actionApiUrl?: string;
  onNavigate?: (path: string, entity?: any) => void;
  onApplyMatches?: (matchedLines: BomLineItem[]) => void;
  onConfirmMatch?: (lineId: string, productId: string) => void;
  onRejectMatch?: (lineId: string) => void;
  onOverrideMatch?: (lineId: string, product: ProductItem) => void;
  initialFilter?: "all" | "merge-queue" | "hard-key" | "unmatched";
  className?: string;
}

export const DEFAULT_BOM_LINES: BomLineItem[] = [
  {
    id: "line-1",
    lineNumber: 1,
    rawText: "Bose FreeSpace FS2C In-Ceiling Loudspeaker White",
    partNumber: "FS2C-W-8R",
    manufacturer: "Bose Professional",
    quantity: 8,
  },
  {
    id: "line-2",
    lineNumber: 2,
    rawText: "QSC 6.5 inch ceiling speaker 200W",
    quantity: 4,
  },
  {
    id: "line-3",
    lineNumber: 3,
    rawText: "Custom Fabricated Steel Rack Support Arm 2U",
    quantity: 2,
  },
];

/**
 * ADR-0030 No-Guess Tiering matching function:
 * - Hard key links (exact primary key / SKU matches) are linked automatically as facts.
 * - Fuzzy matches (partial text / capability heuristics) are staged into the Merge Queue ONLY as proposals.
 * - Unmatched items require human search or manual assignment.
 */
function classifyBomLine(line: BomLineItem, catalog: ProductItem[]): BomLineItem {
  if (line.matchTier && line.status) {
    return line;
  }

  const normPart = (line.partNumber || line.sku || "").trim().toLowerCase();
  const normMfr = (line.manufacturer || "").trim().toLowerCase();
  const normRaw = line.rawText.toLowerCase();

  // Tier 1: Deterministic Hard Key Link (exact SKU or exact MFR + SKU)
  if (normPart) {
    const exactSkuProduct = catalog.find(
      (p) =>
        p.sku.toLowerCase() === normPart ||
        p.id.toLowerCase() === normPart ||
        normRaw.includes(p.sku.toLowerCase())
    );

    if (exactSkuProduct) {
      return {
        ...line,
        matchTier: "hard_key",
        status: "linked",
        confidence: 1.0,
        matchedProductId: exactSkuProduct.id,
        matchedProduct: exactSkuProduct,
        matchReasons: ["Deterministic hard-key SKU match: " + exactSkuProduct.sku],
      };
    }
  }

  // Tier 2: Heuristic / Fuzzy Match
  // Check token overlap and capability matching
  let bestCandidate: ProductItem | null = null;
  let bestScore = 0;
  const bestReasons: string[] = [];

  const rawWords = normRaw
    .replace(/[^\w\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);

  for (const product of catalog) {
    let score = 0;
    const reasons: string[] = [];

    // Manufacturer match
    if (
      (normMfr && product.manufacturer.toLowerCase().includes(normMfr)) ||
      normRaw.includes(product.manufacturer.toLowerCase())
    ) {
      score += 0.35;
      reasons.push(`Manufacturer match (${product.manufacturer})`);
    }

    // Capability match
    if (product.capabilities && product.capabilities.length > 0) {
      const matchedCaps = product.capabilities.filter((c) =>
        normRaw.includes(c.toLowerCase())
      );
      if (matchedCaps.length > 0) {
        score += Math.min(0.4, matchedCaps.length * 0.15);
        reasons.push(`Capabilities match (${matchedCaps.join(", ")})`);
      }
    }

    // Name / word similarity
    const pWords = product.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2);
    const sharedWords = rawWords.filter((w) => pWords.includes(w));
    if (sharedWords.length > 0) {
      score += Math.min(0.35, (sharedWords.length / Math.max(rawWords.length, 1)) * 0.4);
      reasons.push(`Term overlap (${sharedWords.join(", ")})`);
    }

    if (score > bestScore) {
      bestScore = score;
      bestCandidate = product;
      bestReasons.splice(0, bestReasons.length, ...reasons);
    }
  }

  // ADR-0030: If score meets fuzzy threshold, propose into Merge Queue (NEVER auto-link!)
  if (bestCandidate && bestScore >= 0.35) {
    return {
      ...line,
      matchTier: "fuzzy",
      status: "proposed",
      confidence: Math.min(0.95, Math.round(bestScore * 100) / 100),
      matchedProductId: bestCandidate.id,
      matchedProduct: bestCandidate,
      matchReasons: bestReasons,
    };
  }

  // Tier 3: Unmatched
  return {
    ...line,
    matchTier: "unmatched",
    status: "unmatched",
    confidence: 0,
    matchReasons: ["No high-confidence catalog candidate found"],
  };
}

export const MatchWizard: React.FC<MatchWizardProps> = ({
  title,
  bomLines: propBomLines,
  catalogProducts = DEFAULT_CATALOG_PRODUCTS,
  fetchFn,
  actionApiUrl,
  onNavigate,
  onApplyMatches,
  onConfirmMatch,
  onRejectMatch,
  onOverrideMatch,
  initialFilter = "all",
  className = "",
}) => {
  const { t } = useTranslation();
  const hookBOM = useBOM();

  // Convert hook BOM lines if propBomLines not provided
  const initialLines = useMemo(() => {
    if (propBomLines && propBomLines.length > 0) {
      return propBomLines;
    }
    if (hookBOM && hookBOM.length > 0) {
      return hookBOM.map((b, idx) => ({
        id: `bom-${idx + 1}`,
        lineNumber: idx + 1,
        rawText: `${b.manufacturer} ${b.name}`,
        manufacturer: b.manufacturer,
        quantity: b.quantity,
        unitPrice: b.unitPrice,
        designators: b.designators,
      }));
    }
    return DEFAULT_BOM_LINES;
  }, [propBomLines, hookBOM]);

  // Classified lines
  const [lines, setLines] = useState<BomLineItem[]>(() =>
    initialLines.map((l) => classifyBomLine(l, catalogProducts))
  );

  useEffect(() => {
    setLines(initialLines.map((l) => classifyBomLine(l, catalogProducts)));
  }, [initialLines, catalogProducts]);

  const [activeTab, setActiveTab] = useState<"all" | "merge-queue" | "hard-key" | "unmatched">(
    initialFilter
  );

  // Manual matching modal state
  const [searchingLineId, setSearchingLineId] = useState<string | null>(null);
  const [catalogSearchTerm, setCatalogSearchTerm] = useState("");

  // Governed action states per line
  const [actionStates, setActionStates] = useState<Record<string, GovernedActionState<any>>>({});

  // Summary counts
  const counts = useMemo(() => {
    const total = lines.length;
    const hardKey = lines.filter((l) => l.matchTier === "hard_key" && l.status === "linked").length;
    const fuzzyProposals = lines.filter((l) => l.status === "proposed").length;
    const unmatched = lines.filter((l) => l.status === "unmatched").length;
    const confirmedFuzzy = lines.filter((l) => l.matchTier === "fuzzy" && l.status === "linked").length;
    return { total, hardKey, fuzzyProposals, unmatched, confirmedFuzzy };
  }, [lines]);

  // Filtered lines for display
  const displayedLines = useMemo(() => {
    switch (activeTab) {
      case "merge-queue":
        return lines.filter((l) => l.status === "proposed");
      case "hard-key":
        return lines.filter((l) => l.matchTier === "hard_key");
      case "unmatched":
        return lines.filter((l) => l.status === "unmatched");
      default:
        return lines;
    }
  }, [lines, activeTab]);

  // Filter catalog products for modal search
  const filteredCatalog = useMemo(() => {
    if (!catalogSearchTerm.trim()) return catalogProducts;
    const searchTokens = catalogSearchTerm.toLowerCase().split(/\s+/).filter(Boolean);
    return catalogProducts.filter((p) => {
      const targetText = [
        p.name,
        p.sku,
        p.manufacturer,
        ...(p.capabilities || []),
      ]
        .join(" ")
        .toLowerCase();
      return searchTokens.every((token) => targetText.includes(token));
    });
  }, [catalogProducts, catalogSearchTerm]);

  // Handle Confirm Proposal
  const handleConfirmProposal = useCallback(
    async (lineId: string) => {
      const target = lines.find((l) => l.id === lineId);
      if (!target || !target.matchedProduct) return;
      const productId = target.matchedProduct.id;

      onConfirmMatch?.(lineId, productId);

      // If fetchFn provided, execute governed action
      if (fetchFn) {
        try {
          const actionPromise = executeGovernedAction(
            {
              action: "product_match_bom_line",
              url: actionApiUrl || "/api/actions/product_match_bom_line",
              params: {
                bom_line_id: lineId,
                product_id: productId,
                decision: "accept",
              },
            },
            {
              fetchFn,
              onStatusChange: (status, state) => {
                setActionStates((prev) => ({ ...prev, [lineId]: state }));
                if (status === "pending-approval") {
                  setLines((prev) =>
                    prev.map((l) =>
                      l.id === lineId
                        ? { ...l, status: "pending-approval", approvalId: state.approvalId }
                        : l
                    )
                  );
                } else if (status === "resolved") {
                  setLines((prev) =>
                    prev.map((l) =>
                      l.id === lineId
                        ? { ...l, status: "linked", matchReasons: ["Confirmed via governed action"] }
                        : l
                    )
                  );
                }
              },
            }
          );

          const result = await actionPromise;
          if (result.isResolved) {
            setLines((prev) =>
              prev.map((l) =>
                l.id === lineId
                  ? { ...l, status: "linked", matchReasons: ["Confirmed via governed action"] }
                  : l
              )
            );
          }
          return;
        } catch (err) {
          console.warn("Governed action error:", err);
        }
      }

      // Default local transition to linked
      setLines((prev) =>
        prev.map((l) =>
          l.id === lineId
            ? {
                ...l,
                status: "linked",
                matchReasons: [
                  ...(l.matchReasons || []),
                  "Human confirmed into active design BOM",
                ],
              }
            : l
        )
      );
    },
    [lines, onConfirmMatch, fetchFn, actionApiUrl]
  );

  // Handle Reject Proposal
  const handleRejectProposal = useCallback(
    (lineId: string) => {
      onRejectMatch?.(lineId);
      setLines((prev) =>
        prev.map((l) =>
          l.id === lineId
            ? {
                ...l,
                matchTier: "unmatched",
                status: "unmatched",
                matchedProductId: undefined,
                matchedProduct: undefined,
                confidence: 0,
                matchReasons: ["Proposal rejected by reviewer"],
              }
            : l
        )
      );
    },
    [onRejectMatch]
  );

  // Handle Manual Override
  const handleSelectProduct = useCallback(
    (product: ProductItem) => {
      if (!searchingLineId) return;
      onOverrideMatch?.(searchingLineId, product);

      setLines((prev) =>
        prev.map((l) =>
          l.id === searchingLineId
            ? {
                ...l,
                matchTier: "hard_key",
                status: "linked",
                confidence: 1.0,
                matchedProductId: product.id,
                matchedProduct: product,
                matchReasons: ["Manually selected from catalog: " + product.sku],
              }
            : l
        )
      );

      setSearchingLineId(null);
      setCatalogSearchTerm("");
    },
    [searchingLineId, onOverrideMatch]
  );

  return (
    <div
      data-testid="match-wizard-surface"
      className={`flex flex-col h-full w-full bg-[var(--copper-surface,#f8fafc)] dark:bg-[var(--copper-surface-dim,#0f172a)] text-[var(--copper-on-surface,#1e293b)] overflow-hidden font-sans ${className}`}
    >
      {/* Header bar */}
      <div className="flex-none p-6 border-b border-[var(--copper-outline-variant,#e2e8f0)] dark:border-slate-800 bg-[var(--copper-surface-container,#ffffff)] dark:bg-slate-900">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {title || t("matchWizard.title", "BOM Match Wizard")}
            </h1>
            <p className="text-sm text-[var(--copper-text-secondary,#64748b)]">
              {t(
                "matchWizard.subtitle",
                "Automated BOM-line matching with ADR-0030 no-guess tiering & governed action envelope"
              )}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate("/e/PRODUCT")}
                className="px-3 py-1.5 text-xs font-medium border border-[var(--copper-outline-variant,#cbd5e1)] rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                {t("matchWizard.backToCatalog", "Catalog Browser")}
              </button>
            )}
            <button
              type="button"
              onClick={() => onApplyMatches?.(lines)}
              className="px-4 py-2 text-xs font-semibold bg-[var(--copper-primary,#0284c7)] text-white rounded-md shadow-sm hover:opacity-90 transition"
            >
              {t("matchWizard.applyToQuote", "Apply Matched BOM")}
            </button>
          </div>
        </div>

        {/* ADR-0030 Compliance Policy Banner */}
        <div
          data-testid="adr-0030-policy-banner"
          className="mt-3 p-3 rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5"
        >
          <span className="font-bold uppercase tracking-wider bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100 px-1.5 py-0.5 rounded text-[10px]">
            ADR-0030
          </span>
          <div>
            <strong>No-Guess Tiering Active:</strong> Deterministic hard-key links are accepted as
            facts. Fuzzy matches are staged in the <strong>Merge Queue</strong> as proposals
            requiring explicit human confirmation — never silently auto-linked.
          </div>
        </div>

        {/* KPI metrics bar */}
        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="p-3 bg-[var(--copper-surface-container-low,#f1f5f9)] dark:bg-slate-800/60 rounded-lg border border-[var(--copper-outline-variant,#e2e8f0)] dark:border-slate-800">
            <div className="text-xs text-slate-500 font-medium">Total BOM Lines</div>
            <div className="text-xl font-bold mt-1" data-testid="kpi-total-lines">
              {counts.total}
            </div>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg border border-emerald-200 dark:border-emerald-800/40">
            <div className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
              Hard Key Matches (Linked)
            </div>
            <div
              className="text-xl font-bold mt-1 text-emerald-800 dark:text-emerald-300"
              data-testid="kpi-hard-key-matches"
            >
              {counts.hardKey}
            </div>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800/40">
            <div className="text-xs text-amber-700 dark:text-amber-400 font-medium">
              Merge Queue (Fuzzy Proposals)
            </div>
            <div
              className="text-xl font-bold mt-1 text-amber-800 dark:text-amber-300"
              data-testid="kpi-fuzzy-proposals"
            >
              {counts.fuzzyProposals}
            </div>
          </div>
          <div className="p-3 bg-slate-100 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-800">
            <div className="text-xs text-slate-500 font-medium">Unmatched Lines</div>
            <div className="text-xl font-bold mt-1 text-slate-700 dark:text-slate-300" data-testid="kpi-unmatched">
              {counts.unmatched}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex-none px-6 pt-3 border-b border-[var(--copper-outline-variant,#e2e8f0)] dark:border-slate-800 flex gap-2 bg-[var(--copper-surface-container-low,#f8fafc)] dark:bg-slate-900">
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          data-testid="tab-all-lines"
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition ${
            activeTab === "all"
              ? "border-[var(--copper-primary,#0284c7)] text-[var(--copper-primary,#0284c7)]"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          All Lines ({counts.total})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("merge-queue")}
          data-testid="tab-merge-queue"
          className={`px-4 py-2 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition ${
            activeTab === "merge-queue"
              ? "border-amber-500 text-amber-600 dark:text-amber-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <span>Merge Queue Proposals</span>
          <span
            data-testid="merge-queue-proposals-count"
            className="px-1.5 py-0.2 text-[10px] rounded-full bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200"
          >
            {counts.fuzzyProposals}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("hard-key")}
          data-testid="tab-hard-key"
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition ${
            activeTab === "hard-key"
              ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          Hard Key Links ({counts.hardKey})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("unmatched")}
          data-testid="tab-unmatched"
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition ${
            activeTab === "unmatched"
              ? "border-slate-600 text-slate-700 dark:text-slate-300"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          Unmatched ({counts.unmatched})
        </button>
      </div>

      {/* Main content list */}
      <div className="flex-1 overflow-auto p-6 space-y-4">
        {displayedLines.map((line) => {
          const actionState = actionStates[line.id];
          const isPending = line.status === "pending-approval";
          const isProposed = line.status === "proposed";
          const isLinked = line.status === "linked";
          const isUnmatched = line.status === "unmatched";

          return (
            <div
              key={line.id}
              data-testid={`bom-line-${line.id}`}
              className={`p-5 rounded-lg border bg-[var(--copper-surface-container,#ffffff)] dark:bg-slate-900 shadow-sm transition ${
                isProposed
                  ? "border-amber-300 dark:border-amber-800 ring-1 ring-amber-300/50"
                  : isLinked
                  ? "border-emerald-300 dark:border-emerald-800/60"
                  : "border-slate-200 dark:border-slate-800"
              }`}
            >
              <div className="flex justify-between items-start gap-4">
                {/* Left: BOM line details */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                      Line #{line.lineNumber}
                    </span>
                    <h3 className="font-semibold text-base">{line.rawText}</h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-500">
                    {line.partNumber && (
                      <span>
                        Part #: <strong className="font-mono text-slate-700 dark:text-slate-300">{line.partNumber}</strong>
                      </span>
                    )}
                    {line.manufacturer && (
                      <span>
                        Mfr: <strong className="text-slate-700 dark:text-slate-300">{line.manufacturer}</strong>
                      </span>
                    )}
                    {line.quantity !== undefined && (
                      <span>
                        Qty: <strong className="text-slate-700 dark:text-slate-300">{line.quantity}</strong>
                      </span>
                    )}
                  </div>

                  {/* Matched product / Candidate details */}
                  {line.matchedProduct && (
                    <div className="mt-3.5 p-3 rounded-md bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-[11px] text-slate-400 uppercase font-semibold">
                            {isProposed ? "Proposed Candidate (Merge Queue):" : "Linked Catalog Product:"}
                          </div>
                          <div className="font-bold text-sm text-slate-800 dark:text-slate-100 mt-0.5">
                            {line.matchedProduct.name}
                          </div>
                          <div className="text-slate-500 mt-0.5">
                            SKU: <span className="font-mono">{line.matchedProduct.sku}</span> · Mfr:{" "}
                            {line.matchedProduct.manufacturer} · Price: {line.matchedProduct.pricing.currency}{" "}
                            {line.matchedProduct.pricing.listPrice}
                          </div>
                        </div>

                        {line.confidence !== undefined && (
                          <div className="text-right">
                            <span
                              className={`inline-block px-2 py-0.5 rounded font-mono text-[11px] font-bold ${
                                line.confidence >= 0.95
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                  : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                              }`}
                            >
                              {(line.confidence * 100).toFixed(0)}% Match
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Match reasons */}
                      {line.matchReasons && line.matchReasons.length > 0 && (
                        <div className="mt-2 text-[11px] text-slate-500">
                          Reasons: {line.matchReasons.join(" · ")}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Governed Action Status Banner */}
                  {actionState && <GovernedActionStatus state={actionState} />}

                  {/* Pending approval notification */}
                  {isPending && (
                    <div
                      data-testid="bom-line-pending-approval"
                      className="mt-2 p-2 rounded bg-amber-50 dark:bg-amber-950/30 border border-amber-300 text-xs text-amber-800 dark:text-amber-200 flex items-center gap-2"
                    >
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      <span>
                        Approval required: Pending commercial approval (ID:{" "}
                        <span className="font-mono">{line.approvalId}</span>)
                      </span>
                    </div>
                  )}
                </div>

                {/* Right: Tier badges & Action buttons */}
                <div className="flex flex-col items-end gap-2.5 flex-none">
                  {/* Tier status badge */}
                  <div>
                    {line.matchTier === "hard_key" && (
                      <span
                        data-testid="badge-tier-hard-key"
                        className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                      >
                        ✓ Hard Key (Linked)
                      </span>
                    )}

                    {line.matchTier === "fuzzy" && isProposed && (
                      <span
                        data-testid="badge-tier-fuzzy"
                        className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
                      >
                        ? Fuzzy Proposal
                      </span>
                    )}

                    {line.matchTier === "fuzzy" && isLinked && (
                      <span
                        data-testid="badge-tier-fuzzy-confirmed"
                        className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                      >
                        ✓ Confirmed (Linked)
                      </span>
                    )}

                    {isUnmatched && (
                      <span
                        data-testid="badge-tier-unmatched"
                        className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-300 dark:border-slate-700"
                      >
                        ∅ Unmatched
                      </span>
                    )}
                  </div>

                  {/* Proposal Flag banner for ADR-0030 */}
                  {isProposed && (
                    <div
                      data-testid={`proposal-flag-${line.id}`}
                      className="text-[11px] font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900"
                    >
                      Proposal (Pending Confirmation)
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-1">
                    {isProposed && (
                      <>
                        <button
                          type="button"
                          data-testid={`btn-reject-proposal-${line.id}`}
                          onClick={() => handleRejectProposal(line.id)}
                          className="px-2.5 py-1 text-xs font-medium border border-rose-200 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded transition"
                        >
                          Reject
                        </button>
                        <button
                          type="button"
                          data-testid={`btn-confirm-proposal-${line.id}`}
                          onClick={() => handleConfirmProposal(line.id)}
                          className="px-3 py-1 text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 rounded shadow-sm transition"
                        >
                          Confirm Link
                        </button>
                      </>
                    )}

                    {(isUnmatched || isLinked) && (
                      <button
                        type="button"
                        data-testid={`btn-match-manual-${line.id}`}
                        onClick={() => {
                          setSearchingLineId(line.id);
                          setCatalogSearchTerm("");
                        }}
                        className="px-3 py-1 text-xs font-medium border border-[var(--copper-outline-variant,#cbd5e1)] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition"
                      >
                        {isLinked ? "Change / Override" : "Search Catalog"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {displayedLines.length === 0 && (
          <div className="text-center py-12 text-slate-400 text-sm">
            No BOM lines found in this view filter.
          </div>
        )}
      </div>

      {/* Manual Search Modal */}
      {searchingLineId && (
        <div
          data-testid="catalog-match-modal"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base">Select Product from Catalog</h3>
                <p className="text-xs text-slate-500">
                  Search by SKU, manufacturer, or capability (e.g. &quot;PoE++ 24p&quot;, &quot;8Ω 200W ceiling&quot;)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSearchingLineId(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-4 border-b border-slate-200 dark:border-slate-800">
              <input
                type="text"
                data-testid="modal-catalog-search-input"
                placeholder="Search catalog or enter capability query..."
                value={catalogSearchTerm}
                onChange={(e) => setCatalogSearchTerm(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
                autoFocus
              />
            </div>

            <div className="flex-1 overflow-auto p-4 space-y-2">
              {filteredCatalog.map((product) => (
                <div
                  key={product.id}
                  className="p-3 border rounded-lg border-slate-200 dark:border-slate-800 hover:border-sky-400 dark:hover:border-sky-600 flex justify-between items-center transition"
                >
                  <div>
                    <div className="font-semibold text-sm">{product.name}</div>
                    <div className="text-xs text-slate-500">
                      SKU: <span className="font-mono">{product.sku}</span> · Mfr:{" "}
                      {product.manufacturer} · {product.pricing.currency} {product.pricing.listPrice}
                    </div>
                    {product.capabilities && product.capabilities.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {product.capabilities.map((c) => (
                          <span
                            key={c}
                            className="px-1.5 py-0.5 text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    data-testid={`btn-select-${product.id}`}
                    onClick={() => handleSelectProduct(product)}
                    className="px-3 py-1.5 text-xs font-semibold bg-sky-600 text-white hover:bg-sky-700 rounded-md transition"
                  >
                    Select
                  </button>
                </div>
              ))}

              {filteredCatalog.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No matching products found in catalog.
                </div>
              )}
            </div>

            <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex justify-end">
              <button
                type="button"
                onClick={() => setSearchingLineId(null)}
                className="px-3 py-1.5 text-xs font-medium border border-slate-300 dark:border-slate-700 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchWizard;
