import { useTranslation } from "react-i18next";
import type { Facet, FacetRenderProps } from "../types";
import type {
  DocumentsFacetData,
  DocumentsFacetOptions,
  DocumentItem,
} from "./types";

function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0)} ${units[i]}`;
}

export function DocumentsFacetRenderer({
  data,
  isLoading,
  error,
}: FacetRenderProps<DocumentsFacetData>) {
  const { t } = useTranslation();

  if (error) {
    return (
      <div
        className="p-4 rounded-md border border-[var(--copper-error,#BA1A1A)] bg-[var(--copper-error-container,#FFDAD6)] text-[var(--copper-on-error-container,#410002)] text-sm"
        data-testid="facet-documents-error"
      >
        {error.message}
      </div>
    );
  }

  if (isLoading && !data) {
    return (
      <div
        className="p-4 text-center text-sm text-[var(--md-sys-color-on-surface-variant,#49454E)]"
        data-testid="facet-documents-loading"
      >
        {t("common.loading", "Loading...")}
      </div>
    );
  }

  if (!data || !data.documents || data.documents.length === 0) {
    return (
      <div
        className="p-4 text-center text-sm text-[var(--md-sys-color-on-surface-variant,#49454E)]"
        data-testid="facet-empty-documents"
      >
        {t("facet.noDocuments", "No documents attached")}
      </div>
    );
  }

  const { documents } = data;

  return (
    <div
      className="copper-documents-facet flex flex-col gap-2 p-4 rounded-lg bg-[var(--md-sys-color-surface-container-low,#F7F2FA)] border border-[var(--md-sys-color-outline-variant,#CAC4D0)]"
      data-testid="facet-documents"
    >
      <ul className="divide-y divide-[var(--md-sys-color-outline-variant,#CAC4D0)] list-none m-0 p-0">
        {documents.map((doc: DocumentItem) => (
          <li
            key={doc.id}
            className="flex items-center justify-between py-2.5 px-1 first:pt-0 last:pb-0 gap-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded bg-[var(--md-sys-color-surface-container-high,#E6E0E9)] text-xs font-bold uppercase text-[var(--copper-primary,#B87333)] shrink-0">
                {doc.fileType ?? "FILE"}
              </span>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-[var(--md-sys-color-on-surface,#1D1B20)] truncate">
                  {doc.title}
                </span>
                <div className="flex items-center gap-2 text-xs text-[var(--md-sys-color-on-surface-variant,#49454E)]">
                  {doc.filename && <span className="truncate">{doc.filename}</span>}
                  {doc.sizeBytes && (
                    <span className="[font-variant-numeric:tabular-nums]">
                      {formatFileSize(doc.sizeBytes)}
                    </span>
                  )}
                  {doc.category && (
                    <span className="px-1.5 py-0.2 rounded bg-[var(--md-sys-color-surface-container-high,#E6E0E9)] text-[10px] uppercase font-semibold">
                      {doc.category}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {doc.updatedAt && (
                <time className="text-xs text-[var(--md-sys-color-on-surface-variant,#49454E)] [font-variant-numeric:tabular-nums]">
                  {doc.updatedAt}
                </time>
              )}
              {doc.url && (
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-[var(--copper-primary,#B87333)] hover:underline"
                >
                  {t("common.open", "Open")}
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function createDocumentsFacet(options: DocumentsFacetOptions): Facet<DocumentsFacetData> {
  return {
    id: options.id ?? "documents",
    entity: options.entity,
    weight: options.weight ?? 40,
    requires: options.requires,
    title: options.title ?? "Documents",
    load: options.load ?? (async () => ({ documents: [] })),
    Render: options.Render ?? DocumentsFacetRenderer,
    findings: options.findings,
    actions: options.actions,
  };
}

export const DocumentsFacet = createDocumentsFacet;
