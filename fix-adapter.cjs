const fs = require('fs');
let code = fs.readFileSync('packages/acoustics/src/adapter.ts', 'utf-8');

code = code.replace(/let cableType: string = .*?;/g, "let cableType: string = (cableFromParent?.type && db.cables[cableFromParent.type]) ? (cableFromParent.type as string) : (cableFromParent?.customFields?.acoustics?.device_class === 'cable' ? cableFromParent.id : '');");

fs.writeFileSync('packages/acoustics/src/adapter.ts', code);
console.log('Fixed adapter.ts cableType');
