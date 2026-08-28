import { describe, it, expect } from 'vitest';
import { validatePoEBudget } from './poe-budget';
import { Device, Cable } from '../model/schema';

describe('validatePoEBudget', () => {
  const switchDevice: Device = {
    id: 'sw1',
    deviceTypeId: 'dt-sw',
    siteId: 'site1',
    status: 'active',
    powerPorts: [
      {
        id: 'pp1',
        name: 'Power 1',
        maximumDrawWatts: 100, // 100W budget
      }
    ]
  };

  const switchNoBudget: Device = {
    id: 'sw2',
    deviceTypeId: 'dt-sw',
    siteId: 'site1',
    status: 'active',
    powerPorts: [
      {
        id: 'pp2',
        name: 'Power 2',
      }
    ]
  };

  const devClass4: Device = {
    id: 'd1',
    deviceTypeId: 'dt-1',
    siteId: 'site1',
    status: 'active',
    powerPorts: [
      {
        id: 'pp-d1',
        name: 'PoE In',
        description: 'PoE Class 4',
      }
    ]
  };

  const devAllocated: Device = {
    id: 'd2',
    deviceTypeId: 'dt-2',
    siteId: 'site1',
    status: 'active',
    powerPorts: [
      {
        id: 'pp-d2',
        name: 'PoE In',
        allocatedDrawWatts: 20,
        description: 'PoE Class 4', // Should be ignored in favor of allocatedDrawWatts
      }
    ]
  };

  const devDesc: Device = {
    id: 'd3',
    deviceTypeId: 'dt-3',
    siteId: 'site1',
    status: 'active',
    description: 'Requires Class 3 PoE',
  };

  const emptyCables: Cable[] = [];

  it('calculates budget correctly under limit', () => {
    // 30W (Class 4) + 20W (Allocated) + 15.4W (Class 3) = 65.4W <= 100W
    const result = validatePoEBudget(switchDevice, [devClass4, devAllocated, devDesc], emptyCables);
    expect(result.valid).toBe(true);
    expect(result.totalDrawWatts).toBe(65.4);
    expect(result.budgetWatts).toBe(100);
    expect(result.errors.length).toBe(0);
  });

  it('fails validation when over budget', () => {
    // 30W * 4 = 120W > 100W
    const result = validatePoEBudget(switchDevice, [devClass4, devClass4, devClass4, devClass4], emptyCables);
    expect(result.valid).toBe(false);
    expect(result.totalDrawWatts).toBe(120);
    expect(result.budgetWatts).toBe(100);
    expect(result.errors.length).toBe(1);
    expect(result.errors[0]).toContain('exceeds switch budget');
  });

  it('passes when switch has no budget defined', () => {
    // 120W, but no budget
    const result = validatePoEBudget(switchNoBudget, [devClass4, devClass4, devClass4, devClass4], emptyCables);
    expect(result.valid).toBe(true);
    expect(result.totalDrawWatts).toBe(120);
    expect(result.budgetWatts).toBeUndefined();
    expect(result.errors.length).toBe(0);
  });
});
