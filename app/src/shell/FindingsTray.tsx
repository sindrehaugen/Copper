import { useTranslation } from 'react-i18next';
import { ShellFinding } from './layout';

export interface FindingsTrayProps {
  findings?: ShellFinding[];
  isOpen?: boolean;
  onToggle?: () => void;
}

export function FindingsTray({
  findings = [],
  isOpen = false,
  onToggle,
}: FindingsTrayProps) {
  const { t } = useTranslation();

  const severityOrder: Record<string, number> = { blocker: 1, risk: 2, advice: 3 };
  const sortedFindings = [...findings].sort(
    (a, b) => (severityOrder[a.severity] ?? 99) - (severityOrder[b.severity] ?? 99)
  );

  return (
    <section
      aria-label={t('nav.findingsTray')}
      className="copper-findings-tray"
      data-testid="findings-tray"
    >
      <button
        type="button"
        onClick={onToggle}
        className="copper-findings-tray-header"
        aria-expanded={isOpen}
        aria-label={t('nav.toggleFindings')}
        data-testid="findings-tray-toggle-btn"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>{isOpen ? '▼' : '▲'}</span>
          <span>{t('nav.findingsTray')}</span>
          <span className="copper-control-chip">{findings.length}</span>
        </div>
        <span style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>{'⌃`'}</span>
      </button>

      {isOpen && (
        <div className="copper-findings-tray-content" data-testid="findings-tray-content">
          {sortedFindings.length === 0 ? (
            <div style={{ color: 'var(--md-sys-color-on-surface-variant)', padding: '8px 0' }}>
              {t('nav.noFindings')}
            </div>
          ) : (
            sortedFindings.map(f => (
              <div key={f.id} className="copper-finding-row" data-testid={`finding-item-${f.id}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className={`copper-severity-badge copper-severity-${f.severity}`}>
                    {f.severity}
                  </span>
                  <span style={{ fontWeight: 600 }}>{f.rule}</span>
                  <span>{f.message}</span>
                </div>
                {f.entityRef && (
                  <span style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
                    {f.entityRef}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </section>
  );
}
