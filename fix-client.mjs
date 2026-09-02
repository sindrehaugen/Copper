import fs from 'fs';
let code = fs.readFileSync('bff/src/nce-client/index.ts', 'utf8');

// 1. Remove promoteTopology
code = code.replace(/  \n  async promoteTopology[\s\S]*?return data as \{ revision: string \};\n  \}\n/, '');

// 2. Remove dead !res.ok re-checks
const deadCheck = `  
    if (!res.ok) {
      if (res.status === 403) {
        throw new GovernanceDisabledError(\`Governance disabled: \${res.statusText}\`);
      }
      throw new Error(\`NCE API error: \${res.status} \${res.statusText}\`);
    }`;

code = code.replaceAll(deadCheck, '');

// 3. Remove try/catch swallow
const tryCatchMatch = /try \{\s*const data = JSON\.parse\(text\);\s*if \(data\.error && data\.error\.code === -32005\) \{\s*throw new GovernanceDisabledError\('Governance disabled \(-32005\)'\);\s*\}\s*\} catch \{ \/\* ignore \*\/ \}/g;

const replacement = `const data = JSON.parse(text);
        if (data.error && data.error.code === -32005) {
          throw new GovernanceDisabledError('Governance disabled (-32005)');
        }`;

code = code.replaceAll(tryCatchMatch, replacement);

fs.writeFileSync('bff/src/nce-client/index.ts', code);
