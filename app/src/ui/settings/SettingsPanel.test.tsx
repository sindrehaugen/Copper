import { render, screen, fireEvent } from '@testing-library/react';
import { SettingsPanel } from './SettingsPanel';
import { LocaleProvider } from '../../locale/context';
import { describe, it, expect } from 'vitest';

describe('SettingsPanel', () => {
  it('updates language, region, and timezone on input change', () => {
    render(
      <LocaleProvider>
        <SettingsPanel />
      </LocaleProvider>
    );

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
