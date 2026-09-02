import { create } from 'zustand';
import { produce } from 'immer';
import type { DesignDocument } from '../model/schema';
import { validateDocument } from '../validation/registry';
export interface StoreApiClient {
  authorTopology: (namespace: string, payload: unknown) => Promise<void>;
  validateDesignGraph: (namespace: string, payload: unknown) => Promise<{ valid: boolean, findings: any[] }>;
}

export interface DocumentState {
  document: DesignDocument | null;
  history: DesignDocument[];
  historyIndex: number;
  selectedIds: string[];
  isSaving: boolean;
  syncConflict: boolean;
  remoteFindings: any[];
  setRemoteFindings: (findings: any[]) => void;
  loadDocument: (doc: DesignDocument) => void;
  updateDocument: (updater: (draft: DesignDocument) => void) => void;
  undo: () => void;
  redo: () => void;
  saveDocument: (client: StoreApiClient, namespace: string, actor: string) => Promise<void>;
  promoteDocument: (client: StoreApiClient, namespace: string, actor: string, targetStatus: 'quoted' | 'active') => Promise<void>;
  resolveConflict: (doc: DesignDocument) => void;
  setSelectedIds: (ids: string[]) => void;
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  document: null,
  history: [],
  historyIndex: -1,
  selectedIds: [],
  isSaving: false,
  syncConflict: false,
  remoteFindings: [],

  setRemoteFindings: (findings) => set({ remoteFindings: findings }),

  loadDocument: (doc) => set({
    document: doc,
    history: [doc],
    historyIndex: 0,
    selectedIds: [],
    syncConflict: false
  }),

  updateDocument: (updater) => set((state) => {
    if (!state.document) return state;
    const nextDoc = produce(state.document, updater);
    const nextHistory = state.history.slice(0, state.historyIndex + 1);
    nextHistory.push(nextDoc);
    return {
      document: nextDoc,
      history: nextHistory,
      historyIndex: nextHistory.length - 1
    };
  }),

  undo: () => set((state) => {
    if (state.historyIndex > 0) {
      const nextIndex = state.historyIndex - 1;
      return { document: state.history[nextIndex]!, historyIndex: nextIndex };
    }
    return state;
  }),

  redo: () => set((state) => {
    if (state.historyIndex < state.history.length - 1) {
      const nextIndex = state.historyIndex + 1;
      return { document: state.history[nextIndex]!, historyIndex: nextIndex };
    }
    return state;
  }),

  saveDocument: async (client: StoreApiClient, namespace: string, actor: string) => {
    const { document } = get();
    if (!document) return;
    
    set({ isSaving: true, syncConflict: false });
    try {
      const payload = {
        design: {
          designLabel: document.designLabel,
          revision: document.revision,
          status: 'planned',
          actor,
          expected_version: document.revision
        },
        sites: document.sites,
        locations: document.locations,
        racks: document.racks,
        deviceTypes: document.deviceTypes,
        devices: document.devices,
        cables: document.cables,
        signalClasses: document.signalClasses
      };
      
      await client.authorTopology(namespace, payload);
      set({ isSaving: false });
    } catch (e: any) {
      if (e.message && e.message.includes('409')) { // Version conflict
        set({ isSaving: false, syncConflict: true });
      } else {
        set({ isSaving: false });
        throw e;
      }
    }
  },

  promoteDocument: async (client: StoreApiClient, namespace: string, actor: string, targetStatus: 'quoted' | 'active') => {
    const { document, setRemoteFindings } = get();
    if (!document) return;

    // 1. Run local validation
    const localRes = validateDocument(document);
    if (!localRes.valid) {
      throw new Error('Local validation failed. See Problems Panel for details.');
    }

    set({ isSaving: true, syncConflict: false });
    try {
      const payload = {
        design: {
          designLabel: document.designLabel,
          revision: document.revision,
          status: targetStatus,
          actor,
          expected_version: document.revision
        },
        sites: document.sites,
        locations: document.locations,
        racks: document.racks,
        deviceTypes: document.deviceTypes,
        devices: document.devices,
        cables: document.cables,
        signalClasses: document.signalClasses
      };

      // 2. Run remote NCE validation if supported
      if (client.validateDesignGraph) {
        const remoteRes = await client.validateDesignGraph(namespace, payload);
        if (!remoteRes.valid) {
          setRemoteFindings(remoteRes.findings || []);
          set({ isSaving: false });
          throw new Error('Remote validation failed. See Problems Panel for details.');
        }
      }

      // 3. Promote
      await client.authorTopology(namespace, payload);
      setRemoteFindings([]);
      set({ isSaving: false });
    } catch (e: any) {
      if (e.message && e.message.includes('409')) {
        set({ isSaving: false, syncConflict: true });
        throw new Error('Conflict (409 expected_version): Please reload and reapply your changes.');
      } else {
        set({ isSaving: false });
        throw e;
      }
    }
  },

  setSelectedIds: (ids) => set({ selectedIds: ids }),
  resolveConflict: (doc) => set({
    document: doc,
    history: [doc],
    historyIndex: 0,
    selectedIds: [],
    syncConflict: false
  })
}));

