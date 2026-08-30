import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWiringInteraction } from './CanvasWiringInteraction';
import { useDocumentStore } from '../../store/documentStore';
import type { DesignDocument, Device, Cable } from '../../model/schema';
import type { Connection } from '@xyflow/react';

describe('useWiringInteraction hook', () => {
  const sampleDevice1: Device = {
    id: 'device-1',
    deviceTypeId: 'dt-1',
    siteId: 'site-1',
    status: 'active',
    name: 'Device 1',
    interfaces: [
      { id: 'p-1', name: 'eth0', type: '1000base-t', signalClassId: 'ETHERNET' },
    ],
  };

  const sampleDevice2: Device = {
    id: 'device-2',
    deviceTypeId: 'dt-2',
    siteId: 'site-1',
    status: 'active',
    name: 'Device 2',
    interfaces: [
      { id: 'p-2', name: 'eth1', type: '1000base-t', signalClassId: 'ETHERNET' },
    ],
  };

  const sampleDoc: DesignDocument = {
    schemaVersion: 1,
    designLabel: 'Wiring Test',
    devices: [sampleDevice1, sampleDevice2],
    cables: [],
    sites: [], locations: [], racks: [], deviceTypes: [], signalClasses: [],
  };

  beforeEach(() => {
    useDocumentStore.setState({ document: sampleDoc, history: [sampleDoc], historyIndex: 0 });
  });

  it('updates documentStore on valid connection drop', () => {
    const { result } = renderHook(() => useWiringInteraction());

    const connection: Connection = {
      source: 'device-1',
      sourceHandle: 'p-1',
      target: 'device-2',
      targetHandle: 'p-2',
    };

    act(() => {
      result.current.onConnect(connection);
    });

    const docStore = useDocumentStore.getState();
    expect(docStore.document?.cables).toHaveLength(1);

    const newCable = docStore.document?.cables[0] as Cable;
    expect(newCable.status).toBe('planned');
    expect(newCable.terminations[0].deviceId).toBe('device-1');
    expect(newCable.terminations[0].portRef.id).toBe('p-1');
    expect(newCable.terminations[1].deviceId).toBe('device-2');
    expect(newCable.terminations[1].portRef.id).toBe('p-2');
  });

  it('always returns true for isValidConnection to allow incompatible wiring per B29', () => {
    const { result } = renderHook(() => useWiringInteraction());
    expect(result.current.isValidConnection()).toBe(true);
  });
});
