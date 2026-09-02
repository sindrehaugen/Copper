import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  type ReactNode,
  type CSSProperties,
} from 'react';

export type BulkRowStatus =
  | 'idle'
  | 'submitting'
  | 'pending-approval'
  | 'resolved'
  | 'rejected'
  | 'failed';

export type BulkActionStatus =
  | 'idle'
  | 'executing'
  | 'completed'
  | 'partial-failure'
  | 'failed';

export interface BulkItemResult<T = any, TResult = any> {
  id: string | number;
  item: T;
  status: BulkRowStatus;
  idempotencyKey: string;
  approvalId?: string | undefined;
  data?: TResult | undefined;
  error?: Error | string | undefined;
}

export interface BulkExecutionSummary<T = any, TResult = any> {
  total: number;
  resolved: number;
  pendingApproval: number;
  failed: number;
  rejected: number;
  results: Record<string | number, BulkItemResult<T, TResult>>;
  isAllResolved: boolean;
  isPartialFailure: boolean;
  hasPendingApproval: boolean;
  status: BulkActionStatus;
}

export interface BulkActionDef<T = any, TResult = any> {
  id: string;
  label: string;
  icon?: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  requiresConfirmation?: boolean;
  confirmTitle?: string;
  confirmMessage?: string | ((items: T[]) => string);
  action?: string;
  url?: string | ((item: T, index: number) => string);
  method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE' | string;
  getPayload?: (item: T, index: number) => Record<string, unknown> | any;
  headers?:
    | Record<string, string>
    | ((item: T, index: number) => Record<string, string>);
  executeItem?: (
    item: T,
    context: { idempotencyKey: string; index: number; actor: string }
  ) => Promise<{
    status?: BulkRowStatus;
    approvalId?: string;
    data?: TResult;
    error?: Error | string;
  }>;
  onItemComplete?: (result: BulkItemResult<T, TResult>) => void;
  onComplete?: (summary: BulkExecutionSummary<T, TResult>) => void;
}

export function generateBulkIdempotencyKey(
  rowId?: string | number,
  actionId?: string
): string {
  const timestamp = Date.now();
  const safeRowId = rowId !== undefined ? String(rowId).replace(/[^a-zA-Z0-9_-]/g, '') : 'item';
  const safeAction = actionId ? String(actionId).replace(/[^a-zA-Z0-9_-]/g, '') : 'bulk';
  const randomPart = Math.random().toString(36).substring(2, 9);
  return `idem-${timestamp}-${safeAction}-${safeRowId}-${randomPart}`;
}

export interface UseBulkGovernedActionsOptions<T> {
  fetchFn?: typeof fetch;
  actor?: string;
  concurrency?: number;
  getRowId?: (item: T, index: number) => string | number;
}

export interface UseBulkGovernedActionsResult<T> {
  isExecuting: boolean;
  status: BulkActionStatus;
  activeActionId: string | null;
  progress: { current: number; total: number };
  results: Record<string | number, BulkItemResult<T>>;
  summary: BulkExecutionSummary<T> | null;
  executeBulkAction: (
    actionDef: BulkActionDef<T>,
    items: T[]
  ) => Promise<BulkExecutionSummary<T>>;
  reset: () => void;
}

