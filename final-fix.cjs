const fs = require('fs');

function fixFile(file, replacements) {
  if (fs.existsSync(file)) {
    let code = fs.readFileSync(file, 'utf-8');
    for (const [find, replace] of replacements) {
      code = code.replace(find, replace);
    }
    fs.writeFileSync(file, code);
  }
}

// 1. b127.test.tsx
fixFile('app/src/components/compliance/b127.test.tsx', [
  [/import React from 'react';/, '']
]);

// 2. shell/index.tsx
fixFile('app/src/shell/index.tsx', [
  [/const \{ t \} = useTranslation\(\);\n  const document = useDocumentStore/g, 'const document = useDocumentStore'],
  [/const \{ t \} = useTranslation\(\);\n  const boot = async \(\)/g, 'const boot = async ()']
]);

// 3. EdgeInspector, NodeInspector, LegendNode: they are function declarations or export const ... = () => {
// Let's just add const { t } = useTranslation(); manually inside their body.

const addT = (code, componentName) => {
  const r = new RegExp(`(const ${componentName}(?:\\s*:.*?)?\\s*=\\s*\\([^)]*\\)\\s*=>\\s*\\{)`);
  return code.replace(r, `$1\n  const { t } = useTranslation();`);
};

const addTFunc = (code, componentName) => {
  const r = new RegExp(`(function ${componentName}\\([^)]*\\)\\s*\\{)`);
  return code.replace(r, `$1\n  const { t } = useTranslation();`);
};

['EdgeInspector', 'NodeInspector'].forEach(name => {
  const f = `app/src/views/canvas/${name}.tsx`;
  if(fs.existsSync(f)) {
     let c = fs.readFileSync(f, 'utf-8');
     c = addTFunc(c, name);
     c = addT(c, name); // just in case it's a const
     fs.writeFileSync(f, c);
  }
});

const lnFile = 'app/src/views/canvas/nodes/LegendNode.tsx';
if(fs.existsSync(lnFile)) {
   let c = fs.readFileSync(lnFile, 'utf-8');
   c = addT(c, 'LegendNode');
   fs.writeFileSync(lnFile, c);
}

// 4. RackElevationView.tsx: redeclared 't'
fixFile('app/src/views/rack/RackElevationView.tsx', [
  [/const \{ t \} = useTranslation\(\);\n  const \{ t \} = useTranslation\(\);/g, 'const { t } = useTranslation();'],
  [/const \{ t \} = useTranslation\(\);\n  const updateDocument = useDocumentStore\(s => s\.updateDocument\);\n  const \{ t \} = useTranslation\(\);/g, 'const { t } = useTranslation();\n  const updateDocument = useDocumentStore(s => s.updateDocument);']
]);

// 5. SceneView.tsx: 't' is declared but never read. Wait, if it's never read, I can just remove it, but I shouldn't cause errors.
// The error says "SceneView.tsx(52,9): error TS6133: 't' is declared but its value is never read."
fixFile('app/src/views/scene/SceneView.tsx', [
  [/const \{ t \} = useTranslation\(\);/g, '']
]);

console.log('Fixed remaining TS errors');
