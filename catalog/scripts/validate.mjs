/* global console, process */
import fs from 'fs';
import path from 'path';
import * as yaml from 'js-yaml';
import Ajv from 'ajv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ajv = new Ajv();
const schemaPath = path.join(__dirname, '../schema/copper-extensions.schema.json');
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
const validate = ajv.compile(schema);

export function validateFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let parsed;
  try {
    parsed = yaml.load(content);
  } catch {
    return { valid: false, errors: [{ message: 'Invalid YAML format' }] };
  }
  const valid = validate(parsed);
  return { valid, errors: validate.errors };
}

function walkSync(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      fileList = walkSync(dirFile, fileList);
    } else {
      if (file.endsWith('.yaml') || file.endsWith('.yml')) {
        fileList.push(dirFile);
      }
    }
  });
  return fileList;
}

export function validateDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) return true;
  let allValid = true;
  const files = walkSync(dirPath);
  for (const filePath of files) {
    const result = validateFile(filePath);
    if (!result.valid) {
      console.error('Validation failed for ' + filePath + ':', result.errors);
      allValid = false;
    } else {
      console.log('Validated ' + filePath);
    }
  }
  return allValid;
}

if (import.meta.url.endsWith('validate.mjs')) {
  const dirs = process.argv.slice(2);
  if (dirs.length === 0) {
    dirs.push('catalog/bravo', 'catalog/audio');
  }
  let success = true;
  for (const d of dirs) {
    let targetDir = path.isAbsolute(d) ? d : path.join(process.cwd(), d);
    if (!validateDirectory(targetDir)) {
      success = false;
    }
  }
  if (!success) {
    process.exit(1);
  } else {
    console.log('All files passed validation.');
  }
}
