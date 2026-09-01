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
