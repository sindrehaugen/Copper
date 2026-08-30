/**
 * @vitest-environment node
 */
import { validateRackFit } from './rack-fit';
import { Rack, Device, DeviceType } from '../model/schema';
import { describe, it, expect } from 'vitest';

describe('validateRackFit', () => {
  const rack: Rack = {
    id: 'rack-1',
    name: 'Rack 1',
    siteId: 'site-1',
    uHeight: 42,
    status: 'active'
  };

  const deviceType1U: DeviceType = {
    id: 'dt-1u',
    manufacturer: 'Cisco',
    model: 'Switch',
    slug: 'cisco-switch',
    uHeight: 1,
    isFullDepth: false
  };

  const deviceType2U: DeviceType = {
    id: 'dt-2u',
    manufacturer: 'Dell',
    model: 'Server',
    slug: 'dell-server',
    uHeight: 2,
    isFullDepth: false
  };

  const deviceTypeFullDepth: DeviceType = {
    id: 'dt-full',
    manufacturer: 'HP',
    model: 'Big Server',
    slug: 'hp-big-server',
    uHeight: 2,
    isFullDepth: true
  };

  const dtMap = new Map<string, DeviceType>([
    [deviceType1U.id, deviceType1U],
    [deviceType2U.id, deviceType2U],
    [deviceTypeFullDepth.id, deviceTypeFullDepth],
  ]);

  const geoMap = {};

  it('allows valid placement', () => {
    const devices: Device[] = [
      { id: 'd1', deviceTypeId: 'dt-1u', rackId: 'rack-1', siteId: 'site-1', position: 1, face: 'front', status: 'active' },
      { id: 'd2', deviceTypeId: 'dt-2u', rackId: 'rack-1', siteId: 'site-1', position: 2, face: 'front', status: 'active' }
    ];
    
    const errors = validateRackFit(rack, devices, dtMap, geoMap);
    expect(errors).toHaveLength(0);
  });

  it('detects out of bounds bottom', () => {
    const devices: Device[] = [
      { id: 'd1', deviceTypeId: 'dt-1u', rackId: 'rack-1', siteId: 'site-1', position: 0, face: 'front', status: 'active' }
    ];
    
    const errors = validateRackFit(rack, devices, dtMap, geoMap);
    expect(errors).toHaveLength(1);
    expect(errors[0].issue).toBe('out_of_bounds');
    expect(errors[0].deviceId).toBe('d1');
  });

  it('detects out of bounds top', () => {
    const devices: Device[] = [
      { id: 'd1', deviceTypeId: 'dt-2u', rackId: 'rack-1', siteId: 'site-1', position: 42, face: 'front', status: 'active' }
    ];
    
    const errors = validateRackFit(rack, devices, dtMap, geoMap);
    expect(errors).toHaveLength(1);
    expect(errors[0].issue).toBe('out_of_bounds');
    expect(errors[0].deviceId).toBe('d1');
  });

  it('allows same U on opposite faces if not full depth', () => {
    const devices: Device[] = [
      { id: 'd1', deviceTypeId: 'dt-1u', rackId: 'rack-1', siteId: 'site-1', position: 10, face: 'front', status: 'active' },
      { id: 'd2', deviceTypeId: 'dt-1u', rackId: 'rack-1', siteId: 'site-1', position: 10, face: 'rear', status: 'active' }
    ];
    
    const errors = validateRackFit(rack, devices, dtMap, geoMap);
    expect(errors).toHaveLength(0);
  });

  it('detects collision on same face', () => {
    const devices: Device[] = [
      { id: 'd1', deviceTypeId: 'dt-2u', rackId: 'rack-1', siteId: 'site-1', position: 10, face: 'front', status: 'active' },
      { id: 'd2', deviceTypeId: 'dt-1u', rackId: 'rack-1', siteId: 'site-1', position: 11, face: 'front', status: 'active' }
    ];
    
    const errors = validateRackFit(rack, devices, dtMap, geoMap);
    expect(errors).toHaveLength(2); // one for each device
    expect(errors[0].issue).toBe('collision');
    expect(errors[1].issue).toBe('collision');
  });

  it('detects collision if one is full depth on opposite face', () => {
    const devices: Device[] = [
      { id: 'd1', deviceTypeId: 'dt-full', rackId: 'rack-1', siteId: 'site-1', position: 10, face: 'front', status: 'active' },
      { id: 'd2', deviceTypeId: 'dt-1u', rackId: 'rack-1', siteId: 'site-1', position: 11, face: 'rear', status: 'active' }
    ];
    
    const errors = validateRackFit(rack, devices, dtMap, geoMap);
    expect(errors).toHaveLength(2);
    expect(errors[0].issue).toBe('collision');
  });

  it('ignores devices without position', () => {
    const devices: Device[] = [
      { id: 'd1', deviceTypeId: 'dt-full', rackId: 'rack-1', siteId: 'site-1', status: 'active' }
    ];
    
    const errors = validateRackFit(rack, devices, dtMap, geoMap);
    expect(errors).toHaveLength(0);
  });
});
