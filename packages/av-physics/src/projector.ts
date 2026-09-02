/**
 * Calculates projection throw distance range.
 * @param imageWidth Meters
 * @param throwRatioMin 
 * @param throwRatioMax 
 * @returns [minDistance, maxDistance] in meters
 */
export function calculateThrowDistance(imageWidth: number, throwRatioMin: number, throwRatioMax: number): [number, number] {
  return [imageWidth * throwRatioMin, imageWidth * throwRatioMax];
}

/**
 * Calculates on-screen luminance from a projector.
 * @param lumens Projector brightness in ANSI lumens
 * @param area Image area in square meters
 * @param gain Screen gain
 * @returns Luminance in nits (cd/m^2)
 */
export function calculateLuminance(lumens: number, area: number, gain: number = 1.0): number {
  const illuminance = lumens / area; // lux
  return (illuminance * gain) / Math.PI; // nits
}

/**
 * Calculates the projected image width at a given distance and throw ratio.
 * @param distance Meters
 * @param throwRatio 
 * @returns Image width in meters
 */
export function calculateProjectedWidth(distance: number, throwRatio: number): number {
  return distance / throwRatio;
}

/**
 * Validates if a requested lens shift is within a standard elliptical lens envelope.
 * @param hShift Requested horizontal shift percentage (e.g., 0.1 for 10%)
 * @param vShift Requested vertical shift percentage
 * @param maxHShift Maximum horizontal shift percentage specified by lens
 * @param maxVShift Maximum vertical shift percentage specified by lens
 * @returns boolean True if within lens envelope
 */
export function isWithinLensShiftEnvelope(hShift: number, vShift: number, maxHShift: number, maxVShift: number): boolean {
  if (maxHShift === 0 && hShift !== 0) return false;
  if (maxVShift === 0 && vShift !== 0) return false;
  
  // Elliptical envelope check
  const hTerm = maxHShift === 0 ? 0 : Math.pow(hShift / maxHShift, 2);
  const vTerm = maxVShift === 0 ? 0 : Math.pow(vShift / maxVShift, 2);
  return (hTerm + vTerm) <= 1.0;
}

/**
 * Calculates the offset angle (beam geometry) from the projector lens to the screen edge.
 * @param distance Distance from lens to screen in meters
 * @param offset Distance from lens center to screen edge in meters (e.g., 50% image height + lens shift)
 * @returns Angle in degrees
 */
export function calculateOffsetAngle(distance: number, offset: number): number {
  return Math.atan(offset / distance) * (180 / Math.PI);
}
