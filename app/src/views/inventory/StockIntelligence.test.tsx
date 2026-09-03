import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { StockIntelligence } from './StockIntelligence';
import { findingRegistry } from '../../shell/finding/registry';
import '../../locales/i18n';

describe('StockIntelligence', () => {
  beforeEach(() => {
    findingRegistry.clearAll();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders the StockIntelligence dashboard surface', () => {
    render(
      <MemoryRouter>
        <StockIntelligence />
      </MemoryRouter>
    );
    expect(screen.getByTestId('stock-intelligence-surface')).toBeTruthy();
  });
});
