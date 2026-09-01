import { RoomGeometry, PointSource, Listener, directSpl, reverberantSpl, stiEstimate, rt60 } from './room';

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface SpeakerSource {
  position: Point3D;
  sensitivity1W1m: number;
  directivityQ: number;
  electricalPowerW: number;
}

export interface CoverageResult {
  directSpl: number;
  reverberantSpl: number;
  totalSpl: number;
  rt60: number;
  sti: number;
}

export function computeRoomCoverage(
  room: RoomGeometry,
  speakers: SpeakerSource[],
  evalPoints: Point3D[]
): CoverageResult[] {
  const roomRt60 = rt60(room);
  
  // Convert SpeakerSource to PointSource for room.ts
  const ptSources: PointSource[] = speakers.map(s => ({
    x: s.position.x,
    y: s.position.y,
    z: s.position.z,
    sensitivity: s.sensitivity1W1m,
    power: s.electricalPowerW,
    directivityQ: s.directivityQ
  }));

  // Room reverberant SPL depends on all sources
  const revSpl = reverberantSpl(ptSources, room);

  return evalPoints.map(point => {
    let totalDirectIntensity = 0;

    for (const spk of ptSources) {
      const listener: Listener = { x: point.x, y: point.y, z: point.z };
      const dSpl = directSpl(spk, listener);
      totalDirectIntensity += Math.pow(10, dSpl / 10);
    }

    const dSplAgg = totalDirectIntensity > 0 ? 10 * Math.log10(totalDirectIntensity) : 0;
    const totalSpl = 10 * Math.log10(totalDirectIntensity + Math.pow(10, revSpl / 10));

    // Simple STI estimation
    const snr = dSplAgg - revSpl;
    const sti = stiEstimate(snr, roomRt60, 2);

    return {
      directSpl: dSplAgg,
      reverberantSpl: revSpl,
      totalSpl,
      rt60: roomRt60,
      sti
    };
  });
}
