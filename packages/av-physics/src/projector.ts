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
