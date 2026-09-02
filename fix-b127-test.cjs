const fs = require('fs');
let code = fs.readFileSync('app/src/components/compliance/b127.test.tsx', 'utf-8');
code = code.replace(/import \{ describe, it, expect, vi, beforeEach \} from 'vitest';/, "import { describe, it, expect, vi, beforeEach } from 'vitest';\nimport '@testing-library/jest-dom';");
code = code.replace(/screen\.getByLabelText\(\/Human Override\/i\)/, "screen.getByLabelText('compliance.humanOverride')");
code = code.replace(/screen\.getByText\(\/Confirm with Override\/i\)/, "screen.getByText('compliance.confirmOverrideBtn')");
fs.writeFileSync('app/src/components/compliance/b127.test.tsx', code);
console.log('Fixed b127 test');
