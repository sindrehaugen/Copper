import { useTranslation } from 'react-i18next';
import React, { useMemo } from 'react';
import { useDocumentStore } from '../../store/documentStore';
import { validateAudioLines, suggestAmpsForNode } from '../../validation/audio-line';

export const NodeInspector: React.FC = () => {
  const selectedIds = useDocumentStore(state => state.selectedIds);
  const document = useDocumentStore(state => state.document);
  const updateDocument = useDocumentStore(state => state.updateDocument);

  if (!document || selectedIds.length !== 1) return null;

  const selectedId = selectedIds[0];
  const device = document.devices.find(d => d.id === selectedId);

  if (!device) return null;

  const deviceType = document.deviceTypes.find(dt => dt.id === device.deviceTypeId);
  if (!deviceType) return null;

  // B98 Audio Line validation (only applies to amplifiers)
  const isAmp = deviceType.customFields?.acoustics?.device_class === 'amplifier';
  const audioRes = isAmp ? validateAudioLines(document) : null;
  const finding = audioRes?.findings.find(f => f.targetId === device.id && f.severity !== 'OK');

  const suggestions = useMemo(() => {
    if (!finding || !isAmp) return [];
    return suggestAmpsForNode(device.id, document.devices, document.deviceTypes, document.cables);
  }, [finding, isAmp, device.id, document.devices, document.deviceTypes, document.cables]);

  // B104 Capability Alternatives
  const alternatives = useMemo(() => {
    if (!deviceType.customFields?.acoustics) return [];
    const { category, type, impedance } = deviceType.customFields.acoustics;
    
    return document.deviceTypes
      .filter(dt => 
        dt.id !== deviceType.id &&
        dt.customFields?.acoustics?.category === category &&
        dt.customFields?.acoustics?.type === type &&
        dt.customFields?.acoustics?.impedance === impedance
      )
      .slice(0, 3);
  }, [deviceType, document.deviceTypes]);

  const handleApplyAlternative = (altTypeId: string) => {
    updateDocument(draft => {
      const d = draft.devices.find(x => x.id === device.id);
      if (d) d.deviceTypeId = altTypeId;
    });
  };

  return (
    <div style={{ position: 'absolute', top: 16, right: 16, width: 320, background: 'var(--copper-surface)', border: '1px solid var(--copper-outline)', borderRadius: 8, padding: 16, zIndex: 10 }}>
      <h3 className="m3-title-medium" style={{ margin: '0 0 8px 0' }}>{device.name}</h3>
      <div className="m3-label-medium" style={{ color: 'var(--copper-on-surface-variant)', marginBottom: 16 }}>
        {deviceType.manufacturer} {deviceType.model}
      </div>

      {finding && (
        <div style={{ padding: 12, background: 'var(--copper-error-container)', color: 'var(--copper-on-error-container)', borderRadius: 8, marginBottom: 16 }}>
          <strong>{finding.severity}:</strong> {finding.message}
          {suggestions.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <div className="m3-label-small">{t('common.suggestedFixes')}</div>
              {suggestions.map(s => (
                <button
                  key={s.suggestedAmpId as string}
                  onClick={() => handleApplyAlternative(s.suggestedAmpId as string)}
                  className="m3-button m3-button-filled m3-button-small"
                  style={{ display: 'block', marginTop: 4, width: '100%' }}
                >
                  Swap to {document.deviceTypes.find(d => d.id === s.suggestedAmpId)?.model}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {alternatives.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <h4 className="m3-label-medium" style={{ marginBottom: 8 }}>{t('common.alternativesByCapability')}</h4>
          {alternatives.map((alt: any) => (
            <div key={alt.id as string} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--copper-surface-container)', padding: '8px 12px', borderRadius: 4, marginBottom: 4 }}>
              <span className="m3-body-small">{alt.manufacturer} {alt.model}</span>
              <button 
                onClick={() => handleApplyAlternative(alt.id as string)}
                className="m3-button m3-button-text"
                style={{ padding: '0 8px', minWidth: 'auto', height: 24, fontSize: '0.75rem' }}
              >
                {t('common.swap')}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
