import fs from 'fs';
let code = fs.readFileSync('app/src/shell/index.test.tsx', 'utf8');
code = code.replace("import { expect, it, describe, afterEach, vi } from 'vitest';", "import { expect, it, describe, afterEach, beforeEach, vi } from 'vitest';");
fs.writeFileSync('app/src/shell/index.test.tsx', code);
