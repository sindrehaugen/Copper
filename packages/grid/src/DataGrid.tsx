import React, {
  useState,
  useRef,
  useMemo,
  useCallback,
  useEffect,
  useId,
  type ReactNode,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type DragEvent,
} from 'react';

export type Density = 'comfortable' | 'compact' | 'dense';

export const DENSITY_ROW_HEIGHTS: Record<Density, number> = {
  comfortable: 44,
  compact: 36,
  dense: 28,
};

export interface ColumnDef<T> {
  id: string;
  header: string | ReactNode;
  accessorKey?: keyof T;
  accessorFn?: (row: T) => any;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  cell?: (info: { row: T; value: any; rowIndex: number }) => ReactNode;
  sortable?: boolean;
  resizable?: boolean;
  reorderable?: boolean;
  align?: 'left' | 'center' | 'right';
  ariaLabel?: string;
}

export interface VirtualWindowParams {
  totalRows: number;
  rowHeight: number;
  viewportHeight: number;
  scrollTop: number;
  overscan?: number;
}

export interface VirtualWindowResult {
  startIndex: number;
  endIndex: number;
  topOffset: number;
  totalHeight: number;
  visibleCount: number;
}

export function calculateVirtualWindow({
  totalRows,
  rowHeight,
  viewportHeight,
  scrollTop,
  overscan = 5,
}: VirtualWindowParams): VirtualWindowResult {
  const totalHeight = totalRows * rowHeight;
  if (totalRows === 0 || viewportHeight <= 0) {
    return {
      startIndex: 0,
      endIndex: 0,
      topOffset: 0,
      totalHeight: 0,
      visibleCount: 0,
    };
  }

  const rawStartIndex = Math.floor(scrollTop / rowHeight);
  const rawVisibleCount = Math.ceil(viewportHeight / rowHeight);

  const startIndex = Math.max(0, rawStartIndex - overscan);
  const endIndex = Math.min(totalRows, rawStartIndex + rawVisibleCount + overscan);
  const topOffset = startIndex * rowHeight;
  const visibleCount = endIndex - startIndex;

  return {
    startIndex,
    endIndex,
    topOffset,
    totalHeight,
    visibleCount,
  };
}

export function filterGridData<T>(
  data: T[],
  columns: ColumnDef<T>[],
  query?: string,
  customPredicate?: (row: T, query: string) => boolean
): T[] {
  if (!query || !query.trim()) {
    return data;
  }

  if (customPredicate) {
    return data.filter((row) => customPredicate(row, query));
  }

  const tokens = query.trim().toLowerCase().split(/\s+/);
  const accessors = columns.map((col) => {
    if (col.accessorFn) return col.accessorFn;
    if (col.accessorKey) return (row: T) => row[col.accessorKey as keyof T];
    return (row: T) => (row as any)[col.id];
  });

  return data.filter((row) => {
    let corpus = '';
    for (let i = 0; i < accessors.length; i++) {
      const val = accessors[i](row);
      if (val !== undefined && val !== null) {
        corpus += ' ' + String(val);
      }
    }
    const lowerCorpus = corpus.toLowerCase();
    return tokens.every((token) => lowerCorpus.includes(token));
  });
}

export interface DataGridProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  density?: Density;
  onDensityChange?: (density: Density) => void;
  height?: number | string;
  width?: number | string;
  className?: string;
  style?: CSSProperties;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  onRowClick?: (row: T, rowIndex: number) => void;
  onSelectionChange?: (selectedRows: T[]) => void;
  selectedRowIds?: Set<string | number>;
  getRowId?: (row: T, index: number) => string | number;
  filterQuery?: string;
  filterPredicate?: (row: T, query: string) => boolean;
  onColumnResize?: (columnId: string, newWidth: number) => void;
  onColumnReorder?: (columnOrder: string[]) => void;
  columnOrder?: string[];
  overscan?: number;
  stickyHeader?: boolean;
  emptyMessage?: ReactNode;
}