export function useBulkGovernedActions<T = any>(
  options: UseBulkGovernedActionsOptions<T> = {}
): UseBulkGovernedActionsResult<T> {
  const {
    fetchFn: customFetch,
    actor = 'current-user',
    getRowId = (item: any, idx: number) => item?.id ?? idx,
  } = options;

  const [isExecuting, setIsExecuting] = useState(false);
  const [status, setStatus] = useState<BulkActionStatus>('idle');
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState<Record<string | number, BulkItemResult<T>>>({});
  const [summary, setSummary] = useState<BulkExecutionSummary<T> | null>(null);

  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const reset = useCallback(() => {
    setIsExecuting(false);
    setStatus('idle');
    setActiveActionId(null);
    setProgress({ current: 0, total: 0 });
    setResults({});
    setSummary(null);
  }, []);

  const executeBulkAction = useCallback(
    async (actionDef: BulkActionDef<T>, items: T[]): Promise<BulkExecutionSummary<T>> => {
      if (!items || items.length === 0) {
        const emptySummary: BulkExecutionSummary<T> = {
          total: 0,
          resolved: 0,
          pendingApproval: 0,
          failed: 0,
          rejected: 0,
          results: {},
          isAllResolved: true,
          isPartialFailure: false,
          hasPendingApproval: false,
          status: 'completed',
        };
        setSummary(emptySummary);
        setStatus('completed');
        return emptySummary;
      }

      setIsExecuting(true);
      setStatus('executing');
      setActiveActionId(actionDef.id);
      setProgress({ current: 0, total: items.length });

      const fetchImpl =
        customFetch || (typeof window !== 'undefined' && window.fetch ? window.fetch : fetch);

      const initialResults: Record<string | number, BulkItemResult<T>> = {};
      items.forEach((item, idx) => {
        const id = getRowId(item, idx);
        const idempotencyKey = generateBulkIdempotencyKey(id, actionDef.id);
        initialResults[id] = {
          id,
          item,
          status: 'submitting',
          idempotencyKey,
        };
      });

      setResults(initialResults);

      const updatedResults: Record<string | number, BulkItemResult<T>> = { ...initialResults };
      let processedCount = 0;

      // Execute each item sequentially or in controlled parallel
      for (let idx = 0; idx < items.length; idx++) {
        const item = items[idx];
        const id = getRowId(item, idx);
        const currentItemState = updatedResults[id];
        const idempotencyKey = currentItemState.idempotencyKey;

        try {
          if (actionDef.executeItem) {
            const customExec = await actionDef.executeItem(item, {
              idempotencyKey,
              index: idx,
              actor,
            });
            const itemRowStatus = customExec.status || (customExec.error ? 'failed' : 'resolved');
            updatedResults[id] = {
              ...currentItemState,
              status: itemRowStatus,
              approvalId: customExec.approvalId,
              data: customExec.data,
              error: customExec.error,
            };
          } else {
            const defaultUrl = `/api/actions/${encodeURIComponent(
              actionDef.action || actionDef.id
            )}`;
            const url =
              typeof actionDef.url === 'function'
                ? actionDef.url(item, idx)
                : actionDef.url || defaultUrl;

            const method = actionDef.method || 'POST';
            const payload = actionDef.getPayload
              ? actionDef.getPayload(item, idx)
              : {
                  action: actionDef.action || actionDef.id,
                  actor,
                  idempotency_key: idempotencyKey,
                  params: item,
                  timestamp: new Date().toISOString(),
                };

            const customHeaders =
              typeof actionDef.headers === 'function'
                ? actionDef.headers(item, idx)
                : actionDef.headers || {};

            const headers: Record<string, string> = {
              'Content-Type': 'application/json',
              'X-Idempotency-Key': idempotencyKey,
              'X-Actor': actor,
              ...customHeaders,
            };

            const response = await fetchImpl(url, {
              method,
              headers,
              body: JSON.stringify(payload),
            });

            const is202 = response.status === 202;
            let responseBody: any = null;
            const contentType = response.headers?.get?.('content-type') || '';

            if (contentType.includes('application/json')) {
              try {
                responseBody = await response.json();
              } catch {
                responseBody = null;
              }
            } else {
              try {
                const text = await response.text();
                try {
                  responseBody = JSON.parse(text);
                } catch {
                  responseBody = text;
                }
              } catch {
                responseBody = null;
              }
            }

            const approvalId =
              responseBody?.approval_id ||
              responseBody?.approvalId ||
              response.headers?.get?.('X-Approval-Id') ||
              response.headers?.get?.('x-approval-id') ||
              undefined;

            if (is202 || (approvalId && responseBody?.status === 'pending-approval')) {
              updatedResults[id] = {
                ...currentItemState,
                status: 'pending-approval',
                approvalId: approvalId || `approval-${id}`,
                data: responseBody?.proposal || responseBody?.data || responseBody,
              };
            } else if (response.ok) {
              updatedResults[id] = {
                ...currentItemState,
                status: 'resolved',
                data: responseBody?.data !== undefined ? responseBody.data : responseBody,
              };
            } else {
              const errorMessage =
                responseBody?.error ||
                responseBody?.message ||
                `Failed with status ${response.status}`;
              updatedResults[id] = {
                ...currentItemState,
                status: 'failed',
                error: errorMessage,
              };
            }
          }
        } catch (err: any) {
          const errorMsg = err instanceof Error ? err.message : String(err);
          updatedResults[id] = {
            ...currentItemState,
            status: 'failed',
            error: errorMsg,
          };
        }

        processedCount++;
        actionDef.onItemComplete?.(updatedResults[id]);

        if (isMountedRef.current) {
          setResults({ ...updatedResults });
          setProgress({ current: processedCount, total: items.length });
        }
      }

      // Calculate final summary
      const allResultsArray = Object.values(updatedResults);
      const resolvedCount = allResultsArray.filter((r) => r.status === 'resolved').length;
      const pendingCount = allResultsArray.filter((r) => r.status === 'pending-approval').length;
      const failedCount = allResultsArray.filter((r) => r.status === 'failed').length;
      const rejectedCount = allResultsArray.filter((r) => r.status === 'rejected').length;

      const isAllResolved = resolvedCount === items.length && items.length > 0;
      const isPartialFailure = failedCount > 0 && resolvedCount > 0;
      const hasPendingApproval = pendingCount > 0;

      let finalActionStatus: BulkActionStatus = 'completed';
      if (failedCount === items.length && items.length > 0) {
        finalActionStatus = 'failed';
      } else if (isPartialFailure) {
        finalActionStatus = 'partial-failure';
      } else {
        finalActionStatus = 'completed';
      }

      const finalSummary: BulkExecutionSummary<T> = {
        total: items.length,
        resolved: resolvedCount,
        pendingApproval: pendingCount,
        failed: failedCount,
        rejected: rejectedCount,
        results: updatedResults,
        isAllResolved,
        isPartialFailure,
        hasPendingApproval,
        status: finalActionStatus,
      };

      if (isMountedRef.current) {
        setIsExecuting(false);
        setStatus(finalActionStatus);
        setSummary(finalSummary);
      }

      actionDef.onComplete?.(finalSummary);
      return finalSummary;
    },
    [customFetch, actor, getRowId]
  );

  return {
    isExecuting,
    status,
    activeActionId,
    progress,
    results,
    summary,
    executeBulkAction,
    reset,
  };
}

