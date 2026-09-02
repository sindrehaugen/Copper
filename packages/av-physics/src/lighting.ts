/**
 * Calculates point-source illuminance based on the inverse square law.
 * @param intensity Luminous intensity in candela (cd)
 * @param distance Distance from the source in meters (m)
 * @returns Illuminance in lux (lx)
 */
export function calculatePointSourceIlluminance(intensity: number, distance: number): number {
  if (distance === 0) return 0;
  return intensity / (distance * distance);
}

/**
 * Calculates the diameter of a beam or field footprint at a given distance.
 * @param distance Distance to the surface in meters
 * @param angleDegrees Beam or field angle in degrees
 * @returns Diameter of the footprint in meters
 */
export function calculateFootprintDiameter(distance: number, angleDegrees: number): number {
  const rad = angleDegrees * (Math.PI / 180);
  return 2 * distance * Math.tan(rad / 2);
}

/**
 * Calculates the horizontal and vertical illuminance at a specific point,
 * assuming the light source is aimed at an angle relative to the surface normal.
 * @param normalIlluminance Illuminance perpendicular to the light beam (lux)
 * @param incidenceAngleDegrees Angle of incidence relative to the surface normal (degrees)
 * @returns [horizontalLux, verticalLux]
 */
export function calculateIlluminanceComponents(normalIlluminance: number, incidenceAngleDegrees: number): [number, number] {
  const rad = incidenceAngleDegrees * (Math.PI / 180);
  const horizontal = normalIlluminance * Math.cos(rad);
  const vertical = normalIlluminance * Math.sin(rad);
  return [Math.abs(horizontal), Math.abs(vertical)];
}

/**
 * Approximates Correlated Color Temperature (CCT) from CIE 1931 x,y coordinates using McCamy's formula.
 * @param x CIE 1931 x coordinate
 * @param y CIE 1931 y coordinate
 * @returns CCT in Kelvin
 */
export function calculateCCTMcCamy(x: number, y: number): number {
  const n = (x - 0.3320) / (0.1858 - y);
  return 449 * Math.pow(n, 3) + 3525 * Math.pow(n, 2) + 6823.3 * n + 5520.33;
}
