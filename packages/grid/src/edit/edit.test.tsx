// @vitest-environment jsdom
import React, { useState } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup, renderHook, act } from '@testing-library/react';
import {
  GridEditor,
  useGridEditor,
  type EditableColumnDef,
} from './GridEditor';

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unitCost: number;
  category: string;
  inStock: boolean;
}

const mockInventory: InventoryItem[] = [
  { id: '1', name: 'Server Rack 42U', quantity: 10, unitCost: 1200, category: 'Hardware', inStock: true },
  { id: '2', name: 'Cat6a Cable 100m', quantity: 50, unitCost: 85, category: 'Cabling', inStock: true },
  { id: '3', name: 'PDU 16A', quantity: 25, unitCost: 240, category: 'Power', inStock: false },
];

describe('GridEditor Inline Editing (GR.W4 / B149)', () => {
  beforeEach(() => {
    if (typeof (globalThis as any).ResizeObserver === 'undefined') {
      (globalThis as any).ResizeObserver = class {
        observe() {}
        unobserve() {}
        disconnect() {}
      };
    }
  });

  afterEach(() => {
    cleanup();
  });

  it('updates local state optimistically and rolls back when the save promise rejects', async () => {
    let rejectSave = true;
    const saveSpy = vi.fn().mockImplementation(async ({ updatedRow }) => {
      if (rejectSave) {
        throw new Error('Network timeout: backend rejected update');
      }
      return updatedRow;
    });

    const columns: EditableColumnDef<InventoryItem>[] = [
      { id: 'id', header: 'ID', accessorKey: 'id' },
      { id: 'name', header: 'Name', accessorKey: 'name', editable: true },
      { id: 'quantity', header: 'Qty', accessorKey: 'quantity', editable: true, editorType: 'number' },
      { id: 'category', header: 'Category', accessorKey: 'category' },
    ];

    const onErrorSpy = vi.fn();
    const onSuccessSpy = vi.fn();

    function TestComponent() {
      const [items, setItems] = useState(mockInventory);
      return (
        <GridEditor
          data={items}
          columns={columns}
          onSave={saveSpy}
          onDataChange={setItems}
          onCommitError={onErrorSpy}
          onCommitSuccess={onSuccessSpy}
          getRowId={(row) => row.id}
        />
      );
    }

    render(<TestComponent />);

    // Check initial state
    expect(screen.getByText('Server Rack 42U')).toBeTruthy();

    // Double click to edit cell
    const nameCell = screen.getByText('Server Rack 42U');
    fireEvent.doubleClick(nameCell);

    // Input should appear with initial value
    const input = screen.getByRole('textbox', { name: /edit Name/i }) as HTMLInputElement;
    expect(input).toBeTruthy();
    expect(input.value).toBe('Server Rack 42U');

    // Type new optimistic value
    fireEvent.change(input, { target: { value: 'Super Server Rack 48U' } });
    expect(input.value).toBe('Super Server Rack 48U');

    // Press Enter to commit edit
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    // Optimistic check: save was triggered
    expect(saveSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        columnId: 'name',
        newValue: 'Super Server Rack 48U',
        previousValue: 'Server Rack 42U',
        rowId: '1',
      })
    );

    // Wait for promise rejection & rollback
    await waitFor(() => {
      expect(onErrorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          columnId: 'name',
          attemptedValue: 'Super Server Rack 48U',
          previousValue: 'Server Rack 42U',
          error: expect.any(Error),
        })
      );
    });

    // Rollback verification: value is back to 'Server Rack 42U'
    await waitFor(() => {
      expect(screen.getByText('Server Rack 42U')).toBeTruthy();
      expect(screen.queryByText('Super Server Rack 48U')).toBeNull();
    });

    // Error notification or alert should be visible
    expect(screen.getByRole('alert').textContent).toContain('Network timeout: backend rejected update');

    // Now test a successful edit
    rejectSave = false;
    const nameCellRetry = screen.getByText('Server Rack 42U');
    fireEvent.doubleClick(nameCellRetry);

    const input2 = screen.getByRole('textbox', { name: /edit Name/i }) as HTMLInputElement;
    fireEvent.change(input2, { target: { value: 'Validated Server Rack 42U' } });
    fireEvent.keyDown(input2, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(onSuccessSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          columnId: 'name',
          newValue: 'Validated Server Rack 42U',
          previousValue: 'Server Rack 42U',
        })
      );
    });

    expect(screen.getByText('Validated Server Rack 42U')).toBeTruthy();
  });

  it('supports escape key to cancel editing without triggering save or changing state', async () => {
    const saveSpy = vi.fn();

    const columns: EditableColumnDef<InventoryItem>[] = [
      { id: 'id', header: 'ID', accessorKey: 'id' },
      { id: 'name', header: 'Name', accessorKey: 'name', editable: true },
    ];

    render(
      <GridEditor
        data={mockInventory}
        columns={columns}
        onSave={saveSpy}
        getRowId={(row) => row.id}
      />
    );

    const cell = screen.getByText('Cat6a Cable 100m');
    fireEvent.doubleClick(cell);

    const input = screen.getByRole('textbox', { name: /edit Name/i });
    fireEvent.change(input, { target: { value: 'Draft modification' } });

    // Press Escape to cancel
    fireEvent.keyDown(input, { key: 'Escape', code: 'Escape' });

    // Editor should be closed and original value restored
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(screen.getByText('Cat6a Cable 100m')).toBeTruthy();
    expect(saveSpy).not.toHaveBeenCalled();
  });

  it('validates cell edits and halts commit if validator fails', async () => {
    const saveSpy = vi.fn();

    const columns: EditableColumnDef<InventoryItem>[] = [
      { id: 'id', header: 'ID', accessorKey: 'id' },
      {
        id: 'quantity',
        header: 'Qty',
        accessorKey: 'quantity',
        editable: true,
        editorType: 'number',
        validate: (val) => {
          if (Number(val) < 0) return 'Quantity cannot be negative';
          return true;
        },
      },
    ];

    render(
      <GridEditor
        data={mockInventory}
        columns={columns}
        onSave={saveSpy}
        getRowId={(row) => row.id}
      />
    );

    const cell = screen.getByText('10');
    fireEvent.doubleClick(cell);

    const input = screen.getByRole('spinbutton', { name: /edit Qty/i });
    fireEvent.change(input, { target: { value: '-5' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    // Validator should display validation error and prevent save
    expect(screen.getByText('Quantity cannot be negative')).toBeTruthy();
    expect(saveSpy).not.toHaveBeenCalled();
  });

  it('supports select dropdown editor and boolean checkbox editor', async () => {
    const saveSpy = vi.fn().mockImplementation(async ({ updatedRow }) => updatedRow);

    const columns: EditableColumnDef<InventoryItem>[] = [
      { id: 'id', header: 'ID', accessorKey: 'id' },
      {
        id: 'category',
        header: 'Category',
        accessorKey: 'category',
        editable: true,
        editorType: 'select',
        options: [
          { label: 'Hardware', value: 'Hardware' },
          { label: 'Cabling', value: 'Cabling' },
          { label: 'Power', value: 'Power' },
          { label: 'Audio', value: 'Audio' },
        ],
      },
      {
        id: 'inStock',
        header: 'In Stock',
        accessorKey: 'inStock',
        editable: true,
        editorType: 'checkbox',
      },
    ];

    render(
      <GridEditor
        data={mockInventory}
        columns={columns}
        onSave={saveSpy}
        getRowId={(row) => row.id}
      />
    );

    // Test select dropdown
    const catCell = screen.getByText('Hardware');
    fireEvent.doubleClick(catCell);

    const select = screen.getByRole('combobox', { name: /edit Category/i });
    expect(select).toBeTruthy();
    fireEvent.change(select, { target: { value: 'Audio' } });
    fireEvent.keyDown(select, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(saveSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          columnId: 'category',
          newValue: 'Audio',
          previousValue: 'Hardware',
        })
      );
    });

    // Test checkbox
    const inStockCell = screen.getByText('false');
    fireEvent.doubleClick(inStockCell);

    const checkbox = screen.getByRole('checkbox', { name: /edit In Stock/i }) as HTMLInputElement;
    expect(checkbox.checked).toBe(false);
    fireEvent.click(checkbox);
    fireEvent.keyDown(checkbox, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(saveSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          columnId: 'inStock',
          newValue: true,
          previousValue: false,
        })
      );
    });
  });

  it('respects row-level editable predicate function', async () => {
    const saveSpy = vi.fn();

    const columns: EditableColumnDef<InventoryItem>[] = [
      { id: 'id', header: 'ID', accessorKey: 'id' },
      {
        id: 'name',
        header: 'Name',
        accessorKey: 'name',
        editable: (row) => row.category !== 'Hardware', // Hardware is locked/read-only
      },
    ];

    render(
      <GridEditor
        data={mockInventory}
        columns={columns}
        onSave={saveSpy}
        getRowId={(row) => row.id}
      />
    );

    // Double clicking row 1 (Hardware) should NOT open editor
    const hardwareCell = screen.getByText('Server Rack 42U');
    fireEvent.doubleClick(hardwareCell);
    expect(screen.queryByRole('textbox')).toBeNull();

    // Double clicking row 2 (Cabling) SHOULD open editor
    const cablingCell = screen.getByText('Cat6a Cable 100m');
    fireEvent.doubleClick(cablingCell);
    expect(screen.getByRole('textbox', { name: /edit Name/i })).toBeTruthy();
  });

  it('provides useGridEditor hook with programmatic start, cancel, and commit operations', async () => {
    const columns: EditableColumnDef<InventoryItem>[] = [
      { id: 'id', header: 'ID', accessorKey: 'id' },
      { id: 'name', header: 'Name', accessorKey: 'name', editable: true },
    ];

    const { result } = renderHook(() =>
      useGridEditor({
        data: mockInventory,
        columns,
        getRowId: (r) => r.id,
      })
    );

    expect(result.current.gridData).toHaveLength(3);
    expect(result.current.activeEdit).toBeNull();

    // Start editing programmatically
    act(() => {
      result.current.startEditing(mockInventory[0], columns[1], 0);
    });

    expect(result.current.activeEdit).toEqual(
      expect.objectContaining({
        rowId: '1',
        columnId: 'name',
        draftValue: 'Server Rack 42U',
      })
    );

    // Update draft value
    act(() => {
      result.current.updateDraftValue('New Title');
    });
    expect(result.current.activeEdit?.draftValue).toBe('New Title');

    // Cancel edit
    act(() => {
      result.current.cancelEditing();
    });
    expect(result.current.activeEdit).toBeNull();
  });
});
