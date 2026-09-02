import {
  argbFromHex,
  hexFromArgb,
  Hct,
  DynamicScheme,
  TonalPalette,
  MaterialDynamicColors,
} from "@material/material-color-utilities";

/**
 * Copper Expression Brand Seeds & Accents (ADR-0009 / Batch 129)
 *
 * Accent pair:
 * - Copper primary: #B87333 (warm metallic copper)
 * - Patina secondary: #3A6E6A (oxidized copper teal)
 */
export const COPPER_PRIMARY_HEX = "#B87333";
export const PATINA_SECONDARY_HEX = "#3A6E6A";
export const BRAND_SEED_HEX = COPPER_PRIMARY_HEX;

export const COOL_GRAPHITE_NEUTRAL_HUE = 215;
export const COOL_GRAPHITE_NEUTRAL_CHROMA = 4;
export const COOL_GRAPHITE_VARIANT_CHROMA = 8;

export interface M3ColorScheme {
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  inversePrimary: string;
  primaryFixed: string;
  primaryFixedDim: string;
  onPrimaryFixed: string;
  onPrimaryFixedVariant: string;

  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  secondaryFixed: string;
  secondaryFixedDim: string;
  onSecondaryFixed: string;
  onSecondaryFixedVariant: string;

  tertiary: string;
  onTertiary: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;
  tertiaryFixed: string;
  tertiaryFixedDim: string;
  onTertiaryFixed: string;
  onTertiaryFixedVariant: string;

  error: string;
  onError: string;
  errorContainer: string;
  onErrorContainer: string;

  background: string;
  onBackground: string;

  surface: string;
  onSurface: string;
  surfaceVariant: string;
  onSurfaceVariant: string;
  surfaceDim: string;
  surfaceBright: string;
  surfaceContainerLowest: string;
  surfaceContainerLow: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;
  surfaceContainerHighest: string;

  inverseSurface: string;
  inverseOnSurface: string;

  outline: string;
  outlineVariant: string;
  shadow: string;
  scrim: string;
  surfaceTint: string;
}

export interface M3TypographyToken {
  fontFamily: string;
  fontSize: string;
  lineHeight: string;
  fontWeight: string;
  letterSpacing: string;
}

export const FONT_FAMILY_SYSTEM =
  'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

export const MONOSPACE_FONT_STACK =
  'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

export const TABULAR_NUMS_VALUE = "tabular-nums";

export const M3_SHAPE_TOKENS = {
  cornerNone: "0px",
  cornerExtraSmall: "4px",
  cornerSmall: "8px",
  cornerMedium: "12px",
  cornerLarge: "16px",
  cornerExtraLarge: "28px",
  cornerFull: "9999px",
} as const;

export const M3_ELEVATION_TOKENS = {
  level0: "none",
  level1: "0px 1px 3px 1px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.30)",
  level2: "0px 2px 6px 2px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.30)",
  level3: "0px 4px 8px 3px rgba(0, 0, 0, 0.15), 0px 1px 3px 0px rgba(0, 0, 0, 0.30)",
  level4: "0px 6px 10px 4px rgba(0, 0, 0, 0.15), 0px 2px 3px 0px rgba(0, 0, 0, 0.30)",
  level5: "0px 8px 12px 6px rgba(0, 0, 0, 0.15), 0px 4px 4px 0px rgba(0, 0, 0, 0.30)",
} as const;

export const M3_STATE_TOKENS = {
  hoverOpacity: "0.08",
  focusOpacity: "0.12",
  pressedOpacity: "0.12",
  draggedOpacity: "0.16",
} as const;

