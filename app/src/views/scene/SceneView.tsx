import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useDocumentStore } from '../../store';
import { RoomVolume } from './RoomVolume';
import { RackVolume } from './RackVolume';

export function SceneView() {
  const locations = useDocumentStore((state) => state.document?.locations);
  const racks = useDocumentStore((state) => state.document?.racks);
  const devices = useDocumentStore((state) => state.document?.devices);

  return (
    <div style={{ width: '100%', height: '100vh', background: '#111' }}>
      <Canvas camera={{ position: [5, 5, 5] }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1} />
        
        <OrbitControls />
        
        {locations?.map((loc) => (
          <RoomVolume key={loc.id} location={loc} />
        ))}

        {racks?.map((rack, i) => {
          const rackDevices = devices?.filter((d) => d.rackId === rack.id) ?? [];
          return (
            <RackVolume
              key={rack.id}
              rack={rack}
              devices={rackDevices}
              position={[i * 2, 0, 0]}
            />
          );
        })}
      </Canvas>
    </div>
  );
}



