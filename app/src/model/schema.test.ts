import { describe, expect, it } from 'vitest';
// @ts-expect-error Vite raw import for meta-ratchet file inspection
import schemaSource from './schema.ts?raw';
import {
  CableSchema,
  CableStatusSchema,
  ComponentClassSchema,
  ConsolePortSchema,
  ConsolePortTemplateSchema,
  DesignationSchema,
  DesignDocumentSchema,
  DeviceBaySchema,
  DeviceBayTemplateSchema,
  DeviceFaceSchema,
  DeviceSchema,
  DeviceStatusSchema,
  DeviceTypeSchema,
  FrontPortSchema,
  FrontPortTemplateSchema,
  IdentifierSchema,
  InterfaceSchema,
  InterfaceTemplateSchema,
  LocationSchema,
  ModuleBaySchema,
  ModuleBayTemplateSchema,
  PortRefSchema,
  PowerOutletSchema,
  PowerOutletTemplateSchema,
  PowerPortSchema,
  PowerPortTemplateSchema,
  RackSchema,
  RackStatusSchema,
  RearPortSchema,
  RearPortTemplateSchema,
  SignalClassSchema,
  SiteSchema,
  type Cable,
  type DesignDocument,
  type Device,
  type DeviceType,
  type FrontPort,
  type FrontPortTemplate,
  type Interface,
  type InterfaceTemplate,
  type Location,
  type Rack,
  type RearPort,
  type RearPortTemplate,
  type SignalClass,
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

describe('Component Templates, Materialized Components, Cables & DesignDocument (B4b)', () => {
  const signalEth: SignalClass = {
    id: 'sig-cat6-eth',
    name: '1000BASE-T Gigabit Ethernet',
    category: 'network',
    description: 'Standard IEEE 802.3ab Ethernet',
  };

  const signalMic: SignalClass = {
    id: 'sig-analog-mic',
    name: 'Analog Microphone',
    category: 'audio',
    description: 'Balanced low-impedance mic level',
  };

  const signalDmx: SignalClass = {
    id: 'sig-dmx-512',
    name: 'DMX512 Lighting Control',
    category: 'control',
    description: 'USITT DMX512-A digital multiplex protocol',
  };

  const switchType: DeviceType = {
    id: 'dt-c9300-24t',
    manufacturer: 'Cisco',
    model: 'Catalyst 9300-24T',
    slug: 'c9300-24t',
    uHeight: 1,
    isFullDepth: true,
    interfaceTemplates: [
      {
        name: 'GigabitEthernet0/1',
        type: '1000base-t',
        signalClassId: 'sig-cat6-eth',
        connectorType: '8p8c',
      } as InterfaceTemplate,
    ],
  };

  const patchPlateType: DeviceType = {
    id: 'dt-wp-1x8p8c',
    manufacturer: 'Generic',
    model: 'Single Gang 8P8C Wall Plate',
    slug: 'wp-1x8p8c',
    uHeight: 0,
    isFullDepth: false,
    rearPortTemplates: [
      {
        name: 'Rear 1',
        type: '8p8c',
        positions: 1,
        signalClassId: 'sig-cat6-eth',
        connectorType: '8p8c',
      } as RearPortTemplate,
    ],
    frontPortTemplates: [
      {
        name: 'Port 1',
        type: '8p8c',
        rearPortId: 'rp-01',
        rearPortPosition: 1,
        signalClassId: 'sig-cat6-eth',
        connectorType: '8p8c',
      } as FrontPortTemplate,
    ],
  };

  const switchDevice: Device = {
    id: 'dev-sw-01',
    name: 'Core Switch 01',
    deviceTypeId: 'dt-c9300-24t',
    siteId: 'site-oslo-01',
    status: 'active',
    interfaces: [
      {
        id: 'if-sw01-gi01',
        name: 'GigabitEthernet0/1',
        type: '1000base-t',
        signalClassId: 'sig-cat6-eth',
        connectorType: '8p8c',
      } as Interface,
    ],
  };

  const plateDevice: Device = {
    id: 'dev-plate-01',
    name: 'Wall Plate Room 204',
    deviceTypeId: 'dt-wp-1x8p8c',
    siteId: 'site-oslo-01',
    status: 'active',
    rearPorts: [
      {
        id: 'rp-01',
        name: 'Rear 1',
        type: '8p8c',
        positions: 1,
        signalClassId: 'sig-cat6-eth',
        connectorType: '8p8c',
      } as RearPort,
    ],
    frontPorts: [
      {
        id: 'fp-01',
        name: 'Port 1',
        type: '8p8c',
        rearPortId: 'rp-01',
        rearPortPosition: 1,
        signalClassId: 'sig-cat6-eth',
        connectorType: '8p8c',
      } as FrontPort,
    ],
  };

  const patchCable: Cable = {
    id: 'cab-01',
    status: 'connected',
    type: 'cat6a-utp',
    lengthM: 25.5,
    label: 'CAB-SW01-WP01',
    terminations: [
      {
        deviceId: 'dev-sw-01',
        portRef: {
          kind: 'interface',
          name: 'GigabitEthernet0/1',
          id: 'if-sw01-gi01',
        },
      },
      {
        deviceId: 'dev-plate-01',
        portRef: {
          kind: 'frontPort',
          name: 'Port 1',
          id: 'fp-01',
        },
      },
    ],
  };

  describe('DesignDocument round-trip serialization', () => {
    it('round-trips a two-device + one-cable + one-front/rear-mapped-plate document', () => {
      const doc: DesignDocument = {
        schemaVersion: 1,
        designLabel: 'Studio AV & IT Infrastructure',
        revision: 'REV-01',
        sites: [
          {
            id: 'site-oslo-01',
            name: 'Oslo HQ',
            slug: 'oslo-hq',
          },
        ],
        locations: [
          {
            id: 'loc-fl02-room204',
            name: 'Server Room 204',
            slug: 'sr-204',
            siteId: 'site-oslo-01',
          },
        ],
        racks: [
          {
            id: 'rack-r01',
            name: 'Rack 01',
            siteId: 'site-oslo-01',
            locationId: 'loc-fl02-room204',
            uHeight: 42,
            status: 'active',
          },
        ],
        signalClasses: [signalEth, signalMic, signalDmx],
        deviceTypes: [switchType, patchPlateType],
        devices: [switchDevice, plateDevice],
        cables: [patchCable],
      };

      const parsed = DesignDocumentSchema.parse(doc);
      doc.geometry = {}; expect(parsed).toEqual(doc);
      expect(DesignDocumentSchema.parse(JSON.parse(JSON.stringify(doc)))).toEqual(parsed);
    });
  });

  describe('Three Independent Facts (portKind vs signalClassId vs connectorType)', () => {
    it('allows the same physical connectorType with different signalClassIds without derivation', () => {
      // 3-pin XLR used for Analog Mic Audio
      const micPort: Interface = {
        id: 'if-mic-01',
        name: 'Mic In 1',
        type: 'other',
        connectorType: 'xlr-3pin',
        signalClassId: 'sig-analog-mic',
      };
      expect(InterfaceSchema.parse(micPort)).toEqual(micPort);

      // Same 3-pin XLR used for DMX512 Lighting Control
      const dmxPort: Interface = {
        id: 'if-dmx-01',
        name: 'DMX Out 1',
        type: 'other',
        connectorType: 'xlr-3pin',
        signalClassId: 'sig-dmx-512',
      };
      expect(InterfaceSchema.parse(dmxPort)).toEqual(dmxPort);

      // Port without connectorType or signalClassId is also valid
      const plainPort: Interface = {
        id: 'if-plain-01',
        name: 'Port 1',
        type: '1000base-t',
      };
      expect(InterfaceSchema.parse(plainPort)).toEqual(plainPort);
    });

    it('allows different connectorTypes for the same signalClassId', () => {
      expect(SignalClassSchema.parse(signalEth)).toEqual(signalEth);
      const rj45Eth: FrontPort = {
        id: 'fp-eth-rj45',
        name: 'ETH-1',
        type: '8p8c',
        rearPortId: 'rp-01',
        rearPortPosition: 1,
        connectorType: '8p8c',
        signalClassId: 'sig-cat6-eth',
      };
      expect(FrontPortSchema.parse(rj45Eth)).toEqual(rj45Eth);

      const m12Eth: FrontPort = {
        id: 'fp-eth-m12',
        name: 'ETH-M12',
        type: 'm12',
        rearPortId: 'rp-01',
        rearPortPosition: 1,
        connectorType: 'm12-x-code',
        signalClassId: 'sig-cat6-eth',
      };
      expect(FrontPortSchema.parse(m12Eth)).toEqual(m12Eth);
    });
  });

  describe('Component schemas & discriminated port references', () => {
    it('parses all component templates and materialized component schemas', () => {
      // Interface template & instance
      expect(InterfaceTemplateSchema.parse({ name: 'eth0', type: '1000base-t' })).toBeDefined();
      expect(InterfaceSchema.parse({ id: 'if-1', name: 'eth0', type: '1000base-t' })).toBeDefined();

      // Front/Rear port templates & instances
      expect(RearPortTemplateSchema.parse({ name: 'rp-tpl', type: '8p8c', positions: 2 })).toBeDefined();
      expect(RearPortSchema.parse({ id: 'rp-1', name: 'rp1', type: '8p8c', positions: 2 })).toBeDefined();
      expect(FrontPortTemplateSchema.parse({ name: 'fp-tpl', type: '8p8c', rearPortId: 'rp-tpl', rearPortPosition: 1 })).toBeDefined();
      expect(FrontPortSchema.parse({ id: 'fp-1', name: 'fp1', type: '8p8c', rearPortId: 'rp-1', rearPortPosition: 1 })).toBeDefined();

      // Console port template & instance
      expect(ConsolePortTemplateSchema.parse({ name: 'con0', type: 'rj-45' })).toBeDefined();
      expect(ConsolePortSchema.parse({ id: 'cp-1', name: 'con0' })).toBeDefined();

      // Power port template & instance
      expect(PowerPortTemplateSchema.parse({ name: 'psu1', type: 'iec-60320-c14', maximumDrawWatts: 500 })).toBeDefined();
      expect(PowerPortSchema.parse({ id: 'pp-1', name: 'psu1', maximumDrawWatts: 500 })).toBeDefined();

      // Power outlet template & instance
      expect(PowerOutletTemplateSchema.parse({ name: 'out1', type: 'iec-60320-c13', feedLeg: 'A' })).toBeDefined();
      expect(PowerOutletSchema.parse({ id: 'po-1', name: 'out1', feedLeg: 'A' })).toBeDefined();

      // Module bay template & instance
      expect(ModuleBayTemplateSchema.parse({ name: 'bay1', position: 'slot0' })).toBeDefined();
      expect(ModuleBaySchema.parse({ id: 'mb-1', name: 'bay1', position: 'slot0' })).toBeDefined();

      // Device bay template & instance
      expect(DeviceBayTemplateSchema.parse({ name: 'sub-bay1' })).toBeDefined();
      expect(DeviceBaySchema.parse({ id: 'db-1', name: 'sub-bay1', installedDeviceId: 'dev-blade-01' })).toBeDefined();
    });

    it('parses all PortRef discriminated union variants', () => {
      const kinds = [
        { kind: 'interface', name: 'eth0' },
        { kind: 'frontPort', name: 'fp1' },
        { kind: 'rearPort', name: 'rp1' },
        { kind: 'consolePort', name: 'con0' },
        { kind: 'powerPort', name: 'psu1' },
        { kind: 'powerOutlet', name: 'out1' },
      ] as const;

      for (const ref of kinds) {
        expect(PortRefSchema.parse(ref)).toEqual(ref);
        expect(ComponentClassSchema.parse(ref.kind)).toBe(ref.kind);
      }
    });
  });

  describe('RED cases for components, cables & DesignDocument', () => {
    it('rejects a cable with 3 terminations (requires exactly 2)', () => {
      const term3 = {
        deviceId: 'dev-plate-01',
        portRef: { kind: 'frontPort' as const, name: 'Port 1' },
      };
      const badCable3 = {
        id: 'cab-bad-3',
        status: 'connected',
        terminations: [patchCable.terminations[0], patchCable.terminations[1], term3],
      };
      expect(CableSchema.safeParse(badCable3).success).toBe(false);
    });

    it('rejects a cable with only 1 termination', () => {
      const badCable1 = {
        id: 'cab-bad-1',
        status: 'connected',
        terminations: [patchCable.terminations[0]],
      };
      expect(CableSchema.safeParse(badCable1).success).toBe(false);
    });

    it('rejects a FrontPort referencing a missing RearPort on the same device', () => {
      const badPlate: Device = {
        id: 'dev-bad-plate',
        deviceTypeId: 'dt-wp-1x8p8c',
        siteId: 'site-oslo-01',
        status: 'planned',
        rearPorts: [
          {
            id: 'rp-valid',
            name: 'Rear 1',
            type: '8p8c',
            positions: 1,
          },
        ],
        frontPorts: [
          {
            id: 'fp-01',
            name: 'Port 1',
            type: '8p8c',
            rearPortId: 'rp-nonexistent', // missing rear port
            rearPortPosition: 1,
          },
        ],
      };
      expect(DeviceSchema.safeParse(badPlate).success).toBe(false);
    });

    it('rejects a FrontPort when device has no rearPorts', () => {
      const badPlateNoRear: Device = {
        id: 'dev-bad-plate-no-rear',
        deviceTypeId: 'dt-wp-1x8p8c',
        siteId: 'site-oslo-01',
        status: 'planned',
        frontPorts: [
          {
            id: 'fp-01',
            name: 'Port 1',
            type: '8p8c',
            rearPortId: 'rp-01',
            rearPortPosition: 1,
          },
        ],
      };
      expect(DeviceSchema.safeParse(badPlateNoRear).success).toBe(false);
    });

    it('rejects a FrontPort referencing a rearPortPosition exceeding RearPort positions', () => {
      const badPlateExceededPos: Device = {
        id: 'dev-bad-plate-pos',
        deviceTypeId: 'dt-wp-1x8p8c',
        siteId: 'site-oslo-01',
        status: 'planned',
        rearPorts: [
          {
            id: 'rp-01',
            name: 'Rear 1',
            type: '8p8c',
            positions: 1, // only 1 position
          },
        ],
        frontPorts: [
          {
            id: 'fp-01',
            name: 'Port 1',
            type: '8p8c',
            rearPortId: 'rp-01',
            rearPortPosition: 2, // exceeds positions=1
          },
        ],
      };
      expect(DeviceSchema.safeParse(badPlateExceededPos).success).toBe(false);
    });

    it('rejects invalid cable status', () => {
      // "active" is a Device/Rack status, NOT a Cable status
      expect(CableStatusSchema.safeParse('active').success).toBe(false);
      expect(CableSchema.safeParse({ ...patchCable, status: 'active' }).success).toBe(false);

      // "failed" is a Device status, NOT a Cable status
      expect(CableStatusSchema.safeParse('failed').success).toBe(false);
      expect(CableSchema.safeParse({ ...patchCable, status: 'failed' }).success).toBe(false);

      // bogus status
      expect(CableStatusSchema.safeParse('unknown').success).toBe(false);
      expect(CableSchema.safeParse({ ...patchCable, status: 'invalid' }).success).toBe(false);
    });

    it('rejects cable termination whose portRef class does not exist on the device in DesignDocument', () => {
      const badCableMismatchedKind: Cable = {
        id: 'cab-mismatched',
        status: 'connected',
        terminations: [
          {
            deviceId: 'dev-sw-01',
            portRef: {
              kind: 'frontPort', // dev-sw-01 has interfaces, NO frontPorts
              name: 'GigabitEthernet0/1',
            },
          },
          {
            deviceId: 'dev-plate-01',
            portRef: {
              kind: 'frontPort',
              name: 'Port 1',
            },
          },
        ],
      };

      const docWithMismatchedKind = {
        schemaVersion: 1 as const,
        designLabel: 'Mismatched Port Kind Test',
        devices: [switchDevice, plateDevice],
        cables: [badCableMismatchedKind],
      };

      expect(DesignDocumentSchema.safeParse(docWithMismatchedKind).success).toBe(false);
    });

    it('rejects cable termination referencing non-existent port name on device in DesignDocument', () => {
      const badCableNonExistentPort: Cable = {
        id: 'cab-bad-port-name',
        status: 'connected',
        terminations: [
          {
            deviceId: 'dev-sw-01',
            portRef: {
              kind: 'interface',
              name: 'GigabitEthernet99/99', // doesn't exist
            },
          },
          {
            deviceId: 'dev-plate-01',
            portRef: {
              kind: 'frontPort',
              name: 'Port 1',
            },
          },
        ],
      };

      const docWithBadPort = {
        schemaVersion: 1 as const,
        designLabel: 'Bad Port Name Test',
        devices: [switchDevice, plateDevice],
        cables: [badCableNonExistentPort],
      };

      expect(DesignDocumentSchema.safeParse(docWithBadPort).success).toBe(false);
    });

    it('rejects cable termination referencing non-existent deviceId in DesignDocument', () => {
      const badCableMissingDevice: Cable = {
        id: 'cab-bad-device',
        status: 'connected',
        terminations: [
          {
            deviceId: 'dev-ghost-device', // does not exist in devices
            portRef: {
              kind: 'interface',
              name: 'eth0',
            },
          },
          {
            deviceId: 'dev-plate-01',
            portRef: {
              kind: 'frontPort',
              name: 'Port 1',
            },
          },
        ],
      };

      const docWithMissingDevice = {
        schemaVersion: 1 as const,
        designLabel: 'Missing Device Test',
        devices: [plateDevice],
        cables: [badCableMissingDevice],
      };

      expect(DesignDocumentSchema.safeParse(docWithMissingDevice).success).toBe(false);
    });
  });
});
