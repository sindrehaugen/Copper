import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, fireEvent, screen, cleanup } from '@testing-library/react';
import { FloorplanMode } from './FloorplanMode';
import { useDocumentStore } from '../../store/documentStore';

// Mock translation to return fallback default value if provided
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string, def?: string) => def || key })
}));

describe('FloorplanMode', () => {
  beforeEach(() => {
    useDocumentStore.setState({
      document: {
        schemaVersion: 1,
        designLabel: 'Test Design',
        revision: 'rev-001',
        sites: [],
        locations: [],
        racks: [],
        deviceTypes: [],
        cables: [],
        signalClasses: [],
        zones: [],
        devices: [
          {
            id: 'dev-1',
            name: 'Speaker',
            deviceTypeId: 'dt-1',
            siteId: 'site-1',
            status: 'active'
          }
        ],
        geometry: {}
      },
      selectedIds: [],
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('calculates delta in grid units (y-down) and dispatches geometry update with expected_version for OCC', () => {
    const onSaveGeometry = vi.fn();
    useDocumentStore.setState({
      document: {
        schemaVersion: 1,
        designLabel: 'OCC Test Design',
        revision: 'rev-occ-123',
        sites: [],
        locations: [],
        racks: [],
        deviceTypes: [],
        cables: [],
        signalClasses: [],
        zones: [],
        devices: [
          {
            id: 'dev-1',
            name: 'Speaker',
            deviceTypeId: 'dt-1',
            siteId: 'site-1',
            status: 'active'
          }
        ],
        geometry: {
          'dev-1': {
            position: { x: 2, y: 3 }
          }
        }
      },
      selectedIds: [],
    });

    render(<FloorplanMode onSaveGeometry={onSaveGeometry} />);

    const device = screen.getByTitle('Speaker');
    device.setPointerCapture = vi.fn();
    device.releasePointerCapture = vi.fn();

    // Drag by +48px in X (+2 grid units) and +72px in Y (+3 grid units, y-down)
    fireEvent.pointerDown(device, { pointerId: 1, clientX: 100, clientY: 100 });
    fireEvent.pointerMove(device, { pointerId: 1, clientX: 148, clientY: 172 });
    fireEvent.pointerUp(device, { pointerId: 1, clientX: 148, clientY: 172 });

    // Verify delta in grid units (2 + 2 = 4, 3 + 3 = 6) and OCC expected_version round-tripping
    const { document } = useDocumentStore.getState();
    expect(document?.geometry?.['dev-1']?.position).toEqual({ x: 4, y: 6 });
    expect(onSaveGeometry).toHaveBeenCalledWith(expect.objectContaining({
      deviceId: 'dev-1',
      position: { x: 4, y: 6 },
      expected_version: 'rev-occ-123'
    }));
  });

  it('reads room dimensions from meta.copper.room and allows updating them', () => {
    useDocumentStore.setState({
      document: {
        schemaVersion: 1,
        designLabel: 'Room Test Design',
        revision: 'rev-room-1',
        sites: [],
        locations: [
          {
            id: 'loc-1',
            name: 'Boardroom A',
            slug: 'boardroom-a',
            siteId: 'site-1',
            meta: {
              copper: {
                room: {
                  w: 12.5,
                  d: 8.0,
                  h: 3.2
                }
              }
            }
          } as any
        ],
        racks: [],
        deviceTypes: [],
        cables: [],
        signalClasses: [],
        zones: [],
        devices: [],
        geometry: {}
      },
      selectedIds: [],
    });

    render(<FloorplanMode />);

    // Check room dimensions rendered from meta.copper.room
    expect(screen.getByText(/12\.5m × 8m/i)).toBeDefined();

    // Select room to open dimension editor
    const roomElement = screen.getByText('Boardroom A');
    fireEvent.click(roomElement);

    // Edit room dimensions
    const widthInput = screen.getByLabelText(/room width/i);
    const depthInput = screen.getByLabelText(/room depth/i);
    const heightInput = screen.getByLabelText(/room height/i);

    fireEvent.change(widthInput, { target: { value: '15' } });
    fireEvent.change(depthInput, { target: { value: '10' } });
    fireEvent.change(heightInput, { target: { value: '3.5' } });

    const saveBtn = screen.getByRole('button', { name: /save dimensions/i });
    fireEvent.click(saveBtn);

    // Verify stored in meta.copper.room
    const { document } = useDocumentStore.getState();
    const loc = document?.locations.find(l => l.id === 'loc-1') as any;
    expect(loc.meta.copper.room).toEqual({
      w: 15,
      d: 10,
      h: 3.5
    });
  });

  it('handles device selection on click and modifier keys', () => {
    render(<FloorplanMode />);

    const device = screen.getByTitle('Speaker');
    fireEvent.click(device);

    const { selectedIds } = useDocumentStore.getState();
    expect(selectedIds).toEqual(['dev-1']);
  });
});
