import { create } from 'zustand';
import { useDocumentStore } from './documentStore';

export interface SessionData {
  actor: string;
  currentNamespace: string;
  allowedNamespaces: string[];
  isAuthenticated?: boolean;
}

export interface SessionStoreState {
  actor: string;
  currentNamespace: string;
  allowedNamespaces: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  subscriptionTeardowns: Set<() => void>;

  setSession: (session: {
    actor?: string;
    userId?: string;
    upn?: string;
    currentNamespace?: string;
    namespace?: string;
    tenantId?: string;
    allowedNamespaces?: string[];
    isAuthenticated?: boolean;
  }) => void;
  switchNamespace: (newNamespace: string) => boolean;
  registerSubscriptionTeardown: (teardown: () => void) => () => void;
  hardReset: () => void;
  resetSession: () => void;
}

export const useSessionStore = create<SessionStoreState>((set, get) => ({
  actor: 'anonymous',
  currentNamespace: 'default',
  allowedNamespaces: ['default'],
  isAuthenticated: false,
  isLoading: false,
  error: null,
  subscriptionTeardowns: new Set(),

  setSession: (data) => {
    const actor = data.actor || data.userId || data.upn || 'anonymous';
    const currentNamespace = data.currentNamespace || data.namespace || data.tenantId || 'default';
    const allowedNamespaces = data.allowedNamespaces && data.allowedNamespaces.length > 0
      ? data.allowedNamespaces
      : [currentNamespace];

    set({
      actor,
      currentNamespace,
      allowedNamespaces,
      isAuthenticated: data.isAuthenticated !== undefined ? data.isAuthenticated : true,
      isLoading: false,
      error: null,
    });
  },

  registerSubscriptionTeardown: (teardown) => {
    const teardowns = get().subscriptionTeardowns;
    teardowns.add(teardown);
    return () => {
      teardowns.delete(teardown);
    };
  },

  hardReset: () => {
    const { subscriptionTeardowns } = get();
    for (const teardown of subscriptionTeardowns) {
      try {
        teardown();
      } catch (err) {
        console.error('Error during subscription teardown:', err);
      }
    }
    subscriptionTeardowns.clear();

    // Drop documentStore caches, stage data, history, and findings
    useDocumentStore.getState().reset();
  },

  switchNamespace: (newNamespace: string) => {
    const { allowedNamespaces, currentNamespace, hardReset } = get();

    // Bound to allowedNamespaces: unauthorized namespace is strictly unselectable
    if (!allowedNamespaces.includes(newNamespace)) {
      set({ error: `Namespace '${newNamespace}' is not in allowedNamespaces.` });
      return false;
    }

    if (newNamespace === currentNamespace) {
      return true;
    }

    // Hard context reset (no cross-namespace bleed)
    hardReset();

    set({
      currentNamespace: newNamespace,
      error: null,
    });

    return true;
  },

  resetSession: () => {
    get().hardReset();
    set({
      actor: 'anonymous',
      currentNamespace: 'default',
      allowedNamespaces: ['default'],
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  },
}));
