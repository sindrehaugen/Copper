/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import reactAxe from '@axe-core/react';
import * as ReactDOM from 'react-dom';

import { AppShell } from './index';
import '../locales/i18n';

describe('AppShell', () => {
  it('renders the layout and navigation with correct translations', async () => {
    render(React.createElement(AppShell));
    const homeLinks = await screen.findAllByText('Hjem');
    expect(homeLinks.length).toBeGreaterThan(0);
  });

  it('has no a11y violations', async () => {
    render(React.createElement(AppShell));
    await new Promise<void>((resolve, reject) => {
      reactAxe(React, ReactDOM, 0, {}, undefined, (results) => {
        try {
          expect(results.violations).toEqual([]);
          resolve();
        } catch(e) {
          reject(e);
        }
      });
    });
  });

  it('is keyboard operable', async () => {
    render(React.createElement(AppShell));
    const homeLinks = await screen.findAllByText('Hjem');
    const firstLink = homeLinks[0];
    if (firstLink) {
      firstLink.focus();
      expect(document.activeElement).toBe(firstLink);
    }
  });
});
