const fs = require('fs');
const code = `import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AiConfirmDialog } from './AiConfirmDialog';
import { ProvenanceViewer } from './ProvenanceViewer';

export const DsarSurface: React.FC = () => {
  const { t } = useTranslation('compliance');
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
    setExportStatus(t('exportPending'));
    try {
      const res = await fetch('/api/me/dsar/export');
      if (!res.ok) {
        if (res.status === 404) {
          setExportStatus(t('unavailable'));
        } else {
          setExportStatus(t('exportFailed'));
        }
        return;
      }
      setExportStatus(t('exportSuccess'));
    } catch {
      setExportStatus(t('exportFailed'));
    }
  };

  const handleDeletionAttempt = () => {
    setShowConfirm(true);
  };

  const executeDeletion = async (override: boolean) => {
    setShowConfirm(false);
    setDeleteStatus(t('deletePending'));
    try {
      const res = await fetch('/api/me/dsar/erase', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ override })
      });
      if (!res.ok) {
        if (res.status === 404) {
          setDeleteStatus(t('unavailable'));
        } else {
          setDeleteStatus(t('deleteFailed'));
        }
        return;
      }
      setDeleteStatus(t('deleteSuccess'));
    } catch {
      setDeleteStatus(t('deleteFailed'));
    }
  };

  return (
    <div className="dsar-surface">
      <h2>{t('title')}</h2>
      
      <div className="dsar-section">
        <h3>{t('exportTitle')}</h3>
        <button onClick={requestExport} data-testid="export-btn" className="m3-btn m3-btn-outlined">{t('exportButton')}</button>
        {exportStatus && <p data-testid="export-status">{exportStatus}</p>}
      </div>

      <div className="dsar-section" style={{ marginTop: '24px' }}>
        <h3>{t('deleteTitle')}</h3>
        <button onClick={handleDeletionAttempt} data-testid="delete-btn" className="m3-btn m3-btn-filled" style={{ backgroundColor: 'var(--md-sys-color-error)' }}>{t('deleteButton')}</button>
        {deleteStatus && <p data-testid="delete-status">{deleteStatus}</p>}
      </div>

      <div className="dsar-section" style={{ marginTop: '32px' }}>
        <h3>{t('provenanceTitle')}</h3>
        <ProvenanceViewer records={provenanceRecords} />
      </div>

      {showConfirm && (
        <AiConfirmDialog
          title={t('confirmTitle')}
          proposedAction={t('confirmAction')}
          confidenceString={t('confirmConfidence')}
          provenance={t('confirmProvenance')}
          onConfirm={executeDeletion}
          onReject={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
};
`;
fs.writeFileSync('app/src/components/compliance/DsarSurface.tsx', code);
console.log('Rewrote DsarSurface.tsx');
