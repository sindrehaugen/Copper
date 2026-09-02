import fs from 'fs';
let code = fs.readFileSync('app/src/projection/layout.test.ts', 'utf8');
code = code.replace(/dst1\.position\.x/g, "dst1.x");
fs.writeFileSync('app/src/projection/layout.test.ts', code);
