import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useId,
  type ReactNode,
} from 'react';
import {
  DataGrid,
  type ColumnDef,
  type DataGridProps,
  type Density,
} from '../DataGrid';

export type FilterOperator =
  | 'equals'
  | 'notEquals'
  | 'contains'
  | 'notContains'
  | 'startsWith'
  | 'endsWith'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'in'
  | 'notIn'
  | 'empty'
  | 'notEmpty';

export interface ColumnFilter {
  columnId: string;
  operator: FilterOperator;
  value?: any;
}

export type SortDirection = 'asc' | 'desc';

export interface SortRule {
  columnId: string;
  direction: SortDirection;
}

export interface GridViewState {
  visibleColumnIds?: string[];
  columnOrder?: string[];
  columnWidths?: Record<string, number>;
  density?: Density;
  filterQuery?: string;
  columnFilters?: ColumnFilter[];
  sort?: SortRule[];
}

export interface GridView extends GridViewState {
  id: string;
  name: string;
  description?: string;
  userId?: string;
  lensKey?: string;
  isDefault?: boolean;
  createdAt?: number;
  updatedAt?: number;
}

export interface GridViewStorage {
  loadViews(lensKey: string, userId?: string): Promise<GridView[]> | GridView[];
  saveView(lensKey: string, view: GridView, userId?: string): Promise<void> | void;
  deleteView(lensKey: string, viewId: string, userId?: string): Promise<void> | void;
  getActiveViewId?(lensKey: string, userId?: string): Promise<string | null> | string | null;
  setActiveViewId?(lensKey: string, viewId: string, userId?: string): Promise<void> | void;
}

export class LocalStorageGridViewStorage implements GridViewStorage {
  private prefix: string;

  constructor(prefix: string = 'copper:grid:views') {
    this.prefix = prefix;
  }

  private getKey(lensKey: string, userId?: string): string {
    return `${this.prefix}:${userId || 'anon'}:${lensKey}`;
  }

  private getActiveKey(lensKey: string, userId?: string): string {
    return `${this.prefix}:active:${userId || 'anon'}:${lensKey}`;
  }

  loadViews(lensKey: string, userId?: string): GridView[] {
    if (typeof localStorage === 'undefined') return [];
    try {
      const raw = localStorage.getItem(this.getKey(lensKey, userId));
      if (!raw) return [];
      return JSON.parse(raw) as GridView[];
    } catch {
      return [];
    }
  }

  saveView(lensKey: string, view: GridView, userId?: string): void {
    if (typeof localStorage === 'undefined') return;
    const views = this.loadViews(lensKey, userId);
    const index = views.findIndex((v) => v.id === view.id);
    const now = Date.now();
    const record: GridView = {
      ...view,
      lensKey,
      userId,
      updatedAt: now,
      createdAt: view.createdAt || now,
    };
    if (index >= 0) {
      views[index] = record;
    } else {
      views.push(record);
    }
    localStorage.setItem(this.getKey(lensKey, userId), JSON.stringify(views));
  }

  deleteView(lensKey: string, viewId: string, userId?: string): void {
    if (typeof localStorage === 'undefined') return;
    const views = this.loadViews(lensKey, userId).filter((v) => v.id !== viewId);
    localStorage.setItem(this.getKey(lensKey, userId), JSON.stringify(views));
  }

  getActiveViewId(lensKey: string, userId?: string): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(this.getActiveKey(lensKey, userId));
  }

  setActiveViewId(lensKey: string, viewId: string, userId?: string): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(this.getActiveKey(lensKey, userId), viewId);
  }
}

export class MemoryGridViewStorage implements GridViewStorage {
  private store: Map<string, GridView[]> = new Map();
  private activeStore: Map<string, string> = new Map();

  private getKey(lensKey: string, userId?: string): string {
    return `${userId || 'anon'}:${lensKey}`;
  }

  loadViews(lensKey: string, userId?: string): GridView[] {
    return this.store.get(this.getKey(lensKey, userId)) || [];
  }

