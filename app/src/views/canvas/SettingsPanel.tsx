import React from 'react';
import { useSettingsStore } from '../../store/settingsStore';
import { useTranslation } from 'react-i18next';

export const SettingsPanel: React.FC = () => {
  const settings = useSettingsStore();
  const { t } = useTranslation();

  return (
    <div className="copper-settings-panel" style={{
      position: 'absolute',
      top: 16,
      right: 16,
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      width: '280px'
    }}>
      <h3 style={{ margin: 0, fontSize: 'var(--md-sys-typescale-title-small-font-size)', borderBottom: '1px solid var(--md-sys-color-outline-variant)', paddingBottom: '8px' }}>
        {t('common.canvasSettings')}
      </h3>
      
      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: 'var(--md-sys-typescale-label-medium-font-size)', color: 'var(--md-sys-color-on-surface-variant)' }}>
          {t('common.wireSpacing')} {settings.wireSpacing}px
        </label>
        <input 
          type="range" aria-label="Canvas setting parameter" min="2" max="40" value={settings.wireSpacing}
          onChange={(e) => settings.setWireSpacing(Number(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--md-sys-color-primary)' }}
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: 'var(--md-sys-typescale-label-medium-font-size)', color: 'var(--md-sys-color-on-surface-variant)' }}>
          {t('common.terminalPadding')} {settings.portPadding}px
        </label>
        <input 
          type="range" aria-label="Canvas setting parameter" min="10" max="100" value={settings.portPadding}
          onChange={(e) => settings.setPortPadding(Number(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--md-sys-color-primary)' }}
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: 'var(--md-sys-typescale-label-medium-font-size)', color: 'var(--md-sys-color-on-surface-variant)' }}>
          {t('common.terminalSpacing')} {settings.terminalSpacing}px
        </label>
        <input 
          type="range" aria-label="Canvas setting parameter" min="10" max="40" value={settings.terminalSpacing}
          onChange={(e) => settings.setTerminalSpacing(Number(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--md-sys-color-primary)' }}
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: 'var(--md-sys-typescale-label-medium-font-size)', color: 'var(--md-sys-color-on-surface-variant)' }}>
          {t('common.terminalFontSize')} {settings.terminalFontSize}px
        </label>
        <input 
          type="range" aria-label="Canvas setting parameter" min="6" max="16" value={settings.terminalFontSize}
          onChange={(e) => settings.setTerminalFontSize(Number(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--md-sys-color-primary)' }}
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: 'var(--md-sys-typescale-label-medium-font-size)', color: 'var(--md-sys-color-on-surface-variant)' }}>
          {t('common.headerFontSize')} {settings.headerFontSize}px
        </label>
        <input 
          type="range" aria-label="Canvas setting parameter" min="8" max="20" value={settings.headerFontSize}
          onChange={(e) => settings.setHeaderFontSize(Number(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--md-sys-color-primary)' }}
        />
      </div>

      <div style={{ borderTop: '1px solid var(--md-sys-color-outline-variant)', paddingTop: '12px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: 'var(--md-sys-typescale-label-large-font-size)' }}>
          <input 
            type="checkbox" 
            checked={settings.showCableLabels}
            onChange={(e) => settings.setShowCableLabels(e.target.checked)}
            style={{ accentColor: 'var(--md-sys-color-primary)' }}
          />
          {t('common.showCableLabels')}
        </label>

        {settings.showCableLabels && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '24px', fontSize: 'var(--md-sys-typescale-label-medium-font-size)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input 
                type="radio" name="cableLabelPos" value="start"
                checked={settings.cableLabelPosition === 'start'}
                onChange={() => settings.setCableLabelPosition('start')}
                style={{ accentColor: 'var(--md-sys-color-primary)' }}
              /> {t('common.start')}
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input 
                type="radio" name="cableLabelPos" value="middle"
                checked={settings.cableLabelPosition === 'middle'}
                onChange={() => settings.setCableLabelPosition('middle')}
                style={{ accentColor: 'var(--md-sys-color-primary)' }}
              /> {t('common.middle')}
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input 
                type="radio" name="cableLabelPos" value="end"
                checked={settings.cableLabelPosition === 'end'}
                onChange={() => settings.setCableLabelPosition('end')}
                style={{ accentColor: 'var(--md-sys-color-primary)' }}
              /> {t('common.end')}
            </label>
          </div>
        )}
      </div>
    </div>
  );
};



