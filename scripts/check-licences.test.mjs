import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import process from 'node:process';
import {
  ALLOWED_LICENCES,
  normalizeLicenceToken,
  parseLicenceTokens,
  isLicenceAllowed,
  checkLicences
} from './check-licences.mjs';

describe('check-licences', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'copper-licence-test-'));
  });

  afterEach(() => {
    if (tempDir && fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('parseLicenceTokens and normalization', () => {
    it('normalizes standard licence aliases', () => {
      expect(normalizeLicenceToken('mit')).toBe('MIT');
      expect(normalizeLicenceToken('apache 2.0')).toBe('Apache-2.0');
      expect(normalizeLicenceToken('bsd-3-clause')).toBe('BSD-3-Clause');
      expect(normalizeLicenceToken('cc0 1.0')).toBe('CC0-1.0');
      expect(normalizeLicenceToken('0bsd')).toBe('0BSD');
      expect(normalizeLicenceToken('python-2.0')).toBe('Python-2.0');
    });

    it('extracts tokens from simple strings and compound SPDX expressions', () => {
      expect(parseLicenceTokens('MIT')).toEqual(['MIT']);
      expect(parseLicenceTokens('(MIT OR Apache-2.0)')).toEqual(['MIT', 'Apache-2.0']);
      expect(parseLicenceTokens('EPL-2.0 OR GPL-3.0-or-later')).toEqual(['EPL-2.0', 'GPL-3.0-or-later']);
      expect(parseLicenceTokens('MIT AND BSD-3-Clause')).toEqual(['MIT', 'BSD-3-Clause']);
      expect(parseLicenceTokens({ type: 'ISC' })).toEqual(['ISC']);
      expect(parseLicenceTokens([{ type: 'MIT' }, { type: 'Apache-2.0' }])).toEqual(['MIT', 'Apache-2.0']);
      expect(parseLicenceTokens(null)).toEqual([]);
      expect(parseLicenceTokens(undefined)).toEqual([]);
    });
  });

  describe('isLicenceAllowed', () => {
    it('approves all allowlisted licences', () => {
      for (const lic of ALLOWED_LICENCES) {
        const result = isLicenceAllowed([lic], 'some-pkg');
        expect(result.ok).toBe(true);
        expect(result.via).toBe('allowlist');
      }
    });

    it('approves compound expressions if ANY branch is allowlisted', () => {
      const result = isLicenceAllowed(['GPL-3.0', 'MIT'], 'dual-licensed-pkg');
      expect(result.ok).toBe(true);
      expect(result.matchedToken).toBe('MIT');
      expect(result.via).toBe('allowlist');
    });

    it('rejects forbidden licences without exception', () => {
      expect(isLicenceAllowed(['GPL-3.0'], 'bad-pkg').ok).toBe(false);
      expect(isLicenceAllowed(['AGPL-3.0'], 'bad-pkg').ok).toBe(false);
      expect(isLicenceAllowed(['SSPL-1.0'], 'bad-pkg').ok).toBe(false);
      expect(isLicenceAllowed(['PolyForm-Shield-1.0.0'], 'bad-pkg').ok).toBe(false);
      expect(isLicenceAllowed([], 'no-lic-pkg').ok).toBe(false);
    });

    it('approves elkjs with EPL-2.0 when exception is present', () => {
      const exceptions = [
        {
          name: 'elkjs',
          licence: 'EPL-2.0',
          decision: 'docs/decisions/0010-elkjs-epl-licence-exception.md'
        }
      ];

      const res = isLicenceAllowed(['EPL-2.0', 'GPL-3.0-or-later'], 'elkjs', exceptions);
      expect(res.ok).toBe(true);
      expect(res.via).toBe('exception');
      expect(res.matchedToken).toBe('EPL-2.0');
    });

    it('rejects other packages using EPL-2.0 when exception is only for elkjs', () => {
      const exceptions = [
        {
          name: 'elkjs',
          licence: 'EPL-2.0',
          decision: 'docs/decisions/0010-elkjs-epl-licence-exception.md'
        }
      ];

      const res = isLicenceAllowed(['EPL-2.0'], 'other-lib', exceptions);
      expect(res.ok).toBe(false);
    });
  });

  describe('checkLicences integration with fixtures', () => {
    it('fails when a fake package dir has GPL licence (RED fixture test)', () => {
      const nmDir = path.join(tempDir, 'node_modules');
      const gplPkgDir = path.join(nmDir, 'gpl-package');
      fs.mkdirSync(gplPkgDir, { recursive: true });
      fs.writeFileSync(
        path.join(gplPkgDir, 'package.json'),
        JSON.stringify({ name: 'gpl-package', version: '1.0.0', license: 'GPL-3.0' }),
        'utf8'
      );

      const result = checkLicences(tempDir);
      expect(result.ok).toBe(false);
      expect(result.errors.length).toBe(1);
      expect(result.errors[0]?.name).toBe('gpl-package');
      expect(result.errors[0]?.rawLicence).toBe('GPL-3.0');
    });

    it('passes when elkjs has EPL-2.0 and exception fixture is provided (GREEN)', () => {
      const nmDir = path.join(tempDir, 'node_modules');
      const elkPkgDir = path.join(nmDir, 'elkjs');
      fs.mkdirSync(elkPkgDir, { recursive: true });
      fs.writeFileSync(
        path.join(elkPkgDir, 'package.json'),
        JSON.stringify({ name: 'elkjs', version: '0.9.3', license: 'EPL-2.0 OR GPL-3.0-or-later' }),
        'utf8'
      );

      const exceptionsPath = path.join(tempDir, 'exceptions.json');
      fs.writeFileSync(
        exceptionsPath,
        JSON.stringify([{
          name: 'elkjs',
          licence: 'EPL-2.0',
          decision: 'docs/decisions/0010-elkjs-epl-licence-exception.md'
        }]),
        'utf8'
      );

      const result = checkLicences(tempDir, exceptionsPath);
      expect(result.ok).toBe(true);
      expect(result.errors.length).toBe(0);
      expect(result.checkedCount).toBe(1);
    });

    it('passes on the clean repo tree', () => {
      const repoRoot = process.cwd();
      const result = checkLicences(repoRoot);
      expect(result.ok).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.checkedCount).toBeGreaterThan(0);
    });
  });
});
