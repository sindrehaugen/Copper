import fs from 'fs';
let code = fs.readFileSync('app/src/api/client.ts', 'utf8');
code = code.replace(/  promoteTopology: async \(\) => \{\n    \/\/ This method is a stub since promote was removed from BFF\n    \/\/ We just return a mock revision\.\n    return \{ revision: 'removed' \};\n  \}/, '');
// Handle trailing comma
code = code.replace(/,\n\n\};/, '\n};');
fs.writeFileSync('app/src/api/client.ts', code);
