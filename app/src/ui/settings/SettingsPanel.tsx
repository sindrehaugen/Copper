// app/src/ui/settings/SettingsPanel.tsx
import React from 'react';
import { useLocale } from '../../locale/context';
import { useTranslation } from 'react-i18next';

export const SettingsPanel: React.FC = () => {
  const { language, region, timezone, setLanguage, setRegion, setTimezone } = useLocale();
  const { t } = useTranslation();

  return (
    <div>
      <h2>{t('settings.title', 'Settings')}</h2>
      <div>
        <label>{t('settings.language', 'Language:')}</label>
        <input 
          data-testid="language-input"
          value={language} 
          onChange={(e) => setLanguage(e.target.value)} 
        />
      </div>
      <div>
        <label>{t('settings.region', 'Region:')}</label>
        <input 
          data-testid="region-input"
          value={region} 
          onChange={(e) => setRegion(e.target.value)} 
        />
      </div>
      <div>
        <label>{t('settings.timezone', 'Timezone:')}</label>
        <input 
          data-testid="timezone-input"
          value={timezone} 
          onChange={(e) => setTimezone(e.target.value)} 
        />
      </div>
    </div>
  );
};
