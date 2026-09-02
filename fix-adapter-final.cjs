const fs = require('fs');
let ad = fs.readFileSync('packages/acoustics/src/adapter.ts', 'utf-8');
ad = ad.replace(/cableType = dbCableKeys\[0\];/g, "cableType = dbCableKeys[0] as string;");
fs.writeFileSync('packages/acoustics/src/adapter.ts', ad);
console.log('Fixed adapter.ts cableType array access');
