import React, { useState, useMemo, useCallback } from 'react';
import type { ColumnDef } from '../DataGrid';

export interface UseBulkSelectionOptions<T> {
  initialSelectedIds?: (string | number)[] | Set<string | number>;
  getRowId?: (item: T, index?: number) => string | number;
  onSelectionChange?: (selectedIds: Set<string | number>, selectedItems?: T[]) => void;
}

export interface UseBulkSelectionResult<T> {
  selectedIds: Set<string | number>;
  selectedCount: number;
  isSelected: (id: string | number) => boolean;
  toggle: (id: string | number) => void;
  select: (idOrIds: string | number | (string | number)[]) => void;
  deselect: (idOrIds: string | number | (string | number)[]) => void;
  selectAll: (itemsOrIds?: T[] | (string | number)[]) => void;
  clearSelection: () => void;
  isAllSelected: (itemsOrIds: T[] | (string | number)[]) => boolean;
  isIndeterminate: (itemsOrIds: T[] | (string | number)[]) => boolean;
  getSelectedItems: (items: T[]) => T[];
  setSelectedIds: (ids: Set<string | number> | (string | number)[]) => void;
}

export function useBulkSelection<T = unknown>(
  options: UseBulkSelectionOptions<T> = {}
): UseBulkSelectionResult<T> {
  const {
    initialSelectedIds,
    getRowId = (item: any, idx?: number) => item?.id ?? idx,
    onSelectionChange,
  } = options;

  const [selectedIds, setSelectedIdsState] = useState<Set<string | number>>(() => {
    if (!initialSelectedIds) return new Set();
    if (initialSelectedIds instanceof Set) return new Set(initialSelectedIds);
    return new Set(initialSelectedIds);
  });

  const isSelected = useCallback(
    (id: string | number) => selectedIds.has(id),
    [selectedIds]
  );

  const setSelectedIds = useCallback(
    (ids: Set<string | number> | (string | number)[]) => {
      const next = ids instanceof Set ? new Set(ids) : new Set(ids);
      setSelectedIdsState(next);
      onSelectionChange?.(next);
    },
    [onSelectionChange]
  );

  const toggle = useCallback(
    (id: string | number) => {
      setSelectedIdsState((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        onSelectionChange?.(next);
        return next;
      });
    },
    [onSelectionChange]
  );

  const select = useCallback(
    (idOrIds: string | number | (string | number)[]) => {
      setSelectedIdsState((prev) => {
        const next = new Set(prev);
        const list = Array.isArray(idOrIds) ? idOrIds : [idOrIds];
        list.forEach((id) => next.add(id));
        onSelectionChange?.(next);
        return next;
      });
    },
    [onSelectionChange]
  );

  const deselect = useCallback(
    (idOrIds: string | number | (string | number)[]) => {
      setSelectedIdsState((prev) => {
        const next = new Set(prev);
        const list = Array.isArray(idOrIds) ? idOrIds : [idOrIds];
        list.forEach((id) => next.delete(id));
        onSelectionChange?.(next);
        return next;
      });
    },
    [onSelectionChange]
  );

  const extractIds = useCallback(
    (itemsOrIds: T[] | (string | number)[]): (string | number)[] => {
      if (!itemsOrIds || itemsOrIds.length === 0) return [];
      return itemsOrIds.map((item, idx) => {
        if (typeof item === 'string' || typeof item === 'number') {
          return item;
        }
        return getRowId(item as T, idx);
      });
    },
    [getRowId]
  );

  const selectAll = useCallback(
    (itemsOrIds?: T[] | (string | number)[]) => {
      if (!itemsOrIds || itemsOrIds.length === 0) {
        setSelectedIdsState(new Set());
        onSelectionChange?.(new Set());
        return;
      }
      const ids = extractIds(itemsOrIds);
      const next = new Set(ids);
      setSelectedIdsState(next);
      onSelectionChange?.(next);
    },
    [extractIds, onSelectionChange]
  );

  const clearSelection = useCallback(() => {
    const next = new Set<string | number>();
    setSelectedIdsState(next);
    onSelectionChange?.(next);
  }, [onSelectionChange]);

  const isAllSelected = useCallback(
    (itemsOrIds: T[] | (string | number)[]) => {
      if (!itemsOrIds || itemsOrIds.length === 0) return false;
      const ids = extractIds(itemsOrIds);
      if (ids.length === 0) return false;
      return ids.every((id) => selectedIds.has(id));
    },
    [extractIds, selectedIds]
  );

  const isIndeterminate = useCallback(
    (itemsOrIds: T[] | (string | number)[]) => {
      if (!itemsOrIds || itemsOrIds.length === 0) return false;
      const ids = extractIds(itemsOrIds);
      if (ids.length === 0) return false;
      const selectedCountInItems = ids.filter((id) => selectedIds.has(id)).length;
      return selectedCountInItems > 0 && selectedCountInItems < ids.length;
    },
    [extractIds, selectedIds]
  );

  const getSelectedItems = useCallback(
    (items: T[]) => {
      if (!items || items.length === 0) return [];
      return items.filter((item, idx) => selectedIds.has(getRowId(item, idx)));
    },
    [getRowId, selectedIds]
  );

  return useMemo(
    () => ({
      selectedIds,
      selectedCount: selectedIds.size,
      isSelected,
      toggle,
      select,
      deselect,
      selectAll,
      clearSelection,
      isAllSelected,
      isIndeterminate,
      getSelectedItems,
      setSelectedIds,
    }),
    [
      selectedIds,
      isSelected,
      toggle,
      select,
      deselect,
      selectAll,
      clearSelection,
      isAllSelected,
      isIndeterminate,
      getSelectedItems,
      setSelectedIds,
    ]
  );
}

