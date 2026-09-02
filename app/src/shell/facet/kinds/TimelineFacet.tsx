import { useTranslation } from "react-i18next";
import type { Facet, FacetRenderProps } from "../types";
import type {
  TimelineFacetData,
  TimelineFacetOptions,
  TimelineEvent,
} from "./types";

export function TimelineFacetRenderer({
  data,
  isLoading,
  error,
}: FacetRenderProps<TimelineFacetData>) {
  const { t } = useTranslation();

  if (error) {
    return (
      <div
        className="p-4 rounded-md border border-[var(--copper-error,#BA1A1A)] bg-[var(--copper-error-container,#FFDAD6)] text-[var(--copper-on-error-container,#410002)] text-sm"
        data-testid="facet-timeline-error"
      >
        {error.message}
      </div>
    );
  }

  if (isLoading && !data) {
    return (
      <div
        className="p-4 text-center text-sm text-[var(--md-sys-color-on-surface-variant,#49454E)]"
        data-testid="facet-timeline-loading"
      >
        {t("common.loading", "Loading...")}
      </div>
    );
  }

  if (!data || !data.events || data.events.length === 0) {
    return (
      <div
        className="p-4 text-center text-sm text-[var(--md-sys-color-on-surface-variant,#49454E)]"
        data-testid="facet-empty-timeline"
      >
        {t("facet.noEvents", "No timeline events recorded")}
      </div>
    );
  }

  const { events } = data;

  return (
    <div
      className="copper-timeline-facet flex flex-col gap-3 p-4 rounded-lg bg-[var(--md-sys-color-surface-container-low,#F7F2FA)] border border-[var(--md-sys-color-outline-variant,#CAC4D0)]"
      data-testid="facet-timeline"
    >
      <ol className="relative border-l border-[var(--md-sys-color-outline-variant,#CAC4D0)] ml-3 pl-4 space-y-4 list-none m-0">
        {events.map((evt: TimelineEvent) => (
          <li key={evt.id} className="relative group">
            <span
              className="absolute -left-[23px] top-1.5 w-3 h-3 rounded-full border-2 border-[var(--md-sys-color-surface,#FEF7FF)] bg-[var(--copper-primary,#B87333)]"
              aria-hidden="true"
            />
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-[var(--md-sys-color-on-surface,#1D1B20)]">
                  {evt.title}
                </span>
                <time className="text-xs text-[var(--md-sys-color-on-surface-variant,#49454E)] [font-variant-numeric:tabular-nums]">
                  {evt.timestamp}
                </time>
              </div>

              {evt.description && (
                <p className="text-xs text-[var(--md-sys-color-on-surface-variant,#49454E)] m-0">
                  {evt.description}
                </p>
              )}

              <div className="flex items-center gap-3 text-[11px] text-[var(--md-sys-color-on-surface-variant,#49454E)] mt-0.5">
                {evt.actor && (
                  <span className="font-medium text-[var(--md-sys-color-on-surface,#1D1B20)]">
                    {evt.actor.name}
                  </span>
                )}
                {evt.category && (
                  <span className="uppercase tracking-wider px-1.5 py-0.5 rounded bg-[var(--md-sys-color-surface-container-high,#E6E0E9)] text-[10px]">
                    {evt.category}
                  </span>
                )}
                {evt.status && (
                  <span
                    className="capitalize font-medium"
                    data-status={evt.status}
                  >
                    {evt.status.replace("_", " ")}
                  </span>
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function createTimelineFacet(options: TimelineFacetOptions): Facet<TimelineFacetData> {
  return {
    id: options.id ?? "timeline",
    entity: options.entity,
    weight: options.weight ?? 30,
    requires: options.requires,
    title: options.title ?? "Timeline",
    load: options.load ?? (async () => ({ events: [] })),
    Render: options.Render ?? TimelineFacetRenderer,
    findings: options.findings,
    actions: options.actions,
  };
}

export const TimelineFacet = createTimelineFacet;
