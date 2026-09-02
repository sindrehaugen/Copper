const fs = require('fs');
let code = fs.readFileSync('packages/acoustics/src/adapter.ts', 'utf-8');

code = code.replace(/let cableType: string = .*/g, "let cableType: string = '';\n    if (cableFromParent?.type && db.cables[cableFromParent.type]) {\n      cableType = cableFromParent.type;\n    } else if (cableFromParent?.customFields?.acoustics?.device_class === 'cable') {\n      cableType = cableFromParent.id;\n    }");

fs.writeFileSync('packages/acoustics/src/adapter.ts', code);
console.log('Fixed adapter.ts cableType definitively');
