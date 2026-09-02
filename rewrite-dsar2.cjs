const fs = require('fs');
const code = `import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AiConfirmDialog } from './AiConfirmDialog';
import { ProvenanceViewer, ProvenanceRecord } from './ProvenanceViewer';

export const DsarSurface: React.FC = () => {
  const { t } = useTranslation('compliance');
  const [exportStatus, setExportStatus] = useState<string>('');
  const [deleteStatus, setDeleteStatus] = useState<string>('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [provenanceRecords, setProvenanceRecords] = useState<ProvenanceRecord[]>([]);

  useEffect(() => {
    fetch('/api/me/dsar/provenance')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then(data => {
        if (data && data.records) setProvenanceRecords(data.records);
      })
      .catch(err => {
        console.error(err);
      });
  }, []);

  const requestExport = async () => {
    setExportStatus(t('exportPending', 'Request Pending'));
    try {
      const res = await fetch('/api/me/dsar/export');
      if (!res.ok) {
        if (res.status === 404) {
          setExportStatus(t('unavailable', 'Temporarily Unavailable (HS-13)'));
        } else {
          setExportStatus(t('exportFailed', 'Export Failed'));
        }
        return;
      }
      setExportStatus(t('exportSuccess', 'Data Ready to Download'));
    } catch {
      setExportStatus(t('exportFailed', 'Export Failed'));
    }
  };

  const handleDeletionAttempt = () => {
    setShowConfirm(true);
  };

  const executeDeletion = async (override: boolean) => {
    setShowConfirm(false);
    setDeleteStatus(t('deletePending', 'Request Pending'));
    try {
      const res = await fetch('/api/me/dsar/erase', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ override })
      });
      if (!res.ok) {
        if (res.status === 404) {
          setDeleteStatus(t('unavailable', 'Temporarily Unavailable (HS-13)'));
        } else {
          setDeleteStatus(t('deleteFailed', 'Deletion Failed'));
        }
        return;
      }
      setDeleteStatus(t('deleteSuccess', 'Deletion Request Received'));
    } catch {
      setDeleteStatus(t('deleteFailed', 'Deletion Failed'));
    }
  };

  return (
    <div className="dsar-surface">
      <h2>{t('title', 'Data Subject Access Request (DSAR) & Compliance')}</h2>
      
      <div className="dsar-section">
        <h3>{t('exportTitle', 'Request Your Data')}</h3>
        <button onClick={requestExport} data-testid="export-btn" className="m3-btn m3-btn-outlined">{t('exportButton', 'Request Data Export')}</button>
        {exportStatus && <p data-testid="export-status">{exportStatus}</p>}
      </div>

      <div className="dsar-section" style={{ marginTop: '24px' }}>
        <h3>{t('deleteTitle', 'Request Account Deletion')}</h3>
        <button onClick={handleDeletionAttempt} data-testid="delete-btn" className="m3-btn m3-btn-filled" style={{ backgroundColor: 'var(--md-sys-color-error)' }}>{t('deleteButton', 'Request Deletion')}</button>
        {deleteStatus && <p data-testid="delete-status">{deleteStatus}</p>}
      </div>

      <div className="dsar-section" style={{ marginTop: '32px' }}>
        <h3>{t('provenanceTitle', 'System Provenance')}</h3>
        <ProvenanceViewer records={provenanceRecords} />
      </div>

      {showConfirm && (
        <AiConfirmDialog
          title={t('confirmTitle', 'Confirm Account Deletion')}
          proposedAction={t('confirmAction', 'Erase all PII and design documents associated with this tenant.')}
          confidenceString={t('confirmConfidence', 'High')}
          provenance={t('confirmProvenance', 'GDPR Article 17 Right to Erasure.')}
          onConfirm={executeDeletion}
          onReject={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
};
`;
fs.writeFileSync('app/src/components/compliance/DsarSurface.tsx', code);
console.log('Rewrote DsarSurface2.tsx');
