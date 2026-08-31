import { execSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { runRig } from './run.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// Pinned Zod Schema for Rig Output Contract
// ============================================================================

export const SkippedObjectSchema = z.object({
  kind: z.string(),
  id: z.string(),
  reason: z.string(),
});

export const SheetResultSchema = z.object({
  sheet: z.string(),
  devices: z.number().int().nonnegative(),
  ports: z.number().int().nonnegative(),
  cables: z.number().int().nonnegative(),
  locations: z.number().int().nonnegative(),
  unmappedFieldCount: z.number().int().nonnegative(),
  skippedObjects: z.array(SkippedObjectSchema),
  error: z.string().optional(),
});

export const TotalsSchema = z.object({
  sheets: z.number().int().nonnegative(),
  devices: z.number().int().nonnegative(),
  ports: z.number().int().nonnegative(),
  cables: z.number().int().nonnegative(),
  locations: z.number().int().nonnegative(),
  unmappedFieldCount: z.number().int().nonnegative(),
  skippedObjects: z.number().int().nonnegative(),
});

export const RigOutputSchema = z.object({
  sheets: z.array(SheetResultSchema),
  totals: TotalsSchema,
  elapsedMs: z.number().nonnegative(),
});

// ============================================================================
// Acceptance Tests
// ============================================================================

describe('Headless Fixtures Rig (rig/run.mjs)', () => {
  const rootDir = path.resolve(__dirname, '..');
  const runScriptPath = path.resolve(__dirname, 'run.mjs');

  it('executes the rig as a child process and validates against pinned Zod schema under 60s', () => {
    const rawStdout = execSync(`node "${runScriptPath}"`, {
      cwd: rootDir,
      encoding: 'utf8',
    });

    const parsedJson = JSON.parse(rawStdout);
    const validated = RigOutputSchema.parse(parsedJson);

    // Schema validation passes
    expect(validated).toBeDefined();
    expect(validated.elapsedMs).toBeLessThan(60000);
  });

  it('asserts exactly 15/15 fixture sheets are present in output with correct names', async () => {
    const result = await runRig({ silent: true });

    expect(result.sheets.length).toBe(15);
    expect(result.totals.sheets).toBe(15);

    const expectedSheets = [
      'AV_H1A04',
      'AV_H1A22',
      'AV_H1A23',
      'AV_H1A24',
      'AV_H1B05',
      'AV_H1B25',
      'AV_H2A04',
      'AV_H2B20',
      'AV_H3A04',
      'AV_H3B19',
      'AV_H3B20',
      'AV_H4A04',
      'AV_H4B21',
      'AV_U1A21',
      'AV_U1A36',
    ];

    const actualSheets = result.sheets.map((s) => s.sheet);
    expect(actualSheets).toEqual(expectedSheets);
  });

  it('asserts ground-truth total counts matching production AV fasit dataset', async () => {
    const result = await runRig({ silent: true });

    // Exact totals matching measured dataset (367 devices, 278 cables, 65 rooms/locations)
    expect(result.totals.devices).toBe(367);
    expect(result.totals.ports).toBe(1164);
    expect(result.totals.cables).toBe(278);
    expect(result.totals.locations).toBe(65);
    expect(result.totals.unmappedFieldCount).toBe(1251);
    expect(result.totals.skippedObjects).toBe(11);
  });

  it('produces stable, byte-identical JSON outputs across consecutive runs (apart from elapsedMs)', async () => {
    const run1 = await runRig({ silent: true });
    const run2 = await runRig({ silent: true });

    const clean1 = { ...run1, elapsedMs: 0 };
    const clean2 = { ...run2, elapsedMs: 0 };

    expect(JSON.stringify(clean1)).toBe(JSON.stringify(clean2));
  });

  describe('Mutation & Resilience Verification (§6.4)', () => {
    it('partial failure handling: corrupted fixture JSON is recorded in skippedObjects and schema still validates', async () => {
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'copper-rig-corrupt-'));
      try {
        // Copy 1 valid fixture and 1 corrupted fixture into tempDir
        const validSource = path.resolve(__dirname, '../app/tests/fixtures/av-fasit/AV_U1A21.project.json');
        fs.copyFileSync(validSource, path.join(tempDir, 'AV_U1A21.json'));
        fs.writeFileSync(path.join(tempDir, 'AV_CORRUPT.json'), '{ "invalidJson": missingQuote }', 'utf8');

        const result = await runRig({ fixturesDir: tempDir, silent: true });
        const validated = RigOutputSchema.parse(result);

        expect(validated.sheets.length).toBe(2);

        const corruptSheet = validated.sheets.find((s) => s.sheet === 'AV_CORRUPT');
        expect(corruptSheet).toBeDefined();
        expect(corruptSheet?.devices).toBe(0);
        expect(corruptSheet?.skippedObjects.length).toBe(1);
        expect(corruptSheet?.skippedObjects[0].kind).toBe('file');
        expect(corruptSheet?.skippedObjects[0].reason).toContain('Corrupt JSON');
        expect(corruptSheet?.error).toContain('Corrupt JSON');

        const validSheet = validated.sheets.find((s) => s.sheet === 'AV_U1A21');
        expect(validSheet).toBeDefined();
        expect(validSheet?.devices).toBe(12);
        expect(validSheet?.cables).toBe(6);
      } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    });
  });
});

