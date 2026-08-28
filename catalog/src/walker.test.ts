import { describe, it, expect, beforeEach } from 'vitest';
import { walkDirectory } from './walker';
import { join } from 'path';
import { rm, mkdir, writeFile } from 'fs/promises';

const FIXTURES_DIR = join(__dirname, '../../tests/fixtures/walker');

describe('walker', () => {
  beforeEach(async () => {
    await rm(FIXTURES_DIR, { recursive: true, force: true });
    await mkdir(join(FIXTURES_DIR, 'vendor-a'), { recursive: true });
    await writeFile(join(FIXTURES_DIR, 'vendor-a', 'device-1.yaml'), `---
manufacturer: Vendor A
model: Device 1
slug: vendor-a-device-1
`);
    await writeFile(join(FIXTURES_DIR, 'vendor-a', 'device-2.yml'), `---
manufacturer: Vendor A
model: Device 2
slug: vendor-a-device-2
`);
    
    await mkdir(join(FIXTURES_DIR, 'vendor-b', 'sub'), { recursive: true });
    await writeFile(join(FIXTURES_DIR, 'vendor-b', 'sub', 'device-3.yaml'), `---
manufacturer: Vendor B
model: Device 3
slug: vendor-b-device-3
`);
  });

  it('should recursively walk directory and build map with correct keys', async () => {
    const map = await walkDirectory(FIXTURES_DIR);
    expect(map.size).toBe(3);
    expect(map.has('vendor-a-device-1')).toBe(true);
    expect(map.has('vendor-a-device-2')).toBe(true);
    expect(map.has('vendor-b-device-3')).toBe(true);
    
    const d1 = map.get('vendor-a-device-1');
    expect(d1?.manufacturer).toBe('Vendor A');
    expect(d1?.model).toBe('Device 1');
  });
});
