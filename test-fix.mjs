import fs from 'fs';
let code = fs.readFileSync('app/src/shell/index.test.tsx', 'utf8');

const newTest = `
  it('proves the fixture path is unreachable without the env flag', async () => {
    // Override env flag to undefined
    const originalEnv = (import.meta as any).env;
    (import.meta as any).env = { VITE_COPPER_FIXTURE: undefined };

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        error: { code: -32005 }
      })
    });
    vi.stubGlobal('fetch', fetchMock);

    render(React.createElement(AppShell));
    
    // fetch should have been called (since it's not fixture)
    // Actually first fetch is /api/session
    expect(fetchMock).toHaveBeenCalledWith('/api/session');

    // Restore
    (import.meta as any).env = originalEnv;
    vi.unstubAllGlobals();
  });
`;

code = code.replace("});\n", "});\n" + newTest);

// Add basic fetch mock to beforeEach so existing tests don't crash
const fetchMockSetup = `
beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      namespace: 'test',
      actor: 'test-user',
      // And for the topology call:
      designLabel: 'test',
      revision: '1',
      sites: [], locations: [], racks: [], deviceTypes: [], devices: [], cables: [], signalClasses: []
    })
  }));
});
`;
code = code.replace("afterEach(() => {", fetchMockSetup + "\nafterEach(() => {");

fs.writeFileSync('app/src/shell/index.test.tsx', code);
