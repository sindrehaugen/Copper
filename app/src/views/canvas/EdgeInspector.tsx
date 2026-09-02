import { useTranslation } from 'react-i18next';
import React, { useMemo } from 'react';
import { useDocumentStore } from '../../store/documentStore';
import { validateAudioLines, suggestCablesForEdge } from '../../validation/audio-line';

export const EdgeInspector: React.FC = () => {
  const { t } = useTranslation();
  const selectedIds = useDocumentStore(state => state.selectedIds);
  const document = useDocumentStore(state => state.document);
  const updateDocument = useDocumentStore(state => state.updateDocument);

  const selectedId = selectedIds[0];
  const cable = document?.cables.find(c => c.id === selectedId);

  // In a real app with B101, this would come from the memoized universal validation selector.
  const audioRes = document ? validateAudioLines(document) : { findings: [] };
  const nodeIds = cable?.terminations?.map(t => t.deviceId) || [cable?.sourceId, cable?.targetId];
  const finding = audioRes.findings.find(f => nodeIds.includes(f.targetId as string) && f.severity !== 'OK');
  const edgeData = finding ? {
    status: finding.severity,
    dropPercent: (finding.details as any)?.dropPercent ?? 0,
    minLoad: (finding.details as any)?.minLoad ?? 0,
    cableImpedanceRe: 0 // Legacy field
  } : undefined;

  // B98 Wizard
  const suggestions = useMemo(() => {
    if (!edgeData || edgeData.status === 'OK' || !cable || !document) return [];
    return suggestCablesForEdge(cable.id, document.devices, document.deviceTypes, document.cables);
  }, [edgeData?.status, cable?.id, document]);

  if (!document || selectedIds.length !== 1 || !cable) return null;

  const applyCable = (typeId: string) => {
    updateDocument((draft) => {
      const c = draft.cables.find(x => x.id === cable.id);
      if (c) c.type = typeId;
    });
  };

  return (
    <div className="copper-edge-inspector" style={{
      position: 'absolute',
      bottom: 16,
      left: 16,
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      width: '320px',
      background: 'var(--md-sys-color-surface-container)',
      padding: '16px',
      borderRadius: '8px',
      border: '1px solid var(--md-sys-color-outline-variant)'
    }}>
      <h3 style={{ margin: 0, fontSize: 'var(--md-sys-typescale-title-small-font-size)' }}>
        {t('common.edgeInspector')}
      </h3>
      <div style={{ fontSize: '12px', color: 'var(--md-sys-color-on-surface-variant)' }}>
        <div><strong>{t('common.iD')}</strong> {cable.id}</div>
        <div><strong>{t('common.type')}</strong> {cable.type || 'Generic'}</div>
        <div><strong>{t('common.length')}</strong> {cable.lengthM}m</div>
      </div>
      
      {edgeData && (
        <div style={{ 
          marginTop: '8px', 
          padding: '8px', 
          background: edgeData.status === 'Error' ? 'var(--md-sys-color-error-container)' : 
                      edgeData.status === 'Warning' ? 'var(--md-sys-color-tertiary-container)' : 
                      'var(--md-sys-color-secondary-container)',
          color: edgeData.status === 'Error' ? 'var(--md-sys-color-on-error-container)' : 
                 edgeData.status === 'Warning' ? 'var(--md-sys-color-on-tertiary-container)' : 
                 'var(--md-sys-color-on-secondary-container)',
          borderRadius: '4px',
          fontSize: '12px'
        }}>
          <h4 style={{ margin: '0 0 4px 0' }}>{t('common.audioLineLive')}</h4>
          <div><strong>{t('common.drop')}</strong> {edgeData.dropPercent.toFixed(1)}%</div>
          <div><strong>{t('common.z1kHz')}</strong> {edgeData.cableImpedanceRe.toFixed(2)} Ω (Cable)</div>
          <div><strong>{t('common.minLoad')}</strong> {edgeData.minLoad.toFixed(2)} Ω</div>
          <div><strong>{t('common.status')}</strong> {edgeData.status}</div>
        </div>
      )}

      {suggestions.length > 0 && (
        <div style={{ marginTop: '8px' }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '12px' }}>{t('common.SmartFixB98')}</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {suggestions.map(sg => (
              <button
                key={sg.id}
                onClick={() => applyCable(sg.id)}
                style={{
                  textAlign: 'left',
                  padding: '6px 8px',
                  background: 'var(--md-sys-color-primary)',
                  color: 'var(--md-sys-color-on-primary)',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '11px'
                }}
              >
                Apply: {sg.manufacturer} {sg.model}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
