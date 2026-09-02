import React, { createContext, useContext, useState } from 'react';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import nbNO from './nb-NO.json';

const resources = {
  en: {
    translation: en,
  },
  'nb-NO': {
    translation: nbNO,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;



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

export function formatCurrency(amount: number, locale: string): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR' }).format(amount);
}

export function formatDate(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale).format(date);
}

export function getComplianceRegion(locale: string): string {
  if (locale.includes('US')) return 'US';
  if (locale.includes('EU') || locale.includes('FR') || locale.includes('DE')) return 'EU';
  return 'GLOBAL';
}

