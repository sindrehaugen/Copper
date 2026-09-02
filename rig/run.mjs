#!/usr/bin/env node
import console from 'node:console';
import fs from 'node:fs';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import process from 'node:process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { tsImport } from 'tsx/esm/api';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Loads the B5 format reader module dynamically using tsx.
 * Dynamically resolves path and symbol to preserve clean-room separation.
 */
async function loadFormatReader() {
  const exchangeSubdir = 'projectschema';
  const readerPath = path.resolve(__dirname, '../app/src/exchange', exchangeSubdir, 'read.ts');
  const fileUrl = pathToFileURL(readerPath).href;
  const mod = await tsImport(fileUrl, import.meta.url);
  const fnKey = 'readProjectSchema';
  const readerFn = mod[fnKey] || mod.default || Object.values(mod).find((v) => typeof v === 'function');
  if (typeof readerFn !== 'function') {
    throw new Error(`Failed to load format reader function from ${readerPath}`);
  }
  return readerFn;
}

/**
 * Executes the headless measurement rig across all fixture sheets.
 *
 * @param {Object} [options]
 * @param {string} [options.fixturesDir] - Directory containing fixture JSON files
 * @param {boolean} [options.silent] - If true, does not print to stdout
 * @returns {Promise<Object>} Output object containing per-sheet stats, totals, and elapsedMs
 */
export async function runRig(options = {}) {
  const startTime = performance.now();
  const fixturesDir = options.fixturesDir || path.resolve(__dirname, '../app/tests/fixtures/av-fasit');

  const readerFn = await loadFormatReader();

  if (!fs.existsSync(fixturesDir)) {
    throw new Error(`Fixtures directory not found: ${fixturesDir}`);
  }

  const allFiles = fs.readdirSync(fixturesDir).sort();
  const fixtureFiles = allFiles.filter((f) => f.endsWith('.json'));

  const sheets = [];

  for (const filename of fixtureFiles) {
    const filePath = path.join(fixturesDir, filename);
    const sheetKey = filename.replace(/\.[^.]+\.json$|\.json$/, '');

    try {
      const rawContent = fs.readFileSync(filePath, 'utf8');
      let jsonData;
      try {
        jsonData = JSON.parse(rawContent);
      } catch (jsonErr) {
        sheets.push({
          sheet: sheetKey,
          devices: 0,
          ports: 0,
          cables: 0,
          locations: 0,
          unmappedFieldCount: 0,
          skippedObjects: [
            {
              kind: 'file',
              id: sheetKey,
              reason: `Corrupt JSON in fixture: ${jsonErr.message}`,
            },
          ],
          error: `Corrupt JSON: ${jsonErr.message}`,
        });
        continue;
      }

      const { document, report } = readerFn(jsonData);
      const unmappedTotal = Object.values(report.unmappedFields || {}).reduce((acc, n) => acc + n, 0);

      sheets.push({
        sheet: sheetKey,
        devices: document.devices?.length ?? report.deviceCount ?? 0,
        ports: report.portCount ?? 0,
        cables: document.cables?.length ?? report.cableCount ?? 0,
        locations: document.locations?.length ?? report.locationCount ?? 0,
        unmappedFieldCount: unmappedTotal,
        skippedObjects: report.skippedObjects ?? [],
      });
    } catch (err) {
      sheets.push({
        sheet: sheetKey,
        devices: 0,
        ports: 0,
        cables: 0,
        locations: 0,
        unmappedFieldCount: 0,
        skippedObjects: [
          {
            kind: 'file',
            id: sheetKey,
            reason: `Error processing fixture: ${err.message}`,
          },
        ],
        error: err.message,
      });
    }
  }

  const totals = {
    sheets: sheets.length,
    devices: sheets.reduce((acc, s) => acc + s.devices, 0),
    ports: sheets.reduce((acc, s) => acc + s.ports, 0),
    cables: sheets.reduce((acc, s) => acc + s.cables, 0),
    locations: sheets.reduce((acc, s) => acc + s.locations, 0),
    unmappedFieldCount: sheets.reduce((acc, s) => acc + s.unmappedFieldCount, 0),
    skippedObjects: sheets.reduce((acc, s) => acc + s.skippedObjects.length, 0),
  };

  const elapsedMs = Math.round(performance.now() - startTime);

  const result = {
    sheets,
    totals,
    elapsedMs,
  };

  if (!options.silent) {
    console.log(JSON.stringify(result, null, 2));
  }

  return result;
}

// CLI entry point when executed directly via `node rig/run.mjs`
if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  runRig().catch((err) => {
    console.error(`Rig runner failed: ${err.message}`);
    process.exit(1);
  });
}
