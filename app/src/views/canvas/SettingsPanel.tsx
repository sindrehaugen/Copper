import React from 'react';
import { useSettingsStore } from '../../store/settingsStore';

export const SettingsPanel: React.FC = () => {
  const settings = useSettingsStore();

  return (
    <div style={{
      position: 'absolute',
      top: 10,
      right: 10,
      background: 'white',
      padding: '16px',
      border: '1px solid #ccc',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      zIndex: 1000,
      fontFamily: 'sans-serif',
      fontSize: '12px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      width: '250px'
    }}>
      <h3 style={{ margin: 0, fontSize: '14px', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>Canvas Settings</h3>
      
      <div>
        <label style={{ display: 'block', marginBottom: '4px' }}>Wire Spacing (px): {settings.wireSpacing}</label>
        <input 
          type="range" min="2" max="40" value={settings.wireSpacing}
          onChange={(e) => settings.setWireSpacing(Number(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '4px' }}>Terminal Spacing (px): {settings.terminalSpacing}</label>
        <input 
          type="range" min="10" max="40" value={settings.terminalSpacing}
          onChange={(e) => settings.setTerminalSpacing(Number(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '4px' }}>Terminal Font Size (px): {settings.terminalFontSize}</label>
        <input 
          type="range" min="6" max="16" value={settings.terminalFontSize}
          onChange={(e) => settings.setTerminalFontSize(Number(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '4px' }}>Header Font Size (px): {settings.headerFontSize}</label>
        <input 
          type="range" min="8" max="20" value={settings.headerFontSize}
          onChange={(e) => settings.setHeaderFontSize(Number(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>

      <div style={{ borderTop: '1px solid #eee', paddingTop: '8px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <input 
            type="checkbox" 
            checked={settings.showCableLabels}
            onChange={(e) => settings.setShowCableLabels(e.target.checked)}
          />
          Show Cable Labels
        </label>

        {settings.showCableLabels && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '24px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <input 
                type="radio" name="cableLabelPos" value="start"
                checked={settings.cableLabelPosition === 'start'}
                onChange={() => settings.setCableLabelPosition('start')}
              /> Start
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <input 
                type="radio" name="cableLabelPos" value="middle"
                checked={settings.cableLabelPosition === 'middle'}
                onChange={() => settings.setCableLabelPosition('middle')}
              /> Middle
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <input 
                type="radio" name="cableLabelPos" value="end"
                checked={settings.cableLabelPosition === 'end'}
                onChange={() => settings.setCableLabelPosition('end')}
              /> End
            </label>
          </div>
        )}
      </div>

    </div>
  );
};
