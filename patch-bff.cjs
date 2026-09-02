const fs = require('fs');
let code = fs.readFileSync('bff/src/index.ts', 'utf-8');

code = code.replace(/import \{ requireAuth \} from '\.\/auth';/g, "import { requireAuth } from './auth';\nimport { designRoutes } from './routes/design';\nimport { meRoutes } from './routes/me';");
code = code.replace(/app\.route\('\/api\/design', designRoutes\);/g, "app.route('/api/design', designRoutes);\n  app.route('/api/me', meRoutes);");

fs.writeFileSync('bff/src/index.ts', code);
console.log('Fixed bff index');
