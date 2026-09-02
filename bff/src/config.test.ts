import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  loadConfig,
  readSecret,
  readSecretFile,
  stripBomAndWhitespace,
} from './config';

describe('BFF Config & Secrets Reader (DX.W4 / B153)', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'copper-secrets-test-'));
  });

  afterEach(() => {
    if (tempDir && fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('stripBomAndWhitespace', () => {
    it('strips UTF-8 BOM prefix and surrounding whitespace', () => {
      const clean = 'super-secret-value-123';
      const withBom = `\uFEFF${clean}`;
      const withBomAndWhitespace = `\uFEFF  \n\r\t${clean}\n\r  \t`;

      expect(stripBomAndWhitespace(clean)).toBe(clean);
      expect(stripBomAndWhitespace(withBom)).toBe(clean);
      expect(stripBomAndWhitespace(withBomAndWhitespace)).toBe(clean);
    });
  });

  describe('readSecretFile', () => {
    it('reads a clean secret file successfully', () => {
      const secretPath = path.join(tempDir, 'clean_secret.txt');
      fs.writeFileSync(secretPath, 'clean-key-value-456', 'utf8');

      const result = readSecretFile(secretPath);
      expect(result).toBe('clean-key-value-456');
    });

    it('reads a BOM-prefixed secret file identically to a clean one', () => {
      const cleanSecretPath = path.join(tempDir, 'clean.txt');
      const bomSecretPath = path.join(tempDir, 'bom.txt');
      const secret = 'shared-secret-token-xyz';

      fs.writeFileSync(cleanSecretPath, secret, 'utf8');
      fs.writeFileSync(bomSecretPath, `\uFEFF${secret}\n`, 'utf8');

      const cleanResult = readSecretFile(cleanSecretPath);
      const bomResult = readSecretFile(bomSecretPath);

      expect(bomResult).toBe(cleanResult);
      expect(bomResult).toBe(secret);
    });

    it('fails closed (throws) on a non-existent secret file', () => {
      const missingPath = path.join(tempDir, 'non_existent.txt');
      expect(() => readSecretFile(missingPath)).toThrow(/Failed to read secret file/);
    });

    it('fails closed (throws) on an empty secret file', () => {
      const emptyPath = path.join(tempDir, 'empty.txt');
      fs.writeFileSync(emptyPath, '', 'utf8');
      expect(() => readSecretFile(emptyPath)).toThrow(/is empty after stripping BOM and whitespace/);
    });

    it('fails closed (throws) on a secret file containing only whitespace or BOM', () => {
      const whitespacePath = path.join(tempDir, 'whitespace.txt');
      fs.writeFileSync(whitespacePath, '\uFEFF   \n\r\t  ', 'utf8');
      expect(() => readSecretFile(whitespacePath)).toThrow(/is empty after stripping BOM and whitespace/);
    });
  });

  describe('readSecret', () => {
    it('resolves direct environment variable if set and non-empty', () => {
      const env: NodeJS.ProcessEnv = {
        MY_SECRET: 'direct-value-999',
      };

      const result = readSecret('MY_SECRET', 'MY_SECRET_FILE', env);
      expect(result).toBe('direct-value-999');
    });

    it('strips BOM and whitespace from direct environment variable', () => {
      const env: NodeJS.ProcessEnv = {
        MY_SECRET: '\uFEFF  direct-value-stripped  \n',
      };

      const result = readSecret('MY_SECRET', 'MY_SECRET_FILE', env);
      expect(result).toBe('direct-value-stripped');
    });

    it('resolves file environment variable when direct env var is unset', () => {
      const secretPath = path.join(tempDir, 'file_secret.txt');
      fs.writeFileSync(secretPath, '\uFEFFfile-secret-value-777\n', 'utf8');

      const env: NodeJS.ProcessEnv = {
        MY_SECRET_FILE: secretPath,
      };

      const result = readSecret('MY_SECRET', 'MY_SECRET_FILE', env);
      expect(result).toBe('file-secret-value-777');
    });

    it('throws when required secret is missing from both direct and file env', () => {
      const env: NodeJS.ProcessEnv = {};
      expect(() => readSecret('REQUIRED_KEY', 'REQUIRED_KEY_FILE', env, { required: true })).toThrow(
        /Missing required secret: REQUIRED_KEY/
      );
    });

    it('throws when file env var points to missing file even if required=false', () => {
      const env: NodeJS.ProcessEnv = {
        OPTIONAL_SECRET_FILE: path.join(tempDir, 'missing.txt'),
      };
      expect(() => readSecret('OPTIONAL_SECRET', 'OPTIONAL_SECRET_FILE', env, { required: false })).toThrow(
        /Failed to read secret file/
      );
    });
  });

  describe('loadConfig', () => {
    it('loads configuration using direct environment variables', () => {
      const env: NodeJS.ProcessEnv = {
        NCE_BASE_URL: 'https://nce.example.com',
        NCE_API_KEY: 'test-api-key',
        COOKIE_SECRET: 'test-cookie-secret',
        PORT: '8005',
        NODE_ENV: 'production',
      };

      const config = loadConfig(env);
      expect(config.nceBaseUrl).toBe('https://nce.example.com');
      expect(config.nceApiKey).toBe('test-api-key');
      expect(config.cookieSecret).toBe('test-cookie-secret');
      expect(config.entraClientSecret).toBeUndefined();
      expect(config.port).toBe(8005);
      expect(config.devMode).toBe(false);
    });

    it('loads configuration from *_FILE mounts for COOKIE_SECRET_FILE, NCE_API_KEY_FILE, ENTRA_CLIENT_SECRET_FILE', () => {
      const cookieSecretPath = path.join(tempDir, 'cookie_secret');
      const nceApiKeyPath = path.join(tempDir, 'nce_api_key');
      const entraClientSecretPath = path.join(tempDir, 'entra_client_secret');

      fs.writeFileSync(cookieSecretPath, '\uFEFFmounted-cookie-secret\n', 'utf8');
      fs.writeFileSync(nceApiKeyPath, 'mounted-nce-api-key \r\n', 'utf8');
      fs.writeFileSync(entraClientSecretPath, '\uFEFFmounted-entra-secret\n', 'utf8');

      const env: NodeJS.ProcessEnv = {
        NCE_BASE_URL: 'http://nce-admin:8003',
        COOKIE_SECRET_FILE: cookieSecretPath,
        NCE_API_KEY_FILE: nceApiKeyPath,
        ENTRA_CLIENT_SECRET_FILE: entraClientSecretPath,
      };

      const config = loadConfig(env);
      expect(config.cookieSecret).toBe('mounted-cookie-secret');
      expect(config.nceApiKey).toBe('mounted-nce-api-key');
      expect(config.entraClientSecret).toBe('mounted-entra-secret');
      expect(config.nceBaseUrl).toBe('http://nce-admin:8003');
    });

    it('throws (fails closed) if COOKIE_SECRET / COOKIE_SECRET_FILE is missing', () => {
      const env: NodeJS.ProcessEnv = {
        NCE_BASE_URL: 'http://localhost:8003',
        NCE_API_KEY: 'test-api-key',
      };

      expect(() => loadConfig(env)).toThrow(/Missing required secret: COOKIE_SECRET/);
    });

    it('throws (fails closed) if NCE_API_KEY / NCE_API_KEY_FILE is missing', () => {
      const env: NodeJS.ProcessEnv = {
        NCE_BASE_URL: 'http://localhost:8003',
        COOKIE_SECRET: 'test-cookie-secret',
      };

      expect(() => loadConfig(env)).toThrow(/Missing required secret: NCE_API_KEY/);
    });

    it('re-asserts removal of fallback defaults (no hardcoded secret is ever used)', () => {
      const env: NodeJS.ProcessEnv = {
        NODE_ENV: 'development',
        NCE_BASE_URL: 'http://localhost:8003',
        NCE_API_KEY: 'dev-key',
        // COOKIE_SECRET intentionally omitted
      };

      expect(() => loadConfig(env)).toThrow(/COOKIE_SECRET/);
    });
  });
});
