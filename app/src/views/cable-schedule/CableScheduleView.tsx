import { useTranslation } from 'react-i18next';
import React from 'react';
import type { DesignDocument } from '../../model/schema';
import { exportCablesToCsv } from '../../export/csv';
import { useCableScheduleRows } from '../../store/selectors/derived';

interface CableScheduleViewProps {
  document: DesignDocument;
}

export const CableScheduleView: React.FC<CableScheduleViewProps> = ({ document }) => {
  const { t } = useTranslation();
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
    <div className="cable-schedule-view m3-content-padding" style={{ overflowY: 'auto', height: '100%', padding: '2rem' }}>
      <div className="header-actions" style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, color: 'var(--copper-on-surface)' }}>{t('nav.schedule')}</h2>
        <button className="m3-button m3-button-filled" onClick={handleExport}>{t('common.exportToCSV')}</button>
      </div>
      <div style={{ border: '1px solid var(--copper-outline-variant)', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'var(--copper-surface-container)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: 'var(--copper-on-surface)', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--copper-surface-container-high)', borderBottom: '2px solid var(--copper-outline-variant)' }}>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>{t('common.cableID')}</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>{t('common.source')}</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>{t('common.port')}</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>{t('common.target')}</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>{t('common.port')}</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>{t('common.type')}</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>{t('common.lengthM')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr 
                key={row.edgeId} 
                style={{ borderBottom: '1px solid var(--copper-outline-variant)', transition: 'background-color 0.15s ease' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--copper-surface-container-highest)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <td style={{ padding: '12px 16px', fontWeight: 500 }}>{row.cableId}</td>
                <td style={{ padding: '12px 16px' }}>{row.sourceDev}</td>
                <td style={{ padding: '12px 16px', color: 'var(--copper-text-secondary)' }}>{row.sourcePort}</td>
                <td style={{ padding: '12px 16px' }}>{row.targetDev}</td>
                <td style={{ padding: '12px 16px', color: 'var(--copper-text-secondary)' }}>{row.targetPort}</td>
                <td style={{ padding: '12px 16px' }}>{row.type}</td>
                <td style={{ padding: '12px 16px' }}>{row.lengthM}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
