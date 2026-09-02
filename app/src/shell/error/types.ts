import type { ReactNode } from "react";

export interface NceErrorObject {
  code?: number | string;
  message?: string;
  data?: unknown;
  name?: string;
  status?: number;
}

export type ErrorPayload = Error | string | NceErrorObject | unknown;

export interface ErrorStateProps {
  error?: ErrorPayload | null;
  onRetry?: (() => void) | undefined;
  className?: string | undefined;
  dataTestId?: string | undefined;
  title?: ReactNode | undefined;
  fallbackMessage?: string | undefined;
}

export interface LensErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode) | undefined;
  onReset?: (() => void) | undefined;
  onError?: ((error: Error, errorInfo: React.ErrorInfo) => void) | undefined;
  lensKind?: string | undefined;
  dataTestId?: string | undefined;
}

export interface LensErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export interface NotFoundStateProps {
  pathname?: string | undefined;
  onNavigateHome?: (() => void) | undefined;
  dataTestId?: string | undefined;
  className?: string | undefined;
}
