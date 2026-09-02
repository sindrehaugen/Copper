import {
  argbFromHex,
  hexFromArgb,
  TonalPalette,
} from "@material/material-color-utilities";

/**
 * Semantic Ramp (ADR-0009 / Batch 129)
 *
 * Dedicated domain severity and guidance ramp:
 * - blocker: critical error / fatal obstruction (Crimson seed #BA1A1A)
 * - risk: warning / hazard / caution (Golden Amber seed #C67D00)
 * - advice: recommendation / guidance / info (Ocean Blue seed #006590)
 *
 * CONSTRAINT: The semantic ramp MUST NOT borrow or share color values with
 * the Copper accent pair (#B87333 / #3A6E6A).
 */

export const SEMANTIC_SEEDS = {
  blocker: "#BA1A1A",
  risk: "#C67D00",
  advice: "#006590",
} as const;

export interface SemanticRampLevel {
  color: string;
  onColor: string;
  container: string;
  onContainer: string;
}

export interface SemanticScheme {
  blocker: SemanticRampLevel;
  risk: SemanticRampLevel;
  advice: SemanticRampLevel;
}

export interface SemanticRamp {
  light: SemanticScheme;
  dark: SemanticScheme;
}

export function generateSemanticRamp(): SemanticRamp {
  const blockerPalette = TonalPalette.fromInt(argbFromHex(SEMANTIC_SEEDS.blocker));
  const riskPalette = TonalPalette.fromInt(argbFromHex(SEMANTIC_SEEDS.risk));
  const advicePalette = TonalPalette.fromInt(argbFromHex(SEMANTIC_SEEDS.advice));

  return {
    light: {
      blocker: {
        color: hexFromArgb(blockerPalette.tone(40)),
        onColor: hexFromArgb(blockerPalette.tone(100)),
        container: hexFromArgb(blockerPalette.tone(90)),
        onContainer: hexFromArgb(blockerPalette.tone(10)),
      },
      risk: {
        color: hexFromArgb(riskPalette.tone(40)),
        onColor: hexFromArgb(riskPalette.tone(100)),
        container: hexFromArgb(riskPalette.tone(90)),
        onContainer: hexFromArgb(riskPalette.tone(10)),
      },
      advice: {
        color: hexFromArgb(advicePalette.tone(40)),
        onColor: hexFromArgb(advicePalette.tone(100)),
        container: hexFromArgb(advicePalette.tone(90)),
        onContainer: hexFromArgb(advicePalette.tone(10)),
      },
    },
    dark: {
      blocker: {
        color: hexFromArgb(blockerPalette.tone(80)),
        onColor: hexFromArgb(blockerPalette.tone(20)),
        container: hexFromArgb(blockerPalette.tone(30)),
        onContainer: hexFromArgb(blockerPalette.tone(90)),
      },
      risk: {
        color: hexFromArgb(riskPalette.tone(80)),
        onColor: hexFromArgb(riskPalette.tone(20)),
        container: hexFromArgb(riskPalette.tone(30)),
        onContainer: hexFromArgb(riskPalette.tone(90)),
      },
      advice: {
        color: hexFromArgb(advicePalette.tone(80)),
        onColor: hexFromArgb(advicePalette.tone(20)),
        container: hexFromArgb(advicePalette.tone(30)),
        onContainer: hexFromArgb(advicePalette.tone(90)),
      },
    },
  };
}

export const SEMANTIC_RAMP: SemanticRamp = generateSemanticRamp();

/**
 * Formats a semantic color scheme as CSS custom properties
 */
export function semanticToCssProperties(scheme: SemanticScheme, indent = "  "): string {
  return [
    `${indent}--copper-semantic-blocker: ${scheme.blocker.color};`,
    `${indent}--copper-semantic-on-blocker: ${scheme.blocker.onColor};`,
    `${indent}--copper-semantic-blocker-container: ${scheme.blocker.container};`,
    `${indent}--copper-semantic-on-blocker-container: ${scheme.blocker.onContainer};`,
    `${indent}--copper-semantic-risk: ${scheme.risk.color};`,
    `${indent}--copper-semantic-on-risk: ${scheme.risk.onColor};`,
    `${indent}--copper-semantic-risk-container: ${scheme.risk.container};`,
    `${indent}--copper-semantic-on-risk-container: ${scheme.risk.onContainer};`,
    `${indent}--copper-semantic-advice: ${scheme.advice.color};`,
    `${indent}--copper-semantic-on-advice: ${scheme.advice.onColor};`,
    `${indent}--copper-semantic-advice-container: ${scheme.advice.container};`,
    `${indent}--copper-semantic-on-advice-container: ${scheme.advice.onContainer};`,
  ].join("\n");
}
