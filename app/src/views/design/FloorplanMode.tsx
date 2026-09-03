import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDocumentStore } from '../../store/documentStore';
import { PITCH } from '../../model/geometry';
import type { Device, Location, Zone } from '../../model/schema';

export const GRID_PITCH = PITCH || 24;
export const PIXELS_PER_METER = 40;

export interface GeometryUpdatePayload {
  deviceId: string;
  node_label?: string;
  position: { x: number; y: number; z?: number };
  expected_version?: string | number | undefined;
}

export interface FloorplanModeProps {
  onSaveGeometry?: (payload: GeometryUpdatePayload) => Promise<void> | void;
}

interface DraggableDeviceProps {
  device: Device;
  geometry?: {
    position?: { x: number; y: number; z?: number | undefined } | undefined;
    size?: { width: number; height: number; depth?: number | undefined } | undefined;
  } | undefined;
  updateGeometry: (id: string, gridPos: { x: number; y: number }) => void;
  onDragEnd: (id: string, gridPos: { x: number; y: number }) => void;
  isSelected?: boolean;
  onClick: (e: React.MouseEvent) => void;
}

function DraggableDevice({
  device,
  geometry,
  updateGeometry,
  onDragEnd,
  isSelected,
  onClick
}: DraggableDeviceProps) {
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ clientX: number; clientY: number; initPos: { x: number; y: number } } | null>(null);
  const currentGridPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);

  // Position is stored in grid units, origin top-left, y-down
  const gridPos = geometry?.position || { x: 0, y: 0 };
  currentGridPosRef.current = { x: gridPos.x, y: gridPos.y };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      initPos: { x: gridPos.x, y: gridPos.y }
    };
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStartRef.current) return;
    e.stopPropagation();

    // Calculate delta in pixels
    const deltaPixelX = e.clientX - dragStartRef.current.clientX;
    const deltaPixelY = e.clientY - dragStartRef.current.clientY;

    // Convert delta to grid units (y-down)
    const deltaGridX = Math.round(deltaPixelX / GRID_PITCH);
    const deltaGridY = Math.round(deltaPixelY / GRID_PITCH);

    const newGridX = dragStartRef.current.initPos.x + deltaGridX;
    const newGridY = dragStartRef.current.initPos.y + deltaGridY;

    currentGridPosRef.current = { x: newGridX, y: newGridY };
    updateGeometry(device.id, { x: newGridX, y: newGridY });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.stopPropagation();
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Pointer capture might have been lost
    }
    setIsDragging(false);

    if (dragStartRef.current) {
      const deltaPixelX = e.clientX - dragStartRef.current.clientX;
      const deltaPixelY = e.clientY - dragStartRef.current.clientY;
      const deltaGridX = Math.round(deltaPixelX / GRID_PITCH);
      const deltaGridY = Math.round(deltaPixelY / GRID_PITCH);
      const finalPos = {
        x: dragStartRef.current.initPos.x + deltaGridX,
        y: dragStartRef.current.initPos.y + deltaGridY
      };
      onDragEnd(device.id, finalPos);
      dragStartRef.current = null;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(e as unknown as React.MouseEvent);
    }
  };

  return (
    <div
      ref={ref}
      role="button"
      tabIndex={0}
      aria-label={device.name || device.id}
      title={device.name || device.id}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      style={{
        position: 'absolute',
        left: gridPos.x * GRID_PITCH,
        top: gridPos.y * GRID_PITCH,
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
        boxShadow: isSelected ? '0 0 0 3px var(--copper-tertiary)' : 'var(--md-sys-elevation-level-1)',
        border: isSelected ? '2px solid white' : 'none',
        zIndex: isDragging || isSelected ? 10 : 1,
        fontSize: '0.75rem',
        fontWeight: 'bold'
      }}
    >
      {device.name?.substring(0, 2) || device.id.substring(0, 2)}
    </div>
  );
}

