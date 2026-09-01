// AVIXA DISCAS (Display Image Size for 2D Content in Audiovisual Systems)

/**
 * Calculates the Maximum Viewing Distance (Farthest Viewer) based on Basic Decision Making (BDM).
 * BDM multiplier is typically 6x the image height.
 * @param imageHeight Meters
 * @returns Max distance in meters
 */
export function calculateBDMMaxDistance(imageHeight: number): number {
  return imageHeight * 6.0;
}

/**
 * Calculates the Maximum Viewing Distance based on Analytical Decision Making (ADM).
 * @param imageHeight Meters
 * @param elementPercentage Height of the critical element as a percentage of overall image height (e.g., 2 for 2%)
 * @param viewingFactor AVIXA factor (typically 200 for standard acuity)
 * @returns Max distance in meters
 */
export function calculateADMMaxDistance(imageHeight: number, elementPercentage: number, viewingFactor: number = 200): number {
  return (imageHeight * viewingFactor) / elementPercentage;
}

/**
 * Calculates Image System Contrast Ratio (ISCR)
 * @param imageLuminance peak white luminance in nits/lux
 * @param blackLuminance black level luminance in nits/lux
 * @param ambientLight ambient light hitting the screen in lux
 */
export function calculateISCR(imageLuminance: number, blackLuminance: number, ambientLight: number): number {
  return (imageLuminance + ambientLight) / (blackLuminance + ambientLight);
}
