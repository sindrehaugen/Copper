/* global process, console */
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

export function validateString(content) {
  let parsed;
  try {
    parsed = yaml.load(content);
  } catch {
    return { valid: false, errors: [{ message: 'Invalid YAML format' }] };
  }

  const valid = validate(parsed);
  return { valid, errors: validate.errors };
}

export function validateDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return true;
  }
  let allValid = true;
  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const result = validateFile(filePath);
    if (!result.valid) {
      console.error(`Validation failed for ${filePath}:`, result.errors);
      allValid = false;
    } else {
      console.log(`Validated ${filePath}`);
    }
  }
  return allValid;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  let targetDir = process.argv[2] || path.join(process.cwd(), 'catalog/bravo');
  if (!path.isAbsolute(targetDir)) {
    targetDir = path.join(process.cwd(), targetDir);
  }
  const success = validateDirectory(targetDir);
  if (!success) {
    process.exit(1);
  } else {
    console.log('All files passed validation.');
  }
}
