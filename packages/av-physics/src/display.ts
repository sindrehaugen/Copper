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
 * @param elementPercentage Height of the critical element as a percentage of overall image height
 * @param viewingFactor AVIXA factor (typically 200 for standard acuity)
 * @returns Max distance in meters
 */
export function calculateADMMaxDistance(imageHeight: number, elementPercentage: number, viewingFactor: number = 200): number {
  return (imageHeight * viewingFactor) / elementPercentage;
}

/**
 * Calculates Image System Contrast Ratio (ISCR)
 * @param imageLuminance peak white luminance in nits
 * @param blackLuminance black level luminance in nits
 * @param ambientLux ambient light hitting the screen in lux
 * @param screenGain screen gain (default 1.0)
 */
export function calculateISCR(imageLuminance: number, blackLuminance: number, ambientLux: number = 0, screenGain: number = 1.0): number {
  const ambientLuminance = (ambientLux * screenGain) / Math.PI;
  return (imageLuminance + ambientLuminance) / (blackLuminance + ambientLuminance);
}

/**
 * ISCR targets per AVIXA standard.
 */
export const ISCR_TARGETS = {
  PASSIVE_VIEWING: 7,
  BASIC_DECISION_MAKING: 15,
  ANALYTICAL_DECISION_MAKING: 50,
  FULL_MOTION_VIDEO: 80,
};

/**
 * Checks if a viewing angle is within AVIXA DISCAS limits.
 * @param horizontalAngle degrees from center
 * @param verticalAngle degrees from center
 * @returns boolean
 */
export function isWithinViewingAngleLimits(horizontalAngle: number, verticalAngle: number): boolean {
  // Horizontal should generally be within +/- 60 degrees, vertical within +15/-30 (or similar standard limits)
  // DISCAS typical limit: horizontal <= 45 degrees, vertical <= 15 degrees up, <= 30 degrees down
  return Math.abs(horizontalAngle) <= 60 && verticalAngle <= 15 && verticalAngle >= -30;
}

/**
 * Calculates the optimal or minimum viewing distance for an LED wall based on pixel pitch.
 * Visual acuity standard is ~3438 * pitch for 1 arcminute (Retina distance).
 * @param pixelPitch mm
 * @param acuityFactor 3438 for 1 arcminute (standard 20/20 vision)
 * @returns Distance in meters
 */
export function calculatePixelPitchMinDistance(pixelPitch: number, acuityFactor: number = 3438): number {
  return (pixelPitch * acuityFactor) / 1000;
}

