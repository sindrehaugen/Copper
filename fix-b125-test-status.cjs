const fs = require('fs');
let code = fs.readFileSync('app/src/validation/b125-accept.test.ts', 'utf-8');

code = code.replace(/\{ id: 'c-poe'/g, "{ id: 'c-poe', status: 'planned'");
code = code.replace(/\{ id: 'c-len'/g, "{ id: 'c-len', status: 'planned'");
code = code.replace(/\{ id: 'c-occ1'/g, "{ id: 'c-occ1', status: 'planned'");
code = code.replace(/\{ id: 'c-occ2'/g, "{ id: 'c-occ2', status: 'planned'");
code = code.replace(/\{ id: 'c-hdcp'/g, "{ id: 'c-hdcp', status: 'planned'");
code = code.replace(/\{ id: 'c-audio'/g, "{ id: 'c-audio', status: 'planned'");

fs.writeFileSync('app/src/validation/b125-accept.test.ts', code);
console.log('Fixed B125 test schema properties again');
