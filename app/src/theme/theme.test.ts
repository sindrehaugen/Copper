import fs from "node:fs";
import path from "node:path";
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  BRAND_SEED_HEX,
  COPPER_PRIMARY_HEX,
  PATINA_SECONDARY_HEX,
  generateM3ColorSchemes,
  generateSemanticRamp,
  generateThemeCss,
  DENSITIES,
  DEFAULT_DENSITY,
  M3_SHAPE_TOKENS,
  M3_ELEVATION_TOKENS,
  M3_STATE_TOKENS,
  M3_TYPOGRAPHY_TOKENS,
  MONOSPACE_FONT_STACK,
  TABULAR_NUMS_VALUE,
  MOTION_DURATIONS,
  MOTION_EASINGS,
} from "./tokens";

describe("M3 Design Tokens & Copper Theme Generator (ADR-0009 / Batch 129)", () => {
  it("uses Copper primary seed #B87333 and Patina secondary #3A6E6A", () => {
    expect(COPPER_PRIMARY_HEX).toBe("#B87333");
    expect(PATINA_SECONDARY_HEX).toBe("#3A6E6A");
    expect(BRAND_SEED_HEX).toBe("#B87333");
  });

  it("generates valid light and dark color schemes from brand seed with cool-graphite neutrals", () => {
    const schemes = generateM3ColorSchemes(BRAND_SEED_HEX, PATINA_SECONDARY_HEX);

    expect(schemes.light).toBeDefined();
    expect(schemes.dark).toBeDefined();

    // Check primary color roles exist and are hex strings
    expect(schemes.light.primary).toMatch(/^#[0-9a-f]{6}$/i);
    expect(schemes.light.onPrimary).toMatch(/^#[0-9a-f]{6}$/i);
    expect(schemes.dark.primary).toMatch(/^#[0-9a-f]{6}$/i);
    expect(schemes.dark.onPrimary).toMatch(/^#[0-9a-f]{6}$/i);

    // Check secondary (patina) color roles exist and are hex strings
    expect(schemes.light.secondary).toMatch(/^#[0-9a-f]{6}$/i);
    expect(schemes.light.onSecondary).toMatch(/^#[0-9a-f]{6}$/i);
    expect(schemes.dark.secondary).toMatch(/^#[0-9a-f]{6}$/i);
    expect(schemes.dark.onSecondary).toMatch(/^#[0-9a-f]{6}$/i);

    // Light and dark schemes should have distinct tones
    expect(schemes.light.surface).not.toBe(schemes.dark.surface);
    expect(schemes.light.primary).not.toBe(schemes.dark.primary);
    expect(schemes.light.secondary).not.toBe(schemes.dark.secondary);

    // Surface roles
    expect(schemes.light.surfaceContainerLowest).toBeDefined();
    expect(schemes.light.surfaceContainer).toBeDefined();
    expect(schemes.light.surfaceContainerHighest).toBeDefined();
    expect(schemes.dark.surfaceContainerLowest).toBeDefined();
    expect(schemes.dark.surfaceContainer).toBeDefined();
    expect(schemes.dark.surfaceContainerHighest).toBeDefined();
  });

  it("asserts that the semantic ramp shares no value with the accent pair", () => {
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

  it("defines three densities (comfortable, compact, dense) with compact (36px) as default", () => {
    expect(DEFAULT_DENSITY).toBe("compact");
    expect(DENSITIES.comfortable.rowHeight).toBe("44px");
    expect(DENSITIES.compact.rowHeight).toBe("36px");
    expect(DENSITIES.dense.rowHeight).toBe("28px");
  });

  it("applies font settings with tabular figures and a true monospace stack", () => {
    expect(TABULAR_NUMS_VALUE).toBe("tabular-nums");
    expect(MONOSPACE_FONT_STACK).toContain("ui-monospace");
    expect(MONOSPACE_FONT_STACK).toContain("SFMono-Regular");
    expect(MONOSPACE_FONT_STACK).toContain("monospace");
  });

  it("defines two functional elevation levels (level1, level2) plus level0", () => {
    expect(M3_ELEVATION_TOKENS.level0).toBe("none");
    expect(M3_ELEVATION_TOKENS.level1).toBeDefined();
    expect(M3_ELEVATION_TOKENS.level2).toBeDefined();
  });

  it("implements functional motion (120ms / 200ms) with prefers-reduced-motion support", () => {
    expect(MOTION_DURATIONS.short).toBe("120ms");
    expect(MOTION_DURATIONS.medium).toBe("200ms");
    expect(MOTION_EASINGS.standard).toBe("cubic-bezier(0.2, 0, 0, 1)");

    const css = generateThemeCss();
    expect(css).toContain("prefers-reduced-motion: no-preference");
    expect(css).toContain("--copper-motion-duration-short: 120ms;");
    expect(css).toContain("--copper-motion-duration-medium: 200ms;");
  });

  it("defines standard M3 shape, state layer, and typography tokens", () => {
    expect(M3_SHAPE_TOKENS.cornerNone).toBe("0px");
    expect(M3_SHAPE_TOKENS.cornerFull).toBe("9999px");

    expect(M3_STATE_TOKENS.hoverOpacity).toBe("0.08");
    expect(M3_STATE_TOKENS.focusOpacity).toBe("0.12");
    expect(M3_STATE_TOKENS.pressedOpacity).toBe("0.12");
    expect(M3_STATE_TOKENS.draggedOpacity).toBe("0.16");

    expect(M3_TYPOGRAPHY_TOKENS.bodyLarge).toBeDefined();
    expect(M3_TYPOGRAPHY_TOKENS.headlineSmall).toBeDefined();
    expect(M3_TYPOGRAPHY_TOKENS.titleMedium).toBeDefined();
    expect(M3_TYPOGRAPHY_TOKENS.labelSmall).toBeDefined();
  });

  it("generates CSS byte-exactly matching the committed theme.css", () => {
    const css = generateThemeCss(BRAND_SEED_HEX, PATINA_SECONDARY_HEX);
    const existingCss = readFileSync(join(__dirname, "theme.css"), "utf8");
    expect(css).toBe(existingCss);
  });

  it("defines all --copper-* tokens used in app/src", () => {
    const css = generateThemeCss(BRAND_SEED_HEX, PATINA_SECONDARY_HEX);

    // Find all --copper-* usages in app/src
    function scanDir(dir: string): string[] {
      let results: string[] = [];
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fullPath.includes("node_modules") || fullPath.includes("dist")) continue;
        if (fs.statSync(fullPath).isDirectory()) {
          results = results.concat(scanDir(fullPath));
        } else if (fullPath.endsWith(".tsx") || fullPath.endsWith(".ts") || fullPath.endsWith(".css")) {
          results.push(fullPath);
        }
      }
      return results;
    }

    const targetFiles = scanDir(path.join(__dirname, ".."));
    const usedTokens = new Set<string>();

    for (const file of targetFiles) {
      const content = fs.readFileSync(file, "utf8");
      const matches = content.match(/var\((--copper-[a-zA-Z0-9-]+)\)/g);
      if (matches) {
        matches.forEach((m: string) => {
          const token = m.replace("var(", "").replace(")", "");
          usedTokens.add(token);
        });
      }
    }

    usedTokens.forEach((token) => {
      expect(css).toContain(`${token}:`);
    });
  });
});

