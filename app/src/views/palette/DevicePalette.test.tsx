// @ts-nocheck
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DevicePalette } from './DevicePalette';
import { useDocumentStore } from '../../store/documentStore';
import type { DesignDocument } from '../../model/schema';

// Mock crypto.randomUUID
vi.stubGlobal('crypto', {
  randomUUID: () => '12345678-1234-1234-1234-123456789abc'
});

describe('DevicePalette', () => {
  afterEach(cleanup);
  beforeEach(() => {
    useDocumentStore.setState({ document: null, history: [], historyIndex: -1 });
  });

  it('renders empty state when no document', () => {
    render(<DevicePalette />);
    expect(screen.getByTestId('device-palette-empty')).toBeDefined();
  });

  it('renders device types and adds a device on click', () => {
    const mockDoc: DesignDocument = {
      schemaVersion: 1,
      designLabel: 'Test Design',
      sites: [{ id: 'site-1', name: 'Site 1' }],
      locations: [],
      racks: [],
      deviceTypes: [
        {
          id: 'dt-1',
          manufacturer: 'Cisco',
          model: 'Switch-1',
          slug: 'cisco-switch-1',
          uHeight: 1,
          isFullDepth: true
        }
      ],
      devices: [],
      cables: [],
      signalClasses: []
    };

    useDocumentStore.getState().loadDocument(mockDoc);

    render(<DevicePalette />);
    
    // Check if device type is rendered
    expect(screen.getByText(/Cisco/)).toBeDefined();
    expect(screen.getByText(/Switch-1/)).toBeDefined();

    // Click add
    const addButton = screen.getByTestId('add-device-dt-1');
    fireEvent.click(addButton);

    // Verify store was updated
    const state = useDocumentStore.getState();
    expect(state.document?.devices.length).toBe(1);
    expect(state.document?.devices[0].deviceTypeId).toBe('dt-1');
    expect(state.document?.devices[0].id).toBe('12345678-1234-1234-1234-123456789abc');
    expect(state.document?.devices[0].siteId).toBe('site-1');
  });

  it('filters device types based on search', () => {
    const mockDoc: DesignDocument = {
      schemaVersion: 1,
      designLabel: 'Test Design',
      sites: [],
      locations: [],
      racks: [],
      deviceTypes: [
        {
          id: 'dt-1',
          manufacturer: 'Cisco',
          model: 'Switch-1',
          slug: 'cisco-switch-1',
          uHeight: 1,
          isFullDepth: true
        },
        {
          id: 'dt-2',
          manufacturer: 'Juniper',
          model: 'Router-2',
          slug: 'juniper-router-2',
          uHeight: 2,
          isFullDepth: false
        }
      ],
      devices: [],
      cables: [],
      signalClasses: []
    };

    useDocumentStore.getState().loadDocument(mockDoc);

    render(<DevicePalette />);
    
    expect(screen.getByText(/Cisco/)).toBeDefined();
    expect(screen.getByText(/Juniper/)).toBeDefined();

    const searchInput = screen.getByTestId('device-palette-search');
    fireEvent.change(searchInput, { target: { value: 'cisco' } });

    expect(screen.getByText('Cisco')).toBeDefined();
    expect(screen.queryByText('Juniper')).toBeNull();
  });
});
