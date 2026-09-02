import { useTranslation } from "react-i18next";
import type { Facet, FacetRenderProps } from "../types";
import type {
  NotesFacetData,
  NotesFacetOptions,
  NoteEntry,
} from "./types";

export function NotesFacetRenderer({
  data,
  isLoading,
  error,
}: FacetRenderProps<NotesFacetData>) {
  const { t } = useTranslation();

  if (error) {
    return (
      <div
        className="p-4 rounded-md border border-[var(--copper-error,#BA1A1A)] bg-[var(--copper-error-container,#FFDAD6)] text-[var(--copper-on-error-container,#410002)] text-sm"
        data-testid="facet-notes-error"
      >
        {error.message}
      </div>
    );
  }

  if (isLoading && !data) {
    return (
      <div
        className="p-4 text-center text-sm text-[var(--md-sys-color-on-surface-variant,#49454E)]"
        data-testid="facet-notes-loading"
      >
        {t("common.loading", "Loading...")}
      </div>
    );
  }

  if (!data || !data.notes || data.notes.length === 0) {
    return (
      <div
        className="p-4 text-center text-sm text-[var(--md-sys-color-on-surface-variant,#49454E)]"
        data-testid="facet-empty-notes"
      >
        {t("facet.noNotes", "No notes recorded")}
      </div>
    );
  }

  const { notes } = data;

  return (
    <div
      className="copper-notes-facet flex flex-col gap-3 p-4 rounded-lg bg-[var(--md-sys-color-surface-container-low,#F7F2FA)] border border-[var(--md-sys-color-outline-variant,#CAC4D0)]"
      data-testid="facet-notes"
    >
      <div className="flex flex-col gap-3">
        {notes.map((note: NoteEntry) => (
          <div
            key={note.id}
            className={`p-3 rounded-md bg-[var(--md-sys-color-surface-container,#ECE6F0)] border ${
              note.isPinned
                ? "border-[var(--copper-primary,#B87333)]"
                : "border-[var(--md-sys-color-outline-variant,#CAC4D0)]"
            } flex flex-col gap-1.5`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[var(--md-sys-color-on-surface,#1D1B20)]">
                  {note.author.name}
                </span>
                {note.isPinned && (
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold uppercase tracking-wider bg-[var(--copper-primary-container,#FFDCC2)] text-[var(--copper-on-primary-container,#2E1500)]">
                    {t("facet.pinned", "Pinned")}
                  </span>
                )}
              </div>
              <time className="text-[11px] text-[var(--md-sys-color-on-surface-variant,#49454E)] [font-variant-numeric:tabular-nums]">
                {note.createdAt}
              </time>
            </div>

            <p className="text-sm text-[var(--md-sys-color-on-surface,#1D1B20)] m-0 whitespace-pre-wrap">
              {note.content}
            </p>

            {note.tags && note.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {note.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-[var(--md-sys-color-surface-container-high,#E6E0E9)] text-[var(--md-sys-color-on-surface-variant,#49454E)]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function createNotesFacet(options: NotesFacetOptions): Facet<NotesFacetData> {
  return {
    id: options.id ?? "notes",
    entity: options.entity,
    weight: options.weight ?? 50,
    requires: options.requires,
    title: options.title ?? "Notes",
    load: options.load ?? (async () => ({ notes: [] })),
    Render: options.Render ?? NotesFacetRenderer,
    findings: options.findings,
    actions: options.actions,
  };
}

export const NotesFacet = createNotesFacet;
