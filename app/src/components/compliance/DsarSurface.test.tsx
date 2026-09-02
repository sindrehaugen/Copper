import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DsarSurface } from './DsarSurface';

// Mock fetch globally
global.fetch = vi.fn();

describe('DsarSurface', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('handles data export request correctly', async () => {
    (global.fetch as any).mockResolvedValueOnce({ ok: true });

    render(<DsarSurface />);
    
    const exportBtn = screen.getByTestId('export-btn');
    fireEvent.click(exportBtn);

    expect(screen.getByTestId('export-status').textContent).toContain('Request Pending');
    
    await waitFor(() => {
      expect(screen.getByTestId('export-status').textContent).toContain('Data Ready to Download');
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/me/dsar/export');
  });

  it('handles data deletion request correctly', async () => {
    (global.fetch as any).mockResolvedValueOnce({ ok: true });

    render(<DsarSurface />);
    
    const deleteBtn = screen.getByTestId('delete-btn');
    fireEvent.click(deleteBtn);

    const confirmBtn = screen.getByText('Approve AI Action');
    fireEvent.click(confirmBtn);
    expect(screen.getByTestId('delete-status').textContent).toContain('Request Pending');
    
    await waitFor(() => {
      expect(screen.getByTestId('delete-status').textContent).toContain('Deletion Request Received');
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/me/dsar/erase', { method: 'POST' });
  });
});