export function DataGrid<T>({
  data,
  columns,
  density = 'compact',
  height = 400,
  width = '100%',
  className = '',
  style,
  ariaLabel,
  ariaLabelledBy,
  onRowClick,
  onSelectionChange,
  selectedRowIds,
  getRowId = (row: any, idx: number) => row.id ?? idx,
  filterQuery,
  filterPredicate,
  onColumnResize,
  onColumnReorder,
  columnOrder,
  overscan = 5,
  stickyHeader = true,
  emptyMessage = 'No data available',
}: DataGridProps<T>) {
  const gridId = useId();
  const rowHeight = DENSITY_ROW_HEIGHTS[density] || 36;
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState<number>(
    typeof height === 'number' ? height : 400
  );

  // Column Ordering
  const [internalColumnOrder, setInternalColumnOrder] = useState<string[]>(() =>
    columns.map((c) => c.id)
  );
  const activeColumnOrder = columnOrder ?? internalColumnOrder;

  const orderedColumns = useMemo(() => {
    if (!activeColumnOrder || activeColumnOrder.length === 0) return columns;
    const colMap = new Map(columns.map((c) => [c.id, c]));
    const result: ColumnDef<T>[] = [];
    activeColumnOrder.forEach((id) => {
      const col = colMap.get(id);
      if (col) result.push(col);
    });
    // Add any missing columns
    columns.forEach((col) => {
      if (!result.some((c) => c.id === col.id)) {
        result.push(col);
      }
    });
    return result;
  }, [columns, activeColumnOrder]);

  const moveColumn = useCallback(
    (fromIdx: number, toIdx: number) => {
      if (
        fromIdx < 0 ||
        fromIdx >= orderedColumns.length ||
        toIdx < 0 ||
        toIdx >= orderedColumns.length ||
        fromIdx === toIdx
      ) {
        return;
      }
      const newOrder = orderedColumns.map((c) => c.id);
      const [moved] = newOrder.splice(fromIdx, 1);
      newOrder.splice(toIdx, 0, moved);
      setInternalColumnOrder(newOrder);
      if (onColumnReorder) {
        onColumnReorder(newOrder);
      }
    },
    [onColumnReorder, orderedColumns]
  );

  // Column Widths
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const widths: Record<string, number> = {};
    columns.forEach((col) => {
      widths[col.id] = col.width || 150;
    });
    return widths;
  });

  useEffect(() => {
    setColumnWidths((prev) => {
      const updated = { ...prev };
      let changed = false;
      columns.forEach((col) => {
        if (updated[col.id] === undefined && col.width) {
          updated[col.id] = col.width;
          changed = true;
        }
      });
      return changed ? updated : prev;
    });
  }, [columns]);

  // Selection
  const [internalSelectedIds, setInternalSelectedIds] = useState<Set<string | number>>(
    new Set()
  );
  const activeSelectedIds = selectedRowIds ?? internalSelectedIds;

  // Active Focus Coordinates [rowIndex (-1 for header), colIndex]
  const [focusedCell, setFocusedCell] = useState<{ row: number; col: number }>({
    row: -1,
    col: 0,
  });
  const [liveAnnouncement, setLiveAnnouncement] = useState<string>('');

  // Dragging state for column reorder
  const [draggedColIdx, setDraggedColIdx] = useState<number | null>(null);

  // Filtering
  const filteredData = useMemo(() => {
    return filterGridData(data, orderedColumns, filterQuery, filterPredicate);
  }, [data, orderedColumns, filterQuery, filterPredicate]);

  // Measure viewport height
  useEffect(() => {
    if (viewportRef.current && typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.contentRect.height > 0) {
            setViewportHeight(entry.contentRect.height);
          }
        }
      });
      observer.observe(viewportRef.current);
      return () => observer.disconnect();
    }
  }, []);

  // Handle Scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  // Virtual Window Calculation
  const virtualWindow = useMemo(() => {
    return calculateVirtualWindow({
      totalRows: filteredData.length,
      rowHeight,
      viewportHeight,
      scrollTop,
      overscan,
    });
  }, [filteredData.length, rowHeight, viewportHeight, scrollTop, overscan]);

  // Slice visible rows
  const visibleRows = useMemo(() => {
    return filteredData.slice(virtualWindow.startIndex, virtualWindow.endIndex);
  }, [filteredData, virtualWindow.startIndex, virtualWindow.endIndex]);

  // Cell Value Resolver
  const getCellValue = useCallback((row: T, col: ColumnDef<T>, rowIndex: number) => {
    if (col.cell) {
      const rawVal = col.accessorFn
        ? col.accessorFn(row)
        : col.accessorKey
        ? row[col.accessorKey]
        : (row as any)[col.id];
      return col.cell({ row, value: rawVal, rowIndex });
    }
    if (col.accessorFn) return col.accessorFn(row);
    if (col.accessorKey) return row[col.accessorKey];
    return (row as any)[col.id];
  }, []);

  // Row Selection Toggle
  const toggleRowSelection = useCallback(
    (row: T, index: number) => {
      const id = getRowId(row, index);
      const next = new Set(activeSelectedIds);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      setInternalSelectedIds(next);

      if (onSelectionChange) {
        const selectedList = filteredData.filter((r, i) => next.has(getRowId(r, i)));
        onSelectionChange(selectedList);
      }
    },
    [activeSelectedIds, filteredData, getRowId, onSelectionChange]
  );

  // Announce active cell to screen reader
  const announceCell = useCallback(
    (rowIdx: number, colIdx: number) => {
      if (colIdx < 0 || colIdx >= orderedColumns.length) return;
      const col = orderedColumns[colIdx];
      const colTitle = typeof col.header === 'string' ? col.header : col.id;

      if (rowIdx === -1) {
        setLiveAnnouncement(`Header: Column ${colIdx + 1}, ${colTitle}`);
      } else if (rowIdx >= 0 && rowIdx < filteredData.length) {
        const row = filteredData[rowIdx];
        const val = getCellValue(row, col, rowIdx);
        const displayVal = typeof val === 'object' && val !== null ? col.id : String(val ?? '');
        setLiveAnnouncement(
          `Row ${rowIdx + 1} of ${filteredData.length}, Column ${colIdx + 1} (${colTitle}): ${displayVal}`
        );
      }
    },
    [filteredData, getCellValue, orderedColumns]
  );

  // Ensure cell is scrolled into view when focused
  useEffect(() => {
    if (focusedCell.row >= 0 && viewportRef.current) {
      const targetTop = focusedCell.row * rowHeight;
      const currentScroll = viewportRef.current.scrollTop;
      const viewH = viewportRef.current.clientHeight;

      if (targetTop < currentScroll) {
        viewportRef.current.scrollTop = targetTop;
      } else if (targetTop + rowHeight > currentScroll + viewH) {
        viewportRef.current.scrollTop = targetTop + rowHeight - viewH;
      }
    }
  }, [focusedCell.row, rowHeight]);

  // Keyboard navigation handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const maxRow = filteredData.length - 1;
      const maxCol = orderedColumns.length - 1;

      // Handle Column Reorder with Alt+Arrow
      if (e.altKey && focusedCell.row === -1) {
        if (e.key === 'ArrowLeft' && focusedCell.col > 0) {
          e.preventDefault();
          moveColumn(focusedCell.col, focusedCell.col - 1);
          setFocusedCell((prev) => ({ ...prev, col: prev.col - 1 }));
          return;
        }
        if (e.key === 'ArrowRight' && focusedCell.col < maxCol) {
          e.preventDefault();
          moveColumn(focusedCell.col, focusedCell.col + 1);
          setFocusedCell((prev) => ({ ...prev, col: prev.col + 1 }));
          return;
        }
      }

      let nextRow = focusedCell.row;
      let nextCol = focusedCell.col;
      let handled = false;

      switch (e.key) {
        case 'ArrowDown':
          nextRow = Math.min(maxRow, focusedCell.row + 1);
          handled = true;
          break;
        case 'ArrowUp':
          nextRow = Math.max(-1, focusedCell.row - 1);
          handled = true;
          break;
        case 'ArrowRight':
          nextCol = Math.min(maxCol, focusedCell.col + 1);
          handled = true;
          break;
        case 'ArrowLeft':
          nextCol = Math.max(0, focusedCell.col - 1);
          handled = true;
          break;
        case 'Home':
          if (e.ctrlKey || e.metaKey) {
            nextRow = 0;
            nextCol = 0;
          } else {
            nextCol = 0;
          }
          handled = true;
          break;
        case 'End':
          if (e.ctrlKey || e.metaKey) {
            nextRow = maxRow;
            nextCol = maxCol;
          } else {
            nextCol = maxCol;
          }
          handled = true;
          break;
        case 'PageDown': {
          const pageSize = Math.max(1, Math.floor(viewportHeight / rowHeight));
          nextRow = Math.min(maxRow, focusedCell.row + pageSize);
          handled = true;
          break;
        }
        case 'PageUp': {
          const pageSize = Math.max(1, Math.floor(viewportHeight / rowHeight));
          nextRow = Math.max(0, focusedCell.row - pageSize);
          handled = true;
          break;
        }
        case ' ':
        case 'Enter':
          if (focusedCell.row >= 0 && focusedCell.row <= maxRow) {
            const row = filteredData[focusedCell.row];
            toggleRowSelection(row, focusedCell.row);
            if (onRowClick) onRowClick(row, focusedCell.row);
            handled = true;
          }
          break;
      }

      if (handled) {
        e.preventDefault();
        setFocusedCell({ row: nextRow, col: nextCol });
        announceCell(nextRow, nextCol);

        // Focus corresponding DOM element if mounted
        const targetSelector =
          nextRow === -1
            ? `[data-grid-id="${gridId}"] [role="columnheader"][aria-colindex="${nextCol + 1}"]`
            : `[data-grid-id="${gridId}"] [role="row"][aria-rowindex="${nextRow + 2}"] [role="gridcell"][aria-colindex="${nextCol + 1}"]`;
        const el = document.querySelector<HTMLElement>(targetSelector);
        if (el) el.focus();
      }
    },
    [
      announceCell,
      filteredData,
      focusedCell.col,
      focusedCell.row,
      gridId,
      moveColumn,
      onRowClick,
      orderedColumns.length,
      rowHeight,
      toggleRowSelection,
      viewportHeight,
    ]
  );

  // Column Resize Drag Handler
  const startResize = useCallback(
    (colId: string, startX: number, initialWidth: number, minW = 50, maxW = 1200) => {
      return (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const onMouseMove = (moveEvent: globalThis.MouseEvent) => {
          const delta = moveEvent.clientX - startX;
          const newWidth = Math.min(maxW, Math.max(minW, initialWidth + delta));
          setColumnWidths((prev) => ({ ...prev, [colId]: newWidth }));
          if (onColumnResize) {
            onColumnResize(colId, newWidth);
          }
        };

        const onMouseUp = () => {
          window.removeEventListener('mousemove', onMouseMove);
          window.removeEventListener('mouseup', onMouseUp);
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
      };
    },
    [onColumnResize]
  );

  const totalGridWidth = useMemo(() => {
    return orderedColumns.reduce((sum, col) => sum + (columnWidths[col.id] || col.width || 150), 0);
  }, [orderedColumns, columnWidths]);

  return (
    <div
      data-grid-id={gridId}
      data-density={density}
      className={`copper-data-grid ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height,
        width,
        backgroundColor: 'var(--copper-surface-container, #161616)',
        color: 'var(--copper-on-surface, #e0e0e0)',
        fontFamily:
          density === 'dense'
            ? 'var(--copper-font-mono, "JetBrains Mono", monospace)'
            : 'var(--copper-font-sans, "Inter", -apple-system, sans-serif)',
        fontSize: density === 'dense' ? 12 : density === 'compact' ? 13 : 14,
        fontVariantNumeric: 'tabular-nums',
        border: '1px solid var(--copper-outline-variant, #2e2e2e)',
        borderRadius: 4,
        position: 'relative',
        userSelect: 'none',
        ...style,
      }}
    >
      {/* Screen Reader Live Region for Announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        {liveAnnouncement}
      </div>

      {/* Main Grid Viewport */}
      <div
        ref={viewportRef}
        data-grid-viewport="true"
        role="grid"
        tabIndex={0}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-rowcount={filteredData.length + 1}
        aria-colcount={orderedColumns.length}
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
        style={{
          flex: 1,
          overflowX: 'auto',
          overflowY: 'auto',
          position: 'relative',
          outline: 'none',
        }}
      >
        <div style={{ minWidth: totalGridWidth, position: 'relative' }}>
          {/* Header Row */}
          <div
            role="row"
            aria-rowindex={1}
            data-header="true"
            data-sticky-header={stickyHeader}
            style={{
              display: 'flex',
              position: stickyHeader ? 'sticky' : 'relative',
              top: 0,
              zIndex: 10,
              height: rowHeight,
              backgroundColor: 'var(--copper-surface-container-high, #242424)',
              borderBottom: '1px solid var(--copper-outline, #3d3d3d)',
              fontWeight: 600,
            }}
          >
            {orderedColumns.map((col, colIdx) => {
              const colWidth = columnWidths[col.id] || col.width || 150;
              const isFocused = focusedCell.row === -1 && focusedCell.col === colIdx;
              const headerText = typeof col.header === 'string' ? col.header : col.id;

              return (
                <div
                  key={col.id}
                  role="columnheader"
                  aria-colindex={colIdx + 1}
                  tabIndex={isFocused ? 0 : -1}
                  draggable={col.reorderable !== false}
                  onDragStart={() => setDraggedColIdx(colIdx)}
                  onDragOver={(e: DragEvent) => {
                    if (draggedColIdx !== null && draggedColIdx !== colIdx) {
                      e.preventDefault();
                    }
                  }}
                  onDrop={(e: DragEvent) => {
                    e.preventDefault();
                    if (draggedColIdx !== null) {
                      moveColumn(draggedColIdx, colIdx);
                      setDraggedColIdx(null);
                    }
                  }}
                  onFocus={() => {
                    setFocusedCell({ row: -1, col: colIdx });
                    announceCell(-1, colIdx);
                  }}
                  style={{
                    width: colWidth,
                    minWidth: col.minWidth || 50,
                    maxWidth: col.maxWidth,
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent:
                      col.align === 'right'
                        ? 'flex-end'
                        : col.align === 'center'
                        ? 'center'
                        : 'flex-start',
                    padding: '0 8px',
                    position: 'relative',
                    boxSizing: 'border-box',
                    borderRight: '1px solid var(--copper-outline-variant, #2e2e2e)',
                    outline: isFocused ? '2px solid var(--copper-primary, #B87333)' : 'none',
                    outlineOffset: -2,
                    cursor: col.reorderable !== false ? 'grab' : 'default',
                  }}
                >
                  <span
                    style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {col.header}
                  </span>

                  {/* Resize Handle with Keyboard & Mouse Accessibility */}
                  {col.resizable !== false && (
                    <div
                      data-resize-handle="true"
                      role="slider"
                      aria-orientation="vertical"
                      aria-label={`Resize column ${headerText}`}
                      aria-valuenow={colWidth}
                      aria-valuemin={col.minWidth || 50}
                      aria-valuemax={col.maxWidth || 1200}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'ArrowLeft') {
                          e.preventDefault();
                          const nextW = Math.max(col.minWidth || 50, colWidth - 10);
                          setColumnWidths((prev) => ({ ...prev, [col.id]: nextW }));
                          if (onColumnResize) onColumnResize(col.id, nextW);
                        } else if (e.key === 'ArrowRight') {
                          e.preventDefault();
                          const nextW = Math.min(col.maxWidth || 1200, colWidth + 10);
                          setColumnWidths((prev) => ({ ...prev, [col.id]: nextW }));
                          if (onColumnResize) onColumnResize(col.id, nextW);
                        }
                      }}
                      onMouseDown={(e) =>
                        startResize(col.id, e.clientX, colWidth, col.minWidth, col.maxWidth)(e)
                      }
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: 0,
                        bottom: 0,
                        width: 6,
                        cursor: 'col-resize',
                        zIndex: 2,
                        background: 'transparent',
                        border: 'none',
                        padding: 0,
                        margin: 0,
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Virtual Body Area */}
          <div
            role="rowgroup"
            style={{
              height: virtualWindow.totalHeight,
              position: 'relative',
            }}
          >
            {filteredData.length === 0 ? (
              <div
                style={{
                  padding: 24,
                  textAlign: 'center',
                  color: 'var(--copper-on-surface-variant, #888)',
                }}
              >
                {emptyMessage}
              </div>
            ) : (
              <div
                style={{
                  position: 'absolute',
                  top: virtualWindow.topOffset,
                  left: 0,
                  right: 0,
                }}
              >
                {visibleRows.map((row, relativeIdx) => {
                  const absoluteIdx = virtualWindow.startIndex + relativeIdx;
                  const rowId = getRowId(row, absoluteIdx);
                  const isSelected = activeSelectedIds.has(rowId);
                  const isRowFocused = focusedCell.row === absoluteIdx;

                  return (
                    <div
                      key={String(rowId)}
                      role="row"
                      tabIndex={-1}
                      aria-rowindex={absoluteIdx + 2} // 1-indexed after header
                      aria-selected={isSelected}
                      onClick={() => {
                        toggleRowSelection(row, absoluteIdx);
                        if (onRowClick) onRowClick(row, absoluteIdx);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          toggleRowSelection(row, absoluteIdx);
                          if (onRowClick) onRowClick(row, absoluteIdx);
                        }
                      }}
                      style={{
                        display: 'flex',
                        height: rowHeight,
                        backgroundColor: isSelected
                          ? 'var(--copper-primary-container, #3A2B20)'
                          : absoluteIdx % 2 === 0
                          ? 'var(--copper-surface-container-low, #181818)'
                          : 'var(--copper-surface-container, #161616)',
                        borderBottom: '1px solid var(--copper-outline-variant, #252525)',
                        cursor: onRowClick || onSelectionChange ? 'pointer' : 'default',
                        transition: 'background-color 100ms ease',
                      }}
                    >
                      {orderedColumns.map((col, colIdx) => {
                        const colWidth = columnWidths[col.id] || col.width || 150;
                        const isCellFocused = isRowFocused && focusedCell.col === colIdx;
                        const cellVal = getCellValue(row, col, absoluteIdx);
                        const colHeaderStr =
                          typeof col.header === 'string' ? col.header : col.id;
                        const cellDisplayStr =
                          typeof cellVal === 'object' && cellVal !== null
                            ? col.id
                            : String(cellVal ?? '');

                        return (
                          <div
                            key={col.id}
                            role="gridcell"
                            aria-colindex={colIdx + 1}
                            aria-label={`${colHeaderStr}: ${cellDisplayStr}`}
                            tabIndex={isCellFocused ? 0 : -1}
                            onFocus={() => {
                              setFocusedCell({ row: absoluteIdx, col: colIdx });
                              announceCell(absoluteIdx, colIdx);
                            }}
                            style={{
                              width: colWidth,
                              minWidth: col.minWidth || 50,
                              maxWidth: col.maxWidth,
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent:
                                col.align === 'right'
                                  ? 'flex-end'
                                  : col.align === 'center'
                                  ? 'center'
                                  : 'flex-start',
                              padding: '0 8px',
                              boxSizing: 'border-box',
                              borderRight: '1px solid var(--copper-outline-variant, #222)',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              outline: isCellFocused
                                ? '2px solid var(--copper-primary, #B87333)'
                                : 'none',
                              outlineOffset: -2,
                            }}
                          >
                            {cellVal}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
