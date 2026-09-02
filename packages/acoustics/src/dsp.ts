/**
 * Professional-grade DSP filters (Biquad: LPF, HPF, Peaking, Shelving) and Crossovers.
 * 
 * Formulas based on Robert Bristow-Johnson's "Cookbook formulae for audio EQ biquad filter coefficients".
 * H(s) to H(z) via Bilinear Transform.
 * 
 * Equations:
 * w0 = 2 * pi * f0 / Fs
 * alpha = sin(w0) / (2 * Q)
 * A = 10^(dBgain/40) (for peaking/shelving)
 */

export interface BiquadCoeffs {
  b0: number;
  b1: number;
  b2: number;
  a0: number;
  a1: number;
  a2: number;
}

export interface DSPComplex { re: number; im: number; }

export type FilterType = 'lpf' | 'hpf' | 'peaking' | 'lowshelf' | 'highshelf';

export function calculateBiquad(
  type: FilterType,
  f0: number,
  fs: number,
  Q: number,
  gainDb: number = 0
): BiquadCoeffs {
  const w0 = 2 * Math.PI * f0 / fs;
  const alpha = Math.sin(w0) / (2 * Q);
  const A = Math.pow(10, gainDb / 40);
  const cosw0 = Math.cos(w0);
  const sqA_alpha = 2 * Math.sqrt(A) * alpha;

  let b0 = 0, b1 = 0, b2 = 0, a0 = 1, a1 = 0, a2 = 0;

  switch (type) {
    case 'lpf':
      b0 = (1 - cosw0) / 2;
      b1 = 1 - cosw0;
      b2 = (1 - cosw0) / 2;
      a0 = 1 + alpha;
      a1 = -2 * cosw0;
      a2 = 1 - alpha;
      break;
    case 'hpf':
      b0 = (1 + cosw0) / 2;
      b1 = -(1 + cosw0);
      b2 = (1 + cosw0) / 2;
      a0 = 1 + alpha;
      a1 = -2 * cosw0;
      a2 = 1 - alpha;
      break;
    case 'peaking':
      b0 = 1 + alpha * A;
      b1 = -2 * cosw0;
      b2 = 1 - alpha * A;
      a0 = 1 + alpha / A;
      a1 = -2 * cosw0;
      a2 = 1 - alpha / A;
      break;
    case 'lowshelf':
      b0 = A * ((A + 1) - (A - 1) * cosw0 + sqA_alpha);
      b1 = 2 * A * ((A - 1) - (A + 1) * cosw0);
      b2 = A * ((A + 1) - (A - 1) * cosw0 - sqA_alpha);
      a0 = (A + 1) + (A - 1) * cosw0 + sqA_alpha;
      a1 = -2 * ((A - 1) + (A + 1) * cosw0);
      a2 = (A + 1) + (A - 1) * cosw0 - sqA_alpha;
      break;
    case 'highshelf':
      b0 = A * ((A + 1) + (A - 1) * cosw0 + sqA_alpha);
      b1 = -2 * A * ((A - 1) + (A + 1) * cosw0);
      b2 = A * ((A + 1) + (A - 1) * cosw0 - sqA_alpha);
      a0 = (A + 1) - (A - 1) * cosw0 + sqA_alpha;
      a1 = 2 * ((A - 1) - (A + 1) * cosw0);
      a2 = (A + 1) - (A - 1) * cosw0 - sqA_alpha;
      break;
  }

  // Normalize by a0
  return {
    b0: b0 / a0,
    b1: b1 / a0,
    b2: b2 / a0,
    a0: 1,
    a1: a1 / a0,
    a2: a2 / a0,
  };
}

/**
 * Linkwitz-Riley 24dB/octave is formed by cascading two Butterworth 2nd order filters.
 * Butterworth Q = 1 / sqrt(2) = 0.7071
 */
export function getLR24(type: 'lpf' | 'hpf', f0: number, fs: number): BiquadCoeffs[] {
  const Q = 1 / Math.SQRT2;
  const bq1 = calculateBiquad(type, f0, fs, Q);
  const bq2 = calculateBiquad(type, f0, fs, Q);
  return [bq1, bq2];
}

/**
 * Butterworth 12dB/octave (2nd order).
 */
export function getButterworth2(type: 'lpf' | 'hpf', f0: number, fs: number): BiquadCoeffs {
  const Q = 1 / Math.SQRT2;
  return calculateBiquad(type, f0, fs, Q);
}

/**
 * DSPComplex frequency response of a single biquad at given frequency.
 * H(z) = (b0 + b1*z^-1 + b2*z^-2) / (a0 + a1*z^-1 + a2*z^-2)
 * z = e^(j*w), z^-1 = e^(-j*w) = cos(w) - j*sin(w)
 */
export function evaluateBiquad(coeffs: BiquadCoeffs, f: number, fs: number): DSPComplex {
  const w = 2 * Math.PI * f / fs;
  const cos1 = Math.cos(-w);
  const sin1 = Math.sin(-w);
  const cos2 = Math.cos(-2 * w);
  const sin2 = Math.sin(-2 * w);

  const numRe = coeffs.b0 + coeffs.b1 * cos1 + coeffs.b2 * cos2;
  const numIm = coeffs.b1 * sin1 + coeffs.b2 * sin2;

  const denRe = coeffs.a0 + coeffs.a1 * cos1 + coeffs.a2 * cos2;
  const denIm = coeffs.a1 * sin1 + coeffs.a2 * sin2;

  // DSPComplex division
  const denMag2 = denRe * denRe + denIm * denIm;
  const re = (numRe * denRe + numIm * denIm) / denMag2;
  const im = (numIm * denRe - numRe * denIm) / denMag2;

  return { re, im };
}

/**
 * Evaluate cascade of biquads.
 */
export function evaluateCascade(cascade: BiquadCoeffs[], f: number, fs: number): DSPComplex {
  let re = 1, im = 0;
  for (const bq of cascade) {
    const H = evaluateBiquad(bq, f, fs);
    const nRe = re * H.re - im * H.im;
    const nIm = re * H.im + im * H.re;
    re = nRe;
    im = nIm;
  }
  return { re, im };
}

/**
 * Combine two DSPComplex responses (e.g. summing LPF and HPF outputs).
 */
export function addComplex(c1: DSPComplex, c2: DSPComplex): DSPComplex {
  return { re: c1.re + c2.re, im: c1.im + c2.im };
}

export function complexMagnitudeDb(c: DSPComplex): number {
  const mag = Math.sqrt(c.re * c.re + c.im * c.im);
  return mag > 0 ? 20 * Math.log10(mag) : -Infinity;
}


