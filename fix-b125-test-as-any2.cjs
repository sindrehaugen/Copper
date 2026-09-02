const fs = require('fs');
let code = fs.readFileSync('app/src/validation/b125-accept.test.ts', 'utf-8');

code = code.replace(/const doc: DesignDocument = \{/g, "const doc: any = {");

fs.writeFileSync('app/src/validation/b125-accept.test.ts', code);
console.log('Fixed b125 test as any properly');
