
import { describe, it, expect } from 'vitest';
import { validateAudioLines } from './audio-line';
import { Device, DeviceType, Cable } from '../model/schema';

describe('validateAudioLines', () => {
  it('detects voltage drop on a long, thin cable', () => {
    const dtAmp: DeviceType = {
      id: 'dt-amp', manufacturer: 'AmpCo', model: 'A1', slug: 'a1', uHeight: 1, isFullDepth: true,
      customFields: { acoustics: { device_class: 'amplifier', watt_8: 1000, min_load: 4 } }
    };
    const dtSpk: DeviceType = {
      id: 'dt-spk', manufacturer: 'SpkCo', model: 'S1', slug: 's1', uHeight: 0, isFullDepth: false,
      customFields: { acoustics: { device_class: 'speaker', impedance: 4, wattage_rms: 500 } }
    };
    
    // Very thin cable: 100 ohms/km (e.g. 0.3mm2). Length 200m -> R = 20 ohms.
    // Load is 4 ohms. Drop will be massive!
    const dtCab: DeviceType = {
      id: 'dt-cab', manufacturer: 'CabCo', model: 'Thin', slug: 'thin', uHeight: 0, isFullDepth: false,
      customFields: { acoustics: { device_class: 'cable', resistance: 100 } }
    };

    const devices: Device[] = [
      { id: 'amp1', deviceTypeId: 'dt-amp', siteId: 'site1', status: 'planned', name: 'Amp' },
      { id: 'spk1', deviceTypeId: 'dt-spk', siteId: 'site1', status: 'planned', name: 'Spk' }
    ];

    const cables: Cable[] = [
      {
        id: 'c1', status: 'planned', lengthM: 200,
        terminations: [
          { deviceId: 'amp1', portRef: { kind: 'interface', name: 'Out1' } },
          { deviceId: 'spk1', portRef: { kind: 'interface', name: 'In' } }
        ],
        customFields: { acoustics: { device_class: 'cable', resistance: 100 } }
      }
    ];

    const res = validateAudioLines(devices, [dtAmp, dtSpk, dtCab], cables);
    
    expect(res.valid).toBe(false);
    expect(res.findings.length).toBeGreaterThan(0);
    expect(res.findings[0]!.severity).toBe('Error');
    expect(res.findings[0]!.dropPercent).toBeGreaterThan(50); // Massive drop
  });

  it('validates a healthy line', () => {
    const dtAmp: DeviceType = {
      id: 'dt-amp', manufacturer: 'AmpCo', model: 'A1', slug: 'a1', uHeight: 1, isFullDepth: true,
      customFields: { acoustics: { device_class: 'amplifier', watt_8: 1000, min_load: 4 } }
    };
    const dtSpk: DeviceType = {
      id: 'dt-spk', manufacturer: 'SpkCo', model: 'S1', slug: 's1', uHeight: 0, isFullDepth: false,
      customFields: { acoustics: { device_class: 'speaker', impedance: 8, wattage_rms: 100 } }
    };
    
    const devices: Device[] = [
      { id: 'amp1', deviceTypeId: 'dt-amp', siteId: 'site1', status: 'planned', name: 'Amp' },
      { id: 'spk1', deviceTypeId: 'dt-spk', siteId: 'site1', status: 'planned', name: 'Spk' }
    ];

    // 10m of thick cable, resistance 10 ohm/km -> R = 0.1 ohm. Load = 8 ohm.
    const cables: Cable[] = [
      {
        id: 'c1', status: 'planned', lengthM: 10,
        terminations: [
          { deviceId: 'amp1', portRef: { kind: 'interface', name: 'Out1' } },
          { deviceId: 'spk1', portRef: { kind: 'interface', name: 'In' } }
        ],
        customFields: { acoustics: { device_class: 'cable', resistance: 10 } }
      }
    ];

    const res = validateAudioLines(devices, [dtAmp, dtSpk], cables);
    
    expect(res.valid).toBe(true);
    expect(res.findings.length).toBe(0);
  });

  
});