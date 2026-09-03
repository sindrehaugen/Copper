import { afterEach, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { useDocumentStore } from './src/store/documentStore';
import { useSettingsStore } from './src/store/settingsStore';

// Existing imports
import enCommon from './src/locales/en/common.json';
import enNav from './src/locales/en/nav.json';
import enCompliance from './src/locales/en/compliance.json';
import enAcoustics from './src/locales/en/acoustics.json';
import enSourcing from './src/locales/en/sourcing.json';

const resources: Record<string, any> = {
  ...enCommon,
  ...enNav,
  ...enCompliance,
  ...enAcoustics,
  ...enSourcing,
};
for (const [k, v] of Object.entries(enCompliance)) resources['compliance.' + k] = v;
for (const [k, v] of Object.entries(enAcoustics)) resources['acoustics.' + k] = v;
for (const [k, v] of Object.entries(enCommon)) resources['common.' + k] = v;
for (const [k, v] of Object.entries(enNav)) resources['nav.' + k] = v;
for (const [k, v] of Object.entries(enSourcing)) resources['sourcing.' + k] = v;

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((prev, curr) => (prev && typeof prev === 'object' ? prev[curr] : undefined), obj);
}

vi.mock('react-i18next', () => ({
  Trans: ({ children }: any) => children,
  initReactI18next: { type: '3rdParty', init: () => {} },
  useTranslation: () => ({ ready: true,
    t: (key: string, defaultValue?: string) => resources[key] || getNestedValue(resources, key) || defaultValue || key.split('.').pop()
  })
}));

// Suppress R3F casing warnings in tests
const originalConsoleError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' && 
    (args[0].includes('is using incorrect casing') || args[0].includes('The tag <'))
  ) {
    return;
  }
  originalConsoleError(...args);
};

// Global Zustand reset
const initialDocumentState = useDocumentStore.getState();
const initialSettingsState = useSettingsStore.getState();

afterEach(() => {
  useDocumentStore.setState(initialDocumentState, true);
  useSettingsStore.setState(initialSettingsState, true);
});
