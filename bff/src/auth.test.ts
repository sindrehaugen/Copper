import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Context, Next } from 'hono';

// Mock getSignedCookie
vi.mock('hono/cookie', () => {
  return {
    getSignedCookie: vi.fn(async (c) => {
      if (c.req.header('cookie')?.includes('valid')) {
        return JSON.stringify({ group: 'AdminGroup', upn: 'admin@test.com' });
      }
      return undefined;
    }),
  };
});

describe('auth middleware', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('allows request with valid origin on mutation', async () => {
    process.env.COOKIE_SECRET = 'test-secret';
    process.env.NODE_ENV = 'test';
    const { requireAuth } = await import('./auth');

    const c = {
      req: {
        method: 'POST',
        header: (name: string) => {
          if (name === 'origin') return 'http://localhost';
          if (name === 'host') return 'localhost';
          if (name === 'cookie') return 'valid';
          return undefined;
        }
      },
      set: vi.fn(),
      text: vi.fn(),
    } as unknown as Context;
    const next = vi.fn() as unknown as Next;

    await requireAuth(c, next);
    expect(c.text).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
    expect(c.set).toHaveBeenCalledWith('session', { actor: 'admin@test.com', namespace: 'admin' });
  });

  it('rejects request with invalid origin on mutation', async () => {
    process.env.COOKIE_SECRET = 'test-secret';
    process.env.NODE_ENV = 'test';
    const { requireAuth } = await import('./auth');

    const c = {
      req: {
        method: 'POST',
        header: (name: string) => {
          if (name === 'origin') return 'http://evil.com';
          if (name === 'host') return 'localhost';
          return undefined;
        }
      },
      text: vi.fn(),
    } as unknown as Context;
    const next = vi.fn() as unknown as Next;

    await requireAuth(c, next);
    expect(c.text).toHaveBeenCalledWith('Forbidden: Invalid Origin', 403);
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects request with no cookie in production', async () => {
    process.env.COOKIE_SECRET = 'test-secret'; // We set this so the module doesn't throw on import for this test
    process.env.NODE_ENV = 'production';
    const { requireAuth } = await import('./auth');
    
    const c = {
      req: {
        method: 'GET',
        header: () => undefined
      },
      text: vi.fn(),
    } as unknown as Context;
    const next = vi.fn() as unknown as Next;

    await requireAuth(c, next);
    expect(c.text).toHaveBeenCalledWith('Unauthorized', 401);
    expect(next).not.toHaveBeenCalled();
  });

  it('throws on boot when COOKIE_SECRET is unset in production', async () => {
    delete process.env.COOKIE_SECRET;
    process.env.NODE_ENV = 'production';
    await expect(import('./auth')).rejects.toThrow('COOKIE_SECRET must be set in production');
  });
});
