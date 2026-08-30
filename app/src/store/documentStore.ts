import { create } from 'zustand';
import { produce } from 'immer';
import type { DesignDocument } from '../model/schema';

export interface DocumentState {
  document: DesignDocument | null;
  history: DesignDocument[];
  historyIndex: number;
  loadDocument: (doc: DesignDocument) => void;
  updateDocument: (updater: (draft: DesignDocument) => void) => void;
  undo: () => void;
  redo: () => void;
}

export const useDocumentStore = create<DocumentState>((set) => ({
  document: null,
  history: [],
  historyIndex: -1,

  loadDocument: (doc) => set({
    document: doc,
    history: [doc],
    historyIndex: 0
  }),

  updateDocument: (updater) => set((state) => {
    if (!state.document) return state;

    // Apply updater using immer to create next document state
    const nextDoc = produce(state.document, updater);
    
    // We only keep history up to current index, truncating any future paths if we were undone
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
      return {
        document: state.history[nextIndex],
        historyIndex: nextIndex
      };
    }
    return state;
  }),

  redo: () => set((state) => {
    if (state.historyIndex < state.history.length - 1) {
      const nextIndex = state.historyIndex + 1;
      return {
        document: state.history[nextIndex],
        historyIndex: nextIndex
      };
    }
    return state;
  })
}));
