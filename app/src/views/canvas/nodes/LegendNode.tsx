import { useTranslation } from 'react-i18next';
import React from 'react';
import { PHYSICAL_LOCATIONS } from '../../../model/locations';

export const LegendNodeComponent: React.FC = () => {
  const { t } = useTranslation();
  const locations = Object.entries(PHYSICAL_LOCATIONS).filter(([name]) => name !== 'Unknown');

  return (
    <div style={{
      width: '100%',
      height: '100%',
      backgroundColor: 'var(--md-sys-color-surface)',
      color: 'var(--md-sys-color-on-surface)',
      border: '1px solid var(--md-sys-color-outline-variant)',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: 'var(--md-sys-elevation-level-1)',
      fontFamily: 'var(--md-sys-typescale-body-medium-font-family, sans-serif)',
      fontSize: '10px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{
        padding: '8px',
        backgroundColor: 'var(--md-sys-color-surface-container-high)',
        borderBottom: '1px solid var(--md-sys-color-outline-variant)',
        fontWeight: 'bold',
        textAlign: 'center'
      }}>
        {t('common.physicalLocationsLegend')}
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '4px',
        padding: '8px',
        overflowY: 'auto'
      }}>
        {locations.map(([name, { code, color, bgColor }]) => (
          <div key={code} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontWeight: 900,
              padding: '2px 4px',
              borderRadius: '4px',
              backgroundColor: color,
              color: bgColor,
              fontSize: '9px',
              minWidth: '24px',
              textAlign: 'center'
            }}>
              {code}
            </span>
            <span>{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
