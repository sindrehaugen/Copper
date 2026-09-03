import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useDocumentStore } from '../../store/documentStore';
import { findingRegistry } from '../../shell/finding/registry';
import type { DesignDocument } from '../../model/schema';

export interface SpatialFindingItem {
  id: string;
  targetId?: string;
  entityRef?: any;
  severity: 'Error' | 'Warning' | 'Info' | 'blocker' | 'risk' | 'advice' | string;
  rule?: string;
  message: string;
  details?: any;
  fix?: { apply?: () => void | Promise<void> } | (() => void | Promise<void>);
  [key: string]: any;
}

export interface SpatialFindingsTrayProps {
  findings?: SpatialFindingItem[];
  activeSpaceId?: string | null;
  onSelectSpace?: (spaceId: string | null) => void;
  isOpen?: boolean;
  onToggle?: () => void;
  onSelectEntity?: (entityId: string) => void;
  className?: string;
}

export function getSeverityRank(severity?: string): number {
  if (!severity) return 99;
  const s = severity.toLowerCase();
  if (s === 'error' || s === 'blocker' || s === 'critical') return 1;
  if (s === 'warning' || s === 'risk' || s === 'warn') return 2;
  if (s === 'info' || s === 'advice' || s === 'notice' || s === 'ok') return 3;
  return 99;
}

export function sortFindingsBySeverity<T extends { severity?: string }>(findings: T[]): T[] {
  return [...findings].sort(
    (a, b) => getSeverityRank(a.severity) - getSeverityRank(b.severity)
  );
}

