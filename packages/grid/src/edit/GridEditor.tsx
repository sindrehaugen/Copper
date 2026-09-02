import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
  type ReactNode,
  type KeyboardEvent,
  type ChangeEvent,
} from 'react';
import {
  DataGrid,
  type ColumnDef,
  type DataGridProps,
} from '../DataGrid';

export type EditorType = 'text' | 'number' | 'select' | 'checkbox' | 'date' | 'custom';

export interface SelectOption {
  label: string;
  value: any;
}

export interface EditorRenderProps<T> {
  row: T;
  column: EditableColumnDef<T>;
  value: any;
  onChange: (newValue: any) => void;
  onCommit: () => void;
  onCancel: () => void;
  autoFocus?: boolean;
  disabled?: boolean;
}

export interface EditableColumnDef<T> extends ColumnDef<T> {
  editable?: boolean | ((row: T) => boolean);
  editorType?: EditorType;
  options?: SelectOption[];
  validate?: (value: any, row: T) => boolean | string | null | undefined;
  renderEditor?: (props: EditorRenderProps<T>) => ReactNode;
  formatDisplayValue?: (value: any, row: T) => ReactNode;
  parseEditValue?: (inputValue: any, row: T) => any;
}

export interface SaveCommitParams<T> {
  rowId: string | number;
  columnId: string;
  newValue: any;
  previousValue: any;
  updatedRow: T;
  originalRow: T;
}

export interface CommitErrorParams<T> {
  rowId: string | number;
  columnId: string;
  attemptedValue: any;
  previousValue: any;
  error: Error | unknown;
  originalRow: T;
}

export interface CommitSuccessParams<T> {
  rowId: string | number;
  columnId: string;
  newValue: any;
  previousValue: any;
  updatedRow: T;
}

export interface ActiveEditState {
  rowId: string | number;
  rowIndex: number;
  columnId: string;
  originalValue: any;
  draftValue: any;
  validationError?: string | null;
}

export interface UseGridEditorOptions<T> {
  data: T[];
  columns: EditableColumnDef<T>[];
  getRowId?: (row: T, index: number) => string | number;
  onSave?: (params: SaveCommitParams<T>) => Promise<T | void>;
  onDataChange?: (newData: T[]) => void;
  onCommitSuccess?: (params: CommitSuccessParams<T>) => void;
  onCommitError?: (params: CommitErrorParams<T>) => void;
}

