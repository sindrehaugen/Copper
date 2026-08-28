import { describe, it, expect } from 'vitest';
import { parseDeviceType } from './parse';

describe('parseDeviceType', () => {
  it('parses valid yaml without unknown keys', () => {
    const yaml = `
manufacturer: Cisco
model: C9200L-48P-4G
slug: cisco-c9200l-48p-4g
u_height: 1
is_full_depth: true
weight: 4.5
airflow: rear-to-front
description: Cisco Catalyst 9200L 48-port PoE+
interfaces:
  - name: GigabitEthernet1/0/1
    type: 1000base-t
    mgmt_only: false
front-ports:
  - name: F1
    type: 8p8c
    rear_port: R1
    rear_port_position: 1
rear-ports:
  - name: R1
    type: 8p8c
    positions: 1
console-ports:
  - name: con0
    type: rj-45
power-ports:
  - name: PSU1
    type: iec-60320-c14
    maximum_draw: 500
    allocated_draw: 300
power-outlets:
  - name: OUT1
    type: iec-60320-c13
    power_port: PSU1
    feed_leg: A
module-bays:
  - name: Slot 1
    position: '1'
    `;
    const { deviceType, unknownKeys } = parseDeviceType(yaml);
    expect(unknownKeys).toEqual([]);
    expect(deviceType.manufacturer).toBe('Cisco');
    expect(deviceType.interfaceTemplates?.[0].name).toBe('GigabitEthernet1/0/1');
  });

  it('surfaces unknown keys', () => {
    const yaml = `
manufacturer: Cisco
model: C9200L-48P-4G
slug: cisco-c9200l-48p-4g
u_height: 1
is_full_depth: true
some_weird_key: true
another_unknown: 42
    `;
    const { deviceType, unknownKeys } = parseDeviceType(yaml);
    expect(unknownKeys).toEqual(['some_weird_key', 'another_unknown']);
    expect(deviceType.manufacturer).toBe('Cisco');
  });

  it('throws on invalid yaml', () => {
    expect(() => parseDeviceType(`
manufacturer: Cisco
  model: C9200L
    `)).toThrow(/Invalid YAML/);
  });

  it('throws when root is not an object', () => {
    expect(() => parseDeviceType(`- just a list`)).toThrow(/Invalid YAML: root is not an object/);
    expect(() => parseDeviceType(`"just a string"`)).toThrow(/Invalid YAML: root is not an object/);
  });

  it('parses minimal yaml', () => {
    const yaml = `
manufacturer: Cisco
model: minimal
slug: min
u_height: 1
is_full_depth: false
    `;
    const { deviceType, unknownKeys } = parseDeviceType(yaml);
    expect(unknownKeys).toEqual([]);
    expect(deviceType.slug).toBe('min');
  });
});
