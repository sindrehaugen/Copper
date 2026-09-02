const fs = require('fs');
let code = fs.readFileSync('app/src/validation/b125-accept.test.ts', 'utf-8');

// Fix powerPorts
code = code.replace(/powerPorts: \[\{ name: 'AC', kind: 'input', maximumDrawWatts: 15 \}\]/g, "powerPorts: [{ name: 'AC', maximumDrawWatts: 15 }]");
code = code.replace(/powerPorts: \[\{ name: 'DC', kind: 'input', allocatedDrawWatts: 25 \}\]/g, "powerPorts: [{ name: 'DC', allocatedDrawWatts: 25 }]");

// Fix portRefs
code = code.replace(/portRef: \{ name: 'eth1' \}/g, "portRef: { name: 'eth1', kind: 'interface' }");
code = code.replace(/portRef: \{ name: 'eth2' \}/g, "portRef: { name: 'eth2', kind: 'interface' }");
code = code.replace(/portRef: \{ name: 'eth3' \}/g, "portRef: { name: 'eth3', kind: 'interface' }");
code = code.replace(/portRef: \{ name: 'eth4' \}/g, "portRef: { name: 'eth4', kind: 'interface' }");
code = code.replace(/portRef: \{ name: 'out' \}/g, "portRef: { name: 'out', kind: 'interface' }");
code = code.replace(/portRef: \{ name: 'in' \}/g, "portRef: { name: 'in', kind: 'interface' }");

fs.writeFileSync('app/src/validation/b125-accept.test.ts', code);
console.log('Fixed B125 test schema properties');
