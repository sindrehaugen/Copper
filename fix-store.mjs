import fs from 'fs';
let code = fs.readFileSync('app/src/store/documentStore.ts', 'utf8');
code = code.replace(/  promoteTopology: \(namespace: string, targetStatus: string, expectedVersion: string\) => Promise<\{ revision: string \}>;\n/, '');
code = code.replace(/  promoteDocument: \(client: StoreApiClient, namespace: string, targetStatus: string\) => Promise<void>;\n/, '');

// Now remove the promoteDocument implementation
const startStr = "  promoteDocument: async (client: StoreApiClient, namespace: string, targetStatus: string) => {";
const endStr = "  },\n\n  setSelectedIds";

const startIdx = code.indexOf(startStr);
const endIdx = code.indexOf(endStr);

if (startIdx !== -1 && endIdx !== -1) {
  code = code.substring(0, startIdx) + "  setSelectedIds" + code.substring(endIdx + endStr.length);
}

fs.writeFileSync('app/src/store/documentStore.ts', code);
