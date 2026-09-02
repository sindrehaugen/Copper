import fs from 'fs';
import path from 'path';

let failed = false;

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    // Ignore patterns
    if (fullPath.includes('node_modules') || 
        fullPath.includes('dist') || 
        fullPath.includes('build') ||
        fullPath.includes(path.join('app', 'src', 'locales')) ||
        fullPath.includes(path.join('app', 'tests', 'fixtures'))) {
      continue;
    }

    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (/\.(ts|tsx|js|jsx|mjs|cjs)$/.test(entry.name)) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      if (/[æøåÆØÅ]/.test(content)) {
        console.error(`[ERROR] File ${fullPath} contains Norwegian characters (æøå). All identifiers and strings must be English.`);
        failed = true;
      }
    }
  }
}

['app', 'bff', 'packages'].forEach(walk);

if (failed) {
  process.exit(1);
} else {
  console.log('[OK] English-only domain ratchet passed.');
}