  saveView(lensKey: string, view: GridView, userId?: string): void {
    const key = this.getKey(lensKey, userId);
    const views = this.loadViews(lensKey, userId).slice();
    const index = views.findIndex((v) => v.id === view.id);
    const now = Date.now();
    const record: GridView = {
      ...view,
      lensKey,
      userId,
      updatedAt: now,
      createdAt: view.createdAt || now,
    };
    if (index >= 0) {
      views[index] = record;
    } else {
      views.push(record);
    }
    this.store.set(key, views);
  }

  deleteView(lensKey: string, viewId: string, userId?: string): void {
    const key = this.getKey(lensKey, userId);
    const views = this.loadViews(lensKey, userId).filter((v) => v.id !== viewId);
    this.store.set(key, views);
  }

  getActiveViewId(lensKey: string, userId?: string): string | null {
    return this.activeStore.get(this.getKey(lensKey, userId)) || null;
  }

  setActiveViewId(lensKey: string, viewId: string, userId?: string): void {
    this.activeStore.set(this.getKey(lensKey, userId), viewId);
  }
}

export const defaultGridViewStorage = new LocalStorageGridViewStorage();

export function serializeViewState(state: GridViewState): string {
  try {
    const json = JSON.stringify(state);
    if (typeof window !== 'undefined' && typeof window.btoa === 'function') {
      return encodeURIComponent(window.btoa(unescape(encodeURIComponent(json))));
    }
    if (typeof Buffer !== 'undefined') {
      return encodeURIComponent(Buffer.from(json, 'utf8').toString('base64'));
    }
    return encodeURIComponent(json);
  } catch {
    return '';
  }
}

export function deserializeViewState(encoded: string): GridViewState | null {
  if (!encoded || typeof encoded !== 'string') return null;
  try {
    const decodedStr = decodeURIComponent(encoded);
    if (decodedStr.startsWith('{') && decodedStr.endsWith('}')) {
      return JSON.parse(decodedStr) as GridViewState;
    }
    let json = '';
    if (typeof window !== 'undefined' && typeof window.atob === 'function') {
      json = decodeURIComponent(escape(window.atob(decodedStr)));
    } else if (typeof Buffer !== 'undefined') {
      json = Buffer.from(decodedStr, 'base64').toString('utf8');
    } else {
      json = decodedStr;
    }
    return JSON.parse(json) as GridViewState;
  } catch {
    return null;
  }
}

export function encodeViewStateToUrl(
  state: GridViewState,
  baseUrl?: string,
  paramName: string = 'grid_view'
): string {
  const serialized = serializeViewState(state);
  let urlObj: URL;
  try {
    if (baseUrl) {
      urlObj = new URL(baseUrl);
    } else if (typeof window !== 'undefined' && window.location) {
      urlObj = new URL(window.location.href);
    } else {
      urlObj = new URL('http://localhost');
    }
  } catch {
    urlObj = new URL('http://localhost');
  }
  urlObj.searchParams.set(paramName, serialized);
  return urlObj.toString();
}

export function decodeViewStateFromUrl(
  urlOrSearch: string | URLSearchParams | Location,
  paramName: string = 'grid_view'
): GridViewState | null {
  if (!urlOrSearch) return null;
  let rawParam: string | null = null;
  if (typeof urlOrSearch === 'string') {
    try {
      const urlObj = urlOrSearch.includes('://')
        ? new URL(urlOrSearch)
        : new URL(urlOrSearch, 'http://localhost');
      rawParam = urlObj.searchParams.get(paramName);
    } catch {
      const queryMatch = urlOrSearch.match(new RegExp(`[?&]${paramName}=([^&#]*)`));
      if (queryMatch) {
        rawParam = queryMatch[1];
      }
    }
  } else if (urlOrSearch instanceof URLSearchParams) {
    rawParam = urlOrSearch.get(paramName);
  } else if (typeof urlOrSearch === 'object' && 'search' in urlOrSearch) {
    const params = new URLSearchParams(urlOrSearch.search);
    rawParam = params.get(paramName);
  }
  if (!rawParam) return null;
  return deserializeViewState(rawParam);
}

