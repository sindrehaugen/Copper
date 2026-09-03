import { Html } from '@react-three/drei';
import { useDocumentStore } from '../../store/documentStore';
import { PITCH } from '../../model/geometry';
import type { TelemetryStreamItem } from '../design/TelemetryOverlay2D';

export const GRID_PITCH = PITCH || 24;
export const PIXELS_PER_METER = 40;
export const GRID_TO_METERS = GRID_PITCH / PIXELS_PER_METER; // 0.6 meters per grid unit

export interface TelemetryOverlay3DProps {
  telemetryData?: TelemetryStreamItem[] | undefined;
  visible?: boolean | undefined;
}

function getMetric3DColor(item: TelemetryStreamItem): string {
  if (item.color) return item.color;

  switch (item.metric) {
    case 'temperature': {
      if (item.status === 'critical' || item.value >= 32) return 'var(--copper-error)';
      if (item.status === 'warning' || item.value >= 26) return 'var(--copper-tertiary)';
      return 'var(--copper-secondary)';
    }
    case 'occupancy':
      return 'var(--copper-secondary)';
    case 'decibel':
      return 'var(--copper-primary)';
    default:
      return 'var(--copper-outline)';
  }
}

export function TelemetryOverlay3D({ telemetryData, visible = true }: TelemetryOverlay3DProps = {}) {
  const document = useDocumentStore((state) => state.document);

  if (!visible || !document) return null;

  const stream: TelemetryStreamItem[] =
    telemetryData ||
    (document as any)?.meta?.telemetry ||
    (document as any)?.telemetry ||
    [];

  if (!stream || stream.length === 0) return null;

  const geometry = document.geometry || {};

  return (
    <group data-testid="telemetry-overlay-3d">
      {stream.map((item) => {
        const geo = geometry[item.deviceId];
        const gridPos = geo?.position || { x: 0, y: 0 };

        // Contract-Y coordinates:
        // gridPos.x * GRID_TO_METERS -> 3D X (m)
        // gridPos.y * GRID_TO_METERS -> 3D Z (m) (y-down in floorplan maps to +Z in 3D)
        // gridPos.z ?? 1.0           -> 3D Y (elevation)
        const x = gridPos.x * GRID_TO_METERS;
        const z = gridPos.y * GRID_TO_METERS;
        const y = gridPos.z !== undefined ? gridPos.z : 1.0;
        const position = [x, y, z];

        const radius = item.radius !== undefined ? item.radius : 3.0;
        const color = getMetric3DColor(item);
        const valueLabel = `${item.metric}: ${item.value} ${item.unit || ''}`.trim();

        return (
          <group
            key={item.deviceId}
            data-testid={`telemetry-3d-${item.deviceId}`}
            data-position={JSON.stringify(position)}
            data-radius={String(radius)}
            data-metric={item.metric}
            data-value={String(item.value)}
            position={[x, y, z]}
          >
            {item.metric === 'temperature' && (
              <>
                {/* Volumetric thermal bubble */}
                <mesh>
                  <sphereGeometry args={[radius, 16, 16]} />
                  <meshBasicMaterial
                    color={color}
                    opacity={0.2}
                    transparent
                    depthWrite={false}
                  />
                </mesh>
                {/* Floor heat projection */}
                <mesh position={[0, -y + 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <circleGeometry args={[radius, 32]} />
                  <meshBasicMaterial
                    color={color}
                    opacity={0.25}
                    transparent
                    depthWrite={false}
                  />
                </mesh>
              </>
            )}

            {item.metric === 'occupancy' && (
              <>
                {/* Volumetric detection cylinder */}
                <mesh>
                  <cylinderGeometry args={[radius, radius, 2, 16]} />
                  <meshBasicMaterial
                    color={color}
                    opacity={0.15}
                    transparent
                    depthWrite={false}
                  />
                </mesh>
                {/* Floor occupancy zone boundary */}
                <mesh position={[0, -y + 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <circleGeometry args={[radius, 32]} />
                  <meshBasicMaterial
                    color={color}
                    opacity={0.3}
                    transparent
                    depthWrite={false}
                  />
                </mesh>
              </>
            )}

            {item.metric === 'decibel' && (
              <>
                {/* Decibel wireframe sphere */}
                <mesh>
                  <sphereGeometry args={[radius, 16, 16]} />
                  <meshBasicMaterial
                    color={color}
                    opacity={0.2}
                    transparent
                    depthWrite={false}
                    wireframe
                  />
                </mesh>
                {/* Ground SPL contour ring */}
                <mesh position={[0, -y + 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <ringGeometry args={[radius * 0.95, radius, 32]} />
                  <meshBasicMaterial
                    color={color}
                    opacity={0.4}
                    transparent
                    depthWrite={false}
                  />
                </mesh>
              </>
            )}

            {item.metric !== 'temperature' &&
              item.metric !== 'occupancy' &&
              item.metric !== 'decibel' && (
                <mesh>
                  <sphereGeometry args={[radius, 16, 16]} />
                  <meshBasicMaterial
                    color={color}
                    opacity={0.2}
                    transparent
                    depthWrite={false}
                  />
                </mesh>
              )}

            {/* In-scene Label */}
            <Html position={[0, radius * 0.5 + 0.3, 0]} center transform distanceFactor={12}>
              <div
                style={{
                  background: 'var(--copper-surface)',
                  color: 'var(--copper-on-surface)',
                  padding: '2px 6px',
                  borderRadius: 4,
                  fontSize: 10,
                  fontWeight: 'bold',
                  border: `1px solid ${color}`,
                  whiteSpace: 'nowrap',
                  userSelect: 'none',
                  boxShadow: 'var(--md-sys-elevation-level-1)'
                }}
              >
                {valueLabel}
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
}
