import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import process from 'node:process';
import console from 'node:console';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// Marker strings constructed via concatenation to prevent self-matching in git ls-files scan
export const FORBIDDEN_ALGO_MARKERS = [
  'bane' + 'sok',
  'rute' + 'kvalitet',
  'connector' + 'Accepts',
  'stygghets' + 'tall'
];

export const FORMAT_MARKERS = [
  'Easy' + 'Schematic',
  'easy' + 'schematic'
];

export const CODE_TREE_PREFIXES = [
  'app/',
  'bff/',
  'catalog/',
  'rig/',
  'scripts/'
];

export const EXEMPT_FORMAT_PREFIXES = [
  'app/src/exchange/' + 'easy' + 'schematic/',
  'app/tests/fixtures/',
  'app/src/projection/e2e.test.ts',
  'rig/'
];

const CDN_PATTERN = /<(?:script|link)[^>]+(?:src|href)\s*=\s*["'](?:\/\/(?!\/)|https?:\/\/)/i;

export async function scanFileForForbidden(filePath, relativePath) {
  const violations = [];
  const normPath = relativePath.replace(/\\/g, '/');

  const isFormatExempt = EXEMPT_FORMAT_PREFIXES.some(prefix => normPath.startsWith(prefix));
  const isAppOrBff = normPath.startsWith('app/') || normPath.startsWith('bff/');

  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let lineNumber = 0;
  for await (const line of rl) {
    lineNumber++;

    // 1. Check algorithm / domain markers (never exempt in code trees)
    for (const marker of FORBIDDEN_ALGO_MARKERS) {
      if (line.includes(marker)) {
        violations.push({
          file: normPath,
          line: lineNumber,
          marker,
          content: line.trim(),
          type: 'forbidden-algorithm-marker'
        });
      }
    }

    // 2. Check format markers (exempt only in specific format-name paths)
    if (!isFormatExempt) {
      for (const marker of FORMAT_MARKERS) {
        if (line.includes(marker)) {
          violations.push({
            file: normPath,
            line: lineNumber,
            marker,
            content: line.trim(),
            type: 'forbidden-format-marker'
          });
        }
      }
    }

    // 3. Check external CDN links in app/ and bff/ (ADR-0008 §1)
    if (isAppOrBff) {
      if (CDN_PATTERN.test(line)) {
        violations.push({
          file: normPath,
          line: lineNumber,
          marker: 'external-cdn',
          content: line.trim(),
          type: 'external-cdn-reference'
        });
      }
    }
  }

  return violations;
}

export async function scanForbiddenSources(rootDir = process.cwd(), customFiles = null) {
  let filesToScan = [];
  if (customFiles) {
    filesToScan = customFiles;
  } else {
    try {
      const output = execSync('git ls-files', { cwd: rootDir, encoding: 'utf8' });
      const allFiles = output.split(/\r?\n/).map(f => f.trim()).filter(Boolean);
      filesToScan = allFiles
        .map(f => f.replace(/\\/g, '/'))
        .filter(f => CODE_TREE_PREFIXES.some(prefix => f.startsWith(prefix)));
    } catch (err) {
      throw new Error(`Failed to run git ls-files: ${err.message}`);
    }
  }

  const allViolations = [];
  for (const relPath of filesToScan) {
    const absPath = path.isAbsolute(relPath) ? relPath : path.join(rootDir, relPath);
    if (!fs.existsSync(absPath)) continue;
    const stat = fs.statSync(absPath);
    if (!stat.isFile()) continue;

    const fileViolations = await scanFileForForbidden(absPath, relPath);
    allViolations.push(...fileViolations);
  }

  return {
    ok: allViolations.length === 0,
    scannedCount: filesToScan.length,
    violations: allViolations
  };
}

// CLI entry point
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  const rootDir = process.cwd();
  console.log(`Scanning code trees for forbidden sources and CDN references in ${rootDir}...`);
  scanForbiddenSources(rootDir)
    .then(result => {
      if (!result.ok) {
        console.error(`\n❌ FORBIDDEN SOURCES SCAN FAILED: Found ${result.violations.length} violation(s):\n`);
        for (const v of result.violations) {
          console.error(`  ${v.file}:${v.line}: [${v.type}] marker "${v.marker}" found:`);
          console.error(`    ${v.content}`);
        }
        process.exit(1);
      }
      console.log(`✅ Forbidden sources scan passed. ${result.scannedCount} files verified across code trees.`);
      process.exit(0);
    })
    .catch(err => {
      console.error(`Error during forbidden sources scan: ${err.message}`);
      process.exit(1);
    });
}