export function getFindingTargetId(finding: any): string | undefined {
  if (finding.targetId) return finding.targetId;
  if (finding.entityRef) {
    if (typeof finding.entityRef === 'string') {
      const cleaned = finding.entityRef.replace(/^\/e\//, '');
      const colonIdx = cleaned.indexOf(':');
      const slashIdx = cleaned.indexOf('/');
      const sepIdx = colonIdx !== -1 ? colonIdx : slashIdx;
      if (sepIdx !== -1) {
        return cleaned.slice(sepIdx + 1);
      }
      return cleaned;
    }
    if (typeof finding.entityRef === 'object' && finding.entityRef.id) {
      return finding.entityRef.id;
    }
  }
  if (finding.entityId) return finding.entityId;
  return undefined;
}

export function getEntitiesInSpace(
  document: DesignDocument | null | undefined,
  activeSpaceId?: string | null
): Set<string> {
  const entityIds = new Set<string>();
  if (!document) return entityIds;

  if (!activeSpaceId || activeSpaceId === 'all') {
    document.locations?.forEach(l => entityIds.add(l.id));
    document.racks?.forEach(r => entityIds.add(r.id));
    document.devices?.forEach(d => entityIds.add(d.id));
    document.cables?.forEach(c => entityIds.add(c.id));
    document.zones?.forEach(z => entityIds.add(z.id));
    return entityIds;
  }

  // Find active space and all descendant locations
  const spaceLocationIds = new Set<string>([activeSpaceId]);
  let added = true;
  while (added) {
    added = false;
    for (const loc of document.locations || []) {
      if (loc.parentId && spaceLocationIds.has(loc.parentId) && !spaceLocationIds.has(loc.id)) {
        spaceLocationIds.add(loc.id);
        added = true;
      }
    }
  }

  spaceLocationIds.forEach(id => entityIds.add(id));

  // Racks in space
  const rackIdsInSpace = new Set<string>();
  for (const rack of document.racks || []) {
    if (rack.locationId && spaceLocationIds.has(rack.locationId)) {
      entityIds.add(rack.id);
      rackIdsInSpace.add(rack.id);
    }
  }

  // Devices in space (by location, physicalLocation, or rack)
  const deviceIdsInSpace = new Set<string>();
  for (const dev of document.devices || []) {
    const inLoc = (dev.locationId && spaceLocationIds.has(dev.locationId)) ||
                  (dev.physicalLocation && spaceLocationIds.has(dev.physicalLocation));
    const inRack = dev.rackId && rackIdsInSpace.has(dev.rackId);
    if (inLoc || inRack) {
      entityIds.add(dev.id);
      deviceIdsInSpace.add(dev.id);
    }
  }

  // Cables connected to devices in space
  for (const cable of document.cables || []) {
    const hasTermInSpace = cable.terminations?.some(t => deviceIdsInSpace.has(t.deviceId));
    if (hasTermInSpace) {
      entityIds.add(cable.id);
    }
  }

  // Zones in space
  for (const zone of document.zones || []) {
    if (zone.locationId && spaceLocationIds.has(zone.locationId)) {
      entityIds.add(zone.id);
    }
  }

  return entityIds;
}

export function filterFindingsBySpatialPresence<T extends { targetId?: string; entityRef?: any; severity?: string }>(
  findings: T[],
  document: DesignDocument | null | undefined,
  activeSpaceId?: string | null
): T[] {
  if (!document) return sortFindingsBySeverity(findings);
  const entitiesInSpace = getEntitiesInSpace(document, activeSpaceId);

  const filtered = findings.filter(f => {
    const targetId = getFindingTargetId(f);
    if (!targetId) return true;
    return entitiesInSpace.has(targetId);
  });

  return sortFindingsBySeverity(filtered);
}

export function SpatialFindingsTray({
  findings: explicitFindings,
  activeSpaceId: explicitActiveSpaceId,
  onSelectSpace,
  isOpen: explicitIsOpen,
  onToggle,
  onSelectEntity,
  className = ''
}: SpatialFindingsTrayProps) {
  const { t } = useTranslation();
  const document = useDocumentStore(state => state.document);
  const setSelectedIds = useDocumentStore(state => state.setSelectedIds);

  const [internalIsOpen, setInternalIsOpen] = useState(true);
  const [selectedSpace, setSelectedSpace] = useState<string | null>(null);
  const [registryFindings, setRegistryFindings] = useState<any[]>(() => findingRegistry.getAllFindings());

  useEffect(() => {
    setRegistryFindings(findingRegistry.getAllFindings());
    const unsub = findingRegistry.subscribe(updated => {
      setRegistryFindings(updated);
    });
    return unsub;
  }, []);

  const isOpen = explicitIsOpen !== undefined ? explicitIsOpen : internalIsOpen;
  const handleToggle = onToggle || (() => setInternalIsOpen(prev => !prev));
  const activeSpace = explicitActiveSpaceId !== undefined ? explicitActiveSpaceId : selectedSpace;

  const rawFindings = explicitFindings !== undefined ? explicitFindings : registryFindings;

  const filteredFindings = useMemo(() => {
    return filterFindingsBySpatialPresence(rawFindings, document, activeSpace);
  }, [rawFindings, document, activeSpace]);

  const errorCount = useMemo(
    () => filteredFindings.filter(f => getSeverityRank(f.severity) === 1).length,
    [filteredFindings]
  );
  const warningCount = useMemo(
    () => filteredFindings.filter(f => getSeverityRank(f.severity) === 2).length,
    [filteredFindings]
  );
  const infoCount = useMemo(
    () => filteredFindings.filter(f => getSeverityRank(f.severity) === 3).length,
    [filteredFindings]
  );

  const handleFindingClick = useCallback((finding: SpatialFindingItem) => {
    const targetId = getFindingTargetId(finding);
    if (targetId) {
      setSelectedIds([targetId]);
      onSelectEntity?.(targetId);
    }
  }, [setSelectedIds, onSelectEntity]);

  const handleFixClick = useCallback(async (e: React.MouseEvent, finding: SpatialFindingItem) => {
    e.stopPropagation();
    if (!finding.fix) return;
    if (typeof finding.fix === 'function') {
      await finding.fix();
    } else if (typeof finding.fix === 'object' && finding.fix.apply) {
      await finding.fix.apply();
    }
  }, []);

  const locations = document?.locations || [];
  const activeLocation = locations.find(l => l.id === activeSpace);
  const activeSpaceLabel = activeLocation?.name || activeSpace || t('spatial.allSpaces', 'All Spaces');

  return (
    <aside
      aria-label={t('spatial.findingsTray', 'Spatial Findings Tray')}
      className={`copper-spatial-findings-tray ${className}`}
      data-testid="spatial-findings-tray"
      style={{
        position: 'absolute',
        bottom: 16,
        right: 16,
        width: 'min(440px, calc(100vw - 32px))',
        maxHeight: 'min(380px, calc(100vh - 120px))',
        background: 'var(--copper-surface-container, #1f2328)',
        color: 'var(--copper-on-surface, #e6edf3)',
        borderRadius: 8,
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid var(--copper-outline, #30363d)',
        boxShadow: 'var(--md-sys-elevation-level-3, 0 4px 12px rgba(0,0,0,0.3))',
        zIndex: 900,
        overflow: 'hidden',
        fontSize: '0.85rem'
      }}
    >
      {/* Header / Toggle Button */}
      <button
        type="button"
        onClick={handleToggle}
        className="copper-spatial-findings-header"
        aria-expanded={isOpen}
        aria-label={t('spatial.toggleFindings', 'Toggle spatial findings tray')}
        data-testid="spatial-findings-toggle-btn"
        style={{
          padding: '10px 14px',
          background: 'var(--copper-surface-container-highest, #2d333b)',
          border: 'none',
          borderBottom: isOpen ? '1px solid var(--copper-outline-variant, #373e47)' : 'none',
          color: 'var(--copper-on-surface, #e6edf3)',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontWeight: 600,
          width: '100%',
          textAlign: 'left'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span>{isOpen ? '▼' : '▲'}</span>
          <span>{t('spatial.findingsTitle', 'Spatial Findings')}</span>
          <span
            style={{
              background: 'var(--copper-secondary-container, #3a6e6a)',
              color: 'var(--copper-on-secondary-container, #ffffff)',
              padding: '2px 8px',
              borderRadius: 12,
              fontSize: '0.75rem'
            }}
          >
            {filteredFindings.length}
          </span>
          {activeSpace && (
            <span
              style={{
                fontSize: '0.75rem',
                color: 'var(--copper-primary, #B87333)',
                fontWeight: 500
              }}
            >
              ({activeSpaceLabel})
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: 6, fontSize: '0.75rem' }}>
          {errorCount > 0 && (
            <span style={{ color: 'var(--copper-error, #f85149)' }}>
              {errorCount} {t('common.errors', 'E')}
            </span>
          )}
          {warningCount > 0 && (
            <span style={{ color: 'var(--copper-tertiary, #d29922)' }}>
              {warningCount} {t('common.warnings', 'W')}
            </span>
          )}
          {infoCount > 0 && (
            <span style={{ color: 'var(--copper-secondary, #58a6ff)' }}>
              {infoCount} {t('common.info', 'I')}
            </span>
          )}
        </div>
      </button>

      {/* Tray Content */}
      {isOpen && (
        <div
          style={{
            padding: 12,
            overflowY: 'auto',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 8
          }}
          data-testid="spatial-findings-content"
        >
          {/* Space Filter Selector if locations exist and not controlled explicitly */}
          {locations.length > 0 && onSelectSpace === undefined && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <label htmlFor="spatial-space-select" style={{ fontSize: '0.75rem', color: 'var(--copper-on-surface-variant, #8b949e)' }}>
                {t('spatial.filterBySpace', 'Space:')}
              </label>
              <select
                id="spatial-space-select"
                value={activeSpace || ''}
                onChange={(e) => {
                  const val = e.target.value || null;
                  setSelectedSpace(val);
                }}
                style={{
                  flex: 1,
                  background: 'var(--copper-surface, #161b22)',
                  color: 'var(--copper-on-surface, #e6edf3)',
                  border: '1px solid var(--copper-outline, #30363d)',
                  borderRadius: 4,
                  padding: '4px 8px',
                  fontSize: '0.75rem'
                }}
              >
                <option value="">{t('spatial.allSpaces', 'All Spaces in View')}</option>
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name || loc.id}
                  </option>
                ))}
              </select>
            </div>
          )}

          {filteredFindings.length === 0 ? (
            <div
              data-testid="spatial-findings-empty"
              style={{
                color: 'var(--copper-on-surface-variant, #8b949e)',
                padding: '16px 8px',
                textAlign: 'center',
                fontStyle: 'italic'
              }}
            >
              {t('spatial.noFindingsInSpace', 'No active findings in this space')}
            </div>
          ) : (
            filteredFindings.map(f => {
              const rank = getSeverityRank(f.severity);
              const severityColor =
                rank === 1
                  ? 'var(--copper-error, #f85149)'
                  : rank === 2
                  ? 'var(--copper-tertiary, #d29922)'
                  : 'var(--copper-secondary, #58a6ff)';

              const targetId = getFindingTargetId(f);

              return (
                <div
                  key={f.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleFindingClick(f)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleFindingClick(f);
                    }
                  }}
                  data-testid={`spatial-finding-item-${f.id}`}
                  style={{
                    padding: 8,
                    background: 'var(--copper-surface, #161b22)',
                    borderRadius: 6,
                    borderLeft: `4px solid ${severityColor}`,
                    borderTop: '1px solid var(--copper-outline, #30363d)',
                    borderRight: '1px solid var(--copper-outline, #30363d)',
                    borderBottom: '1px solid var(--copper-outline, #30363d)',
                    cursor: targetId ? 'pointer' : 'default',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span
                        data-testid={`spatial-finding-severity-${f.id}`}
                        style={{
                          color: severityColor,
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          textTransform: 'uppercase'
                        }}
                      >
                        {f.severity}
                      </span>
                      {f.rule && (
                        <span
                          style={{
                            fontSize: '0.7rem',
                            color: 'var(--copper-on-surface-variant, #8b949e)',
                            fontFamily: 'monospace'
                          }}
                        >
                          {f.rule}
                        </span>
                      )}
                    </div>

                    {targetId && (
                      <span
                        style={{
                          fontSize: '0.7rem',
                          background: 'var(--copper-surface-container-highest, #2d333b)',
                          padding: '1px 6px',
                          borderRadius: 4,
                          color: 'var(--copper-on-surface, #e6edf3)'
                        }}
                      >
                        {targetId}
                      </span>
                    )}
                  </div>

                  <div style={{ color: 'var(--copper-on-surface, #e6edf3)', lineHeight: 1.3 }}>
                    {f.message}
                  </div>

                  {f.fix && (
                    <div style={{ marginTop: 4, display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={(e) => handleFixClick(e, f)}
                        style={{
                          background: 'var(--copper-primary, #B87333)',
                          color: 'var(--copper-on-primary, #ffffff)',
                          border: 'none',
                          borderRadius: 4,
                          padding: '3px 8px',
                          fontSize: '0.75rem',
                          cursor: 'pointer'
                        }}
                      >
                        {t('common.fix', 'Fix / Locate')}
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </aside>
  );
}