export const M3_TYPOGRAPHY_TOKENS: Record<string, M3TypographyToken> = {
  displayLarge: {
    fontFamily: FONT_FAMILY_SYSTEM,
    fontSize: "3.5625rem",
    lineHeight: "4rem",
    fontWeight: "400",
    letterSpacing: "-0.25px",
  },
  displayMedium: {
    fontFamily: FONT_FAMILY_SYSTEM,
    fontSize: "2.8125rem",
    lineHeight: "3.25rem",
    fontWeight: "400",
    letterSpacing: "0px",
  },
  displaySmall: {
    fontFamily: FONT_FAMILY_SYSTEM,
    fontSize: "2.25rem",
    lineHeight: "2.75rem",
    fontWeight: "400",
    letterSpacing: "0px",
  },
  headlineLarge: {
    fontFamily: FONT_FAMILY_SYSTEM,
    fontSize: "2rem",
    lineHeight: "2.5rem",
    fontWeight: "400",
    letterSpacing: "0px",
  },
  headlineMedium: {
    fontFamily: FONT_FAMILY_SYSTEM,
    fontSize: "1.75rem",
    lineHeight: "2.25rem",
    fontWeight: "400",
    letterSpacing: "0px",
  },
  headlineSmall: {
    fontFamily: FONT_FAMILY_SYSTEM,
    fontSize: "1.5rem",
    lineHeight: "2rem",
    fontWeight: "400",
    letterSpacing: "0px",
  },
  titleLarge: {
    fontFamily: FONT_FAMILY_SYSTEM,
    fontSize: "1.375rem",
    lineHeight: "1.75rem",
    fontWeight: "400",
    letterSpacing: "0px",
  },
  titleMedium: {
    fontFamily: FONT_FAMILY_SYSTEM,
    fontSize: "1rem",
    lineHeight: "1.5rem",
    fontWeight: "500",
    letterSpacing: "0.15px",
  },
  titleSmall: {
    fontFamily: FONT_FAMILY_SYSTEM,
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    fontWeight: "500",
    letterSpacing: "0.1px",
  },
  bodyLarge: {
    fontFamily: FONT_FAMILY_SYSTEM,
    fontSize: "1rem",
    lineHeight: "1.5rem",
    fontWeight: "400",
    letterSpacing: "0.5px",
  },
  bodyMedium: {
    fontFamily: FONT_FAMILY_SYSTEM,
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    fontWeight: "400",
    letterSpacing: "0.25px",
  },
  bodySmall: {
    fontFamily: FONT_FAMILY_SYSTEM,
    fontSize: "0.75rem",
    lineHeight: "1rem",
    fontWeight: "400",
    letterSpacing: "0.4px",
  },
  labelLarge: {
    fontFamily: FONT_FAMILY_SYSTEM,
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    fontWeight: "500",
    letterSpacing: "0.1px",
  },
  labelMedium: {
    fontFamily: FONT_FAMILY_SYSTEM,
    fontSize: "0.75rem",
    lineHeight: "1rem",
    fontWeight: "500",
    letterSpacing: "0.5px",
  },
  labelSmall: {
    fontFamily: FONT_FAMILY_SYSTEM,
    fontSize: "0.6875rem",
    lineHeight: "1rem",
    fontWeight: "500",
    letterSpacing: "0.5px",
  },
};

/**
 * Semantic Ramp (ADR-0009 / Batch 129)
 *
 * Dedicated domain severity and guidance ramp:
 * - blocker: critical error / fatal obstruction (Crimson seed #BA1A1A)
 * - risk: warning / hazard / caution (Golden Amber seed #C67D00)
 * - advice: recommendation / guidance / info (Ocean Blue seed #006590)
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
 * Density Tokens (HS-14 / Batch 129)
 *
 * Professional AV CAD / Engineering Tool densities:
 * - comfortable: 44px
 * - compact: 36px (DEFAULT)
 * - dense: 28px
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

/**
 * Generates an M3 color scheme from a dynamic scheme instance
 */
