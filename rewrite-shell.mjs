import fs from 'fs';
let code = fs.readFileSync('app/src/shell/index.tsx', 'utf8');

const layoutCode = `
import { bffClient } from '../api/client';
import { LoadingState } from './loading-state';

function Layout({ children }: { children: ReactNode }) {
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
          <NavItem to="/design/schematic" label="Canvas" activePattern={/^\/design\/(?!3d)/} />
          <NavItem to="/rack" label="Rack Elevation" activePattern="/rack" />
          <NavItem to="/schedule" label="Cable Schedule" activePattern="/schedule" />
          <NavItem to="/design/3d" label="3D Walkthrough" activePattern="/design/3d" />
          <NavItem to="/compliance" label="Compliance (DSAR)" activePattern="/compliance" />
        </ul>
        <div className="session-info">
          {session?.tenantId}   {session?.userId}
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
`;

const appShellCode = `
export function AppShell() {
  const [session, setSession] = useState<SessionContextType | null>(null);
  const [error, setError] = useState<any>(null);
  const loadDocument = useDocumentStore(state => state.loadDocument);
  const document = useDocumentStore(state => state.document);

  const boot = async () => {
    try {
      setError(null);
      
      // 1. Fetch Session
      const sessionRes = await fetch('/api/session');
      if (!sessionRes.ok) throw new Error(\`Auth failed: \${sessionRes.status}\`);
      const sessionData = await sessionRes.json();
      const sess = { tenantId: sessionData.namespace, userId: sessionData.actor };
      setSession(sess);

      // 2. Fetch Document
      if (import.meta.env.VITE_COPPER_FIXTURE === '1') {
        const { document: parsedDoc } = readProjectSchema(fixtureGymmen as any);
        loadDocument(parsedDoc);
      } else {
        const docRes = await fetch(\`/api/design/topology?namespace_id=\${sess.tenantId}\`);
        if (!docRes.ok) throw new Error(\`Failed to load design: \${docRes.status}\`);
        const parsedDoc = await docRes.json();
        
        // Ensure geometry etc defaults exist, just blindly load for now since BFF returns valid schema
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
            <Route path="/" element={<Navigate to="/design/schematic" replace />} />
            <Route path="/3d" element={<Navigate to="/design/3d" replace />} />
            <Route path="/design/:mode?" element={<DesignWorkspace />} />
            <Route path="/rack" element={<ConnectedRackElevationView />} />
            <Route path="/schedule" element={<ConnectedCableScheduleView />} />
            <Route path="/compliance" element={<div style={{padding: '2rem'}}><DsarSurface /></div>} />
            <Route path="*" element={<ErrorState error={{ code: -32005 }} />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </SessionContext.Provider>
  );
}
`;

// Inject the imports at the top
code = code.replace("import fixtureGymmen", "import { bffClient } from '../api/client';\nimport { LoadingState } from './loading-state';\nimport fixtureGymmen");

// Replace Layout
code = code.replace(/function Layout\(\{ children \}: \{ children: ReactNode \}\) \{[\s\S]*?    \);\n  \}/, layoutCode.trim());

// Replace AppShell
code = code.replace(/export function AppShell\(\) \{[\s\S]*?    \);\n  \}\n/, appShellCode.trim() + '\n');

fs.writeFileSync('app/src/shell/index.tsx', code);
