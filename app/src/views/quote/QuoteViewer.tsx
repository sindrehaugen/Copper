import { useState, useMemo } from "react";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import { useMasking } from "../../shell/masking/index.js";
import { useDocumentStore } from "../../store/documentStore";
import { useBOM } from "../../store/selectors/derived";

export interface QuoteLineItem {
  id: string;
  name: string;
  description?: string | undefined;
  sku?: string | undefined;
  manufacturer?: string | undefined;
  quantity: number;
  unitPrice: number;
  unitCost?: number | undefined;
  totalPrice?: number | undefined;
  designators?: string[] | undefined;
  unit?: string | undefined;
}

export interface BaselineSignatureDetails {
  signedAt?: string | undefined;
  signedBy?: string | undefined;
  signerRole?: string | undefined;
  contractHash?: string | undefined;
  effectiveDate?: string | undefined;
  snapshotId?: string | undefined;
}

export interface QuoteData {
  id: string;
  title: string;
  customerName?: string | undefined;
  customerId?: string | undefined;
  status?: ("draft" | "in_review" | "approved" | "sent" | "accepted" | "rejected" | "signed_baseline" | string) | undefined;
  version?: string | undefined;
  revision?: string | undefined;
  currency?: string | undefined;
  createdAt?: string | undefined;
  validUntil?: string | undefined;
  publicToken?: string | undefined;
  publicUrl?: string | undefined;
  subtotal?: number | undefined;
  taxPercent?: number | undefined;
  taxAmount?: number | undefined;
  total?: number | undefined;
  marginPercent?: number | undefined;
  internalNotes?: string | undefined;
  isSignedBaseline?: boolean | undefined;
  baselineDetails?: BaselineSignatureDetails | undefined;
  lineItems?: QuoteLineItem[] | undefined;
}

export interface QuoteViewerProps {
  entityId?: string | undefined;
  entityType?: string | undefined;
  isBaseline?: boolean | undefined;
  isCustomerView?: boolean | undefined;
  data?: QuoteData | null | undefined;
  onNavigate?: ((path: string, entity?: any) => void) | undefined;
  className?: string | undefined;
}

