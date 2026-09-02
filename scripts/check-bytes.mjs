import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const badBytes = {
  0x00: 'NUL',
  0x07: 'BEL',
  0x08: 'BS',
  0x0b: 'VT',
  0x0c: 'FF',
  0x1b: 'ESC'
};

let trackedFiles = [];
try {
  trackedFiles = execSync('git ls-files "*.md" "orchestration/prompts/*.md"', { cwd: rootDir })
    .toString()
    .split('\n')
    .filter(Boolean);
} catch (e) {
  console.error("Failed to list git files", e);
  process.exit(1);
}

let found = false;

for (const relPath of trackedFiles) {
  const f = path.join(rootDir, relPath);
  if (!fs.existsSync(f)) continue;
  
  const buf = fs.readFileSync(f);
  for (let i = 0; i < buf.length; i++) {
    const b = buf[i];
    if (badBytes[b]) {
      found = true;
      const ctxStart = Math.max(0, i - 15);
      const ctxEnd = Math.min(buf.length, i + 30);
      const ctx = buf.slice(ctxStart, ctxEnd).toString('utf8').replace(/\n/g, '\\n');
      console.error(relPath + ': ' + badBytes[b] + ' at offset ' + i + ' -> ...' + ctx + '...');
    }
  }
}

if (found) {
  console.error("\nControl byte corruption found in tracked documents.");
  process.exit(1);
} else {
  console.log("No control byte corruption found in tracked markdown documents.");
}
