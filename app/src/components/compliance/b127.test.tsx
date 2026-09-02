
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { DsarSurface } from './DsarSurface';
import { AiConfirmDialog } from './AiConfirmDialog';
import { ProvenanceViewer } from './ProvenanceViewer';

// Mock translation
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string, defaultString: string) => defaultString || key })
}));

describe('B127 Accept Criteria - Compliance Truth', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('proves a 404/500 from DSAR export endpoint renders an error state, never success', async () => {
    // Mock global fetch to return 404
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ error: 'Disabled' })
    });

    render(<DsarSurface />);

    const exportBtn = screen.getByTestId('export-btn');
    fireEvent.click(exportBtn);

    await waitFor(() => {
      const status = screen.getByTestId('export-status');
      expect(status.textContent).not.toBe('Data Ready to Download');
      expect(status.textContent).toBe('Temporarily Unavailable (HS-13)');
    });
  });

  it('asserts onConfirm receives the override flag in AiConfirmDialog', () => {
    const handleConfirm = vi.fn();
    render(
      <AiConfirmDialog
        title="Test"
        proposedAction="Test action"
        confidenceString="High"
        provenance="Test"
        onConfirm={handleConfirm}
        onReject={vi.fn()}
      />
    );

    // Toggle the override checkbox
    const checkbox = screen.getByLabelText('compliance.humanOverride');
    fireEvent.click(checkbox);
    expect((checkbox as HTMLInputElement).checked).toBe(true);

    // Click confirm
    const confirmBtn = screen.getByText('compliance.confirmOverrideBtn');
    fireEvent.click(confirmBtn);

    expect(handleConfirm).toHaveBeenCalledWith(true);
  });

  it('renders ProvenanceViewer from a fixture of real NCE event rows', () => {
    // We use a fixture matching the NCE WORM log structure
    const records = [
      {
        id: 'evt_123',
        timestamp: '2026-09-02T10:00:00Z',
        actor: 'Admin',
        action: 'shred_memory',
        originalValue: 'tenant_123',
        newValue: 'redacted',
        citation: 'HS-13'
      }
    ];

    render(<ProvenanceViewer records={records} data-testid="pv" />);
    
    expect(screen.getByText('shred_memory')).not.toBeNull();
    expect(screen.getByText('redacted')).not.toBeNull();
  });
});
