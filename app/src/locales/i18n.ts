import React, { createContext, useContext, useState, useEffect } from 'react';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en_nav from './en/nav.json';
import nbNO_nav from './nb-NO/nav.json';
import en_common from './en/common.json';
import nbNO_common from './nb-NO/common.json';
import en_errors from './en/errors.json';
import nbNO_errors from './nb-NO/errors.json';
import en_acoustics from './en/acoustics.json';
import nbNO_acoustics from './nb-NO/acoustics.json';
import en_compliance from './en/compliance.json';
import nbNO_compliance from './nb-NO/compliance.json';
import en_problems from './en/problems.json';
import nbNO_problems from './nb-NO/problems.json';
import en_subarray from './en/subarray.json';
import nbNO_subarray from './nb-NO/subarray.json';

const resources = {
  en: {
    translation: {
      nav: en_nav,
      common: en_common,
      errors: en_errors,
      acoustics: en_acoustics,
      compliance: en_compliance,
      problems: en_problems,
      subarray: en_subarray
    }
  },
  'nb-NO': {
    translation: {
      nav: nbNO_nav,
      common: nbNO_common,
      errors: nbNO_errors,
      acoustics: nbNO_acoustics,
      compliance: nbNO_compliance,
      problems: nbNO_problems,
      subarray: nbNO_subarray
    }
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'nb-NO'],
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'copper_language',
      caches: ['localStorage']
    },
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

const getBrowserTimezone = () => {
  if (typeof Intl !== 'undefined') {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
  return 'UTC';
};

export const LocaleContext = createContext<LocaleContextType>({
  language: 'en',
  region: 'US',
  timezone: 'UTC',
  setLanguage: () => {},
  setRegion: () => {},
  setTimezone: () => {},
});

export const LocaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState(i18n.resolvedLanguage || 'en');

  useEffect(() => {
    const handleLanguageChanged = (lng: string) => {
      setLanguageState(lng);
    };
    i18n.on('languageChanged', handleLanguageChanged);
    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, []);

  const [region, setRegionState] = useState(() => {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('copper_region') || 'US';
    }
    return 'US';
  });

  const [timezone, setTimezoneState] = useState(() => {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('copper_timezone') || getBrowserTimezone();
    }
    return getBrowserTimezone();
  });

  const setLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
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
  if (locale.includes('EU') || locale.includes('FR') || locale.includes('DE') || locale.includes('NO')) return 'EU';
  return 'GLOBAL';
}
