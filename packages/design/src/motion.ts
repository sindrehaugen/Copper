/**
 * Motion Tokens (ADR-0009 / Batch 129)
 *
 * Functional motion durations and easings:
 * - Short: 120ms (toggles, hover states, micro-interactions)
 * - Medium: 200ms (expansion panels, drawers, modals, tab switches)
 *
 * Reduced Motion:
 * - Default / reduced: 0ms duration
 * - Wrapped in @media (prefers-reduced-motion: no-preference) to enable animated transitions.
 */

export const MOTION_DURATIONS = {
  short: "120ms",
  medium: "200ms",
  none: "0ms",
} as const;

export const MOTION_EASINGS = {
  standard: "cubic-bezier(0.2, 0, 0, 1)",
  emphasized: "cubic-bezier(0.2, 0, 0, 1)",
  linear: "linear",
} as const;

export function motionBaseToCssProperties(indent = "  "): string {
  return [
    `${indent}--copper-motion-duration-short: ${MOTION_DURATIONS.none};`,
    `${indent}--copper-motion-duration-medium: ${MOTION_DURATIONS.none};`,
    `${indent}--copper-motion-easing-standard: ${MOTION_EASINGS.standard};`,
    `${indent}--copper-motion-easing-emphasized: ${MOTION_EASINGS.emphasized};`,
  ].join("\n");
}

export function motionActiveToCssProperties(indent = "  "): string {
  return [
    `${indent}--copper-motion-duration-short: ${MOTION_DURATIONS.short};`,
    `${indent}--copper-motion-duration-medium: ${MOTION_DURATIONS.medium};`,
    `${indent}--copper-motion-easing-standard: ${MOTION_EASINGS.standard};`,
    `${indent}--copper-motion-easing-emphasized: ${MOTION_EASINGS.emphasized};`,
  ].join("\n");
}

export function generateMotionCssRules(): string {
  return [
    `/* --- Motion Tokens (WCAG 2.1 / EN 301 549 Prefers-Reduced-Motion) --- */`,
    `@media (prefers-reduced-motion: no-preference) {`,
    `  :root {`,
    motionActiveToCssProperties("    "),
    `  }`,
    `}`,
  ].join("\n");
}
