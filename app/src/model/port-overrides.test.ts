import { describe, it, expect } from 'vitest';
import { Device, DeviceType } from './schema';
import { resolveDevicePorts } from './port-overrides';

describe('resolveDevicePorts', () => {
  it('inherits templates and allows overrides', () => {
    const deviceType: DeviceType = {
      id: 'dt1',
      manufacturer: 'Cisco',
      model: 'C9200',
      slug: 'c9200',
      uHeight: 1,
      isFullDepth: true,
      frontPortTemplates: [
        { name: 'Front1', type: '10gbase-t', rearPortId: 'rp1', rearPortPosition: 1 },
        { name: 'Front2', type: '10gbase-t', rearPortId: 'rp2', rearPortPosition: 1, description: 'TemplateDescription' }
      ],
      rearPortTemplates: [
        { name: 'Rear1', type: '10gbase-t', positions: 1 },
        { name: 'Rear2', type: '10gbase-t', positions: 1, description: 'RearTemplateDesc' }
      ]
    };

    const device: Device = {
      id: 'dev1',
      deviceTypeId: 'dt1',
      siteId: 'site1',
      status: 'active',
      frontPorts: [
        { id: 'fp2', name: 'Front2', label: 'OverriddenFrontLabel', type: '1000base-t', rearPortId: 'rp2', rearPortPosition: 1 }
      ],
      rearPorts: [
        { id: 'rp2_override', name: 'Rear2', label: 'OverriddenRearLabel', type: '1000base-t', positions: 1 }
      ]
    };

    const resolved = resolveDevicePorts(device, deviceType);

    expect(resolved).toHaveLength(4); // 2 front, 2 rear

    const front1 = resolved.find(p => p.kind === 'frontPort' && p.name === 'Front1');
    expect(front1).toBeDefined();
    expect(front1?.label).toBeUndefined(); // Inherited
    expect(front1?.type).toBe('10gbase-t');
    expect(front1?.id).toBeUndefined();

    const front2 = resolved.find(p => p.kind === 'frontPort' && p.name === 'Front2');
    expect(front2).toBeDefined();
    expect(front2?.label).toBe('OverriddenFrontLabel'); // Overridden
    expect(front2?.type).toBe('1000base-t');
    expect(front2?.id).toBe('fp2');
    expect(front2?.description).toBe('TemplateDescription'); // Verifies inheritance of optional fields!

    const rear1 = resolved.find(p => p.kind === 'rearPort' && p.name === 'Rear1');
    expect(rear1).toBeDefined();
    expect(rear1?.label).toBeUndefined(); // Inherited
    expect(rear1?.type).toBe('10gbase-t');
    expect(rear1?.id).toBeUndefined();

    const rear2 = resolved.find(p => p.kind === 'rearPort' && p.name === 'Rear2');
    expect(rear2).toBeDefined();
    expect(rear2?.label).toBe('OverriddenRearLabel'); // Overridden
    expect(rear2?.type).toBe('1000base-t');
    expect(rear2?.id).toBe('rp2_override');
    expect(rear2?.description).toBe('RearTemplateDesc'); // Verifies inheritance of optional fields!
  });
});
