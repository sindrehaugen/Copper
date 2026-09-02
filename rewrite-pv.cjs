const fs = require('fs');
const code = `import React from 'react';
import { useTranslation } from 'react-i18next';
import './compliance.css';

export interface ProvenanceRecord {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  originalValue?: string;
  newValue?: string;
  citation?: string;
}

export interface ProvenanceViewerProps {
  records: ProvenanceRecord[];
  className?: string;
}

export const ProvenanceViewer: React.FC<ProvenanceViewerProps> = ({ records, className = '' }) => {
  const { t } = useTranslation('compliance');
  if (!records || records.length === 0) {
    return <div className={\`m3-provenance-time \${className}\`}>{t('noRecords')}</div>;
  }

  return (
    <div className={\`m3-provenance-list \${className}\`}>
      {records.map((record) => (
        <div key={record.id} className="m3-provenance-record">
          <div className="m3-provenance-header">
            <span className="m3-provenance-actor">{record.actor}</span>
            <span className="m3-provenance-time">{new Date(record.timestamp).toLocaleString()}</span>
          </div>
          <p className="m3-provenance-action">
            <strong>{t('actionLabel')}</strong> {record.action}
          </p>
          {(record.originalValue || record.newValue) && (
            <div className="m3-provenance-diff">
              {record.originalValue && (
                <div>
                  <span className="m3-provenance-diff-label">{t('originalLabel')}</span>
                  <span className="m3-provenance-diff-old">{record.originalValue}</span>
                </div>
              )}
              {record.newValue && (
                <div>
                  <span className="m3-provenance-diff-label">{t('newLabel')}</span>
                  <span className="m3-provenance-diff-new">{record.newValue}</span>
                </div>
              )}
            </div>
          )}
          {record.citation && (
            <p className="m3-provenance-citation">
              <strong>{t('citationLabel')}</strong> {record.citation}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};
`;
fs.writeFileSync('app/src/components/compliance/ProvenanceViewer.tsx', code);
console.log('Rewrote ProvenanceViewer.tsx');
