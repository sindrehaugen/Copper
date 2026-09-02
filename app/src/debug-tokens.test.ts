import { it } from 'vitest';
import { generateThemeCss, BRAND_SEED_HEX } from './theme/tokens';
import fs from 'fs';
import path from 'path';

it('debugs tokens', () => {
  const css = generateThemeCss(BRAND_SEED_HEX);
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
  const targetFiles = scanDir(path.join(__dirname));
  const usedTokens = new Set<string>();
  for (const file of targetFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const matches = content.match(/var\((--copper-[a-zA-Z0-9-]+)\)/g);
    if (matches) {
      matches.forEach(m => {
        const token = m.replace('var(', '').replace(')', '');
        usedTokens.add(token);
      });
    }
  }
  usedTokens.forEach(token => {
    if (!css.includes(token + ':')) {
      console.log('MISSING EXACT TOKEN:', token);
    }
  });
});