function extractColorScheme(scheme: DynamicScheme): M3ColorScheme {
  return {
    primary: hexFromArgb(MaterialDynamicColors.primary.getArgb(scheme)),
    onPrimary: hexFromArgb(MaterialDynamicColors.onPrimary.getArgb(scheme)),
    primaryContainer: hexFromArgb(MaterialDynamicColors.primaryContainer.getArgb(scheme)),
    onPrimaryContainer: hexFromArgb(MaterialDynamicColors.onPrimaryContainer.getArgb(scheme)),
    inversePrimary: hexFromArgb(MaterialDynamicColors.inversePrimary.getArgb(scheme)),
    primaryFixed: hexFromArgb(MaterialDynamicColors.primaryFixed.getArgb(scheme)),
    primaryFixedDim: hexFromArgb(MaterialDynamicColors.primaryFixedDim.getArgb(scheme)),
    onPrimaryFixed: hexFromArgb(MaterialDynamicColors.onPrimaryFixed.getArgb(scheme)),
    onPrimaryFixedVariant: hexFromArgb(MaterialDynamicColors.onPrimaryFixedVariant.getArgb(scheme)),

    secondary: hexFromArgb(MaterialDynamicColors.secondary.getArgb(scheme)),
    onSecondary: hexFromArgb(MaterialDynamicColors.onSecondary.getArgb(scheme)),
    secondaryContainer: hexFromArgb(MaterialDynamicColors.secondaryContainer.getArgb(scheme)),
    onSecondaryContainer: hexFromArgb(MaterialDynamicColors.onSecondaryContainer.getArgb(scheme)),
    secondaryFixed: hexFromArgb(MaterialDynamicColors.secondaryFixed.getArgb(scheme)),
    secondaryFixedDim: hexFromArgb(MaterialDynamicColors.secondaryFixedDim.getArgb(scheme)),
    onSecondaryFixed: hexFromArgb(MaterialDynamicColors.onSecondaryFixed.getArgb(scheme)),
    onSecondaryFixedVariant: hexFromArgb(MaterialDynamicColors.onSecondaryFixedVariant.getArgb(scheme)),

    tertiary: hexFromArgb(MaterialDynamicColors.tertiary.getArgb(scheme)),
    onTertiary: hexFromArgb(MaterialDynamicColors.onTertiary.getArgb(scheme)),
    tertiaryContainer: hexFromArgb(MaterialDynamicColors.tertiaryContainer.getArgb(scheme)),
    onTertiaryContainer: hexFromArgb(MaterialDynamicColors.onTertiaryContainer.getArgb(scheme)),
    tertiaryFixed: hexFromArgb(MaterialDynamicColors.tertiaryFixed.getArgb(scheme)),
    tertiaryFixedDim: hexFromArgb(MaterialDynamicColors.tertiaryFixedDim.getArgb(scheme)),
    onTertiaryFixed: hexFromArgb(MaterialDynamicColors.onTertiaryFixed.getArgb(scheme)),
    onTertiaryFixedVariant: hexFromArgb(MaterialDynamicColors.onTertiaryFixedVariant.getArgb(scheme)),

    error: hexFromArgb(MaterialDynamicColors.error.getArgb(scheme)),
    onError: hexFromArgb(MaterialDynamicColors.onError.getArgb(scheme)),
    errorContainer: hexFromArgb(MaterialDynamicColors.errorContainer.getArgb(scheme)),
    onErrorContainer: hexFromArgb(MaterialDynamicColors.onErrorContainer.getArgb(scheme)),

    background: hexFromArgb(MaterialDynamicColors.background.getArgb(scheme)),
    onBackground: hexFromArgb(MaterialDynamicColors.onBackground.getArgb(scheme)),

    surface: hexFromArgb(MaterialDynamicColors.surface.getArgb(scheme)),
    onSurface: hexFromArgb(MaterialDynamicColors.onSurface.getArgb(scheme)),
    surfaceVariant: hexFromArgb(MaterialDynamicColors.surfaceVariant.getArgb(scheme)),
    onSurfaceVariant: hexFromArgb(MaterialDynamicColors.onSurfaceVariant.getArgb(scheme)),
    surfaceDim: hexFromArgb(MaterialDynamicColors.surfaceDim.getArgb(scheme)),
    surfaceBright: hexFromArgb(MaterialDynamicColors.surfaceBright.getArgb(scheme)),
    surfaceContainerLowest: hexFromArgb(MaterialDynamicColors.surfaceContainerLowest.getArgb(scheme)),
    surfaceContainerLow: hexFromArgb(MaterialDynamicColors.surfaceContainerLow.getArgb(scheme)),
    surfaceContainer: hexFromArgb(MaterialDynamicColors.surfaceContainer.getArgb(scheme)),
    surfaceContainerHigh: hexFromArgb(MaterialDynamicColors.surfaceContainerHigh.getArgb(scheme)),
    surfaceContainerHighest: hexFromArgb(MaterialDynamicColors.surfaceContainerHighest.getArgb(scheme)),

    inverseSurface: hexFromArgb(MaterialDynamicColors.inverseSurface.getArgb(scheme)),
    inverseOnSurface: hexFromArgb(MaterialDynamicColors.inverseOnSurface.getArgb(scheme)),

    outline: hexFromArgb(MaterialDynamicColors.outline.getArgb(scheme)),
    outlineVariant: hexFromArgb(MaterialDynamicColors.outlineVariant.getArgb(scheme)),
    shadow: hexFromArgb(MaterialDynamicColors.shadow.getArgb(scheme)),
    scrim: hexFromArgb(MaterialDynamicColors.scrim.getArgb(scheme)),
    surfaceTint: hexFromArgb(MaterialDynamicColors.surfaceTint.getArgb(scheme)),
  };
}

