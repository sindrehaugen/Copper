import { createContext, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useDocumentStore } from '../store/documentStore';
import { useSettingsStore } from '../store/settingsStore';
import { ErrorState } from './error-state';
import { CanvasView } from '../views/canvas/CanvasView';
import { RackElevationView } from '../views/rack/RackElevationView';
import { CableScheduleView } from '../views/cable-schedule/CableScheduleView';
import { SceneView } from '../views/scene/SceneView';
import { DsarSurface } from '../components/compliance/DsarSurface';
import { LedWallDesigner } from '../views/led/LedWallDesigner';
import { SettingsPanel } from '../views/canvas/SettingsPanel';
import { BOMView } from '../views/bom/BomView';

import fixtureReferenceProject from '../../tests/fixtures/reference-projects/AV_U1A21.project.json';
import { bffClient } from '../api/client';
import { LoadingState } from './loading-state';
import { readProjectSchema } from '../exchange/projectschema/read';
import { toX6 } from '../projection/toX6';
import { applyElkLayoutX6 } from '../projection/layout';
import { exportToDxf } from '../export/dxf';

import { ShellLayout } from './ShellLayout';
import { GlobalBar } from './GlobalBar';
import { ContextRail } from './ContextRail';
import { IntelligenceRail } from './IntelligenceRail';
import { FindingsTray } from './FindingsTray';

export { ShellLayout, GlobalBar, ContextRail, IntelligenceRail, FindingsTray };

interface SessionContextType {
  tenantId: string;
  userId: string;
}

export const SessionContext = createContext<SessionContextType | null>(null);

export function ConnectedCanvasView() {
  const { t } = useTranslation();

  const document = useDocumentStore(state => state.document);
  const settings = useSettingsStore();
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);

  useEffect(() => {
    if (!document) return;
    const { nodes: rawNodes, edges: rawEdges } = toX6(document, {}, {
      terminalSpacing: settings.terminalSpacing,
      headerHeight: settings.headerFontSize + 14
    });
    
    applyElkLayoutX6(rawNodes, rawEdges, { wireSpacing: settings.wireSpacing, portPadding: settings.portPadding }).then(({ nodes: layoutedNodes, edges: layoutedEdges }) => {
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
    });
  }, [document, settings.wireSpacing, settings.portPadding, settings.terminalSpacing, settings.headerFontSize, settings.showCableLabels, settings.cableLabelPosition]);

  const cssVars = {
    '--copper-terminal-spacing': `${settings.terminalSpacing}px`,
    '--copper-terminal-font-size': `${settings.terminalFontSize}px`,
    '--copper-header-font-size': `${settings.headerFontSize}px`,
    '--copper-header-height': `${settings.headerFontSize + 14}px`,
  } as React.CSSProperties;

  const handleExportDXF = () => {
    if (!document) return;
    const dxfNodes = document.devices.map((d: any) => ({
      id: d.name || d.id,
      position: { x: d.geometry?.x ?? 0, y: d.geometry?.y ?? 0 },
      initialWidth: 200,
      initialHeight: 100
    }));
    const dxfEdges = document.cables.map((c: any) => ({
      source: document.devices.find((d: any) => d.id === c.terminations[0].deviceId)?.name || c.terminations[0].deviceId,
      target: document.devices.find((d: any) => d.id === c.terminations[1].deviceId)?.name || c.terminations[1].deviceId,
    }));
    const dxfStr = exportToDxf(dxfNodes, dxfEdges);
    const blob = new Blob([dxfStr], { type: 'application/dxf' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = 'design.dxf';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  if (!document) return <div style={{padding: '2rem'}}>{t('common.loadingDocument')}</div>;
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', ...cssVars }}>
      <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 1000, display: 'flex', gap: 8 }}>
        <button 
          onClick={handleExportDXF}
          className="m3-button m3-button-filled"
        >
          {t('common.exportDXF', 'Export DXF')}
        </button>
      </div>
      <SettingsPanel />
      <CanvasView nodes={nodes} edges={edges} enableWiring={true} />
    </div>
  );
}

export function ConnectedRackElevationView() {
  const { t } = useTranslation();

  const document = useDocumentStore(state => state.document);
  if (!document) return <div style={{padding: '2rem'}}>{t('common.loadingDocument')}</div>;
  const firstRackId = document.racks[0]?.id ?? '';
  const geometryMap = {};
  return <RackElevationView doc={document} geometryMap={geometryMap} selectedRackId={firstRackId} />;
}

export function ConnectedCableScheduleView() {
  const { t } = useTranslation();

  const document = useDocumentStore(state => state.document);
  if (!document) return <div style={{padding: '2rem'}}>{t('common.loadingDocument')}</div>;
  return <CableScheduleView document={document} />;
}

function ContextViewPlaceholder({ titleKey, descKey }: { titleKey: string; descKey: string }) {
  const { t } = useTranslation();
  return (
    <div style={{ padding: '2rem' }}>
      <h2>{t(titleKey)}</h2>
      <p style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>{t(descKey)}</p>
    </div>
  );
}

