

/**
 * Calculates the Critical Distance (Dc) where direct sound equals reverberant sound.
 * @param volume Room volume in cubic meters
 * @param rt60 Room reverberation time in seconds
 * @param q Directivity factor of the sound source (Q=1 for omni)
 * @returns Critical distance in meters
 */
export function calculateCriticalDistance(volume: number, rt60: number, q: number = 1): number {
  // Dc = 0.057 * sqrt( (V * Q) / RT60 )
  return 0.057 * Math.sqrt((volume * q) / rt60);
}

/**
 * Estimates PAG/NAG (Potential Acoustic Gain / Needed Acoustic Gain) stability margin.
 * Simplified classical calculation.
 * @param Ds Distance source to mic
 * @param D0 Distance source to listener
 * @param D1 Distance mic to loudspeaker
 * @param D2 Distance loudspeaker to listener
 * @param NOM Number of Open Microphones
 * @returns Acoustic margin in dB (positive means stable, typically want >= 6dB)
 */
export function calculatePAGNAGMargin(Ds: number, D0: number, D1: number, D2: number, NOM: number = 1): number {
  const pag = 20 * Math.log10(D0) + 20 * Math.log10(D1) - 20 * Math.log10(Ds) - 20 * Math.log10(D2) - 10 * Math.log10(NOM) - 6; // -6dB FSM
  const nag = 20 * Math.log10(D0 / Ds);
  return pag - nag;
}
