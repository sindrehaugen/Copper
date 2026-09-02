import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { ErrorStateProps, NceErrorObject } from "./types";

export function isGovernanceDisabledError(error: unknown): boolean {
  if (!error) return false;
  if (typeof error === "object" && error !== null) {
    const errObj = error as NceErrorObject;
    if (errObj.code === -32005 || errObj.code === "-32005") return true;
    if (
      typeof errObj.message === "string" &&
      (errObj.message.includes("-32005") || errObj.message.includes("32005"))
    ) {
      return true;
    }
  }
  if (typeof error === "string" && (error.includes("-32005") || error.includes("32005"))) {
    return true;
  }
  return false;
}

export function isNceUnreachableError(error: unknown): boolean {
  if (!error) return false;
  if (typeof error === "object" && error !== null) {
    const errObj = error as NceErrorObject;
    const msg = typeof errObj.message === "string" ? errObj.message.toLowerCase() : "";
    const name = typeof errObj.name === "string" ? errObj.name.toLowerCase() : "";
    const code = typeof errObj.code === "string" ? errObj.code : "";

    if (code === "ECONNREFUSED" || code === "ETIMEDOUT" || code === "ENOTFOUND") return true;
    if (
      msg.includes("econnrefused") ||
      msg.includes("etimedout") ||
      msg.includes("failed to fetch") ||
      msg.includes("network error") ||
      msg.includes("unreachable")
    ) {
      return true;
    }
    if (name.includes("typeerror") && msg.includes("fetch")) return true;
  }
  if (typeof error === "string") {
    const lower = error.toLowerCase();
    if (
      lower.includes("econnrefused") ||
      lower.includes("unreachable") ||
      lower.includes("network error") ||
      lower.includes("failed to fetch")
    ) {
      return true;
    }
  }
  return false;
}

export function ErrorState({
  error,
  onRetry,
  className = "",
  dataTestId = "error-state",
  title,
  fallbackMessage,
}: ErrorStateProps) {
  const { t } = useTranslation();

  let message: ReactNode = fallbackMessage || t("common.error", "An error occurred");
  let errorBadge: string | null = null;
  let isGovernance = false;
  let isUnreachable = false;

  if (error) {
    if (isGovernanceDisabledError(error)) {
      isGovernance = true;
      errorBadge = "-32005";
      message = t(
        "errors.-32005",
        "Server error (-32005): Method not found or unavailable."
      );
    } else if (isNceUnreachableError(error)) {
      isUnreachable = true;
      errorBadge = "UNREACHABLE";
      if (
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as { message?: unknown }).message === "string"
      ) {
        message = (error as { message: string }).message;
      } else if (typeof error === "string") {
        message = error;
      } else {
        message = t("errors.nceUnreachable", "NCE service unreachable: unable to establish connection");
      }
    } else if (typeof error === "string") {
      message = error;
    } else if (error instanceof Error) {
      message = error.message;
    } else if (
      typeof error === "object" &&
      error !== null &&
      "message" in error &&
      typeof (error as { message?: unknown }).message === "string"
    ) {
      message = (error as { message: string }).message;
    }
  }

  return (
    <div
      className={`error-state copper-error-state ${className}`.trim()}
      role="alert"
      aria-live="assertive"
      data-testid={dataTestId}
      data-error-kind={isGovernance ? "governance" : isUnreachable ? "unreachable" : "runtime"}
    >
      {title && <h3 className="copper-error-title">{title}</h3>}
      {errorBadge && (
        <span className="copper-error-badge" data-testid="error-code-badge">
          {errorBadge}
        </span>
      )}
      <p className="copper-error-message">{message}</p>
      {onRetry && (
        <button
          type="button"
          className="copper-error-retry-btn"
          onClick={onRetry}
          aria-label={t("common.retry", "Retry")}
        >
          {t("common.retry", "Retry")}
        </button>
      )}
    </div>
  );
}