/**
 * Generate light and dark M3 color schemes with Copper primary, Patina secondary,
 * and cool-graphite neutrals.
 */
export function generateM3ColorSchemes(
  primaryHex: string = COPPER_PRIMARY_HEX,
  secondaryHex: string = PATINA_SECONDARY_HEX
): {
  light: M3ColorScheme;
  dark: M3ColorScheme;
} {
  const primaryHct = Hct.fromInt(argbFromHex(primaryHex));
  const secondaryHct = Hct.fromInt(argbFromHex(secondaryHex));
  const tertiaryHct = Hct.fromInt(argbFromHex("#7E5260"));

  const neutralPalette = TonalPalette.fromHueAndChroma(
    COOL_GRAPHITE_NEUTRAL_HUE,
    COOL_GRAPHITE_NEUTRAL_CHROMA
  );
  const neutralVariantPalette = TonalPalette.fromHueAndChroma(
    COOL_GRAPHITE_NEUTRAL_HUE,
    COOL_GRAPHITE_VARIANT_CHROMA
  );

  const lightScheme = new DynamicScheme({
    sourceColorArgb: primaryHct.toInt(),
    variant: 2, // Variant.TONAL_SPOT
    contrastLevel: 0.0,
    isDark: false,
    primaryPalette: TonalPalette.fromHct(primaryHct),
    secondaryPalette: TonalPalette.fromHct(secondaryHct),
    tertiaryPalette: TonalPalette.fromHct(tertiaryHct),
    neutralPalette,
    neutralVariantPalette,
  });

  const darkScheme = new DynamicScheme({
    sourceColorArgb: primaryHct.toInt(),
    variant: 2, // Variant.TONAL_SPOT
    contrastLevel: 0.0,
    isDark: true,
    primaryPalette: TonalPalette.fromHct(primaryHct),
    secondaryPalette: TonalPalette.fromHct(secondaryHct),
    tertiaryPalette: TonalPalette.fromHct(tertiaryHct),
    neutralPalette,
    neutralVariantPalette,
  });

  return {
    light: extractColorScheme(lightScheme),
    dark: extractColorScheme(darkScheme),
  };
}

/**
 * Converts a camelCase token name to kebab-case CSS property name
 */
export function tokenNameToCssVar(roleName: string, prefix = "--md-sys-color-"): string {
  const kebab = roleName.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
  return `${prefix}${kebab}`;
}

/**
 * Formats a color scheme as CSS custom properties block
 */
export function schemeToCssProperties(scheme: M3ColorScheme, indent = "  "): string {
  const lines: string[] = [];
  for (const [role, value] of Object.entries(scheme)) {
    lines.push(`${indent}${tokenNameToCssVar(role)}: ${value};`);
  }
  return lines.join("\n");
}

/**
 * Formats shape tokens as CSS custom properties
 */
export function shapeToCssProperties(indent = "  "): string {
  return [
    `${indent}--md-sys-shape-corner-none: ${M3_SHAPE_TOKENS.cornerNone};`,
    `${indent}--md-sys-shape-corner-extra-small: ${M3_SHAPE_TOKENS.cornerExtraSmall};`,
    `${indent}--md-sys-shape-corner-small: ${M3_SHAPE_TOKENS.cornerSmall};`,
    `${indent}--md-sys-shape-corner-medium: ${M3_SHAPE_TOKENS.cornerMedium};`,
    `${indent}--md-sys-shape-corner-large: ${M3_SHAPE_TOKENS.cornerLarge};`,
    `${indent}--md-sys-shape-corner-extra-large: ${M3_SHAPE_TOKENS.cornerExtraLarge};`,
    `${indent}--md-sys-shape-corner-full: ${M3_SHAPE_TOKENS.cornerFull};`,
  ].join("\n");
}

/**
 * Formats elevation tokens as CSS custom properties (2 levels + level 0)
 */
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

/**
 * Formats state layer tokens as CSS custom properties
 */
export function stateToCssProperties(indent = "  "): string {
  return [
    `${indent}--md-sys-state-hover-opacity: ${M3_STATE_TOKENS.hoverOpacity};`,
    `${indent}--md-sys-state-focus-opacity: ${M3_STATE_TOKENS.focusOpacity};`,
    `${indent}--md-sys-state-pressed-opacity: ${M3_STATE_TOKENS.pressedOpacity};`,
    `${indent}--md-sys-state-dragged-opacity: ${M3_STATE_TOKENS.draggedOpacity};`,
  ].join("\n");
}

