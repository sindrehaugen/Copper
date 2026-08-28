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
    lng: 'nb-NO',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
