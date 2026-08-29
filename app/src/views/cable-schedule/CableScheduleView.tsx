import React from 'react';
import type { DesignDocument } from '../../model/schema';
import { exportCablesToCsv } from '../../export/csv';

interface CableScheduleViewProps {
  document: DesignDocument;
}

export const CableScheduleView: React.FC<CableScheduleViewProps> = ({ document }) => {
  const deviceMap = new Map(document.devices.map((d) => [d.id, d.name ?? d.id]));

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
    <div className="cable-schedule-view">
      <div className="header-actions">
        <button onClick={handleExport}>Export to CSV</button>
      </div>
      <table>
        <thead>
          <tr>
            <th>Source Device</th>
            <th>Source Port</th>
            <th>Target Device</th>
            <th>Target Port</th>
            <th>Signal Type</th>
          </tr>
        </thead>
        <tbody>
          {document.cables.map((cable) => {
            const srcTerm = cable.terminations[0];
            const tgtTerm = cable.terminations[1];

            const srcDevice = deviceMap.get(srcTerm.deviceId) ?? srcTerm.deviceId;
            const tgtDevice = deviceMap.get(tgtTerm.deviceId) ?? tgtTerm.deviceId;

            return (
              <tr key={cable.id}>
                <td>{srcDevice}</td>
                <td>{srcTerm.portRef.name}</td>
                <td>{tgtDevice}</td>
                <td>{tgtTerm.portRef.name}</td>
                <td>{cable.type ?? ''}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};