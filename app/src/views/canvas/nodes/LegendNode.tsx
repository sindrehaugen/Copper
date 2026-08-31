import React from 'react';
import { PHYSICAL_LOCATIONS } from '../../../model/locations';

export const LegendNodeComponent: React.FC = () => {
  const locations = Object.entries(PHYSICAL_LOCATIONS).filter(([name]) => name !== 'Unknown');

  return (
    <div style={{
      width: '100%',
      height: '100%',
      backgroundColor: 'var(--md-sys-color-surface, #ffffff)',
      color: 'var(--md-sys-color-on-surface, #1c1b1f)',
      border: '1px solid var(--md-sys-color-outline-variant, #cac4d0)',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: 'var(--md-sys-elevation-level-1, 0px 1px 3px 1px rgba(0, 0, 0, 0.15))',
      fontFamily: 'var(--md-sys-typescale-body-medium-font-family, sans-serif)',
      fontSize: '10px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{
        padding: '8px',
        backgroundColor: 'var(--md-sys-color-surface-container-high, #ece6f0)',
        borderBottom: '1px solid var(--md-sys-color-outline-variant, #cac4d0)',
        fontWeight: 'bold',
        textAlign: 'center'
      }}>
        Physical Locations Legend
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
