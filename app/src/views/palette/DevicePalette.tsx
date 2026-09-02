import { useState, useMemo } from 'react';
import { useDocumentStore } from '../../store/documentStore';

export function DevicePalette() {
  const [searchTerm, setSearchTerm] = useState('');
  const document = useDocumentStore((state) => state.document);
  const updateDocument = useDocumentStore((state) => state.updateDocument);

  const deviceTypes = document?.deviceTypes || [];

  const filteredTypes = useMemo(() => {
    if (!searchTerm.trim()) return deviceTypes;
    
    const search = searchTerm.toLowerCase();
    const terms = search.split(/\s+/).filter(Boolean);

    return deviceTypes.filter((dt) => {
      const searchSpace = [
        dt.manufacturer,
        dt.model,
        dt.id,
        dt.description,
        dt.customFields?.acoustics?.category,
        dt.customFields?.acoustics?.type,
        dt.customFields?.acoustics?.impedance ? String(dt.customFields.acoustics.impedance) + 'Ohm ' + String(dt.customFields.acoustics.impedance) + 'O' : '',
        dt.customFields?.acoustics?.wattage_rms ? String(dt.customFields.acoustics.wattage_rms) + 'W' : ''
      ].filter(Boolean).join(' ').toLowerCase();
      
      return terms.every(term => searchSpace.includes(term));
    });
  }, [deviceTypes, searchTerm]);

  const handleAddDevice = (deviceTypeId: string) => {
    updateDocument((draft) => {
      const siteId = draft.sites?.[0]?.id || 'default-site';
      const dt = (draft.deviceTypes || []).find(d => d.id === deviceTypeId);
      
      const baseName = dt ? (dt.model || deviceTypeId) : deviceTypeId;
      const newId = 'dev-' + Math.random().toString(36).substring(2, 9);
      
      draft.devices.push({
        id: newId,
        deviceTypeId,
        siteId,
        status: 'planned',
        name: baseName + ' (New)'
      });
    });
  };

  if (!document) {
    return <div data-testid="device-palette-empty">No document loaded</div>;
  }

  return (
    <div style={{ width: 280, borderRight: '1px solid var(--md-sys-color-outline-variant)', background: 'var(--md-sys-color-surface)', display: 'flex', flexDirection: 'column', zIndex: 10 }}>
      <div style={{ padding: 16, borderBottom: '1px solid var(--md-sys-color-outline-variant)' }}>
        <h3 className="m3-title-medium" style={{ margin: '0 0 16px 0' }}>Device Palette</h3>
        <input 
          type="text"
          className="m3-text-field"
          style={{ width: '100%', padding: '8px 12px', borderRadius: 4, border: '1px solid var(--md-sys-color-outline)' }}
          placeholder="Search (e.g. '8O 200W ceiling')"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
        <p className="m3-label-small" style={{ margin: '0 8px 8px 8px', color: 'var(--md-sys-color-on-surface-variant)' }}>
          {filteredTypes.length} types found
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {filteredTypes.map(dt => (
            <div 
              key={dt.id}
              role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') handleAddDevice(dt.id); }} onClick={() => handleAddDevice(dt.id)}
              style={{
                padding: 12,
                borderRadius: 8,
                background: 'var(--md-sys-color-surface-container-low)',
                cursor: 'pointer',
                border: '1px solid transparent'
              }}
              onMouseEnter={e => e.currentTarget.style.border = '1px solid var(--md-sys-color-primary)'}
              onMouseLeave={e => e.currentTarget.style.border = '1px solid transparent'}
            >
              <div className="m3-label-medium" style={{ fontWeight: 600 }}>{dt.manufacturer} {dt.model}</div>
              <div className="m3-body-small" style={{ color: 'var(--md-sys-color-on-surface-variant)', marginTop: 4 }}>
                {dt.customFields?.acoustics?.type ? String(dt.customFields.acoustics.type) + ' ' : ''}
                {dt.customFields?.acoustics?.category ? String(dt.customFields.acoustics.category) + ' ' : ''}
                {dt.customFields?.acoustics?.wattage_rms ? String(dt.customFields.acoustics.wattage_rms) + 'W ' : ''}
                {dt.customFields?.acoustics?.impedance ? String(dt.customFields.acoustics.impedance) + 'Ω ' : ''}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


