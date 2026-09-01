import React from 'react';
import type { DesignDocument } from '../../model/schema';
import { exportCablesToCsv } from '../../export/csv';
import { useCableScheduleRows } from '../../store/selectors/derived';

interface CableScheduleViewProps {
  document: DesignDocument;
}

export const CableScheduleView: React.FC<CableScheduleViewProps> = ({ document }) => {
  const rows = useCableScheduleRows();

  const handleExport = () => {
    const csvContent = exportCablesToCsv(document);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'cable-schedule.csv');
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
  };

  return (
    <div className="cable-schedule-view m3-content-padding" style={{ overflowY: 'auto', height: '100%' }}>
      <div className="header-actions" style={{ marginBottom: 16 }}>
        <button className="m3-button" onClick={handleExport}>Export to CSV</button>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', background: 'var(--copper-surface)' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--copper-outline)' }}>
            <th style={{ padding: 8 }}>Cable ID</th>
            <th style={{ padding: 8 }}>Source</th>
            <th style={{ padding: 8 }}>Port</th>
            <th style={{ padding: 8 }}>Target</th>
            <th style={{ padding: 8 }}>Port</th>
            <th style={{ padding: 8 }}>Type</th>
            <th style={{ padding: 8 }}>Length (m)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.edgeId} style={{ borderBottom: '1px solid var(--copper-outline)' }}>
              <td style={{ padding: 8 }}>{row.cableId}</td>
              <td style={{ padding: 8 }}>{row.sourceDev}</td>
              <td style={{ padding: 8 }}>{row.sourcePort}</td>
              <td style={{ padding: 8 }}>{row.targetDev}</td>
              <td style={{ padding: 8 }}>{row.targetPort}</td>
              <td style={{ padding: 8 }}>{row.type}</td>
              <td style={{ padding: 8 }}>{row.lengthM}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
