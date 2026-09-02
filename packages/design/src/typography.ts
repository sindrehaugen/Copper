/**
 * Typography Tokens (ADR-0009 / Batch 129)
 *
 * Typography requirements:
 * - Tabular figures: font-variant-numeric: tabular-nums for aligned numbers (frequencies, voltages, channel indices, coordinates)
 * - Monospace stack: true native monospace stack for identifiers, reference designations, IP addresses, MAC addresses
 */

export const FONT_FAMILY_SYSTEM =
  'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

export const MONOSPACE_FONT_STACK =
  'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

export const TABULAR_NUMS_VALUE = "tabular-nums";

export interface M3TypographyToken {
  fontFamily: string;
  fontSize: string;
  lineHeight: string;
  fontWeight: string;
  letterSpacing: string;
}

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
