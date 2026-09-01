import React, { useState, useMemo } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import {
  speedOfSound, wavelength, period,
  delayFromDistance, distanceFromDelay,
  phaseFromDelay, delayFromPhase,
  airAbsorption, airAbsorptionDb,
  floorBounce, logFrequencyGrid
} from '@copper/acoustics';

const fmt = (n: number, digits: number) => n.toFixed(digits);

export const CalculatorsDrawer: React.FC = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  // Environment
  const [T_C, setT_C] = useState(20);
  const [RH, setRH] = useState(50);
  const [p_atm, setP_atm] = useState(101325);
  const c = useMemo(() => speedOfSound(T_C, RH, p_atm), [T_C, RH, p_atm]);

  // Wavelength / period
  const [freq, setFreq] = useState(1000);
  const lambda = useMemo(() => wavelength(freq, c), [freq, c]);
  const periodMs = useMemo(() => period(freq) * 1000, [freq]);

  // Distance / delay
  const [distM, setDistM] = useState(10);
  const delayMs = useMemo(() => delayFromDistance(distM, c) * 1000, [distM, c]);
  const [delayInput, setDelayInput] = useState(10);
  const distFromDelay = useMemo(() => distanceFromDelay(delayInput / 1000, c), [delayInput, c]);

  // Phase / delay
  const [phaseFreq, setPhaseFreq] = useState(1000);
  const [phaseDelayMs, setPhaseDelayMs] = useState(1);
  const phaseDeg = useMemo(() => phaseFromDelay(phaseDelayMs / 1000, phaseFreq), [phaseDelayMs, phaseFreq]);
  const [phaseInputDeg, setPhaseInputDeg] = useState(180);
  const delayFromPhaseMs = useMemo(() => delayFromPhase(phaseInputDeg, phaseFreq) * 1000, [phaseInputDeg, phaseFreq]);

  // Air absorption
  const [absorbDist, setAbsorbDist] = useState(30);
  const absorbBands = [125, 250, 500, 1000, 2000, 4000, 8000, 16000];
  const absorbRows = useMemo(() => absorbBands.map((f) => ({
    f,
    alpha: airAbsorption(f, T_C, RH, p_atm),
    dB: airAbsorptionDb(f, absorbDist, T_C, RH, p_atm),
  })), [absorbBands, T_C, RH, p_atm, absorbDist]);

  // Floor bounce
  const [fbDist, setFbDist] = useState(4);
  const [fbSrcH, setFbSrcH] = useState(1.2);
  const [fbMicH, setFbMicH] = useState(1.2);
  const [fbReflect, setFbReflect] = useState(0.8);
  
  const fbPath = useMemo(() => {
    const fbGrid = logFrequencyGrid(50, 20000, 120);
    const fbSamples = fbGrid.map((f) => ({
      f,
      db: floorBounce(f, fbDist, fbSrcH, fbMicH, fbReflect, c),
    }));
    const fMin = Math.log10(fbGrid[0]!);
    const fMax = Math.log10(fbGrid[fbGrid.length - 1]!);
    const xOf = (f: number) => ((Math.log10(f) - fMin) / (fMax - fMin)) * 600;
    const yOf = (db: number) => -db; // 1 px per dB, centre at 0
    return fbSamples.map((s, i) => (i === 0 ? 'M' : 'L') + xOf(s.f).toFixed(1) + ',' + yOf(s.db).toFixed(1)).join(' ');
  }, [fbDist, fbSrcH, fbMicH, fbReflect, c]);

  if (!isOpen) {
    return (
      <button 
        className="m3-button" 
        style={{ position: 'absolute', bottom: 16, right: 16, zIndex: 10 }} 
        onClick={() => setIsOpen(true)}
      >
        Calculators
      </button>
    );
  }

  return (
    <div style={{ position: 'absolute', right: 16, bottom: 60, width: 400, height: 600, overflow: 'auto', zIndex: 10, background: 'var(--copper-surface)', border: '1px solid var(--copper-outline)', padding: 16, borderRadius: 8, boxShadow: 'var(--md-sys-elevation-level-3)' }}>
      <button className="m3-button m3-button-text" onClick={() => setIsOpen(false)} style={{ float: 'right' }}>X</button>
      <div className="m3-content-padding" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="m3-card m3-content-padding">
        <h2>{t('acoustics.title', 'Acoustics calculators')}</h2>
        <p>
          <Trans i18nKey="acoustics.credit">
            These calculators are based on the work of <a href="https://www.merlijnvanveen.nl/en/calculators" target="_blank" rel="noopener">Merlijn van Veen</a>.
            The original Excel spreadsheets are freely available on his website; this panel re-implements the same formulae in TypeScript so they can feed the design tool and be unit-tested. Credit for pulling these formulae together into accessible calculators belongs to Merlijn van Veen.
          </Trans>
        </p>
      </div>

      <div className="m3-card m3-content-padding">
        <h3>{t('acoustics.environment', 'Environment')}</h3>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {t('acoustics.temp', 'Temperature (°C)')}
            <input type="number" step="0.5" value={T_C} onChange={(e) => setT_C(Number(e.target.value))} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {t('acoustics.rh', 'Relative humidity (%)')}
            <input type="number" step="1" min="0" max="100" value={RH} onChange={(e) => setRH(Number(e.target.value))} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {t('acoustics.pressure', 'Atmospheric pressure (Pa)')}
            <input type="number" step="100" value={p_atm} onChange={(e) => setP_atm(Number(e.target.value))} />
          </label>
        </div>
        <p style={{ marginTop: '16px', fontWeight: 'bold' }}>
          {t('acoustics.speed', 'Speed of sound')} c = {fmt(c, 2)} m/s
        </p>
      </div>

      <div className="m3-card m3-content-padding">
        <h3>{t('acoustics.wavelength_period', 'Wavelength & period')}</h3>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {t('acoustics.frequency', 'Frequency (Hz)')}
            <input type="number" step="1" value={freq} onChange={(e) => setFreq(Number(e.target.value))} />
          </label>
          <div>
            λ = <strong>{fmt(lambda * 100, 2)} cm</strong>
            &nbsp;·&nbsp;
            T = <strong>{fmt(periodMs, 3)} ms</strong>
          </div>
        </div>
      </div>

      <div className="m3-card m3-content-padding">
        <h3>{t('acoustics.dist_delay', 'Distance ↔ delay')}</h3>
        <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {t('acoustics.distance', 'Distance (m)')}
              <input type="number" step="0.1" value={distM} onChange={(e) => setDistM(Number(e.target.value))} />
            </label>
            <div>delay = <strong>{fmt(delayMs, 2)} ms</strong></div>
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {t('acoustics.delay', 'Delay (ms)')}
              <input type="number" step="0.1" value={delayInput} onChange={(e) => setDelayInput(Number(e.target.value))} />
            </label>
            <div>dist = <strong>{fmt(distFromDelay, 2)} m</strong></div>
          </div>
        </div>
      </div>

      <div className="m3-card m3-content-padding">
        <h3>{t('acoustics.phase_delay', 'Phase ↔ delay')}</h3>
        <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {t('acoustics.frequency', 'Frequency (Hz)')}
              <input type="number" step="1" value={phaseFreq} onChange={(e) => setPhaseFreq(Number(e.target.value))} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {t('acoustics.delay', 'Delay (ms)')}
              <input type="number" step="0.1" value={phaseDelayMs} onChange={(e) => setPhaseDelayMs(Number(e.target.value))} />
            </label>
            <div>phase = <strong>{fmt(phaseDeg, 1)}°</strong></div>
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {t('acoustics.frequency', 'Frequency (Hz)')}
              <input type="number" step="1" value={phaseFreq} onChange={(e) => setPhaseFreq(Number(e.target.value))} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {t('acoustics.phase', 'Phase (°)')}
              <input type="number" step="5" value={phaseInputDeg} onChange={(e) => setPhaseInputDeg(Number(e.target.value))} />
            </label>
            <div>delay = <strong>{fmt(delayFromPhaseMs, 3)} ms</strong></div>
          </div>
        </div>
        <p style={{ opacity: 0.7, marginTop: '8px', fontSize: '0.875rem' }}>
          {t('acoustics.phase_sign', 'Sign convention: a positive delay produces a negative (lagging) phase shift.')}
        </p>
      </div>

      <div className="m3-card m3-content-padding">
        <h3>{t('acoustics.air_absorption', 'Air absorption (ISO 9613-1)')}</h3>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {t('acoustics.prop_distance', 'Propagation distance (m)')}
            <input type="number" step="1" value={absorbDist} onChange={(e) => setAbsorbDist(Number(e.target.value))} />
          </label>
          <div style={{ opacity: 0.7, fontSize: '0.875rem' }}>
            At {T_C} °C, {RH}% RH, {(p_atm / 1000).toFixed(1)} kPa.
          </div>
        </div>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ padding: '8px', borderBottom: '1px solid var(--md-sys-color-outline-variant)' }}>f (Hz)</th>
              <th style={{ padding: '8px', borderBottom: '1px solid var(--md-sys-color-outline-variant)' }}>α (dB/m)</th>
              <th style={{ padding: '8px', borderBottom: '1px solid var(--md-sys-color-outline-variant)' }}>Loss at {absorbDist} m (dB)</th>
            </tr>
          </thead>
          <tbody>
            {absorbRows.map((r) => (
              <tr key={r.f}>
                <td style={{ padding: '8px', borderBottom: '1px solid var(--md-sys-color-outline-variant)' }}>{r.f}</td>
                <td style={{ padding: '8px', borderBottom: '1px solid var(--md-sys-color-outline-variant)' }}>{fmt(r.alpha, 4)}</td>
                <td style={{ padding: '8px', borderBottom: '1px solid var(--md-sys-color-outline-variant)' }}>{fmt(r.dB, 2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="m3-card m3-content-padding">
        <h3>{t('acoustics.floor_bounce', 'Floor bounce (comb filter)')}</h3>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {t('acoustics.hz_dist', 'Horizontal distance (m)')}
            <input type="number" step="0.1" value={fbDist} onChange={(e) => setFbDist(Number(e.target.value))} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {t('acoustics.src_height', 'Source height (m)')}
            <input type="number" step="0.1" value={fbSrcH} onChange={(e) => setFbSrcH(Number(e.target.value))} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {t('acoustics.mic_height', 'Mic height (m)')}
            <input type="number" step="0.1" value={fbMicH} onChange={(e) => setFbMicH(Number(e.target.value))} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {t('acoustics.reflection', 'Reflection coeff')}
            <input type="number" step="0.1" min="0" max="1" value={fbReflect} onChange={(e) => setFbReflect(Number(e.target.value))} />
          </label>
        </div>
        <svg viewBox="0 -24 600 48" style={{ width: '100%', maxWidth: '600px', background: 'var(--md-sys-color-surface-container-high)', borderRadius: '8px', border: '1px solid var(--md-sys-color-outline-variant)' }}>
          <line x1="0" y1="0" x2="600" y2="0" stroke="var(--md-sys-color-outline)" strokeWidth="1" />
          <path d={fbPath} fill="none" stroke="var(--md-sys-color-primary)" strokeWidth="2" />
        </svg>
      </div>
    </div>
    </div>
  );
};
