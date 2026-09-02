import { useTranslation } from 'react-i18next';
import React from 'react';
import { useLocale } from '../../locales/i18n';

export const SettingsPanel: React.FC = () => {
  const { language, region, timezone, setLanguage, setRegion, setTimezone } = useLocale();

  return (
    <div>
      <h2>{t('common.settings')}</h2>
      <div>
        <label>{t('common.language')}
          <input 
            data-testid="language-input"
            value={language} 
            onChange={(e) => setLanguage(e.target.value)} 
          />
        </label>
      </div>
      <div>
        <label>{t('common.region')}
          <input 
            data-testid="region-input"
            value={region} 
            onChange={(e) => setRegion(e.target.value)} 
          />
        </label>
      </div>
      <div>
        <label>{t('common.timezone')}
          <input 
            data-testid="timezone-input"
            value={timezone} 
            onChange={(e) => setTimezone(e.target.value)} 
          />
        </label>
      </div>
    </div>
  );
};

