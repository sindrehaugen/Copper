const fs = require('fs');
let code = fs.readFileSync('app/src/validation/selectors.test.ts', 'utf-8');

code = code.replace(/import \{ vi \} from 'vitest';\n/g, "");
code = code.replace(/import \{.*?\} from '\.\.\/model\/schema';\n/g, "");
code = code.replace(/finding\.fix\(\);/g, "finding.fix?.();");

fs.writeFileSync('app/src/validation/selectors.test.ts', code);
console.log('Fixed selectors test');
