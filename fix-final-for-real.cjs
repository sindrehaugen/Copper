const fs = require('fs');

let sel = fs.readFileSync('app/src/validation/selectors.test.ts', 'utf-8');
sel = sel.replace(/const \{ result: findingResult \} = renderHook\(\(\) => useDocumentFindings\(\)\);/g, "void renderHook(() => useDocumentFindings());");
sel = sel.replace(/const finding = findingResult2\.current\.find\(f => f\.source === 'Test'\);/g, "const finding = findingResult2.current.find(f => f.source === 'Test')!;");
fs.writeFileSync('app/src/validation/selectors.test.ts', sel);

let ad = fs.readFileSync('packages/acoustics/src/adapter.ts', 'utf-8');
ad = ad.replace(/speakerId: isSpeaker \? \(\(dev\.typeId \|\| dev\.deviceTypeId \|\| ''\) as string\) : '',/g, "speakerId: isSpeaker ? (dev.typeId as string) || (dev.deviceTypeId as string) || '' : '',");
ad = ad.replace(/speakerId: isSpeaker \? \(dev\.typeId \|\| dev\.deviceTypeId \|\| ''\) : '',/g, "speakerId: isSpeaker ? (dev.typeId as string) || (dev.deviceTypeId as string) || '' : '',");
fs.writeFileSync('packages/acoustics/src/adapter.ts', ad);

console.log('Fixed final TS errors for real');
