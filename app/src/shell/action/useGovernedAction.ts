import { useState, useCallback, useRef, useEffect } from 'react';
import { executeGovernedAction, createInitialActionState } from './envelope';
import type {
  ExecuteGovernedActionOptions,
  ExecuteGovernedActionRequest,
  GovernedActionState,
} from './types';

export interface UseGovernedActionResult<TData = unknown, TParams = unknown> {
  state: GovernedActionState<TData>;
  execute: (
    params?: TParams,
    overrideOptions?: ExecuteGovernedActionOptions<TData>
  ) => Promise<GovernedActionState<TData>>;
  reset: () => void;
  status: GovernedActionState<TData>['status'];
  isIdle: boolean;
  isSubmitting: boolean;
  isPendingApproval: boolean;
  isResolved: boolean;
  isRejected: boolean;
  isFailed: boolean;
  approvalId?: string | undefined;
  data?: TData | undefined;
  error?: Error | string | undefined;
  idempotencyKey?: string | undefined;
  actor?: string | undefined;
}

export function useGovernedAction<TData = unknown, TParams = unknown>(
  defaultRequest: ExecuteGovernedActionRequest<TParams> | string,
  defaultOptions: ExecuteGovernedActionOptions<TData> = {}
): UseGovernedActionResult<TData, TParams> {
  const [state, setState] = useState<GovernedActionState<TData>>(() =>
    createInitialActionState<TData>()
  );

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const requestConfig: ExecuteGovernedActionRequest<TParams> =
    typeof defaultRequest === 'string'
      ? { action: defaultRequest }
      : defaultRequest;

  const execute = useCallback(
    async (
      params?: TParams,
      overrideOptions: ExecuteGovernedActionOptions<TData> = {}
    ): Promise<GovernedActionState<TData>> => {
      const mergedRequest: ExecuteGovernedActionRequest<TParams> = {
        ...requestConfig,
        params: params !== undefined ? params : requestConfig.params,
      };

      const mergedOptions: ExecuteGovernedActionOptions<TData> = {
        ...defaultOptions,
        ...overrideOptions,
        onStatusChange: (status, updatedState) => {
          if (isMountedRef.current) {
            setState(updatedState);
          }
          defaultOptions.onStatusChange?.(status, updatedState);
          overrideOptions.onStatusChange?.(status, updatedState);
        },
        onPendingApproval: (approvalId, updatedState) => {
          if (isMountedRef.current) {
            setState(updatedState);
          }
          defaultOptions.onPendingApproval?.(approvalId, updatedState);
          overrideOptions.onPendingApproval?.(approvalId, updatedState);
        },
        onResolved: (data, updatedState) => {
          if (isMountedRef.current) {
            setState(updatedState);
          }
          defaultOptions.onResolved?.(data, updatedState);
          overrideOptions.onResolved?.(data, updatedState);
        },
        onRejected: (reason, updatedState) => {
          if (isMountedRef.current) {
            setState(updatedState);
          }
          defaultOptions.onRejected?.(reason, updatedState);
          overrideOptions.onRejected?.(reason, updatedState);
        },
        onError: (err, updatedState) => {
          if (isMountedRef.current) {
            setState(updatedState);
          }
          defaultOptions.onError?.(err, updatedState);
          overrideOptions.onError?.(err, updatedState);
        },
      };

      return executeGovernedAction<TData, TParams>(mergedRequest, mergedOptions);
    },
    [requestConfig, defaultOptions]
  );

  const reset = useCallback(() => {
    if (isMountedRef.current) {
      setState(createInitialActionState<TData>());
    }
  }, []);

  return {
    state,
    execute,
    reset,
    status: state.status,
    isIdle: state.isIdle,
    isSubmitting: state.isSubmitting,
    isPendingApproval: state.isPendingApproval,
    isResolved: state.isResolved,
    isRejected: state.isRejected,
    isFailed: state.isFailed,
    approvalId: state.approvalId,
    data: state.data,
    error: state.error,
    idempotencyKey: state.idempotencyKey,
    actor: state.actor,
  };
}
