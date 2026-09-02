import { describe, it, expect } from "vitest";
import {
  COPPER_PRIMARY_HEX,
  PATINA_SECONDARY_HEX,
  BRAND_SEED_HEX,
  generateM3ColorSchemes,
  generateSemanticRamp,
  DENSITIES,
  DEFAULT_DENSITY,
  M3_ELEVATION_TOKENS,
  M3_TYPOGRAPHY_TOKENS,
  MONOSPACE_FONT_STACK,
  TABULAR_NUMS_VALUE,
  MOTION_DURATIONS,
  MOTION_EASINGS,
  generateThemeCss,
} from "./index";

describe("@copper/design — Copper Expression & M3 Design Tokens (Batch 129)", () => {
  it("defines the Copper/Patina accent pair", () => {
    expect(COPPER_PRIMARY_HEX).toBe("#B87333");
    expect(PATINA_SECONDARY_HEX).toBe("#3A6E6A");
    expect(BRAND_SEED_HEX).toBe("#B87333");
  });

  it("generates M3 schemes with cool-graphite neutrals and distinct light/dark tones", () => {
    const schemes = generateM3ColorSchemes(COPPER_PRIMARY_HEX, PATINA_SECONDARY_HEX);

    expect(schemes.light.primary).toBeDefined();
    expect(schemes.dark.primary).toBeDefined();
    expect(schemes.light.secondary).toBeDefined();
    expect(schemes.dark.secondary).toBeDefined();

    expect(schemes.light.surface).not.toBe(schemes.dark.surface);
    expect(schemes.light.primary).not.toBe(schemes.dark.primary);
    expect(schemes.light.secondary).not.toBe(schemes.dark.secondary);
  });

  it("asserts that the semantic ramp shares no color values with the accent pair", () => {
    const schemes = generateM3ColorSchemes(COPPER_PRIMARY_HEX, PATINA_SECONDARY_HEX);
    const semantic = generateSemanticRamp();

    const accentValues = new Set([
      COPPER_PRIMARY_HEX.toLowerCase(),
      PATINA_SECONDARY_HEX.toLowerCase(),
      schemes.light.primary.toLowerCase(),
      schemes.light.primaryContainer.toLowerCase(),
      schemes.light.secondary.toLowerCase(),
      schemes.light.secondaryContainer.toLowerCase(),
      schemes.dark.primary.toLowerCase(),
      schemes.dark.primaryContainer.toLowerCase(),
      schemes.dark.secondary.toLowerCase(),
      schemes.dark.secondaryContainer.toLowerCase(),
    ]);

    const semanticValues = [
      semantic.light.blocker.color,
      semantic.light.blocker.container,
      semantic.light.risk.color,
      semantic.light.risk.container,
      semantic.light.advice.color,
      semantic.light.advice.container,
      semantic.dark.blocker.color,
      semantic.dark.blocker.container,
      semantic.dark.risk.color,
      semantic.dark.risk.container,
      semantic.dark.advice.color,
      semantic.dark.advice.container,
    ].map((c) => c.toLowerCase());

    for (const val of semanticValues) {
      expect(accentValues.has(val)).toBe(false);
    }
  });

  it("provides 3 densities with compact (36px) as the default", () => {
    expect(DEFAULT_DENSITY).toBe("compact");
    expect(DENSITIES.comfortable.rowHeight).toBe("44px");
    expect(DENSITIES.compact.rowHeight).toBe("36px");
    expect(DENSITIES.dense.rowHeight).toBe("28px");
  });

  it("specifies tabular figures and a true monospace stack for identifiers", () => {
    expect(TABULAR_NUMS_VALUE).toBe("tabular-nums");
    expect(MONOSPACE_FONT_STACK).toContain("ui-monospace");
    expect(MONOSPACE_FONT_STACK).toContain("monospace");
    expect(M3_TYPOGRAPHY_TOKENS.bodyLarge).toBeDefined();
  });

  it("defines 2 elevation levels (level1 & level2) plus level0", () => {
    expect(M3_ELEVATION_TOKENS.level0).toBe("none");
    expect(M3_ELEVATION_TOKENS.level1).toBeDefined();
    expect(M3_ELEVATION_TOKENS.level2).toBeDefined();
  });

  it("defines functional motion tokens with 120ms and 200ms durations", () => {
    expect(MOTION_DURATIONS.short).toBe("120ms");
    expect(MOTION_DURATIONS.medium).toBe("200ms");
    expect(MOTION_EASINGS.standard).toBe("cubic-bezier(0.2, 0, 0, 1)");
  });

  it("generates CSS containing densities, motion, and semantic ramps", () => {
    const css = generateThemeCss();

    expect(css).toContain("--copper-density-row-height: 36px;");
    expect(css).toContain('[data-density="comfortable"]');
    expect(css).toContain('[data-density="dense"]');
    expect(css).toContain("--copper-semantic-blocker:");
    expect(css).toContain("--copper-semantic-risk:");
    expect(css).toContain("--copper-semantic-advice:");
    expect(css).toContain("prefers-reduced-motion: no-preference");
    expect(css).toContain("prefers-color-scheme: dark");
  });
});
