import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
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

import fixtureGymmen from '../../tests/fixtures/av-fasit/AV_U1A21.easyschematic.json';
import { readEasySchematic } from '../exchange/easyschematic/read';
import { toX6 } from '../projection/toX6';
import { applyElkLayoutX6 } from '../projection/layout';

interface SessionContextType {
  tenantId: string;
  userId: string;
}

const SessionContext = createContext<SessionContextType | null>(null);

function Layout({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const session = useContext(SessionContext);

  return (
    <div className="app-layout">
      <header>
        <div style={{ padding: '0 1rem 2rem 1rem', fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--md-sys-color-primary)' }}>Copper</div>
        <nav>
          <ul>
            <li><Link to="/">Canvas</Link></li>
            <li><Link to="/rack">Rack Elevation</Link></li>
            <li><Link to="/schedule">Cable Schedule</Link></li>
            <li><Link to="/3d">3D Walkthrough</Link></li>
            <li><Link to="/compliance">Compliance (DSAR)</Link></li>
          </ul>
        </nav>
        <div className="session-info">
          Tenant: {session?.tenantId} | User: {session?.userId}
        </div>
      </header>
      <main>
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
    
    applyElkLayoutX6(rawNodes, rawEdges, { wireSpacing: settings.wireSpacing }).then(({ nodes: layoutedNodes, edges: layoutedEdges }) => {
      setNodes(layoutedNodes);
      setEdges(layoutedEdges); // Labels and extra config handled in CanvasView
    });
  }, [document, settings.wireSpacing, settings.terminalSpacing, settings.headerFontSize, settings.showCableLabels, settings.cableLabelPosition]);

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
      const { document: parsedDoc } = readEasySchematic(fixtureGymmen as any);
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

