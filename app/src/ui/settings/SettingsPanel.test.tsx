import { render, screen, fireEvent } from '@testing-library/react';
import { SettingsPanel } from './SettingsPanel';
import { describe, it, expect, vi } from 'vitest';
import * as i18nModule from '../../locales/i18n';
import { useState } from 'react';

vi.mock('../../locales/i18n', async () => {
  const actual = await vi.importActual<any>('../../locales/i18n');
  return {
    ...actual,
    useLocale: vi.fn()
  };
});

describe('SettingsPanel', () => {
  it('updates language, region, and timezone on input change', () => {
    const Wrapper = () => {
      const [language, setLanguage] = useState('en');
      const [region, setRegion] = useState('US');
      const [timezone, setTimezone] = useState('UTC');
      vi.mocked(i18nModule.useLocale).mockReturnValue({
        language, region, timezone, setLanguage, setRegion, setTimezone
      });
      return <SettingsPanel />;
    };

    render(<Wrapper />);

    const langInput = screen.getByTestId('language-input');
    const regionInput = screen.getByTestId('region-input');
    const tzInput = screen.getByTestId('timezone-input');

    fireEvent.change(langInput, { target: { value: 'fr-FR' } });
    fireEvent.change(regionInput, { target: { value: 'EU' } });
    fireEvent.change(tzInput, { target: { value: 'Europe/Paris' } });

    expect((langInput as HTMLInputElement).value).toBe('fr-FR');
    expect((regionInput as HTMLInputElement).value).toBe('EU');
    expect((tzInput as HTMLInputElement).value).toBe('Europe/Paris');
  });
});