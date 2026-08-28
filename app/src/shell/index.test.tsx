/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { AppShell } from './index';
import '../locales/i18n';

describe('AppShell', () => {
  it('renders the layout and navigation with correct translations', async () => {
    render(React.createElement(AppShell));
    
    // Check if navigation home is rendered
    // The translation key is 'nav.home' -> 'Hjem' (in nb-NO which is default)
    // To satisfy the mutation test, we check for 'Hjem', so if the key is broken,
    // it will render 'nav.home' and the test will fail.
    const homeLinks = await screen.findAllByText('Hjem');
    expect(homeLinks.length).toBeGreaterThan(0);
  });
});
