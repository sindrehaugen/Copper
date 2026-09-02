import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDocumentStore } from '../../store/documentStore';
import { calculateLedInfrastructure, LedCabinet, LedWall } from '@copper/av-physics';

const PRESETS: Record<string, LedCabinet> = {
  'Samsung IWA012': {
    widthMm: 806.4,
    heightMm: 453.6,
    resX: 640,
    resY: 360,
    maxPowerW: 88,
    typPowerW: 30,
    weightKg: 5.8
  },
  'Absen Acclaim A2712': {
    widthMm: 610,
    heightMm: 343,
    resX: 480,
    resY: 270,
    maxPowerW: 115,
    typPowerW: 38,
    weightKg: 5
  },
  'Unilumin UpanelS 1.2': {
    widthMm: 600,
    heightMm: 337.5,
    resX: 480,
    resY: 270,
    maxPowerW: 130,
    typPowerW: 40,
    weightKg: 6
  }
};

export const LedWallDesigner: React.FC = () => {
  const { t } = useTranslation();
  const [presetName, setPresetName] = useState<string>('Samsung IWA012');
  const [cols, setCols] = useState<number>(18);
  const [rows, setRows] = useState<number>(12);
  const updateDocument = useDocumentStore(state => state.updateDocument);
  const document = useDocumentStore(state => state.document);
  const [cabinet, setCabinet] = useState<LedCabinet>(PRESETS['Samsung IWA012'] as LedCabinet);

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setPresetName(val);
    const p = PRESETS[val];
    if (p) {
      setCabinet(p);
    }
  };

  const wall: LedWall = {
    columns: cols,
    rows: rows,
    cabinet
  };

  const stats = useMemo(() => calculateLedInfrastructure(wall), [wall]);

  const totalWidthM = (cols * cabinet.widthMm) / 1000;
  const totalHeightM = (rows * cabinet.heightMm) / 1000;

    const handleAddToDesign = () => {
    if (!document) return;
    const doc = JSON.parse(JSON.stringify(document));
    const dtId = 'led-wall-' + presetName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    if (!doc.deviceTypes.find((d: any) => d.id === dtId)) {
      doc.deviceTypes.push({
        id: dtId,
        name: presetName + ' LED Wall (' + cols + 'x' + rows + ')',
        manufacturer: 'Generic',
        model: presetName,
        slug: dtId,
        uHeight: 0,
        isFullDepth: false,
        ports: [
          { name: 'power', direction: 'in', connector: 'PowerCON', signalType: 'POWER' },
          { name: 'data', direction: 'in', connector: 'RJ45', signalType: 'NETWORK' }
        ],
        customFields: {
          ledConfig: { preset: presetName, cols, rows }
        }
      });
    }
    
    doc.devices.push({
      id: 'led-' + Math.random().toString(36).substring(2,8),
      deviceTypeId: dtId,
      siteId: doc.devices[0]?.siteId || 'default-site',
      name: 'LED Wall ' + cols + 'x' + rows,
      status: 'planned'
    });
    updateDocument(doc);
    alert('Added to design! Check BOM.');
  };

  return (    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1>{t('nav.ledwall')} <button onClick={handleAddToDesign} style={{ marginLeft: 16, padding: '8px 16px', background: 'var(--md-sys-color-primary)', color: 'var(--md-sys-color-on-primary)', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: '1rem' }}>Add to Design</button></h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        <div style={{ padding: '1rem', border: '1px solid var(--md-sys-color-outline)', borderRadius: '8px' }}>
          <h3>Configuration</h3>
          <label style={{ display: 'block', marginBottom: '1rem' }}>
            Model / Preset:
            <select value={presetName} onChange={handlePresetChange} style={{ display: 'block', width: '100%', marginTop: '4px' }}>
              {Object.keys(PRESETS).map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </label>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <label>
              Columns:
              <input type="number" min="1" value={cols} onChange={e => setCols(parseInt(e.target.value) || 1)} style={{ width: '100%' }} />
            </label>
            <label>
              Rows:
              <input type="number" min="1" value={rows} onChange={e => setRows(parseInt(e.target.value) || 1)} style={{ width: '100%' }} />
            </label>
          </div>
          <hr style={{ margin: '1rem 0' }} />
          <h4>Cabinet Specs</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.9rem' }}>
            <label>Width (mm): <input type="number" value={cabinet.widthMm} onChange={e => setCabinet({...cabinet, widthMm: Number(e.target.value)})} style={{width:'100%'}} /></label>
            <label>Height (mm): <input type="number" value={cabinet.heightMm} onChange={e => setCabinet({...cabinet, heightMm: Number(e.target.value)})} style={{width:'100%'}} /></label>
            <label>Res X: <input type="number" value={cabinet.resX} onChange={e => setCabinet({...cabinet, resX: Number(e.target.value)})} style={{width:'100%'}} /></label>
            <label>Res Y: <input type="number" value={cabinet.resY} onChange={e => setCabinet({...cabinet, resY: Number(e.target.value)})} style={{width:'100%'}} /></label>
            <label>Max Power (W): <input type="number" value={cabinet.maxPowerW} onChange={e => setCabinet({...cabinet, maxPowerW: Number(e.target.value)})} style={{width:'100%'}} /></label>
            <label>Typ Power (W): <input type="number" value={cabinet.typPowerW} onChange={e => setCabinet({...cabinet, typPowerW: Number(e.target.value)})} style={{width:'100%'}} /></label>
            <label>Weight (kg): <input type="number" value={cabinet.weightKg} onChange={e => setCabinet({...cabinet, weightKg: Number(e.target.value)})} style={{width:'100%'}} /></label>
          </div>
        </div>
        
        <div style={{ padding: '1rem', backgroundColor: 'var(--md-sys-color-surface-variant)', borderRadius: '8px' }}>
          <h3>Specification Output</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <tbody>
              <tr><td style={{ padding: '4px 0', borderBottom: '1px solid #ccc' }}><strong>Dimensions</strong></td><td style={{ textAlign: 'right', borderBottom: '1px solid #ccc' }}>{totalWidthM.toFixed(2)} m  {totalHeightM.toFixed(2)} m</td></tr>
              <tr><td style={{ padding: '4px 0', borderBottom: '1px solid #ccc' }}><strong>Total Cabinets</strong></td><td style={{ textAlign: 'right', borderBottom: '1px solid #ccc' }}>{cols * rows}</td></tr>
              <tr><td style={{ padding: '4px 0', borderBottom: '1px solid #ccc' }}><strong>Total Weight</strong></td><td style={{ textAlign: 'right', borderBottom: '1px solid #ccc' }}>{stats.totalWeightKg.toFixed(1)} kg</td></tr>
              <tr><td style={{ padding: '4px 0', borderBottom: '1px solid #ccc' }}><strong>Resolution</strong></td><td style={{ textAlign: 'right', borderBottom: '1px solid #ccc' }}>{cols * cabinet.resX}  {rows * cabinet.resY} ({stats.totalPixels.toLocaleString()} px)</td></tr>
              <tr><td style={{ padding: '4px 0', borderBottom: '1px solid #ccc' }}><strong>Normal Power Load</strong></td><td style={{ textAlign: 'right', borderBottom: '1px solid #ccc' }}>{stats.totalTypPowerW.toLocaleString()} W</td></tr>
              <tr><td style={{ padding: '4px 0', borderBottom: '1px solid #ccc' }}><strong>Max Power Load</strong></td><td style={{ textAlign: 'right', borderBottom: '1px solid #ccc' }}>{stats.totalMaxPowerW.toLocaleString()} W</td></tr>
              <tr><td style={{ padding: '4px 0', borderBottom: '1px solid #ccc' }}><strong>Thermal (Typ / Max)</strong></td><td style={{ textAlign: 'right', borderBottom: '1px solid #ccc' }}>{stats.thermalTypBtu.toLocaleString(undefined, {maximumFractionDigits:0})} / {stats.thermalMaxBtu.toLocaleString(undefined, {maximumFractionDigits:0})} BTU/h</td></tr>
              <tr><td style={{ padding: '4px 0', borderBottom: '1px solid #ccc' }}><strong>Req. 16A/230V Circuits</strong></td><td style={{ textAlign: 'right', borderBottom: '1px solid #ccc', fontWeight: 'bold', color: 'var(--md-sys-color-primary)' }}>{stats.requiredCircuits16A230V}</td></tr>
              <tr><td style={{ padding: '4px 0', borderBottom: '1px solid #ccc' }}><strong>NovaStar 1G Ports</strong></td><td style={{ textAlign: 'right', borderBottom: '1px solid #ccc', fontWeight: 'bold', color: 'var(--md-sys-color-primary)' }}>{stats.requiredNovaStarPorts}</td></tr>
            </tbody>
          </table>
          <p style={{ marginTop: '1rem', fontSize: '0.8rem', opacity: 0.8 }}>
            Note: Circuits calculated at 16A 230V with 80% safety margin (2944W usable per circuit). NovaStar ports calculated at ~650k pixels per Gigabit Ethernet link.
          </p>
        </div>
      </div>
    </div>
  );
};
