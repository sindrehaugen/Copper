import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, cleanup, act } from '@testing-library/react';
import { Canvas } from '@react-three/fiber';
import { useDocumentStore } from '../../store/documentStore';
import { TelemetryOverlay2D } from './TelemetryOverlay2D';
import { TelemetryOverlay3D } from '../scene/TelemetryOverlay3D';
import { FloorplanMode } from './FloorplanMode';
import { SceneView } from '../scene/SceneView';

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

describe('TelemetryOverlay Tests (Batch 160 / SP.W6)', () => {
  beforeEach(() => {
    useDocumentStore.setState({
      document: {
        schemaVersion: 1,
        designLabel: 'Telemetry Spatial Test Design',
        revision: 'rev-telemetry-001',
        sites: [],
        locations: [
          {
            id: 'loc-1',
            name: 'Conference Room 1',
            slug: 'conference-room-1',
            siteId: 'site-1',
            meta: {
              copper: {
                room: { w: 10, d: 8, h: 3 }
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
            id: 'sensor-temp-1',
            name: 'Temp Sensor 1',
            deviceTypeId: 'dt-temp',
            siteId: 'site-1',
            status: 'active'
          },
          {
            id: 'sensor-occ-1',
            name: 'PIR Sensor 1',
            deviceTypeId: 'dt-pir',
            siteId: 'site-1',
            status: 'active'
          },
          {
            id: 'sensor-db-1',
            name: 'SPL Mic 1',
            deviceTypeId: 'dt-spl',
            siteId: 'site-1',
            status: 'active'
          }
        ],
        geometry: {
          'sensor-temp-1': {
            position: { x: 5, y: 5 }
          },
          'sensor-occ-1': {
            position: { x: 10, y: 15 }
          },
          'sensor-db-1': {
            position: { x: 20, y: 10 }
          }
        },
        meta: {
          telemetry: [
            {
              deviceId: 'sensor-temp-1',
              metric: 'temperature',
              value: 28.5,
              unit: '°C',
              radius: 3.0,
              status: 'warning'
            },
            {
              deviceId: 'sensor-occ-1',
              metric: 'occupancy',
              value: 6,
              unit: 'persons',
              radius: 4.0,
              status: 'normal'
            },
            {
              deviceId: 'sensor-db-1',
              metric: 'decibel',
              value: 78,
              unit: 'dB',
              radius: 5.0,
              status: 'normal'
            }
          ]
        }
      } as any,
      selectedIds: []
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('proves TelemetryOverlay2D correctly renders 2D SVG shapes positioned according to sensor coordinates and sizes based on mock stream data', () => {
    render(<TelemetryOverlay2D />);

    // SVG container should be present
    const overlay = screen.getByTestId('telemetry-overlay-2d');
    expect(overlay).toBeDefined();

    // 1. Temperature Sensor:
    // gridPos = (5, 5). With GRID_PITCH = 24:
    // cx = 5 * 24 = 120, cy = 5 * 24 = 120.
    // radius = 3.0m. With PIXELS_PER_METER = 40: radiusPx = 3 * 40 = 120.
    const tempGroup = screen.getByTestId('telemetry-2d-sensor-temp-1');
    expect(tempGroup).toBeDefined();
    expect(tempGroup.getAttribute('data-x')).toBe('120');
    expect(tempGroup.getAttribute('data-y')).toBe('120');
    expect(tempGroup.getAttribute('data-radius')).toBe('120');
    expect(tempGroup.getAttribute('data-metric')).toBe('temperature');
    expect(screen.getByText(/28\.5\s*°C/i)).toBeDefined();

    // 2. Occupancy Sensor:
    // gridPos = (10, 15). With GRID_PITCH = 24:
    // cx = 10 * 24 = 240, cy = 15 * 24 = 360.
    // radius = 4.0m. radiusPx = 4 * 40 = 160.
    const occGroup = screen.getByTestId('telemetry-2d-sensor-occ-1');
    expect(occGroup).toBeDefined();
    expect(occGroup.getAttribute('data-x')).toBe('240');
    expect(occGroup.getAttribute('data-y')).toBe('360');
    expect(occGroup.getAttribute('data-radius')).toBe('160');
    expect(occGroup.getAttribute('data-metric')).toBe('occupancy');
    expect(screen.getByText(/6\s*persons/i)).toBeDefined();

    // 3. Decibel Sensor:
    // gridPos = (20, 10). With GRID_PITCH = 24:
    // cx = 20 * 24 = 480, cy = 10 * 24 = 240.
    // radius = 5.0m. radiusPx = 5 * 40 = 200.
    const dbGroup = screen.getByTestId('telemetry-2d-sensor-db-1');
    expect(dbGroup).toBeDefined();
    expect(dbGroup.getAttribute('data-x')).toBe('480');
    expect(dbGroup.getAttribute('data-y')).toBe('240');
    expect(dbGroup.getAttribute('data-radius')).toBe('200');
    expect(dbGroup.getAttribute('data-metric')).toBe('decibel');
    expect(screen.getByText(/78\s*dB/i)).toBeDefined();
  });

  it('proves TelemetryOverlay3D correctly renders 3D objects mapping the same telemetry data to Contract-Y 3D metric coordinates', () => {
    render(
      <Canvas>
        <TelemetryOverlay3D />
      </Canvas>
    );

    const overlay3D = screen.getByTestId('telemetry-overlay-3d');
    expect(overlay3D).toBeDefined();

    // 1. Temperature Sensor:
    // gridPos = (5, 5). GRID_TO_METERS = 24 / 40 = 0.6 m/grid.
    // 3D position = [x, y, z] = [5 * 0.6, 1.0, 5 * 0.6] = [3, 1, 3].
    // Metric radius = 3.0 m.
    const temp3D = screen.getByTestId('telemetry-3d-sensor-temp-1');
    expect(temp3D).toBeDefined();
    expect(temp3D.getAttribute('data-position')).toBe(JSON.stringify([3, 1, 3]));
    expect(temp3D.getAttribute('data-radius')).toBe('3');
    expect(temp3D.getAttribute('data-metric')).toBe('temperature');

    // 2. Occupancy Sensor:
    // gridPos = (10, 15).
    // 3D position = [10 * 0.6, 1.0, 15 * 0.6] = [6, 1, 9].
    // Metric radius = 4.0 m.
    const occ3D = screen.getByTestId('telemetry-3d-sensor-occ-1');
    expect(occ3D).toBeDefined();
    expect(occ3D.getAttribute('data-position')).toBe(JSON.stringify([6, 1, 9]));
    expect(occ3D.getAttribute('data-radius')).toBe('4');
    expect(occ3D.getAttribute('data-metric')).toBe('occupancy');

    // 3. Decibel Sensor:
    // gridPos = (20, 10).
    // 3D position = [20 * 0.6, 1.0, 10 * 0.6] = [12, 1, 6].
    // Metric radius = 5.0 m.
    const db3D = screen.getByTestId('telemetry-3d-sensor-db-1');
    expect(db3D).toBeDefined();
    expect(db3D.getAttribute('data-position')).toBe(JSON.stringify([12, 1, 6]));
    expect(db3D.getAttribute('data-radius')).toBe('5');
    expect(db3D.getAttribute('data-metric')).toBe('decibel');
  });

  it('proves FloorplanMode mounts TelemetryOverlay2D and updates reactively when telemetry stream changes', () => {
    render(<FloorplanMode />);

    expect(screen.getByTestId('telemetry-overlay-2d')).toBeDefined();
    expect(screen.getByTestId('telemetry-2d-sensor-temp-1')).toBeDefined();

    // Stream live update with higher temp and warning status
    act(() => {
      useDocumentStore.getState().updateDocument((draft: any) => {
        if (!draft.meta) draft.meta = {};
        draft.meta.telemetry = [
          {
            deviceId: 'sensor-temp-1',
            metric: 'temperature',
            value: 34.2,
            unit: '°C',
            radius: 3.5,
            status: 'critical'
          }
        ];
      });
    });

    expect(screen.getByText(/34\.2\s*°C/i)).toBeDefined();
    const updatedTemp = screen.getByTestId('telemetry-2d-sensor-temp-1');
    // 3.5m * 40 px/m = 140px
    expect(updatedTemp.getAttribute('data-radius')).toBe('140');
  });

  it('proves SceneView mounts TelemetryOverlay3D and updates coordinates reactively when geometry moves', () => {
    render(<SceneView />);

    expect(screen.getByTestId('telemetry-overlay-3d')).toBeDefined();
    const temp3D = screen.getByTestId('telemetry-3d-sensor-temp-1');
    expect(temp3D.getAttribute('data-position')).toBe(JSON.stringify([3, 1, 3]));

    // Move sensor device from (5, 5) to (15, 20)
    act(() => {
      useDocumentStore.getState().updateDocument((draft: any) => {
        if (!draft.geometry) draft.geometry = {};
        draft.geometry['sensor-temp-1'] = { position: { x: 15, y: 20 } };
      });
    });

    // 3D position = [15 * 0.6, 1.0, 20 * 0.6] = [9, 1, 12]
    const movedTemp3D = screen.getByTestId('telemetry-3d-sensor-temp-1');
    expect(movedTemp3D.getAttribute('data-position')).toBe(JSON.stringify([9, 1, 12]));
  });
});
