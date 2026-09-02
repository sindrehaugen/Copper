const fs = require('fs');
let sel = fs.readFileSync('app/src/validation/selectors.test.ts', 'utf-8');
sel = sel.replace(/expect\(schedResult\.current\[0\]\.lengthM\)\.toBe\(42\);/g, "expect(schedResult.current[0]!.lengthM).toBe(42);");
fs.writeFileSync('app/src/validation/selectors.test.ts', sel);
console.log('Fixed selectors test array access');
