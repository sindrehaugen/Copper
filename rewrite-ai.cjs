const fs = require('fs');
const code = `import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import './compliance.css';

export interface AiConfirmDialogProps {
  title: string;
  proposedAction: string;
  confidenceString: string;
  provenance: string;
  onConfirm: (override: boolean) => void;
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
  const { t } = useTranslation('compliance');
  const [isOverride, setIsOverride] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previousFocus.current = document.activeElement as HTMLElement;
    const focusable = dialogRef.current?.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable && focusable.length) {
      (focusable[0] as HTMLElement).focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onReject();
      } else if (e.key === 'Tab') {
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0] as HTMLElement;
        const last = focusable[focusable.length - 1] as HTMLElement;
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (previousFocus.current) {
        previousFocus.current.focus();
      }
    };
  }, [onReject]);

  const confClass = confidenceString.toLowerCase() === 'high' ? 'm3-confidence-high' :
                    confidenceString.toLowerCase() === 'medium' ? 'm3-confidence-medium' : 'm3-confidence-low';

  return (
    <>
      <div className="m3-dialog-scrim" onClick={onReject} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') onReject(); }} />
      <div className="m3-dialog-scrim" style={{ backgroundColor: 'transparent' }}>
        <div 
          ref={dialogRef}
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
              {t('aiSuggestion')}
            </span>
          </div>

          <div className="m3-dialog-body">
            <div className="m3-panel">
              <h3 className="m3-panel-title">{t('proposedActionLabel')}</h3>
              <p className="m3-panel-content">{proposedAction}</p>
            </div>

            <div className="m3-confidence">
              <span>{t('confidenceLabel')} </span>
              <span className={confClass}>
                {confidenceString}
              </span>
            </div>

            <div className="m3-panel m3-panel-info">
              <h3 className="m3-panel-title">{t('provenanceLabel')}</h3>
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
                {t('humanOverride')}
              </label>
            </div>
          </div>

          <div className="m3-dialog-actions">
            <button onClick={onReject} className="m3-btn m3-btn-outlined">
              {t('rejectBtn')}
            </button>
            <button onClick={() => onConfirm(isOverride)} className="m3-btn m3-btn-filled">
              {isOverride ? t('confirmOverrideBtn') : t('approveBtn')}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
`;
fs.writeFileSync('app/src/components/compliance/AiConfirmDialog.tsx', code);
console.log('Rewrote AiConfirmDialog.tsx');
