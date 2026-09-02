
import { useBOM, useReferenceDesignators } from '../../store/selectors/derived';

export function BomView() {
  const bom = useBOM();
  const refs = useReferenceDesignators();

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Bill of Materials</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>
            <th>Manufacturer</th>
            <th>Model</th>
            <th>Qty</th>
          </tr>
        </thead>
        <tbody>
          {bom.map((item, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
              <td>{item.manufacturer}</td>
              <td>{item.name}</td>
              <td>{item.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <h2 style={{ marginTop: '2rem' }}>Reference Designators</h2>
      <ul>
        {Object.entries(refs).map(([id, des]) => (
          <li key={id}>{id}: {des as string}</li>
        ))}
      </ul>
    </div>
  );
}
