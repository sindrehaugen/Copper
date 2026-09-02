import console from 'node:console';
import fs from 'node:fs';
import process from 'node:process';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { requireAuth } from './auth';
import { meRoutes } from './routes/me';
import type { Context, Next } from 'hono';

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
 * Session identity interface per ADR-0011.
 * Stated as a stub here; replaced with full Entra ID OIDC / signed cookie session in B75.
 */
export interface SessionIdentity {
  readonly upn: string;
  readonly allowedNamespaces: readonly string[];
}

/**
 * BFF Configuration interface.
 *
 * Config seams:
 * - NCE_BASE_URL: Base URL for upstream NCE REST API.
 * - NCE_API_KEY: Server-held HMAC secret key.
 *   Key class: Server-to-server secret (admin-grade REST access).
 *   Blast radius: Full NCE REST access — must never reach client browser bundles.
 */
export interface BffConfig {
  readonly nceBaseUrl: string;
  readonly nceApiKey: string;
  readonly port: number;
  readonly devMode: boolean;
  readonly devIdentity: DevIdentity;
}

/**
 * Helper to resolve configuration from environment variable or file path.
 */
function readEnvOrFile(envKey: string, fileEnvKey?: string, env: NodeJS.ProcessEnv = process.env): string | undefined {
  const directValue = env[envKey];
  if (directValue !== undefined && directValue !== '') {
    return directValue;
  }
  const filePath = fileEnvKey ? env[fileEnvKey] : undefined;
  if (filePath && fs.existsSync(filePath)) {
    return fs.readFileSync(filePath, 'utf8').trim();
  }
  return undefined;
}

/**
 * Load and validate BFF configuration from environment or secret files.
 * Throws an error if required secrets or URLs are missing.
 */
export function loadConfig(env: NodeJS.ProcessEnv = process.env): BffConfig {
  const nceBaseUrl = readEnvOrFile('NCE_BASE_URL', 'NCE_BASE_URL_FILE', env);
  if (!nceBaseUrl) {
    throw new Error('Missing required environment variable: NCE_BASE_URL');
  }

  const nceApiKey = readEnvOrFile('NCE_API_KEY', 'NCE_API_KEY_FILE', env);
  if (!nceApiKey) {
    throw new Error(
      'Missing required environment variable: NCE_API_KEY. ' +
      'Key class: server-side secret (admin-grade REST HMAC key). ' +
      'Blast radius: full NCE REST access — must never leak to browser bundles per seam audit.'
    );
  }

  const devMode = env.NODE_ENV !== 'production' || env.COPPER_DEV_MODE === 'true';
  const devUpn = env.COPPER_DEV_USER_UPN || 'dev-user@bravoav.no';
  const rawNamespaces = env.COPPER_DEV_USER_NAMESPACES;
  const allowedNamespaces = rawNamespaces
    ? rawNamespaces.split(',').map((s) => s.trim()).filter(Boolean)
    : ['default'];

  const port = Number(env.PORT || env.BFF_PORT || 3001);

  return {
    nceBaseUrl,
    nceApiKey,
    port,
    devMode,
    devIdentity: {
      upn: devUpn,
      allowedNamespaces,
      isDev: true,
    },
  };
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
 * Session stub helper per ADR-0011 / Batch 019.
 * Stubs session identity until replaced by B75 (Entra ID OIDC / signed cookie session).
 */
export function getSession(_c?: Context, env: NodeJS.ProcessEnv = process.env): SessionIdentity {
  const devId = getDevIdentity(env);
  return {
    upn: devId.upn,
    allowedNamespaces: devId.allowedNamespaces,
  };
}

/**
 * Session stub middleware.
 * Attaches the stub session identity to context variables for downstream handlers.
 */
export async function sessionStubMiddleware(c: Context, next: Next): Promise<void> {
  const session = getSession(c);
  c.set('session', session);
  await next();
}

import { designRoutes } from './routes/design.js';

/**
 * Factory function to create and configure the Hono BFF application.
 */
export function createBffApp(): Hono {
  const app = new Hono();

  // Auth middleware
  app.use('*', requireAuth);

  app.get('/api/session', (c: any) => c.json(c.get('session')));

  // Health check endpoint
  app.get('/healthz', (c) => {
    return c.json({ status: 'ok' }, 200);
  });

  app.route('/api/design', designRoutes);
  app.route('/api/me', meRoutes);

  return app;
}

export const app = createBffApp();

export default app;

// Start server if executed directly as entrypoint
if (process.env.NODE_ENV !== 'test' && !process.env.VITEST && process.env.BFF_SERVE_AUTO === 'true') {
  const port = Number(process.env.PORT || process.env.BFF_PORT || 3001);
  console.log(`Starting BFF server on port ${port}...`);
  serve({
    fetch: app.fetch,
    port,
  });
}

