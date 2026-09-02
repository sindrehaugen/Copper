const fs = require('fs');

['app/src/components/compliance/DsarSurface.tsx', 'app/src/components/compliance/AiConfirmDialog.tsx', 'app/src/components/compliance/ProvenanceViewer.tsx'].forEach(file => {
  let code = fs.readFileSync(file, 'utf-8');
  code = code.replace(/t\('([a-zA-Z0-9_]+)'/g, "t('compliance.$1'");
  code = code.replace(/t\('([a-zA-Z0-9_]+)',/g, "t('compliance.$1',");
  fs.writeFileSync(file, code);
});
console.log('Fixed prefix');
