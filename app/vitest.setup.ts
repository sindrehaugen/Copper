import { vi } from 'vitest';
import * as enCommon from './src/locales/en/common.json';
import * as enCompliance from './src/locales/en/compliance.json';
import * as enAcoustics from './src/locales/en/acoustics.json';

const resources: Record<string, any> = {
  ...enCommon,
  ...enCompliance,
  ...enAcoustics,
};
for (const [k, v] of Object.entries(enCompliance)) resources[\compliance.\\] = v;
for (const [k, v] of Object.entries(enAcoustics)) resources[\coustics.\\] = v;
for (const [k, v] of Object.entries(enCommon)) resources[\common.\\] = v;

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => resources[key] || key.split('.').pop()
  })
}));
