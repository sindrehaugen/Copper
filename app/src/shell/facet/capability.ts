import type { Capability } from "./types";

/**
 * Checks whether all required capabilities are satisfied by available capabilities.
 * If requires is undefined, null, or empty, the check passes (true).
 * If requires has entries and available is undefined or null, the check fails (false).
 */
export function hasCapability(
  requires?: Capability[] | undefined,
  available?: Capability[] | null
): boolean {
  if (!requires || requires.length === 0) {
    return true;
  }
  if (!available) {
    return false;
  }
  return requires.every((req) => available.includes(req));
}
