import { describe, it, expect, beforeEach } from 'vitest';
import { useDocumentStore } from './documentStore';
import type { DesignDocument } from '../model/schema';

describe('documentStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useDocumentStore.setState({
      document: null,
      history: [],
      historyIndex: -1
    });
  });

  const sampleDoc: DesignDocument = {
    schemaVersion: 1,
    designLabel: 'Initial',
    sites: [],
    locations: [],
    racks: [],
    deviceTypes: [],
    devices: [],
    cables: [],
    signalClasses: []
  };

  it('loads a document and resets history', () => {
    const store = useDocumentStore.getState();
    store.loadDocument(sampleDoc);

    const state = useDocumentStore.getState();
    expect(state.document).toEqual(sampleDoc);
    expect(state.history.length).toBe(1);
    expect(state.historyIndex).toBe(0);
  });

  it('updates document using immer-like updater and pushes to history', () => {
    useDocumentStore.getState().loadDocument(sampleDoc);
    
    useDocumentStore.getState().updateDocument((draft) => {
      draft.designLabel = 'Updated';
    });

    const state = useDocumentStore.getState();
    expect(state.document?.designLabel).toBe('Updated');
    expect(state.history.length).toBe(2);
    expect(state.historyIndex).toBe(1);
    expect(state.history[0].designLabel).toBe('Initial');
    expect(state.history[1].designLabel).toBe('Updated');
  });

  it('undoes and redoes changes', () => {
    useDocumentStore.getState().loadDocument(sampleDoc);
    
    useDocumentStore.getState().updateDocument((draft) => {
      draft.designLabel = 'Updated';
    });

    useDocumentStore.getState().undo();
    
    let state = useDocumentStore.getState();
    expect(state.document?.designLabel).toBe('Initial');
    expect(state.historyIndex).toBe(0);

    useDocumentStore.getState().redo();

    state = useDocumentStore.getState();
    expect(state.document?.designLabel).toBe('Updated');
    expect(state.historyIndex).toBe(1);
  });

  it('truncates forward history when updating after undo', () => {
    useDocumentStore.getState().loadDocument(sampleDoc);
    
    useDocumentStore.getState().updateDocument((draft) => {
      draft.designLabel = 'Updated 1';
    });

    useDocumentStore.getState().updateDocument((draft) => {
      draft.designLabel = 'Updated 2';
    });

    // We have Initial, Updated 1, Updated 2. Index is 2.
    useDocumentStore.getState().undo();
    // Index is 1, doc is Updated 1.

    useDocumentStore.getState().updateDocument((draft) => {
      draft.designLabel = 'Forked';
    });

    const state = useDocumentStore.getState();
    expect(state.document?.designLabel).toBe('Forked');
    expect(state.history.length).toBe(3); // Initial, Updated 1, Forked
    expect(state.historyIndex).toBe(2);
    expect(state.history[2].designLabel).toBe('Forked');
  });

  it('does nothing if undo or redo is out of bounds', () => {
    useDocumentStore.getState().loadDocument(sampleDoc);
    
    // Cannot undo past 0
    useDocumentStore.getState().undo();
    expect(useDocumentStore.getState().historyIndex).toBe(0);

    // Cannot redo past 0
    useDocumentStore.getState().redo();
    expect(useDocumentStore.getState().historyIndex).toBe(0);
  });
});
