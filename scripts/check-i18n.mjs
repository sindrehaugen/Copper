import fs from 'fs';
import path from 'path';

const enPath = path.join('app', 'src', 'locales', 'en.json');
const nbNOPath = path.join('app', 'src', 'locales', 'nb-NO.json');

const enJson = JSON.parse(fs.readFileSync(enPath, 'utf-8'));
const nbNOJson = JSON.parse(fs.readFileSync(nbNOPath, 'utf-8'));

function extractKeys(obj, prefix = '') {
  let keys = [];
  for (const k in obj) {
    if (typeof obj[k] === 'object' && obj[k] !== null) {
      keys = keys.concat(extractKeys(obj[k], prefix + k + '.'));
    } else {
      keys.push(prefix + k);
    }
  }
  return keys;
}

const enKeys = extractKeys(enJson);
const nbNOKeys = extractKeys(nbNOJson);

let failed = false;

for (const key of enKeys) {
  if (!nbNOKeys.includes(key)) {
    console.error(`[ERROR] Key '${key}' is missing in nb-NO.json`);
    failed = true;
  }
}

for (const key of nbNOKeys) {
  if (!enKeys.includes(key)) {
    console.error(`[ERROR] Key '${key}' is missing in en.json`);
    failed = true;
  }
}

if (failed) {
  process.exit(1);
} else {
  console.log('[OK] i18n key parity gate passed.');
}
