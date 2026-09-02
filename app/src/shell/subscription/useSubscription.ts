import { useEffect, useState, useRef } from 'react';
import {
  ShellSubscriptionClient,
  getSubscriptionService,
} from './client';
import {
  SubscriptionTopic,
  ConnectionStatus,
  ShellEvent,
  RailUpdatePayload,
  FindingsUpdatePayload,
  ApprovalUpdatePayload,
  SlaClockPayload,
} from './types';

/**
 * Hook to retrieve or monitor the current connection status of the subscription service.
 */
export function useSubscriptionStatus(client?: ShellSubscriptionClient): ConnectionStatus {
  const effectiveClient = client || getSubscriptionService();
  const [status, setStatus] = useState<ConnectionStatus>(effectiveClient.getStatus());

  useEffect(() => {
    setStatus(effectiveClient.getStatus());
    const unsubscribe = effectiveClient.onStatusChange((newStatus) => {
      setStatus(newStatus);
    });
    return unsubscribe;
  }, [effectiveClient]);

  return status;
}

/**
 * Generic hook to subscribe to any real-time topic on the Shell Subscription client.
 */
export function useSubscriptionEvent<T = any>(
  topic: SubscriptionTopic,
  handler: (event: ShellEvent<T>) => void,
  client?: ShellSubscriptionClient
): void {
  const effectiveClient = client || getSubscriptionService();
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const unsubscribe = effectiveClient.subscribe<T>(topic, (event) => {
      if (handlerRef.current) {
        handlerRef.current(event);
      }
    });
    return unsubscribe;
  }, [effectiveClient, topic]);
}

/**
 * Hook to subscribe to real-time rail updates.
 */
export function useRailUpdates(
  callback: (payload: RailUpdatePayload, event: ShellEvent<RailUpdatePayload>) => void,
  client?: ShellSubscriptionClient
): void {
  useSubscriptionEvent<RailUpdatePayload>(
    'rail',
    (event) => {
      callback(event.data, event);
    },
    client
  );
}

/**
 * Hook to subscribe to real-time findings updates.
 */
export function useFindingsUpdates(
  callback: (payload: FindingsUpdatePayload, event: ShellEvent<FindingsUpdatePayload>) => void,
  client?: ShellSubscriptionClient
): void {
  useSubscriptionEvent<FindingsUpdatePayload>(
    'findings',
    (event) => {
      callback(event.data, event);
    },
    client
  );
}

/**
 * Hook to subscribe to real-time approval updates.
 */
export function useApprovalsUpdates(
  callback: (payload: ApprovalUpdatePayload, event: ShellEvent<ApprovalUpdatePayload>) => void,
  client?: ShellSubscriptionClient
): void {
  useSubscriptionEvent<ApprovalUpdatePayload>(
    'approvals',
    (event) => {
      callback(event.data, event);
    },
    client
  );
}

/**
 * Hook to subscribe to real-time SLA clock updates.
 */
export function useSlaClockUpdates(
  callback: (payload: SlaClockPayload, event: ShellEvent<SlaClockPayload>) => void,
  client?: ShellSubscriptionClient
): void {
  useSubscriptionEvent<SlaClockPayload>(
    'sla_clock',
    (event) => {
      callback(event.data, event);
    },
    client
  );
}
