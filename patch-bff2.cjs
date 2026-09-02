const fs = require('fs');
let code = fs.readFileSync('bff/src/index.ts', 'utf-8');

code = code.replace(/import \{ designRoutes \} from '\.\/routes\/design';\n/g, "");

fs.writeFileSync('bff/src/index.ts', code);
console.log('Fixed duplicated import');
