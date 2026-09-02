const fs = require('fs');

let b125 = fs.readFileSync('app/src/validation/b125-accept.test.ts', 'utf-8');
b125 = b125.replace(/import \{ DesignDocument.*?\} from '\.\.\/model\/schema';\n/g, "");
fs.writeFileSync('app/src/validation/b125-accept.test.ts', b125);

let sel = fs.readFileSync('app/src/validation/selectors.test.ts', 'utf-8');
sel = sel.replace(/const finding = enhanced\[0\];/g, "const finding = enhanced[0]!;");
sel = sel.replace(/const findingResult = /g, "void ");
fs.writeFileSync('app/src/validation/selectors.test.ts', sel);

let ad = fs.readFileSync('packages/acoustics/src/adapter.ts', 'utf-8');
ad = ad.replace(/speakerId: isSpeaker \? \(dev\.typeId \|\| dev\.deviceTypeId \|\| ''\) : '',/g, "speakerId: isSpeaker ? ((dev.typeId || dev.deviceTypeId || '') as string) : '',");
fs.writeFileSync('packages/acoustics/src/adapter.ts', ad);

console.log('Fixed last TS errors');
