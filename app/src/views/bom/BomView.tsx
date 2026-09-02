import { useBOM } from '../../store/selectors/derived';

export function BOMView() {
  const bom = useBOM();

  return (
    <div style={{ padding: '2rem', height: '100%', overflowY: 'auto' }} className="m3-content-padding">
      <h2 style={{ color: 'var(--copper-on-surface)', marginBottom: '1.5rem', marginTop: 0 }}>Bill of Materials</h2>
      <div style={{ border: '1px solid var(--copper-outline-variant)', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'var(--copper-surface-container)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--copper-on-surface)', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ textAlign: 'left', backgroundColor: 'var(--copper-surface-container-high)', borderBottom: '2px solid var(--copper-outline-variant)' }}>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Manufacturer</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Model / Description</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Qty</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Reference Designators</th>
            </tr>
          </thead>
          <tbody>
            {bom.map((item, i) => (
              <tr 
                key={i} 
                style={{ borderBottom: '1px solid var(--copper-outline-variant)', transition: 'background-color 0.15s ease' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--copper-surface-container-highest)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <td style={{ padding: '12px 16px' }}>{item.manufacturer}</td>
                <td style={{ padding: '12px 16px', fontWeight: 500 }}>{item.name}</td>
                <td style={{ padding: '12px 16px' }}>{item.quantity}</td>
                <td style={{ padding: '12px 16px', color: 'var(--copper-text-secondary)' }}>{item.designators?.join(', ') || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
