import React from 'react';
import { render, screen } from '@testing-library/react';
import { expect, it, describe, vi } from 'vitest';
import { LedWallDesigner } from '../LedWallDesigner';
import '../../../locales/i18n';

describe('LedWallDesigner', () => {
  it('renders without crashing and shows calculation defaults', () => {
    render(<LedWallDesigner />);
    
    // Check if the title is there
    expect(screen.getByText('LED Wall Power & Signal Planner')).toBeTruthy();

    // Check if the output defaults are shown
    expect(screen.getByText('Normal Power Load')).toBeTruthy();
  });
});
