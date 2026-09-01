
import { describe, it, expect } from 'vitest'
import { buildChainInput, type AdapterInput } from '../adapter'

describe('audio-schema-bridge (adapter)', () => {
  it('maps a fixture project into analyseChain input', () => {
    const input: AdapterInput = {
      deviceTypes: [
        {
          id: 'dt-amp',
          manufacturer: 'Crown',
          model: 'CDi',
          slug: 'crown-cdi',
          customFields: { acoustics: { device_class: 'amplifier', watt_8: 500, min_load: 4 } }
        },
        {
          id: 'dt-spk',
          manufacturer: 'JBL',
          model: 'Control',
          slug: 'jbl-control',
          customFields: { acoustics: { device_class: 'speaker', impedance: 8, wattage_rms: 100 } }
        },
        {
          id: 'dt-cab',
          manufacturer: 'Generic',
          model: '2x2.5',
          slug: 'generic-2x25',
          customFields: { acoustics: { device_class: 'cable', resistance: 13.3 } }
        }
      ],
      devices: [
        { id: 'amp-1', name: 'Amp Rack 1', deviceTypeId: 'dt-amp' },
        { id: 'spk-1', name: 'Ceiling 1', deviceTypeId: 'dt-spk' }
      ],
      cables: [
        {
          id: 'c-1',
          terminations: [
            { deviceId: 'amp-1', portRef: { kind: 'interface', name: 'Out 1' } },
            { deviceId: 'spk-1', portRef: { kind: 'interface', name: 'In' } }
          ],
          lengthM: 50
        }
      ]
    };

    const chain = buildChainInput(input);
    expect(chain.db.amplifiers['dt-amp']).toBeDefined();
    expect(chain.db.speakers['dt-spk']).toBeDefined();
    expect(chain.ampRack['amp-1']).toBeDefined();
    
    // Check graph traversal
    expect(chain.roots.length).toBe(1);
    expect(chain.roots[0].slug).toBe('spk-1');
    expect(chain.roots[0].speakerId).toBe('dt-spk');
    expect(chain.roots[0].length).toBe(50);
  });
})

