/**
 * Calculates Field of View (FOV) in degrees for a given sensor dimension and focal length.
 * @param sensorDimension mm (e.g., width for HFOV, height for VFOV)
 * @param focalLength mm
 * @returns Angle in degrees
 */
export function calculateFOV(sensorDimension: number, focalLength: number): number {
  const rad = 2 * Math.atan(sensorDimension / (2 * focalLength));
  return rad * (180 / Math.PI);
}

/**
 * Calculates the coverage width or height (cone) at a specific distance.
 * @param distance Meters
 * @param fovDegrees Field of View in degrees
 * @returns Coverage dimension in meters
 */
export function calculateCoverageDimension(distance: number, fovDegrees: number): number {
  const rad = fovDegrees * (Math.PI / 180);
  return 2 * distance * Math.tan(rad / 2);
}

/**
 * Calculates pixel density (pixels per meter) at a specific distance.
 * @param distance Meters
 * @param fovDegrees Field of View in degrees
 * @param resolution Dimension resolution in pixels (e.g., 1920 for horizontal)
 * @returns Pixels per meter
 */
export function calculatePixelDensityAtDistance(distance: number, fovDegrees: number, resolution: number): number {
  const coverage = calculateCoverageDimension(distance, fovDegrees);
  return resolution / coverage;
}
