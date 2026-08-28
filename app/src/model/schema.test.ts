import { describe, expect, it } from 'vitest';
// @ts-expect-error Vite raw import for meta-ratchet file inspection
import schemaSource from './schema.ts?raw';
import {
  DesignationSchema,
  DeviceFaceSchema,
  DeviceSchema,
  DeviceStatusSchema,
  DeviceTypeSchema,
  IdentifierSchema,
  LocationSchema,
  RackSchema,
  RackStatusSchema,
  SiteSchema,
  type Device,
  type DeviceType,
  type Location,
  type Rack,
  type Site,
} from './schema';

describe('Containment & Lifecycle Schemas (ADR-0006, ADR-0004, ADR-0003)', () => {
  const validSite: Site = {
    id: 'site-oslo-01',
    name: 'Oslo HQ',
    slug: 'oslo-hq',
    description: 'Main campus facility',
  };

  const validLocation: Location = {
    id: 'loc-fl02-room204',
    name: 'Server Room 204',
    slug: 'sr-204',
    siteId: 'site-oslo-01',
    parentId: 'loc-fl02',
    description: 'AV / IT core room',
  };

  const validRack: Rack = {
    id: 'rack-r01',
    name: 'Rack 01',
    siteId: 'site-oslo-01',
    locationId: 'loc-fl02-room204',
    uHeight: 42,
    status: 'active',
    width: 19,
    description: 'Main AV distribution rack',
  };

  const validDeviceType: DeviceType = {
    id: 'dt-cisco-c9300-24t',
    manufacturer: 'Cisco',
    model: 'Catalyst 9300-24T',
    slug: 'c9300-24t',
    uHeight: 1,
    isFullDepth: true,
    weight: 7.2,
    airflow: 'front-to-rear',
    description: '24-port Gigabit Ethernet switch',
  };

  const validDevice: Device = {
    id: 'dev-sw-01',
    name: 'SW-01',
    deviceTypeId: 'dt-cisco-c9300-24t',
    siteId: 'site-oslo-01',
    locationId: 'loc-fl02-room204',
    rackId: 'rack-r01',
    position: 24,
    face: 'front',
    status: 'planned',
    designation: '=BLD1+FL2-SW01',
    description: 'Primary access switch',
  };

  describe('Round-trip serialization & valid schemas', () => {
    it('round-trips a Site -> Location -> Rack -> DeviceType -> Device chain', () => {
      // Site
      const parsedSite = SiteSchema.parse(validSite);
      expect(SiteSchema.parse(JSON.parse(JSON.stringify(validSite)))).toEqual(parsedSite);

      // Location
      const parsedLocation = LocationSchema.parse(validLocation);
      expect(LocationSchema.parse(JSON.parse(JSON.stringify(validLocation)))).toEqual(parsedLocation);

      // Rack
      const parsedRack = RackSchema.parse(validRack);
      expect(RackSchema.parse(JSON.parse(JSON.stringify(validRack)))).toEqual(parsedRack);

      // DeviceType
      const parsedDeviceType = DeviceTypeSchema.parse(validDeviceType);
      expect(DeviceTypeSchema.parse(JSON.parse(JSON.stringify(validDeviceType)))).toEqual(parsedDeviceType);

      // Device
      const parsedDevice = DeviceSchema.parse(validDevice);
      expect(DeviceSchema.parse(JSON.parse(JSON.stringify(validDevice)))).toEqual(parsedDevice);
    });

    it('supports half-U position on Device (NUMERIC, half-U allowed)', () => {
      const halfUDevice: Device = {
        ...validDevice,
        id: 'dev-half-u-01',
        position: 10.5,
      };
      const parsed = DeviceSchema.parse(halfUDevice);
      expect(parsed.position).toBe(10.5);
    });

    it('accepts valid reference designations conforming to ADR-0004 charset', () => {
      const validDesignations = [
        'DEV01',
        '=BLD1+FL2-SW01',
        'CAB:01.A+B-C=D',
        'RACK-01:U10.5',
      ];
      for (const d of validDesignations) {
        expect(DesignationSchema.parse(d)).toBe(d);
      }
    });
  });

  describe('RED cases & strict constraint enforcement', () => {
    it('rejects invalid device status', () => {
      // "reserved" is a Rack status, NOT a Device status
      expect(DeviceStatusSchema.safeParse('reserved').success).toBe(false);
      expect(DeviceSchema.safeParse({ ...validDevice, status: 'reserved' }).success).toBe(false);

      // bogus statuses
      expect(DeviceStatusSchema.safeParse('unknown').success).toBe(false);
      expect(DeviceSchema.safeParse({ ...validDevice, status: 'invalid_status' }).success).toBe(false);
    });

    it('rejects invalid rack status', () => {
      // "failed" is a Device status, NOT a Rack status
      expect(RackStatusSchema.safeParse('failed').success).toBe(false);
      expect(RackSchema.safeParse({ ...validRack, status: 'failed' }).success).toBe(false);

      // "staged" is a Device status, NOT a Rack status
      expect(RackStatusSchema.safeParse('staged').success).toBe(false);
      expect(RackSchema.safeParse({ ...validRack, status: 'staged' }).success).toBe(false);

      // bogus statuses
      expect(RackStatusSchema.safeParse('offline').success).toBe(false);
      expect(RackSchema.safeParse({ ...validRack, status: 'offline' }).success).toBe(false);
    });

    it('rejects designations containing underscore, percent, spaces, or invalid chars', () => {
      expect(DesignationSchema.safeParse('DEV_01').success).toBe(false);
      expect(DesignationSchema.safeParse('DEV%01').success).toBe(false);
      expect(DesignationSchema.safeParse('DEV 01').success).toBe(false);
      expect(DesignationSchema.safeParse('dev-01').success).toBe(false); // lowercase forbidden per ADR-0004 regex ^[A-Z0-9.:+=-]+$
      expect(DesignationSchema.safeParse('DEV#01').success).toBe(false);

      // Device with invalid designation rejected
      expect(DeviceSchema.safeParse({ ...validDevice, designation: 'DEV_01' }).success).toBe(false);
    });

    it('rejects identifiers containing SQL wildcards (_, %) or whitespace', () => {
      expect(IdentifierSchema.safeParse('id_with_underscore').success).toBe(false);
      expect(IdentifierSchema.safeParse('id%with%percent').success).toBe(false);
      expect(IdentifierSchema.safeParse('id with space').success).toBe(false);

      expect(SiteSchema.safeParse({ ...validSite, id: 'site_1' }).success).toBe(false);
      expect(LocationSchema.safeParse({ ...validLocation, id: 'loc_1' }).success).toBe(false);
      expect(RackSchema.safeParse({ ...validRack, id: 'rack_1' }).success).toBe(false);
      expect(DeviceTypeSchema.safeParse({ ...validDeviceType, id: 'dt_1' }).success).toBe(false);
      expect(DeviceSchema.safeParse({ ...validDevice, id: 'dev_1' }).success).toBe(false);
    });

    it('rejects device face outside front / rear', () => {
      expect(DeviceFaceSchema.safeParse('top').success).toBe(false);
      expect(DeviceFaceSchema.safeParse('side').success).toBe(false);
      expect(DeviceFaceSchema.safeParse('FRONT').success).toBe(false);
      expect(DeviceSchema.safeParse({ ...validDevice, face: 'top' as unknown as 'front' }).success).toBe(false);
    });

    it('rejects unknown top-level keys via strict()', () => {
      // Site strict
      expect(SiteSchema.safeParse({ ...validSite, extraProp: 'bad' }).success).toBe(false);

      // Location strict
      expect(LocationSchema.safeParse({ ...validLocation, unknownKey: 123 }).success).toBe(false);

      // Rack strict
      expect(RackSchema.safeParse({ ...validRack, unexpected: true }).success).toBe(false);

      // DeviceType strict
      expect(DeviceTypeSchema.safeParse({ ...validDeviceType, rogue: 'val' }).success).toBe(false);

      // Device strict
      expect(DeviceSchema.safeParse({ ...validDevice, unmodeledField: 'oops' }).success).toBe(false);
    });
  });

  describe('Meta-ratchet citation gate', () => {
    it('asserts every field line in schema.ts carries a netbox: or extension: citation', () => {
      const content = schemaSource as string;
      const lines = content.split('\n');

      let inObjectBlock = false;
      const uncitedLines: { lineNum: number; text: string }[] = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line === undefined) continue;
        const trimmed = line.trim();

        if (trimmed.includes('.object({') || trimmed.includes('z.object({')) {
          inObjectBlock = true;
          continue;
        }
        if (inObjectBlock && trimmed.startsWith('})')) {
          inObjectBlock = false;
          continue;
        }

        // Check field lines inside z.object blocks
        if (inObjectBlock) {
          const isPropertyLine = /^[a-zA-Z0-9_]+\s*:/.test(trimmed);
          if (isPropertyLine) {
            const hasCitation = /\/\/\s*(netbox:|extension:)/.test(line);
            if (!hasCitation) {
              uncitedLines.push({ lineNum: i + 1, text: line });
            }
          }
        }

        // Also check top-level standalone schema / enum declarations
        if (/^export const \w+(Schema|Enum)\s*=\s*z\./.test(trimmed)) {
          const hasCitation = /\/\/\s*(netbox:|extension:)/.test(line);
          if (!hasCitation) {
            uncitedLines.push({ lineNum: i + 1, text: line });
          }
        }
      }

      expect(
        uncitedLines,
        `Found schema definitions without // netbox: or // extension: citations:\n${uncitedLines.map((u) => `Line ${u.lineNum}: ${u.text}`).join('\n')}`
      ).toEqual([]);
    });
  });
});
