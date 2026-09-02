const fs = require('fs');
let code = fs.readFileSync('app/src/validation/selectors.test.ts', 'utf-8');

code = code.replace(/import \{ vi \} from 'vitest';\n/g, "");
code = code.replace(/const finding = enhanced\[0\];/g, "const finding = enhanced[0]!;");
code = code.replace(/const findingResult = /g, "");

fs.writeFileSync('app/src/validation/selectors.test.ts', code);
console.log('Fixed selectors test');
