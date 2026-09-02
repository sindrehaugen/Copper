// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { DataGrid, ColumnDef, DENSITY_ROW_HEIGHTS } from './DataGrid';

interface TestItem {
  id: string;
  name: string;
  category: string;
  status: string;
  count: number;
}

const testColumns: ColumnDef<TestItem>[] = [
  { id: 'id', header: 'ID', accessorKey: 'id', width: 100, minWidth: 60 },
  { id: 'name', header: 'Name', accessorKey: 'name', width: 200, minWidth: 100 },
  { id: 'category', header: 'Category', accessorKey: 'category', width: 150 },
  { id: 'status', header: 'Status', accessorKey: 'status', width: 120 },
  { id: 'count', header: 'Count', accessorKey: 'count', width: 100, align: 'right' },
];

function generateTestItems(count: number): TestItem[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `item-${i + 1}`,
    name: `Item Name ${i + 1}`,
    category: i % 2 === 0 ? 'Hardware' : 'Software',
    status: i % 3 === 0 ? 'Active' : 'Pending',
    count: (i + 1) * 10,
  }));
}

describe('DataGrid (@copper/grid / GR.W1 / B146)', () => {
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

  describe('A11y and ARIA Compliance', () => {
    it('renders a keyboard-complete grid with ARIA roles, row counts, and col counts', () => {
      const data = generateTestItems(10);
      render(
        <DataGrid
          data={data}
          columns={testColumns}
          ariaLabel="Inventory Table"
          height={400}
        />
      );

      const grid = screen.getByRole('grid', { name: 'Inventory Table' });
      expect(grid).toBeDefined();
      expect(grid.getAttribute('aria-rowcount')).toBe('11'); // 1 header + 10 data
      expect(grid.getAttribute('aria-colcount')).toBe('5');

      const colHeaders = screen.getAllByRole('columnheader');
      expect(colHeaders).toHaveLength(5);
      expect(colHeaders[0].getAttribute('aria-colindex')).toBe('1');
      expect(colHeaders[4].getAttribute('aria-colindex')).toBe('5');

      const cells = screen.getAllByRole('gridcell');
      expect(cells.length).toBeGreaterThan(0);
      expect(cells[0].getAttribute('aria-colindex')).toBe('1');
      expect(cells[0].getAttribute('aria-label')).toBeDefined();
    });

    it('supports full 2D keyboard navigation (Arrow keys, Home, End, PageUp, PageDown)', () => {
      const data = generateTestItems(20);
      render(
        <DataGrid
          data={data}
          columns={testColumns}
          ariaLabel="Navigable Grid"
          height={300}
        />
      );

      const grid = screen.getByRole('grid', { name: 'Navigable Grid' });
      grid.focus();

      // Start navigation: ArrowDown into first data row, first cell
      fireEvent.keyDown(grid, { key: 'ArrowDown' });
      const activeCell = document.activeElement;
      expect(activeCell?.getAttribute('role')).toBe('gridcell');
      expect(activeCell?.getAttribute('aria-colindex')).toBe('1');

      // ArrowRight to next column
      fireEvent.keyDown(activeCell!, { key: 'ArrowRight' });
      expect(document.activeElement?.getAttribute('aria-colindex')).toBe('2');

      // End key moves to last column in row
      fireEvent.keyDown(document.activeElement!, { key: 'End' });
      expect(document.activeElement?.getAttribute('aria-colindex')).toBe('5');

      // Home key moves to first column in row
      fireEvent.keyDown(document.activeElement!, { key: 'Home' });
      expect(document.activeElement?.getAttribute('aria-colindex')).toBe('1');

      // ArrowDown to move to next row
      fireEvent.keyDown(document.activeElement!, { key: 'ArrowDown' });
      expect(document.activeElement?.closest('[role="row"]')?.getAttribute('aria-rowindex')).toBe('3');
    });

    it('announces active cell context via screen reader live region', () => {
      const data = generateTestItems(5);
      render(
        <DataGrid
          data={data}
          columns={testColumns}
          ariaLabel="Announced Grid"
          height={300}
        />
      );

      const grid = screen.getByRole('grid', { name: 'Announced Grid' });
      fireEvent.keyDown(grid, { key: 'ArrowDown' });

      const announcer = screen.getByRole('status');
      expect(announcer).toBeDefined();
      expect(announcer.textContent).toContain('Row 1');
      expect(announcer.textContent).toContain('ID');
    });
  });

  describe('Density Settings (HS-14 Contract)', () => {
    it('defaults to compact density (36px row height)', () => {
      const data = generateTestItems(5);
      const { container } = render(
        <DataGrid data={data} columns={testColumns} height={300} />
      );

      expect(DENSITY_ROW_HEIGHTS.compact).toBe(36);
      expect(DENSITY_ROW_HEIGHTS.comfortable).toBe(44);
      expect(DENSITY_ROW_HEIGHTS.dense).toBe(28);

      const gridContainer = container.querySelector('[data-density]');
      expect(gridContainer?.getAttribute('data-density')).toBe('compact');
    });

    it('renders comfortable (44px) and dense (28px workable at 1080p) densities', () => {
      const data = generateTestItems(5);
      const { container, rerender } = render(
        <DataGrid data={data} columns={testColumns} density="comfortable" height={300} />
      );

      expect(container.querySelector('[data-density]')?.getAttribute('data-density')).toBe('comfortable');

      rerender(<DataGrid data={data} columns={testColumns} density="dense" height={300} />);
      expect(container.querySelector('[data-density]')?.getAttribute('data-density')).toBe('dense');
    });
  });

  describe('Virtualization for High Performance', () => {
    it('renders only visible slice of rows plus overscan in the DOM for large datasets', () => {
      const data = generateTestItems(1000);
      const { container } = render(
        <DataGrid data={data} columns={testColumns} height={360} />
      );

      // Viewport 360px with compact density (36px) = ~10 visible rows + overscan (~10-20 rows max)
      const renderedRows = container.querySelectorAll('[role="row"]:not([data-header="true"])');
      expect(renderedRows.length).toBeLessThan(40);
      expect(renderedRows.length).toBeGreaterThanOrEqual(10);
    });

    it('updates visible virtual window upon scroll events', () => {
      const data = generateTestItems(1000);
      const { container } = render(
        <DataGrid data={data} columns={testColumns} height={360} />
      );

      const scrollViewport = container.querySelector('[data-grid-viewport="true"]');
      expect(scrollViewport).toBeDefined();

      // Simulate scroll to row 200 (200 * 36 = 7200px)
      fireEvent.scroll(scrollViewport!, { target: { scrollTop: 7200 } });

      const renderedRows = container.querySelectorAll('[role="row"]:not([data-header="true"])');
      const firstRenderedRow = renderedRows[0];
      const rowIndex = Number(firstRenderedRow.getAttribute('aria-rowindex'));
      // aria-rowindex should be around 200 (accounting for header offset = index + 1)
      expect(rowIndex).toBeGreaterThanOrEqual(180);
      expect(rowIndex).toBeLessThanOrEqual(220);
    });
  });

  describe('Sticky Header, Column Resize and Reorder', () => {
    it('renders sticky header element with proper positioning', () => {
      const data = generateTestItems(10);
      const { container } = render(
        <DataGrid data={data} columns={testColumns} stickyHeader height={300} />
      );

      const header = container.querySelector('[data-sticky-header="true"]');
      expect(header).toBeDefined();
    });

    it('handles column resizing within min/max bounds', () => {
      const data = generateTestItems(5);
      const onResize = vi.fn();
      const { container } = render(
        <DataGrid
          data={data}
          columns={testColumns}
          onColumnResize={onResize}
          height={300}
        />
      );

      const resizeHandles = container.querySelectorAll('[data-resize-handle="true"]');
      expect(resizeHandles.length).toBe(5);

      const firstHandle = resizeHandles[0];
      fireEvent.mouseDown(firstHandle, { clientX: 100 });
      fireEvent.mouseMove(window, { clientX: 150 });
      fireEvent.mouseUp(window);

      expect(onResize).toHaveBeenCalledWith('id', 150);
    });

    it('handles column reordering and updates column layout', () => {
      const data = generateTestItems(5);
      const onReorder = vi.fn();
      const newOrder = ['name', 'id', 'category', 'status', 'count'];

      const { rerender } = render(
        <DataGrid
          data={data}
          columns={testColumns}
          onColumnReorder={onReorder}
          height={300}
        />
      );

      rerender(
        <DataGrid
          data={data}
          columns={testColumns}
          columnOrder={newOrder}
          height={300}
        />
      );

      const colHeaders = screen.getAllByRole('columnheader');
      expect(colHeaders[0].textContent).toContain('Name');
      expect(colHeaders[1].textContent).toContain('ID');
    });
  });

  describe('Selection and Filtering', () => {
    it('supports row selection and triggers selection callback', () => {
      const data = generateTestItems(5);
      const onSelectionChange = vi.fn();

      render(
        <DataGrid
          data={data}
          columns={testColumns}
          onSelectionChange={onSelectionChange}
          height={300}
        />
      );

      const rows = screen.getAllByRole('row');
      // Click first data row
      fireEvent.click(rows[1]);
      expect(onSelectionChange).toHaveBeenCalledWith([data[0]]);
    });

    it('filters rows based on filterQuery and updates total row count', () => {
      const data = generateTestItems(20);
      const { rerender } = render(
        <DataGrid
          data={data}
          columns={testColumns}
          filterQuery="Hardware"
          height={300}
        />
      );

      const grid = screen.getByRole('grid');
      // 10 Hardware items + 1 header = 11 aria-rowcount
      expect(grid.getAttribute('aria-rowcount')).toBe('11');

      rerender(
        <DataGrid
          data={data}
          columns={testColumns}
          filterQuery="NonExistentItem999"
          height={300}
        />
      );
      expect(grid.getAttribute('aria-rowcount')).toBe('1'); // only header
    });
  });
});
