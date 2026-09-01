import { useState } from 'react';
import { useDocumentStore } from '../../store/documentStore';

export function CableRoutingMode() {
  const document = useDocumentStore(state => state.document);
  const updateDocument = useDocumentStore(state => state.updateDocument);
  const [computing, setComputing] = useState(false);

  if (!document) return null;

  const handleComputeRoutes = async () => {
    setComputing(true);
    try {
      // B109: Map floorplan geometry to routing nodes
      const nodes = document.devices
        .filter(d => document.geometry?.[d.id]?.position)
        .map(d => {
          const pos = document.geometry![d.id].position;
          return {
            id: d.id,
            x: pos.x,
            y: pos.y,
            width: 32,
            height: 32
          };
        });

      // Filter only cables between devices placed on the floorplan
      const validDeviceIds = new Set(nodes.map(n => n.id));
      const edges = document.cables
        .filter(c => 
          c.terminations.length === 2 && 
          validDeviceIds.has(c.terminations[0].deviceId) && 
          validDeviceIds.has(c.terminations[1].deviceId)
        )
        .map(c => ({
          id: c.id,
          source: c.terminations[0].deviceId,
          target: c.terminations[1].deviceId
        }));

      if (nodes.length === 0 || edges.length === 0) {
        alert('Place devices on the floorplan and connect them first.');
        setComputing(false);
        return;
      }

      const worker = new Worker(new URL('../../router/worker.ts', import.meta.url), { type: 'module' });
      worker.postMessage({ nodes, edges, bounds: [] });
      worker.onmessage = (e) => {
        const res = e.data;
        updateDocument(draft => {
          edges.forEach((e, idx) => {
            const path = res.bestPaths[idx];
            if (!path) return;
            const points = path.split('L').map((s: string) => s.replace('M', '').trim().split(' ').map(Number));
            let length = 0;
            for (let i = 1; i < points.length; i++) {
              const [x1, y1] = points[i-1];
              const [x2, y2] = points[i];
              if (!isNaN(x1) && !isNaN(y1) && !isNaN(x2) && !isNaN(y2)) {
                length += Math.sqrt(Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2));
              }
            }
            const lengthMeters = Math.max(1, Math.round(length * 0.01 * 10) / 10);
            
            const cable = draft.cables.find(c => c.id === e.id);
            if (cable) {
              cable.length = lengthMeters;
              if (!draft.geometry) draft.geometry = {};
              if (!draft.geometry.routes) draft.geometry.routes = {};
              draft.geometry.routes[cable.id] = path;
            }
          });
        });
        setComputing(false);
        worker.terminate();
      };
      worker.onerror = (e) => {
        console.error('Routing worker failed', e);
        setComputing(false);
        worker.terminate();
      };
    } catch (e) {
      setComputing(false);
    }
  };

  const routes = document.geometry?.routes || {};

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'auto', background: 'var(--copper-surface-container-lowest)' }}>
      {/* Locations */}
      {document.locations.map(loc => {
        const layout = (loc as any).layout || { x: 0, y: 0, width: 400, height: 300 };
        return (
          <div
            key={loc.id}
            style={{ position: 'absolute', left: layout.x, top: layout.y, width: layout.width, height: layout.height, border: '2px solid var(--copper-outline)', background: 'var(--copper-surface-container)', opacity: 0.3 }}
          />
        );
      })}

      {/* Routes SVG */}
      <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 5 }}>
        {Object.entries(routes).map(([cableId, path]) => (
          <path key={cableId} d={path as string} fill="none" stroke="var(--copper-primary)" strokeWidth="2" strokeDasharray="4 2" />
        ))}
      </svg>

      {/* Devices Layer */}
      {document.devices.map(device => {
        const pos = document.geometry?.[device.id]?.position;
        if (!pos) return null;
        return (
          <div key={device.id} style={{ position: 'absolute', left: pos.x, top: pos.y, width: 24, height: 24, transform: 'translate(-50%, -50%)', background: 'var(--copper-secondary)', borderRadius: '50%', zIndex: 10 }} />
        );
      })}

      <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 20 }}>
        <button 
          className="m3-button m3-button-filled"
          onClick={handleComputeRoutes}
          disabled={computing}
        >
          {computing ? 'Routing...' : 'Compute Cable Routes'}
        </button>
      </div>
    </div>
  );
}
