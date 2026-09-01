import { useState } from 'react';
import { useDocumentFindings } from '../../validation/selectors';
import { useDocumentStore } from '../../store/documentStore';

export function ProblemsPanel() {
  const findings = useDocumentFindings();
  const selectItem = useDocumentStore((state: any) => state.selectItem);
  const [minimized, setMinimized] = useState(false);

  const errors = findings.filter(f => f.severity === 'Error');
  const warnings = findings.filter(f => f.severity === 'Warning');

  if (findings.length === 0) return null;

  if (minimized) {
    return (
      <div 
        style={{
          position: 'absolute',
          bottom: 16,
          right: 16,
          background: 'var(--copper-surface-container-highest)',
          color: 'var(--copper-on-surface)',
          padding: '8px 16px',
          borderRadius: 8,
          cursor: 'pointer',
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          border: '1px solid var(--copper-outline)',
          boxShadow: 'var(--md-sys-elevation-level-2)',
          zIndex: 9999,
        }}
        onClick={() => setMinimized(false)}
      >
        <span style={{ color: 'var(--copper-error)' }}> E: {errors.length}</span>
        <span style={{ color: 'var(--copper-tertiary)' }}> W: {warnings.length}</span>
      </div>
    );
  }

  return (
    <div 
      style={{
        position: 'absolute',
        bottom: 16,
        right: 16,
        width: 400,
        maxHeight: 300,
        background: 'var(--copper-surface-container)',
        color: 'var(--copper-on-surface)',
        borderRadius: 8,
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid var(--copper-outline)',
        boxShadow: 'var(--md-sys-elevation-level-3)',
        zIndex: 9999,
        overflow: 'hidden'
      }}
    >
      <div 
        style={{
          padding: '8px 16px',
          background: 'var(--copper-surface-container-highest)',
          borderBottom: '1px solid var(--copper-outline-variant)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <h4 style={{ margin: 0, fontSize: '0.9rem' }}>
          Design Validation ({errors.length} E, {warnings.length} W)
        </h4>
        <button 
          onClick={() => setMinimized(true)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--copper-on-surface)',
            cursor: 'pointer',
            fontSize: '1.2rem',
            lineHeight: 1
          }}
        >
          -
        </button>
      </div>

      <div style={{ padding: 12, overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {findings.map((f, i) => (
          <div 
            key={i}
            style={{
              padding: 8,
              background: 'var(--copper-surface)',
              borderRadius: 4,
              borderLeft: `4px solid ${f.severity === 'Error' ? 'var(--copper-error)' : 'var(--copper-tertiary)'}`,
              fontSize: '0.85rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <strong style={{ color: f.severity === 'Error' ? 'var(--copper-error)' : 'var(--copper-tertiary)' }}>
                {f.source}
              </strong>
              {f.targetId && (
                <button 
                  onClick={() => selectItem && selectItem(f.targetId)}
                  style={{
                    background: 'var(--copper-primary-container)',
                    color: 'var(--copper-on-primary-container)',
                    border: 'none',
                    borderRadius: 4,
                    padding: '2px 8px',
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                  }}
                >
                  Locate
                </button>
              )}
            </div>
            <div style={{ marginBottom: f.fix ? 8 : 0 }}>
              {f.message}
            </div>
            {f.fix && (
              <button 
                onClick={() => f.fix?.()}
                style={{
                  background: 'var(--copper-secondary-container)',
                  color: 'var(--copper-on-secondary-container)',
                  border: 'none',
                  borderRadius: 4,
                  padding: '4px 12px',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                Apply Fix
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
