const fs = require('fs');
let c;

c = fs.readFileSync('app/src/shell/index.tsx', 'utf-8');
c = c.replace(/function ConnectedCanvasView\(\) \{/g, 'function ConnectedCanvasView() {\n  const { t } = useTranslation();');
fs.writeFileSync('app/src/shell/index.tsx', c);

c = fs.readFileSync('app/src/views/canvas/nodes/LegendNode.tsx', 'utf-8');
c = c.replace(/export const LegendNode = \(\{\n  data\n\}\) => \{/g, 'export const LegendNode = ({\n  data\n}) => {\n  const { t } = useTranslation();');
c = c.replace(/export const LegendNode = \(\{ data \}: \{ data: LegendData \}\) => \{/g, 'export const LegendNode = ({ data }: { data: LegendData }) => {\n  const { t } = useTranslation();');
// Let's just blindly inject it if we can't match exactly.
if (!c.includes('const { t } = useTranslation();')) {
  c = c.replace(/export const LegendNode.*?=>\s*\{/, match => match + '\n  const { t } = useTranslation();');
}
fs.writeFileSync('app/src/views/canvas/nodes/LegendNode.tsx', c);

c = fs.readFileSync('app/src/views/scene/SceneView.tsx', 'utf-8');
if (!c.includes('const { t } = useTranslation();')) {
  c = c.replace(/export const SceneView.*?=>\s*\{/, match => match + '\n  const { t } = useTranslation();');
}
fs.writeFileSync('app/src/views/scene/SceneView.tsx', c);

console.log('Fixed final 3 TS errors');
