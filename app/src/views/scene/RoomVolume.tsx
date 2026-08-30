import React from 'react';
import type { Location } from '../../model/schema';
interface LayoutData { x: number; y: number; width: number; height: number; }

interface RoomVolumeProps {
  location: Location & { layout?: LayoutData };
}

export function RoomVolume({ location }: RoomVolumeProps) {
  const layout = location.layout ?? { x: 0, y: 0, width: 400, height: 300 };
  
  const scale = 0.01;
  const w = layout.width * scale;
  const d = layout.height * scale;
  const h = 3;

  const x = layout.x * scale + w / 2;
  const z = layout.y * scale + d / 2;

  return (
    <group position={[x, h / 2, z]} name={location.name || location.id}>
      <mesh>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color="#88aaff" opacity={0.2} transparent depthWrite={false} />
      </mesh>
    </group>
  );
}



