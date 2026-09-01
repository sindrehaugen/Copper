import { useParams, useNavigate } from 'react-router-dom';
import { ConnectedCanvasView } from '../../shell/index';
import { SceneView } from '../scene/SceneView';
import { FloorplanMode } from './FloorplanMode';
import { CableRoutingMode } from './CableRoutingMode';
import { useDocumentStore } from '../../store/documentStore';
import { ProblemsPanel } from '../../ui/problems/ProblemsPanel';
import { exportToDxf } from '../../export/dxf';

export function DesignWorkspace() {
  const { mode } = useParams();
  const navigate = useNavigate();
  const document = useDocumentStore(state => state.document);

  const currentMode = mode || 'schematic';

  const handleExportDXF = () => {
    if (!document) return;
    const nodes = document.devices.map((d: any) => ({
      id: d.name || d.id,
      position: { x: d.geometry?.x ?? 0, y: d.geometry?.y ?? 0 },
      initialWidth: 200,
      initialHeight: 100
    }));
    const edges = document.cables.map((c: any) => ({
      source: document.devices.find((d: any) => d.id === c.terminations[0].deviceId)?.name || c.terminations[0].deviceId,
      target: document.devices.find((d: any) => d.id === c.terminations[1].deviceId)?.name || c.terminations[1].deviceId,
    }));
    const dxfStr = exportToDxf(nodes, edges);
    const blob = new Blob([dxfStr], { type: 'application/dxf' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = 'design.dxf';
    a.click();
  };

  const modes = [
    { id: 'schematic', label: 'Schematic' },
    { id: 'floorplan', label: 'Floorplan' },
    { id: 'routing', label: 'Cable Routing' },
    { id: '3d', label: '3D Scene' }
  ];

  if (!document) {
    return <div className="m3-content-padding">Loading document...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'center', padding: '8px', background: 'var(--copper-surface-container)', borderBottom: '1px solid var(--copper-outline-variant)' }}>
        <div style={{ display: 'flex', background: 'var(--copper-surface)', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--copper-outline)' }}>
          {modes.map((m, idx) => {
            const isActive = currentMode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => navigate('/design/' + m.id)}
                style={{
                  padding: '8px 16px',
                  background: isActive ? 'var(--copper-secondary-container)' : 'transparent',
                  color: isActive ? 'var(--copper-on-secondary-container)' : 'var(--copper-on-surface)',
                  border: 'none',
                  borderRight: idx < modes.length - 1 ? '1px solid var(--copper-outline)' : 'none',
                  cursor: 'pointer',
                  fontWeight: isActive ? 600 : 400
                }}
              >
                {m.label}
              </button>
            );
          })}
        </div>
        <div style={{ marginLeft: '16px', display: 'flex', alignItems: 'center' }}>
          <button 
            onClick={handleExportDXF}
            style={{ padding: '8px 16px', background: 'var(--copper-primary)', color: 'var(--copper-on-primary)', border: 'none', borderRadius: 8, cursor: 'pointer' }}
          >
            Export DXF
          </button>
        </div>
      </div>
      
      <div style={{ flex: 1, position: 'relative' }}>
        {document.devices.length === 0 && currentMode === 'schematic' && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            background: 'var(--copper-surface-container-lowest)', zIndex: 100,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
          }}>
            <h2 style={{ color: 'var(--copper-on-surface)' }}>Design from Intent</h2>
            <p style={{ color: 'var(--copper-on-surface-variant)', marginBottom: 32 }}>Choose a generative starting point</p>
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ padding: 24, background: 'var(--copper-surface-container)', borderRadius: 12, border: '1px solid var(--copper-outline)', cursor: 'pointer' }}>
                <h3>100V Paging Zone</h3>
                <p style={{ color: 'var(--copper-on-surface-variant)' }}>Amp + 8 Ceiling Speakers</p>
              </div>
              <div style={{ padding: 24, background: 'var(--copper-surface-container)', borderRadius: 12, border: '1px solid var(--copper-outline)', cursor: 'pointer' }}>
                <h3>Boardroom VC</h3>
                <p style={{ color: 'var(--copper-on-surface-variant)' }}>DSP, Amps, PTZ Camera, Mics</p>
              </div>
            </div>
          </div>
        )}
        {currentMode === 'schematic' && <ConnectedCanvasView />}
        {currentMode === 'floorplan' && <FloorplanMode />}
        {currentMode === 'routing' && <CableRoutingMode />}
        {currentMode === '3d' && <SceneView />}
        <ProblemsPanel />
      </div>
    </div>
  );
}
