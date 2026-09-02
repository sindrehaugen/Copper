import { useTranslation } from 'react-i18next';
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
      {device.name?.substring(0, 2) || device.id.substring(0, 2)}
    </div>
  );
}

export function FloorplanMode() {
  const { t } = useTranslation();

  const document = useDocumentStore(state => state.document);
  const updateDocument = useDocumentStore(state => state.updateDocument);
  const [mode, setMode] = useState<'select' | 'viewer' | 'participant' | 'task'>('select');
  const [drawingRect, setDrawingRect] = useState<{ startX: number, startY: number, endX: number, endY: number } | null>(null);

  if (!document) return null;

  const handleUpdateGeometry = (deviceId: string, position: {x: number, y: number}) => {
    if (mode !== 'select') return; // Don't drag if drawing
    updateDocument((draft: any) => {
      if (!draft.geometry) draft.geometry = {};
      if (!draft.geometry[deviceId]) draft.geometry[deviceId] = {};
      draft.geometry[deviceId].position = position;
    });
  };

  const handleBackgroundPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (mode === 'select') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setDrawingRect({ startX: x, startY: y, endX: x, endY: y });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleBackgroundPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drawingRect || mode === 'select') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setDrawingRect(prev => prev ? { ...prev, endX: x, endY: y } : null);
  };

  const handleBackgroundPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drawingRect || mode === 'select') return;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    
    const x = Math.min(drawingRect.startX, drawingRect.endX);
    const y = Math.min(drawingRect.startY, drawingRect.endY);
    const width = Math.abs(drawingRect.endX - drawingRect.startX);
    const height = Math.abs(drawingRect.endY - drawingRect.startY);
    
    setDrawingRect(null);
    setMode('select');

    if (width > 10 && height > 10) {
      updateDocument((draft: any) => {
        if (!draft.zones) draft.zones = [];
        if (!draft.geometry) draft.geometry = {};
        
        const zoneId = `zone-${crypto.randomUUID().substring(0, 8)}`;
        draft.zones.push({
          id: zoneId,
          name: `New ${mode} zone`,
          type: mode
        });
        
        draft.geometry[zoneId] = {
          position: { x, y },
          size: { width, height }
        };
      });
    }
  };

  const locations = document.locations || [];
  const devices = document.devices || [];
  const zones = document.zones || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '8px', borderBottom: '1px solid var(--md-sys-color-outline-variant)', background: 'var(--md-sys-color-surface)' }}>
        <button onClick={() => setMode('select')} style={{ fontWeight: mode === 'select' ? 'bold' : 'normal', marginRight: 8 }}>{t('common.selectMove')}</button>
        <button onClick={() => setMode('viewer')} style={{ fontWeight: mode === 'viewer' ? 'bold' : 'normal', marginRight: 8 }}>{t('common.addViewerZone')}</button>
        <button onClick={() => setMode('participant')} style={{ fontWeight: mode === 'participant' ? 'bold' : 'normal', marginRight: 8 }}>{t('common.addParticipantZone')}</button>
        <button onClick={() => setMode('task')} style={{ fontWeight: mode === 'task' ? 'bold' : 'normal', marginRight: 8 }}>{t('common.addTaskZone')}</button>
      </div>
      
      <div 
        style={{ position: 'relative', flex: 1, overflow: 'auto', background: 'var(--copper-surface-container-lowest)', cursor: mode === 'select' ? 'default' : 'crosshair' }}
        onPointerDown={handleBackgroundPointerDown}
        onPointerMove={handleBackgroundPointerMove}
        onPointerUp={handleBackgroundPointerUp}
      >
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
                opacity: 0.8,
                pointerEvents: 'none'
              }}
            >
              <div style={{ padding: '8px', fontWeight: 'bold', color: 'var(--copper-on-surface)' }}>
                {loc.name || loc.id}
              </div>
            </div>
          );
        })}

        {/* Zones Layer */}
        {zones.map(zone => {
          const geo = document.geometry?.[zone.id];
          if (!geo || !geo.position || !geo.size) return null;
          let color = 'rgba(0, 0, 255, 0.2)';
          if (zone.type === 'participant') color = 'rgba(0, 255, 0, 0.2)';
          if (zone.type === 'task') color = 'rgba(255, 165, 0, 0.2)';

          return (
            <div
              key={zone.id}
              style={{
                position: 'absolute',
                left: geo.position.x,
                top: geo.position.y,
                width: geo.size.width,
                height: geo.size.height,
                background: color,
                border: `1px solid ${color.replace('0.2', '0.8')}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none'
              }}
            >
              <span style={{ fontWeight: 'bold', color: '#333' }}>{zone.name}</span>
            </div>
          );
        })}

        {/* Drawing Rect */}
        {drawingRect && (
          <div style={{
            position: 'absolute',
            left: Math.min(drawingRect.startX, drawingRect.endX),
            top: Math.min(drawingRect.startY, drawingRect.endY),
            width: Math.abs(drawingRect.endX - drawingRect.startX),
            height: Math.abs(drawingRect.endY - drawingRect.startY),
            background: 'rgba(0, 150, 255, 0.3)',
            border: '1px dashed #0096ff',
            pointerEvents: 'none'
          }} />
        )}

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
    </div>
  );
}
