import fs from 'node:fs';
import process from 'node:process';

/**
 * Dev-identity seam interface per ADR-0011.
 * Allows coder agents and local dev to run without Microsoft Entra ID credentials.
 */
export interface DevIdentity {
  readonly upn: string;
  readonly allowedNamespaces: readonly string[];
  readonly isDev: true;
}

/**
 * BFF Configuration interface.
 *
 * Config seams:
 * - NCE_BASE_URL / NCE_BASE_URL_FILE: Base URL for upstream NCE REST API.
 * - NCE_API_KEY / NCE_API_KEY_FILE: Server-held HMAC secret key.
 *   Key class: Server-to-server secret (admin-grade REST access).
 *   Blast radius: Full NCE REST access — must never reach client browser bundles.
 * - COOKIE_SECRET / COOKIE_SECRET_FILE: Session encryption & signing secret.
 * - ENTRA_CLIENT_SECRET / ENTRA_CLIENT_SECRET_FILE: Optional Microsoft Entra ID client secret.
 */
export interface BffConfig {
  readonly nceBaseUrl: string;
  readonly nceApiKey: string;
  readonly cookieSecret: string;
  readonly entraClientSecret?: string | undefined;
  readonly port: number;
  readonly devMode: boolean;
  readonly devIdentity: DevIdentity;
}

/**
 * Strips UTF-8 Byte Order Mark (BOM: \uFEFF) and surrounding whitespace.
 */
export function stripBomAndWhitespace(value: string): string {
  return value.replace(/^\uFEFF/, '').trim();
}

/**
 * Reads a secret file from disk, stripping BOM and surrounding whitespace.
 * Fails closed (throws) if the file cannot be read or is empty after stripping.
 */
export function readSecretFile(filePath: string): string {
  let content: string;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    throw new Error(`Failed to read secret file at '${filePath}': ${(err as Error).message}`);
  }

  const cleaned = stripBomAndWhitespace(content);
  if (cleaned.length === 0) {
    throw new Error(`Secret file at '${filePath}' is empty after stripping BOM and whitespace. Fails closed with no default.`);
  }

  return cleaned;
}

/**
 * Resolves a secret from direct environment variable or file environment variable.
 * Order of precedence:
 * 1. Direct env variable (if set and non-empty after stripping BOM and whitespace)
 * 2. File env variable (if set, reads file and strips BOM/whitespace, failing closed on read error or empty content)
 *
 * If `required` is true and no valid secret is resolved, throws an Error.
 * Never returns a fallback default secret.
 */
export function readSecret(
  envKey: string,
  fileEnvKey?: string,
  env: NodeJS.ProcessEnv = process.env,
  options: { required?: boolean } = {}
): string | undefined {
  const directRaw = env[envKey];
  if (directRaw !== undefined) {
    const directClean = stripBomAndWhitespace(directRaw);
    if (directClean.length > 0) {
      return directClean;
    }
  }

  const filePath = fileEnvKey ? env[fileEnvKey] : undefined;
  if (filePath !== undefined && filePath !== '') {
    return readSecretFile(filePath);
  }

  if (options.required) {
    const fileHint = fileEnvKey ? ` or ${fileEnvKey}` : '';
    throw new Error(`Missing required secret: ${envKey}${fileHint}. Fails closed with no default.`);
  }

  return undefined;
}

/**
 * Dev-identity seam helper per ADR-0011.
 * Provides a stub dev identity for local runs.
 */
export function getDevIdentity(env: NodeJS.ProcessEnv = process.env): DevIdentity {
  const upn = env.COPPER_DEV_USER_UPN || 'dev-user@bravoav.no';
  const rawNamespaces = env.COPPER_DEV_USER_NAMESPACES;
  const allowedNamespaces = rawNamespaces
    ? rawNamespaces.split(',').map((s) => s.trim()).filter(Boolean)
    : ['default'];

  return {
    upn,
    allowedNamespaces,
    isDev: true,
  };
}

/**
 * Load and validate BFF configuration from environment or secret files.
 * Throws an error if required secrets or URLs are missing.
 * Re-asserts CL2 B121 fallback-secret removal (no hardcoded defaults).
 */
export function loadConfig(env: NodeJS.ProcessEnv = process.env): BffConfig {
  const nceBaseUrl = readSecret('NCE_BASE_URL', 'NCE_BASE_URL_FILE', env, { required: true })!;

  const nceApiKey = readSecret('NCE_API_KEY', 'NCE_API_KEY_FILE', env, { required: true })!;

  const cookieSecret = readSecret('COOKIE_SECRET', 'COOKIE_SECRET_FILE', env, { required: true })!;

  const entraClientSecret = readSecret('ENTRA_CLIENT_SECRET', 'ENTRA_CLIENT_SECRET_FILE', env, { required: false });

  const devMode = env.NODE_ENV !== 'production' || env.COPPER_DEV_MODE === 'true';
  const devIdentity = getDevIdentity(env);
  const port = Number(env.PORT || env.BFF_PORT || 3001);

  return {
    nceBaseUrl,
    nceApiKey,
    cookieSecret,
    entraClientSecret,
    port,
    devMode,
    devIdentity,
  };
}
