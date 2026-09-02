/**
 * Acoustic Phase Summation (Near-field / Beamforming)
 * Author: Copper Acoustics Engine (Attribution: Concepts derived from Merlijn van Veen)
 */

export interface ArrayPointSource {
  id: string;
  x: number;
  y: number;
  delayMs: number;
  gainDb: number;
  polarity: 1 | -1;
}

const c = 343;

export function computePressure(
  sources: ArrayPointSource[],
  px: number,
  py: number,
  freqHz: number
): { real: number; imag: number; magDb: number } {
  let realSum = 0;
  let imagSum = 0;
  const omega = 2 * Math.PI * freqHz;

  for (const src of sources) {
    const dx = px - src.x;
    const dy = py - src.y;
    const r = Math.max(0.01, Math.sqrt(dx * dx + dy * dy));
    
    const tFlight = r / c;
    const tTotal = tFlight + src.delayMs / 1000.0;
    
    let phase = omega * tTotal;
    if (src.polarity === -1) {
      phase += Math.PI;
    }
    
    // Ignore 1/r for theoretical far-field polar plot, OR use large evaluation radius
    // We will just use standard 1/r and a large radius in the test.
    const linearGain = Math.pow(10, src.gainDb / 20.0);
    const A = linearGain / r;

    realSum += A * Math.cos(phase);
    imagSum += A * Math.sin(phase);
  }

  const magLinear = Math.sqrt(realSum * realSum + imagSum * imagSum);
  const magDb = magLinear > 0 ? 20 * Math.log10(magLinear) : -100;

  return { real: realSum, imag: imagSum, magDb };
}

export function computePolar(
  sources: ArrayPointSource[],
  freqHz: number,
  radius: number = 10,
  resolution: number = 1
): { angle: number; db: number }[] {
  const result = [];
  for (let angleDeg = 0; angleDeg < 360; angleDeg += resolution) {
    const rad = (angleDeg * Math.PI) / 180;
    const px = Math.cos(rad) * radius;
    const py = Math.sin(rad) * radius;
    const p = computePressure(sources, px, py, freqHz);
    result.push({ angle: angleDeg, db: p.magDb });
  }
  
  const maxDb = Math.max(...result.map(r => r.db));
  return result.map(r => ({ angle: r.angle, db: r.db - maxDb }));
}

export function computeHeatmap(
  sources: ArrayPointSource[],
  freqHz: number,
  sizeMeters: number,
  resolutionPixels: number
): Float32Array {
  const pixels = resolutionPixels;
  const grid = new Float32Array(pixels * pixels);
  const step = (sizeMeters * 2) / pixels;

  let maxDb = -Infinity;

  for (let iy = 0; iy < pixels; iy++) {
    const py = sizeMeters - iy * step;
    for (let ix = 0; ix < pixels; ix++) {
      const px = -sizeMeters + ix * step;
      const p = computePressure(sources, px, py, freqHz);
      grid[iy * pixels + ix] = p.magDb;
      if (p.magDb > maxDb) maxDb = p.magDb;
    }
  }

  const floor = maxDb - 60;
  for (let i = 0; i < grid.length; i++) {
    const v = grid[i] || 0;
    grid[i] = Math.max(0, v - floor) / 60.0;
  }

  return grid;
}

export type ArrayPreset = 'Endfire' | 'Broadside' | 'Cardioid' | 'Arc' | 'Gradient';

export interface ArrayOptions {
  spacingM?: number;
  amplitudeShading?: boolean;
  delayTaperingSplayDeg?: number;
}

export function generateArrayPreset(
  preset: ArrayPreset,
  count: number,
  freqHz: number,
  spacingM?: number,
  opts?: ArrayOptions
): ArrayPointSource[] {
  let sources: ArrayPointSource[] = [];
  const d = spacingM ?? opts?.spacingM ?? (c / (4 * freqHz));

  let ccount = 0, startY = 0, sY = 0;
  switch (preset) {
    case 'Endfire':
      for (let i = 0; i < count; i++) {
        const xPos = i * d;
        // Front (max xPos) is delayed the most
        const distanceToWait = xPos;
        const delayMs = (distanceToWait / c) * 1000;
        
        sources.push({
          id: 'sub-' + i,
          x: xPos,
          y: 0,
          delayMs,
          gainDb: 0,
          polarity: 1
        });
      }
      break;

    case 'Cardioid':
      ccount = count < 2 ? 2 : count;
      for (let i = 0; i < ccount; i++) {
        const xPos = i * d;
        const isRear = (i % 2 === 0); 
        const delayMs = isRear ? (d / c) * 1000 : 0;
        const polarity = isRear ? -1 : 1;
        
        sources.push({
          id: 'sub-' + i,
          x: xPos,
          y: 0,
          delayMs,
          gainDb: 0,
          polarity
        });
      }
      break;

    case 'Broadside':
      startY = -((count - 1) * d) / 2;
      for (let i = 0; i < count; i++) {
        sources.push({
          id: 'sub-' + i,
          x: 0,
          y: startY + i * d,
          delayMs: 0,
          gainDb: 0,
          polarity: 1
        });
      }
      break;
      
    case 'Arc':
      sY = -((count - 1) * d) / 2;
      for (let i = 0; i < count; i++) {
        const y = sY + i * d;
        const centerDist = Math.abs(y);
        const maxDist = Math.abs(sY);
        const delayDist = maxDist - centerDist;
        
        sources.push({
          id: 'sub-' + i,
          x: 0,
          y: y,
          delayMs: (delayDist / c) * 1000,
          gainDb: 0,
          polarity: 1
        });
      }
      break;

    case 'Gradient':
      for (let i = 0; i < count; i++) {
        sources.push({
          id: 'sub-' + i,
          x: -i * d,
          y: 0,
          delayMs: (i * d / c) * 1000,
          gainDb: 0,
          polarity: i % 2 === 1 ? -1 : 1
        });
      }
      break;
  }

  // Amplitude Shading (Hann Window)
  if (opts?.amplitudeShading && count > 1) {
    sources = sources.map((src, i) => {
      const windowGain = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (count - 1)));
      const windowGainDb = windowGain > 0.0001 ? 20 * Math.log10(windowGain) : -100;
      return { ...src, gainDb: src.gainDb + windowGainDb };
    });
  }

  // Delay Tapering (Electronic Delay Arc for Broadside)
  if (opts && opts.delayTaperingSplayDeg && preset === 'Broadside') {
    const splay = (opts.delayTaperingSplayDeg * Math.PI) / 180;
    const offset = (count - 1) / 2;
    const extraDelaysMs = sources.map((_, i) => {
      const s = i - offset;
      const xDist = Math.abs(s) * d * (1 - Math.cos(splay));
      return (xDist / c) * 1000;
    });
    const maxExtraDelay = Math.max(...extraDelaysMs);
    sources = sources.map((src, i) => ({
      ...src,
      delayMs: src.delayMs + (maxExtraDelay - (extraDelaysMs[i] ?? 0))
    }));
  }

  return sources;
}
