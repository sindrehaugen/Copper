import fs from 'fs';
let code = fs.readFileSync('app/src/shell/index.tsx', 'utf8');

// 1. Export ConnectedCanvasView
code = code.replace("function ConnectedCanvasView() {", "export function ConnectedCanvasView() {");

// 2. Fix the bff session endpoint type error
let bffCode = fs.readFileSync('bff/src/index.ts', 'utf8');
bffCode = bffCode.replace("app.get('/api/session', (c) => c.json(c.get('session')));", "app.get('/api/session', (c) => c.json(c.get('session' as any)));");
fs.writeFileSync('bff/src/index.ts', bffCode);

// 3. Replace AppShell to the end of the file
const appShellIdx = code.indexOf('export function AppShell() {');
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

code = code.substring(0, appShellIdx) + newAppShell;
fs.writeFileSync('app/src/shell/index.tsx', code);
