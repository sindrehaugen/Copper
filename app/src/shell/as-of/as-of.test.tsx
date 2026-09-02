import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { useAsOfStore, getAsOfQueryParam, assertNotAsOfMode } from './asOfStore';
import { AsOfControl } from './AsOfControl';
import { GlobalBar } from '../GlobalBar';
import { useDocumentStore, StoreApiClient } from '../../store/documentStore';
import type { DesignDocument } from '../../model/schema';
import '../../locales/i18n';

const mockDoc: DesignDocument = {
  designLabel: 'Test Design',
  revision: 1,
  sites: [{ id: 'site-1', name: 'Main Site' }],
  locations: [],
  racks: [],
  deviceTypes: [],
  devices: [{ id: 'dev-1', name: 'Amplifier 1', deviceType: 'amp', location: 'loc-1' }],
  cables: [],
  signalClasses: []
};

const mockClient: StoreApiClient = {
  authorTopology: vi.fn().mockResolvedValue(undefined),
  validateDesignGraph: vi.fn().mockResolvedValue({ valid: true, findings: [] })
};

describe('As-Of Mode (SH.W5 / Batch 133)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAsOfStore.getState().clearAsOf();
    useDocumentStore.getState().reset();
    useDocumentStore.getState().loadDocument(mockDoc);
    document.body.removeAttribute('data-as-of-mode');
    document.body.removeAttribute('data-as-of');
  });

  describe('1. Global Mutation Disabling & Read Envelope in as-of Mode', () => {
    it('allows document mutations and returns empty read envelope when as-of is inactive (live mode)', async () => {
      expect(useAsOfStore.getState().asOf).toBeNull();
      expect(useAsOfStore.getState().isAsOfActive()).toBe(false);
      expect(getAsOfQueryParam()).toEqual({});
      expect(() => assertNotAsOfMode()).not.toThrow();

      // Mutation via updateDocument
      act(() => {
        useDocumentStore.getState().updateDocument((draft) => {
          draft.designLabel = 'Updated Live Design';
        });
      });
      expect(useDocumentStore.getState().document?.designLabel).toBe('Updated Live Design');

      // Mutation via saveDocument
      await act(async () => {
        await useDocumentStore.getState().saveDocument(mockClient, 'default', 'test-actor');
      });
      expect(mockClient.authorTopology).toHaveBeenCalledTimes(1);

      // Mutation via promoteDocument
      await act(async () => {
        await useDocumentStore.getState().promoteDocument(mockClient, 'default', 'test-actor', 'quoted');
      });
      expect(mockClient.authorTopology).toHaveBeenCalledTimes(2);
    });

    it('strictly disables all mutation operations globally when as-of is set and attaches parse_as_of read envelope', async () => {
      const historicalTimestamp = '2026-08-15T10:00:00Z';
      
      act(() => {
        useAsOfStore.getState().setAsOf(historicalTimestamp);
      });

      expect(useAsOfStore.getState().asOf).toBe(historicalTimestamp);
      expect(useAsOfStore.getState().isAsOfActive()).toBe(true);
      expect(getAsOfQueryParam()).toEqual({ parse_as_of: historicalTimestamp });
      expect(() => assertNotAsOfMode('testAction')).toThrow(/mutations are disabled in as-of mode/i);

      const initialLabel = useDocumentStore.getState().document?.designLabel;

      // 1. updateDocument must be blocked (no mutation applied)
      act(() => {
        useDocumentStore.getState().updateDocument((draft) => {
          draft.designLabel = 'Attempted Historical Mutation';
        });
      });
      expect(useDocumentStore.getState().document?.designLabel).toBe(initialLabel);

      // 2. undo / redo must be blocked
      act(() => {
        useDocumentStore.getState().undo();
      });
      expect(useDocumentStore.getState().document?.designLabel).toBe(initialLabel);

      // 3. saveDocument must throw / fail closed
      await expect(
        useDocumentStore.getState().saveDocument(mockClient, 'default', 'test-actor')
      ).rejects.toThrow(/as-of mode/i);
      expect(mockClient.authorTopology).not.toHaveBeenCalled();

      // 4. promoteDocument must throw / fail closed
      await expect(
        useDocumentStore.getState().promoteDocument(mockClient, 'default', 'test-actor', 'quoted')
      ).rejects.toThrow(/as-of mode/i);
      expect(mockClient.authorTopology).not.toHaveBeenCalled();
    });

    it('restores mutation operations when leaving as-of mode back to live', async () => {
      act(() => {
        useAsOfStore.getState().setAsOf('2026-08-15T10:00:00Z');
      });
      expect(useAsOfStore.getState().asOf).not.toBeNull();

      // Clear as-of back to live
      act(() => {
        useAsOfStore.getState().clearAsOf();
      });
      expect(useAsOfStore.getState().asOf).toBeNull();
      expect(useAsOfStore.getState().isAsOfActive()).toBe(false);
      expect(getAsOfQueryParam()).toEqual({});

      // Mutation succeeds again
      act(() => {
        useDocumentStore.getState().updateDocument((draft) => {
          draft.designLabel = 'Restored Live Edit';
        });
      });
      expect(useDocumentStore.getState().document?.designLabel).toBe('Restored Live Edit');

      await act(async () => {
        await useDocumentStore.getState().saveDocument(mockClient, 'default', 'test-actor');
      });
      expect(mockClient.authorTopology).toHaveBeenCalledTimes(1);
    });
  });

  describe('2. UI Amber Chrome State & Controls', () => {
    it('sets data-as-of-mode on body and reflects amber styling when active', () => {
      expect(document.body.getAttribute('data-as-of-mode')).toBeNull();

      act(() => {
        useAsOfStore.getState().setAsOf('2026-08-15T10:00:00Z');
      });

      expect(document.body.getAttribute('data-as-of-mode')).toBe('true');
      expect(document.body.getAttribute('data-as-of')).toBe('2026-08-15T10:00:00Z');

      act(() => {
        useAsOfStore.getState().clearAsOf();
      });

      expect(document.body.getAttribute('data-as-of-mode')).toBeNull();
      expect(document.body.getAttribute('data-as-of')).toBeNull();
    });

    it('renders AsOfControl and allows setting timestamp and returning to live', () => {
      render(<AsOfControl />);

      const toggleBtn = screen.getByTestId('as-of-toggle');
      expect(toggleBtn.textContent).toMatch(/now/i);

      // Open popover
      fireEvent.click(toggleBtn);
      expect(screen.getByTestId('as-of-popover')).toBeDefined();

      // Enter a timestamp
      const input = screen.getByTestId('as-of-input');
      fireEvent.change(input, { target: { value: '2026-08-20T14:30' } });

      // Apply as-of
      const applyBtn = screen.getByTestId('as-of-apply-btn');
      fireEvent.click(applyBtn);

      expect(useAsOfStore.getState().asOf).toContain('2026-08-20');
      expect(document.body.getAttribute('data-as-of-mode')).toBe('true');

      // Check toggle button reflects historical state
      expect(screen.getByTestId('as-of-toggle').className).toContain('as-of-active');

      // Re-open and click return to live
      fireEvent.click(screen.getByTestId('as-of-toggle'));
      const liveBtn = screen.getByTestId('as-of-live-btn');
      fireEvent.click(liveBtn);

      expect(useAsOfStore.getState().asOf).toBeNull();
      expect(document.body.getAttribute('data-as-of-mode')).toBeNull();
    });

    it('GlobalBar integrates AsOfControl, disables save button, and shows historical badge in as-of mode', () => {
      const handleSave = vi.fn();
      const { rerender } = render(
        <GlobalBar tenantId="tenant-alpha" onSave={handleSave} />
      );

      const saveBtn = screen.getByTestId('save-design-btn') as HTMLButtonElement;
      expect(saveBtn.disabled).toBe(false);

      // Activate as-of
      act(() => {
        useAsOfStore.getState().setAsOf('2026-08-15T10:00:00Z');
      });
      rerender(<GlobalBar tenantId="tenant-alpha" onSave={handleSave} />);

      // Save button must be disabled in historical view
      const disabledSaveBtn = screen.getByTestId('save-design-btn') as HTMLButtonElement;
      expect(disabledSaveBtn.disabled).toBe(true);
      expect(screen.getByTestId('as-of-historical-badge')).toBeDefined();

      // Click save should not trigger onSave when disabled
      fireEvent.click(disabledSaveBtn);
      expect(handleSave).not.toHaveBeenCalled();

      // Clear as-of
      act(() => {
        useAsOfStore.getState().clearAsOf();
      });
      rerender(<GlobalBar tenantId="tenant-alpha" onSave={handleSave} />);

      const restoredSaveBtn = screen.getByTestId('save-design-btn') as HTMLButtonElement;
      expect(restoredSaveBtn.disabled).toBe(false);
      expect(screen.queryByTestId('as-of-historical-badge')).toBeNull();
    });
  });
});
