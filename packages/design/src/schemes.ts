import {
  argbFromHex,
  hexFromArgb,
  Hct,
  DynamicScheme,
  TonalPalette,
  MaterialDynamicColors,
} from "@material/material-color-utilities";
import {
  COPPER_PRIMARY_HEX,
  PATINA_SECONDARY_HEX,
  COOL_GRAPHITE_NEUTRAL_HUE,
  COOL_GRAPHITE_NEUTRAL_CHROMA,
  COOL_GRAPHITE_VARIANT_CHROMA,
} from "./colors";

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

export const M3_SHAPE_TOKENS = {
  cornerNone: "0px",
  cornerExtraSmall: "4px",
  cornerSmall: "8px",
  cornerMedium: "12px",
  cornerLarge: "16px",
  cornerExtraLarge: "28px",
  cornerFull: "9999px",
} as const;

export const M3_STATE_TOKENS = {
  hoverOpacity: "0.08",
  focusOpacity: "0.12",
  pressedOpacity: "0.12",
  draggedOpacity: "0.16",
} as const;

/**
 * Generates an M3 color scheme from a dynamic scheme instance
 */
export function extractColorScheme(scheme: DynamicScheme): M3ColorScheme {
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
  lines.push(`${indent}--copper-accent-primary: var(--md-sys-color-primary);`);
  lines.push(`${indent}--copper-accent-secondary: var(--md-sys-color-secondary);`);
  lines.push(`${indent}--copper-elevation-2: var(--md-sys-elevation-level2, 0 2px 6px 2px rgba(0,0,0,0.15));`);
  return lines.join("\n");
}

