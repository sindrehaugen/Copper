/**
 * LED Wall Physics & Infrastructure (Power, Signal, Thermal)
 * Formulas for signal distribution (e.g. NovaStar H-series) and electrical power loads.
 */

export interface LedCabinet {
  widthMm: number;
  heightMm: number;
  resX: number;
  resY: number;
  maxPowerW: number;
  typPowerW: number;
  weightKg: number;
}

export interface LedWall {
  columns: number;
  rows: number;
  cabinet: LedCabinet;
}

export interface LedInfrastructureStats {
  totalPixels: number;
  totalMaxPowerW: number;
  totalTypPowerW: number;
  thermalMaxBtu: number;
  thermalTypBtu: number;
  totalWeightKg: number;
  requiredNovaStarPorts: number;
  requiredCircuits16A230V: number;
}

const BTU_PER_WATT = 3.412142;
const NOVASTAR_H_SERIES_PORT_LIMIT = 650000;
const VOLTAGE_EU = 230;
const CIRCUIT_BREAKER_AMPS = 16;
const CIRCUIT_SAFETY_MARGIN = 0.8; // e.g. 16A * 230V * 0.8 = 2944W usable per circuit

/**
 * Computes the total infrastructure requirements for an LED wall, taking into account
 * NovaStar port limits (650k pixels/port) and standard EU electrical circuits.
 */
export function calculateLedInfrastructure(wall: LedWall): LedInfrastructureStats {
  const cabinetCount = wall.columns * wall.rows;
  
  const pixelsPerCabinet = wall.cabinet.resX * wall.cabinet.resY;
  const totalPixels = pixelsPerCabinet * cabinetCount;

  const totalMaxPowerW = wall.cabinet.maxPowerW * cabinetCount;
  const totalTypPowerW = wall.cabinet.typPowerW * cabinetCount;

  // Thermal dissipation (all power turns into heat)
  const thermalMaxBtu = totalMaxPowerW * BTU_PER_WATT;
  const thermalTypBtu = totalTypPowerW * BTU_PER_WATT;

  const totalWeightKg = wall.cabinet.weightKg * cabinetCount;

  // Signal: NovaStar H-Series limit is typically 650,000 pixels per gigabit Ethernet port
  const requiredNovaStarPorts = Math.ceil(totalPixels / NOVASTAR_H_SERIES_PORT_LIMIT);

  // Power: Standard 16A 230V circuit in EU/Norway with a safety margin (avoiding breaker trip on inrush)
  const maxSafeWattsPerCircuit = VOLTAGE_EU * CIRCUIT_BREAKER_AMPS * CIRCUIT_SAFETY_MARGIN;
  const requiredCircuits16A230V = Math.ceil(totalMaxPowerW / maxSafeWattsPerCircuit);

  return {
    totalPixels,
    totalMaxPowerW,
    totalTypPowerW,
    thermalMaxBtu,
    thermalTypBtu,
    totalWeightKg,
    requiredNovaStarPorts,
    requiredCircuits16A230V
  };
}

/**
 * Calculates pixel pitch (mm) given a cabinet dimension and resolution.
 */
export function calculatePixelPitch(widthMm: number, resX: number): number {
  return widthMm / resX;
}