export function useGridEditor<T>({
  data,
  columns,
  getRowId = (row: any, idx: number) => row.id ?? idx,
  onSave,
  onDataChange,
  onCommitSuccess,
  onCommitError,
}: UseGridEditorOptions<T>) {
  const [gridData, setGridData] = useState<T[]>(data);
  const [activeEdit, setActiveEdit] = useState<ActiveEditState | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [savingCells, setSavingCells] = useState<Set<string>>(new Set());

  // Sync internal data when external data changes and no active edit is in progress
  useEffect(() => {
    setGridData(data);
  }, [data]);

  const getCellValue = useCallback((row: T, col: EditableColumnDef<T>) => {
    if (col.accessorFn) return col.accessorFn(row);
    if (col.accessorKey) return row[col.accessorKey as keyof T];
    return (row as any)[col.id];
  }, []);

  const isCellEditable = useCallback(
    (row: T, col: EditableColumnDef<T>) => {
      if (typeof col.editable === 'function') {
        return Boolean(col.editable(row));
      }
      return Boolean(col.editable);
    },
    []
  );

  const startEditing = useCallback(
    (row: T, col: EditableColumnDef<T>, rowIndex: number) => {
      if (!isCellEditable(row, col)) return;
      const rowId = getRowId(row, rowIndex);
      const val = getCellValue(row, col);
      setActiveEdit({
        rowId,
        rowIndex,
        columnId: col.id,
        originalValue: val,
        draftValue: val ?? '',
        validationError: null,
      });
      setErrorMessage(null);
    },
    [getCellValue, getRowId, isCellEditable]
  );

  const cancelEditing = useCallback(() => {
    setActiveEdit(null);
  }, []);

  const updateDraftValue = useCallback((newValue: any) => {
    setActiveEdit((prev) => (prev ? { ...prev, draftValue: newValue, validationError: null } : null));
  }, []);

  const commitEdit = useCallback(async () => {
    if (!activeEdit) return;

    const { rowId, columnId, draftValue, originalValue } = activeEdit;
    const col = columns.find((c) => c.id === columnId);
    if (!col) {
      setActiveEdit(null);
      return;
    }

    const currentRow = gridData.find((r, i) => getRowId(r, i) === rowId);
    if (!currentRow) {
      setActiveEdit(null);
      return;
    }

    // Validation
    if (col.validate) {
      const validationResult = col.validate(draftValue, currentRow);
      if (typeof validationResult === 'string' && validationResult.length > 0) {
        setActiveEdit((prev) => (prev ? { ...prev, validationError: validationResult } : null));
        return;
      }
      if (validationResult === false) {
        setActiveEdit((prev) => (prev ? { ...prev, validationError: 'Invalid value' } : null));
        return;
      }
    }

    // Parse value if parser provided
    let finalValue = draftValue;
    if (col.parseEditValue) {
      finalValue = col.parseEditValue(draftValue, currentRow);
    } else if (col.editorType === 'number') {
      finalValue = draftValue === '' ? null : Number(draftValue);
    }

    // No change check
    if (finalValue === originalValue) {
      setActiveEdit(null);
      return;
    }

    // 1. Optimistic Update
    const originalRowCopy = { ...currentRow };
    const updatedRow: T = {
      ...currentRow,
      ...(col.accessorKey ? { [col.accessorKey]: finalValue } : { [col.id]: finalValue }),
    };

    const nextData = gridData.map((r, i) => (getRowId(r, i) === rowId ? updatedRow : r));
    setGridData(nextData);
    if (onDataChange) {
      onDataChange(nextData);
    }

    // Close edit input immediately for optimistic responsiveness
    setActiveEdit(null);
    const cellKey = `${String(rowId)}:${columnId}`;
    setSavingCells((prev) => new Set(prev).add(cellKey));

    // 2. Perform Async Save
    if (onSave) {
      try {
        const result = await onSave({
          rowId,
          columnId,
          newValue: finalValue,
          previousValue: originalValue,
          updatedRow,
          originalRow: originalRowCopy,
        });

        setSavingCells((prev) => {
          const next = new Set(prev);
          next.delete(cellKey);
          return next;
        });

        const committedRow = (result && typeof result === 'object' ? result : updatedRow) as T;
        if (onCommitSuccess) {
          onCommitSuccess({
            rowId,
            columnId,
            newValue: finalValue,
            previousValue: originalValue,
            updatedRow: committedRow,
          });
        }
      } catch (err: any) {
        // 3. Rollback on Failure
        setSavingCells((prev) => {
          const next = new Set(prev);
          next.delete(cellKey);
          return next;
        });

        const rolledBackData = gridData.map((r, i) => (getRowId(r, i) === rowId ? originalRowCopy : r));
        setGridData(rolledBackData);
        if (onDataChange) {
          onDataChange(rolledBackData);
        }

        const errMsg = err?.message || 'Failed to save cell change';
        setErrorMessage(errMsg);

        if (onCommitError) {
          onCommitError({
            rowId,
            columnId,
            attemptedValue: finalValue,
            previousValue: originalValue,
            error: err,
            originalRow: originalRowCopy,
          });
        }
      }
    } else {
      setSavingCells((prev) => {
        const next = new Set(prev);
        next.delete(cellKey);
        return next;
      });
      if (onCommitSuccess) {
        onCommitSuccess({
          rowId,
          columnId,
          newValue: finalValue,
          previousValue: originalValue,
          updatedRow,
        });
      }
    }
  }, [
    activeEdit,
    columns,
    gridData,
    getRowId,
    onDataChange,
    onSave,
    onCommitSuccess,
    onCommitError,
  ]);

  // Transform columns to inject interactive inline editors
  const augmentedColumns = useMemo(() => {
    return columns.map((col) => {
      const originalCell = col.cell;

      return {
        ...col,
        cell: (info: { row: T; value: any; rowIndex: number }) => {
          const { row, value, rowIndex } = info;
          const rowId = getRowId(row, rowIndex);
          const isEditing =
            activeEdit?.rowId === rowId && activeEdit?.columnId === col.id;
          const isSaving = savingCells.has(`${String(rowId)}:${col.id}`);
          const colHeaderStr =
            typeof col.header === 'string' ? col.header : col.id;

          if (isEditing) {
            return (
              <CellEditorContainer
                row={row}
                column={col}
                value={activeEdit.draftValue}
                validationError={activeEdit.validationError}
                onChange={updateDraftValue}
                onCommit={commitEdit}
                onCancel={cancelEditing}
                headerTitle={colHeaderStr}
              />
            );
          }

          const renderedContent = originalCell
            ? originalCell(info)
            : col.formatDisplayValue
            ? col.formatDisplayValue(value, row)
            : typeof value === 'boolean'
            ? String(value)
            : (value ?? '');

          const editable = isCellEditable(row, col);

          return (
            <div
              data-editable-cell="true"
              data-is-editable={editable}
              data-is-saving={isSaving}
              onDoubleClick={(e) => {
                e.stopPropagation();
                startEditing(row, col, rowIndex);
              }}
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                cursor: editable ? 'cell' : 'inherit',
                opacity: isSaving ? 0.6 : 1,
                position: 'relative',
              }}
              title={editable ? `Double-click to edit ${colHeaderStr}` : undefined}
            >
              {renderedContent}
              {isSaving && (
                <span
                  style={{
                    marginLeft: 6,
                    fontSize: 10,
                    color: 'var(--copper-primary, #B87333)',
                  }}
                >
                  ●
                </span>
              )}
            </div>
          );
        },
      };
    });
  }, [
    columns,
    activeEdit,
    savingCells,
    getRowId,
    isCellEditable,
    updateDraftValue,
    commitEdit,
    cancelEditing,
    startEditing,
  ]);

  return {
    gridData,
    setGridData,
    activeEdit,
    errorMessage,
    clearErrorMessage: () => setErrorMessage(null),
    savingCells,
    augmentedColumns,
    startEditing,
    cancelEditing,
    updateDraftValue,
    commitEdit,
  };
}

