import React from 'react';
import type { Rack, Device } from '../../model/schema';

interface DeviceWithGeometry extends Device {
  geometry?: {
    rack_position?: number;
  };
}

interface RackVolumeProps {
  rack: Rack;
  devices: DeviceWithGeometry[];
  position?: [number, number, number];
}

export function RackVolume({ rack, devices, position = [0, 0, 0] }: RackVolumeProps) {
  const uHeightMeters = 0.04445;
  const rackHeight = rack.uHeight * uHeightMeters;
  const rackWidth = 0.6;
  const rackDepth = 1.0;

  return (
    <group position={position}>
      <mesh position={[0, rackHeight / 2, 0]}>
        <boxGeometry args={[rackWidth, rackHeight, rackDepth]} />
        <meshStandardMaterial color="#333333" wireframe />
      </mesh>
      
      {devices.map((device) => {
        const uPos = device.geometry?.rack_position ?? device.position ?? 1;
        const deviceHeightU = 1; 
        const deviceHeightM = deviceHeightU * uHeightMeters;
        const yPos = (uPos - 1) * uHeightMeters + deviceHeightM / 2;
        
        return (
          <mesh key={device.id} position={[0, yPos, 0]}>
            <boxGeometry args={[0.4826, deviceHeightM * 0.9, 0.8]} />
            <meshStandardMaterial color="#55aa55" />
          </mesh>
        );
      })}
    </group>
  );
}

