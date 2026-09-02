import { Component } from "react";
import type { ReactNode, ErrorInfo } from "react";
import { ErrorState } from "./ErrorState";
import type { LensErrorBoundaryProps, LensErrorBoundaryState } from "./types";

export class LensErrorBoundary extends Component<LensErrorBoundaryProps, LensErrorBoundaryState> {
  constructor(props: LensErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): LensErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.props.onError?.(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
    this.props.onReset?.();
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback, dataTestId, lensKind } = this.props;

    if (hasError && error) {
      if (typeof fallback === "function") {
        return fallback(error, this.handleReset);
      }
      if (fallback) {
        return fallback;
      }
      return (
        <ErrorState
          error={error}
          onRetry={this.handleReset}
          dataTestId={dataTestId || (lensKind ? `lens-error-${lensKind}` : "lens-error-state")}
        />
      );
    }

    return children;
  }
}
