import React from 'react';
import { useLocale } from '../../locales/i18n';

export const SettingsPanel: React.FC = () => {
  const { language, region, timezone, setLanguage, setRegion, setTimezone } = useLocale();

  return (
    <div>
      <h2>Settings</h2>
      <div>
        <label>Language:
          <input 
            data-testid="language-input"
            value={language} 
            onChange={(e) => setLanguage(e.target.value)} 
          />
        </label>
      </div>
      <div>
        <label>Region:
          <input 
            data-testid="region-input"
            value={region} 
            onChange={(e) => setRegion(e.target.value)} 
          />
        </label>
      </div>
      <div>
        <label>Timezone:
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

