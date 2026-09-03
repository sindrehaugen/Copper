import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SceneView } from './SceneView';
import { useDocumentStore } from '../../store/documentStore';

// Mock translation
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string, def?: string) => def || key })
}));

// Mock GLTFExporter
vi.mock('three/examples/jsm/exporters/GLTFExporter.js', () => ({
  GLTFExporter: class { parse() {} }
}));

// Mock R3F Canvas and hooks to render children in test DOM with props preserved
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children, onPointerMissed, ...props }: any) => (
    <div
      role="button"
      tabIndex={0}
      data-testid="mock-canvas"
      onClick={onPointerMissed}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onPointerMissed?.(e);
      }}
      {...props}
    >
      {children}
    </div>
  ),
  useThree: () => ({ scene: {} }),
}));

vi.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid="mock-orbit-controls" />,
  Html: ({ children, position }: any) => (
    <div data-testid="mock-html" data-position={position ? JSON.stringify(position) : undefined}>
      {children}
    </div>
  ),
}));

describe('SceneView', () => {
  beforeEach(() => {
    useDocumentStore.setState({
      document: {
        schemaVersion: 1,
        designLabel: '3D Scene Test Design',
        revision: 'rev-3d-001',
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
                  w: 10,
                  d: 8,
                  h: 3
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
        devices: [
          {
            id: 'dev-1',
            name: 'Ceiling Mic',
            deviceTypeId: 'dt-mic',
            siteId: 'site-1',
            status: 'active'
          }
        ],
        geometry: {
          'dev-1': {
            position: { x: 5, y: 10 }
          }
        }
      },
      selectedIds: [],
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('renders objects corresponding to the geometry records and location bounds in the document store', () => {
    render(<SceneView />);

    expect(screen.getByTestId('mock-canvas')).toBeDefined();

    // Check device is rendered in the 3D scene
    const deviceElement = screen.getByText('Ceiling Mic');
    expect(deviceElement).toBeDefined();

    // Device group should be positioned converting grid units (5, 10) to 3D meters:
    // With GRID_PITCH = 24, PIXELS_PER_METER = 40 (0.6 m/grid): x = 5 * 0.6 = 3, z = 10 * 0.6 = 6, y = 1
    const deviceGroup = screen.getByTestId('device-dev-1');
    expect(deviceGroup).toBeDefined();
    expect(deviceGroup.getAttribute('data-position')).toBe(JSON.stringify([3, 1, 6]));

    // Check room volume representation with meta.copper.room dimensions (10m x 8m x 3m)
    const roomNode = screen.getByTestId('room-loc-1');
    expect(roomNode).toBeDefined();
    expect(roomNode.getAttribute('data-dimensions')).toBe(JSON.stringify([10, 3, 8]));
    expect(roomNode.getAttribute('data-position')).toBe(JSON.stringify([5, 1.5, 4]));
  });

  it('responds reactively to live geometry updates from the document store (e.g. 2D floorplan drag)', () => {
    render(<SceneView />);

    // Initial position: grid (5, 10) -> 3D (3, 1, 6)
    const deviceGroup = screen.getByTestId('device-dev-1');
    expect(deviceGroup.getAttribute('data-position')).toBe(JSON.stringify([3, 1, 6]));

    // Simulate 2D floorplan drag updating the document store geometry
    act(() => {
      useDocumentStore.getState().updateDocument((draft) => {
        if (!draft.geometry) draft.geometry = {};
        draft.geometry['dev-1'] = { position: { x: 10, y: 15 } };
      });
    });

    // 3D scene should immediately update: grid (10, 15) -> 3D (6, 1, 9)
    const updatedDeviceGroup = screen.getByTestId('device-dev-1');
    expect(updatedDeviceGroup.getAttribute('data-position')).toBe(JSON.stringify([6, 1, 9]));
  });

  it('handles device selection on click in 3D scene and clears selection on canvas miss', () => {
    render(<SceneView />);

    const deviceGroup = screen.getByTestId('device-dev-1');
    fireEvent.click(deviceGroup);

    expect(useDocumentStore.getState().selectedIds).toEqual(['dev-1']);

    // Canvas click clears selection
    const canvas = screen.getByTestId('mock-canvas');
    fireEvent.click(canvas);
    expect(useDocumentStore.getState().selectedIds).toEqual([]);
  });
});
