import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDocumentStore } from '../store/documentStore';
import { useSettingsStore } from '../store/settingsStore';
import { ErrorState } from './error-state';
import { CanvasView } from '../views/canvas/CanvasView';
import { RackElevationView } from '../views/rack/RackElevationView';
import { CableScheduleView } from '../views/cable-schedule/CableScheduleView';
import { SceneView } from '../views/scene/SceneView';
import { DsarSurface } from '../components/compliance/DsarSurface';
import { SettingsPanel } from '../views/canvas/SettingsPanel';

import fixtureGymmen from '../../tests/fixtures/av-fasit/AV_U1A21.projectschema.json';
import { readProjectSchema } from '../exchange/projectschema/read';
import { toX6 } from '../projection/toX6';
import { applyElkLayoutX6 } from '../projection/layout';

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

function Layout({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const session = useContext(SessionContext);

  return (
    <div className="app-layout">
      <nav className="m3-nav-drawer">
        <div className="m3-nav-header">Copper</div>
        <ul>
          <NavItem to="/" label="Canvas" />
          <NavItem to="/rack" label="Rack Elevation" />
          <NavItem to="/schedule" label="Cable Schedule" />
          <NavItem to="/3d" label="3D Walkthrough" />
          <NavItem to="/compliance" label="Compliance (DSAR)" />
        </ul>
        <div className="session-info">
          {session?.tenantId} • {session?.userId}
        </div>
      </nav>
      <main className="m3-main-content">
        {children}
      </main>
    </div>
  );
}

function ConnectedCanvasView() {
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

  if (!document) return <div style={{padding: '2rem'}}>Loading document...</div>;
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', ...cssVars }}>
      <SettingsPanel />
      <CanvasView nodes={nodes} edges={edges} enableWiring={true} />
    </div>
  );
}

function ConnectedRackElevationView() {
  const document = useDocumentStore(state => state.document);
  if (!document) return <div style={{padding: '2rem'}}>Loading document...</div>;
  const firstRackId = document.racks[0]?.id ?? '';
  const geometryMap = {};
  return <RackElevationView doc={document} geometryMap={geometryMap} selectedRackId={firstRackId} />;
}

function ConnectedCableScheduleView() {
  const document = useDocumentStore(state => state.document);
  if (!document) return <div style={{padding: '2rem'}}>Loading document...</div>;
  return <CableScheduleView document={document} />;
}

export function AppShell() {
  const placeholderSession = { tenantId: 'tenant-1', userId: 'user-1' };
  const loadDocument = useDocumentStore(state => state.loadDocument);
  const document = useDocumentStore(state => state.document);

  useEffect(() => {
    if (!document) {
      const { document: parsedDoc } = readProjectSchema(fixtureGymmen as any);
      loadDocument(parsedDoc);
    }
  }, [document, loadDocument]);

  return (
    <SessionContext.Provider value={placeholderSession}>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<ConnectedCanvasView />} />
            <Route path="/rack" element={<ConnectedRackElevationView />} />
            <Route path="/schedule" element={<ConnectedCableScheduleView />} />
            <Route path="/3d" element={<SceneView />} />
            <Route path="/compliance" element={<div style={{padding: '2rem'}}><DsarSurface /></div>} />
            <Route path="*" element={<ErrorState error={{ code: -32005 }} />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </SessionContext.Provider>
  );
}