export function AppShell() {
  const { t } = useTranslation();
  const [session, setSession] = useState<SessionContextType | null>(null);
  const [error, setError] = useState<any>(null);
  const loadDocument = useDocumentStore(state => state.loadDocument);
  const document = useDocumentStore(state => state.document);
  const isSaving = useDocumentStore(state => state.isSaving);
  const syncConflict = useDocumentStore(state => state.syncConflict);
  const saveDocument = useDocumentStore(state => state.saveDocument);

  const boot = async () => {
    try {
      setError(null);
      let sess = { tenantId: 'offline', userId: 'offline' };
      let useFixture = (import.meta as any).env?.VITE_COPPER_FIXTURE === '1';

      try {
        const sessionRes = await fetch('/api/session');
        if (sessionRes.ok) {
          const sessionData = await sessionRes.json();
          sess = { tenantId: sessionData.namespace, userId: sessionData.actor };
        } else {
          useFixture = true;
          console.warn(`Auth failed: ${sessionRes.status}, falling back to offline fixture.`);
        }
      } catch (err) {
        useFixture = true;
        console.warn("BFF unreachable, falling back to offline fixture.", err);
      }

      setSession(sess);

      if (useFixture) {
        const { document: parsedDoc } = readProjectSchema(fixtureReferenceProject as any);
        loadDocument(parsedDoc);
      } else {
        const docRes = await fetch(`/api/design/topology?namespace_id=${sess.tenantId}`);
        if (!docRes.ok) throw new Error(`Failed to load design: ${docRes.status}`);
        const parsedDoc = await docRes.json();
        loadDocument(parsedDoc);
      }
    } catch (e: any) {
      setError(e);
    }
  };

  useEffect(() => {
    if (!document) {
      boot();
    }
  }, [document, loadDocument]);

  const handleSave = async () => {
    if (!session || !document) return;
    await saveDocument(bffClient, session.tenantId, session.userId);
  };

  const handleReload = () => {
    window.location.reload();
  };

  if (error) return <ErrorState error={error} onRetry={boot} />;
  if (!session || !document) return <LoadingState />;

  const globalBarProps = {
    tenantId: session.tenantId,
    userId: session.userId,
    isSaving,
    syncConflict,
    onSave: handleSave,
    onReload: handleReload,
  };

  return (
    <SessionContext.Provider value={session}>
      <BrowserRouter>
        <ShellLayout globalBarProps={globalBarProps}>
          <Routes>
            {/* Direct Context Group Routes */}
            <Route path="/now" element={<ContextViewPlaceholder titleKey="nav.now" descKey="nav.nowDesc" />} />
            <Route path="/rooms" element={<ContextViewPlaceholder titleKey="nav.rooms" descKey="nav.roomsDesc" />} />
            <Route path="/commerce" element={<ContextViewPlaceholder titleKey="nav.commerce" descKey="nav.commerceDesc" />} />
            <Route path="/supply" element={<ContextViewPlaceholder titleKey="nav.supply" descKey="nav.supplyDesc" />} />
            <Route path="/service" element={<ContextViewPlaceholder titleKey="nav.service" descKey="nav.serviceDesc" />} />
            <Route path="/insight" element={<ContextViewPlaceholder titleKey="nav.insight" descKey="nav.insightDesc" />} />
            <Route path="/ops" element={<ContextViewPlaceholder titleKey="nav.ops" descKey="nav.opsDesc" />} />

            {/* Design Context Routes & Sub-views */}
            <Route path="/" element={<ConnectedCanvasView />} />
            <Route path="/design" element={<ConnectedCanvasView />} />
            <Route path="/design/canvas" element={<ConnectedCanvasView />} />
            <Route path="/rack" element={<ConnectedRackElevationView />} />
            <Route path="/design/rack" element={<ConnectedRackElevationView />} />
            <Route path="/schedule" element={<ConnectedCableScheduleView />} />
            <Route path="/design/schedule" element={<ConnectedCableScheduleView />} />
            <Route path="/3d" element={<SceneView />} />
            <Route path="/design/3d" element={<SceneView />} />
            <Route path="/bom" element={<BOMView />} />
            <Route path="/design/bom" element={<BOMView />} />
            <Route path="/compliance" element={<div style={{padding: '2rem'}}><DsarSurface /></div>} />
            <Route path="/design/compliance" element={<div style={{padding: '2rem'}}><DsarSurface /></div>} />
            <Route path="/ledwall" element={<LedWallDesigner />} />
            <Route path="/design/ledwall" element={<LedWallDesigner />} />

            <Route path="*" element={<div style={{padding: '2rem'}}>{t('nav.notFound')}</div>} />
          </Routes>
        </ShellLayout>
      </BrowserRouter>
    </SessionContext.Provider>
  );
}