export interface CreateSelectionColumnOptions<T> {
  selection: UseBulkSelectionResult<T>;
  allItems?: T[];
  getRowId?: (row: T, index: number) => string | number;
  width?: number;
}

export function createSelectionColumnDef<T>({
  selection,
  allItems = [],
  getRowId = (row: any, idx: number) => row?.id ?? idx,
  width = 44,
}: CreateSelectionColumnOptions<T>): ColumnDef<T> {
  const allSelected = selection.isAllSelected(allItems);
  const indeterminate = selection.isIndeterminate(allItems);

  return {
    id: '__selection',
    width,
    minWidth: 40,
    maxWidth: 60,
    sortable: false,
    resizable: false,
    reorderable: false,
    align: 'center',
    header: React.createElement(
      'label',
      {
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          width: '100%',
          height: '100%',
        },
        onClick: (e: React.MouseEvent) => e.stopPropagation(),
      },
      React.createElement('input', {
        type: 'checkbox',
        'data-testid': 'select-all-checkbox',
        'aria-label': 'Select all rows',
        checked: allSelected,
        ref: (el: HTMLInputElement | null) => {
          if (el) el.indeterminate = indeterminate;
        },
        onChange: () => {
          if (allSelected) {
            selection.clearSelection();
          } else {
            selection.selectAll(allItems);
          }
        },
        style: { cursor: 'pointer', accentColor: 'var(--copper-primary, #B87333)' },
      })
    ),
    cell: ({ row, rowIndex }) => {
      const rowId = getRowId(row, rowIndex);
      const checked = selection.isSelected(rowId);

      return React.createElement(
        'label',
        {
          style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            width: '100%',
            height: '100%',
          },
          onClick: (e: React.MouseEvent) => e.stopPropagation(),
        },
        React.createElement('input', {
          type: 'checkbox',
          'data-testid': `select-row-checkbox-${rowId}`,
          'aria-label': `Select row ${rowId}`,
          checked: checked,
          onChange: () => selection.toggle(rowId),
          style: { cursor: 'pointer', accentColor: 'var(--copper-primary, #B87333)' },
        })
      );
    },
  };
}
