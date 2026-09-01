import { useState, useEffect, useMemo, useRef } from 'react';
import { useDocumentStore } from '../../store/documentStore';
import { generateArrayPreset, ArrayPreset, computePolar, computeHeatmap } from '@copper/acoustics';
import { useTranslation } from 'react-i18next';

export function SubArrayPanel() {
  const { t } = useTranslation();
  const document = useDocumentStore(state => state.document);
  const updateDocument = useDocumentStore(state => state.updateDocument);
  const [isOpen, setIsOpen] = useState(false);

  const [preset, setPreset] = useState<ArrayPreset>('Endfire');
  const [count, setCount] = useState<number>(4);
  const [freq, setFreq] = useState<number>(60);
  const [spacing, setSpacing] = useState<number | ''>(''); // empty means auto
  const [selectedSubId, setSelectedSubId] = useState<string>('');

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Filter device types to likely subwoofers (or any speaker)
  const availableSubs = useMemo(() => {
    if (!document) return [];
    return document.deviceTypes.filter(dt => {
      // Basic heuristic: it's a speaker
      const acoustics = dt.customFields?.acoustics as { device_class?: string } | undefined;
      return acoustics?.device_class === 'speaker';
    });
  }, [document]);

  useEffect(() => {
    if (availableSubs.length > 0 && !selectedSubId) {
      setSelectedSubId(availableSubs[0]?.id || '');
    }
  }, [availableSubs, selectedSubId]);

  const sources = useMemo(() => {
    const s = spacing === '' ? undefined : spacing;
    return generateArrayPreset(preset, count, freq, s);
  }, [preset, count, freq, spacing]);

  const polarData = useMemo(() => {
    // 1000m radius for far-field plane wave approximation
    return computePolar(sources, freq, 10000, 2);
  }, [sources, freq]);

  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext('2d');
    if (!ctx) return;

    const size = 150;
    cvs.width = size;
    cvs.height = size;
    const pxRes = 50;
    const heatmap = computeHeatmap(sources, freq, 15, pxRes); // 15m radius window

    const imgData = ctx.createImageData(pxRes, pxRes);
    for (let i = 0; i < heatmap.length; i++) {
      const val = heatmap[i] || 0;
      // Turbo/Viridis approximation (simple hot colormap)
      const r = Math.floor(255 * val);
      const g = Math.floor(255 * Math.pow(val, 2));
      const b = Math.floor(255 * Math.pow(val, 4));
      
      const idx = i * 4;
      imgData.data[idx] = r;
      imgData.data[idx + 1] = g;
      imgData.data[idx + 2] = b;
      imgData.data[idx + 3] = 255;
    }
    
    // Draw scaled
    const tempCanvas = window.document.createElement('canvas');
    tempCanvas.width = pxRes;
    tempCanvas.height = pxRes;
    tempCanvas.getContext('2d')!.putImageData(imgData, 0, 0);
    
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(tempCanvas, 0, 0, size, size);

  }, [sources, freq]);

  const handlePlace = () => {
    if (!document || !selectedSubId) return;

    const dt = document.deviceTypes.find(d => d.id === selectedSubId);
    if (!dt) return;

    updateDocument(draft => {
      for (let i = 0; i < sources.length; i++) {
        const newId = `${dt.slug}-${Math.floor(Math.random()*10000)}`;
        draft.devices.push({
          id: newId,
          deviceTypeId: dt.id,
          siteId: document.sites[0]?.id || 'site-1',
          name: `${dt.model} (${preset})`,
          status: 'planned'
        });
      }
    });
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button 
        style={{ position: 'absolute', bottom: 16, left: 16, zIndex: 10 }}
        className="m3-button"
        onClick={() => setIsOpen(true)}
      >
        {t('subarray.open', '⚡ Sub Array Designer')}
      </button>
    );
  }

  return (
    <div style={{
      position: 'absolute', bottom: 16, left: 16, zIndex: 20, 
      background: 'var(--copper-surface)', border: '1px solid var(--copper-outline)',
      padding: '16px', borderRadius: '8px', width: '400px',
      boxShadow: 'var(--md-sys-elevation-level-3)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <h3 style={{ margin: 0 }}>Sub Array Designer</h3>
        <button className="m3-button m3-button-text" onClick={() => setIsOpen(false)}>×</button>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', fontSize: '12px', marginBottom: 4 }}>Subwoofer Model</label>
        <select 
          className="m3-input" 
          value={selectedSubId} 
          onChange={e => setSelectedSubId(e.target.value)}
          style={{ width: '100%' }}
        >
          {availableSubs.map(dt => (
            <option key={dt.id} value={dt.id}>{dt.manufacturer} {dt.model}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '12px', marginBottom: 4 }}>Preset</label>
          <select 
            className="m3-input" 
            value={preset} 
            onChange={e => setPreset(e.target.value as ArrayPreset)}
            style={{ width: '100%' }}
          >
            <option value="Endfire">Endfire</option>
            <option value="Broadside">Broadside</option>
            <option value="Cardioid">Cardioid</option>
            <option value="Arc">Arc</option>
          </select>
        </div>
        <div style={{ width: '80px' }}>
          <label style={{ display: 'block', fontSize: '12px', marginBottom: 4 }}>Units</label>
          <input 
            type="number" className="m3-input" 
            value={count} onChange={e => setCount(Math.max(2, parseInt(e.target.value) || 2))}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '12px', marginBottom: 4 }}>Frequency (Hz)</label>
          <input 
            type="number" className="m3-input" 
            value={freq} onChange={e => setFreq(parseInt(e.target.value) || 60)}
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '12px', marginBottom: 4 }}>Spacing (m)</label>
          <input 
            type="number" className="m3-input" placeholder="Auto"
            value={spacing} onChange={e => setSpacing(e.target.value === '' ? '' : parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
        <div style={{ flex: 1, position: 'relative', height: '150px', border: '1px solid var(--copper-outline)', borderRadius: 4, overflow: 'hidden' }}>
          <svg width="100%" height="100%" viewBox="-1 -1 2 2" preserveAspectRatio="xMidYMid meet">
            {/* SVG Polar Plot */}
            <circle cx="0" cy="0" r="1" fill="none" stroke="var(--copper-outline)" strokeWidth="0.01" />
            <circle cx="0" cy="0" r="0.75" fill="none" stroke="var(--copper-outline)" strokeWidth="0.01" strokeDasharray="0.05 0.05" />
            <circle cx="0" cy="0" r="0.5" fill="none" stroke="var(--copper-outline)" strokeWidth="0.01" strokeDasharray="0.05 0.05" />
            
            <polygon 
              points={polarData.map(p => {
                // scale dB (-60 to 0) to radius (0 to 1)
                const r = Math.max(0, (p.db + 60) / 60);
                const rad = p.angle * Math.PI / 180;
                return `${Math.cos(rad) * r},${Math.sin(rad) * r}`;
              }).join(' ')}
              fill="var(--md-sys-color-primary-container)"
              stroke="var(--md-sys-color-primary)"
              strokeWidth="0.02"
            />
          </svg>
        </div>
        <div style={{ width: '150px', height: '150px', border: '1px solid var(--copper-outline)', borderRadius: 4, overflow: 'hidden' }}>
          <canvas ref={canvasRef}></canvas>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '10px', color: 'var(--copper-text-secondary)' }}>
          Math by <a href="https://www.merlijnvanveen.nl/" target="_blank" rel="noreferrer" style={{ color: 'inherit' }}>Merlijn van Veen</a>
        </div>
        <button className="m3-button m3-button-primary" onClick={handlePlace} disabled={!selectedSubId}>
          {t('subarray.place', 'Place in Project')}
        </button>
      </div>
    </div>
  );
}
