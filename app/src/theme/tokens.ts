import {
  argbFromHex,
  hexFromArgb,
  Hct,
  SchemeTonalSpot,
  MaterialDynamicColors,
} from '@material/material-color-utilities';

/**
 * Copper brand seed color (ADR-0009)
 */
export const BRAND_SEED_HEX = '#6750A4';

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

export const M3_SHAPE_TOKENS = {
  cornerNone: '0px',
  cornerExtraSmall: '4px',
  cornerSmall: '8px',
  cornerMedium: '12px',
  cornerLarge: '16px',
  cornerExtraLarge: '28px',
  cornerFull: '9999px',
} as const;

export const M3_ELEVATION_TOKENS = {
  level0: 'none',
  level1: '0px 1px 3px 1px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.30)',
  level2: '0px 2px 6px 2px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.30)',
  level3: '0px 4px 8px 3px rgba(0, 0, 0, 0.15), 0px 1px 3px 0px rgba(0, 0, 0, 0.30)',
  level4: '0px 6px 10px 4px rgba(0, 0, 0, 0.15), 0px 2px 3px 0px rgba(0, 0, 0, 0.30)',
  level5: '0px 8px 12px 6px rgba(0, 0, 0, 0.15), 0px 4px 4px 0px rgba(0, 0, 0, 0.30)',
} as const;

export const M3_STATE_TOKENS = {
  hoverOpacity: '0.08',
  focusOpacity: '0.12',
  pressedOpacity: '0.12',
  draggedOpacity: '0.16',
} as const;

export const M3_TYPOGRAPHY_TOKENS: Record<string, M3TypographyToken> = {
  displayLarge: {
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '3.5625rem', // 57px
    lineHeight: '4rem', // 64px
    fontWeight: '400',
    letterSpacing: '-0.25px',
  },
  displayMedium: {
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '2.8125rem', // 45px
    lineHeight: '3.25rem', // 52px
    fontWeight: '400',
    letterSpacing: '0px',
  },
  displaySmall: {
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '2.25rem', // 36px
    lineHeight: '2.75rem', // 44px
    fontWeight: '400',
    letterSpacing: '0px',
  },
  headlineLarge: {
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '2rem', // 32px
    lineHeight: '2.5rem', // 40px
    fontWeight: '400',
    letterSpacing: '0px',
  },
  headlineMedium: {
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '1.75rem', // 28px
    lineHeight: '2.25rem', // 36px
    fontWeight: '400',
    letterSpacing: '0px',
  },
  headlineSmall: {
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '1.5rem', // 24px
    lineHeight: '2rem', // 32px
    fontWeight: '400',
    letterSpacing: '0px',
  },
  titleLarge: {
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '1.375rem', // 22px
    lineHeight: '1.75rem', // 28px
    fontWeight: '400',
    letterSpacing: '0px',
  },
  titleMedium: {
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '1rem', // 16px
    lineHeight: '1.5rem', // 24px
    fontWeight: '500',
    letterSpacing: '0.15px',
  },
  titleSmall: {
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '0.875rem', // 14px
    lineHeight: '1.25rem', // 20px
    fontWeight: '500',
    letterSpacing: '0.1px',
  },
  bodyLarge: {
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '1rem', // 16px
    lineHeight: '1.5rem', // 24px
    fontWeight: '400',
    letterSpacing: '0.5px',
  },
  bodyMedium: {
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '0.875rem', // 14px
    lineHeight: '1.25rem', // 20px
    fontWeight: '400',
    letterSpacing: '0.25px',
  },
  bodySmall: {
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '0.75rem', // 12px
    lineHeight: '1rem', // 16px
    fontWeight: '400',
    letterSpacing: '0.4px',
  },
  labelLarge: {
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '0.875rem', // 14px
    lineHeight: '1.25rem', // 20px
    fontWeight: '500',
    letterSpacing: '0.1px',
  },
  labelMedium: {
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '0.75rem', // 12px
    lineHeight: '1rem', // 16px
    fontWeight: '500',
    letterSpacing: '0.5px',
  },
  labelSmall: {
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '0.6875rem', // 11px
    lineHeight: '1rem', // 16px
    fontWeight: '500',
    letterSpacing: '0.5px',
  },
};

/**
 * Generates an M3 color scheme from a dynamic scheme instance
 */
