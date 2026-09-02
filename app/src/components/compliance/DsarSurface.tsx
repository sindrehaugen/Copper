import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AiConfirmDialog } from './AiConfirmDialog';
import { ProvenanceViewer, ProvenanceRecord } from './ProvenanceViewer';

export const DsarSurface: React.FC = () => {
  const { t } = useTranslation();
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
    setExportStatus(t('compliance.exportPending'));
    try {
      const res = await fetch('/api/me/dsar/export');
      if (!res.ok) {
        if (res.status === 404) {
          setExportStatus(t('compliance.unavailable'));
        } else {
          setExportStatus(t('compliance.exportFailed'));
        }
        return;
      }
      setExportStatus(t('compliance.exportSuccess'));
    } catch {
      setExportStatus(t('compliance.exportFailed'));
    }
  };

  const handleDeletionAttempt = () => {
    setShowConfirm(true);
  };

  const executeDeletion = async (override: boolean) => {
    setShowConfirm(false);
    setDeleteStatus(t('compliance.deletePending'));
    try {
      const res = await fetch('/api/me/dsar/erase', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ override })
      });
      if (!res.ok) {
        if (res.status === 404) {
          setDeleteStatus(t('compliance.unavailable'));
        } else {
          setDeleteStatus(t('compliance.deleteFailed'));
        }
        return;
      }
      setDeleteStatus(t('compliance.deleteSuccess'));
    } catch {
      setDeleteStatus(t('compliance.deleteFailed'));
    }
  };

  return (
    <div className="dsar-surface">
      <h2>{t('compliance.title')}</h2>
      
      <div className="dsar-section">
        <h3>{t('compliance.exportTitle')}</h3>
        <button onClick={requestExport} data-testid="export-btn" className="m3-btn m3-btn-outlined">{t('compliance.exportButton')}</button>
        {exportStatus && <p data-testid="export-status">{exportStatus}</p>}
      </div>

      <div className="dsar-section" style={{ marginTop: '24px' }}>
        <h3>{t('compliance.deleteTitle')}</h3>
        <button onClick={handleDeletionAttempt} data-testid="delete-btn" className="m3-btn m3-btn-filled" style={{ backgroundColor: 'var(--md-sys-color-error)' }}>{t('compliance.deleteButton')}</button>
        {deleteStatus && <p data-testid="delete-status">{deleteStatus}</p>}
      </div>

      <div className="dsar-section" style={{ marginTop: '32px' }}>
        <h3>{t('compliance.provenanceTitle')}</h3>
        <ProvenanceViewer records={provenanceRecords} />
      </div>

      {showConfirm && (
        <AiConfirmDialog
          title={t('compliance.confirmTitle')}
          proposedAction={t('compliance.confirmAction')}
          confidenceString={t('compliance.confirmConfidence')}
          provenance={t('compliance.confirmProvenance')}
          onConfirm={executeDeletion}
          onReject={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
};
