import { create } from 'zustand';
import { produce } from 'immer';
import type { DesignDocument } from '../model/schema';


export interface DocumentState {
  document: DesignDocument | null;
  history: DesignDocument[];
  historyIndex: number;
  isSaving: boolean;
  syncConflict: boolean;
  loadDocument: (doc: DesignDocument) => void;
  updateDocument: (updater: (draft: DesignDocument) => void) => void;
  undo: () => void;
  redo: () => void;
  saveDocument: (client: any, namespace: string, actor: string) => Promise<void>;
  resolveConflict: (doc: DesignDocument) => void;
  promoteDocument: (client: any, namespace: string, targetStatus: string) => Promise<void>;
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  document: null,
  history: [],
  historyIndex: -1,
  isSaving: false,
  syncConflict: false,

  loadDocument: (doc) => set({
    document: doc,
    history: [doc],
    historyIndex: 0,
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
      return { document: state.history[nextIndex], historyIndex: nextIndex };
    }
    return state;
  }),

  redo: () => set((state) => {
    if (state.historyIndex < state.history.length - 1) {
      const nextIndex = state.historyIndex + 1;
      return { document: state.history[nextIndex], historyIndex: nextIndex };
    }
    return state;
  }),

  saveDocument: async (client, namespace, actor) => {
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

    promoteDocument: async (client: any, namespace: string, targetStatus: string) => {
    const { document } = get();
    if (!document) return;
    
    set({ isSaving: true, syncConflict: false });
    try {
      const res = await client.promoteTopology(namespace, targetStatus, document.revision || '');
      set((state) => {
        if (!state.document) return state;
        const nextDoc = produce(state.document, draft => {
          // B17: revision bumping on active state
          draft.revision = res.revision;
        });
        const nextHistory = state.history.slice(0, state.historyIndex + 1);
        nextHistory.push(nextDoc);
        return {
          document: nextDoc,
          history: nextHistory,
          historyIndex: nextHistory.length - 1,
          isSaving: false
        };
      });
    } catch (e: any) {
      if (e.message && e.message.includes('409')) {
        set({ isSaving: false, syncConflict: true });
      } else {
        set({ isSaving: false });
        throw e;
      }
    }
  },

  resolveConflict: (doc) => set({
    document: doc,
    history: [doc],
    historyIndex: 0,
    syncConflict: false
  })
}));
