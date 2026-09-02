import { useTranslation } from "react-i18next";
import type { Facet, FacetRenderProps } from "../types";
import type {
  TelemetryFacetData,
  TelemetryFacetOptions,
  TelemetryMetric,
} from "./types";

export function TelemetryFacetRenderer({
  data,
  isLoading,
  error,
}: FacetRenderProps<TelemetryFacetData>) {
  const { t } = useTranslation();

  if (error) {
    return (
      <div
        className="p-4 rounded-md border border-[var(--copper-error,#BA1A1A)] bg-[var(--copper-error-container,#FFDAD6)] text-[var(--copper-on-error-container,#410002)] text-sm"
        data-testid="facet-telemetry-error"
      >
        {error.message}
      </div>
    );
  }

  if (isLoading && !data) {
    return (
      <div
        className="p-4 text-center text-sm text-[var(--md-sys-color-on-surface-variant,#49454E)]"
        data-testid="facet-telemetry-loading"
      >
        {t("common.loading", "Loading...")}
      </div>
    );
  }

  if (!data || !data.metrics || data.metrics.length === 0) {
    return (
      <div
        className="p-4 text-center text-sm text-[var(--md-sys-color-on-surface-variant,#49454E)]"
        data-testid="facet-empty-telemetry"
      >
        {t("facet.noTelemetry", "No telemetry data recorded")}
      </div>
    );
  }

  const { status, lastPing, metrics } = data;

  return (
    <div
      className="copper-telemetry-facet flex flex-col gap-4 p-4 rounded-lg bg-[var(--md-sys-color-surface-container-low,#F7F2FA)] border border-[var(--md-sys-color-outline-variant,#CAC4D0)]"
      data-testid="facet-telemetry"
    >
      <div className="flex items-center justify-between gap-2 border-b border-[var(--md-sys-color-outline-variant,#CAC4D0)] pb-2.5">
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              status === "healthy"
                ? "bg-[var(--copper-secondary,#3A6E6A)]"
                : status === "degraded"
                ? "bg-[var(--copper-semantic-risk,#B05500)]"
                : "bg-[var(--copper-error,#BA1A1A)]"
            }`}
            aria-hidden="true"
          />
          <span
            className="text-xs font-semibold uppercase tracking-wider text-[var(--md-sys-color-on-surface,#1D1B20)]"
            data-testid="facet-telemetry-status"
          >
            {status}
          </span>
        </div>

        {lastPing && (
          <div className="text-xs text-[var(--md-sys-color-on-surface-variant,#49454E)] flex items-center gap-1">
            <span>{t("facet.lastPing", "Last Ping:")}</span>
            <time className="[font-variant-numeric:tabular-nums]">{lastPing}</time>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {metrics.map((m: TelemetryMetric) => (
          <div
            key={m.id}
            className="p-3 rounded-md bg-[var(--md-sys-color-surface-container,#ECE6F0)] border border-[var(--md-sys-color-outline-variant,#CAC4D0)] flex flex-col gap-1"
          >
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs text-[var(--md-sys-color-on-surface-variant,#49454E)] font-medium truncate">
                {m.name}
              </span>
              {m.status && (
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  data-metric-status={m.status}
                  style={{
                    backgroundColor:
                      m.status === "normal"
                        ? "var(--copper-secondary, #3A6E6A)"
                        : m.status === "warning"
                        ? "var(--copper-semantic-risk, #B05500)"
                        : "var(--copper-error, #BA1A1A)",
                  }}
                />
              )}
            </div>

            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg font-bold text-[var(--md-sys-color-on-surface,#1D1B20)] [font-variant-numeric:tabular-nums]">
                {m.value}
              </span>
              {m.unit && (
                <span className="text-xs text-[var(--md-sys-color-on-surface-variant,#49454E)] font-medium">
                  {m.unit}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function createTelemetryFacet(options: TelemetryFacetOptions): Facet<TelemetryFacetData> {
  return {
    id: options.id ?? "telemetry",
    entity: options.entity,
    weight: options.weight ?? 70,
    requires: options.requires,
    title: options.title ?? "Telemetry",
    load: options.load ?? (async () => ({ status: "unknown", metrics: [] })),
    Render: options.Render ?? TelemetryFacetRenderer,
    findings: options.findings,
    actions: options.actions,
  };
}

export const TelemetryFacet = createTelemetryFacet;
