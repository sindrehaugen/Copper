import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { ConnectedCanvasView } from '../../shell/index';
import { SceneView } from '../scene/SceneView';
import { FloorplanMode } from './FloorplanMode';
import { CableRoutingMode } from './CableRoutingMode';
import { SpatialFindingsTray } from './SpatialFindingsTray';
import { useDocumentStore } from '../../store/documentStore';
import { ProblemsPanel } from '../../ui/problems/ProblemsPanel';
import { exportToDxf } from '../../export/dxf';
import { bffClient } from '../../api/client';

export function DesignWorkspace() {
  const { t } = useTranslation();

  const { mode } = useParams();
  const navigate = useNavigate();
  const document = useDocumentStore(state => state.document);

  const currentMode = mode || 'schematic';
  const promoteDocument = useDocumentStore(state => state.promoteDocument);
  const isSaving = useDocumentStore(state => state.isSaving);
  const updateDocument = useDocumentStore(state => state.updateDocument);

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
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  const handlePromote = async (targetStatus: 'quoted' | 'active') => {
    try {
      await promoteDocument(bffClient, 'test-namespace', 'test-actor', targetStatus);
      alert(`Successfully promoted to ${targetStatus}`);
    } catch (e: any) {
      if (e.message?.includes('409')) {
        alert('Conflict (409 expected_version): Please reload and reapply your changes.');
      } else {
        alert(e.message);
      }
    }
  };

  const handle100VClick = () => {
    updateDocument((draft) => {
      const ampType = draft.deviceTypes.find(dt => dt.model.toLowerCase().includes('amp') || dt.slug.includes('amp')) || draft.deviceTypes[0];
      const spkType = draft.deviceTypes.find(dt => dt.model.toLowerCase().includes('speaker') || dt.slug.includes('speaker')) || draft.deviceTypes[0];
      const siteId = draft.sites[0]?.id || 'site-1';
      
      if (!draft.sites.some(s => s.id === siteId)) {
        draft.sites.push({ id: siteId, name: 'Default Site', slug: 'default-site' });
      }

      const ampId = 'amp-' + Math.random().toString(36).substring(2, 9);
      draft.devices.push({
        id: ampId,
        name: 'Paging Amp',
        deviceTypeId: ampType?.id || 'fallback',
        siteId,
        status: 'planned'
      });
      
      let prevId = ampId;
      for(let i=1; i<=4; i++) {
        const spkId = 'spk-' + Math.random().toString(36).substring(2, 9);
        draft.devices.push({
          id: spkId,
          name: `Ceiling Speaker ${i}`,
          deviceTypeId: spkType?.id || 'fallback',
          siteId,
          status: 'planned'
        });
        
        draft.cables.push({
          id: 'cab-' + Math.random().toString(36).substring(2, 9),
          status: 'planned',
          terminations: [
            { deviceId: prevId, portRef: { kind: 'rearPort', name: prevId === ampId ? 'out' : 'link' } },
            { deviceId: spkId, portRef: { kind: 'rearPort', name: 'in' } }
          ]
        });
        prevId = spkId;
      }
    });
  };

  const handleBoardroomClick = () => {
    updateDocument((draft) => {
      const displayType = draft.deviceTypes.find(dt => dt.model.toLowerCase().includes('display') || dt.slug.includes('display')) || draft.deviceTypes[0];
      const camType = draft.deviceTypes.find(dt => dt.model.toLowerCase().includes('camera') || dt.slug.includes('camera')) || draft.deviceTypes[0];
      const micType = draft.deviceTypes.find(dt => dt.model.toLowerCase().includes('mic') || dt.slug.includes('mic')) || draft.deviceTypes[0];
      const siteId = draft.sites[0]?.id || 'site-1';
      
      if (!draft.sites.some(s => s.id === siteId)) {
        draft.sites.push({ id: siteId, name: 'Default Site', slug: 'default-site' });
      }

      draft.devices.push({
        id: 'disp-' + Math.random().toString(36).substring(2, 9),
        name: 'Main Display',
        deviceTypeId: displayType?.id || 'fallback',
        siteId,
        status: 'planned'
      });
      
      draft.devices.push({
        id: 'cam-' + Math.random().toString(36).substring(2, 9),
        name: 'PTZ Camera',
        deviceTypeId: camType?.id || 'fallback',
        siteId,
        status: 'planned'
      });
      
      draft.devices.push({
        id: 'mic-' + Math.random().toString(36).substring(2, 9),
        name: 'Ceiling Mic',
        deviceTypeId: micType?.id || 'fallback',
        siteId,
        status: 'planned'
      });
    });
  };

  const modes = [
    { id: 'schematic', label: 'Schematic' },
    { id: 'floorplan', label: 'Floorplan' },
    { id: 'routing', label: 'Cable Routing' },
    { id: '3d', label: '3D Scene' }
  ];

  if (!document) {
    return <div className="m3-content-padding">{t('common.loadingDocument')}</div>;
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
                type="button"
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
        <div style={{ marginLeft: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            type="button"
            onClick={() => handlePromote('quoted')}
            disabled={isSaving}
            style={{ padding: '8px 16px', background: 'var(--copper-tertiary)', color: 'var(--copper-on-tertiary)', border: 'none', borderRadius: 8, cursor: 'pointer' }}
          >
            {t('common.promoteToQuoted', 'Promote to Quoted')}
          </button>
          <button 
            type="button"
            onClick={() => handlePromote('active')}
            disabled={isSaving}
            style={{ padding: '8px 16px', background: 'var(--copper-tertiary)', color: 'var(--copper-on-tertiary)', border: 'none', borderRadius: 8, cursor: 'pointer' }}
          >
            {t('common.promoteToActive', 'Promote to Active')}
          </button>
          <button 
            type="button"
            onClick={handleExportDXF}
            style={{ padding: '8px 16px', background: 'var(--copper-primary)', color: 'var(--copper-on-primary)', border: 'none', borderRadius: 8, cursor: 'pointer' }}
          >
            {t('common.exportDXF')}
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
            <h2 style={{ color: 'var(--copper-on-surface)' }}>{t('common.designFromIntent')}</h2>
            <p style={{ color: 'var(--copper-on-surface-variant)', marginBottom: 32 }}>{t('common.chooseAGenerativeStartingPoint')}</p>
            <div style={{ display: 'flex', gap: 16 }}>
              <div 
                role="button"
                tabIndex={0}
                onClick={handle100VClick}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handle100VClick(); } }}
                style={{ padding: 24, background: 'var(--copper-surface-container)', borderRadius: 12, border: '1px solid var(--copper-outline)', cursor: 'pointer' }}
              >
                <h3>{t('common.100VPagingZone')}</h3>
                <p style={{ color: 'var(--copper-on-surface-variant)' }}>{t('common.amp8CeilingSpeakers')}</p>
              </div>
              <div 
                role="button"
                tabIndex={0}
                onClick={handleBoardroomClick}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleBoardroomClick(); } }}
                style={{ padding: 24, background: 'var(--copper-surface-container)', borderRadius: 12, border: '1px solid var(--copper-outline)', cursor: 'pointer' }}
              >
                <h3>{t('common.boardroomVC')}</h3>
                <p style={{ color: 'var(--copper-on-surface-variant)' }}>{t('common.dSPAmpsPTZCameraMics')}</p>
              </div>
            </div>
          </div>
        )}
        {currentMode === 'schematic' && <ConnectedCanvasView />}
        {currentMode === 'floorplan' && <FloorplanMode />}
        {currentMode === 'routing' && <CableRoutingMode />}
        {currentMode === '3d' && <SceneView />}
        {currentMode === 'floorplan' || currentMode === '3d' ? (
          <SpatialFindingsTray />
        ) : (
          <ProblemsPanel />
        )}
      </div>
    </div>
  );
}
