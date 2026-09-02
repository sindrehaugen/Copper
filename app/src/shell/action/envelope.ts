import { getSubscriptionService } from '../subscription/client';
import { generateIdempotencyKey, resolveActor } from './idempotency';
import type {
  ActionStatus,
  ExecuteGovernedActionOptions,
  ExecuteGovernedActionRequest,
  GovernedActionState,
  GovernedMutationPayload,
} from './types';
import type { ShellEvent } from '../subscription/types';

export function createInitialActionState<TData = unknown>(
  overrides?: Partial<GovernedActionState<TData>>
): GovernedActionState<TData> {
  const status: ActionStatus = overrides?.status || 'idle';
  return {
    status,
    approvalId: overrides?.approvalId,
    data: overrides?.data,
    error: overrides?.error,
    idempotencyKey: overrides?.idempotencyKey,
    actor: overrides?.actor,
    isIdle: status === 'idle',
    isSubmitting: status === 'submitting',
    isPendingApproval: status === 'pending-approval',
    isResolved: status === 'resolved',
    isRejected: status === 'rejected',
    isFailed: status === 'failed',
  };
}

function deriveState<TData = unknown>(
  status: ActionStatus,
  prev: GovernedActionState<TData>,
  updates?: Partial<GovernedActionState<TData>>
): GovernedActionState<TData> {
  return {
    ...prev,
    ...updates,
    status,
    isIdle: status === 'idle',
    isSubmitting: status === 'submitting',
    isPendingApproval: status === 'pending-approval',
    isResolved: status === 'resolved',
    isRejected: status === 'rejected',
    isFailed: status === 'failed',
  };
}

/**
 * Executes a governed mutation, treating 202 + approval_id as a first-class state.
 * Subscribes to real-time SSE resolution on the 'approvals' topic when pending.
 */
export async function executeGovernedAction<TData = unknown, TParams = unknown>(
  request: ExecuteGovernedActionRequest<TParams>,
  options: ExecuteGovernedActionOptions<TData> = {}
): Promise<GovernedActionState<TData>> {
  const idempotencyKey = request.idempotencyKey || generateIdempotencyKey();
  const actor = resolveActor(request.actor);
  const subscriptionClient = options.subscriptionClient || getSubscriptionService();
  const fetchFn = options.fetchFn || (typeof fetch !== 'undefined' ? fetch : undefined);

  if (!fetchFn) {
    throw new Error('fetchFn is not available in current environment');
  }

  const payload: GovernedMutationPayload<TParams> = {
    action: request.action,
    actor,
    idempotency_key: idempotencyKey,
    params: request.params,
    timestamp: new Date().toISOString(),
  };

  let currentState = createInitialActionState<TData>({
    status: 'submitting',
    idempotencyKey,
    actor,
  });
  options.onStatusChange?.('submitting', currentState);

  const url = request.url || `/api/actions/${encodeURIComponent(request.action)}`;
  const method = request.method || 'POST';

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Idempotency-Key': idempotencyKey,
    'X-Actor': actor,
    ...(request.headers || {}),
  };

  try {
    const response = await fetchFn(url, {
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

    // Check if response is 202 Accepted (or payload indicates pending-approval)
    if (is202 || (approvalId && responseBody?.status === 'pending-approval')) {
      if (!approvalId) {
        throw new Error('202 Accepted response received without approval_id');
      }

      currentState = deriveState<TData>('pending-approval', currentState, {
        approvalId,
        data: responseBody?.proposal || responseBody?.data || responseBody,
      });

      options.onStatusChange?.('pending-approval', currentState);
      options.onPendingApproval?.(approvalId, currentState);

      // Return a Promise that resolves when the SSE approval event arrives
      return new Promise<GovernedActionState<TData>>((resolve, reject) => {
        let unsubscribe: (() => void) | null = null;
        let timeoutHandle: ReturnType<typeof setTimeout> | null = null;

        const cleanup = () => {
          if (unsubscribe) {
            unsubscribe();
            unsubscribe = null;
          }
          if (timeoutHandle) {
            clearTimeout(timeoutHandle);
            timeoutHandle = null;
          }
        };

        if (options.timeoutMs && options.timeoutMs > 0) {
          timeoutHandle = setTimeout(() => {
            cleanup();
            currentState = deriveState<TData>('failed', currentState, {
              error: new Error(`Governed action timed out after ${options.timeoutMs}ms`),
            });
            options.onError?.(currentState.error as Error, currentState);
            options.onStatusChange?.('failed', currentState);
            reject(currentState.error);
          }, options.timeoutMs);
        }

        // Connect subscription client if disconnected
        if (subscriptionClient.getStatus() === 'DISCONNECTED') {
          subscriptionClient.connect();
        }

        unsubscribe = subscriptionClient.subscribe('approvals', (event: ShellEvent<any>) => {
          const eventData = event.data || {};
          const eventApprovalId = eventData.approvalId || eventData.approval_id;

          if (eventApprovalId === approvalId) {
            const approvalStatus = eventData.status;

            if (approvalStatus === 'approved' || approvalStatus === 'resolved') {
              cleanup();
              currentState = deriveState<TData>('resolved', currentState, {
                data: eventData.proposal || eventData.data || eventData,
              });
              options.onResolved?.(currentState.data as TData, currentState);
              options.onStatusChange?.('resolved', currentState);
              resolve(currentState);
            } else if (approvalStatus === 'rejected') {
              cleanup();
              const reason = eventData.reason || 'Governance approval was rejected';
              currentState = deriveState<TData>('rejected', currentState, {
                error: reason,
              });
              options.onRejected?.(reason, currentState);
              options.onStatusChange?.('rejected', currentState);
              resolve(currentState);
            }
          }
        });
      });
    }

    // Direct success (200, 201, 204, etc.)
    if (response.ok) {
      currentState = deriveState<TData>('resolved', currentState, {
        data: responseBody?.data !== undefined ? responseBody.data : responseBody,
      });
      options.onResolved?.(currentState.data as TData, currentState);
      options.onStatusChange?.('resolved', currentState);
      return currentState;
    }

    // HTTP Error status (4xx, 5xx)
    const errorMessage =
      responseBody?.error ||
      responseBody?.message ||
      `Governed action request failed with status ${response.status}`;
    const error = new Error(errorMessage);

    currentState = deriveState<TData>('failed', currentState, { error });
    options.onError?.(error, currentState);
    options.onStatusChange?.('failed', currentState);
    return currentState;
  } catch (err: any) {
    const error = err instanceof Error ? err : new Error(String(err));
    currentState = deriveState<TData>('failed', currentState, { error });
    options.onError?.(error, currentState);
    options.onStatusChange?.('failed', currentState);
    return currentState;
  }
}
