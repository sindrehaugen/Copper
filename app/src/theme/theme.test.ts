import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  BRAND_SEED_HEX,
  generateM3ColorSchemes,
  generateThemeCss,
  M3_SHAPE_TOKENS,
  M3_ELEVATION_TOKENS,
  M3_STATE_TOKENS,
  M3_TYPOGRAPHY_TOKENS,
} from './tokens';

describe('M3 Design Tokens & Theme Generator (ADR-0009)', () => {
  it('uses Copper brand seed #B87333', () => {
    expect(BRAND_SEED_HEX).toBe('#B87333');
  });

  it('generates valid light and dark color schemes from brand seed', () => {
    const schemes = generateM3ColorSchemes(BRAND_SEED_HEX);

    expect(schemes.light).toBeDefined();
    expect(schemes.dark).toBeDefined();

    // Check primary color roles exist and are hex strings
    expect(schemes.light.primary).toMatch(/^#[0-9a-f]{6}$/i);
    expect(schemes.light.onPrimary).toMatch(/^#[0-9a-f]{6}$/i);
    expect(schemes.dark.primary).toMatch(/^#[0-9a-f]{6}$/i);
    expect(schemes.dark.onPrimary).toMatch(/^#[0-9a-f]{6}$/i);

    // Light and dark schemes should have distinct tones
    expect(schemes.light.surface).not.toBe(schemes.dark.surface);
    expect(schemes.light.primary).not.toBe(schemes.dark.primary);

    // Surface roles
    expect(schemes.light.surfaceContainerLowest).toBeDefined();
    expect(schemes.light.surfaceContainer).toBeDefined();
    expect(schemes.light.surfaceContainerHighest).toBeDefined();
    expect(schemes.dark.surfaceContainerLowest).toBeDefined();
    expect(schemes.dark.surfaceContainer).toBeDefined();
    expect(schemes.dark.surfaceContainerHighest).toBeDefined();
  });

  it('defines standard M3 shape, elevation, state layer, and typography tokens', () => {
    expect(M3_SHAPE_TOKENS.cornerNone).toBe('0px');
    expect(M3_SHAPE_TOKENS.cornerFull).toBe('9999px');

    expect(M3_ELEVATION_TOKENS.level0).toBe('none');
    expect(M3_ELEVATION_TOKENS.level1).toBeDefined();
    expect(M3_ELEVATION_TOKENS.level5).toBeDefined();

    expect(M3_STATE_TOKENS.hoverOpacity).toBe('0.08');
    expect(M3_STATE_TOKENS.focusOpacity).toBe('0.12');
    expect(M3_STATE_TOKENS.pressedOpacity).toBe('0.12');
    expect(M3_STATE_TOKENS.draggedOpacity).toBe('0.16');

    expect(M3_TYPOGRAPHY_TOKENS.bodyLarge).toBeDefined();
    expect(M3_TYPOGRAPHY_TOKENS.headlineSmall).toBeDefined();
    expect(M3_TYPOGRAPHY_TOKENS.titleMedium).toBeDefined();
    expect(M3_TYPOGRAPHY_TOKENS.labelSmall).toBeDefined();
  });

  it('generates CSS containing color-scheme: light dark and @media (prefers-color-scheme: dark)', () => {
    const css = generateThemeCss(BRAND_SEED_HEX);

    expect(css).toContain('color-scheme: light dark;');
    expect(css).toContain('@media (prefers-color-scheme: dark)');
    expect(css).toContain('--md-sys-color-primary:');
    expect(css).toContain('--md-sys-color-on-primary:');
    expect(css).toContain('--md-sys-color-surface:');
    expect(css).toContain('--md-sys-color-on-surface:');
    expect(css).toContain('--md-sys-shape-corner-medium:');
    expect(css).toContain('--md-sys-elevation-level-1:');
    expect(css).toContain('--md-sys-state-hover-opacity:');
    expect(css).toContain('--md-sys-typescale-body-large-font-size:');
  });

  it('matches the committed theme.css file exactly', () => {
    const generatedCss = generateThemeCss(BRAND_SEED_HEX);
    const themeCssPath = path.resolve(__dirname, 'theme.css');

    expect(fs.existsSync(themeCssPath)).toBe(true);
    const fileContent = fs.readFileSync(themeCssPath, 'utf8');

    expect(fileContent.trim()).toBe(generatedCss.trim());
  });
});
