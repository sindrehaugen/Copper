import React, { useState } from 'react';

export const DsarSurface: React.FC = () => {
  const [exportStatus, setExportStatus] = useState<string>('');
  const [deleteStatus, setDeleteStatus] = useState<string>('');

  const requestExport = async () => {
    setExportStatus('Request Pending');
    try {
      await fetch('/api/me/dsar/export', { method: 'POST' });
      setExportStatus('Data Ready to Download');
    } catch {
      setExportStatus('Export Failed');
    }
  };

  const requestDeletion = async () => {
    setDeleteStatus('Request Pending');
    try {
      await fetch('/api/me/dsar/delete', { method: 'POST' });
      setDeleteStatus('Deletion Request Received');
    } catch {
      setDeleteStatus('Deletion Failed');
    }
  };

  return (
    <div className="dsar-surface">
      <h2>Data Subject Access Request (DSAR)</h2>
      
      <div className="dsar-section">
        <h3>Request Your Data</h3>
        <button onClick={requestExport} data-testid="export-btn">Request Data Export</button>
        {exportStatus && <p data-testid="export-status">{exportStatus}</p>}
      </div>

      <div className="dsar-section">
        <h3>Request Account Deletion</h3>
        <button onClick={requestDeletion} data-testid="delete-btn">Request Deletion</button>
        {deleteStatus && <p data-testid="delete-status">{deleteStatus}</p>}
      </div>
    </div>
  );
};
