// @vitest-environment jsdom
import React, { useState } from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { DataGrid } from '../DataGrid';
import { useBulkSelection, createSelectionColumnDef } from './useBulkSelection';
import {
  GridBulkActions,
  useBulkGovernedActions,
  generateBulkIdempotencyKey,
  type BulkActionDef,
  type BulkExecutionSummary,
} from './GridBulkActions';

interface MockItem {
  id: string;
  name: string;
  category: string;
  status: string;
}

const mockData: MockItem[] = [
  { id: 'item-1', name: 'Microphone A', category: 'Audio', status: 'active' },
  { id: 'item-2', name: 'Speaker B', category: 'Audio', status: 'draft' },
  { id: 'item-3', name: 'Switch C', category: 'Network', status: 'active' },
  { id: 'item-4', name: 'Camera D', category: 'Video', status: 'active' },
];

describe('Grid Bulk Actions & Multi-Select (GR.W3 / B148)', () => {
  afterEach(() => {
    cleanup();
  });

  describe('useBulkSelection hook', () => {
    function TestComponent({ data = mockData }: { data?: MockItem[] }) {
      const selection = useBulkSelection<MockItem>({
        getRowId: (item) => item.id,
      });

      return (
        <div>
          <span data-testid="selected-count">{selection.selectedCount}</span>
          <button data-testid="select-all-btn" onClick={() => selection.selectAll(data)}>
            Select All
          </button>
          <button data-testid="clear-btn" onClick={() => selection.clearSelection()}>
            Clear
          </button>
          <button data-testid="toggle-item-1" onClick={() => selection.toggle('item-1')}>
            Toggle Item 1
          </button>
          <button data-testid="toggle-item-2" onClick={() => selection.toggle('item-2')}>
            Toggle Item 2
          </button>
          <button data-testid="select-item-3" onClick={() => selection.select('item-3')}>
            Select Item 3
          </button>
          <button data-testid="deselect-item-1" onClick={() => selection.deselect('item-1')}>
            Deselect Item 1
          </button>
          <span data-testid="is-item-1-selected">
            {selection.isSelected('item-1') ? 'yes' : 'no'}
          </span>
          <span data-testid="is-all-selected">
            {selection.isAllSelected(data) ? 'yes' : 'no'}
          </span>
          <span data-testid="is-indeterminate">
            {selection.isIndeterminate(data) ? 'yes' : 'no'}
          </span>
          <div data-testid="selected-ids">
            {Array.from(selection.selectedIds).join(',')}
          </div>
          <div data-testid="selected-items-count">
            {selection.getSelectedItems(data).length}
          </div>
        </div>
      );
    }

    it('initializes with empty selection and handles toggle, select, deselect, selectAll, clearSelection', () => {
      render(<TestComponent />);
      expect(screen.getByTestId('selected-count').textContent).toBe('0');
      expect(screen.getByTestId('is-item-1-selected').textContent).toBe('no');
      expect(screen.getByTestId('is-all-selected').textContent).toBe('no');
      expect(screen.getByTestId('is-indeterminate').textContent).toBe('no');

      // Toggle item 1
      fireEvent.click(screen.getByTestId('toggle-item-1'));
      expect(screen.getByTestId('selected-count').textContent).toBe('1');
      expect(screen.getByTestId('is-item-1-selected').textContent).toBe('yes');
      expect(screen.getByTestId('is-all-selected').textContent).toBe('no');
      expect(screen.getByTestId('is-indeterminate').textContent).toBe('yes');
      expect(screen.getByTestId('selected-ids').textContent).toBe('item-1');
      expect(screen.getByTestId('selected-items-count').textContent).toBe('1');

      // Toggle item 2
      fireEvent.click(screen.getByTestId('toggle-item-2'));
      expect(screen.getByTestId('selected-count').textContent).toBe('2');
      expect(screen.getByTestId('is-indeterminate').textContent).toBe('yes');

      // Direct select item 3
      fireEvent.click(screen.getByTestId('select-item-3'));
      expect(screen.getByTestId('selected-count').textContent).toBe('3');

      // Deselect item 1
      fireEvent.click(screen.getByTestId('deselect-item-1'));
      expect(screen.getByTestId('selected-count').textContent).toBe('2');
      expect(screen.getByTestId('is-item-1-selected').textContent).toBe('no');

      // Select All
      fireEvent.click(screen.getByTestId('select-all-btn'));
      expect(screen.getByTestId('selected-count').textContent).toBe('4');
      expect(screen.getByTestId('is-all-selected').textContent).toBe('yes');
      expect(screen.getByTestId('is-indeterminate').textContent).toBe('no');

      // Clear
      fireEvent.click(screen.getByTestId('clear-btn'));
      expect(screen.getByTestId('selected-count').textContent).toBe('0');
      expect(screen.getByTestId('is-all-selected').textContent).toBe('no');
      expect(screen.getByTestId('is-indeterminate').textContent).toBe('no');
    });

    it('integrates with DataGrid via createSelectionColumnDef', () => {
      function GridWithSelection() {
        const selection = useBulkSelection<MockItem>({
          getRowId: (item) => item.id,
        });

        const selectCol = createSelectionColumnDef<MockItem>({
          selection,
          allItems: mockData,
        });

        const columns = [
          selectCol,
          { id: 'name', header: 'Name', accessorKey: 'name' as const },
        ];

        return (
          <div>
            <span data-testid="grid-selected-count">{selection.selectedCount}</span>
            <DataGrid
              data={mockData}
              columns={columns}
              selectedRowIds={selection.selectedIds}
              getRowId={(row) => row.id}
            />
          </div>
        );
      }

      render(<GridWithSelection />);
      expect(screen.getByTestId('grid-selected-count').textContent).toBe('0');

      const selectAllCheckbox = screen.getByTestId('select-all-checkbox');
      expect(selectAllCheckbox).toBeDefined();

      const rowCheckboxes = screen.getAllByTestId(/^select-row-checkbox-/);
      expect(rowCheckboxes.length).toBe(4);

      // Select row 1
      fireEvent.click(rowCheckboxes[0]);
      expect(screen.getByTestId('grid-selected-count').textContent).toBe('1');

      // Click select-all (since some selected, toggles to select all)
      fireEvent.click(selectAllCheckbox);
      expect(screen.getByTestId('grid-selected-count').textContent).toBe('4');

      // Click select-all again (since all selected, toggles to clear)
      fireEvent.click(selectAllCheckbox);
      expect(screen.getByTestId('grid-selected-count').textContent).toBe('0');
    });
  });

  describe('Governed Bulk Actions Protocol', () => {
    it('generates distinct idempotency key per row for N selected items', async () => {
      const capturedRequests: Array<{ url: string; body: any; headers: any }> = [];

      const mockFetch = vi.fn().mockImplementation(async (url: string, init: any) => {
        capturedRequests.push({
          url,
          body: JSON.parse(init.body),
          headers: init.headers,
        });
        return {
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ status: 'ok', updated: true }),
        };
      });

      function BulkActionRunner() {
        const { executeBulkAction, summary, isExecuting } = useBulkGovernedActions<MockItem>({
          fetchFn: mockFetch as any,
          actor: 'test-user',
        });

        const actionDef: BulkActionDef<MockItem> = {
          id: 'activate',
          label: 'Activate Items',
          action: 'item.activate',
          url: (item) => `/api/items/${item.id}/activate`,
        };

        return (
          <div>
            <button
              data-testid="run-bulk-action"
              onClick={() => executeBulkAction(actionDef, mockData.slice(0, 3))}
            >
              Run Bulk Action
            </button>
            <span data-testid="executing-state">{isExecuting ? 'running' : 'idle'}</span>
            <span data-testid="resolved-count">{summary?.resolved ?? 0}</span>
          </div>
        );
      }

      render(<BulkActionRunner />);
      fireEvent.click(screen.getByTestId('run-bulk-action'));

      await waitFor(() => {
        expect(screen.getByTestId('resolved-count').textContent).toBe('3');
      });

      expect(capturedRequests.length).toBe(3);

      // Verify each item got its own distinct idempotency key
      const keys = capturedRequests.map((r) => r.headers['X-Idempotency-Key']);
      expect(new Set(keys).size).toBe(3);
      expect(keys[0]).toBeDefined();
      expect(keys[1]).toBeDefined();
      expect(keys[2]).toBeDefined();
      expect(keys[0]).not.toBe(keys[1]);
      expect(keys[1]).not.toBe(keys[2]);

      // Verify payload contains per-item idempotency key and actor
      capturedRequests.forEach((req, idx) => {
        expect(req.body.idempotency_key).toBe(keys[idx]);
        expect(req.body.actor).toBe('test-user');
        expect(req.body.action).toBe('item.activate');
      });
    });

    it('partial failure reports per-row status and does not roll back successful rows', async () => {
      const mockFetch = vi.fn().mockImplementation(async (url: string) => {
        if (url.includes('item-2')) {
          return {
            ok: false,
            status: 500,
            headers: new Headers({ 'content-type': 'application/json' }),
            json: async () => ({ error: 'Database constraint violation on item-2' }),
          };
        }
        return {
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ status: 'success' }),
        };
      });

      let finalSummary: BulkExecutionSummary<MockItem> | null = null;

      function PartialFailureTest() {
        const { executeBulkAction, summary } = useBulkGovernedActions<MockItem>({
          fetchFn: mockFetch as any,
        });

        const actionDef: BulkActionDef<MockItem> = {
          id: 'retire',
          label: 'Retire Items',
          action: 'item.retire',
          url: (item) => `/api/items/${item.id}/retire`,
          onComplete: (res) => {
            finalSummary = res;
          },
        };

        return (
          <div>
            <button
              data-testid="run-partial-btn"
              onClick={() => executeBulkAction(actionDef, mockData.slice(0, 3))}
            >
              Run
            </button>
            <span data-testid="summary-failed">{summary?.failed ?? 0}</span>
            <span data-testid="summary-resolved">{summary?.resolved ?? 0}</span>
            <span data-testid="summary-partial">
              {summary?.isPartialFailure ? 'yes' : 'no'}
            </span>
          </div>
        );
      }

      render(<PartialFailureTest />);
      fireEvent.click(screen.getByTestId('run-partial-btn'));

      await waitFor(() => {
        expect(screen.getByTestId('summary-partial').textContent).toBe('yes');
      });

      expect(screen.getByTestId('summary-resolved').textContent).toBe('2');
      expect(screen.getByTestId('summary-failed').textContent).toBe('1');

      expect(finalSummary).not.toBeNull();
      expect(finalSummary!.total).toBe(3);
      expect(finalSummary!.resolved).toBe(2);
      expect(finalSummary!.failed).toBe(1);
      expect(finalSummary!.isPartialFailure).toBe(true);

      // Verify row 1 succeeded
      expect(finalSummary!.results['item-1'].status).toBe('resolved');
      expect(finalSummary!.results['item-1'].error).toBeUndefined();

      // Verify row 2 failed with exact error message
      expect(finalSummary!.results['item-2'].status).toBe('failed');
      expect(String(finalSummary!.results['item-2'].error)).toContain(
        'Database constraint violation on item-2'
      );

      // Verify row 3 succeeded (NOT rolled back!)
      expect(finalSummary!.results['item-3'].status).toBe('resolved');
      expect(finalSummary!.results['item-3'].error).toBeUndefined();
    });

    it('governed bulk action produces N approval entries for N rows (above trust ceiling)', async () => {
      const mockFetch = vi.fn().mockImplementation(async (url: string) => {
        const itemId = url.split('/')[3];
        return {
          ok: false,
          status: 202,
          headers: new Headers({
            'content-type': 'application/json',
            'X-Approval-Id': `approval-for-${itemId}`,
          }),
          json: async () => ({
            status: 'pending-approval',
            approval_id: `approval-for-${itemId}`,
            proposal: { action: 'delete', target: itemId },
          }),
        };
      });

      let finalSummary: BulkExecutionSummary<MockItem> | null = null;

      function GovernedApprovalTest() {
        const { executeBulkAction, summary } = useBulkGovernedActions<MockItem>({
          fetchFn: mockFetch as any,
        });

        const actionDef: BulkActionDef<MockItem> = {
          id: 'high-risk-delete',
          label: 'Delete Permanent',
          action: 'item.delete',
          url: (item) => `/api/items/${item.id}/delete`,
          onComplete: (res) => {
            finalSummary = res;
          },
        };

        return (
          <div>
            <button
              data-testid="run-governed-btn"
              onClick={() => executeBulkAction(actionDef, mockData.slice(0, 3))}
            >
              Run Governed
            </button>
            <span data-testid="pending-count">{summary?.pendingApproval ?? 0}</span>
            <span data-testid="has-pending">
              {summary?.hasPendingApproval ? 'yes' : 'no'}
            </span>
          </div>
        );
      }

      render(<GovernedApprovalTest />);
      fireEvent.click(screen.getByTestId('run-governed-btn'));

      await waitFor(() => {
        expect(screen.getByTestId('pending-count').textContent).toBe('3');
      });

      expect(screen.getByTestId('has-pending').textContent).toBe('yes');
      expect(finalSummary).not.toBeNull();
      expect(finalSummary!.total).toBe(3);
      expect(finalSummary!.pendingApproval).toBe(3);
      expect(finalSummary!.resolved).toBe(0);

      // Verify each of the 3 rows received its own approval ID (N approval entries, not 1 opaque batch)
      expect(finalSummary!.results['item-1'].status).toBe('pending-approval');
      expect(finalSummary!.results['item-1'].approvalId).toBe('approval-for-item-1');

      expect(finalSummary!.results['item-2'].status).toBe('pending-approval');
      expect(finalSummary!.results['item-2'].approvalId).toBe('approval-for-item-2');

      expect(finalSummary!.results['item-3'].status).toBe('pending-approval');
      expect(finalSummary!.results['item-3'].approvalId).toBe('approval-for-item-3');
    });

    it('supports custom executeItem and handles full batch failure', async () => {
      function CustomExecRunner() {
        const { executeBulkAction, summary, status } = useBulkGovernedActions<MockItem>();

        const actionDef: BulkActionDef<MockItem> = {
          id: 'custom-exec',
          label: 'Custom Exec',
          executeItem: async (item) => {
            if (item.id === 'item-1' || item.id === 'item-2') {
              return { error: 'Network timeout' };
            }
            return { data: { custom: true } };
          },
        };

        return (
          <div>
            <button
              data-testid="run-custom-btn"
              onClick={() => executeBulkAction(actionDef, mockData.slice(0, 2))}
            >
              Run Custom
            </button>
            <span data-testid="custom-status">{status}</span>
            <span data-testid="failed-count">{summary?.failed ?? 0}</span>
          </div>
        );
      }

      render(<CustomExecRunner />);
      fireEvent.click(screen.getByTestId('run-custom-btn'));

      await waitFor(() => {
        expect(screen.getByTestId('custom-status').textContent).toBe('failed');
      });

      expect(screen.getByTestId('failed-count').textContent).toBe('2');
    });

    it('generates properly formatted idempotency keys with generateBulkIdempotencyKey', () => {
      const key1 = generateBulkIdempotencyKey('row-123', 'action-abc');
      const key2 = generateBulkIdempotencyKey('row-123', 'action-abc');

      expect(key1).toContain('idem-');
      expect(key1).toContain('action-abc');
      expect(key1).toContain('row-123');
      expect(key1).not.toBe(key2);
    });
  });

  describe('GridBulkActions Toolbar UI Component', () => {
    it('renders toolbar when items are selected and handles action execution & status breakdown', async () => {
      const mockFetch = vi.fn().mockImplementation(async (url: string) => {
        if (url.includes('item-2')) {
          return {
            ok: false,
            status: 400,
            headers: new Headers({ 'content-type': 'application/json' }),
            json: async () => ({ error: 'Invalid state' }),
          };
        }
        return {
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ success: true }),
        };
      });

      const onClear = vi.fn();
      const onActionComplete = vi.fn();

      const actions: BulkActionDef<MockItem>[] = [
        {
          id: 'export',
          label: 'Export Selected',
          action: 'item.export',
          url: (item) => `/api/items/${item.id}/export`,
        },
      ];

      function TestToolbarWrapper() {
        const [selected, setSelected] = useState<MockItem[]>(mockData.slice(0, 3));

        return (
          <GridBulkActions<MockItem>
            selectedItems={selected}
            actions={actions}
            fetchFn={mockFetch as any}
            onClearSelection={() => {
              setSelected([]);
              onClear();
            }}
            onActionComplete={onActionComplete}
          />
        );
      }

      render(<TestToolbarWrapper />);

      // Toolbar is visible with selection count
      expect(screen.getByRole('toolbar', { name: /bulk actions toolbar/i })).toBeDefined();
      expect(screen.getByTestId('bulk-selection-count').textContent).toContain('3 items selected');

      // Click clear
      fireEvent.click(screen.getByTestId('bulk-clear-btn'));
      expect(onClear).toHaveBeenCalled();

      // Render again with selected items
      cleanup();
      render(
        <GridBulkActions<MockItem>
          selectedItems={mockData.slice(0, 3)}
          actions={actions}
          fetchFn={mockFetch as any}
          onClearSelection={onClear}
          onActionComplete={onActionComplete}
        />
      );

      // Execute action
      const exportBtn = screen.getByTestId('bulk-action-export');
      fireEvent.click(exportBtn);

      await waitFor(() => {
        expect(screen.getByTestId('bulk-status-summary')).toBeDefined();
      });

      // Status summary should show 2 resolved, 1 failed
      expect(screen.getByTestId('bulk-status-summary').textContent).toContain('2 resolved');
      expect(screen.getByTestId('bulk-status-summary').textContent).toContain('1 failed');

      // Toggle details view to inspect per-row breakdown
      const detailsToggle = screen.getByTestId('bulk-details-toggle');
      fireEvent.click(detailsToggle);

      expect(screen.getByTestId('bulk-row-status-item-1').textContent).toContain('resolved');
      expect(screen.getByTestId('bulk-row-status-item-2').textContent).toContain('failed');
      expect(screen.getByTestId('bulk-row-status-item-3').textContent).toContain('resolved');

      expect(onActionComplete).toHaveBeenCalled();
    });

    it('handles confirmation modal flow before executing action', async () => {
      const mockFetch = vi.fn().mockImplementation(async () => {
        return {
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ success: true }),
        };
      });

      const actions: BulkActionDef<MockItem>[] = [
        {
          id: 'delete-confirmed',
          label: 'Delete All Selected',
          variant: 'danger',
          requiresConfirmation: true,
          confirmTitle: 'Confirm Bulk Deletion',
          confirmMessage: (items) => `Permanently delete ${items.length} records?`,
          action: 'item.bulk_delete',
          url: (item) => `/api/items/${item.id}`,
          method: 'DELETE',
        },
      ];

      render(
        <GridBulkActions<MockItem>
          selectedItems={mockData.slice(0, 2)}
          actions={actions}
          fetchFn={mockFetch as any}
        />
      );

      const deleteBtn = screen.getByTestId('bulk-action-delete-confirmed');
      fireEvent.click(deleteBtn);

      // Confirmation modal appears
      expect(screen.getByTestId('bulk-confirm-modal')).toBeDefined();
      expect(screen.getByText('Confirm Bulk Deletion')).toBeDefined();
      expect(screen.getByText('Permanently delete 2 records?')).toBeDefined();

      // Cancel button dismisses without executing
      fireEvent.click(screen.getByTestId('bulk-confirm-cancel'));
      expect(screen.queryByTestId('bulk-confirm-modal')).toBeNull();
      expect(mockFetch).not.toHaveBeenCalled();

      // Re-open and confirm
      fireEvent.click(deleteBtn);
      expect(screen.getByTestId('bulk-confirm-modal')).toBeDefined();
      fireEvent.click(screen.getByTestId('bulk-confirm-proceed'));

      await waitFor(() => {
        expect(screen.getByTestId('bulk-status-summary')).toBeDefined();
      });

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(screen.getByTestId('bulk-status-summary').textContent).toContain('2 resolved');
    });
  });
});
