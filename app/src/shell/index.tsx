import { ReactNode, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDocumentStore } from '../store/documentStore';
import { ErrorState } from './error-state';
import { CanvasView } from '../views/canvas/CanvasView';
import { RackElevationView } from '../views/rack/RackElevationView';
import { CableScheduleView } from '../views/cable-schedule/CableScheduleView';
import { SceneView } from '../views/scene/SceneView';
import { DsarSurface } from '../components/compliance/DsarSurface';

// Placeholder Context for Session/Tenancy
interface SessionContextType {
  tenantId: string;
  userId: string;
}

const SessionContext = createContext<SessionContextType | null>(null);

function Layout({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const { document, promoteDocument, isSaving } = useDocumentStore();
  const session = useContext(SessionContext);

  return (
    <div className="app-layout">
      <header>
        <div style={{ padding: '0 1rem 2rem 1rem', fontSize: '1.5rem', fontWeight: 'bold' }}>Copper</div>
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

export function AppShell() {
  const placeholderSession = { tenantId: 'tenant-1', userId: 'user-1' };

  return (
    <SessionContext.Provider value={placeholderSession}>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<CanvasView />} />
            <Route path="/rack" element={<RackElevationView />} />
            <Route path="/schedule" element={<CableScheduleView />} />
            <Route path="/3d" element={<SceneView />} />
            <Route path="/compliance" element={<div style={{padding: '2rem'}}><DsarSurface /></div>} />
            <Route path="*" element={<ErrorState error={{ code: -32005 }} />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </SessionContext.Provider>
  );
}
