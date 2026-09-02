const fs = require('fs');
let code = fs.readFileSync('app/src/validation/hdcp-chain.ts', 'utf-8');

code = code.replace(/DeviceType/g, "");
code = code.replace(/Device,  \} from/g, "Device } from");

fs.writeFileSync('app/src/validation/hdcp-chain.ts', code);
console.log('Fixed hdcp chain');
