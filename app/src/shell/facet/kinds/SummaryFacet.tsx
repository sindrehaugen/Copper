import { useTranslation } from "react-i18next";
import type { Facet, FacetRenderProps } from "../types";
import type {
  SummaryFacetData,
  SummaryFacetOptions,
  SummaryProperty,
  SummaryMetric,
} from "./types";

export function SummaryFacetRenderer({
  data,
  isLoading,
  error,
}: FacetRenderProps<SummaryFacetData>) {
  const { t } = useTranslation();

  if (error) {
    return (
      <div
        className="p-4 rounded-md border border-[var(--copper-error,#BA1A1A)] bg-[var(--copper-error-container,#FFDAD6)] text-[var(--copper-on-error-container,#410002)] text-sm"
        data-testid="facet-summary-error"
      >
        {error.message}
      </div>
    );
  }

  if (isLoading && !data) {
    return (
      <div
        className="p-4 text-center text-sm text-[var(--md-sys-color-on-surface-variant,#49454E)]"
        data-testid="facet-summary-loading"
      >
        {t("common.loading", "Loading...")}
      </div>
    );
  }

  if (
    !data ||
    (!data.title &&
      !data.description &&
      (!data.properties || data.properties.length === 0) &&
      (!data.metrics || data.metrics.length === 0))
  ) {
    return (
      <div
        className="p-4 text-center text-sm text-[var(--md-sys-color-on-surface-variant,#49454E)]"
        data-testid="facet-empty-summary"
      >
        {t("facet.noSummary", "No summary information available")}
      </div>
    );
  }

  const { title, description, status, properties = [], metrics = [] } = data;

  return (
    <div
      className="copper-summary-facet flex flex-col gap-4 p-4 rounded-lg bg-[var(--md-sys-color-surface-container-low,#F7F2FA)] border border-[var(--md-sys-color-outline-variant,#CAC4D0)]"
      data-testid="facet-summary"
    >
      {(title || status || description) && (
        <div className="flex flex-col gap-1 border-b border-[var(--md-sys-color-outline-variant,#CAC4D0)] pb-3">
          <div className="flex items-center justify-between gap-2">
            {title && (
              <h3
                className="text-base font-semibold text-[var(--md-sys-color-on-surface,#1D1B20)] m-0"
                data-testid="facet-summary-title"
              >
                {title}
              </h3>
            )}
            {status && (
              <span
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider bg-[var(--copper-secondary-container,#C8EAE5)] text-[var(--copper-on-secondary-container,#00201D)]"
                data-testid="facet-summary-status"
                data-status-variant={status.variant ?? "neutral"}
              >
                {status.label}
              </span>
            )}
          </div>
          {description && (
            <p
              className="text-sm text-[var(--md-sys-color-on-surface-variant,#49454E)] m-0"
              data-testid="facet-summary-description"
            >
              {description}
            </p>
          )}
        </div>
      )}

      {metrics.length > 0 && (
        <div
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
          data-testid="facet-summary-metrics"
        >
          {metrics.map((m: SummaryMetric, idx: number) => (
            <div
              key={m.label ?? idx}
              className="p-3 rounded-md bg-[var(--md-sys-color-surface-container,#ECE6F0)] border border-[var(--md-sys-color-outline-variant,#CAC4D0)] flex flex-col gap-1"
            >
              <span className="text-xs text-[var(--md-sys-color-on-surface-variant,#49454E)] font-medium">
                {m.label}
              </span>
              <span className="text-lg font-bold text-[var(--md-sys-color-on-surface,#1D1B20)] [font-variant-numeric:tabular-nums]">
                {m.value}
              </span>
              {m.change && (
                <span className="text-xs text-[var(--copper-secondary,#3A6E6A)] font-medium">
                  {m.change}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {properties.length > 0 && (
        <dl
          className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5 text-sm m-0"
          data-testid="facet-summary-properties"
        >
          {properties.map((prop: SummaryProperty, idx: number) => (
            <div
              key={prop.key ?? prop.label ?? idx}
              className="flex items-baseline justify-between gap-2 py-1 border-b border-[var(--md-sys-color-outline-variant,#CAC4D0)] last:border-b-0"
            >
              <dt className="text-[var(--md-sys-color-on-surface-variant,#49454E)] font-medium">
                {prop.label}
              </dt>
              <dd className="text-[var(--md-sys-color-on-surface,#1D1B20)] font-medium m-0 flex items-center gap-1.5 [font-variant-numeric:tabular-nums]">
                <span>{prop.value}</span>
                {prop.badge && (
                  <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold uppercase tracking-wider bg-[var(--md-sys-color-surface-container-high,#E6E0E9)] text-[var(--md-sys-color-on-surface-variant,#49454E)]">
                    {prop.badge.label}
                  </span>
                )}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

export function createSummaryFacet(options: SummaryFacetOptions): Facet<SummaryFacetData> {
  return {
    id: options.id ?? "summary",
    entity: options.entity,
    weight: options.weight ?? 10,
    requires: options.requires,
    title: options.title ?? "Summary",
    load: options.load ?? (async () => ({ properties: [] })),
    Render: options.Render ?? SummaryFacetRenderer,
    findings: options.findings,
    actions: options.actions,
  };
}

export const SummaryFacet = createSummaryFacet;
