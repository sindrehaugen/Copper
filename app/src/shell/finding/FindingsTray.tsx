/**
 * Findings Tray Component (Batch 142 / OB.W4)
 */

import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Finding, FindingsTrayProps } from './types';
import { useFindings } from './useFindings';
import { SEVERITY_WEIGHT } from './registry';
import './finding.css';

export function FindingsTray({
  findings: explicitFindings,
  isOpen: explicitIsOpen,
  onToggle,
  filter,
  onFix,
  className = '',
}: FindingsTrayProps) {
  const { t } = useTranslation();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [pendingFixes, setPendingFixes] = useState<Record<string, boolean>>({});

  const {
    findings: storeFindings,
    executeFix: storeExecuteFix,
  } = useFindings(filter);

  const isOpen = explicitIsOpen !== undefined ? explicitIsOpen : internalIsOpen;
  const handleToggle = onToggle || (() => setInternalIsOpen(prev => !prev));

  const rawFindings = explicitFindings !== undefined ? explicitFindings : storeFindings;
  const findings = [...rawFindings].sort(
    (a, b) => (SEVERITY_WEIGHT[a.severity] ?? 99) - (SEVERITY_WEIGHT[b.severity] ?? 99)
  );

  const handleFixClick = useCallback(
    async (finding: Finding) => {
      setPendingFixes(prev => ({ ...prev, [finding.id]: true }));
      try {
        if (onFix) {
          await onFix(finding);
        } else if (finding.fix?.apply) {
          await finding.fix.apply();
        } else {
          await storeExecuteFix(finding.id);
        }
      } catch (err) {
        console.error(`Failed to apply fix for finding ${finding.id}:`, err);
      } finally {
        setPendingFixes(prev => ({ ...prev, [finding.id]: false }));
      }
    },
    [onFix, storeExecuteFix]
  );

  const formatEntityRef = (ref: Finding['entityRef']): string => {
    if (!ref) return '';
    if (typeof ref === 'string') return ref;
    return `${ref.type}:${ref.id}`;
  };

  const formatEvidence = (evidence: unknown): string => {
    if (evidence === undefined || evidence === null) return '';
    if (typeof evidence === 'string') return evidence;
    try {
      return JSON.stringify(evidence);
    } catch {
      return String(evidence);
    }
  };

  return (
    <section
      aria-label={t('nav.findingsTray', 'Findings Tray')}
      className={`copper-findings-tray ${className}`}
      data-testid="findings-tray"
    >
      <button
        type="button"
        onClick={handleToggle}
        className="copper-findings-tray-header"
        aria-expanded={isOpen}
        aria-label={t('nav.toggleFindings', 'Toggle findings tray (⌃`)')}
        data-testid="findings-tray-toggle-btn"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>{isOpen ? '▼' : '▲'}</span>
          <span>{t('nav.findingsTray', 'Findings Tray')}</span>
          <span className="copper-control-chip">{findings.length}</span>
        </div>
        <span style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>{'⌃`'}</span>
      </button>

      {isOpen && (
        <div className="copper-findings-tray-content" data-testid="findings-tray-content">
          {findings.length === 0 ? (
            <div style={{ color: 'var(--md-sys-color-on-surface-variant)', padding: '8px 0' }}>
              {t('nav.noFindings', 'No active findings')}
            </div>
          ) : (
            findings.map(f => {
              const entityLabel = formatEntityRef(f.entityRef);
              const evidenceStr = formatEvidence(f.evidence);
              const isFixing = pendingFixes[f.id] ?? false;

              return (
                <div
                  key={f.id}
                  className="copper-finding-row"
                  data-testid={`finding-item-${f.id}`}
                >
                  <div className="copper-finding-main">
                    <span
                      className={`copper-severity-badge copper-severity-${f.severity}`}
                      data-testid={`finding-severity-${f.id}`}
                    >
                      {f.severity}
                    </span>
                    <span
                      className="copper-finding-rule"
                      data-testid={`finding-rule-${f.id}`}
                    >
                      {f.rule}
                    </span>
                    <span className="copper-finding-message">{f.message}</span>
                  </div>

                  <div className="copper-finding-meta">
                    {entityLabel && (
                      <span
                        className="copper-finding-entity"
                        data-testid={`finding-entity-${f.id}`}
                      >
                        {entityLabel}
                      </span>
                    )}

                    {evidenceStr && (
                      <span
                        className="copper-finding-evidence"
                        data-testid={`finding-evidence-${f.id}`}
                        title={evidenceStr}
                      >
                        {evidenceStr}
                      </span>
                    )}

                    {f.provenanceRef && (
                      <span
                        className="copper-finding-provenance"
                        data-testid={`finding-provenance-${f.id}`}
                        title={f.provenanceRef}
                      >
                        {f.provenanceRef}
                      </span>
                    )}

                    {f.fix && (
                      <button
                        type="button"
                        onClick={() => handleFixClick(f)}
                        disabled={isFixing || f.fix.disabled}
                        className="copper-finding-fix-btn"
                        data-testid={`finding-fix-btn-${f.id}`}
                        aria-label={f.fix.label}
                      >
                        {isFixing ? t('common.saving', 'Applying...') : f.fix.label}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </section>
  );
}
