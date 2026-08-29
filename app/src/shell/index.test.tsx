// app/src/shell/index.test.tsx
import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { AppShell } from './index';
import { expect, it, describe, afterEach } from 'vitest';
import '../locales/i18n';

expect.extend(toHaveNoViolations);

afterEach(() => {
  cleanup();
});

describe('AppShell', () => {
  it('renders the layout and navigation with correct translations', async () => {
    render(React.createElement(AppShell));
    const homeLinks = await screen.findAllByText('Hjem');
    expect(homeLinks.length).toBeGreaterThan(0);
  });

  it('is keyboard operable via tabbing', async () => {
    const user = userEvent.setup();
    render(React.createElement(AppShell));
    const homeLinks = await screen.findAllByText('Hjem');
    const homeLink = homeLinks[0];
    
    // Start at document body
    await user.tab();
    expect(document.activeElement).toBe(homeLink);
  });

  it('has no a11y violations', async () => {
    const { container } = render(React.createElement(AppShell));
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
