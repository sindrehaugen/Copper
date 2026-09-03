import React, { useState, useMemo, useCallback } from "react";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import { useBOM } from "../../store/selectors/derived";
import { executeGovernedAction, createInitialActionState } from "../../shell/action/envelope";
import { GovernedActionStatus } from "../../shell/action/GovernedActionStatus";
import type { GovernedActionState } from "../../shell/action/types";
import type { QuoteLineItem, QuoteData } from "./QuoteViewer";

export interface QuoteBuilderProps {
  entityId?: string | undefined;
  entityType?: string | undefined;
  data?: QuoteData | null | undefined;
  onNavigate?: ((path: string, entity?: any) => void) | undefined;
  onSave?: ((quote: QuoteData) => void) | undefined;
  onSubmit?: ((quote: QuoteData) => Promise<void> | void) | undefined;
  actionApiUrl?: string | undefined;
  fetchFn?: typeof fetch | undefined;
  className?: string | undefined;
  "data-entity-type"?: string | undefined;
  "data-entity-id"?: string | undefined;
}

function formatNumber(val: number): string {
  if (!Number.isFinite(val)) return "0";
  return val.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function formatCurrency(val: number, currency: string): string {
  return `${currency} ${formatNumber(val)}`;
}

export const QuoteBuilder: FC<QuoteBuilderProps> = ({
  entityId = "",
  entityType = "QUOTE",
  data: initialData,
  onSave,
  onSubmit,
  actionApiUrl = "/api/sales/quotes",
  fetchFn,
  className = "",
  "data-entity-type": dataEntityType,
  "data-entity-id": dataEntityId,
}) => {
  const { t } = useTranslation();
  const bomItems = useBOM();

  const [quoteId] = useState<string>(
    () => initialData?.id || entityId || `quo-${Date.now().toString(36)}`
  );
  const [title, setTitle] = useState<string>(
    () => initialData?.title || ""
  );
  const [customerName, setCustomerName] = useState<string>(
    () => initialData?.customerName || ""
  );
  const [customerId, setCustomerId] = useState<string>(
    () => initialData?.customerId || ""
  );
  const [status, setStatus] = useState<string>(
    () => initialData?.status || "draft"
  );
  const [version] = useState<string>(
    () => initialData?.version || "v1.0"
  );
  const [currency, setCurrency] = useState<string>(
    () => initialData?.currency || "EUR"
  );
  const [validUntil, setValidUntil] = useState<string>(
    () => initialData?.validUntil || ""
  );
  const [taxPercent, setTaxPercent] = useState<number>(
    () => initialData?.taxPercent ?? 25
  );
  const [internalNotes, setInternalNotes] = useState<string>(
    () => initialData?.internalNotes || ""
  );
  const [lineItems, setLineItems] = useState<QuoteLineItem[]>(
    () => initialData?.lineItems ? [...initialData.lineItems] : []
  );

  const [actionState, setActionState] = useState<GovernedActionState<any>>(() =>
    createInitialActionState()
  );
  const [saveNotice, setSaveNotice] = useState(false);

  // Financial calculations and margin calculation
  // Formula: Margin = (Total Price - Total Cost) / Total Price * 100
  const calculations = useMemo(() => {
    const subtotal = lineItems.reduce((acc, item) => {
      const lineTotal = item.totalPrice !== undefined
        ? item.totalPrice
        : item.quantity * item.unitPrice;
      return acc + lineTotal;
    }, 0);

    const totalCost = lineItems.reduce((acc, item) => {
      const itemCost = item.unitCost !== undefined ? item.unitCost : 0;
      return acc + item.quantity * itemCost;
    }, 0);

    const taxAmount = (subtotal * taxPercent) / 100;
    const grandTotal = subtotal + taxAmount;

    const rawMargin = subtotal > 0 ? ((subtotal - totalCost) / subtotal) * 100 : 0;
    const marginPercent = Math.round(rawMargin * 10) / 10;

    let marginTier: "healthy" | "moderate" | "critical" = "moderate";
    if (marginPercent >= 35) {
      marginTier = "healthy";
    } else if (marginPercent < 15) {
      marginTier = "critical";
    } else {
      marginTier = "moderate";
    }

    return {
      subtotal,
      totalCost,
      taxAmount,
      grandTotal,
      marginPercent,
      marginTier,
    };
  }, [lineItems, taxPercent]);

  // Import items from design BOM
  const handleImportBOM = useCallback(() => {
    if (!bomItems || bomItems.length === 0) return;

    const imported: QuoteLineItem[] = bomItems.map((item, idx) => {
      const cost = item.unitPrice ?? 0;
      // Default selling price set with standard markup (~37.5% margin)
      const price = cost > 0 ? Math.round(cost * 1.6) : 100;
      const quantity = item.quantity > 0 ? item.quantity : 1;

      return {
        id: `bom-${item.deviceTypeId}-${idx}-${Date.now()}`,
        name: item.name,
        sku: item.deviceTypeId,
        manufacturer: item.manufacturer,
        quantity,
        unitCost: cost,
        unitPrice: price,
        totalPrice: price * quantity,
        designators: item.designators,
      };
    });

    setLineItems((prev) => [...prev, ...imported]);
  }, [bomItems]);

  // Add manual line item
  const handleAddManualItem = useCallback(() => {
    const newItem: QuoteLineItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: "",
      sku: "",
      manufacturer: "",
      quantity: 1,
      unitCost: 0,
      unitPrice: 0,
      totalPrice: 0,
      description: "",
    };
    setLineItems((prev) => [...prev, newItem]);
  }, []);

  // Update a single line item
  const handleUpdateLineItem = useCallback(
    (id: string, field: keyof QuoteLineItem, value: any) => {
      setLineItems((prev) =>
        prev.map((item) => {
          if (item.id !== id) return item;
          const updated = { ...item, [field]: value };
          if (field === "quantity" || field === "unitPrice") {
            const qty = field === "quantity" ? Number(value) || 0 : item.quantity;
            const price = field === "unitPrice" ? Number(value) || 0 : item.unitPrice;
            updated.totalPrice = qty * price;
          }
          return updated;
        })
      );
    },
    []
  );

  // Delete line item
  const handleDeleteLineItem = useCallback((id: string) => {
    setLineItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // Save draft quote
  const handleSaveQuote = useCallback(() => {
    const quotePayload: QuoteData = {
      id: quoteId,
      title: title || t("quote.builder.defaultTitle", "Commercial Offer"),
      customerName,
      customerId,
      status,
      version,
      currency,
      validUntil,
      subtotal: calculations.subtotal,
      taxPercent,
      taxAmount: calculations.taxAmount,
      total: calculations.grandTotal,
      marginPercent: calculations.marginPercent,
      internalNotes,
      lineItems,
    };

    onSave?.(quotePayload);
    setSaveNotice(true);
    setTimeout(() => setSaveNotice(false), 2500);
  }, [
    quoteId,
    title,
    t,
    customerName,
    customerId,
    status,
    version,
    currency,
    validUntil,
    calculations,
    taxPercent,
    internalNotes,
    lineItems,
    onSave,
  ]);

  // Submit quote via executeGovernedAction
  const handleSubmitQuote = useCallback(async () => {
    const quotePayload: QuoteData = {
      id: quoteId,
      title: title || t("quote.builder.defaultTitle", "Commercial Offer"),
      customerName,
      customerId,
      status: "in_review",
      version,
      currency,
      validUntil,
      subtotal: calculations.subtotal,
      taxPercent,
      taxAmount: calculations.taxAmount,
      total: calculations.grandTotal,
      marginPercent: calculations.marginPercent,
      internalNotes,
      lineItems,
    };

    onSubmit?.(quotePayload);

    try {
      const actionPromise = executeGovernedAction<any, { quote: QuoteData }>(
        {
          action: "sales.quote.submit",
          url: actionApiUrl,
          params: {
            quote: quotePayload,
          },
        },
        {
          fetchFn,
          onStatusChange: (_status, state) => {
            setActionState(state);
          },
        }
      );

      const result = await actionPromise;
      setActionState(result);
      if (result.isResolved) {
        setStatus("approved");
      } else if (result.isPendingApproval) {
        setStatus("in_review");
      }
      return result;
    } catch {
      // errors tracked in actionState
    }
  }, [
    quoteId,
    title,
    t,
    customerName,
    customerId,
    version,
    currency,
    validUntil,
    calculations,
    taxPercent,
    internalNotes,
    lineItems,
    onSubmit,
    actionApiUrl,
    fetchFn,
  ]);

  return (
    <div
      data-testid="quote-builder"
      data-entity-type={dataEntityType ?? entityType}
      data-entity-id={dataEntityId ?? quoteId}
      className={`copper-quote-builder p-6 flex flex-col gap-6 max-w-7xl mx-auto w-full bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] ${className}`}
    >
      {/* 1. Header Toolbar */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--md-sys-color-outline-variant)]">
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <span className="text-xl" role="img" aria-label={t("quote.builder.builderIcon", "Quote Builder")}>
              {t("quote.builder.iconDoc", "📝")}
            </span>
            <div className="flex-1 max-w-xl">
              <input
                type="text"
                data-testid="input-quote-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("quote.builder.titlePlaceholder", "Commercial Quote Title...")}
                className="w-full text-xl font-bold px-3 py-1.5 rounded-lg border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)] text-[var(--md-sys-color-on-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--copper-primary)]"
              />
            </div>
            <span
              data-testid="quote-status-badge"
              className="text-xs font-semibold uppercase px-2.5 py-0.5 rounded-full bg-neutral-200 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200"
            >
              {status}
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)]">
              {version}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--md-sys-color-on-surface-variant)] mt-1">
            <span>
              <strong className="font-semibold">{t("quote.builder.idLabel", "ID:")}</strong>
              <span className="ml-1 font-mono">{quoteId}</span>
            </span>
            {customerName && (
              <span>
                <strong className="font-semibold">{t("quote.builder.customerLabel", "Customer:")}</strong>
                <span className="ml-1">{customerName}</span>
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            data-testid="btn-import-bom"
            onClick={handleImportBOM}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)] hover:bg-[var(--md-sys-color-surface-container-highest)] cursor-pointer flex items-center gap-1.5 transition-colors"
          >
            <span>{t("quote.builder.importBomIcon", "📥")}</span>
            <span>{t("quote.builder.importBom", "Import from BOM")}</span>
            <span className="font-mono text-[11px] opacity-75">
              {`(${bomItems?.length ?? 0})`}
            </span>
          </button>

          <button
            type="button"
            data-testid="btn-add-line-item"
            onClick={handleAddManualItem}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)] hover:bg-[var(--md-sys-color-surface-container-highest)] cursor-pointer flex items-center gap-1.5 transition-colors"
          >
            <span>{t("quote.builder.addItemIcon", "➕")}</span>
            <span>{t("quote.builder.addItem", "Add Line Item")}</span>
          </button>

          <button
            type="button"
            data-testid="btn-save-quote"
            onClick={handleSaveQuote}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)] hover:opacity-90 cursor-pointer transition-opacity"
          >
            {t("quote.builder.saveDraft", "Save Draft")}
          </button>

          <button
            type="button"
            data-testid="btn-submit-quote"
            onClick={handleSubmitQuote}
            disabled={actionState.isSubmitting}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[var(--copper-primary)] text-white border-none hover:opacity-90 disabled:opacity-50 cursor-pointer transition-opacity shadow-sm"
          >
            {actionState.isSubmitting
              ? t("quote.builder.submitting", "Submitting...")
              : t("quote.builder.submitQuote", "Submit Quote")}
          </button>
        </div>
      </header>

      {/* Governed Action Status Banner */}
      <GovernedActionStatus
        state={actionState}
        actionName={t("quote.builder.actionName", "Commercial Quote Submission")}
      />

      {/* Save feedback toast */}
      {saveNotice && (
        <div
          data-testid="quote-save-notice"
          className="p-3 rounded-lg bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-800 text-xs font-medium"
        >
          {t("quote.builder.draftSaved", "Quote draft saved successfully.")}
        </div>
      )}

      {/* 2. Metadata Editor Section */}
      <section
        data-testid="quote-builder-metadata"
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]"
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="qb-customer-name" className="text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)]">
            {t("quote.builder.customerNameLabel", "Customer Name")}
          </label>
          <input
            id="qb-customer-name"
            type="text"
            data-testid="input-customer-name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder={t("quote.builder.customerPlaceholder", "Enter customer name...")}
            className="px-3 py-1.5 text-xs rounded-lg border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] focus:outline-none focus:ring-1 focus:ring-[var(--copper-primary)]"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="qb-customer-id" className="text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)]">
            {t("quote.builder.customerIdLabel", "Customer ID")}
          </label>
          <input
            id="qb-customer-id"
            type="text"
            data-testid="input-customer-id"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            placeholder={t("quote.builder.customerIdPlaceholder", "e.g. cust-001")}
            className="px-3 py-1.5 text-xs font-mono rounded-lg border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] focus:outline-none focus:ring-1 focus:ring-[var(--copper-primary)]"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="qb-currency" className="text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)]">
            {t("quote.builder.currencyLabel", "Currency")}
          </label>
          <select
            id="qb-currency"
            data-testid="input-currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] focus:outline-none focus:ring-1 focus:ring-[var(--copper-primary)]"
          >
            <option value="EUR">{t("quote.builder.currEur", "EUR (€)")}</option>
            <option value="USD">{t("quote.builder.currUsd", "USD ($)")}</option>
            <option value="GBP">{t("quote.builder.currGbp", "GBP (£)")}</option>
            <option value="NOK">{t("quote.builder.currNok", "NOK (kr)")}</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="qb-valid-until" className="text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)]">
            {t("quote.builder.validUntilLabel", "Valid Until")}
          </label>
          <input
            id="qb-valid-until"
            type="date"
            data-testid="input-valid-until"
            value={validUntil}
            onChange={(e) => setValidUntil(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] focus:outline-none focus:ring-1 focus:ring-[var(--copper-primary)]"
          />
        </div>

        <div className="col-span-1 sm:col-span-2 md:col-span-1 flex flex-col gap-1">
          <label htmlFor="qb-tax-percent" className="text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)]">
            {t("quote.builder.taxPercentLabel", "Tax / VAT (%)")}
          </label>
          <input
            id="qb-tax-percent"
            type="number"
            min="0"
            max="100"
            step="0.5"
            data-testid="input-tax-percent"
            value={taxPercent}
            onChange={(e) => setTaxPercent(parseFloat(e.target.value) || 0)}
            className="px-3 py-1.5 text-xs font-mono rounded-lg border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] focus:outline-none focus:ring-1 focus:ring-[var(--copper-primary)]"
          />
        </div>

        <div className="col-span-1 sm:col-span-2 md:col-span-3 flex flex-col gap-1">
          <label htmlFor="qb-internal-notes" className="text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)]">
            {t("quote.builder.internalNotesLabel", "Internal Notes & Approval Context")}
          </label>
          <textarea
            id="qb-internal-notes"
            data-testid="input-internal-notes"
            rows={2}
            value={internalNotes}
            onChange={(e) => setInternalNotes(e.target.value)}
            placeholder={t("quote.builder.internalNotesPlaceholder", "Notes visible only to commercial internal team...")}
            className="px-3 py-1.5 text-xs rounded-lg border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] focus:outline-none focus:ring-1 focus:ring-[var(--copper-primary)] resize-none"
          />
        </div>
      </section>

      {/* 3. Financial Metrics and Margin Advisory */}
      <section
        data-testid="quote-financial-summary"
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4"
      >
        {/* Total Cost */}
        <div className="p-4 rounded-xl bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)] flex flex-col gap-1">
          <span className="text-xs font-medium text-[var(--md-sys-color-on-surface-variant)]">
            {t("quote.builder.totalCost", "Total Cost")}
          </span>
          <span
            data-testid="quote-total-cost"
            className="text-xl font-bold font-mono text-[var(--md-sys-color-on-surface)] [font-variant-numeric:tabular-nums]"
          >
            {formatCurrency(calculations.totalCost, currency)}
          </span>
        </div>

        {/* Subtotal (Revenue) */}
        <div className="p-4 rounded-xl bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)] flex flex-col gap-1">
          <span className="text-xs font-medium text-[var(--md-sys-color-on-surface-variant)]">
            {t("quote.builder.subtotal", "Subtotal (Price)")}
          </span>
          <span
            data-testid="quote-subtotal"
            className="text-xl font-bold font-mono text-[var(--md-sys-color-on-surface)] [font-variant-numeric:tabular-nums]"
          >
            {formatCurrency(calculations.subtotal, currency)}
          </span>
        </div>

        {/* Tax */}
        <div className="p-4 rounded-xl bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)] flex flex-col gap-1">
          <span className="text-xs font-medium text-[var(--md-sys-color-on-surface-variant)]">
            {t("quote.builder.tax", "VAT / Tax")}{` (${taxPercent}%)`}
          </span>
          <span
            data-testid="quote-tax"
            className="text-xl font-bold font-mono text-[var(--md-sys-color-on-surface)] [font-variant-numeric:tabular-nums]"
          >
            {formatCurrency(calculations.taxAmount, currency)}
          </span>
        </div>

        {/* Grand Total */}
        <div className="p-4 rounded-xl bg-[var(--md-sys-color-surface-container)] border-2 border-[var(--copper-primary)] flex flex-col gap-1 shadow-sm">
          <span className="text-xs font-semibold text-[var(--copper-primary)] uppercase tracking-wider">
            {t("quote.builder.grandTotal", "Grand Total")}
          </span>
          <span
            data-testid="quote-grand-total"
            className="text-xl font-black font-mono text-[var(--copper-primary)] [font-variant-numeric:tabular-nums]"
          >
            {formatCurrency(calculations.grandTotal, currency)}
          </span>
        </div>

        {/* Margin Advisory Card */}
        <div
          data-testid="quote-margin-card"
          className="p-4 rounded-xl bg-[var(--copper-secondary-container)] border border-[var(--copper-secondary)] flex flex-col gap-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--copper-on-secondary-container)]">
              {t("quote.builder.margin", "Estimated Margin")}
            </span>
            <span className="text-[10px] uppercase font-mono font-bold px-1.5 py-0.5 rounded bg-[var(--copper-secondary)] text-white">
              {t("common.internal", "Internal")}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span
              data-testid="quote-margin"
              className="text-xl font-bold font-mono text-[var(--copper-secondary)] [font-variant-numeric:tabular-nums]"
            >
              {`${calculations.marginPercent}%`}
            </span>
          </div>

          {/* Margin Advisory Label / Badge (Requirement 5) */}
          <div className="mt-1">
            <div
              data-testid="margin-advisory-badge"
              data-margin-tier={calculations.marginTier}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                calculations.marginTier === "healthy"
                  ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200 border border-green-300 dark:border-green-800"
                  : calculations.marginTier === "critical"
                  ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200 border border-red-300 dark:border-red-800"
                  : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-800"
              }`}
            >
              <span
                className={`inline-block w-1.5 h-1.5 rounded-full ${
                  calculations.marginTier === "healthy"
                    ? "bg-green-600"
                    : calculations.marginTier === "critical"
                    ? "bg-red-600"
                    : "bg-amber-600"
                }`}
                aria-hidden="true"
              />
              <span>
                {calculations.marginTier === "healthy"
                  ? t("quote.builder.marginHealthy", "Healthy Margin (≥35%)")
                  : calculations.marginTier === "critical"
                  ? t("quote.builder.marginCritical", "Low Margin (<15%) — Approval Required")
                  : t("quote.builder.marginModerate", "Moderate Margin (15% - 34%)")}
              </span>
            </div>
            <p
              data-testid="margin-advisory-note"
              className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] mt-1 mb-0 leading-tight"
            >
              {calculations.marginTier === "healthy"
                ? t("quote.builder.marginHealthyNote", "Margin meets commercial target guidelines.")
                : calculations.marginTier === "critical"
                ? t("quote.builder.marginCriticalNote", "Margin below 15% requires managerial approval.")
                : t("quote.builder.marginModerateNote", "Margin is within acceptable threshold.")}
            </p>
          </div>
        </div>
      </section>

      {/* 4. Line Items Table */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[var(--md-sys-color-on-surface)] m-0 flex items-center gap-2">
            <span>{t("quote.builder.lineItemsTitle", "Quote Line Items")}</span>
            <span className="text-xs font-normal text-[var(--md-sys-color-on-surface-variant)]">
              {`(${lineItems.length} ${t("quote.builder.itemsCount", "items")})`}
            </span>
          </h2>

          <div className="flex items-center gap-2">
            <button
              type="button"
              data-testid="btn-add-item-secondary"
              onClick={handleAddManualItem}
              className="text-xs font-semibold text-[var(--copper-primary)] hover:underline bg-transparent border-none cursor-pointer flex items-center gap-1"
            >
              <span>{t("quote.builder.addItemIcon", "➕")}</span>
              <span>{t("quote.builder.addItem", "Add Line Item")}</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[var(--md-sys-color-outline-variant)]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] border-b border-[var(--md-sys-color-outline-variant)] font-semibold">
                <th className="p-3 w-10 text-center">{t("quote.builder.colNumber", "#")}</th>
                <th className="p-3 min-w-[200px]">{t("quote.builder.colItem", "Item & Specification")}</th>
                <th className="p-3 min-w-[150px]">{t("quote.builder.colSku", "Manufacturer / SKU")}</th>
                <th className="p-3 w-20 text-right">{t("quote.builder.colQuantity", "Qty")}</th>
                <th className="p-3 w-28 text-right">{t("quote.builder.colUnitCost", "Unit Cost")}</th>
                <th className="p-3 w-28 text-right">{t("quote.builder.colUnitPrice", "Unit Price")}</th>
                <th className="p-3 w-28 text-right">{t("quote.builder.colLineTotal", "Line Total")}</th>
                <th className="p-3 w-16 text-center">{t("quote.builder.colActions", "Actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--md-sys-color-outline-variant)]">
              {lineItems.length > 0 ? (
                lineItems.map((item, idx) => {
                  const lineTotal = item.totalPrice !== undefined
                    ? item.totalPrice
                    : item.quantity * item.unitPrice;

                  return (
                    <tr
                      key={item.id || idx}
                      data-testid={`line-item-row-${item.id}`}
                      className="hover:bg-[var(--md-sys-color-surface-container-low)] transition-colors"
                    >
                      <td className="p-3 text-center font-mono opacity-60">
                        {idx + 1}
                      </td>

                      {/* Name & Description */}
                      <td className="p-2">
                        <input
                          type="text"
                          data-testid={`input-item-name-${item.id}`}
                          value={item.name}
                          onChange={(e) => handleUpdateLineItem(item.id, "name", e.target.value)}
                          placeholder={t("quote.builder.itemNamePlaceholder", "Product or service name...")}
                          className="w-full px-2 py-1 text-xs rounded border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] focus:outline-none focus:ring-1 focus:ring-[var(--copper-primary)]"
                        />
                        {item.designators && item.designators.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.designators.map((des) => (
                              <span
                                key={des}
                                className="font-mono text-[9px] px-1 py-0.5 rounded bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)]"
                              >
                                {des}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Manufacturer & SKU */}
                      <td className="p-2">
                        <div className="flex flex-col gap-1">
                          <input
                            type="text"
                            data-testid={`input-item-mfg-${item.id}`}
                            value={item.manufacturer || ""}
                            onChange={(e) => handleUpdateLineItem(item.id, "manufacturer", e.target.value)}
                            placeholder={t("quote.builder.mfgPlaceholder", "Manufacturer")}
                            className="w-full px-2 py-1 text-[11px] rounded border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] focus:outline-none focus:ring-1 focus:ring-[var(--copper-primary)]"
                          />
                          <input
                            type="text"
                            data-testid={`input-item-sku-${item.id}`}
                            value={item.sku || ""}
                            onChange={(e) => handleUpdateLineItem(item.id, "sku", e.target.value)}
                            placeholder={t("quote.builder.skuPlaceholder", "SKU / Part Number")}
                            className="w-full px-2 py-1 text-[11px] font-mono rounded border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] focus:outline-none focus:ring-1 focus:ring-[var(--copper-primary)]"
                          />
                        </div>
                      </td>

                      {/* Quantity */}
                      <td className="p-2 text-right">
                        <input
                          type="number"
                          min="1"
                          data-testid={`input-item-qty-${item.id}`}
                          value={item.quantity}
                          onChange={(e) =>
                            handleUpdateLineItem(
                              item.id,
                              "quantity",
                              Math.max(1, parseInt(e.target.value, 10) || 1)
                            )
                          }
                          className="w-16 px-2 py-1 text-xs font-mono text-right rounded border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] focus:outline-none focus:ring-1 focus:ring-[var(--copper-primary)]"
                        />
                      </td>

                      {/* Unit Cost */}
                      <td className="p-2 text-right">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          data-testid={`input-item-cost-${item.id}`}
                          value={item.unitCost !== undefined ? item.unitCost : 0}
                          onChange={(e) =>
                            handleUpdateLineItem(
                              item.id,
                              "unitCost",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-24 px-2 py-1 text-xs font-mono text-right rounded border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] focus:outline-none focus:ring-1 focus:ring-[var(--copper-primary)]"
                        />
                      </td>

                      {/* Unit Price */}
                      <td className="p-2 text-right">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          data-testid={`input-item-price-${item.id}`}
                          value={item.unitPrice}
                          onChange={(e) =>
                            handleUpdateLineItem(
                              item.id,
                              "unitPrice",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-24 px-2 py-1 text-xs font-mono text-right rounded border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] focus:outline-none focus:ring-1 focus:ring-[var(--copper-primary)]"
                        />
                      </td>

                      {/* Line Total */}
                      <td className="p-3 text-right font-mono font-bold text-[var(--md-sys-color-on-surface)] [font-variant-numeric:tabular-nums]">
                        <span data-testid={`line-total-${item.id}`}>
                          {formatCurrency(lineTotal, currency)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          data-testid={`btn-delete-item-${item.id}`}
                          onClick={() => handleDeleteLineItem(item.id)}
                          aria-label={t("quote.builder.deleteItemAria", "Delete line item")}
                          className="px-2 py-1 text-[11px] font-semibold text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-950 rounded border-none bg-transparent cursor-pointer transition-colors"
                        >
                          {t("quote.builder.deleteItem", "Remove")}
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    data-testid="quote-empty-items-row"
                    className="p-8 text-center text-sm text-[var(--md-sys-color-on-surface-variant)]"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-2xl" role="img" aria-label={t("quote.builder.emptyIcon", "Empty")}>
                        {t("quote.builder.iconEmptyBox", "📦")}
                      </span>
                      <span>
                        {t(
                          "quote.builder.noItems",
                          "No line items added yet. Click 'Add Line Item' or 'Import from BOM' to populate."
                        )}
                      </span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>

            {lineItems.length > 0 && (
              <tfoot>
                <tr className="bg-[var(--md-sys-color-surface-container-high)] font-semibold text-[var(--md-sys-color-on-surface)] border-t border-[var(--md-sys-color-outline-variant)]">
                  <td colSpan={4} className="p-3 text-right">
                    {t("quote.builder.subtotalPrice", "Subtotal (Net Price):")}
                  </td>
                  <td className="p-3 text-right font-mono [font-variant-numeric:tabular-nums]">
                    {formatCurrency(calculations.totalCost, currency)}
                  </td>
                  <td colSpan={2} className="p-3 text-right font-mono text-sm [font-variant-numeric:tabular-nums] text-[var(--copper-primary)]">
                    {formatCurrency(calculations.subtotal, currency)}
                  </td>
                  <td className="p-3" />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </section>
    </div>
  );
};
