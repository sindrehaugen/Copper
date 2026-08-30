import React from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { useDocumentStore } from '../../store';
import { RoomVolume } from './RoomVolume';
import { RackVolume } from './RackVolume';

import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

function ExportButton() {
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
        onClick={handleExport}
        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm shadow-md"
      >
        Download glTF
      </button>
    </Html>
  );
}

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
        <ExportButton />
        
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




