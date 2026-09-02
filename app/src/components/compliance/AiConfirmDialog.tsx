import React, { useState } from 'react';
import './compliance.css';

export interface AiConfirmDialogProps {
  title: string;
  proposedAction: string;
  confidenceString: string;
  provenance: string;
  onConfirm: () => void;
  onReject: () => void;
}

export const AiConfirmDialog: React.FC<AiConfirmDialogProps> = ({
  title,
  proposedAction,
  confidenceString,
  provenance,
  onConfirm,
  onReject,
}) => {
  const [isOverride, setIsOverride] = useState(false);

  const confClass = confidenceString.toLowerCase() === 'high' ? 'm3-confidence-high' :
                    confidenceString.toLowerCase() === 'medium' ? 'm3-confidence-medium' : 'm3-confidence-low';

  return (
    <>
      <div className="m3-dialog-scrim" onClick={onReject} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') onReject(); }} />
      <div className="m3-dialog-scrim" style={{ backgroundColor: 'transparent' }}>
        <div 
          role="dialog" 
          aria-modal="true"
          aria-labelledby="dialog-title"
          className="m3-dialog"
        >
          <div className="m3-dialog-header">
            <h2 id="dialog-title" className="m3-dialog-title">
              {title}
            </h2>
            <span className="m3-badge">
              AI Suggestion
            </span>
          </div>

          <div className="m3-dialog-body">
            <div className="m3-panel">
              <h3 className="m3-panel-title">Proposed Action:</h3>
              <p className="m3-panel-content">{proposedAction}</p>
            </div>

            <div className="m3-confidence">
              <span>Confidence: </span>
              <span className={confClass}>
                {confidenceString}
              </span>
            </div>

            <div className="m3-panel m3-panel-info">
              <h3 className="m3-panel-title">Why was this proposed?</h3>
              <p className="m3-panel-content">{provenance}</p>
            </div>

            <div className="m3-checkbox-row">
              <input 
                type="checkbox" 
                id="human-override" 
                checked={isOverride}
                onChange={(e) => setIsOverride(e.target.checked)}
              />
              <label htmlFor="human-override">
                Human Override - I am modifying this action
              </label>
            </div>
          </div>

          <div className="m3-dialog-actions">
            <button onClick={onReject} className="m3-btn m3-btn-outlined">
              Reject
            </button>
            <button onClick={onConfirm} className="m3-btn m3-btn-filled">
              {isOverride ? 'Confirm with Override' : 'Approve AI Action'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

