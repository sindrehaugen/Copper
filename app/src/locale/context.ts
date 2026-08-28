import React, { createContext, useContext, useState } from 'react';

interface LocaleContextType {
  language: string;
  region: string;
  timezone: string;
  setLanguage: (lang: string) => void;
  setRegion: (region: string) => void;
  setTimezone: (tz: string) => void;
}

const getBrowserLocale = () => {
  if (typeof navigator !== 'undefined' && navigator.language) {
    return navigator.language;
  }
  return 'en-US';
};

const getBrowserTimezone = () => {
  if (typeof Intl !== 'undefined') {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
  return 'UTC';
};

export const LocaleContext = createContext<LocaleContextType>({
  language: 'en-US',
  region: 'en-US',
  timezone: 'UTC',
  setLanguage: () => {},
  setRegion: () => {},
  setTimezone: () => {},
});

export const LocaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('copper_language') || getBrowserLocale();
    }
    return getBrowserLocale();
  });

  const [region, setRegionState] = useState(() => {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('copper_region') || getBrowserLocale();
    }
    return getBrowserLocale();
  });

  const [timezone, setTimezoneState] = useState(() => {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('copper_timezone') || getBrowserTimezone();
    }
    return getBrowserTimezone();
  });

  const setLanguage = (lang: string) => {
    if (typeof localStorage !== 'undefined') localStorage.setItem('copper_language', lang);
    setLanguageState(lang);
  };

  const setRegion = (reg: string) => {
    if (typeof localStorage !== 'undefined') localStorage.setItem('copper_region', reg);
    setRegionState(reg);
  };

  const setTimezone = (tz: string) => {
    if (typeof localStorage !== 'undefined') localStorage.setItem('copper_timezone', tz);
    setTimezoneState(tz);
  };

  return React.createElement(
    LocaleContext.Provider,
    { value: { language, region, timezone, setLanguage, setRegion, setTimezone } },
    children
  );
};

export const useLocale = () => useContext(LocaleContext);
