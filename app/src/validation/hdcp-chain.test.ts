import { describe, it, expect } from 'vitest';
import { validateHDCPChain } from './hdcp-chain';
import { Device } from '../model/schema';

describe('validateHDCPChain', () => {
  const createMockDevice = (hdcpVersion: string | undefined): Device => {
    return {
      id: 'dev1',
      deviceTypeId: 'type1',
      siteId: 'site1',
      status: 'active',
      hdcpVersion
    } as unknown as Device;
  };

  it('triggers warning for 2.2 source to 1.4 display', () => {
    const source = createMockDevice('2.2');
    const display = createMockDevice('1.4');
    const result = validateHDCPChain(source, [display]);
    
    expect(result.valid).toBe(false);
    expect(result.lowestVersion).toBe('1.4');
  });

  it('does not trigger warning for 1.4 source to 2.2 display', () => {
    const source = createMockDevice('1.4');
    const display = createMockDevice('2.2');
    const result = validateHDCPChain(source, [display]);
    
    expect(result.valid).toBe(true);
  });
});
