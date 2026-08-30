import React from 'react';
import { DesignDocument, Device } from '../../model/schema';
import { computeRackElevations } from '../../model/rack-view';
import { useDocumentStore } from '../../store';
import { validateRackFit } from '../../validation/rack-fit';


interface RackElevationViewProps {
  doc: DesignDocument;
  geometryMap: Record<string, unknown>;
  selectedRackId: string;
}

export const RackElevationView: React.FC<RackElevationViewProps> = ({
  doc,
  geometryMap,
  selectedRackId,
}) => {
  const updateDocument = useDocumentStore(s => s.updateDocument);
  const elevations = computeRackElevations(doc, geometryMap);
  const unassignedDevices = doc.devices.filter(d => !d.rackId);

  const elevation = elevations.find((e) => e.rackId === selectedRackId);

  if (!elevation) {
    return <div data-testid="rack-not-found">Rack not found</div>;
  }

  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, uNum: number, face: 'front' | 'rear') => {
    e.preventDefault();
    const deviceId = e.dataTransfer.getData('text/plain');
    if (!deviceId) return;
    
    const device = doc.devices.find(d => d.id === deviceId);
    if (!device) return;
    
    const rack = doc.racks.find(r => r.id === selectedRackId);
    if (!rack) return;

    const proposedGeometryMap = {
      ...geometryMap,
      [deviceId]: {
        ...(geometryMap[deviceId] as Record<string, unknown> || {}),
        rack_position: uNum,
        rack_face: face,
      }
    };

    const deviceTypeMap = new Map(doc.deviceTypes.map(dt => [dt.id, dt]));
    const tempDevices = doc.devices.map(d => 
      d.id === deviceId 
        ? { ...d, rackId: rack.id, position: uNum, face } 
        : d
    );

    const errors = validateRackFit(rack, tempDevices, deviceTypeMap, proposedGeometryMap);

    if (errors.length > 0) {
      return;
    }

    updateDocument(draft => { const d = draft.devices.find(x => x.id === deviceId);
      if (d) {
        d.rackId = rack.id;
        d.position = uNum;
        d.face = face;
        
        const draftAny = draft as unknown as { geometry?: Record<string, unknown> };
        const g = draftAny.geometry || {};
        g[deviceId] = {
          ...(g[deviceId] || {}),
          rack_position: uNum,
          rack_face: face,
        };
        draftAny.geometry = g;
      }
    });
  };

  const uNumbers = [];
  for (let u = Math.floor(elevation.totalU); u >= 1; u--) {
    uNumbers.push(u);
  }

  const renderSlot = (uNum: number, face: 'front' | 'rear') => {
    const slotMain = elevation.slots.find(s => s.uNumber === uNum);
    const slotHalf = elevation.slots.find(s => s.uNumber === uNum + 0.5);

    const renderDeviceBlock = (device: Device) => (
      <div 
        key={device.id} 
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData('text/plain', device.id);
        }}
        style={{ 
          backgroundColor: '#4ade80', 
          border: '1px solid #166534', 
          padding: '2px', 
          margin: '1px',
          fontSize: '12px',
          flex: 1,
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis'
        }}
        data-testid={`device-${device.id}-${face}`}
        title={device.name}
      >
        {device.name}
      </div>
    );

    const mainDevices = slotMain ? slotMain[face] : [];
    const halfDevices = slotHalf ? slotHalf[face] : [];

    return (
      <div key={`${face}-${uNum}`} style={{ display: 'flex', borderBottom: '1px solid #ccc', minHeight: '40px' }} data-testid={`slot-${uNum}-${face}`} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, uNum, face)}>
        <div style={{ width: '40px', borderRight: '1px solid #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6', fontWeight: 'bold' }}>
          {uNum}U
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, display: 'flex', minHeight: '20px', borderBottom: '1px dashed #eee' }}>
            {mainDevices.length > 0 
              ? mainDevices.map(d => renderDeviceBlock(d))
              : <div style={{ flex: 1 }} data-testid={`empty-${uNum}-main-${face}`} />
            }
          </div>
          <div style={{ flex: 1, display: 'flex', minHeight: '20px' }}>
            {halfDevices.length > 0 
              ? halfDevices.map(d => renderDeviceBlock(d))
              : <div style={{ flex: 1 }} data-testid={`empty-${uNum}-half-${face}`} />
            }
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', gap: '20px', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ flex: 1, border: '2px solid #333', borderRadius: '4px', overflow: 'hidden' }}>
        <h3 style={{ textAlign: 'center', backgroundColor: '#333', color: '#fff', margin: 0, padding: '10px' }}>Unassigned Devices</h3>
        <div style={{ display: 'flex', flexDirection: 'column', padding: '10px', gap: '5px' }} data-testid="unassigned-list">
          {unassignedDevices.map(device => (
             <div 
               key={device.id} 
               draggable
               onDragStart={(e) => e.dataTransfer.setData('text/plain', device.id)}
               style={{ backgroundColor: '#4ade80', border: '1px solid #166534', padding: '5px', fontSize: '12px', cursor: 'grab' }}
               data-testid={`unassigned-${device.id}`}
             >
               {device.name || device.id}
             </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, border: '2px solid #333', borderRadius: '4px', overflow: 'hidden' }}>
        <h3 style={{ textAlign: 'center', backgroundColor: '#333', color: '#fff', margin: 0, padding: '10px' }}>Front Face</h3>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {uNumbers.map(u => renderSlot(u, 'front'))}
        </div>
      </div>
      
      <div style={{ flex: 1, border: '2px solid #333', borderRadius: '4px', overflow: 'hidden' }}>
        <h3 style={{ textAlign: 'center', backgroundColor: '#333', color: '#fff', margin: 0, padding: '10px' }}>Rear Face</h3>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {uNumbers.map(u => renderSlot(u, 'rear'))}
        </div>
      </div>
    </div>
  );
};
