const fs = require('fs');
let code = fs.readFileSync('app/src/validation/rack-fit.ts', 'utf-8');

code = code.replace(/const d1 = placedDevices\[i\];/g, "const d1 = placedDevices[i]!;");
code = code.replace(/const d2 = placedDevices\[j\];/g, "const d2 = placedDevices[j]!;");

fs.writeFileSync('app/src/validation/rack-fit.ts', code);
console.log('Fixed rack-fit.ts');