function extractColorScheme(scheme: SchemeTonalSpot): M3ColorScheme {
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
 * Generate light and dark M3 color schemes from a hex seed color
 */
export function generateM3ColorSchemes(seedHex: string = BRAND_SEED_HEX): {
  light: M3ColorScheme;
  dark: M3ColorScheme;
} {
  const argb = argbFromHex(seedHex);
  const hct = Hct.fromInt(argb);

  const lightDynamicScheme = new SchemeTonalSpot(hct, false, 0.0);
  const darkDynamicScheme = new SchemeTonalSpot(hct, true, 0.0);

  return {
    light: extractColorScheme(lightDynamicScheme),
    dark: extractColorScheme(darkDynamicScheme),
  };
}

/**
 * Converts a camelCase token name to kebab-case CSS property name
 */
export function tokenNameToCssVar(roleName: string, prefix = '--md-sys-color-'): string {
  const kebab = roleName.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  return `${prefix}${kebab}`;
}

/**
 * Formats a color scheme as CSS custom properties block
 */
export function schemeToCssProperties(scheme: M3ColorScheme, indent = '  '): string {
  const lines: string[] = [];
  for (const [role, value] of Object.entries(scheme)) {
    lines.push(`${indent}${tokenNameToCssVar(role)}: ${value};`);
  }
  return lines.join('\n');
}

/**
 * Formats shape tokens as CSS custom properties
 */
export function shapeToCssProperties(indent = '  '): string {
  return [
    `${indent}--md-sys-shape-corner-none: ${M3_SHAPE_TOKENS.cornerNone};`,
    `${indent}--md-sys-shape-corner-extra-small: ${M3_SHAPE_TOKENS.cornerExtraSmall};`,
    `${indent}--md-sys-shape-corner-small: ${M3_SHAPE_TOKENS.cornerSmall};`,
    `${indent}--md-sys-shape-corner-medium: ${M3_SHAPE_TOKENS.cornerMedium};`,
    `${indent}--md-sys-shape-corner-large: ${M3_SHAPE_TOKENS.cornerLarge};`,
    `${indent}--md-sys-shape-corner-extra-large: ${M3_SHAPE_TOKENS.cornerExtraLarge};`,
    `${indent}--md-sys-shape-corner-full: ${M3_SHAPE_TOKENS.cornerFull};`,
  ].join('\n');
}

/**
 * Formats elevation tokens as CSS custom properties
 */
export function elevationToCssProperties(indent = '  '): string {
  return [
    `${indent}--md-sys-elevation-level-0: ${M3_ELEVATION_TOKENS.level0};`,
    `${indent}--md-sys-elevation-level-1: ${M3_ELEVATION_TOKENS.level1};`,
    `${indent}--md-sys-elevation-level-2: ${M3_ELEVATION_TOKENS.level2};`,
    `${indent}--md-sys-elevation-level-3: ${M3_ELEVATION_TOKENS.level3};`,
    `${indent}--md-sys-elevation-level-4: ${M3_ELEVATION_TOKENS.level4};`,
    `${indent}--md-sys-elevation-level-5: ${M3_ELEVATION_TOKENS.level5};`,
  ].join('\n');
}

/**
 * Formats state layer tokens as CSS custom properties
 */
export function stateToCssProperties(indent = '  '): string {
  return [
    `${indent}--md-sys-state-hover-opacity: ${M3_STATE_TOKENS.hoverOpacity};`,
    `${indent}--md-sys-state-focus-opacity: ${M3_STATE_TOKENS.focusOpacity};`,
    `${indent}--md-sys-state-pressed-opacity: ${M3_STATE_TOKENS.pressedOpacity};`,
    `${indent}--md-sys-state-dragged-opacity: ${M3_STATE_TOKENS.draggedOpacity};`,
  ].join('\n');
}

/**
 * Formats typography scale tokens as CSS custom properties
 */
export function typographyToCssProperties(indent = '  '): string {
  const lines: string[] = [];
  for (const [key, token] of Object.entries(M3_TYPOGRAPHY_TOKENS)) {
    const kebab = key.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
    lines.push(`${indent}--md-sys-typescale-${kebab}-font-family: ${token.fontFamily};`);
    lines.push(`${indent}--md-sys-typescale-${kebab}-font-size: ${token.fontSize};`);
    lines.push(`${indent}--md-sys-typescale-${kebab}-line-height: ${token.lineHeight};`);
    lines.push(`${indent}--md-sys-typescale-${kebab}-font-weight: ${token.fontWeight};`);
    lines.push(`${indent}--md-sys-typescale-${kebab}-letter-spacing: ${token.letterSpacing};`);
  }
  return lines.join('\n');
}

/**
 * Generates aliases for the legacy --copper-* properties
 */
export function copperAliasToCssProperties(indent = '  '): string {
  const tokens = [
    'error', 'error-container', 'on-error-container', 'on-primary', 'on-primary-container',
    'on-secondary-container', 'on-surface', 'on-surface-variant', 'outline', 'outline-variant',
    'primary', 'primary-container', 'secondary', 'secondary-container', 'surface',
    'surface-container', 'surface-container-high', 'surface-container-highest',
    'surface-container-lowest', 'tertiary', 'on-tertiary', 'tertiary-container', 'on-tertiary-container'
  ];
  const lines = tokens.map(t => `${indent}--copper-${t}: var(--md-sys-color-${t});`);
  lines.push(`${indent}--copper-text-secondary: var(--md-sys-color-on-surface-variant);`);
  return lines.join('\n');
}

/**
 * Generates the complete M3 theme CSS stylesheet with OS-following dark/light mode
 */
export function generateThemeCss(seedHex: string = BRAND_SEED_HEX): string {
  const schemes = generateM3ColorSchemes(seedHex);

  return `/* Material Design 3 Design Tokens (ADR-0009) */
/* Generated from seed color ${seedHex} */

:root {
  /* Inform browser of supported color schemes */
  color-scheme: light dark;

  /* --- Shape Tokens --- */
${shapeToCssProperties('  ')}

  /* --- Elevation Tokens --- */
${elevationToCssProperties('  ')}

  /* --- State Layer Tokens --- */
${stateToCssProperties('  ')}

  /* --- Typography Scale Tokens --- */
${typographyToCssProperties('  ')}

  /* --- Light Theme Color Roles (Default) --- */
${schemeToCssProperties(schemes.light, '  ')}

  /* --- Copper Aliases (B117) --- */
${copperAliasToCssProperties('  ')}
}

/* --- Dark Theme Color Roles (OS Follower — zero theme flash) --- */
@media (prefers-color-scheme: dark) {
  :root {
${schemeToCssProperties(schemes.dark, '    ')}
  }
}
`;
}
