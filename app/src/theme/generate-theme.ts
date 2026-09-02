import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateThemeCss } from './tokens';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const css = generateThemeCss();
writeFileSync(join(__dirname, 'theme.css'), css, 'utf8');
console.log('Successfully generated theme.css');
