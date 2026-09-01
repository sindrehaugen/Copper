import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appRoot = path.join(__dirname, '../app');

// We exclude app/src/theme and tests/fixtures
const excludePaths = [
  path.join(appRoot, 'src/theme'),
  path.join(appRoot, 'tests/fixtures'),
  path.join(appRoot, 'node_modules'),
  path.join(appRoot, 'dist')
];

function shouldExclude(p) {
  return excludePaths.some(ex => p.startsWith(ex));
}

function scanDir(dir) {
  let results = [];
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (shouldExclude(fullPath)) continue;
    
    if (fs.statSync(fullPath).isDirectory()) {
      results = results.concat(scanDir(fullPath));
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.css')) {
      results.push(fullPath);
    }
  }
  return results;
}

const targetFiles = scanDir(appRoot);
const hexRegex = /#[0-9a-fA-F]{3,8}\b/g;
const rgbaRegex = /rgba?\([^)]+\)/g;

let violations = 0;

for (const file of targetFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  
  lines.forEach((line, i) => {
    if (line.includes('eslint-disable') || line.includes('// ignore-hex')) return;
    
    // We allow UUIDs or other non-color hex strings if they match other contexts, but for now strict checking
    // Wait, # can be used in URLs or private class fields, so we need to be careful.
    // Let's refine the regex for colors: usually in quotes or CSS values.
    const hexMatches = line.match(/(['":])(#[0-9a-fA-F]{3,8})\b/i);
    const rgbaMatches = line.match(/rgba?\([\d\s,.]+\)/i);
    
    if (hexMatches || rgbaMatches) {
      console.error(`${file}:${i+1} Literal color found: ${line.trim()}`);
      violations++;
    }
  });
}

if (violations > 0) {
  console.error(`\nFound ${violations} hardcoded color literals outside theme directories.`);
  process.exit(1);
} else {
  console.log('No hardcoded color literals found. Tokens are strictly enforced.');
}
