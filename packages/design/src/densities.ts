/**
 * Density Tokens (HS-14 / Batch 129)
 *
 * Professional AV CAD / Engineering Tool densities:
 * - comfortable: 44px (touch-friendly / presentation)
 * - compact: 36px (DEFAULT — optimized for 1080p workable layouts)
 * - dense: 28px (high-density channel strips, port grids, dense BOM)
 */

export type DensityName = "comfortable" | "compact" | "dense";

export interface DensityTokens {
  rowHeight: string;
  controlHeight: string;
  cellPaddingY: string;
  cellPaddingX: string;
  gap: string;
  iconSize: string;
}

export const DEFAULT_DENSITY: DensityName = "compact";

export const DENSITIES: Record<DensityName, DensityTokens> = {
  comfortable: {
    rowHeight: "44px",
    controlHeight: "44px",
    cellPaddingY: "10px",
    cellPaddingX: "12px",
    gap: "12px",
    iconSize: "24px",
  },
  compact: {
    rowHeight: "36px",
    controlHeight: "36px",
    cellPaddingY: "6px",
    cellPaddingX: "10px",
    gap: "8px",
    iconSize: "20px",
  },
  dense: {
    rowHeight: "28px",
    controlHeight: "28px",
    cellPaddingY: "4px",
    cellPaddingX: "8px",
    gap: "4px",
    iconSize: "16px",
  },
} as const;

export function densityToCssProperties(
  tokens: DensityTokens = DENSITIES[DEFAULT_DENSITY],
  indent = "  "
): string {
  return [
    `${indent}--copper-density-row-height: ${tokens.rowHeight};`,
    `${indent}--copper-density-control-height: ${tokens.controlHeight};`,
    `${indent}--copper-density-cell-padding-y: ${tokens.cellPaddingY};`,
    `${indent}--copper-density-cell-padding-x: ${tokens.cellPaddingX};`,
    `${indent}--copper-density-gap: ${tokens.gap};`,
    `${indent}--copper-density-icon-size: ${tokens.iconSize};`,
  ].join("\n");
}

export function generateDensityCssRules(): string {
  return [
    `/* --- Density Rules (HS-14: compact default) --- */`,
    `[data-density="comfortable"], .density-comfortable {`,
    densityToCssProperties(DENSITIES.comfortable, "  "),
    `}`,
    ``,
    `[data-density="compact"], .density-compact {`,
    densityToCssProperties(DENSITIES.compact, "  "),
    `}`,
    ``,
    `[data-density="dense"], .density-dense {`,
    densityToCssProperties(DENSITIES.dense, "  "),
    `}`,
  ].join("\n");
}
