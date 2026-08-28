/* eslint-disable */
// @ts-nocheck
import { describe, expect, it } from 'vitest';
import { readEasySchematic } from './read';
import { DesignDocumentSchema } from '../../model/schema';

let fixtureGymmen: any = {};
let fixtureStudio: any = {};
try {
    fixtureGymmen = require('../../../tests/fixtures/av-fasit/AV_U1A21.easyschematic.json');
    fixtureStudio = require('../../../tests/fixtures/av-fasit/AV_H3B19.easyschematic.json');
} catch (e) {}

describe('EasySchematic Reader (readEasySchematic)', () => {
  describe('Fixture 1: AV_U1A21.easyschematic.json (Gymmen)', () => {
    // Hand-counted numbers from AV_U1A21.easyschematic.json:
    // - Total Nodes: 14 (2 rooms, 12 devices, 0 notes)
    // - Rooms (Locations): 2 ("room-U1A36", "room-U1A21")
    // - Devices: 12 (UM003, UM006, UM008, UM009, UM010..UM017)
    // - Total Materialized Ports: 29 (5 + 5 + 1 + 2 + 8*2)
    // - Unique DeviceTypes: 5 (GSM4230PX-100EUS, CX-Q2K4-NA, TSC-50-G3, UND6IO-BT, AD-S8T-BK)
    // - Edges (Cables): 6 (edge-0 .. edge-5)
    // - Skipped Objects: 0

    it('parses AV_U1A21 into a valid Copper DesignDocument matching hand-counted metrics', () => {
      const { document, report } = readEasySchematic(fixtureGymmen);

      // Validate that the output document strictly conforms to Copper's DesignDocumentSchema
      expect(DesignDocumentSchema.safeParse(document).success).toBe(true);

      // Verify exact counts
      expect(report.locationCount).toBe(2);
      expect(document.locations.length).toBe(2);

      expect(report.deviceCount).toBe(12);
      expect(document.devices.length).toBe(12);

      expect(report.portCount).toBe(29);

      expect(report.cableCount).toBe(6);
      expect(document.cables.length).toBe(6);

      expect(document.deviceTypes.length).toBe(5);
      expect(report.skippedObjects.length).toBe(0);
    });

    it('spot-checks known devices and ports in AV_U1A21', () => {
      const { document } = readEasySchematic(fixtureGymmen);

      // Spot-check switch UM003
      const sw = document.devices.find((d) => d.id === 'device-U1-UM003');
      expect(sw).toBeDefined();
      expect(sw?.name).toBe('UM003 · GSM4230PX-100EUS');
      expect(sw?.locationId).toBe('room-U1A36');
      expect(sw?.interfaces?.length).toBe(5);

      const poe2 = sw?.interfaces?.find((i) => i.id === 'p-U1-UM003-proj-POE2');
      expect(poe2).toBeDefined();
      expect(poe2?.name).toBe('1/0/2 (prosjektert)');
      expect(poe2?.type).toBe('rj45');
      expect(poe2?.connectorType).toBe('rj45');
      expect(poe2?.signalClassId).toBe('ethernet');

      // Spot-check amplifier UM006 with designation
      const amp = document.devices.find((d) => d.id === 'device-U1-UM006');
      expect(amp).toBeDefined();
      expect(amp?.designation).toBe('+B1K1-U1=556.003-UM006');
      expect(amp?.interfaces?.length).toBe(5);

      // Spot-check cable edge-0
      const cab0 = document.cables.find((c) => c.id === 'edge-0');
      expect(cab0).toBeDefined();
      expect(cab0?.status).toBe('connected');
      expect(cab0?.type).toBe('ethernet');
      expect(cab0?.label).toBe('Nettverk');
      expect(cab0?.terminations[0].deviceId).toBe('device-U1-UM003');
      expect(cab0?.terminations[0].portRef.id).toBe('p-U1-UM003-proj-POE2');
      expect(cab0?.terminations[1].deviceId).toBe('device-U1-UM008');
      expect(cab0?.terminations[1].portRef.id).toBe('p-U1-UM008-i0');
    });

    it('tracks distinct signalTypes and unmapped fields for AV_U1A21 in report', () => {
      const { report } = readEasySchematic(fixtureGymmen);

      // Signal types checked
      expect(report.signalTypes['ethernet']).toBe(9); // 7 ports + 2 cables
      expect(report.signalTypes['speaker-level']).toBe(24); // 20 ports + 4 cables
      expect(report.signalTypes['power']).toBe(1); // 1 port
      expect(report.signalTypes['analog-audio']).toBe(1); // 1 port

      // Unmapped fields checked
      expect(report.unmappedFields['version']).toBe(1);
      expect(report.unmappedFields['printPaperId']).toBe(1);
      expect(report.unmappedFields['printOrientation']).toBe(1);
      expect(report.unmappedFields['printScale']).toBe(1);
      expect(report.unmappedFields['position']).toBeGreaterThan(0);
      expect(report.unmappedFields['style']).toBeGreaterThan(0);
    });
  });

  describe('Fixture 2: AV_H3B19.easyschematic.json (Studio)', () => {
    // Hand-counted numbers from AV_H3B19.easyschematic.json:
    // - Total Nodes: 11 (2 rooms, 8 devices, 1 note)
    // - Rooms (Locations): 2 ("room-H3B19", "room-U1A36")
    // - Devices: 8 (UM001..UM005, UM021, U1-UM001, U1-UM002)
    // - Total Materialized Ports: 49 (4*4 + 1 + 12 + 10 + 10)
    // - Unique DeviceTypes: 4 (NV-21-HU, TSC-101-G3, GSM4248PX-100EUS, XSM4328FV-100NES)
    // - Edges (Cables): 7 (edge-4, edge-5, edge-6, edge-7, edge-8, edge-10, edge-11)
    // - Skipped Objects: 1 ("note-open", kind: "note")

    it('parses AV_H3B19 into a valid Copper DesignDocument matching hand-counted metrics', () => {
      const { document, report } = readEasySchematic(fixtureStudio);

      // Validate that the output document strictly conforms to Copper's DesignDocumentSchema
      expect(DesignDocumentSchema.safeParse(document).success).toBe(true);

      // Verify exact counts
      expect(report.locationCount).toBe(2);
      expect(document.locations.length).toBe(2);

      expect(report.deviceCount).toBe(8);
      expect(document.devices.length).toBe(8);

      expect(report.portCount).toBe(49);

      expect(report.cableCount).toBe(7);
      expect(document.cables.length).toBe(7);

      expect(document.deviceTypes.length).toBe(4);

      // Exactly 1 note skipped
      expect(report.skippedObjects.length).toBe(1);
      expect(report.skippedObjects[0]).toEqual({
        kind: 'note',
        id: 'note-open',
        reason: 'Node type "note" is not supported in DesignDocument',
      });
    });

    it('spot-checks known devices and ports in AV_H3B19', () => {
      const { document } = readEasySchematic(fixtureStudio);

      // Spot-check audio DSP UM001 (NV-21-HU)
      const dsp = document.devices.find((d) => d.id === 'device-03-UM001');
      expect(dsp).toBeDefined();
      expect(dsp?.interfaces?.length).toBe(4);

      const hdmiIn = dsp?.interfaces?.find((i) => i.id === 'p-03-UM001-i1');
      expect(hdmiIn).toBeDefined();
      expect(hdmiIn?.name).toBe('HDMI');
      expect(hdmiIn?.type).toBe('hdmi');
      expect(hdmiIn?.signalClassId).toBe('hdmi');

      const hdmiOut = dsp?.interfaces?.find((i) => i.id === 'p-03-UM001-o3');
      expect(hdmiOut).toBeDefined();
      expect(hdmiOut?.name).toBe('HDMI');

      // Spot-check 48-port switch UM021
      const sw48 = document.devices.find((d) => d.id === 'device-03-UM021');
      expect(sw48).toBeDefined();
      expect(sw48?.interfaces?.length).toBe(12);

      // Spot-check cross-room uplink cable edge-10 (U1-UM001 -> 03-UM021)
      const edge10 = document.cables.find((c) => c.id === 'edge-10');
      expect(edge10).toBeDefined();
      expect(edge10?.terminations[0].deviceId).toBe('device-U1-UM001');
      expect(edge10?.terminations[0].portRef.id).toBe('p-U1-UM001-1-0-7');
      expect(edge10?.terminations[1].deviceId).toBe('device-03-UM021');
      expect(edge10?.terminations[1].portRef.id).toBe('p-03-UM021-1-0-41');
    });

    it('tracks distinct signalTypes and unmapped fields for AV_H3B19 in report', () => {
      const { report } = readEasySchematic(fixtureStudio);

      expect(report.signalTypes['ethernet']).toBe(44); // 37 ports + 7 cables
      expect(report.signalTypes['hdmi']).toBe(8); // 8 ports
      expect(report.signalTypes['power']).toBe(4); // 4 ports

      expect(report.unmappedFields['version']).toBe(1);
      expect(report.unmappedFields['html']).toBe(1); // from skipped note-open data
    });
  });

  describe('Report Assertions & Mutation Scenarios (§6.4)', () => {
    it('catches and counts unknown/custom fields added to foreign JSON', () => {
      const mutatedFixture = {
        ...fixtureGymmen,
        customEnterpriseField: 'EnterpriseValue123',
      };

      const { report } = readEasySchematic(mutatedFixture);
      expect(report.unmappedFields['customEnterpriseField']).toBe(1);
    });

    it('wire-endpoint guard: skips dangling cables when an endpoint device is missing', () => {
      const mutatedWithDanglingCable = {
        ...fixtureGymmen,
        edges: [
          ...fixtureGymmen.edges,
          {
            id: 'edge-dangling-dev',
            source: 'device-U1-UM003',
            target: 'device-nonexistent-99',
            sourceHandle: 'p-U1-UM003-1-0-1',
            targetHandle: 'p-ghost-port',
            data: { signalType: 'ethernet', label: 'Broken Wire' },
          },
        ],
      };

      const { document, report } = readEasySchematic(mutatedWithDanglingCable);

      // The valid 6 cables are imported, the dangling cable is skipped
      expect(document.cables.length).toBe(6);
      expect(report.cableCount).toBe(6);

      const skippedWire = report.skippedObjects.find((s) => s.id === 'edge-dangling-dev');
      expect(skippedWire).toBeDefined();
      expect(skippedWire?.kind).toBe('cable');
      expect(skippedWire?.reason).toContain('Missing endpoint device');

      // The resulting document remains 100% strictly valid
      expect(DesignDocumentSchema.safeParse(document).success).toBe(true);
    });

    it('wire-endpoint guard: skips dangling cables when an endpoint port is missing on existing device', () => {
      const mutatedWithDanglingPort = {
        ...fixtureGymmen,
        edges: [
          ...fixtureGymmen.edges,
          {
            id: 'edge-dangling-port',
            source: 'device-U1-UM003',
            target: 'device-U1-UM008',
            sourceHandle: 'p-U1-UM003-1-0-1',
            targetHandle: 'p-nonexistent-port-on-um008',
            data: { signalType: 'ethernet', label: 'Broken Port Wire' },
          },
        ],
      };

      const { document, report } = readEasySchematic(mutatedWithDanglingPort);

      expect(document.cables.length).toBe(6);
      const skippedWire = report.skippedObjects.find((s) => s.id === 'edge-dangling-port');
      expect(skippedWire).toBeDefined();
      expect(skippedWire?.kind).toBe('cable');
      expect(skippedWire?.reason).toContain('Missing endpoint port');

      expect(DesignDocumentSchema.safeParse(document).success).toBe(true);
    });

    it('dropping a device reduces deviceCount and skips any cables attached to it', () => {
      // Remove device-U1-UM008 from Gymmen fixture
      const mutatedNodes = fixtureGymmen.nodes.filter((n) => n.id !== 'device-U1-UM008');
      const mutatedFixture = {
        ...fixtureGymmen,
        nodes: mutatedNodes,
      };

      const { document, report } = readEasySchematic(mutatedFixture);

      // 12 devices -> 11 devices
      expect(document.devices.length).toBe(11);
      expect(report.deviceCount).toBe(11);

      // edge-0 was connected to device-U1-UM008 -> skipped!
      expect(document.cables.length).toBe(5);
      expect(report.cableCount).toBe(5);

      const skippedEdge0 = report.skippedObjects.find((s) => s.id === 'edge-0');
      expect(skippedEdge0).toBeDefined();
      expect(skippedEdge0?.kind).toBe('cable');

      expect(DesignDocumentSchema.safeParse(document).success).toBe(true);
    });
  });
});
