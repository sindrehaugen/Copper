import React, { useState } from 'react';
import { AiConfirmDialog } from './AiConfirmDialog';
import { ProvenanceViewer } from './ProvenanceViewer';

export const DsarSurface: React.FC = () => {
  const [exportStatus, setExportStatus] = useState<string>('');
  const [deleteStatus, setDeleteStatus] = useState<string>('');
  const [showConfirm, setShowConfirm] = useState(false);

  // Mock provenance records
  const provenanceRecords = [
    {
      id: '1',
      timestamp: new Date().toISOString(),
      actor: 'System Admin',
      action: 'Data Privacy Check',
      originalValue: 'Unverified',
      newValue: 'Verified',
      citation: 'GDPR Article 15'
    }
  ];

  const requestExport = async () => {
    setExportStatus('Request Pending');
    try {
      await fetch('/api/me/dsar/export');
      setExportStatus('Data Ready to Download');
    } catch {
      setExportStatus('Export Failed');
    }
  };

  const handleDeletionAttempt = () => {
    setShowConfirm(true);
  };

  const executeDeletion = async () => {
    setShowConfirm(false);
    setDeleteStatus('Request Pending');
    try {
      await fetch('/api/me/dsar/erase', { method: 'POST' });
      setDeleteStatus('Deletion Request Received');
    } catch {
      setDeleteStatus('Deletion Failed');
    }
  };

  return (
    <div className="dsar-surface">
      <h2>Data Subject Access Request (DSAR) & Compliance</h2>
      
      <div className="dsar-section">
        <h3>Request Your Data</h3>
        <button onClick={requestExport} data-testid="export-btn" className="m3-btn m3-btn-outlined">Request Data Export</button>
        {exportStatus && <p data-testid="export-status">{exportStatus}</p>}
      </div>

      <div className="dsar-section" style={{ marginTop: '24px' }}>
        <h3>Request Account Deletion</h3>
        <button onClick={handleDeletionAttempt} data-testid="delete-btn" className="m3-btn m3-btn-filled" style={{ backgroundColor: 'var(--md-sys-color-error)' }}>Request Deletion</button>
        {deleteStatus && <p data-testid="delete-status">{deleteStatus}</p>}
      </div>

      <div className="dsar-section" style={{ marginTop: '32px' }}>
        <h3>System Provenance</h3>
        <ProvenanceViewer records={provenanceRecords} />
      </div>

      {showConfirm && (
        <AiConfirmDialog
          title="Confirm Account Deletion"
          proposedAction="Erase all PII and design documents associated with this tenant."
          confidenceString="High"
          provenance="GDPR Article 17 Right to Erasure."
          onConfirm={executeDeletion}
          onReject={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
};
