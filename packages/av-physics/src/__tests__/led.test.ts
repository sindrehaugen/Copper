import { describe, it, expect } from 'vitest';
import { calculateLedInfrastructure, calculatePixelPitch } from '../led';

describe('LED Infrastructure Physics', () => {
  it('computes Samsung/NovaStar reference project correctly', () => {
    // Reference from typical 24x12 cabinet wall (e.g. 7680x2160 res total)
    // 24 columns, 12 rows = 288 cabinets.
    // 7680 / 24 = 320 px/cab. 2160 / 12 = 180 px/cab.
    // Max Power: 18954W total / 288 = 65.8W/cab
    // Typ Power: 6340W total / 288 = 22.0W/cab
    // Weight: 1238.4kg total / 288 = 4.3kg/cab
    const stats = calculateLedInfrastructure({
      columns: 24,
      rows: 12,
      cabinet: {
        widthMm: 600,
        heightMm: 337.5,
        resX: 320,
        resY: 180,
        maxPowerW: 18954 / 288,
        typPowerW: 6340 / 288,
        weightKg: 1238.4 / 288
      }
    });

    expect(stats.totalPixels).toBe(16588800);
    // 16588800 / 650000 = 25.52 => minimum 26 ports. 
    // (Note: The spec actually uses 32 ports for symmetric layout, but 26 is the physical bandwidth minimum).
    expect(stats.requiredNovaStarPorts).toBe(26);

    expect(Math.round(stats.totalMaxPowerW)).toBe(18954);
    expect(Math.round(stats.totalTypPowerW)).toBe(6340);
    expect(Math.round(stats.totalWeightKg)).toBe(1238);

    // Thermal BTU
    // 6340W * 3.412142 = ~21633 BTU/h
    // 18954W * 3.412142 = ~64673 BTU/h
    expect(stats.thermalTypBtu).toBeGreaterThan(21600);
    expect(stats.thermalTypBtu).toBeLessThan(21700);
    
    expect(stats.thermalMaxBtu).toBeGreaterThan(64600);
    expect(stats.thermalMaxBtu).toBeLessThan(64700);

    // Circuits 16A * 230V * 0.8 = 2944W
    // 18954 / 2944 = 6.4 => 7 circuits.
    expect(stats.requiredCircuits16A230V).toBe(7);
  });

  it('calculates pixel pitch accurately', () => {
    // 600mm / 320px = 1.875mm pitch (e.g. Samsung IF015H or similar 1.8mm class)
    const pitch = calculatePixelPitch(600, 320);
    expect(pitch).toBeCloseTo(1.875);
  });
});
