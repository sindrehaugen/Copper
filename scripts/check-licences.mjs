import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import console from 'node:console';
import { fileURLToPath } from 'node:url';

export const ALLOWED_LICENCES = new Set([
  'MIT',
  'ISC',
  'BSD-2-Clause',
  'BSD-3-Clause',
  'Apache-2.0',
  'CC0-1.0',
  '0BSD',
  'Unlicense',
  'Python-2.0'
]);

const CANONICAL_MAP = new Map([
  ['mit', 'MIT'],
  ['isc', 'ISC'],
  ['bsd-2-clause', 'BSD-2-Clause'],
  ['bsd-2', 'BSD-2-Clause'],
  ['bsd 2-clause', 'BSD-2-Clause'],
  ['bsd-3-clause', 'BSD-3-Clause'],
  ['bsd-3', 'BSD-3-Clause'],
  ['bsd 3-clause', 'BSD-3-Clause'],
  ['apache-2.0', 'Apache-2.0'],
  ['apache 2.0', 'Apache-2.0'],
  ['apache-2', 'Apache-2.0'],
  ['cc0-1.0', 'CC0-1.0'],
  ['cc0 1.0', 'CC0-1.0'],
  ['0bsd', '0BSD'],
  ['unlicense', 'Unlicense'],
  ['python-2.0', 'Python-2.0'],
  ['python 2.0', 'Python-2.0']
]);

export function normalizeLicenceToken(token) {
  if (!token) return '';
  const cleaned = token.replace(/[(),]/g, '').trim();
  const lower = cleaned.toLowerCase();
  return CANONICAL_MAP.get(lower) || cleaned;
}

export function parseLicenceTokens(licenceField) {
  if (!licenceField) return [];
  
  if (typeof licenceField === 'string') {
    // Split on common SPDX operators and whitespace
    const tokens = licenceField
      .replace(/[()]/g, ' ')
      .split(/\s+(?:OR|AND|\/|WITH)\s+|\s+/)
      .map(normalizeLicenceToken)
      .filter(Boolean);
    return tokens;
  }
  
  if (typeof licenceField === 'object') {
    if (Array.isArray(licenceField)) {
      return licenceField.flatMap(parseLicenceTokens);
    }
    if (licenceField.type) {
      return parseLicenceTokens(licenceField.type);
    }
  }
  
  return [];
}

export function loadExceptions(exceptionsPath) {
  if (!exceptionsPath || !fs.existsSync(exceptionsPath)) {
    return [];
  }
  try {
    const content = fs.readFileSync(exceptionsPath, 'utf8');
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    throw new Error(`Failed to load licence exceptions from ${exceptionsPath}: ${err.message}`);
  }
}

export function isLicenceAllowed(licenceTokens, pkgName, exceptions = []) {
  if (!licenceTokens || licenceTokens.length === 0) {
    return { ok: false, reason: 'missing or invalid licence field' };
  }

  // 1. Check allowlist (if ANY branch/token is allowlisted, accept)
  for (const token of licenceTokens) {
    if (ALLOWED_LICENCES.has(token)) {
      return { ok: true, matchedToken: token, via: 'allowlist' };
    }
  }

  // 2. Check exceptions last
  for (const exp of exceptions) {
    if (exp.name === pkgName) {
      const expNorm = normalizeLicenceToken(exp.licence);
      for (const token of licenceTokens) {
        if (token === expNorm || token.toLowerCase() === expNorm.toLowerCase()) {
          return { ok: true, matchedToken: token, via: 'exception', decision: exp.decision };
        }
      }
    }
  }

  return {
    ok: false,
    reason: `Licence "${licenceTokens.join(' OR ')}" not in allowlist and no valid exception found`
  };
}

