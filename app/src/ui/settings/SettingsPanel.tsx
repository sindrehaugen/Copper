import React from 'react';
import { useLocale } from '../../locale/context';

export const SettingsPanel: React.FC = () => {
  const { language, region, timezone, setLanguage, setRegion, setTimezone } = useLocale();

  return (
    <div>
      <h2>Settings</h2>
      <div>
        <label htmlFor="language-input">Language:</label>
        <input 
          id="language-input"
          data-testid="language-input"
          value={language} 
          onChange={(e) => setLanguage(e.target.value)} 
        />
      </div>
      <div>
        <label htmlFor="region-input">Region:</label>
        <input 
          id="region-input"
          data-testid="region-input"
          value={region} 
          onChange={(e) => setRegion(e.target.value)} 
        />
      </div>
      <div>
        <label htmlFor="timezone-input">Timezone:</label>
        <input 
          id="timezone-input"
          data-testid="timezone-input"
          value={timezone} 
          onChange={(e) => setTimezone(e.target.value)} 
        />
      </div>
    </div>
  );
};
