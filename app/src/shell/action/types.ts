import type { ShellSubscriptionClient } from '../subscription/client';

export type ActionStatus =
  | 'idle'
  | 'submitting'
  | 'pending-approval'
  | 'resolved'
  | 'rejected'
  | 'failed';

export interface GovernedMutationPayload<TParams = Record<string, unknown>> {
  action: string;
  actor: string;
  idempotency_key: string;
  params?: TParams | undefined;
  timestamp?: string | undefined;
}

export interface GovernedActionResponse<TData = unknown> {
  status?: number | undefined;
  approval_id?: string | undefined;
  approvalId?: string | undefined;
  data?: TData | undefined;
  proposal?: unknown | undefined;
  message?: string | undefined;
  error?: string | undefined;
  reason?: string | undefined;
}

export interface GovernedActionState<TData = unknown> {
  status: ActionStatus;
  approvalId?: string | undefined;
  data?: TData | undefined;
  error?: Error | string | undefined;
  idempotencyKey?: string | undefined;
  actor?: string | undefined;
  isIdle: boolean;
  isSubmitting: boolean;
  isPendingApproval: boolean;
  isResolved: boolean;
  isRejected: boolean;
  isFailed: boolean;
}

export interface ExecuteGovernedActionRequest<TParams = unknown> {
  action: string;
  url?: string | undefined;
  method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE' | string | undefined;
  params?: TParams | undefined;
  actor?: string | undefined;
  idempotencyKey?: string | undefined;
  headers?: Record<string, string> | undefined;
}

export interface ExecuteGovernedActionOptions<TData = unknown> {
  subscriptionClient?: ShellSubscriptionClient | undefined;
  fetchFn?: typeof fetch | undefined;
  timeoutMs?: number | undefined;
  onStatusChange?: ((status: ActionStatus, state: GovernedActionState<TData>) => void) | undefined;
  onPendingApproval?: ((approvalId: string, state: GovernedActionState<TData>) => void) | undefined;
  onResolved?: ((data: TData, state: GovernedActionState<TData>) => void) | undefined;
  onRejected?: ((reason: string, state: GovernedActionState<TData>) => void) | undefined;
  onError?: ((error: Error, state: GovernedActionState<TData>) => void) | undefined;
}
