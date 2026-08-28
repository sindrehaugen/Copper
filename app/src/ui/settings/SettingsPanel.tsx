import React from 'react';
import { useLocale } from '../../locale/context';

export const SettingsPanel: React.FC = () => {
  const { language, region, timezone, setLanguage, setRegion, setTimezone } = useLocale();

  return (
    <div>
      <h2>Settings</h2>
      <div>
        <label>Language:</label>
        <input 
          data-testid="language-input"
          value={language} 
          onChange={(e) => setLanguage(e.target.value)} 
        />
      </div>
      <div>
        <label>Region:</label>
        <input 
          data-testid="region-input"
          value={region} 
          onChange={(e) => setRegion(e.target.value)} 
        />
      </div>
      <div>
        <label>Timezone:</label>
        <input 
          data-testid="timezone-input"
          value={timezone} 
          onChange={(e) => setTimezone(e.target.value)} 
        />
      </div>
    </div>
  );
};
