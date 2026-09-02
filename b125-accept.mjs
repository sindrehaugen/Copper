import fs from 'fs';
const code = `import { describe, it, expect } from 'vitest';
import { validateDocument } from './registry';
import { DesignDocument } from '../model/schema';

describe('B125 Accept Criteria - Validator Registry', () => {
  it('detects planted fixture defects for all six validators', () => {
    const doc: DesignDocument = {
      schemaVersion: 1,
      designLabel: 'B125 Fixture',
      sites: [],
      locations: [],
      zones: [],
      racks: [
        { id: 'r1', name: 'Rack 1', ruCount: 10 }
      ],
      deviceTypes: [
        { id: 't-poe-sw', manufacturer: 'Cisco', model: 'SW', width: 19, heightRu: 1, depthMm: 200, weightKg: 2, powerPorts: [{ name: 'AC', kind: 'input' }], networkPorts: [{ name: 'eth1', poeProvided: { standard: '802.3at', budgetWatts: 15 } }] },
        { id: 't-poe-dev', manufacturer: 'Cam', model: 'IP', width: 4, heightRu: 1, depthMm: 50, weightKg: 1, networkPorts: [{ name: 'eth1', poeDrawWatts: 25 }] }, // Exceeds budget
        { id: 't-av', manufacturer: 'AV', model: 'TX', width: 19, heightRu: 12, depthMm: 100, weightKg: 1 }, // Too big for rack
        { id: 't-hdcp-src', manufacturer: 'SRC', model: 'S1', width: 2, heightRu: 1, depthMm: 2, weightKg: 1, videoPorts: [{ name: 'out', kind: 'output', hdcpVersion: '2.2' }] },
        { id: 't-hdcp-sink', manufacturer: 'SNK', model: 'S2', width: 2, heightRu: 1, depthMm: 2, weightKg: 1, videoPorts: [{ name: 'in', kind: 'input', hdcpVersion: '1.4' }] },
        { id: 't-amp', manufacturer: 'AMP', model: 'A1', width: 19, heightRu: 1, depthMm: 10, weightKg: 1, audioPorts: [{ name: 'out', kind: 'output', speakerLine: { vrms: 70, maxWatts: 100 } }] },
        { id: 't-spk', manufacturer: 'SPK', model: 'S1', width: 2, heightRu: 1, depthMm: 2, weightKg: 1, audioPorts: [{ name: 'in', kind: 'input', speakerTapWatts: 10 }] }
      ],
      devices: [
        { id: 'd-sw', typeId: 't-poe-sw', designator: 'SW1' },
        { id: 'd-cam', typeId: 't-poe-dev', designator: 'CAM1' },
        { id: 'd-big', typeId: 't-av', designator: 'BIG1', rackMount: { rackId: 'r1', ruPosition: 1 } },
        { id: 'd-hsrc', typeId: 't-hdcp-src', designator: 'HSRC' },
        { id: 'd-hsink', typeId: 't-hdcp-sink', designator: 'HSNK' },
        { id: 'd-amp', typeId: 't-amp', designator: 'AMP1' },
        { id: 'd-spk', typeId: 't-spk', designator: 'SPK1' }
      ],
      cables: [
        // 1. PoE: SW1 -> CAM1 (25W draw > 15W budget)
        { id: 'c-poe', typeId: 'cat6', terminations: [{ deviceId: 'd-sw', portRef: { name: 'eth1' } }, { deviceId: 'd-cam', portRef: { name: 'eth1' } }] },
        // 2. Channel Length: Exceeds 100m for twisted pair
        { id: 'c-len', typeId: 'cat6', lengthM: 150, terminations: [{ deviceId: 'd-sw', portRef: { name: 'eth2' } }, { deviceId: 'd-cam', portRef: { name: 'eth2' } }] },
        // 3. Port Occupancy: Two cables into the same port
        { id: 'c-occ1', typeId: 'cat6', terminations: [{ deviceId: 'd-sw', portRef: { name: 'eth3' } }, { deviceId: 'd-cam', portRef: { name: 'eth3' } }] },
        { id: 'c-occ2', typeId: 'cat6', terminations: [{ deviceId: 'd-sw', portRef: { name: 'eth3' } }, { deviceId: 'd-cam', portRef: { name: 'eth4' } }] },
        // 4. HDCP: 2.2 source to 1.4 sink
        { id: 'c-hdcp', typeId: 'hdmi', terminations: [{ deviceId: 'd-hsrc', portRef: { name: 'out' } }, { deviceId: 'd-hsink', portRef: { name: 'in' } }] },
        // 5. Audio Line: 1000m cable creates massive drop
        { id: 'c-audio', typeId: 'spk', lengthM: 2000, awg: 24, terminations: [{ deviceId: 'd-amp', portRef: { name: 'out' } }, { deviceId: 'd-spk', portRef: { name: 'in' } }] }
      ],
      signalClasses: []
    };

    const result = validateDocument(doc);
    const sources = result.findings.map(f => f.source);
    
    // Expect at least one finding from each of the 6 validators
    expect(sources).toContain('PoE');
    expect(sources).toContain('ChannelLength');
    expect(sources).toContain('PortOccupancy');
    expect(sources).toContain('RackFit');
    expect(sources).toContain('HDCP');
    expect(sources).toContain('AudioLine');
  });
});
`;
fs.writeFileSync('app/src/validation/b125-accept.test.ts', code);
