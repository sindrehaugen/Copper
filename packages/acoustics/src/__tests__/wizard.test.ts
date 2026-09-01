import { describe, it, expect } from 'vitest';
import { suggestAmps } from '../wizard';
import { Amplifier } from '../types/domain';

describe('wizard', () => {
  it('suggestAmps returns amplifiers with sufficient power for Low-Z load', () => {
    const catalog: Amplifier[] = [
      { slug: 'weak-amp', manufacturer: 'A', model: 'M1', watt_4: 100 },
      { slug: 'strong-amp', manufacturer: 'A', model: 'M2', watt_4: 500 },
      { slug: 'unstable-amp', manufacturer: 'A', model: 'M3', watt_8: 500, min_load: 8 } // can't handle 4 ohms
    ];
    
    // We need 400W at 4 ohms
    const suggestions = suggestAmps(4, 400, 'low-z', catalog);
    
    expect(suggestions.length).toBe(1);
    expect(suggestions[0].slug).toBe('strong-amp');
  });

  it('suggestAmps returns amplifiers with sufficient power for 100V load', () => {
    const catalog: Amplifier[] = [
      { slug: 'weak-amp', manufacturer: 'A', model: 'M1', watt_100v: 100 },
      { slug: 'strong-amp', manufacturer: 'A', model: 'M2', watt_100v: 1000 }
    ];
    
    // We need 800W at 100V
    const suggestions = suggestAmps(100, 800, '100V', catalog);
    
    expect(suggestions.length).toBe(1);
    expect(suggestions[0].slug).toBe('strong-amp');
  });
});
