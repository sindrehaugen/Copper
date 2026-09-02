import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CalculatorsDrawer } from './CalculatorsDrawer';

describe('CalculatorsDrawer', () => {
  it('renders environment fields and initial speed of sound', async () => {
    render(<CalculatorsDrawer />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /Calculators/i }));
    // "Speed of sound" is displayed (fallback text)
    expect(screen.getAllByText(/Speed of sound/i).length).toBeGreaterThan(0);
    
    // Test the specific default c value ~ 343.99 m/s at 20C, 50% RH, 101325 Pa
    expect(screen.getAllByText(/343\.99/).length).toBeGreaterThan(0);
  });
  
  it('renders credit card verbatim with link to Merlijn van Veen', async () => {
    render(<CalculatorsDrawer />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /Calculators/i }));
    expect(screen.getAllByText(/Merlijn van Veen/i).length).toBeGreaterThan(0);
    const link = screen.getAllByRole('link', { name: /Merlijn van Veen/i })[0];
    expect(link?.getAttribute('href')).toBe('https://www.merlijnvanveen.nl/en/calculators');
  });
});