export interface GridBulkActionsProps<T = any> {
  selectedItems: T[];
  selectedIds?: Set<string | number>;
  totalCount?: number;
  actions: BulkActionDef<T>[];
  onClearSelection?: () => void;
  getRowId?: (item: T, index: number) => string | number;
  fetchFn?: typeof fetch;
  actor?: string;
  onActionComplete?: (actionId: string, summary: BulkExecutionSummary<T>) => void;
  className?: string;
  style?: CSSProperties;
  position?: 'top' | 'bottom' | 'floating';
  showDetailsDefault?: boolean;
}

export function GridBulkActions<T = any>({
  selectedItems,
  selectedIds,
  totalCount,
  actions,
  onClearSelection,
  getRowId = (item: any, idx: number) => item?.id ?? idx,
  fetchFn,
  actor,
  onActionComplete,
  className = '',
  style,
  position = 'top',
  showDetailsDefault = false,
}: GridBulkActionsProps<T>) {
  const effectiveCount =
    selectedIds !== undefined ? selectedIds.size : selectedItems.length;

  const {
    isExecuting,
    activeActionId,
    progress,
    results,
    summary,
    executeBulkAction,
  } = useBulkGovernedActions<T>({
    fetchFn,
    actor,
    getRowId,
  });

  const [isDetailsOpen, setIsDetailsOpen] = useState(showDetailsDefault);
  const [confirmAction, setConfirmAction] = useState<BulkActionDef<T> | null>(null);

  const handleActionClick = useCallback(
    async (actionDef: BulkActionDef<T>) => {
      if (actionDef.requiresConfirmation) {
        setConfirmAction(actionDef);
        return;
      }
      const sum = await executeBulkAction(actionDef, selectedItems);
      onActionComplete?.(actionDef.id, sum);
    },
    [executeBulkAction, selectedItems, onActionComplete]
  );

  const handleConfirmAction = useCallback(async () => {
    if (!confirmAction) return;
    const actionToRun = confirmAction;
    setConfirmAction(null);
    const sum = await executeBulkAction(actionToRun, selectedItems);
    onActionComplete?.(actionToRun.id, sum);
  }, [confirmAction, executeBulkAction, selectedItems, onActionComplete]);

  if (effectiveCount === 0 && !isExecuting && !summary) {
    return null;
  }

  const resultsList = Object.values(results);
  const countLabel = totalCount !== undefined
    ? `${effectiveCount} of ${totalCount} selected`
    : `${effectiveCount} ${effectiveCount === 1 ? 'item' : 'items'} selected`;

  return (
    <div
      role="toolbar"
      aria-label="Bulk actions toolbar"
      data-testid="grid-bulk-actions-toolbar"
      className={`copper-bulk-actions-toolbar ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--copper-surface-container-high, #1E1E1E)',
        border: '1px solid var(--copper-outline, #3A3A3A)',
        borderRadius: 6,
        padding: '8px 12px',
        margin: '6px 0',
        gap: 8,
        boxShadow:
          position === 'floating'
            ? '0 4px 16px rgba(0, 0, 0, 0.4)'
            : '0 2px 6px rgba(0, 0, 0, 0.2)',
        color: 'var(--copper-on-surface, #E0E0E0)',
        fontSize: 13,
        ...style,
      }}
    >
      {/* Main Toolbar Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        {/* Left: Selection Counter & Clear */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            data-testid="bulk-selection-count"
            style={{
              fontWeight: 600,
              backgroundColor: 'var(--copper-primary-container, #3A2B20)',
              color: 'var(--copper-primary, #B87333)',
              padding: '2px 8px',
              borderRadius: 4,
              border: '1px solid var(--copper-primary, #B87333)',
            }}
          >
            {countLabel}
          </span>

          {onClearSelection && (
            <button
              type="button"
              data-testid="bulk-clear-btn"
              onClick={onClearSelection}
              disabled={isExecuting}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--copper-on-surface-variant, #A0A0A0)',
                textDecoration: 'underline',
                cursor: isExecuting ? 'not-allowed' : 'pointer',
                fontSize: 12,
                padding: '2px 4px',
              }}
            >
              Clear
            </button>
          )}
        </div>

        {/* Center: Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {actions.map((action) => {
            const isActionActive = isExecuting && activeActionId === action.id;
            const isDanger = action.variant === 'danger';
            const isPrimary = action.variant === 'primary' || (!action.variant && !isDanger);

            let bg = 'var(--copper-surface-container, #2A2A2A)';
            let fg = 'var(--copper-on-surface, #E0E0E0)';
            let border = '1px solid var(--copper-outline, #444)';

            if (isDanger) {
              bg = 'rgba(207, 102, 121, 0.15)';
              fg = 'var(--copper-error, #CF6679)';
              border = '1px solid var(--copper-error, #CF6679)';
            } else if (isPrimary) {
              bg = 'var(--copper-primary, #B87333)';
              fg = '#FFFFFF';
              border = '1px solid var(--copper-primary, #B87333)';
            }

            return (
              <button
                key={action.id}
                type="button"
                data-testid={`bulk-action-${action.id}`}
                disabled={isExecuting || effectiveCount === 0}
                onClick={() => handleActionClick(action)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  backgroundColor: bg,
                  color: fg,
                  border,
                  padding: '5px 12px',
                  borderRadius: 4,
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: isExecuting || effectiveCount === 0 ? 'not-allowed' : 'pointer',
                  opacity: isExecuting && !isActionActive ? 0.6 : 1,
                  transition: 'background-color 150ms ease',
                }}
              >
                {action.icon}
                {isActionActive ? `Processing...` : action.label}
              </button>
            );
          })}
        </div>

        {/* Right: Progress & Status Summary */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {isExecuting && (
            <div
              data-testid="bulk-progress-indicator"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12,
                color: 'var(--copper-secondary, #3A6E6A)',
              }}
            >
              <span>{`Processing ${progress.current} of ${progress.total}...`}</span>
            </div>
          )}

          {summary && !isExecuting && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                data-testid="bulk-status-summary"
                style={{
                  fontSize: 12,
                  display: 'flex',
                  gap: 6,
                  alignItems: 'center',
                }}
              >
                {summary.resolved > 0 && (
                  <span style={{ color: '#4CAF50' }}>{`${summary.resolved} resolved`}</span>
                )}
                {summary.pendingApproval > 0 && (
                  <span style={{ color: '#FFB74D' }}>{`${summary.pendingApproval} pending approval`}</span>
                )}
                {summary.failed > 0 && (
                  <span style={{ color: '#CF6679' }}>{`${summary.failed} failed`}</span>
                )}
              </div>

              {resultsList.length > 0 && (
                <button
                  type="button"
                  data-testid="bulk-details-toggle"
                  onClick={() => setIsDetailsOpen(!isDetailsOpen)}
                  style={{
                    background: 'none',
                    border: '1px solid var(--copper-outline, #444)',
                    color: 'var(--copper-on-surface-variant, #A0A0A0)',
                    padding: '2px 6px',
                    borderRadius: 3,
                    fontSize: 11,
                    cursor: 'pointer',
                  }}
                >
                  {isDetailsOpen ? 'Hide details' : 'Show details'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal / Overlay */}
      {confirmAction && (
        <div
          data-testid="bulk-confirm-modal"
          style={{
            marginTop: 8,
            padding: 12,
            backgroundColor: 'var(--copper-surface-container, #141414)',
            border: '1px solid var(--copper-primary, #B87333)',
            borderRadius: 4,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <div style={{ fontWeight: 600 }}>
            {confirmAction.confirmTitle || `Confirm ${confirmAction.label}`}
          </div>
          <div style={{ fontSize: 12, color: 'var(--copper-on-surface-variant, #B0B0B0)' }}>
            {typeof confirmAction.confirmMessage === 'function'
              ? confirmAction.confirmMessage(selectedItems)
              : confirmAction.confirmMessage ||
                `Are you sure you want to execute "${confirmAction.label}" on ${selectedItems.length} selected items?`}
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button
              type="button"
              data-testid="bulk-confirm-cancel"
              onClick={() => setConfirmAction(null)}
              style={{
                padding: '4px 10px',
                borderRadius: 4,
                backgroundColor: 'transparent',
                color: 'var(--copper-on-surface, #E0E0E0)',
                border: '1px solid var(--copper-outline, #555)',
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              data-testid="bulk-confirm-proceed"
              onClick={handleConfirmAction}
              style={{
                padding: '4px 12px',
                borderRadius: 4,
                backgroundColor:
                  confirmAction.variant === 'danger'
                    ? 'var(--copper-error, #CF6679)'
                    : 'var(--copper-primary, #B87333)',
                color: '#FFF',
                border: 'none',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Confirm
            </button>
          </div>
        </div>
      )}

      {/* Detailed Per-Row Breakdown Panel */}
      {isDetailsOpen && resultsList.length > 0 && (
        <div
          data-testid="bulk-results-details-panel"
          style={{
            marginTop: 6,
            maxHeight: 200,
            overflowY: 'auto',
            borderTop: '1px solid var(--copper-outline-variant, #2E2E2E)',
            paddingTop: 6,
            fontSize: 12,
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ color: 'var(--copper-on-surface-variant, #888)', textAlign: 'left' }}>
                <th style={{ padding: '4px 8px' }}>Item ID</th>
                <th style={{ padding: '4px 8px' }}>Status</th>
                <th style={{ padding: '4px 8px' }}>Idempotency Key</th>
                <th style={{ padding: '4px 8px' }}>Details / Note</th>
              </tr>
            </thead>
            <tbody>
              {resultsList.map((res) => {
                let statusColor = '#E0E0E0';
                if (res.status === 'resolved') statusColor = '#4CAF50';
                if (res.status === 'pending-approval') statusColor = '#FFB74D';
                if (res.status === 'failed' || res.status === 'rejected') statusColor = '#CF6679';

                return (
                  <tr
                    key={String(res.id)}
                    data-testid={`bulk-row-status-${res.id}`}
                    style={{
                      borderBottom: '1px solid var(--copper-outline-variant, #242424)',
                    }}
                  >
                    <td style={{ padding: '4px 8px', fontWeight: 500 }}>{String(res.id)}</td>
                    <td style={{ padding: '4px 8px', color: statusColor, fontWeight: 600 }}>
                      {res.status}
                    </td>
                    <td
                      style={{
                        padding: '4px 8px',
                        fontFamily: 'var(--copper-font-mono, monospace)',
                        fontSize: 11,
                        color: 'var(--copper-on-surface-variant, #888)',
                      }}
                    >
                      {res.idempotencyKey}
                    </td>
                    <td style={{ padding: '4px 8px' }}>
                      {res.approvalId && (
                        <span style={{ color: '#FFB74D' }}>{`Approval: ${res.approvalId}`}</span>
                      )}
                      {res.error && (
                        <span style={{ color: '#CF6679' }}>{String(res.error)}</span>
                      )}
                      {!res.approvalId && !res.error && res.status === 'resolved' && (
                        <span style={{ color: '#4CAF50' }}>Success</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
