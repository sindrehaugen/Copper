import React from 'react';
import { useTranslation } from 'react-i18next';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { useDocumentStore } from '../../store/documentStore';
import { RackVolume } from './RackVolume';
import { CoverageOverlay } from './CoverageOverlay';
import { TelemetryOverlay3D } from './TelemetryOverlay3D';
import type { TelemetryStreamItem } from '../design/TelemetryOverlay2D';
import { PITCH } from '../../model/geometry';
import type { Location, Device, Zone } from '../../model/schema';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

export const GRID_PITCH = PITCH || 24;
export const PIXELS_PER_METER = 40;
export const GRID_TO_METERS = GRID_PITCH / PIXELS_PER_METER; // 0.6 meters per grid unit

function ExportButton() {
  const { t } = useTranslation();
  const { scene } = useThree();

  const handleExport = () => {
    const exporter = new GLTFExporter();
    exporter.parse(
      scene,
      (gltf) => {
        const output = JSON.stringify(gltf, null, 2);
        const blob = new Blob([output], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.style.display = 'none';
        link.href = url;
        link.download = 'scene.gltf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      },
      (error) => {
        console.error('An error happened during glTF export:', error);
      }
    );
  };

  return (
    <Html style={{ position: 'absolute', top: 10, left: 10 }}>
      <button
        type="button"
        onClick={handleExport}
        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm shadow-md"
      >
        {t('common.downloadGltf')}
      </button>
    </Html>
  );
}

interface RoomNodeProps {
  location: Location;
}

function RoomNode({ location }: RoomNodeProps) {
  const roomMeta = (location as any).meta?.copper?.room;
  const layout = (location as any).layout;

  const w = roomMeta?.w ?? (layout ? layout.width / PIXELS_PER_METER : 10);
  const d = roomMeta?.d ?? (layout ? layout.height / PIXELS_PER_METER : 8);
  const h = roomMeta?.h ?? 3;

  const posX = layout?.x ? layout.x / PIXELS_PER_METER : 0;
  const posZ = layout?.y ? layout.y / PIXELS_PER_METER : 0;

  const centerX = posX + w / 2;
  const centerY = h / 2;
  const centerZ = posZ + d / 2;

  const dimensions = [w, h, d];
  const position = [centerX, centerY, centerZ];
  const roomLabel = `${location.name || location.id} (${w}m × ${d}m × ${h}m)`;

  return (
    <group
      key={location.id}
      data-testid={`room-${location.id}`}
      data-position={JSON.stringify(position)}
      data-dimensions={JSON.stringify(dimensions)}
      position={[centerX, centerY, centerZ]}
      name={location.name || location.id}
    >
      <mesh>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial
          color="var(--md-sys-color-secondary-container)"
          opacity={0.15}
          transparent
          depthWrite={false}
        />
      </mesh>
      <Html position={[0, h / 2 + 0.3, 0]} center transform distanceFactor={15}>
        <div
          style={{
            background: 'var(--copper-surface)',
            color: 'var(--copper-on-surface)',
            padding: '2px 6px',
            borderRadius: 4,
            fontSize: 11,
            fontWeight: 600,
            border: '1px solid var(--copper-outline)',
            whiteSpace: 'nowrap',
            userSelect: 'none'
          }}
        >
          {roomLabel}
        </div>
      </Html>
    </group>
  );
}

interface DeviceNodeProps {
  device: Device;
  isSelected: boolean;
  gridPos: { x: number; y: number; z?: number | undefined };
  onSelect: (e: React.MouseEvent) => void;
}

function DeviceNode({ device, isSelected, gridPos, onSelect }: DeviceNodeProps) {
  // Convert grid units (y-down) to 3D space (origin top-left floorplan maps to +X right, +Z down)
  const x = gridPos.x * GRID_TO_METERS;
  const z = gridPos.y * GRID_TO_METERS;
  const y = gridPos.z !== undefined ? gridPos.z : 1.0;
  const position = [x, y, z];
  const deviceLabel = device.name || device.id;

  return (
    <group
      key={device.id}
      data-testid={`device-${device.id}`}
      data-position={JSON.stringify(position)}
      position={[x, y, z]}
      name={device.name || device.id}
      onClick={onSelect}
    >
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.4, 0.2, 0.4]} />
        <meshStandardMaterial
          color={isSelected ? 'var(--copper-tertiary)' : 'var(--copper-primary)'}
        />
      </mesh>
      <Html distanceFactor={10} position={[0, 0.35, 0]} transform center>
        <div
          style={{
            background: 'var(--copper-surface)',
            color: 'var(--copper-on-surface)',
            padding: '2px 6px',
            borderRadius: 4,
            fontSize: 10,
            whiteSpace: 'nowrap',
            border: isSelected ? '2px solid var(--copper-tertiary)' : '1px solid var(--copper-outline)',
            boxShadow: 'var(--md-sys-elevation-level-1)',
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          {deviceLabel}
        </div>
      </Html>
    </group>
  );
}

export interface SceneViewProps {
  telemetryData?: TelemetryStreamItem[] | undefined;
  showTelemetry?: boolean | undefined;
}

export function SceneView({ telemetryData, showTelemetry = true }: SceneViewProps = {}) {
  const document = useDocumentStore((state) => state.document);
  const selectedIds = useDocumentStore((state) => state.selectedIds) || [];
  const setSelectedIds = useDocumentStore((state) => state.setSelectedIds);

  const locations = document?.locations || [];
  const racks = document?.racks || [];
  const devices = document?.devices || [];
  const zones = document?.zones || [];
  const geometry = document?.geometry || {};

  return (
    <div style={{ width: '100%', height: '100vh', background: 'var(--md-sys-color-surface-container-lowest)' }}>
      <Canvas
        camera={{ position: [5, 5, 5] }}
        onPointerMissed={() => setSelectedIds([])}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1} />

        <OrbitControls />
        <ExportButton />

        {/* Room volumes from meta.copper.room */}
        {locations.map((loc) => (
          <RoomNode key={loc.id} location={loc} />
        ))}

        <CoverageOverlay />
        <TelemetryOverlay3D telemetryData={telemetryData} visible={showTelemetry} />

        {/* Zones */}
        {zones.map((zone: Zone) => {
          const geo = geometry[zone.id];
          if (!geo || !geo.position || !geo.size) return null;
          const zoneX = geo.position.x * GRID_TO_METERS;
          const zoneZ = geo.position.y * GRID_TO_METERS;
          const zoneW = geo.size.width * GRID_TO_METERS;
          const zoneD = geo.size.height * GRID_TO_METERS;
          let colorVar = 'var(--copper-zone-viewer)';
          if (zone.type === 'participant') colorVar = 'var(--copper-zone-participant)';
          if (zone.type === 'task') colorVar = 'var(--copper-zone-task)';

          return (
            <group
              key={zone.id}
              position={[zoneX + zoneW / 2, 0.02, zoneZ + zoneD / 2]}
              name={zone.name || zone.id}
            >
              <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[zoneW, zoneD]} />
                <meshStandardMaterial color={colorVar} opacity={0.3} transparent depthWrite={false} />
              </mesh>
            </group>
          );
        })}

        {/* Racks */}
        {racks.map((rack, i) => {
          const rackDevices = devices.filter((d) => d.rackId === rack.id);
          const rackGeo = geometry[rack.id];
          const rackPos: [number, number, number] = rackGeo?.position
            ? [rackGeo.position.x * GRID_TO_METERS, 0, rackGeo.position.y * GRID_TO_METERS]
            : [i * 2, 0, 0];

          return (
            <RackVolume
              key={rack.id}
              rack={rack}
              devices={rackDevices}
              position={rackPos}
            />
          );
        })}

        {/* Devices positioned by live document geometry (shared with FloorplanMode) */}
        {devices
          .filter((d) => !d.rackId)
          .map((device) => {
            const geo = geometry[device.id];
            const gridPos = geo?.position || { x: 0, y: 0 };
            const isSelected = selectedIds.includes(device.id);

            return (
              <DeviceNode
                key={device.id}
                device={device}
                isSelected={isSelected}
                gridPos={gridPos}
                onSelect={(e) => {
                  e.stopPropagation();
                  if (e.shiftKey || e.metaKey || e.ctrlKey) {
                    setSelectedIds(
                      isSelected
                        ? selectedIds.filter((id) => id !== device.id)
                        : [...selectedIds, device.id]
                    );
                  } else {
                    setSelectedIds([device.id]);
                  }
                }}
              />
            );
          })}
      </Canvas>
    </div>
  );
}