function formatNumber(val: number): string {
  return val.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export const QuoteViewer: FC<QuoteViewerProps> = ({
  entityId = "",
  entityType = "QUOTE",
  isBaseline: isBaselineProp,
  isCustomerView: isCustomerViewProp,
  data: explicitData,
  onNavigate,
  className = "",
}) => {
  const { t } = useTranslation();
  const { isMasked } = useMasking();
  const effectiveIsCustomerView = isCustomerViewProp ?? isMasked;

  const storeDocument = useDocumentStore((state) => state.document);
  const hookBom = useBOM();

  const isBaseline =
    isBaselineProp === true ||
    entityType.toUpperCase() === "BASELINE" ||
    entityType.toUpperCase() === "SIGNED_BASELINE" ||
    explicitData?.isSignedBaseline === true ||
    explicitData?.status === "signed_baseline";

  // Build resolved data either from explicitData or by derivation from DocumentStore
  const data: QuoteData = useMemo(() => {
    if (explicitData) {
      return explicitData;
    }

    const id = entityId || (isBaseline ? "bsl-001" : "quo-001");
    const currency = "EUR";

    if (storeDocument) {
      const derivedLineItems: QuoteLineItem[] = hookBom.map((item, idx) => {
        const unitPrice = item.unitPrice ?? 1500;
        return {
          id: `line-${item.deviceTypeId}-${idx}`,
          name: item.name,
          sku: item.deviceTypeId,
          manufacturer: item.manufacturer,
          quantity: item.quantity,
          unitPrice,
          totalPrice: unitPrice * item.quantity,
          designators: item.designators,
        };
      });

      const subtotal = derivedLineItems.reduce(
        (acc, item) => acc + (item.totalPrice ?? item.unitPrice * item.quantity),
        0
      );
      const taxPercent = 25;
      const taxAmount = (subtotal * taxPercent) / 100;
      const total = subtotal + taxAmount;

      return {
        id,
        title:
          storeDocument.designLabel ||
          (isBaseline ? `Signed Baseline ${id}` : `Commercial Offer ${id}`),
        customerName: "Nordic Enterprise AS",
        customerId: "cust-001",
        status: isBaseline ? "signed_baseline" : "approved",
        version: `v${storeDocument.revision || "1.0"}`,
        currency,
        createdAt: new Date().toISOString().split("T")[0],
        validUntil: "2026-12-31",
        publicUrl: `https://copper.app/public/quote/${id}`,
        subtotal,
        taxPercent,
        taxAmount,
        total,
        marginPercent: 30.0,
        isSignedBaseline: isBaseline,
        lineItems: derivedLineItems,
        baselineDetails: isBaseline
          ? {
              signedAt: "2026-08-20T14:30:00Z",
              signedBy: "Design Engineering Lead",
              signerRole: "Technical Authority",
              contractHash: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
              effectiveDate: "2026-09-01",
              snapshotId: `snap-${id}`,
            }
          : undefined,
      };
    }

    // Default standalone fallback
    return {
      id,
      title: isBaseline ? `Signed Baseline ${id}` : `Commercial Offer ${id}`,
      customerName: "Enterprise Client",
      status: isBaseline ? "signed_baseline" : "draft",
      version: "v1.0",
      currency,
      subtotal: 0,
      taxPercent: 25,
      taxAmount: 0,
      total: 0,
      publicUrl: `https://copper.app/public/quote/${id}`,
      isSignedBaseline: isBaseline,
      lineItems: [],
    };
  }, [explicitData, entityId, isBaseline, storeDocument, hookBom]);

  const [copied, setCopied] = useState(false);
  const publicUrl =
    data.publicUrl || `https://copper.app/public/quote/${data.id || entityId}`;

  const handleCopyPublicLink = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(publicUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // clipboard error handling
    }
  };

  const currency = data.currency || "EUR";
  const subtotal = data.subtotal ?? 0;
  const taxAmount =
    data.taxAmount ??
    (data.taxPercent ? (subtotal * data.taxPercent) / 100 : 0);
  const total = data.total ?? subtotal + taxAmount;

  return (
    <div
      data-testid="quote-viewer"
      data-entity-type={isBaseline ? "BASELINE" : "QUOTE"}
      data-entity-id={data.id}
      data-frozen={isBaseline ? "true" : "false"}
      className={`copper-quote-viewer p-6 flex flex-col gap-6 max-w-7xl mx-auto w-full bg-[var(--md-sys-color-surface,#fdf8fd)] text-[var(--md-sys-color-on-surface,#1d1b20)] ${
        isBaseline
          ? "copper-quote-viewer-baseline border border-[var(--copper-secondary,#3a6e6a)] shadow-sm rounded-2xl"
          : ""
      } ${className}`}
    >
      {/* 1. FROZEN SIGNED BASELINE BANNER (Strictly Locked Read-Only) */}
      {isBaseline && (
        <section
          data-testid="frozen-baseline-banner"
          data-frozen="true"
          className="p-5 rounded-xl bg-[var(--copper-secondary-container,#c8eae5)] text-[var(--copper-on-secondary-container,#00201d)] border-2 border-[var(--copper-secondary,#3a6e6a)] flex flex-col gap-3 relative overflow-hidden"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl" role="img" aria-label="Locked Baseline">
                🔒
              </span>
              <div>
                <h2 className="m-0 text-base font-bold tracking-wide uppercase flex items-center gap-2">
                  <span>{t("quote.frozenBaselineTitle", "FROZEN SIGNED BASELINE")}</span>
                  <span
                    data-testid="quote-frozen-lock-badge"
                    className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-[var(--copper-secondary,#3a6e6a)] text-white"
                  >
                    {t("quote.lockedBadge", "Locked by Contract — Read-Only")}
                  </span>
                </h2>
                <p className="m-0 text-xs opacity-90 mt-0.5">
                  {t(
                    "quote.frozenBaselineDesc",
                    "This baseline is immutably frozen once by commercial contract. No modifications or overwrites are permitted."
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-3 py-1 rounded bg-[var(--md-sys-color-surface)] opacity-90 font-semibold text-[var(--copper-on-secondary-container,#00201d)] border border-[var(--copper-secondary,#3a6e6a)]">
                {t("quote.readOnlyState", "STATE: FROZEN (IMMUTABLE)")}
              </span>
            </div>
          </div>

          {data.baselineDetails && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-[var(--md-sys-color-outline-variant)] text-xs font-mono">
              {data.baselineDetails.signedBy && (
                <div>
                  <span className="block font-semibold opacity-75">
                    {t("quote.signedBy", "Signed By:")}
                  </span>
                  <span className="font-bold text-sm">
                    {data.baselineDetails.signedBy}
                    {data.baselineDetails.signerRole && (
                      <span className="block text-[11px] font-normal opacity-85">
                        {data.baselineDetails.signerRole}
                      </span>
                    )}
                  </span>
                </div>
              )}

              {data.baselineDetails.signedAt && (
                <div>
                  <span className="block font-semibold opacity-75">
                    {t("quote.signedAt", "Signed At:")}
                  </span>
                  <span className="font-bold">
                    {data.baselineDetails.signedAt}
                  </span>
                </div>
              )}

              {data.baselineDetails.effectiveDate && (
                <div>
                  <span className="block font-semibold opacity-75">
                    {t("quote.effectiveDate", "Effective Date:")}
                  </span>
                  <span className="font-bold">
                    {data.baselineDetails.effectiveDate}
                  </span>
                </div>
              )}

              {data.baselineDetails.contractHash && (
                <div className="col-span-1 sm:col-span-2 md:col-span-1 truncate">
                  <span className="block font-semibold opacity-75">
                    {t("quote.contractHash", "Contract Hash / Seal:")}
                  </span>
                  <span
                    className="font-mono text-[11px] truncate block"
                    title={data.baselineDetails.contractHash}
                  >
                    {data.baselineDetails.contractHash}
                  </span>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* 2. HEADER: Title, Customer, Status, Expiry, Navigation */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--md-sys-color-outline-variant,#cac4d0)]">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <span className="text-xl">
              {isBaseline ? "🔒" : "📄"}
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--md-sys-color-on-surface,#1d1b20)] m-0">
              {data.title}
            </h1>
            <span
              data-testid="quote-status-badge"
              className={`text-xs font-semibold uppercase px-2.5 py-0.5 rounded-full ${
                isBaseline
                  ? "bg-[var(--copper-secondary-container,#c8eae5)] text-[var(--copper-on-secondary-container,#00201d)] border border-[var(--copper-secondary,#3a6e6a)]"
                  : data.status === "approved" || data.status === "accepted"
                  ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200"
                  : data.status === "in_review"
                  ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200"
                  : "bg-neutral-200 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200"
              }`}
            >
              {data.status || (isBaseline ? "signed_baseline" : "draft")}
            </span>
            {data.version && (
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[var(--md-sys-color-surface-container-high,#e6e0e9)] text-[var(--md-sys-color-on-surface-variant,#49454e)]">
                {data.version}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--md-sys-color-on-surface-variant,#49454e)]">
            <span>
              <strong>{t("quote.id", "ID")}:</strong> {data.id}
            </span>
            {data.customerName && (
              <span>
                <strong>{t("quote.customer", "Customer")}:</strong>{" "}
                {data.customerId && onNavigate ? (
                  <button
                    type="button"
                    onClick={() => onNavigate(`/e/CUSTOMER/${data.customerId}`)}
                    className="underline text-[var(--copper-primary,#b87333)] font-medium hover:opacity-80 p-0 bg-transparent border-none cursor-pointer"
                  >
                    {data.customerName}
                  </button>
                ) : (
                  data.customerName
                )}
              </span>
            )}
            {data.createdAt && (
              <span>
                <strong>{t("quote.created", "Created")}:</strong> {data.createdAt}
              </span>
            )}
            {data.validUntil && (
              <span>
                <strong>{t("quote.validUntil", "Valid Until")}:</strong>{" "}
                {data.validUntil}
              </span>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {isBaseline ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[var(--copper-secondary,#3a6e6a)] bg-[var(--copper-secondary-container,#c8eae5)] px-3 py-1.5 rounded-lg border border-[var(--copper-secondary,#3a6e6a)]">
                🔒 {t("quote.baselineReadOnlyAction", "Contract Frozen — Strictly Read-Only")}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                data-testid="btn-edit-quote"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--md-sys-color-surface-container-high,#e6e0e9)] text-[var(--md-sys-color-on-surface,#1d1b20)] border border-[var(--md-sys-color-outline-variant,#cac4d0)] hover:bg-[var(--md-sys-color-surface-container-highest,#ece6f0)] cursor-pointer"
              >
                {t("quote.editQuote", "Edit Quote")}
              </button>
              <button
                type="button"
                data-testid="btn-submit-quote"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--copper-primary,#b87333)] text-white border-none hover:opacity-90 cursor-pointer"
              >
                {t("quote.submitQuote", "Submit for Approval")}
              </button>
            </div>
          )}
        </div>
      </header>

      {/* 3. FINANCIAL SUMMARY METRICS */}
      <section
        data-testid="quote-financial-summary"
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <div className="p-4 rounded-xl bg-[var(--md-sys-color-surface-container-low,#f7f2fa)] border border-[var(--md-sys-color-outline-variant,#cac4d0)] flex flex-col gap-1">
          <span className="text-xs font-medium text-[var(--md-sys-color-on-surface-variant,#49454e)]">
            {t("quote.subtotal", "Subtotal")}
          </span>
          <span
            data-testid="quote-subtotal"
            className="text-2xl font-bold font-mono text-[var(--md-sys-color-on-surface,#1d1b20)] [font-variant-numeric:tabular-nums]"
          >
            {`${currency} ${formatNumber(subtotal)}`}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[var(--md-sys-color-surface-container-low,#f7f2fa)] border border-[var(--md-sys-color-outline-variant,#cac4d0)] flex flex-col gap-1">
          <span className="text-xs font-medium text-[var(--md-sys-color-on-surface-variant,#49454e)]">
            {t("quote.tax", "VAT / Tax")}{" "}
            {data.taxPercent ? `(${data.taxPercent}%)` : ""}
          </span>
          <span
            data-testid="quote-tax"
            className="text-2xl font-bold font-mono text-[var(--md-sys-color-on-surface,#1d1b20)] [font-variant-numeric:tabular-nums]"
          >
            {`${currency} ${formatNumber(taxAmount)}`}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[var(--md-sys-color-surface-container,#ece6f0)] border-2 border-[var(--copper-primary,#b87333)] flex flex-col gap-1 shadow-sm">
          <span className="text-xs font-semibold text-[var(--copper-primary,#b87333)] uppercase tracking-wider">
            {t("quote.grandTotal", "Grand Total")}
          </span>
          <span
            data-testid="quote-grand-total"
            className="text-2xl font-black font-mono text-[var(--copper-primary,#b87333)] [font-variant-numeric:tabular-nums]"
          >
            {`${currency} ${formatNumber(total)}`}
          </span>
        </div>

        {/* 4. MARGIN FACET (STRICT INTERNAL ONLY - REDACTED IN CUSTOMER VIEW) */}
        {!effectiveIsCustomerView && data.marginPercent !== undefined ? (
          <div
            data-testid="quote-margin"
            className="p-4 rounded-xl bg-[var(--copper-secondary-container,#c8eae5)] border border-[var(--copper-secondary,#3a6e6a)] flex flex-col gap-1"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--copper-on-secondary-container,#00201d)]">
                {t("quote.margin", "Estimated Margin")}
              </span>
              <span className="text-[10px] uppercase font-mono font-bold px-1.5 py-0.5 rounded bg-[var(--copper-secondary,#3a6e6a)] text-white">
                {t("common.internal", "Internal")}
              </span>
            </div>
            <span className="text-2xl font-bold font-mono text-[var(--copper-secondary,#3a6e6a)] [font-variant-numeric:tabular-nums]">
              {`${data.marginPercent}%`}
            </span>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-[var(--md-sys-color-surface-container-low,#f7f2fa)] border border-[var(--md-sys-color-outline-variant,#cac4d0)] flex flex-col justify-center">
            <span className="text-xs text-[var(--md-sys-color-on-surface-variant,#49454e)]">
              {effectiveIsCustomerView
                ? t("quote.customerViewActive", "Customer View: Internal metrics masked")
                : t("quote.fixedCommitment", "Commercial baseline binding")}
            </span>
          </div>
        )}
      </section>

      {/* 5. INTERNAL NOTES (STRICTLY REDACTED IN CUSTOMER VIEW) */}
      {!effectiveIsCustomerView && data.internalNotes && (
        <section
          data-testid="quote-internal-notes"
          className="p-3.5 rounded-lg bg-[var(--md-sys-color-surface-container-high,#e6e0e9)] border-l-4 border-[var(--copper-primary,#b87333)] text-xs text-[var(--md-sys-color-on-surface,#1d1b20)]"
        >
          <span className="font-semibold text-[var(--copper-primary,#b87333)] block mb-1">
            🔒 {t("quote.internalNotesTitle", "Internal Account Notes (Internal Only):")}
          </span>
          <p className="m-0 leading-relaxed">{data.internalNotes}</p>
        </section>
      )}

      {/* 6. PUBLIC SHAREABLE LINK AFFORDANCE */}
      <section
        data-testid="quote-public-link-section"
        className="p-4 rounded-xl bg-[var(--md-sys-color-surface-container-low,#f7f2fa)] border border-[var(--md-sys-color-outline-variant,#cac4d0)] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-xs font-semibold text-[var(--md-sys-color-on-surface,#1d1b20)] flex items-center gap-1.5">
            <span>🔗</span>
            <span>{t("quote.publicLinkTitle", "Shareable Public Link")}</span>
            {isBaseline && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--copper-secondary,#3a6e6a)] text-white">
                {t("quote.readOnlyPublicBadge", "Read-Only Snapshot")}
              </span>
            )}
          </span>
          <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant,#49454e)]">
            {t(
              "quote.publicLinkDescription",
              "Publicly accessible URL for client review, acceptance, and audit."
            )}
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            readOnly
            data-testid="quote-public-link"
            value={publicUrl}
            className="w-full sm:w-80 px-3 py-1.5 text-xs font-mono rounded-lg border border-[var(--md-sys-color-outline-variant,#cac4d0)] bg-[var(--md-sys-color-surface,#fdf8fd)] text-[var(--md-sys-color-on-surface,#1d1b20)] focus:outline-none"
          />
          <button
            type="button"
            data-testid="btn-copy-public-link"
            onClick={handleCopyPublicLink}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--md-sys-color-primary,#6750a4)] text-[var(--md-sys-color-on-primary,#ffffff)] hover:opacity-90 transition-opacity whitespace-nowrap cursor-pointer border-none"
          >
            {copied ? t("common.copied", "Copied!") : t("common.copyLink", "Copy Link")}
          </button>
        </div>
      </section>

      {/* 7. LINE ITEMS TABLE */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[var(--md-sys-color-on-surface,#1d1b20)] m-0 flex items-center gap-2">
            <span>{t("quote.lineItemsTitle", "Quote Line Items & Bill of Materials")}</span>
            <span className="text-xs font-normal text-[var(--md-sys-color-on-surface-variant,#49454e)]">
              {`(${data.lineItems?.length ?? 0} ${t("quote.items", "items")})`}
            </span>
          </h2>
          {isBaseline && (
            <span className="text-xs font-mono text-[var(--copper-secondary,#3a6e6a)] font-semibold">
              🔒 {t("quote.lineItemsFrozen", "Bill of Materials Frozen")}
            </span>
          )}
        </div>

        <div className="overflow-x-auto rounded-xl border border-[var(--md-sys-color-outline-variant,#cac4d0)]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[var(--md-sys-color-surface-container-high,#e6e0e9)] text-[var(--md-sys-color-on-surface-variant,#49454e)] border-b border-[var(--md-sys-color-outline-variant,#cac4d0)] font-semibold">
                <th className="p-3 w-12 text-center">#</th>
                <th className="p-3">{t("quote.colItem", "Item & Specification")}</th>
                <th className="p-3">{t("quote.colManufacturerSku", "Manufacturer / SKU")}</th>
                <th className="p-3">{t("quote.colDesignators", "Designators")}</th>
                <th className="p-3 text-right">{t("quote.colQty", "Qty")}</th>
                <th className="p-3 text-right">{t("quote.colUnitPrice", "Unit Price")}</th>
                <th className="p-3 text-right">{t("quote.colLineTotal", "Line Total")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--md-sys-color-outline-variant,#cac4d0)]">
              {data.lineItems && data.lineItems.length > 0 ? (
                data.lineItems.map((item, idx) => {
                  const lineTotal =
                    item.totalPrice ?? item.unitPrice * item.quantity;
                  return (
                    <tr
                      key={item.id || idx}
                      className="hover:bg-[var(--md-sys-color-surface-container-low,#f7f2fa)] transition-colors"
                    >
                      <td className="p-3 text-center font-mono opacity-60">
                        {idx + 1}
                      </td>
                      <td className="p-3 font-medium text-[var(--md-sys-color-on-surface,#1d1b20)]">
                        <div>{item.name}</div>
                        {item.description && (
                          <div className="text-[11px] text-[var(--md-sys-color-on-surface-variant,#49454e)] mt-0.5">
                            {item.description}
                          </div>
                        )}
                      </td>
                      <td className="p-3 font-mono text-[11px] text-[var(--md-sys-color-on-surface-variant,#49454e)]">
                        {item.manufacturer && (
                          <span className="font-semibold text-[var(--md-sys-color-on-surface,#1d1b20)] block">
                            {item.manufacturer}
                          </span>
                        )}
                        <span>{item.sku || "—"}</span>
                      </td>
                      <td className="p-3">
                        {item.designators && item.designators.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {item.designators.map((d) => (
                              <span
                                key={d}
                                className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[var(--md-sys-color-surface-container-high,#e6e0e9)] text-[var(--md-sys-color-on-surface,#1d1b20)] border border-[var(--md-sys-color-outline-variant,#cac4d0)]"
                              >
                                {d}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-neutral-400 font-mono text-[11px]">—</span>
                        )}
                      </td>
                      <td className="p-3 text-right font-mono font-semibold [font-variant-numeric:tabular-nums]">
                        {item.quantity}
                        {item.unit && (
                          <span className="text-[10px] ml-1 font-normal opacity-70">
                            {item.unit}
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right font-mono [font-variant-numeric:tabular-nums]">
                        {`${currency} ${formatNumber(item.unitPrice)}`}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-[var(--md-sys-color-on-surface,#1d1b20)] [font-variant-numeric:tabular-nums]">
                        {`${currency} ${formatNumber(lineTotal)}`}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="p-8 text-center text-sm text-[var(--md-sys-color-on-surface-variant,#49454e)]"
                  >
                    {t("quote.noLineItems", "No line items registered on this quote.")}
                  </td>
                </tr>
              )}
            </tbody>
            {data.lineItems && data.lineItems.length > 0 && (
              <tfoot>
                <tr className="bg-[var(--md-sys-color-surface-container-high,#e6e0e9)] font-bold text-[var(--md-sys-color-on-surface,#1d1b20)] border-t border-[var(--md-sys-color-outline-variant,#cac4d0)]">
                  <td colSpan={6} className="p-3 text-right">
                    {t("quote.totalBillOfMaterials", "Total (incl. tax):")}
                  </td>
                  <td className="p-3 text-right font-mono text-sm [font-variant-numeric:tabular-nums] text-[var(--copper-primary,#b87333)]">
                    {`${currency} ${formatNumber(total)}`}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </section>
    </div>
  );
};
