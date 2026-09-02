import { useBOM } from '../../store/selectors/derived';

export function BOMView() {
  const bom = useBOM();

  return (
    <div style={{ padding: '2rem', height: '100%', overflowY: 'auto' }} className="m3-content-padding">
      <h2 style={{ color: 'var(--copper-on-surface)', marginBottom: '1rem' }}>Bill of Materials</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--copper-on-surface)' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--copper-outline)', paddingBottom: '0.5rem' }}>
            <th style={{ padding: '0.5rem' }}>Manufacturer</th>
            <th style={{ padding: '0.5rem' }}>Model</th>
            <th style={{ padding: '0.5rem' }}>Qty</th>
            <th style={{ padding: '0.5rem' }}>Reference Designators</th>
          </tr>
        </thead>
        <tbody>
          {bom.map((item, i) => (
            <tr key={i} style={{ borderBottom: '1px solid var(--copper-outline-variant)' }}>
              <td style={{ padding: '0.5rem' }}>{item.manufacturer}</td>
              <td style={{ padding: '0.5rem' }}>{item.name}</td>
              <td style={{ padding: '0.5rem' }}>{item.quantity}</td>
              <td style={{ padding: '0.5rem' }}>{item.designators?.join(', ')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
