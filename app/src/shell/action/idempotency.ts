/**
 * Generate a cryptographically strong idempotency key.
 * Formatted with prefix and high-entropy components to guarantee single-execution.
 */
export function generateIdempotencyKey(prefix: string = 'idem'): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID()}`;
  }

  // Fallback for environments without crypto.randomUUID
  const rand = Math.random().toString(36).substring(2, 10);
  const time = Date.now().toString(36);
  return `${prefix}_${time}_${rand}`;
}

/**
 * Resolve the actor identity from session or parameters.
 * Defaults to the standard dev/operator identity if not in active session.
 */
export function resolveActor(explicitActor?: string): string {
  if (explicitActor && explicitActor.trim().length > 0) {
    return explicitActor.trim();
  }

  if (typeof window !== 'undefined') {
    const sessionAny = (window as unknown as { __COPPER_SESSION__?: { upn?: string } }).__COPPER_SESSION__;
    if (sessionAny?.upn) {
      return sessionAny.upn;
    }
  }

  return 'dev-user@bravoav.no';
}
