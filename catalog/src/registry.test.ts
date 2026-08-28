import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CatalogRegistry, initialize, getDeviceType, getAllDeviceTypes } from './registry';
import { DeviceType } from '../../app/src/model/schema';
import * as walker from './walker';

vi.mock('./walker', () => ({
  walkDirectory: vi.fn()
}));

describe('CatalogRegistry', () => {
  const mockDevice1: DeviceType = {
    manufacturer: 'TestVendor',
    model: 'Model1',
    description: 'Test',
    type: 'dimmer',
    protocols: []
  };
  
  const mockDevice2: DeviceType = {
    manufacturer: 'TestVendor',
    model: 'Model2',
    description: 'Test',
    type: 'switch',
    protocols: []
  };

  const mockMap = new Map<string, DeviceType>([
    ['testvendor-model1', mockDevice1],
    ['testvendor-model2', mockDevice2]
  ]);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(walker.walkDirectory).mockResolvedValue(mockMap);
  });

  it('initializes and provides lookups via class', async () => {
    const registry = new CatalogRegistry();
    await registry.initialize('/fake/dir');
    expect(walker.walkDirectory).toHaveBeenCalledWith('/fake/dir');
    
    expect(registry.getDeviceType('testvendor-model1')).toBe(mockDevice1);
    expect(registry.getDeviceType('non-existent')).toBeUndefined();
    expect(registry.getAllDeviceTypes()).toEqual([mockDevice1, mockDevice2]);
  });

  it('initializes and provides lookups via module functions', async () => {
    await initialize('/fake/dir');
    expect(walker.walkDirectory).toHaveBeenCalledWith('/fake/dir');
    
    expect(getDeviceType('testvendor-model2')).toBe(mockDevice2);
    expect(getAllDeviceTypes()).toEqual([mockDevice1, mockDevice2]);
  });
});
