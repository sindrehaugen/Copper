/* global console, process */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultTargetDir = path.resolve(__dirname, '../app/src');

/**
 * Recursively scans a directory for files matching target extensions.
 */
export function scanDir(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (file === 'node_modules' || file === 'dist' || file === '.git') continue;
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(scanDir(fullPath, extensions));
    } else if (extensions.some(ext => file.endsWith(ext))) {
      results.push(fullPath);
    }
  }
  return results;
}

/**
 * Checks a single file for prohibited setInterval usages.
 */
export function checkFileForSetInterval(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const violations = [];

  const setIntervalRegex = /\bsetInterval\s*\(/;

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    // Skip single-line comments or docblock lines
    if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
      return;
    }
    if (setIntervalRegex.test(line)) {
      violations.push({
        file: filePath.replace(/\\/g, '/'),
        line: index + 1,
        content: trimmed
      });
    }
  });

  return violations;
}

/**
 * Scans the target directory for any setInterval invocations.
 */
export function scanForSetInterval(targetDir = defaultTargetDir) {
  const files = scanDir(targetDir);
  const allViolations = [];

  for (const file of files) {
    const fileViolations = checkFileForSetInterval(file);
    allViolations.push(...fileViolations);
  }

  return {
    scannedCount: files.length,
    violations: allViolations,
    ok: allViolations.length === 0
  };
}

// CLI entry point
if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  const targetDir = process.argv[2] ? path.resolve(process.cwd(), process.argv[2]) : defaultTargetDir;
  console.log(`Scanning for prohibited setInterval usage in ${targetDir}...`);
  const result = scanForSetInterval(targetDir);

  if (!result.ok) {
    console.error(`\n❌ SETINTERVAL RATCHET FAILED: Found ${result.violations.length} prohibited setInterval call(s):\n`);
    for (const v of result.violations) {
      console.error(`  ${v.file}:${v.line}: ${v.content}`);
    }
    console.error('\nRule: No setInterval is permitted in frontend components/sources (Freshness must use SSE subscription service).');
    process.exit(1);
  } else {
    console.log(`✅ setInterval ratchet passed: 0 setInterval calls across ${result.scannedCount} files in app/src.`);
    process.exit(0);
  }
}
