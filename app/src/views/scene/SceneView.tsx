import { useTranslation } from 'react-i18next';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { useDocumentStore } from '../../store';
import { RoomVolume } from './RoomVolume';
import { RackVolume } from './RackVolume';
import { CoverageOverlay } from './CoverageOverlay';

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
        {t('common.downloadGltf')}
      </button>
    </Html>
  );
}

export function SceneView() {
  

  const document = useDocumentStore((state) => state.document);
  const locations = document?.locations;
  const racks = document?.racks;
  const devices = document?.devices;

  return (
    <div style={{ width: '100%', height: '100vh', background: 'var(--md-sys-color-surface-container-lowest)' }}>
      <Canvas camera={{ position: [5, 5, 5] }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1} />
        
        <OrbitControls />
        <ExportButton />
        
        {locations?.map((loc) => (
          <RoomVolume key={loc.id} location={loc} />
        ))}
        
        <CoverageOverlay />

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

        {/* Free-floating devices with geometry (B108 floorplan sync) */}
        {devices?.filter(d => !d.rackId && document?.geometry?.[d.id]).map(device => {
          const pos = document?.geometry?.[device.id]?.position;
          if (!pos) return null;
          // Scale from floorplan pixels to 3D units (same scale as RoomVolume: 0.01)
          const scale = 0.01;
          const x = pos.x * scale;
          const z = pos.y * scale;
          const h = 1.0; // Place it a bit above ground or at specific Z if known

          return (
            <group key={device.id} position={[x, h, z]}>
              <mesh>
                <boxGeometry args={[0.3, 0.3, 0.3]} />
                <meshStandardMaterial color='var(--copper-primary)' />
              </mesh>
              <Html distanceFactor={10} position={[0, 0.4, 0]} transform>
                <div style={{ background: 'var(--copper-surface)', color: 'var(--copper-on-surface)', padding: '2px 4px', borderRadius: 4, fontSize: 10, whiteSpace: 'nowrap' }}>
                  {device.name}
                </div>
              </Html>
            </group>
          );
        })}
      </Canvas>
    </div>
  );
}




