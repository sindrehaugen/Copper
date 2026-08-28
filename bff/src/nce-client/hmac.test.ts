import { describe, it, expect } from 'vitest';
import { computeHmacSignature } from './hmac.js';
import { createHmac, createHash } from 'node:crypto';

describe('computeHmacSignature', () => {
  it('computes canonical signature without body', () => {
    const method = 'get'; // Changed to lowercase to verify normalization
    const path = '/api/system-design/topology?namespace=test';
    const timestamp = '1690000000';
    const secret = 'test-secret';
    
    const expectedCanonical = ['GET', path, timestamp].join('\n');
    const expectedSig = createHmac('sha256', secret).update(expectedCanonical, 'utf8').digest('hex');
    
    const sig = computeHmacSignature(method, path, timestamp, undefined, secret);
    expect(sig).toBe(expectedSig);
  });

  it('computes canonical signature with body', () => {
    const method = 'post'; // Changed to lowercase to verify normalization
    const path = '/api/system-design/validate';
    const timestamp = '1690000000';
    const body = JSON.stringify({ namespace: 'test', design_label: 'v1' });
    const secret = 'test-secret';
    
    const bodyHash = createHash('sha256').update(body, 'utf8').digest('hex');
    const expectedCanonical = ['POST', path, timestamp, bodyHash].join('\n');
    const expectedSig = createHmac('sha256', secret).update(expectedCanonical, 'utf8').digest('hex');
    
    const sig = computeHmacSignature(method, path, timestamp, body, secret);
    expect(sig).toBe(expectedSig);
  });
});
