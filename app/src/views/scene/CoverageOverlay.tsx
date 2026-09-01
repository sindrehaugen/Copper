import { useDocumentStore } from '../../store/documentStore';
import { useMemo } from 'react';
import { computeRoomCoverage, SpeakerSource, Point3D } from '@copper/acoustics';

export function CoverageOverlay() {
  const document = useDocumentStore(state => state.document);

  const coverageData = useMemo(() => {
    if (!document) return [];

    // Map the devices with speaker heuristics to sources
    const speakers: SpeakerSource[] = [];
    document.devices.forEach(dev => {
      const dt = document.deviceTypes.find(d => d.id === dev.deviceTypeId);
      if (dt?.customFields?.acoustics?.device_class === 'speaker') {
        // Just mock positions for now since geometry is not natively in document yet
        speakers.push({
          position: { x: 10, y: 10, z: 3 },
          sensitivity1W1m: 90,
          directivityQ: 4,
          electricalPowerW: 10
        });
      }
    });

    if (speakers.length === 0) return [];

    // Generic room for overlay calculation
    const roomDim = { l: 20, w: 20, h: 4 };

    // Generate a grid of eval points
    const evalPoints: Point3D[] = [];
    for (let x = 0; x <= roomDim.w; x += 2) {
      for (let y = 0; y <= roomDim.l; y += 2) {
        evalPoints.push({ x, y, z: 1.2 });
      }
    }

    return evalPoints.map((pt) => {
      const res = computeRoomCoverage({
        depth: roomDim.l, frontWidth: roomDim.w, rearWidth: roomDim.w,
        floorFrontZ: 0, floorRearZ: 0, ceilingFrontZ: roomDim.h, ceilingRearZ: roomDim.h,
        absorption: 0.1
      }, speakers, [pt])[0]!;
      return { pt, res };
    });
  }, [document]);

  if (!coverageData.length) return null;

  return (
    <group>
      {coverageData.map((data, i) => {
        // Color based on SPL
        const colorVal = Math.max(0, Math.min(1, (data.res.totalSpl - 70) / 40));
        const r = Math.floor(255 * colorVal);
        const b = Math.floor(255 * (1 - colorVal));
        return (
          <mesh key={i} position={[data.pt.x, 1.2, data.pt.y]}>
            <boxGeometry args={[1.8, 0.1, 1.8]} />
            <meshBasicMaterial color={`rgb(${r},0,${b})`} opacity={0.5} transparent />
          </mesh>
        );
      })}
    </group>
  );
}
