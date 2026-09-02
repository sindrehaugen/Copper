import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';

import { useDocumentStore } from '../store/documentStore';
import { useSettingsStore } from '../store/settingsStore';
import { ErrorState } from './error-state';
import { CanvasView } from '../views/canvas/CanvasView';
import { RackElevationView } from '../views/rack/RackElevationView';
import { CableScheduleView } from '../views/cable-schedule/CableScheduleView';
import { SceneView } from '../views/scene/SceneView';
import { DsarSurface } from '../components/compliance/DsarSurface';
import { SettingsPanel } from '../views/canvas/SettingsPanel';
import { BOMView } from '../views/bom/BOMView';

import fixtureReferenceProject from '../../tests/fixtures/reference-projects/AV_U1A21.project.json';
import { bffClient } from '../api/client';
import { LoadingState } from './loading-state';
import { readProjectSchema } from '../exchange/projectschema/read';
import { toX6 } from '../projection/toX6';
import { applyElkLayoutX6 } from '../projection/layout';
import { exportToDxf } from '../export/dxf';

interface SessionContextType {
  tenantId: string;
  userId: string;
}

const SessionContext = createContext<SessionContextType | null>(null);

function NavItem({ to, label }: { to: string; label: string }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <li>
      <Link to={to} className={isActive ? 'active' : ''}>
        {label}
      </Link>
    </li>
  );
}

import { useTranslation } from 'react-i18next';

function Layout({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const session = useContext(SessionContext);
  const isSaving = useDocumentStore(state => state.isSaving);
  const syncConflict = useDocumentStore(state => state.syncConflict);
  const saveDocument = useDocumentStore(state => state.saveDocument);
  const document = useDocumentStore(state => state.document);

  const handleSave = async () => {
    if (!session || !document) return;
    await saveDocument(bffClient, session.tenantId, session.userId);
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="app-layout">
      <nav className="m3-nav-drawer">
        <div className="m3-nav-header">Copper</div>
        <ul>
          <NavItem to="/" label={t('nav.canvas')} />
          <NavItem to="/rack" label={t('nav.rack')} />
          <NavItem to="/schedule" label={t('nav.schedule')} />
          <NavItem to="/3d" label={t('nav.walkthrough')} />
          <NavItem to="/bom" label={t('nav.bom')} />
          <NavItem to="/compliance" label={t('nav.compliance')} />
        </ul>
        <div className="session-info">
          {session?.tenantId} • {session?.userId}
        </div>
      </nav>
      <main className="m3-main-content">
        <header style={{ padding: '8px 16px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '16px', borderBottom: '1px solid var(--md-sys-color-outline-variant)', backgroundColor: 'var(--md-sys-color-surface)' }}>
          {syncConflict && (
            <div style={{ color: 'var(--md-sys-color-error)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Version Conflict!</span>
              <button onClick={handleReload} className="m3-button">Reload & Reapply</button>
            </div>
          )}
          <button disabled={isSaving || syncConflict || !document} onClick={handleSave} className="m3-button">
            {isSaving ? 'Saving...' : 'Save Design'}
          </button>
        </header>
        {children}
      </main>
    </div>
  );
}

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

function ConnectedRackElevationView() {
  const { t } = useTranslation();

  const document = useDocumentStore(state => state.document);
  if (!document) return <div style={{padding: '2rem'}}>{t('common.loadingDocument')}</div>;
  const firstRackId = document.racks[0]?.id ?? '';
  const geometryMap = {};
  return <RackElevationView doc={document} geometryMap={geometryMap} selectedRackId={firstRackId} />;
}

function ConnectedCableScheduleView() {
  const { t } = useTranslation();

  const document = useDocumentStore(state => state.document);
  if (!document) return <div style={{padding: '2rem'}}>{t('common.loadingDocument')}</div>;
  return <CableScheduleView document={document} />;
}

export function AppShell() {

  const [session, setSession] = useState<SessionContextType | null>(null);
  const [error, setError] = useState<any>(null);
  const loadDocument = useDocumentStore(state => state.loadDocument);
  const document = useDocumentStore(state => state.document);

  const boot = async () => {
    try {
      setError(null);
      const sessionRes = await fetch('/api/session');
      if (!sessionRes.ok) throw new Error(`Auth failed: ${sessionRes.status}`);
      const sessionData = await sessionRes.json();
      const sess = { tenantId: sessionData.namespace, userId: sessionData.actor };
      setSession(sess);

      if ((import.meta as any).env.VITE_COPPER_FIXTURE === '1') {
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

  if (error) return <ErrorState error={error} onRetry={boot} />;
  if (!session || !document) return <LoadingState />;

  return (
    <SessionContext.Provider value={session}>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<ConnectedCanvasView />} />
            <Route path="/rack" element={<ConnectedRackElevationView />} />
            <Route path="/schedule" element={<ConnectedCableScheduleView />} />
            <Route path="/3d" element={<SceneView />} />
            <Route path="/bom" element={<BOMView />} />
            <Route path="/compliance" element={<div style={{padding: '2rem'}}><DsarSurface /></div>} />
            <Route path="*" element={<div style={{padding: '2rem'}}>404 Not Found</div>} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </SessionContext.Provider>
  );
}


