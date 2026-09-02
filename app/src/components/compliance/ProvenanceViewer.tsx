import React from 'react';
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
  if (!records || records.length === 0) {
    return <div className={`m3-provenance-time ${className}`}>No provenance records available.</div>;
  }

  return (
    <div className={`m3-provenance-list ${className}`}>
      {records.map((record) => (
        <div key={record.id} className="m3-provenance-record">
          <div className="m3-provenance-header">
            <span className="m3-provenance-actor">{record.actor}</span>
            <span className="m3-provenance-time">{new Date(record.timestamp).toLocaleString()}</span>
          </div>
          <p className="m3-provenance-action">
            <strong>Action:</strong> {record.action}
          </p>
          {(record.originalValue || record.newValue) && (
            <div className="m3-provenance-diff">
              {record.originalValue && (
                <div>
                  <span className="m3-provenance-diff-label">Original</span>
                  <span className="m3-provenance-diff-old">{record.originalValue}</span>
                </div>
              )}
              {record.newValue && (
                <div>
                  <span className="m3-provenance-diff-label">New</span>
                  <span className="m3-provenance-diff-new">{record.newValue}</span>
                </div>
              )}
            </div>
          )}
          {record.citation && (
            <p className="m3-provenance-citation">
              <strong>Citation:</strong> {record.citation}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};