export function findInstalledPackages(rootDir) {
  const packages = [];
  const visitedPaths = new Set();

  function scanNodeModulesDir(nmDir) {
    if (!fs.existsSync(nmDir)) return;
    const entries = fs.readdirSync(nmDir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue; // ignore .pnpm, .bin, etc.
      
      const entryPath = path.join(nmDir, entry.name);
      if (entry.name.startsWith('@') && entry.isDirectory()) {
        // Scoped packages
        try {
          const scopedEntries = fs.readdirSync(entryPath, { withFileTypes: true });
          for (const scoped of scopedEntries) {
            if (scoped.name.startsWith('.')) continue;
            const pkgJsonPath = path.join(entryPath, scoped.name, 'package.json');
            if (fs.existsSync(pkgJsonPath) && !visitedPaths.has(pkgJsonPath)) {
              visitedPaths.add(pkgJsonPath);
              packages.push(pkgJsonPath);
            }
          }
        } catch {
          // Ignore unreadable dirs
        }
      } else if (entry.isDirectory() || entry.isSymbolicLink()) {
        const pkgJsonPath = path.join(entryPath, 'package.json');
        if (fs.existsSync(pkgJsonPath) && !visitedPaths.has(pkgJsonPath)) {
          visitedPaths.add(pkgJsonPath);
          packages.push(pkgJsonPath);
        }
      }
    }
  }

  // Check root node_modules
  scanNodeModulesDir(path.join(rootDir, 'node_modules'));

  // Also check workspace packages' node_modules if any
  const workspaceDirs = ['app', 'bff', 'catalog', 'rig'];
  for (const ws of workspaceDirs) {
    scanNodeModulesDir(path.join(rootDir, ws, 'node_modules'));
  }

  return packages;
}

export function checkLicences(rootDir = process.cwd(), customExceptionsPath = null) {
  const exceptionsPath = customExceptionsPath || path.join(rootDir, 'scripts', 'licence-exceptions.json');
  const exceptions = loadExceptions(exceptionsPath);
  const pkgJsonPaths = findInstalledPackages(rootDir);

  const checkedPackages = new Map();
  const errors = [];

  for (const pkgJsonPath of pkgJsonPaths) {
    try {
      const raw = fs.readFileSync(pkgJsonPath, 'utf8');
      const manifest = JSON.parse(raw);

      // Skip subpath export stubs without name
      if (!manifest.name) continue;

      const key = `${manifest.name}@${manifest.version || '0.0.0'}`;
      if (checkedPackages.has(key)) continue;

      const rawLicence = manifest.license || manifest.licenses;
      const tokens = parseLicenceTokens(rawLicence);
      const result = isLicenceAllowed(tokens, manifest.name, exceptions);

      checkedPackages.set(key, {
        name: manifest.name,
        version: manifest.version,
        rawLicence,
        tokens,
        ...result
      });

      if (!result.ok) {
        errors.push({
          name: manifest.name,
          version: manifest.version,
          rawLicence: rawLicence || 'MISSING',
          tokens,
          path: pkgJsonPath,
          reason: result.reason
        });
      }
    } catch (err) {
      errors.push({
        name: 'UNKNOWN',
        path: pkgJsonPath,
        reason: `Failed to read or parse package.json: ${err.message}`
      });
    }
  }

  return {
    ok: errors.length === 0,
    checkedCount: checkedPackages.size,
    errors
  };
}

// CLI entry point
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  const rootDir = process.cwd();
  console.log(`Checking dependency licences in ${rootDir}...`);
  const result = checkLicences(rootDir);

  if (!result.ok) {
    console.error(`\n❌ LICENCE CHECK FAILED: Found ${result.errors.length} unapproved or missing licence(s):\n`);
    for (const err of result.errors) {
      console.error(`  - ${err.name}@${err.version || '?'}: licence="${err.rawLicence}" (${err.reason})`);
      console.error(`    at ${err.path}`);
    }
    process.exit(1);
  }

  console.log(`✅ Licence check passed. ${result.checkedCount} packages verified (all allowlisted or excepted).`);
  process.exit(0);
}
