export * from "./layout";
/**
 * @copper/design — Copper Design System & M3 Expression Tokens (ADR-0009 / Batch 129)
 */

export * from "./colors";
export * from "./semantic";
export * from "./densities";
export * from "./typography";
export * from "./elevation";
export * from "./motion";
export * from "./schemes";
export * from "./entity";

import { COPPER_PRIMARY_HEX, PATINA_SECONDARY_HEX } from "./colors";
import {
  generateM3ColorSchemes,
  shapeToCssProperties,
  stateToCssProperties,
  schemeToCssProperties,
  copperAliasToCssProperties,
} from "./schemes";
import {
  generateSemanticRamp,
  semanticToCssProperties,
} from "./semantic";
import {
  DENSITIES,
  densityToCssProperties,
  generateDensityCssRules,
} from "./densities";
import { typographyToCssProperties } from "./typography";
import { elevationToCssProperties } from "./elevation";
import {
  motionBaseToCssProperties,
  generateMotionCssRules,
} from "./motion";

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