export function applyGridViewFiltersAndSort<T>(
  data: T[],
  columns: ColumnDef<T>[],
  state: GridViewState
): T[] {
  if (!data || data.length === 0) return [];
  let result = [...data];

  const colMap = new Map(columns.map((c) => [c.id, c]));
  const getVal = (row: T, colId: string) => {
    const col = colMap.get(colId);
    if (!col) return (row as any)[colId];
    if (col.accessorFn) return col.accessorFn(row);
    if (col.accessorKey) return row[col.accessorKey as keyof T];
    return (row as any)[col.id];
  };

  // 1. Global Filter Query
  if (state.filterQuery && state.filterQuery.trim()) {
    const tokens = state.filterQuery.trim().toLowerCase().split(/\s+/);
    const accessors = columns.map((col) => {
      if (col.accessorFn) return col.accessorFn;
      if (col.accessorKey) return (row: T) => row[col.accessorKey as keyof T];
      return (row: T) => (row as any)[col.id];
    });
    result = result.filter((row) => {
      let corpus = '';
      for (let i = 0; i < accessors.length; i++) {
        const v = accessors[i](row);
        if (v !== undefined && v !== null) {
          corpus += ` ${String(v)}`;
        }
      }
      const lowerCorpus = corpus.toLowerCase();
      return tokens.every((token) => lowerCorpus.includes(token));
    });
  }

  // 2. Structured Column Filters
  if (state.columnFilters && state.columnFilters.length > 0) {
    for (const filter of state.columnFilters) {
      const { columnId, operator, value } = filter;
      result = result.filter((row) => {
        const cellVal = getVal(row, columnId);
        switch (operator) {
          case 'equals':
            if (value === undefined || value === null) return cellVal === value;
            return String(cellVal).toLowerCase() === String(value).toLowerCase();
          case 'notEquals':
            if (value === undefined || value === null) return cellVal !== value;
            return String(cellVal).toLowerCase() !== String(value).toLowerCase();
          case 'contains':
            return String(cellVal ?? '')
              .toLowerCase()
              .includes(String(value ?? '').toLowerCase());
          case 'notContains':
            return !String(cellVal ?? '')
              .toLowerCase()
              .includes(String(value ?? '').toLowerCase());
          case 'startsWith':
            return String(cellVal ?? '')
              .toLowerCase()
              .startsWith(String(value ?? '').toLowerCase());
          case 'endsWith':
            return String(cellVal ?? '')
              .toLowerCase()
              .endsWith(String(value ?? '').toLowerCase());
          case 'gt':
            return Number(cellVal) > Number(value);
          case 'gte':
            return Number(cellVal) >= Number(value);
          case 'lt':
            return Number(cellVal) < Number(value);
          case 'lte':
            return Number(cellVal) <= Number(value);
          case 'in':
            if (!Array.isArray(value)) return true;
            return value.map((v) => String(v).toLowerCase()).includes(String(cellVal).toLowerCase());
          case 'notIn':
            if (!Array.isArray(value)) return true;
            return !value.map((v) => String(v).toLowerCase()).includes(String(cellVal).toLowerCase());
          case 'empty':
            return cellVal === undefined || cellVal === null || cellVal === '';
          case 'notEmpty':
            return cellVal !== undefined && cellVal !== null && cellVal !== '';
          default:
            return true;
        }
      });
    }
  }

  // 3. Multi-Column Sorting
  if (state.sort && state.sort.length > 0) {
    result.sort((a, b) => {
      for (const rule of state.sort!) {
        const valA = getVal(a, rule.columnId);
        const valB = getVal(b, rule.columnId);

        if (valA === valB) continue;
        if (valA === undefined || valA === null) return 1;
        if (valB === undefined || valB === null) return -1;

        let comp = 0;
        if (typeof valA === 'number' && typeof valB === 'number') {
          comp = valA - valB;
        } else if (typeof valA === 'boolean' && typeof valB === 'boolean') {
          comp = valA === valB ? 0 : valA ? 1 : -1;
        } else {
          comp = String(valA).localeCompare(String(valB), undefined, { numeric: true, sensitivity: 'base' });
        }

        if (comp !== 0) {
          return rule.direction === 'desc' ? -comp : comp;
        }
      }
      return 0;
    });
  }

  return result;
}

