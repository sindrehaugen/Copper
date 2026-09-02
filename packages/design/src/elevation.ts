/**
 * Elevation Tokens (ADR-0009 / Batch 129)
 *
 * Copper simplifies M3 elevation to two distinct functional levels:
 * - Level 0: none (flat / resting on surface)
 * - Level 1: cards, sidebars, tool panels, subtle containers
 * - Level 2: dialogs, floating menus, popovers, dragged items
 */

export const M3_ELEVATION_TOKENS = {
  level0: "none",
  level1: "0px 1px 3px 1px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.30)",
  level2: "0px 2px 6px 2px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.30)",
} as const;

export function elevationToCssProperties(indent = "  "): string {
  return [
    `${indent}--md-sys-elevation-level-0: ${M3_ELEVATION_TOKENS.level0};`,
    `${indent}--md-sys-elevation-level-1: ${M3_ELEVATION_TOKENS.level1};`,
    `${indent}--md-sys-elevation-level-2: ${M3_ELEVATION_TOKENS.level2};`,
    `${indent}--copper-elevation-0: ${M3_ELEVATION_TOKENS.level0};`,
    `${indent}--copper-elevation-1: ${M3_ELEVATION_TOKENS.level1};`,
    `${indent}--copper-elevation-2: ${M3_ELEVATION_TOKENS.level2};`,
  ].join("\n");
}
