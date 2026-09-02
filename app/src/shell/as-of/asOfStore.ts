import { create } from 'zustand';
import type { AsOfState, AsOfReadEnvelope } from './types';

function syncDomAsOf(asOf: string | null) {
  if (typeof document === 'undefined' || !document.body) {
    return;
  }
  if (asOf && asOf.trim().length > 0) {
    document.body.setAttribute('data-as-of-mode', 'true');
    document.body.setAttribute('data-as-of', asOf.trim());
  } else {
    document.body.removeAttribute('data-as-of-mode');
    document.body.removeAttribute('data-as-of');
  }
}

export const useAsOfStore = create<AsOfState>((set, get) => ({
  asOf: null,

  isAsOfActive: () => {
    const val = get().asOf;
    return val !== null && val.trim().length > 0;
  },

  setAsOf: (asOf: string | null) => {
    const next = asOf && asOf.trim().length > 0 ? asOf.trim() : null;
    syncDomAsOf(next);
    set({ asOf: next });
  },

  clearAsOf: () => {
    syncDomAsOf(null);
    set({ asOf: null });
  },
}));

export function getAsOfQueryParam(): AsOfReadEnvelope {
  const asOf = useAsOfStore.getState().asOf;
  return asOf && asOf.trim().length > 0 ? { parse_as_of: asOf.trim() } : {};
}

export function assertNotAsOfMode(actionName?: string): void {
  if (useAsOfStore.getState().isAsOfActive()) {
    const actionMsg = actionName ? ` (${actionName})` : '';
    throw new Error(`Mutations are disabled in as-of mode${actionMsg}`);
  }
}
