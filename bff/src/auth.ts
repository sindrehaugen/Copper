import type { Context, Next } from 'hono';
import { getSignedCookie } from 'hono/cookie';

const COOKIE_SECRET = process.env.COOKIE_SECRET || 'fallback-secret-for-dev';
const SESSION_COOKIE_NAME = 'copper_session';

export interface AuthSession {
  actor: string;
  namespace: string;
}

/**
 * Validates a signed HttpOnly SameSite=Strict session cookie.
 * Enforces Origin check on mutations.
 * Maps Entra group to namespace.
 */
export async function requireAuth(c: Context, next: Next) {
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(c.req.method)) {
    const origin = c.req.header('origin');
    const host = c.req.header('host');
    if (origin && host) {
      try {
        const originUrl = new URL(origin);
        if (originUrl.host !== host) {
          return c.text('Forbidden: Invalid Origin', 403);
        }
      } catch {
        return c.text('Forbidden: Invalid Origin', 403);
      }
    }
  }

  let sessionCookie;
  try {
    sessionCookie = await getSignedCookie(c, COOKIE_SECRET, SESSION_COOKIE_NAME);
  } catch {
    sessionCookie = undefined;
  }

  if (!sessionCookie && process.env.NODE_ENV === 'development') {
    c.set('session', {
      actor: 'agent@local',
      namespace: 'default',
    });
    return await next();
  }

  if (!sessionCookie) {
    return c.text('Unauthorized', 401);
  }

  try {
    const payload = JSON.parse(sessionCookie as string);
    const namespace = payload.group === 'AdminGroup' ? 'admin' : 'default';
    
    c.set('session', {
      actor: payload.upn || 'unknown',
      namespace,
    });
  } catch {
    return c.text('Unauthorized: Invalid Session', 401);
  }

  await next();
}

