import { LensHeader } from "./LensHeader";
import { LoadingState } from "../loading-state";
import { ErrorState } from "../error-state";
import { EmptyState } from "../empty-state";
import type { BaseLensProps } from "./types";

export function BaseLens({
  title,
  subtitle,
  badge,
  actions,
  breadcrumbs,
  isLoading = false,
  error = null,
  isEmpty = false,
  onRetry,
  className = "",
  children,
  dataTestId,
  headerSlot,
  lensKind,
}: BaseLensProps) {
  const kindClass = lensKind ? `copper-lens-${lensKind}` : "";
  const testId = dataTestId || (lensKind ? `lens-${lensKind}` : "lens-container");

  return (
    <div
      className={`copper-lens ${kindClass} ${className}`.trim()}
      data-lens-kind={lensKind}
      data-testid={testId}
    >
      <LensHeader
        title={title}
        subtitle={subtitle}
        badge={badge}
        actions={actions}
        breadcrumbs={breadcrumbs}
        lensKind={lensKind}
      >
        {headerSlot}
      </LensHeader>

      <div className="copper-lens-body">
        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState error={error} {...(onRetry !== undefined ? { onRetry } : {})} />
        ) : isEmpty ? (
          <EmptyState />
        ) : (
          children
        )}
      </div>
    </div>
  );
}
