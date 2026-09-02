import type { ReactNode } from "react";
import type { ErrorStateProps } from "../error-state";

export type LensKind = "entity" | "grid" | "canvas" | "board" | "cockpit";

export interface LensBreadcrumb {
  label: ReactNode;
  href?: string | undefined;
  onClick?: (() => void) | undefined;
}

export interface LensHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode | undefined;
  badge?: ReactNode | undefined;
  actions?: ReactNode | undefined;
  breadcrumbs?: LensBreadcrumb[] | undefined;
  lensKind?: LensKind | undefined;
  className?: string | undefined;
  children?: ReactNode | undefined;
  dataTestId?: string | undefined;
}

export interface BaseLensProps {
  title: ReactNode;
  subtitle?: ReactNode | undefined;
  badge?: ReactNode | undefined;
  actions?: ReactNode | undefined;
  breadcrumbs?: LensBreadcrumb[] | undefined;
  isLoading?: boolean | undefined;
  error?: ErrorStateProps["error"] | null;
  isEmpty?: boolean | undefined;
  onRetry?: (() => void) | undefined;
  emptyMessage?: string | undefined;
  className?: string | undefined;
  children?: ReactNode | undefined;
  dataTestId?: string | undefined;
  headerSlot?: ReactNode | undefined;
  lensKind?: LensKind | undefined;
}

export interface EntityLensProps extends BaseLensProps {
  entityType?: string | undefined;
  entityId?: string | undefined;
}

export interface GridLensProps extends BaseLensProps {
  rowCount?: number | undefined;
  selectedCount?: number | undefined;
  viewName?: string | undefined;
}

export interface CanvasLensProps extends BaseLensProps {
  zoom?: number | undefined;
  mode?: string | undefined;
}

export interface BoardLensProps extends BaseLensProps {
  columnCount?: number | undefined;
  cardCount?: number | undefined;
}

export type CockpitTrendDirection = "up" | "down" | "neutral";

export interface CockpitTrend {
  value: number | string;
  direction?: CockpitTrendDirection | undefined;
  label?: string | undefined;
}

export type CockpitFigureStatus = "normal" | "warning" | "critical" | "success";

export interface CockpitFigureProps {
  label: ReactNode;
  value: ReactNode | number | string;
  unit?: ReactNode | undefined;
  trend?: CockpitTrend | undefined;
  status?: CockpitFigureStatus | undefined;
  description?: ReactNode | undefined;
  /**
   * COCKPIT RULE: Every figure/number in a CockpitLens must expose an onDrillThrough prop
   * or be wrapped in a drill-through control that explicitly takes the user to a GridLens.
   * No dead-end numbers.
   */
  onDrillThrough: () => void | Promise<void>;
  drillThroughLabel?: string | undefined;
  targetGridLens?: string | undefined;
  className?: string | undefined;
  dataTestId?: string | undefined;
}

export interface DrillThroughControlProps {
  /**
   * COCKPIT RULE: handler taking the user to a GridLens.
   */
  onDrillThrough: () => void | Promise<void>;
  children: ReactNode;
  label?: string | undefined;
  targetGridLens?: string | undefined;
  className?: string | undefined;
  dataTestId?: string | undefined;
}

export interface CockpitLensProps extends BaseLensProps {
  strictMode?: boolean | undefined;
}

export interface CockpitSectionProps {
  title?: ReactNode | undefined;
  description?: ReactNode | undefined;
  actions?: ReactNode | undefined;
  children: ReactNode;
  className?: string | undefined;
}
