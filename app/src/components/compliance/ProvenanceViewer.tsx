import React from 'react';

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
    return <div className={`text-sm text-gray-500 ${className}`}>No provenance records available.</div>;
  }

  return (
    <div className={`flex flex-col space-y-4 ${className}`}>
      {records.map((record) => (
        <div key={record.id} className="p-4 bg-white border border-gray-200 rounded-md shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium text-gray-900">{record.actor}</span>
            <span className="text-xs text-gray-500">{new Date(record.timestamp).toLocaleString()}</span>
          </div>
          <p className="text-sm text-gray-700 mb-2">
            <strong>Action:</strong> {record.action}
          </p>
          {(record.originalValue || record.newValue) && (
            <div className="grid grid-cols-2 gap-2 text-sm mb-2 p-2 bg-gray-50 rounded">
              {record.originalValue && (
                <div>
                  <span className="block text-xs text-gray-500 uppercase">Original</span>
                  <span className="text-red-600 line-through">{record.originalValue}</span>
                </div>
              )}
              {record.newValue && (
                <div>
                  <span className="block text-xs text-gray-500 uppercase">New</span>
                  <span className="text-green-600">{record.newValue}</span>
                </div>
              )}
            </div>
          )}
          {record.citation && (
            <p className="text-xs text-gray-600 border-t border-gray-100 pt-2 mt-2">
              <strong>Citation:</strong> {record.citation}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};