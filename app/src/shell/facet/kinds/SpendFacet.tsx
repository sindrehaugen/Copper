import { useTranslation } from "react-i18next";
import type { Facet, FacetRenderProps } from "../types";
import type {
  SpendFacetData,
  SpendFacetOptions,
  SpendBreakdownItem,
} from "./types";

function formatMoney(amount: number, currency: string = "EUR"): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

export function SpendFacetRenderer({
  data,
  isLoading,
  error,
}: FacetRenderProps<SpendFacetData>) {
  const { t } = useTranslation();

  if (error) {
    return (
      <div
        className="p-4 rounded-md border border-[var(--copper-error,#BA1A1A)] bg-[var(--copper-error-container,#FFDAD6)] text-[var(--copper-on-error-container,#410002)] text-sm"
        data-testid="facet-spend-error"
      >
        {error.message}
      </div>
    );
  }

  if (isLoading && !data) {
    return (
      <div
        className="p-4 text-center text-sm text-[var(--md-sys-color-on-surface-variant,#49454E)]"
        data-testid="facet-spend-loading"
      >
        {t("common.loading", "Loading...")}
      </div>
    );
  }

  if (
    !data ||
    (!data.totalSpend &&
      !data.totalBudget &&
      (!data.breakdown || data.breakdown.length === 0))
  ) {
    return (
      <div
        className="p-4 text-center text-sm text-[var(--md-sys-color-on-surface-variant,#49454E)]"
        data-testid="facet-empty-spend"
      >
        {t("facet.noSpend", "No spend data available")}
      </div>
    );
  }

  const {
    currency = "EUR",
    totalSpend = 0,
    totalBudget,
    committedSpend,
    variance,
    breakdown = [],
  } = data;

  return (
    <div
      className="copper-spend-facet flex flex-col gap-4 p-4 rounded-lg bg-[var(--md-sys-color-surface-container-low,#F7F2FA)] border border-[var(--md-sys-color-outline-variant,#CAC4D0)]"
      data-testid="facet-spend"
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-md bg-[var(--md-sys-color-surface-container,#ECE6F0)] border border-[var(--md-sys-color-outline-variant,#CAC4D0)] flex flex-col gap-1">
          <span className="text-xs text-[var(--md-sys-color-on-surface-variant,#49454E)] font-medium">
            {t("facet.totalSpend", "Total Spend")}
          </span>
          <span
            className="text-lg font-bold text-[var(--md-sys-color-on-surface,#1D1B20)] [font-variant-numeric:tabular-nums]"
            data-testid="facet-spend-total"
          >
            {formatMoney(totalSpend, currency)}
          </span>
        </div>

        {totalBudget !== undefined && (
          <div className="p-3 rounded-md bg-[var(--md-sys-color-surface-container,#ECE6F0)] border border-[var(--md-sys-color-outline-variant,#CAC4D0)] flex flex-col gap-1">
            <span className="text-xs text-[var(--md-sys-color-on-surface-variant,#49454E)] font-medium">
              {t("facet.totalBudget", "Budget")}
            </span>
            <span className="text-lg font-bold text-[var(--md-sys-color-on-surface,#1D1B20)] [font-variant-numeric:tabular-nums]">
              {formatMoney(totalBudget, currency)}
            </span>
          </div>
        )}

        {committedSpend !== undefined && (
          <div className="p-3 rounded-md bg-[var(--md-sys-color-surface-container,#ECE6F0)] border border-[var(--md-sys-color-outline-variant,#CAC4D0)] flex flex-col gap-1">
            <span className="text-xs text-[var(--md-sys-color-on-surface-variant,#49454E)] font-medium">
              {t("facet.committedSpend", "Committed")}
            </span>
            <span className="text-lg font-bold text-[var(--copper-secondary,#3A6E6A)] [font-variant-numeric:tabular-nums]">
              {formatMoney(committedSpend, currency)}
            </span>
          </div>
        )}

        {variance !== undefined && (
          <div className="p-3 rounded-md bg-[var(--md-sys-color-surface-container,#ECE6F0)] border border-[var(--md-sys-color-outline-variant,#CAC4D0)] flex flex-col gap-1">
            <span className="text-xs text-[var(--md-sys-color-on-surface-variant,#49454E)] font-medium">
              {t("facet.variance", "Variance")}
            </span>
            <span
              className={`text-lg font-bold [font-variant-numeric:tabular-nums] ${
                variance >= 0
                  ? "text-[var(--copper-secondary,#3A6E6A)]"
                  : "text-[var(--copper-semantic-risk,#B05500)]"
              }`}
            >
              {formatMoney(variance, currency)}
            </span>
          </div>
        )}
      </div>

      {breakdown.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--md-sys-color-on-surface-variant,#49454E)]">
            {t("facet.breakdown", "Cost Breakdown")}
          </span>
          <div className="divide-y divide-[var(--md-sys-color-outline-variant,#CAC4D0)]">
            {breakdown.map((item: SpendBreakdownItem) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-2 text-sm gap-2"
              >
                <div className="flex flex-col min-w-0">
                  <span className="font-medium text-[var(--md-sys-color-on-surface,#1D1B20)] truncate">
                    {item.description}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-[var(--md-sys-color-on-surface-variant,#49454E)]">
                    <span>{item.category}</span>
                    {item.status && (
                      <span className="uppercase tracking-wider text-[10px] px-1.5 py-0.2 rounded bg-[var(--md-sys-color-surface-container-high,#E6E0E9)]">
                        {item.status}
                      </span>
                    )}
                  </div>
                </div>

                <span className="font-semibold text-[var(--md-sys-color-on-surface,#1D1B20)] shrink-0 [font-variant-numeric:tabular-nums]">
                  {formatMoney(item.amount, item.currency || currency)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function createSpendFacet(options: SpendFacetOptions): Facet<SpendFacetData> {
  return {
    id: options.id ?? "spend",
    entity: options.entity,
    weight: options.weight ?? 60,
    requires: options.requires,
    title: options.title ?? "Spend",
    load: options.load ?? (async () => ({ currency: "EUR", totalSpend: 0, breakdown: [] })),
    Render: options.Render ?? SpendFacetRenderer,
    findings: options.findings,
    actions: options.actions,
  };
}

export const SpendFacet = createSpendFacet;
