import assert from 'assert';
import { validateString } from './validate.mjs';

const validYaml = `
manufacturer: Bravo
model: X1
slug: bravo-x1
copper_extensions:
  ports:
    "eth0":
      signal_class: "ethernet"
    "eth1":
      signal_class: "ethernet"
`;

const invalidYaml = `
manufacturer: Bravo
model: X2
slug: bravo-x2
copper_extensions:
  ports:
    "eth0":
      wrong_key: "ethernet"
`;

console.log('Testing valid YAML...');
const result1 = validateString(validYaml);
assert.strictEqual(result1.valid, true, 'Valid YAML should pass');

console.log('Testing invalid YAML...');
const result2 = validateString(invalidYaml);
assert.strictEqual(result2.valid, false, 'Invalid YAML should fail');

console.log('All validate tests passed.');
