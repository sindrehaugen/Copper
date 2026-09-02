import { vi } from 'vitest';
import enCommon from './src/locales/en/common.json';
import enNav from './src/locales/en/nav.json';
import enCompliance from './src/locales/en/compliance.json';
import enAcoustics from './src/locales/en/acoustics.json';

const resources: Record<string, any> = {
  ...enCommon,
  ...enNav,
  ...enCompliance,
  ...enAcoustics,
};
for (const [k, v] of Object.entries(enCompliance)) resources['compliance.' + k] = v;
for (const [k, v] of Object.entries(enAcoustics)) resources['acoustics.' + k] = v;
for (const [k, v] of Object.entries(enCommon)) resources['common.' + k] = v;
for (const [k, v] of Object.entries(enNav)) resources['nav.' + k] = v;

vi.mock('react-i18next', () => ({
  Trans: ({ children }: any) => children,
  initReactI18next: { type: '3rdParty', init: () => {} },
  useTranslation: () => ({ ready: true,
    t: (key: string, defaultValue?: string) => resources[key] || defaultValue || key.split('.').pop()
  })
}));