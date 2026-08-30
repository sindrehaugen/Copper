import React from 'react';
import { DesignDocument, Device } from '../../model/schema';
import { computeRackElevations } from '../../model/rack-view';

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
  const elevations = computeRackElevations(doc, geometryMap);
  const elevation = elevations.find((e) => e.rackId === selectedRackId);

  if (!elevation) {
    return <div data-testid="rack-not-found">Rack not found</div>;
  }

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
      <div key={`${face}-${uNum}`} style={{ display: 'flex', borderBottom: '1px solid #ccc', minHeight: '40px' }} data-testid={`slot-${uNum}-${face}`}>
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
