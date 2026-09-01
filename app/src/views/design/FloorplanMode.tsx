import React, { useState, useRef } from 'react';
import { useDocumentStore } from '../../store/documentStore';

function DraggableDevice({ device, geometry, updateGeometry }: { device: any, geometry: any, updateGeometry: (id: string, pos: {x: number, y: number}) => void }) {
  const [isDragging, setIsDragging] = useState(false);
  const pos = geometry?.position || { x: 0, y: 0 };
  const ref = useRef<HTMLDivElement>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    e.stopPropagation();
    const newX = pos.x + e.movementX;
    const newY = pos.y + e.movementY;
    updateGeometry(device.id, { x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.currentTarget.releasePointerCapture(e.pointerId);
    setIsDragging(false);
  };

  return (
    <div
      ref={ref}
      title={device.name}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        position: 'absolute',
        left: pos.x,
        top: pos.y,
        width: 32,
        height: 32,
        transform: 'translate(-50%, -50%)',
        background: 'var(--copper-primary)',
        color: 'var(--copper-on-primary)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        boxShadow: 'var(--md-sys-elevation-level-1)',
        zIndex: isDragging ? 10 : 1,
        fontSize: '0.75rem',
        fontWeight: 'bold'
      }}
    >
      {device.name?.substring(0, 2) || 'D'}
    </div>
  );
}

export function FloorplanMode() {
  const document = useDocumentStore(state => state.document);
  const updateDocument = useDocumentStore(state => state.updateDocument);

  if (!document) return null;

  const handleUpdateGeometry = (deviceId: string, position: {x: number, y: number}) => {
    updateDocument((draft: any) => {
      if (!draft.geometry) draft.geometry = {};
      if (!draft.geometry[deviceId]) draft.geometry[deviceId] = {};
      draft.geometry[deviceId].position = position;
    });
  };

  const locations = document.locations || [];
  const devices = document.devices || [];

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'auto', background: 'var(--copper-surface-container-lowest)' }}>
      {/* Rooms Layer */}
      {locations.map(loc => {
        const layout = (loc as any).layout || { x: 0, y: 0, width: 400, height: 300 };
        return (
          <div
            key={loc.id}
            style={{
              position: 'absolute',
              left: layout.x,
              top: layout.y,
              width: layout.width,
              height: layout.height,
              border: '2px solid var(--copper-outline)',
              background: 'var(--copper-surface-container)',
              opacity: 0.8
            }}
          >
            <div style={{ padding: '8px', fontWeight: 'bold', color: 'var(--copper-on-surface)', userSelect: 'none' }}>
              {loc.name || loc.id}
            </div>
          </div>
        );
      })}

      {/* Devices Layer */}
      {devices.map(device => (
        <DraggableDevice
          key={device.id}
          device={device}
          geometry={document.geometry?.[device.id]}
          updateGeometry={handleUpdateGeometry}
        />
      ))}
    </div>
  );
}
