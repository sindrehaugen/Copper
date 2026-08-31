import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDocumentStore } from '../store/documentStore';
import { ErrorState } from './error-state';
import { CanvasView } from '../views/canvas/CanvasView';
import { RackElevationView } from '../views/rack/RackElevationView';
import { CableScheduleView } from '../views/cable-schedule/CableScheduleView';
import { SceneView } from '../views/scene/SceneView';
import { DsarSurface } from '../components/compliance/DsarSurface';

import fixtureGymmen from '../../tests/fixtures/av-fasit/AV_U1A21.easyschematic.json';
import { readEasySchematic } from '../exchange/easyschematic/read';
import { toFlow } from '../projection/toFlow';
import { applyElkLayout } from '../projection/layout';
import { enhanceEdges } from '../projection/edges';
import type { Node, Edge } from '@xyflow/react';

// Placeholder Context for Session/Tenancy
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
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  useEffect(() => {
    if (!document) return;
    const { nodes: rawNodes, edges: rawEdges } = toFlow(document);
    applyElkLayout(rawNodes, rawEdges).then(layoutedNodes => {
      setNodes(layoutedNodes);
      setEdges(enhanceEdges(rawEdges));
    });
  }, [document]);

  if (!document) return <div style={{padding: '2rem'}}>Loading document...</div>;
  return <CanvasView nodes={nodes} edges={edges} enableWiring={true} />;
}

function ConnectedRackElevationView() {
  const document = useDocumentStore(state => state.document);
  if (!document) return <div style={{padding: '2rem'}}>Loading document...</div>;
  // Use first rack as default selected
  const firstRackId = document.racks[0]?.id ?? '';
  // Fallback empty geometry map for the view
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
      // Mock loading a document on boot
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
