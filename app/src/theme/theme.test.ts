import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
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
  it('uses Copper brand seed #6750A4', () => {
    expect(BRAND_SEED_HEX).toBe('#6750A4');
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

  it('generates CSS byte-exactly matching the committed theme.css', () => {
    const css = generateThemeCss(BRAND_SEED_HEX);
    const existingCss = readFileSync(join(__dirname, 'theme.css'), 'utf8');
    expect(css).toBe(existingCss);
  });

  it('defines all --copper-* tokens used in app/src', () => {
    const css = generateThemeCss(BRAND_SEED_HEX);
    
    
    
    // Find all --copper-* usages in app/src
    function scanDir(dir: string): string[] {
      let results: string[] = [];
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fullPath.includes('node_modules') || fullPath.includes('dist')) continue;
        if (fs.statSync(fullPath).isDirectory()) {
          results = results.concat(scanDir(fullPath));
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.css')) {
          results.push(fullPath);
        }
      }
      return results;
    }
    
    const targetFiles = scanDir(path.join(__dirname, '..'));
    const usedTokens = new Set<string>();
    
    for (const file of targetFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const matches = content.match(/var\((--copper-[a-zA-Z0-9-]+)\)/g);
      if (matches) {
        matches.forEach((m: string) => {
          const token = m.replace('var(', '').replace(')', '');
          usedTokens.add(token);
        });
      }
    }
    
    usedTokens.forEach(token => {
      expect(css).toContain(`${token}:`);
    });
  });
});
