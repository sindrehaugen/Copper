// app/src/shell/index.test.tsx
import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { AppShell } from './index';
import { useDocumentStore } from '../store/documentStore';
import { expect, it, describe, afterEach, beforeEach, vi } from 'vitest';
vi.mock('@antv/x6', () => ({ Graph: vi.fn() }));
vi.mock('../views/acoustics/CalculatorsDrawer', () => ({ CalculatorsDrawer: () => <div data-testid="calculators-drawer"></div> }));
vi.mock('../views/canvas/CanvasView', () => ({ CanvasView: () => <div data-testid="canvas-view">Canvas</div> }));
import '../locales/i18n';

expect.extend(toHaveNoViolations);


beforeEach(() => {
  useDocumentStore.setState({ document: null });
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      namespace: 'test',
      actor: 'test-user',
      // And for the topology call:
      designLabel: 'test',
      revision: '1',
      sites: [], locations: [], racks: [], deviceTypes: [], devices: [], cables: [], signalClasses: []
    })
  }));
});

afterEach(() => {
  cleanup();
});

describe('AppShell', () => {
  it('renders the layout and navigation with correct translations', async () => {
    render(React.createElement(AppShell));
    const homeLinks = await screen.findAllByText('Canvas');
    expect(homeLinks.length).toBeGreaterThan(0);
  });

  it('is keyboard operable via tabbing', async () => {
    const user = userEvent.setup();
    render(React.createElement(AppShell));
    const homeLinks = await screen.findAllByText('Canvas');
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