/**
 * Formats typography scale tokens as CSS custom properties
 */
export function typographyToCssProperties(indent = "  "): string {
  const lines: string[] = [];
  lines.push(`${indent}--copper-font-family-mono: ${MONOSPACE_FONT_STACK};`);
  lines.push(`${indent}--copper-font-numeric: ${TABULAR_NUMS_VALUE};`);
  lines.push(`${indent}--md-sys-typescale-mono-font-family: ${MONOSPACE_FONT_STACK};`);

  for (const [key, token] of Object.entries(M3_TYPOGRAPHY_TOKENS)) {
    const kebab = key.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
    lines.push(`${indent}--md-sys-typescale-${kebab}-font-family: ${token.fontFamily};`);
    lines.push(`${indent}--md-sys-typescale-${kebab}-font-size: ${token.fontSize};`);
    lines.push(`${indent}--md-sys-typescale-${kebab}-line-height: ${token.lineHeight};`);
    lines.push(`${indent}--md-sys-typescale-${kebab}-font-weight: ${token.fontWeight};`);
    lines.push(`${indent}--md-sys-typescale-${kebab}-letter-spacing: ${token.letterSpacing};`);
  }
  return lines.join("\n");
}

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

/**
 * Generates aliases for the legacy --copper-* properties
 */
export function copperAliasToCssProperties(indent = "  "): string {
  const tokens = [
    "error", "error-container", "on-error-container", "on-primary", "on-primary-container",
    "on-secondary-container", "on-surface", "on-surface-variant", "outline", "outline-variant",
    "primary", "primary-container", "secondary", "secondary-container", "surface",
    "surface-container", "surface-container-high", "surface-container-highest",
    "surface-container-lowest", "tertiary", "on-tertiary", "tertiary-container", "on-tertiary-container"
  ];
  const lines = tokens.map(t => `${indent}--copper-${t}: var(--md-sys-color-${t});`);
  lines.push(`${indent}--copper-text-secondary: var(--md-sys-color-on-surface-variant);`);
  return lines.join("\n");
}

/**
 * Generates the complete M3 theme CSS stylesheet with Copper expression,
 * three densities (compact default), tabular numbers, monospace stack,
 * two elevation levels, 120/200ms motion, and dark/light OS-following schemes.
 */
export function generateThemeCss(
  primaryHex: string = COPPER_PRIMARY_HEX,
  secondaryHex: string = PATINA_SECONDARY_HEX
): string {
  const schemes = generateM3ColorSchemes(primaryHex, secondaryHex);
  const semanticRamp = generateSemanticRamp();

  return `/* Material Design 3 Design Tokens — Copper Expression (ADR-0009 / Batch 129) */
/* Generated from primary seed ${primaryHex} (Copper) & secondary ${secondaryHex} (Patina) */

:root {
  /* Inform browser of supported color schemes */
  color-scheme: light dark;

  /* --- Shape Tokens --- */
${shapeToCssProperties("  ")}

  /* --- Elevation Tokens (2 levels + level 0) --- */
${elevationToCssProperties("  ")}

  /* --- State Layer Tokens --- */
${stateToCssProperties("  ")}

  /* --- Typography Scale & Font Stack Tokens --- */
${typographyToCssProperties("  ")}

  /* --- Density Tokens (HS-14: compact default, 1080p workable) --- */
${densityToCssProperties(DENSITIES.compact, "  ")}

  /* --- Motion Base Tokens (Default / Reduced-Motion: 0ms) --- */
${motionBaseToCssProperties("  ")}

  /* --- Light Theme Color Roles (Default) --- */
${schemeToCssProperties(schemes.light, "  ")}

  /* --- Light Semantic Ramp (Blocker / Risk / Advice) --- */
${semanticToCssProperties(semanticRamp.light, "  ")}

  /* --- Copper Aliases (B117) --- */
${copperAliasToCssProperties("  ")}
}

${generateDensityCssRules()}

${generateMotionCssRules()}

/* --- Dark Theme Color Roles (OS Follower — zero theme flash) --- */
@media (prefers-color-scheme: dark) {
  :root {
${schemeToCssProperties(schemes.dark, "    ")}

    /* --- Dark Semantic Ramp (Blocker / Risk / Advice) --- */
${semanticToCssProperties(semanticRamp.dark, "    ")}
  }
}
`;
}