export function FloorplanMode({ onSaveGeometry }: FloorplanModeProps = {}) {
  const { t } = useTranslation();

  const document = useDocumentStore(state => state.document);
  const selectedIds = useDocumentStore(state => state.selectedIds) || [];
  const setSelectedIds = useDocumentStore(state => state.setSelectedIds);
  const updateDocument = useDocumentStore(state => state.updateDocument);

  const [mode, setMode] = useState<'select' | 'viewer' | 'participant' | 'task'>('select');
  const [drawingRect, setDrawingRect] = useState<{ startX: number; startY: number; endX: number; endY: number } | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);

  // Local state for room editor
  const [roomEditW, setRoomEditW] = useState<string>('');
  const [roomEditD, setRoomEditD] = useState<string>('');
  const [roomEditH, setRoomEditH] = useState<string>('');

  if (!document) return null;

  const handleUpdateGeometry = (deviceId: string, position: { x: number; y: number }) => {
    if (mode !== 'select') return;
    updateDocument((draft: any) => {
      if (!draft.geometry) draft.geometry = {};
      if (!draft.geometry[deviceId]) draft.geometry[deviceId] = {};
      draft.geometry[deviceId].position = position;
    });
  };

  const handleDragEnd = (deviceId: string, position: { x: number; y: number }) => {
    handleUpdateGeometry(deviceId, position);

    const dev = document.devices.find(d => d.id === deviceId);
    const expectedVersion = document.revision || (document as any).version;

    if (onSaveGeometry) {
      onSaveGeometry({
        deviceId,
        node_label: dev?.name || deviceId,
        position,
        expected_version: expectedVersion
      });
    }
  };

  const handleBackgroundPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (mode === 'select') {
      setSelectedIds([]);
      setSelectedLocationId(null);
      return;
    }
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
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    const startX = Math.min(drawingRect.startX, drawingRect.endX);
    const startY = Math.min(drawingRect.startY, drawingRect.endY);
    const width = Math.abs(drawingRect.endX - drawingRect.startX);
    const height = Math.abs(drawingRect.endY - drawingRect.startY);

    setDrawingRect(null);
    setMode('select');

    if (width > 10 && height > 10) {
      const gridX = Math.round(startX / GRID_PITCH);
      const gridY = Math.round(startY / GRID_PITCH);
      const gridW = Math.max(1, Math.round(width / GRID_PITCH));
      const gridH = Math.max(1, Math.round(height / GRID_PITCH));

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
          position: { x: gridX, y: gridY },
          size: { width: gridW, height: gridH }
        };
      });
    }
  };

  const handleSelectLocation = (loc: Location) => {
    setSelectedLocationId(loc.id);
    const roomMeta = (loc as any).meta?.copper?.room;
    if (roomMeta) {
      setRoomEditW(String(roomMeta.w ?? 10));
      setRoomEditD(String(roomMeta.d ?? 8));
      setRoomEditH(String(roomMeta.h ?? 3));
    } else {
      setRoomEditW('10');
      setRoomEditD('8');
      setRoomEditH('3');
    }
  };

  const handleSaveRoomDimensions = () => {
    if (!selectedLocationId) return;
    const w = parseFloat(roomEditW) || 10;
    const d = parseFloat(roomEditD) || 8;
    const h = parseFloat(roomEditH) || 3;

    updateDocument((draft: any) => {
      const loc = draft.locations?.find((l: any) => l.id === selectedLocationId);
      if (loc) {
        if (!loc.meta) loc.meta = {};
        if (!loc.meta.copper) loc.meta.copper = {};
        loc.meta.copper.room = { w, d, h };
      }
    });
  };

  const locations = document.locations || [];
  const devices = document.devices || [];
  const zones = document.zones || [];

  const selectedLoc = locations.find(l => l.id === selectedLocationId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Top Toolbar */}
      <div style={{ padding: '8px', borderBottom: '1px solid var(--md-sys-color-outline-variant)', background: 'var(--md-sys-color-surface)', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <button onClick={() => setMode('select')} style={{ fontWeight: mode === 'select' ? 'bold' : 'normal' }}>
          {t('common.selectMove')}
        </button>
        <button onClick={() => setMode('viewer')} style={{ fontWeight: mode === 'viewer' ? 'bold' : 'normal' }}>
          {t('common.addViewerZone')}
        </button>
        <button onClick={() => setMode('participant')} style={{ fontWeight: mode === 'participant' ? 'bold' : 'normal' }}>
          {t('common.addParticipantZone')}
        </button>
        <button onClick={() => setMode('task')} style={{ fontWeight: mode === 'task' ? 'bold' : 'normal' }}>
          {t('common.addTaskZone')}
        </button>

        {selectedLoc && (
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--copper-surface-container)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.85rem' }}>
            <span style={{ fontWeight: 'bold' }}>{selectedLoc.name || selectedLoc.id}:</span>
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>{t('room.widthShort', 'W:')}</span>
              <input
                aria-label={t('room.widthLabel', 'Room Width (m)')}
                type="number"
                step="0.1"
                value={roomEditW}
                onChange={(e) => setRoomEditW(e.target.value)}
                style={{ width: '60px', padding: '2px 4px' }}
              />
              <span>{t('room.unitMeters', 'm')}</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>{t('room.depthShort', 'D:')}</span>
              <input
                aria-label={t('room.depthLabel', 'Room Depth (m)')}
                type="number"
                step="0.1"
                value={roomEditD}
                onChange={(e) => setRoomEditD(e.target.value)}
                style={{ width: '60px', padding: '2px 4px' }}
              />
              <span>{t('room.unitMeters', 'm')}</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>{t('room.heightShort', 'H:')}</span>
              <input
                aria-label={t('room.heightLabel', 'Room Height (m)')}
                type="number"
                step="0.1"
                value={roomEditH}
                onChange={(e) => setRoomEditH(e.target.value)}
                style={{ width: '60px', padding: '2px 4px' }}
              />
              <span>{t('room.unitMeters', 'm')}</span>
            </label>
            <button
              onClick={handleSaveRoomDimensions}
              style={{ background: 'var(--copper-primary)', color: 'var(--copper-on-primary)', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontWeight: 600 }}
            >
              {t('room.saveDimensions', 'Save Dimensions')}
            </button>
          </div>
        )}
      </div>

      <div
        style={{
          position: 'relative',
          flex: 1,
          overflow: 'auto',
          background: 'var(--copper-surface-container-lowest)',
          cursor: mode === 'select' ? 'default' : 'crosshair'
        }}
        onPointerDown={handleBackgroundPointerDown}
        onPointerMove={handleBackgroundPointerMove}
        onPointerUp={handleBackgroundPointerUp}
      >
        {/* Rooms Layer */}
        {locations.map(loc => {
          const roomMeta = (loc as any).meta?.copper?.room;
          const layout = (loc as any).layout;

          let width = 400;
          let height = 300;
          let posX = 0;
          let posY = 0;

          if (roomMeta && roomMeta.w && roomMeta.d) {
            width = roomMeta.w * PIXELS_PER_METER;
            height = roomMeta.d * PIXELS_PER_METER;
          } else if (layout) {
            width = layout.width;
            height = layout.height;
            posX = layout.x ?? 0;
            posY = layout.y ?? 0;
          }

          const isSelected = selectedLocationId === loc.id;

          const dimText = roomMeta
            ? `${roomMeta.w}m × ${roomMeta.d}m${roomMeta.h ? ` × ${roomMeta.h}m` : ''}`
            : null;

          return (
            <div
              key={loc.id}
              role="button"
              tabIndex={0}
              aria-label={loc.name || loc.id}
              onClick={(e) => {
                e.stopPropagation();
                handleSelectLocation(loc);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.stopPropagation();
                  handleSelectLocation(loc);
                }
              }}
              style={{
                position: 'absolute',
                left: posX,
                top: posY,
                width,
                height,
                border: isSelected ? '2px solid var(--copper-tertiary)' : '2px solid var(--copper-outline)',
                background: 'var(--copper-surface-container)',
                opacity: 0.85,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                boxSizing: 'border-box'
              }}
            >
              <div style={{ padding: '8px', fontWeight: 'bold', color: 'var(--copper-on-surface)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{loc.name || loc.id}</span>
                {dimText && (
                  <span style={{ fontSize: '0.8rem', fontWeight: 'normal', color: 'var(--copper-on-surface-variant)', background: 'var(--copper-surface-container-high)', padding: '2px 6px', borderRadius: '4px' }}>
                    {dimText}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/* Zones Layer */}
        {zones.map((zone: Zone) => {
          const geo = document.geometry?.[zone.id];
          if (!geo || !geo.position || !geo.size) return null;
          let colorVar = 'var(--copper-zone-viewer)';
          if (zone.type === 'participant') colorVar = 'var(--copper-zone-participant)';
          if (zone.type === 'task') colorVar = 'var(--copper-zone-task)';

          const zoneX = (geo.position.x <= 50 ? geo.position.x * GRID_PITCH : geo.position.x);
          const zoneY = (geo.position.y <= 50 ? geo.position.y * GRID_PITCH : geo.position.y);
          const zoneW = (geo.size.width <= 50 ? geo.size.width * GRID_PITCH : geo.size.width);
          const zoneH = (geo.size.height <= 50 ? geo.size.height * GRID_PITCH : geo.size.height);

          return (
            <div
              key={zone.id}
              style={{
                position: 'absolute',
                left: zoneX,
                top: zoneY,
                width: zoneW,
                height: zoneH,
                background: colorVar,
                border: '1px solid var(--md-sys-color-outline)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none'
              }}
            >
              <span style={{ fontWeight: 'bold', color: 'var(--md-sys-color-on-surface)' }}>{zone.name}</span>
            </div>
          );
        })}

        {/* Drawing Rect */}
        {drawingRect && (
          <div
            style={{
              position: 'absolute',
              left: Math.min(drawingRect.startX, drawingRect.endX),
              top: Math.min(drawingRect.startY, drawingRect.endY),
              width: Math.abs(drawingRect.endX - drawingRect.startX),
              height: Math.abs(drawingRect.endY - drawingRect.startY),
              background: 'var(--copper-zone-drawing)',
              border: '1px dashed var(--copper-zone-drawing-border)',
              pointerEvents: 'none'
            }}
          />
        )}

        {/* Devices Layer */}
        {devices.map((device: Device) => (
          <DraggableDevice
            key={device.id}
            device={device}
            geometry={document.geometry?.[device.id]}
            updateGeometry={handleUpdateGeometry}
            onDragEnd={handleDragEnd}
            isSelected={selectedIds.includes(device.id)}
            onClick={(e) => {
              e.stopPropagation();
              if (e.shiftKey || e.metaKey || e.ctrlKey) {
                setSelectedIds(
                  selectedIds.includes(device.id)
                    ? selectedIds.filter(id => id !== device.id)
                    : [...selectedIds, device.id]
                );
              } else {
                setSelectedIds([device.id]);
              }
            }}
          />
        ))}
      </div>
    </div>
  );
}
