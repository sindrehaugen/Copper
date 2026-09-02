const fs = require('fs');
let c;

// 1. shell/index.tsx (remove unused 't')
c = fs.readFileSync('app/src/shell/index.tsx', 'utf-8');
c = c.replace(/function ConnectedCanvasView\(\) \{\n  const \{ t \} = useTranslation\(\);/g, 'function ConnectedCanvasView() {');
c = c.replace(/export function AppShell\(\) \{\n  const \{ t \} = useTranslation\(\);/g, 'export function AppShell() {');
fs.writeFileSync('app/src/shell/index.tsx', c);

// 2. cable-schedule/CableScheduleView.tsx (redeclared 't')
c = fs.readFileSync('app/src/views/cable-schedule/CableScheduleView.tsx', 'utf-8');
c = c.replace(/const \{ t \} = useTranslation\(\);\n  const \{ t \} = useTranslation\(\);/g, 'const { t } = useTranslation();');
fs.writeFileSync('app/src/views/cable-schedule/CableScheduleView.tsx', c);

// 3. rack/RackElevationView.tsx (redeclared 't')
c = fs.readFileSync('app/src/views/rack/RackElevationView.tsx', 'utf-8');
c = c.replace(/const \{ t \} = useTranslation\(\);\n  const \{ t \} = useTranslation\(\);/g, 'const { t } = useTranslation();');
c = c.replace(/const \{ t \} = useTranslation\(\);\n  const updateDocument = useDocumentStore\(s => s\.updateDocument\);\n  const \{ t \} = useTranslation\(\);/g, 'const { t } = useTranslation();\n  const updateDocument = useDocumentStore(s => s.updateDocument);');
fs.writeFileSync('app/src/views/rack/RackElevationView.tsx', c);

// 4. canvas/nodes/LegendNode.tsx (missing 't')
c = fs.readFileSync('app/src/views/canvas/nodes/LegendNode.tsx', 'utf-8');
c = c.replace(/export const LegendNode = \(\{ data \}: \{ data: LegendData \}\) => \{/g, 'export const LegendNode = ({ data }: { data: LegendData }) => {\n  const { t } = useTranslation();');
// Make sure useTranslation is imported
if (!c.includes('useTranslation')) {
  c = "import { useTranslation } from 'react-i18next';\n" + c;
}
fs.writeFileSync('app/src/views/canvas/nodes/LegendNode.tsx', c);

// 5. scene/SceneView.tsx (missing 't')
c = fs.readFileSync('app/src/views/scene/SceneView.tsx', 'utf-8');
c = c.replace(/export const SceneView = \(\) => \{/g, 'export const SceneView = () => {\n  const { t } = useTranslation();');
if (!c.includes('useTranslation')) {
  c = "import { useTranslation } from 'react-i18next';\n" + c;
}
fs.writeFileSync('app/src/views/scene/SceneView.tsx', c);

console.log('Fixed final 5 TS errors');
