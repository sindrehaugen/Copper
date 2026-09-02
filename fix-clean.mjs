import fs from 'fs';
let code = fs.readFileSync('app/src/shell/index.tsx', 'utf8');

const origLayout = `function Layout({ children }: { children: ReactNode }) {
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
}`;

const newLayout = `function Layout({ children }: { children: ReactNode }) {
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
}`;

code = code.replace(origLayout, newLayout);

const origAppShell = `export function AppShell() {
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
}`;

const newAppShell = `export function AppShell() {
  const [session, setSession] = useState<SessionContextType | null>(null);
  const [error, setError] = useState<any>(null);
  const loadDocument = useDocumentStore(state => state.loadDocument);
  const document = useDocumentStore(state => state.document);

  const boot = async () => {
    try {
      setError(null);
      const sessionRes = await fetch('/api/session');
      if (!sessionRes.ok) throw new Error(\`Auth failed: \${sessionRes.status}\`);
      const sessionData = await sessionRes.json();
      const sess = { tenantId: sessionData.namespace, userId: sessionData.actor };
      setSession(sess);

      if (import.meta.env.VITE_COPPER_FIXTURE === '1') {
        const { document: parsedDoc } = readProjectSchema(fixtureGymmen as any);
        loadDocument(parsedDoc);
      } else {
        const docRes = await fetch(\`/api/design/topology?namespace_id=\${sess.tenantId}\`);
        if (!docRes.ok) throw new Error(\`Failed to load design: \${docRes.status}\`);
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
            <Route path="/compliance" element={<div style={{padding: '2rem'}}><DsarSurface /></div>} />
            <Route path="*" element={<ErrorState error={{ code: -32005 }} />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </SessionContext.Provider>
  );
}`;

code = code.replace(origAppShell, newAppShell);

const importReplacement = `import fixtureGymmen from '../../tests/fixtures/av-fasit/AV_U1A21.project.json';
import { bffClient } from '../api/client';
import { LoadingState } from './loading-state';`;

code = code.replace("import fixtureGymmen from '../../tests/fixtures/av-fasit/AV_U1A21.project.json';", importReplacement);

fs.writeFileSync('app/src/shell/index.tsx', code);

// And fix bff/src/index.ts for the session route correctly
let bffCode = fs.readFileSync('bff/src/index.ts', 'utf8');
bffCode = bffCode.replace("app.get('/api/session', (c) => c.json(c.get('session' as any)));", "app.get('/api/session', (c: any) => c.json(c.get('session')));");
bffCode = bffCode.replace("app.get('/api/session', (c) => c.json(c.get('session')));", "app.get('/api/session', (c: any) => c.json(c.get('session')));");
fs.writeFileSync('bff/src/index.ts', bffCode);
