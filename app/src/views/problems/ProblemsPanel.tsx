import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDocumentStore } from '../../store/documentStore';
import { useDocumentFindings } from '../../validation/selectors';

export function ProblemsPanel() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const findings = useDocumentFindings();
  const setSelectedIds = useDocumentStore(state => state.setSelectedIds);

  const errors = findings.filter(f => f.severity === 'Error');
  const warnings = findings.filter(f => f.severity === 'Warning');
  const total = errors.length + warnings.length;

  if (!isOpen) {
    return (
      <button 
        className="m3-button"
        style={{ position: 'absolute', bottom: 16, right: 140, zIndex: 10, background: total > 0 ? 'var(--md-sys-color-error)' : undefined, color: total > 0 ? 'var(--md-sys-color-on-error)' : undefined }}
        onClick={() => setIsOpen(true)}
      >
        {total > 0 ? `${total} Problems` : '0 Problems'}
      </button>
    );
  }

  return (
    <div style={{
      position: 'absolute', right: 140, bottom: 60, width: 350, maxHeight: 400, overflow: 'auto',
      background: 'var(--copper-surface)', border: '1px solid var(--copper-outline)', 
      padding: '16px', borderRadius: '8px', boxShadow: 'var(--md-sys-elevation-level-3)', zIndex: 10
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ margin: 0 }}>{t('problems.title', 'Design Problems')}</h3>
        <button className="m3-button m3-button-text" onClick={() => setIsOpen(false)}>×</button>
      </div>

      {total === 0 ? (
        <div style={{ color: 'var(--copper-text-secondary)', fontSize: 12 }}>
          {t('problems.empty', 'No problems found in the current design.')}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {findings.map((f, i) => (
            <div key={i} style={{ padding: 8, background: 'var(--md-sys-color-surface-container-high)', borderRadius: 4, fontSize: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong style={{ color: f.severity === 'Error' ? 'var(--md-sys-color-error)' : 'orange' }}>
                  [{f.source}] {f.severity}
                </strong>
                {f.targetId && (
                  <button 
                    className="m3-button m3-button-text" 
                    style={{ fontSize: 10, padding: '0 4px', height: 20 }}
                    onClick={() => {
                      if (f.targetId) {
                        // In a real implementation this would pan the canvas to the node
                        setSelectedIds([f.targetId]);
                      }
                    }}
                  >
                    Locate
                  </button>
                )}
              </div>
              <div style={{ marginTop: 4 }}>{f.message}</div>
              {f.fix && (
                <button 
                  className="m3-button" 
                  style={{ marginTop: 8, width: '100%', fontSize: 10 }}
                  onClick={f.fix}
                >
                  Quick Fix
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
