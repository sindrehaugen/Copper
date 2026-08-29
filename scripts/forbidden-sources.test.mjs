import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import process from 'node:process';
import {
  scanFileForForbidden,
  scanForbiddenSources
} from './forbidden-sources.mjs';

const MARKER_BANESOK = 'bane' + 'sok';
const MARKER_RUTEKVALITET = 'rute' + 'kvalitet';
const MARKER_CONNECTOR_ACCEPTS = 'connector' + 'Accepts';
const MARKER_STYGGHETSTALL = 'stygghets' + 'tall';
const MARKER_EASY_SCHEMATIC = 'Easy' + 'Schematic';
const MARKER_EASY_SCHEMATIC_LOWER = 'easy' + 'schematic';
const EXEMPT_EXCHANGE_PATH = 'app/src/exchange/' + MARKER_EASY_SCHEMATIC_LOWER + '/reader.ts';
const EXEMPT_EXCHANGE_ALGO_PATH = 'app/src/exchange/' + MARKER_EASY_SCHEMATIC_LOWER + '/reader_with_algo.ts';

describe('forbidden-sources', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'copper-forbidden-test-'));
  });

  afterEach(() => {
    if (tempDir && fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('scanFileForForbidden', () => {
    it('passes for clean source file in app/', async () => {
      const filePath = path.join(tempDir, 'clean.ts');
      fs.writeFileSync(filePath, 'export const cleanCode = 42;\n', 'utf8');

      const violations = await scanFileForForbidden(filePath, 'app/src/model/clean.ts');
      expect(violations).toEqual([]);
    });

    it('fails when algorithm marker 1 is planted in an app file (RED)', async () => {
      const filePath = path.join(tempDir, 'dirty.ts');
      fs.writeFileSync(
        filePath,
        `// line 1\nconst algorithm = "${MARKER_BANESOK}";\n// line 3\n`,
        'utf8'
      );

      const violations = await scanFileForForbidden(filePath, 'app/src/layout/dirty.ts');
      expect(violations.length).toBe(1);
      expect(violations[0]?.line).toBe(2);
      expect(violations[0]?.marker).toBe(MARKER_BANESOK);
      expect(violations[0]?.type).toBe('forbidden-algorithm-marker');
    });

    it('fails when algorithm markers 2, 3, or 4 are planted (RED)', async () => {
      const filePath = path.join(tempDir, 'bad_terms.ts');
      fs.writeFileSync(
        filePath,
        `const q = "${MARKER_RUTEKVALITET}";\nconst c = "${MARKER_CONNECTOR_ACCEPTS}";\nconst s = "${MARKER_STYGGHETSTALL}";\n`,
        'utf8'
      );

      const violations = await scanFileForForbidden(filePath, 'app/src/model/bad_terms.ts');
      expect(violations.length).toBe(3);
      expect(violations.map(v => v.marker)).toEqual([
        MARKER_RUTEKVALITET,
        MARKER_CONNECTOR_ACCEPTS,
        MARKER_STYGGHETSTALL
      ]);
    });

    it('fails when format marker appears outside exempt path (e.g. app/src/model/test.ts)', async () => {
      const filePath = path.join(tempDir, 'format_violation.ts');
      fs.writeFileSync(
        filePath,
        `const name = "${MARKER_EASY_SCHEMATIC}";\nconst lower = "${MARKER_EASY_SCHEMATIC_LOWER}";\n`,
        'utf8'
      );

      const violations = await scanFileForForbidden(filePath, 'app/src/model/format_violation.ts');
      expect(violations.length).toBe(2);
      expect(violations[0]?.type).toBe('forbidden-format-marker');
    });

    it('allows format markers inside exempt path exchange reader (GREEN)', async () => {
      const filePath = path.join(tempDir, 'reader.ts');
      fs.writeFileSync(
        filePath,
        `// Parses the ${MARKER_EASY_SCHEMATIC} exchange format\nconst format = "${MARKER_EASY_SCHEMATIC_LOWER}";\n`,
        'utf8'
      );

      const violations = await scanFileForForbidden(
        filePath,
        EXEMPT_EXCHANGE_PATH
      );
      expect(violations).toEqual([]);
    });

    it('allows format markers inside exempt path app/tests/fixtures/ (GREEN)', async () => {
      const filePath = path.join(tempDir, 'fixture.json');
      fs.writeFileSync(
        filePath,
        `{"format": "${MARKER_EASY_SCHEMATIC}"}\n`,
        'utf8'
      );

      const violations = await scanFileForForbidden(
        filePath,
        'app/tests/fixtures/sample.json'
      );
      expect(violations).toEqual([]);
    });

    it('rejects algorithm markers even inside exempt exchange paths (never exempt)', async () => {
      const filePath = path.join(tempDir, 'reader_with_algo.ts');
      fs.writeFileSync(
        filePath,
        `// format reader\nconst search = "${MARKER_BANESOK}";\n`,
        'utf8'
      );

      const violations = await scanFileForForbidden(
        filePath,
        EXEMPT_EXCHANGE_ALGO_PATH
      );
      expect(violations.length).toBe(1);
      expect(violations[0]?.marker).toBe(MARKER_BANESOK);
    });

    it('fails when external CDN script or link tag is found in app/ (ADR-0008 §1)', async () => {
      const filePath = path.join(tempDir, 'index.html');
      fs.writeFileSync(
        filePath,
        `<!doctype html><html><head><script src="https://cdn.example.com/lib.js"></script></head></html>\n`,
        'utf8'
      );

      const violations = await scanFileForForbidden(filePath, 'app/index.html');
      expect(violations.length).toBe(1);
      expect(violations[0]?.type).toBe('external-cdn-reference');
      expect(violations[0]?.marker).toBe('external-cdn');
    });

    it('passes for relative script and link tags in app/', async () => {
      const filePath = path.join(tempDir, 'index.html');
      fs.writeFileSync(
        filePath,
        `<!doctype html><html><head><link href="/styles.css" rel="stylesheet" /><script src="/src/main.tsx"></script></head></html>\n`,
        'utf8'
      );

      const violations = await scanFileForForbidden(filePath, 'app/index.html');
      expect(violations).toEqual([]);
    });
  });

  describe('scanForbiddenSources on clean repository', () => {
    it('passes with zero violations on the tracked code trees in clean repo', async () => {
      const repoRoot = process.cwd();
      const result = await scanForbiddenSources(repoRoot);
      expect(result.ok).toBe(true);
      expect(result.violations).toEqual([]);
      expect(result.scannedCount).toBeGreaterThan(0);
    }, 15000);
  });
});
