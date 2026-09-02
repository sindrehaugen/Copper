import React, { Component, type ReactNode, type ErrorInfo } from "react";
import { useTranslation } from "react-i18next";
import i18next from "i18next";
import type { FacetCardProps } from "./types";
import { useFacetLoader } from "./useFacetLoader";

interface FacetCardErrorBoundaryProps {
  facetId: string;
  children: ReactNode;
  onRetry?: () => void;
}

interface FacetCardErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class FacetCardErrorBoundary extends Component<
  FacetCardErrorBoundaryProps,
  FacetCardErrorBoundaryState
> {
  constructor(props: FacetCardErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): FacetCardErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error(`Error in facet card [${this.props.facetId}]:`, error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onRetry?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="copper-facet-card-error p-4 rounded-md border border-[var(--copper-error,#BA1A1A)] bg-[var(--copper-error-container,#FFDAD6)] text-[var(--copper-on-error-container,#410002)]"
          data-testid={`facet-card-error-${this.props.facetId}`}
        >
          <div className="font-medium mb-2">
            {this.state.error?.message || i18next.t("error", "Failed to render facet")}
          </div>
          <button
            type="button"
            className="text-xs px-2.5 py-1 rounded bg-[var(--copper-error,#BA1A1A)] text-white hover:opacity-90"
            onClick={this.handleReset}
          >
            {i18next.t("retry", "Retry")}
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export function FacetCard<TData = unknown>({
  facet,
  entityType,
  entityId,
  className = "",
}: FacetCardProps<TData>) {
  const { t } = useTranslation();
  const { data, isLoading, error, reload } = useFacetLoader(facet, entityType, entityId);

  const RenderComponent = facet.Render;

  return (
    <div
      className={`copper-facet-card ${className}`.trim()}
      data-testid={`facet-card-${facet.id}`}
      data-facet-id={facet.id}
      data-facet-weight={facet.weight}
    >
      <FacetCardErrorBoundary facetId={facet.id} onRetry={reload}>
        {error ? (
          <div
            className="copper-facet-card-error p-4 rounded-md border border-[var(--copper-error,#BA1A1A)] bg-[var(--copper-error-container,#FFDAD6)] text-[var(--copper-on-error-container,#410002)]"
            data-testid={`facet-card-error-${facet.id}`}
          >
            <div className="font-medium mb-2">{error.message}</div>
            <button
              type="button"
              className="text-xs px-2.5 py-1 rounded bg-[var(--copper-error,#BA1A1A)] text-white hover:opacity-90"
              onClick={reload}
            >
              {t("retry", "Retry")}
            </button>
          </div>
        ) : isLoading && !data ? (
          <div
            className="copper-facet-card-loading"
            data-testid={`facet-card-loading-${facet.id}`}
          >
            <RenderComponent
              entityType={entityType}
              entityId={entityId}
              data={data as TData}
              isLoading={isLoading}
              error={error}
              reload={reload}
            />
          </div>
        ) : (
          <RenderComponent
            entityType={entityType}
            entityId={entityId}
            data={data as TData}
            isLoading={isLoading}
            error={error}
            reload={reload}
          />
        )}
      </FacetCardErrorBoundary>
    </div>
  );
}
