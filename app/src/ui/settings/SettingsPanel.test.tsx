// app/src/ui/settings/SettingsPanel.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { SettingsPanel } from './SettingsPanel';
import { LocaleProvider, LocaleContext } from '../../locale/context';
import { describe, it, expect } from 'vitest';
import { useContext } from 'react';

// A mock consumer to observe context changes
const ContextObserver = () => {
  const { language, region, timezone } = useContext(LocaleContext);
  return (
    <div data-testid="observer">
      <span data-testid="obs-lang">{language}</span>
      <span data-testid="obs-reg">{region}</span>
      <span data-testid="obs-tz">{timezone}</span>
    </div>
  );
};

describe('SettingsPanel', () => {
  it('updates language, region, and timezone on input change', () => {
    render(
      <LocaleProvider>
        <SettingsPanel />
        <ContextObserver />
      </LocaleProvider>
    );

    const langInput = screen.getByTestId('language-input');
    const regionInput = screen.getByTestId('region-input');
    const tzInput = screen.getByTestId('timezone-input');

    fireEvent.change(langInput, { target: { value: 'fr-FR' } });
    fireEvent.change(regionInput, { target: { value: 'EU' } });
    fireEvent.change(tzInput, { target: { value: 'Europe/Paris' } });

    expect(screen.getByTestId('obs-lang').textContent).toBe('fr-FR');
    expect(screen.getByTestId('obs-reg').textContent).toBe('EU');
    expect(screen.getByTestId('obs-tz').textContent).toBe('Europe/Paris');
  });
});
