import fs from 'fs';
let code = fs.readFileSync('app/src/shell/index.tsx', 'utf8');

// Fix unused 't'
code = code.replace("const { t } = useTranslation();", "");

// Fix import.meta.env
code = code.replace("if (import.meta.env.VITE_COPPER_FIXTURE === '1')", "if ((import.meta as any).env.VITE_COPPER_FIXTURE === '1')");

// Fix export of ConnectedCanvasView
code = code.replace("function ConnectedCanvasView() {", "export function ConnectedCanvasView() {");

fs.writeFileSync('app/src/shell/index.tsx', code);
