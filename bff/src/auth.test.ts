import { describe, it, expect, vi } from 'vitest';
import { requireAuth } from './auth';
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
  it('allows request with valid origin on mutation', async () => {
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
    const prevEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    
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
    
    process.env.NODE_ENV = prevEnv;
  });
});

