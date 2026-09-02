const fs = require('fs');
['app/src/components/compliance/DsarSurface.tsx', 'app/src/components/compliance/AiConfirmDialog.tsx', 'app/src/components/compliance/ProvenanceViewer.tsx'].forEach(file => {
  let code = fs.readFileSync(file, 'utf-8');
  code = code.replace(/useTranslation\('compliance'\)/g, "useTranslation()");
  fs.writeFileSync(file, code);
});
console.log('Fixed useTranslation calls');