export interface GridViewManagerProps<T> extends Omit<DataGridProps<T>, 'columns' | 'data'> {
  data: T[];
  columns: ColumnDef<T>[];
  lensKey: string;
  userId?: string;
  storage?: GridViewStorage;
  initialViewId?: string;
  initialViewState?: GridViewState;
  initialUrl?: string;
  syncToUrl?: boolean;
  urlParamName?: string;
  onViewChange?: (view: GridView | GridViewState) => void;
  onSaveView?: (view: GridView) => void;
  onDeleteView?: (viewId: string) => void;
  onShareView?: (shareUrl: string, state: GridViewState) => void;
  showToolbar?: boolean;
  toolbarExtra?: ReactNode;
  defaultViews?: GridView[];
}

export function GridViewManager<T>({
  data,
  columns,
  lensKey,
  userId,
  storage = defaultGridViewStorage,
  initialViewId,
  initialViewState,
  initialUrl,
  syncToUrl = false,
  urlParamName = 'grid_view',
  onViewChange,
  onSaveView,
  onDeleteView,
  onShareView,
  showToolbar = true,
  toolbarExtra,
  defaultViews = [],
  density: propDensity,
  onDensityChange: propOnDensityChange,
  className = '',
  style,
  ...dataGridProps
}: GridViewManagerProps<T>) {
  const baseId = useId();
  const [savedViews, setSavedViews] = useState<GridView[]>([]);
  const [activeViewId, setActiveViewId] = useState<string>('default');

  // Base default view state
  const fallbackDefaultState = useMemo<GridViewState>(() => ({
    visibleColumnIds: columns.map((c) => c.id),
    columnOrder: columns.map((c) => c.id),
    density: propDensity || 'compact',
    filterQuery: '',
    columnFilters: [],
    sort: [],
  }), [columns, propDensity]);

  // Active view state
  const [viewState, setViewState] = useState<GridViewState>(() => {
    if (initialUrl) {
      const fromUrl = decodeViewStateFromUrl(initialUrl, urlParamName);
      if (fromUrl) return { ...fallbackDefaultState, ...fromUrl };
    }
    if (typeof window !== 'undefined' && window.location) {
      const fromUrl = decodeViewStateFromUrl(window.location.search, urlParamName);
      if (fromUrl) return { ...fallbackDefaultState, ...fromUrl };
    }
    if (initialViewState) {
      return { ...fallbackDefaultState, ...initialViewState };
    }
    return fallbackDefaultState;
  });

  // Sync to URL if requested
  useEffect(() => {
    if (syncToUrl && typeof window !== 'undefined' && window.history) {
      const newUrl = encodeViewStateToUrl(viewState, undefined, urlParamName);
      window.history.replaceState(null, '', newUrl);
    }
  }, [syncToUrl, viewState, urlParamName]);

  // Toolbar UI state
  const [isColumnsMenuOpen, setIsColumnsMenuOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [saveViewName, setSaveViewName] = useState('');

  // Load saved views from storage
  const refreshViews = useCallback(async () => {
    try {
      const loaded = await storage.loadViews(lensKey, userId);
      setSavedViews(loaded || []);
    } catch {
      setSavedViews([]);
    }
  }, [lensKey, storage, userId]);

  useEffect(() => {
    refreshViews();
  }, [refreshViews]);

  // Sync with initialViewId if specified
  useEffect(() => {
    if (initialViewId && initialViewId !== 'default') {
      const found = savedViews.find((v) => v.id === initialViewId) ||
        defaultViews.find((v) => v.id === initialViewId);
      if (found) {
        setActiveViewId(found.id);
        setViewState({
          visibleColumnIds: found.visibleColumnIds || columns.map((c) => c.id),
          columnOrder: found.columnOrder || columns.map((c) => c.id),
          columnWidths: found.columnWidths,
          density: found.density || 'compact',
          filterQuery: found.filterQuery || '',
          columnFilters: found.columnFilters || [],
          sort: found.sort || [],
        });
      }
    }
  }, [initialViewId, savedViews, defaultViews, columns]);

  // Handle active view selection
  const handleSelectView = useCallback((viewId: string) => {
    setActiveViewId(viewId);
    if (viewId === 'default') {
      setViewState(fallbackDefaultState);
      if (onViewChange) onViewChange(fallbackDefaultState);
      return;
    }
    const view = savedViews.find((v) => v.id === viewId) ||
      defaultViews.find((v) => v.id === viewId);
    if (view) {
      const nextState: GridViewState = {
        visibleColumnIds: view.visibleColumnIds || columns.map((c) => c.id),
        columnOrder: view.columnOrder || columns.map((c) => c.id),
        columnWidths: view.columnWidths,
        density: view.density || 'compact',
        filterQuery: view.filterQuery || '',
        columnFilters: view.columnFilters || [],
        sort: view.sort || [],
      };
      setViewState(nextState);
      if (onViewChange) onViewChange(view);
      if (storage.setActiveViewId) {
        storage.setActiveViewId(lensKey, viewId, userId);
      }
    }
  }, [savedViews, defaultViews, columns, fallbackDefaultState, lensKey, onViewChange, storage, userId]);

  // Save Current View
  const handleConfirmSave = useCallback(async () => {
    const name = saveViewName.trim() || `View ${savedViews.length + 1}`;
    const newView: GridView = {
      id: `view-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name,
      lensKey,
      userId,
      ...viewState,
    };
    await storage.saveView(lensKey, newView, userId);
    await refreshViews();
    setActiveViewId(newView.id);
    setIsSaveModalOpen(false);
    setSaveViewName('');
    if (onSaveView) onSaveView(newView);
  }, [saveViewName, savedViews.length, lensKey, userId, viewState, storage, refreshViews, onSaveView]);

  // Delete View
  const handleDeleteView = useCallback(async (viewId: string) => {
    await storage.deleteView(lensKey, viewId, userId);
    await refreshViews();
    if (activeViewId === viewId) {
      setActiveViewId('default');
      setViewState(fallbackDefaultState);
      if (onViewChange) onViewChange(fallbackDefaultState);
    }
    if (onDeleteView) onDeleteView(viewId);
  }, [storage, lensKey, userId, refreshViews, activeViewId, fallbackDefaultState, onViewChange, onDeleteView]);

  // Column Visibility Toggle
  const toggleColumnVisibility = useCallback((colId: string) => {
    setViewState((prev) => {
      const current = prev.visibleColumnIds || columns.map((c) => c.id);
      let next: string[];
      if (current.includes(colId)) {
        next = current.filter((id) => id !== colId);
      } else {
        next = [...current, colId];
      }
      const updated = { ...prev, visibleColumnIds: next };
      if (onViewChange) onViewChange(updated);
      return updated;
    });
  }, [columns, onViewChange]);

  // Density Change
  const handleDensityChange = useCallback((nextDensity: Density) => {
    setViewState((prev) => {
      const updated = { ...prev, density: nextDensity };
      if (onViewChange) onViewChange(updated);
      return updated;
    });
    if (propOnDensityChange) {
      propOnDensityChange(nextDensity);
    }
  }, [onViewChange, propOnDensityChange]);

  // Filter Query Change
  const handleFilterQueryChange = useCallback((q: string) => {
    setViewState((prev) => {
      const updated = { ...prev, filterQuery: q };
      if (onViewChange) onViewChange(updated);
      return updated;
    });
  }, [onViewChange]);

  // Share View Link Action
  const handleShareView = useCallback(() => {
    const shareUrl = encodeViewStateToUrl(viewState, undefined, urlParamName);
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareUrl).catch(() => {});
    }
    if (onShareView) {
      onShareView(shareUrl, viewState);
    }
  }, [viewState, urlParamName, onShareView]);

  // Computed visible columns
  const activeVisibleColumnIds = useMemo(() => {
    return viewState.visibleColumnIds || columns.map((c) => c.id);
  }, [viewState.visibleColumnIds, columns]);

  const renderedColumns = useMemo(() => {
    const visibleSet = new Set(activeVisibleColumnIds);
    return columns.filter((col) => visibleSet.has(col.id));
  }, [columns, activeVisibleColumnIds]);

  // Computed processed data (filtered + sorted)
  const processedData = useMemo(() => {
    return applyGridViewFiltersAndSort(data, columns, viewState);
  }, [data, columns, viewState]);

  const allViews = useMemo(() => {
    const def: GridView = {
      id: 'default',
      name: 'Default View',
      lensKey,
      isDefault: true,
      ...fallbackDefaultState,
    };
    return [def, ...defaultViews, ...savedViews];
  }, [lensKey, fallbackDefaultState, defaultViews, savedViews]);

  return (
    <div
      data-testid="grid-view-manager"
      className={`copper-grid-view-manager ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        gap: 8,
        color: 'var(--copper-on-surface, #e0e0e0)',
        ...style,
      }}
    >
      {showToolbar && (
        <div
          data-testid="grid-view-toolbar"
          role="toolbar"
          aria-label="Grid views toolbar"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 8,
            padding: '8px 12px',
            backgroundColor: 'var(--copper-surface-container, #1e1e1e)',
            border: '1px solid var(--copper-outline-variant, #2e2e2e)',
            borderRadius: 6,
          }}
        >
          {/* Left: View Selector & Save & Delete */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label
              htmlFor={`${baseId}-view-select`}
              style={{ fontSize: 12, color: 'var(--copper-on-surface-variant, #a0a0a0)' }}
            >
              View:
            </label>
            <select
              id={`${baseId}-view-select`}
              data-testid="grid-view-selector"
              value={activeViewId}
              onChange={(e) => handleSelectView(e.target.value)}
              style={{
                padding: '4px 8px',
                borderRadius: 4,
                backgroundColor: 'var(--copper-surface-container-high, #2a2a2a)',
                color: 'var(--copper-on-surface, #e0e0e0)',
                border: '1px solid var(--copper-outline, #444)',
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              {allViews.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>

            <button
              type="button"
              data-testid="grid-view-save-btn"
              onClick={() => setIsSaveModalOpen(true)}
              aria-label="Save current view"
              style={{
                padding: '4px 10px',
                borderRadius: 4,
                backgroundColor: 'var(--copper-secondary-container, #333)',
                color: 'var(--copper-on-secondary-container, #fff)',
                border: '1px solid var(--copper-outline, #444)',
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              Save View
            </button>

            {activeViewId !== 'default' && (
              <button
                type="button"
                data-testid="grid-view-delete-btn"
                onClick={() => handleDeleteView(activeViewId)}
                aria-label="Delete active view"
                style={{
                  padding: '4px 8px',
                  borderRadius: 4,
                  backgroundColor: 'transparent',
                  color: 'var(--copper-error, #cf6679)',
                  border: '1px solid var(--copper-error, #cf6679)',
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                Delete
              </button>
            )}
          </div>

          {/* Center: Search / Global Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, maxWidth: 320 }}>
            <input
              type="text"
              data-testid="grid-view-search"
              placeholder="Filter records..."
              aria-label="Filter records"
              value={viewState.filterQuery || ''}
              onChange={(e) => handleFilterQueryChange(e.target.value)}
              style={{
                width: '100%',
                padding: '4px 8px',
                borderRadius: 4,
                backgroundColor: 'var(--copper-surface-container-low, #121212)',
                color: 'var(--copper-on-surface, #e0e0e0)',
                border: '1px solid var(--copper-outline, #444)',
                fontSize: 13,
              }}
            />
          </div>

          {/* Right: Columns, Density, Share Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'relative' }}>
            {/* Columns Toggle Menu */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                data-testid="grid-view-columns-btn"
                aria-haspopup="true"
                aria-expanded={isColumnsMenuOpen}
                onClick={() => setIsColumnsMenuOpen(!isColumnsMenuOpen)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 4,
                  backgroundColor: isColumnsMenuOpen ? 'var(--copper-primary-container, #3a4a5a)' : 'var(--copper-surface-container-high, #2a2a2a)',
                  color: 'var(--copper-on-surface, #e0e0e0)',
                  border: '1px solid var(--copper-outline, #444)',
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                {`Columns (${renderedColumns.length}/${columns.length})`}
              </button>

              {isColumnsMenuOpen && (
                <div
                  data-testid="grid-view-columns-menu"
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: 4,
                    zIndex: 100,
                    minWidth: 180,
                    backgroundColor: 'var(--copper-surface-container-high, #242424)',
                    border: '1px solid var(--copper-outline, #444)',
                    borderRadius: 6,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                    padding: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 11 }}>
                    <button
                      type="button"
                      onClick={() => setViewState((prev) => ({ ...prev, visibleColumnIds: columns.map((c) => c.id) }))}
                      style={{ background: 'none', border: 'none', color: 'var(--copper-primary, #64b5f6)', cursor: 'pointer', fontSize: 11 }}
                    >
                      Show all
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewState((prev) => ({ ...prev, visibleColumnIds: [] }))}
                      style={{ background: 'none', border: 'none', color: 'var(--copper-primary, #64b5f6)', cursor: 'pointer', fontSize: 11 }}
                    >
                      Hide all
                    </button>
                  </div>
                  {columns.map((col) => {
                    const isVisible = activeVisibleColumnIds.includes(col.id);
                    return (
                      <label
                        key={col.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          fontSize: 12,
                          cursor: 'pointer',
                        }}
                      >
                        <input
                          type="checkbox"
                          data-testid={`grid-col-toggle-${col.id}`}
                          checked={isVisible}
                          onChange={() => toggleColumnVisibility(col.id)}
                        />
                        {typeof col.header === 'string' ? col.header : col.id}
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Density Button */}
            <button
              type="button"
              data-testid="grid-view-density-btn"
              onClick={() => {
                const current = viewState.density || 'compact';
                const next = current === 'comfortable' ? 'compact' : current === 'compact' ? 'dense' : 'comfortable';
                handleDensityChange(next);
              }}
              style={{
                padding: '4px 10px',
                borderRadius: 4,
                backgroundColor: 'var(--copper-surface-container-high, #2a2a2a)',
                color: 'var(--copper-on-surface, #e0e0e0)',
                border: '1px solid var(--copper-outline, #444)',
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              {`Density: ${viewState.density || 'compact'}`}
            </button>

            {/* Share Button */}
            <button
              type="button"
              data-testid="grid-view-share-btn"
              onClick={handleShareView}
              aria-label="Share active view"
              style={{
                padding: '4px 10px',
                borderRadius: 4,
                backgroundColor: 'var(--copper-primary, #1976d2)',
                color: '#ffffff',
                border: 'none',
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              Share Link
            </button>

            {toolbarExtra}
          </div>
        </div>
      )}

      {/* Save View Modal / Prompt */}
      {isSaveModalOpen && (
        <div
          data-testid="grid-view-save-modal"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--copper-surface-container-high, #242424)',
              border: '1px solid var(--copper-outline, #444)',
              borderRadius: 8,
              padding: 16,
              minWidth: 320,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <h3 style={{ margin: 0, fontSize: 16 }}>Save Grid View</h3>
            <div>
              <label
                htmlFor={`${baseId}-save-name`}
                style={{ display: 'block', fontSize: 12, marginBottom: 4, color: 'var(--copper-on-surface-variant, #aaa)' }}
              >
                View Name:
              </label>
              <input
                id={`${baseId}-save-name`}
                data-testid="grid-view-name-input"
                type="text"
                value={saveViewName}
                placeholder="e.g. High Priority Devices"
                onChange={(e) => setSaveViewName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  borderRadius: 4,
                  backgroundColor: 'var(--copper-surface-container-low, #141414)',
                  color: 'var(--copper-on-surface, #fff)',
                  border: '1px solid var(--copper-outline, #444)',
                  fontSize: 13,
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button
                type="button"
                data-testid="grid-view-cancel-save-btn"
                onClick={() => {
                  setIsSaveModalOpen(false);
                  setSaveViewName('');
                }}
                style={{
                  padding: '6px 12px',
                  borderRadius: 4,
                  backgroundColor: 'transparent',
                  color: 'var(--copper-on-surface, #ccc)',
                  border: '1px solid var(--copper-outline, #444)',
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                data-testid="grid-view-confirm-save-btn"
                onClick={handleConfirmSave}
                style={{
                  padding: '6px 12px',
                  borderRadius: 4,
                  backgroundColor: 'var(--copper-primary, #1976d2)',
                  color: '#fff',
                  border: 'none',
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Underlying Virtualized DataGrid */}
      <DataGrid<T>
        {...dataGridProps}
        data={processedData}
        columns={renderedColumns}
        density={viewState.density || 'compact'}
        onDensityChange={handleDensityChange}
        columnOrder={viewState.columnOrder}
      />
    </div>
  );
}