interface CellEditorContainerProps<T> {
  row: T;
  column: EditableColumnDef<T>;
  value: any;
  validationError?: string | null;
  onChange: (val: any) => void;
  onCommit: () => void;
  onCancel: () => void;
  headerTitle: string;
}

function CellEditorContainer<T>({
  row,
  column,
  value,
  validationError,
  onChange,
  onCommit,
  onCancel,
  headerTitle,
}: CellEditorContainerProps<T>) {
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement | null>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      if ('select' in inputRef.current && typeof inputRef.current.select === 'function') {
        inputRef.current.select();
      }
    }
  }, []);

  const handleKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      onCommit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      onCancel();
    }
  };

  if (column.renderEditor) {
    return (
      <div style={{ width: '100%', position: 'relative' }}>
        {column.renderEditor({
          row,
          column,
          value,
          onChange,
          onCommit,
          onCancel,
          autoFocus: true,
        })}
        {validationError && <ValidationErrorTooltip error={validationError} />}
      </div>
    );
  }

  const editorType = column.editorType || 'text';

  const baseInputStyle: React.CSSProperties = {
    width: '100%',
    height: '28px',
    backgroundColor: 'var(--copper-surface-container-highest, #2c2c2c)',
    color: 'var(--copper-on-surface, #ffffff)',
    border: validationError
      ? '1px solid var(--copper-error, #cf6679)'
      : '1px solid var(--copper-primary, #B87333)',
    borderRadius: 3,
    padding: '0 6px',
    fontSize: 13,
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  };

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
      }}
    >
      {editorType === 'select' ? (
        <select
          ref={inputRef as React.RefObject<HTMLSelectElement>}
          aria-label={`Edit ${headerTitle}`}
          value={value ?? ''}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={onCommit}
          style={baseInputStyle}
        >
          {column.options?.map((opt) => (
            <option key={String(opt.value)} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : editorType === 'checkbox' ? (
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type="checkbox"
          aria-label={`Edit ${headerTitle}`}
          checked={Boolean(value)}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.checked)}
          onKeyDown={handleKeyDown}
          onBlur={onCommit}
          style={{
            accentColor: 'var(--copper-primary, #B87333)',
            cursor: 'pointer',
            margin: '0 4px',
          }}
        />
      ) : (
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type={editorType === 'number' ? 'number' : editorType === 'date' ? 'date' : 'text'}
          aria-label={`Edit ${headerTitle}`}
          value={value ?? ''}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={onCommit}
          style={baseInputStyle}
        />
      )}

      {validationError && <ValidationErrorTooltip error={validationError} />}
    </div>
  );
}

function ValidationErrorTooltip({ error }: { error: string }) {
  return (
    <div
      role="alert"
      style={{
        position: 'absolute',
        top: '100%',
        left: 0,
        zIndex: 50,
        backgroundColor: 'var(--copper-error-container, #4f1d24)',
        color: 'var(--copper-on-error, #ffb4ab)',
        fontSize: 11,
        padding: '2px 6px',
        borderRadius: 3,
        border: '1px solid var(--copper-error, #cf6679)',
        marginTop: 2,
        whiteSpace: 'nowrap',
        boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
      }}
    >
      {error}
    </div>
  );
}

export interface GridEditorProps<T>
  extends Omit<DataGridProps<T>, 'columns'>,
    UseGridEditorOptions<T> {
  columns: EditableColumnDef<T>[];
  showErrorBanner?: boolean;
}

export function GridEditor<T>({
  data,
  columns,
  getRowId = (row: any, idx: number) => row.id ?? idx,
  onSave,
  onDataChange,
  onCommitSuccess,
  onCommitError,
  showErrorBanner = true,
  className = '',
  style,
  ...dataGridProps
}: GridEditorProps<T>) {
  const {
    gridData,
    errorMessage,
    clearErrorMessage,
    augmentedColumns,
  } = useGridEditor({
    data,
    columns,
    getRowId,
    onSave,
    onDataChange,
    onCommitSuccess,
    onCommitError,
  });

  return (
    <div
      className={`copper-grid-editor-wrapper ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        ...style,
      }}
    >
      {showErrorBanner && errorMessage && (
        <div
          role="alert"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            marginBottom: 8,
            backgroundColor: 'var(--copper-error-container, #4A1A20)',
            color: 'var(--copper-on-error-container, #FFDADA)',
            border: '1px solid var(--copper-error, #BA1A1A)',
            borderRadius: 4,
            fontSize: 13,
          }}
        >
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={clearErrorMessage}
            aria-label="Dismiss error"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'inherit',
              cursor: 'pointer',
              fontWeight: 600,
              marginLeft: 8,
            }}
          >
            ✕
          </button>
        </div>
      )}

      <DataGrid
        data={gridData}
        columns={augmentedColumns}
        getRowId={getRowId}
        {...dataGridProps}
      />
    </div>
  );
}
