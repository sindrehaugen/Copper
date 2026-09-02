import type { KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import { BaseLens } from "./BaseLens";
import type {
  CockpitLensProps,
  CockpitFigureProps,
  CockpitSectionProps,
  DrillThroughControlProps,
} from "./types";

/**
 * Custom error thrown when a figure in CockpitLens violates the Cockpit Rule:
 * Every figure/number must expose an onDrillThrough prop or be wrapped in a
 * drill-through control that explicitly takes the user to a GridLens.
 */
export class CockpitRuleViolationError extends Error {
  constructor(message = "Cockpit Rule Violation: Every figure/number in a CockpitLens must expose an onDrillThrough prop taking the user to a GridLens. No dead-end numbers.") {
    super(message);
    this.name = "CockpitRuleViolationError";
  }
}

/**
 * CockpitFigure - KPI / Metric card strictly enforcing the Cockpit Rule.
 */
export function CockpitFigure({
  label,
  value,
  unit,
  trend,
  status = "normal",
  onDrillThrough,
  drillThroughLabel,
  targetGridLens,
  className = "",
  dataTestId,
}: CockpitFigureProps) {
  const { t } = useTranslation();

  // Strict Cockpit Rule enforcement
  if (!onDrillThrough || typeof onDrillThrough !== "function") {
    throw new CockpitRuleViolationError(
      `Cockpit Rule Violation: Metric "${typeof label === "string" ? label : "Unknown"}" is missing required onDrillThrough handler. No dead-end numbers.`
    );
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onDrillThrough();
    }
  };

  const defaultHint = targetGridLens
    ? t("cockpit.drillToGridNamed", `View in ${targetGridLens}`, { name: targetGridLens })
    : t("cockpit.drillToGrid", "View in Grid");

  const resolvedDrillLabel = drillThroughLabel || defaultHint;
  const statusClass = status !== "normal" ? `copper-status-${status}` : "";

  const trendIcon = trend?.direction === "up" ? "▲ " : trend?.direction === "down" ? "▼ " : "";
  const trendText = trend ? `${trendIcon}${trend.value}${trend.label ? ` ${trend.label}` : ""}` : "";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onDrillThrough()}
      onKeyDown={handleKeyDown}
      className={`copper-cockpit-figure ${statusClass} ${className}`.trim()}
      data-testid={dataTestId || "cockpit-figure"}
      data-target-grid={targetGridLens}
      aria-label={`${typeof label === "string" ? label : ""}: ${String(value)} ${typeof unit === "string" ? unit : ""}. ${resolvedDrillLabel}`.trim()}
    >
      <div className="copper-cockpit-figure-header">
        <span className="copper-cockpit-figure-label">{label}</span>
        <span className="copper-cockpit-drillthrough-icon" aria-hidden="true">
          →
        </span>
      </div>

      <div className="copper-cockpit-figure-value-row">
        <span className="copper-cockpit-figure-value">{value}</span>
        {unit && <span className="copper-cockpit-figure-unit">{unit}</span>}
      </div>

      <div className="copper-cockpit-figure-footer">
        {trend ? (
          <span
            className={`copper-cockpit-figure-trend copper-cockpit-trend-${trend.direction || "neutral"}`}
          >
            {trendText}
          </span>
        ) : (
          <span />
        )}
        <span className="copper-cockpit-figure-drillthrough-hint">
          {resolvedDrillLabel}
        </span>
      </div>
    </div>
  );
}

/**
 * DrillThroughControl - Inline wrapper enforcing drill-through navigation on custom numbers.
 */
export function DrillThroughControl({
  onDrillThrough,
  children,
  label,
  targetGridLens,
  className = "",
  dataTestId,
}: DrillThroughControlProps) {
  const { t } = useTranslation();

  // Strict Cockpit Rule enforcement
  if (!onDrillThrough || typeof onDrillThrough !== "function") {
    throw new CockpitRuleViolationError(
      "Cockpit Rule Violation: DrillThroughControl requires an onDrillThrough handler to route to a GridLens."
    );
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onDrillThrough();
    }
  };

  const hint = label || (targetGridLens
    ? t("cockpit.drillToGridNamed", `View in ${targetGridLens}`, { name: targetGridLens })
    : t("cockpit.drillToGrid", "View in Grid"));

  return (
    <button
      type="button"
      onClick={() => onDrillThrough()}
      onKeyDown={handleKeyDown}
      className={`copper-drillthrough-control ${className}`.trim()}
      data-testid={dataTestId || "drill-through-control"}
      data-target-grid={targetGridLens}
      title={hint}
      aria-label={hint}
    >
      {children}
    </button>
  );
}

/**
 * CockpitSection - Section container for cockpit figures with header.
 */
export function CockpitSection({
  title,
  description,
  actions,
  children,
  className = "",
}: CockpitSectionProps) {
  return (
    <section className={`copper-cockpit-section ${className}`.trim()}>
      {(title || description || actions) && (
        <div className="copper-cockpit-section-header">
          <div>
            {title && <h2 className="copper-cockpit-section-title">{title}</h2>}
            {description && (
              <p className="copper-cockpit-section-description">{description}</p>
            )}
          </div>
          {actions && <div className="copper-cockpit-section-actions">{actions}</div>}
        </div>
      )}
      <div className="copper-cockpit-grid">{children}</div>
    </section>
  );
}

/**
 * CockpitLens - Shell for cockpit surfaces.
 */
export function CockpitLens(props: CockpitLensProps) {
  return <BaseLens {...props} lensKind="cockpit" />;
}
