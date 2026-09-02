/* eslint-disable i18next/no-literal-string */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  executeGovernedAction,
  useGovernedAction,
  GovernedActionStatus,
  GovernedActionButton,
  type GovernedMutationPayload,
} from './index';
import { ShellSubscriptionClient } from '../subscription/client';

describe('Governed Action Envelope (Batch 137 / SH.W9)', () => {
  let mockSubscriptionClient: ShellSubscriptionClient;
  let sseListeners: Map<string, Set<(event: any) => void>>;

  beforeEach(() => {
    vi.clearAllMocks();
    sseListeners = new Map();

    mockSubscriptionClient = new ShellSubscriptionClient({
      url: '/api/events',
      autoReconnect: false,
    });

    // Mock subscribe on client to capture event handlers
    vi.spyOn(mockSubscriptionClient, 'subscribe').mockImplementation(
      (topic: string, handler: (event: any) => void) => {
        if (!sseListeners.has(topic)) {
          sseListeners.set(topic, new Set());
        }
        sseListeners.get(topic)!.add(handler);
        return () => {
          sseListeners.get(topic)?.delete(handler);
        };
      }
    );

    vi.spyOn(mockSubscriptionClient, 'getStatus').mockReturnValue('CONNECTED');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('verifies that idempotency key and actor are carried on every mutation payload and headers', async () => {
    let capturedUrl = '';
    let capturedInit: RequestInit | undefined;

    const mockFetch = vi.fn().mockImplementation(async (url: string, init?: RequestInit) => {
      capturedUrl = url;
      capturedInit = init;
      return {
        status: 200,
        ok: true,
        headers: new Headers({ 'Content-Type': 'application/json' }),
        json: async () => ({ success: true, result: 'promoted' }),
      };
    });

    const customKey = 'idem_test_custom_12345';
    const customActor = 'operator@bravoav.no';

    const result = await executeGovernedAction(
      {
        action: 'promote_design',
        url: '/api/design/promote',
        params: { designId: 'des-456', targetState: 'quoted' },
        actor: customActor,
        idempotencyKey: customKey,
      },
      {
        fetchFn: mockFetch as any,
        subscriptionClient: mockSubscriptionClient,
      }
    );

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(capturedUrl).toBe('/api/design/promote');
    expect(capturedInit).toBeDefined();

    const headers = capturedInit!.headers as Record<string, string>;
    expect(headers['Content-Type']).toBe('application/json');
    expect(headers['X-Idempotency-Key']).toBe(customKey);
    expect(headers['X-Actor']).toBe(customActor);

    const parsedBody: GovernedMutationPayload = JSON.parse(capturedInit!.body as string);
    expect(parsedBody.action).toBe('promote_design');
    expect(parsedBody.actor).toBe(customActor);
    expect(parsedBody.idempotency_key).toBe(customKey);
    expect(parsedBody.params).toEqual({ designId: 'des-456', targetState: 'quoted' });
    expect(parsedBody.timestamp).toBeDefined();

    expect(result.status).toBe('resolved');
    expect(result.isResolved).toBe(true);
  });

  it('generates a cryptographically strong idempotency key and default actor when omitted', async () => {
    let capturedInit: RequestInit | undefined;
    const mockFetch = vi.fn().mockImplementation(async (_url: string, init?: RequestInit) => {
      capturedInit = init;
      return {
        status: 200,
        ok: true,
        headers: new Headers({ 'Content-Type': 'application/json' }),
        json: async () => ({ ok: true }),
      };
    });

    await executeGovernedAction(
      { action: 'reserve_stock', params: { sku: 'CABLE-CAT6A', qty: 100 } },
      { fetchFn: mockFetch as any, subscriptionClient: mockSubscriptionClient }
    );

    const parsedBody: GovernedMutationPayload = JSON.parse(capturedInit!.body as string);
    expect(parsedBody.idempotency_key).toMatch(/^idem_/);
    expect(parsedBody.actor).toBe('dev-user@bravoav.no');
  });

  it('proves that a 202 response puts the action in pending-approval state', async () => {
    const statusChanges: string[] = [];
    let capturedApprovalId = '';

    const mockFetch = vi.fn().mockImplementation(async () => {
      return {
        status: 202,
        ok: true,
        headers: new Headers({
          'Content-Type': 'application/json',
          'X-Approval-Id': 'appr-b137-001',
        }),
        json: async () => ({
          status: 'pending-approval',
          approval_id: 'appr-b137-001',
          message: 'Action requires manager approval',
          proposal: { risk: 'medium', impact: 'budget' },
        }),
      };
    });

    const actionPromise = executeGovernedAction(
      {
        action: 'promote_design',
        params: { designId: 'des-789' },
      },
      {
        fetchFn: mockFetch as any,
        subscriptionClient: mockSubscriptionClient,
        onStatusChange: (status) => statusChanges.push(status),
        onPendingApproval: (approvalId) => {
          capturedApprovalId = approvalId;
        },
      }
    );

    // Give microtask loop a tick to process initial 202 response
    await vi.waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(capturedApprovalId).toBe('appr-b137-001');
      expect(statusChanges).toContain('pending-approval');
    });

    expect(mockSubscriptionClient.subscribe).toHaveBeenCalledWith(
      'approvals',
      expect.any(Function)
    );

    // Resolve SSE to finish the promise cleanly
    const approvalListeners = sseListeners.get('approvals');
    expect(approvalListeners).toBeDefined();
    expect(approvalListeners!.size).toBeGreaterThan(0);

    for (const listener of approvalListeners!) {
      listener({
        topic: 'approvals',
        data: {
          approvalId: 'appr-b137-001',
          status: 'approved',
          proposal: { confirmed: true },
        },
        timestamp: new Date().toISOString(),
      });
    }

    const finalState = await actionPromise;
    expect(finalState.status).toBe('resolved');
  });

  it('proves the action resolves successfully when an SSE message for its approval_id arrives', async () => {
    const mockFetch = vi.fn().mockImplementation(async () => {
      return {
        status: 202,
        ok: true,
        headers: new Headers({ 'Content-Type': 'application/json' }),
        json: async () => ({
          approval_id: 'appr-999-xyz',
          status: 'pending-approval',
        }),
      };
    });

    let resolvedData: any = null;

    const actionPromise = executeGovernedAction(
      {
        action: 'release_stock',
        params: { reservationId: 'res-88' },
      },
      {
        fetchFn: mockFetch as any,
        subscriptionClient: mockSubscriptionClient,
        onResolved: (data) => {
          resolvedData = data;
        },
      }
    );

    await vi.waitFor(() => {
      expect(sseListeners.get('approvals')?.size).toBe(1);
    });

    // Fire an unrelated SSE message for another approval_id (should not resolve our action)
    const approvalListeners = sseListeners.get('approvals')!;
    for (const listener of approvalListeners) {
      listener({
        topic: 'approvals',
        data: {
          approvalId: 'appr-different-id',
          status: 'approved',
          proposal: { unrelated: true },
        },
        timestamp: new Date().toISOString(),
      });
    }

    expect(resolvedData).toBeNull();

    // Now fire the matching SSE approval message for appr-999-xyz
    for (const listener of approvalListeners) {
      listener({
        topic: 'approvals',
        data: {
          approvalId: 'appr-999-xyz',
          status: 'approved',
          proposal: { stockReleased: true, releaseCount: 42 },
        },
        timestamp: new Date().toISOString(),
      });
    }

    const finalState = await actionPromise;
    expect(finalState.status).toBe('resolved');
    expect(finalState.isResolved).toBe(true);
    expect(finalState.isPendingApproval).toBe(false);
    expect(finalState.data).toEqual({ stockReleased: true, releaseCount: 42 });
    expect(resolvedData).toEqual({ stockReleased: true, releaseCount: 42 });

    // Verify subscription was cleaned up (listener removed)
    expect(sseListeners.get('approvals')?.size ?? 0).toBe(0);
  });

  it('handles governance rejection via SSE message and transitions to rejected state', async () => {
    const mockFetch = vi.fn().mockImplementation(async () => {
      return {
        status: 202,
        ok: true,
        headers: new Headers({ 'Content-Type': 'application/json' }),
        json: async () => ({
          approval_id: 'appr-reject-me',
        }),
      };
    });

    let rejectionReason = '';

    const actionPromise = executeGovernedAction(
      {
        action: 'delete_critical_room',
        params: { roomId: 'rm-999' },
      },
      {
        fetchFn: mockFetch as any,
        subscriptionClient: mockSubscriptionClient,
        onRejected: (reason) => {
          rejectionReason = reason;
        },
      }
    );

    await vi.waitFor(() => {
      expect(sseListeners.get('approvals')?.size).toBe(1);
    });

    // Fire rejection event
    for (const listener of sseListeners.get('approvals')!) {
      listener({
        topic: 'approvals',
        data: {
          approvalId: 'appr-reject-me',
          status: 'rejected',
          reason: 'Security policy forbids deleting active plant room',
        },
        timestamp: new Date().toISOString(),
      });
    }

    const finalState = await actionPromise;
    expect(finalState.status).toBe('rejected');
    expect(finalState.isRejected).toBe(true);
    expect(finalState.error).toBe('Security policy forbids deleting active plant room');
    expect(rejectionReason).toBe('Security policy forbids deleting active plant room');
    expect(sseListeners.get('approvals')?.size ?? 0).toBe(0);
  });

  it('handles direct 200 OK responses without entering pending state', async () => {
    const mockFetch = vi.fn().mockImplementation(async () => {
      return {
        status: 200,
        ok: true,
        headers: new Headers({ 'Content-Type': 'application/json' }),
        json: async () => ({ result: 'instant_success' }),
      };
    });

    const result = await executeGovernedAction(
      { action: 'refresh_telemetry' },
      { fetchFn: mockFetch as any, subscriptionClient: mockSubscriptionClient }
    );

    expect(result.status).toBe('resolved');
    expect(result.isResolved).toBe(true);
    expect(result.isPendingApproval).toBe(false);
    expect(result.data).toEqual({ result: 'instant_success' });
    expect(mockSubscriptionClient.subscribe).not.toHaveBeenCalled();
  });

  it('handles HTTP error responses and transitions to failed state', async () => {
    const mockFetch = vi.fn().mockImplementation(async () => {
      return {
        status: 403,
        ok: false,
        headers: new Headers({ 'Content-Type': 'application/json' }),
        json: async () => ({ error: 'Unauthorized to perform action' }),
      };
    });

    let errorCaptured: Error | null = null;

    const result = await executeGovernedAction(
      { action: 'restricted_override' },
      {
        fetchFn: mockFetch as any,
        subscriptionClient: mockSubscriptionClient,
        onError: (err) => {
          errorCaptured = err;
        },
      }
    );

    expect(result.status).toBe('failed');
    expect(result.isFailed).toBe(true);
    expect(errorCaptured).toBeDefined();
    expect(result.error?.toString()).toContain('Unauthorized to perform action');
  });

  it('integrates useGovernedAction hook with GovernedActionStatus and GovernedActionButton components in React lifecycle', async () => {
    const user = userEvent.setup();

    const mockFetch = vi.fn().mockImplementation(async () => {
      return {
        status: 202,
        ok: true,
        headers: new Headers({ 'Content-Type': 'application/json' }),
        json: async () => ({
          approval_id: 'appr-hook-42',
        }),
      };
    });

    function TestComponent() {
      const { execute, state, reset } = useGovernedAction('submit_change_order', {
        fetchFn: mockFetch as any,
        subscriptionClient: mockSubscriptionClient,
      });

      return (
        <div>
          <GovernedActionButton
            state={state}
            label="Submit Change Order"
            loadingLabel="Submitting Change Order..."
            pendingLabel="Awaiting Approval..."
            onClick={() => execute({ orderId: 'co-100' })}
          />
          <GovernedActionStatus state={state} actionName="Change Order" />
          <button type="button" onClick={reset}>
            Reset
          </button>
        </div>
      );
    }

    render(<TestComponent />);

    const button = screen.getByRole('button', { name: 'Submit Change Order' });
    expect(button).toBeDefined();
    expect(button.getAttribute('data-action-status')).toBe('idle');

    // Click submit button
    await user.click(button);

    // Verify 202 puts UI into pending-approval
    await waitFor(() => {
      expect(screen.getByTestId('governed-action-pending-approval')).toBeDefined();
      expect(screen.getByText('Governance Approval Pending')).toBeDefined();
      expect(screen.getByText(/ID: appr-hook-42/)).toBeDefined();
    });

    // Button should now be disabled and show pending label
    const pendingButton = screen.getByRole('button', { name: 'Awaiting Approval...' }) as HTMLButtonElement;
    expect(pendingButton).toBeDefined();
    expect(pendingButton.disabled).toBe(true);

    // Dispatch SSE approval event
    act(() => {
      for (const listener of sseListeners.get('approvals')!) {
        listener({
          topic: 'approvals',
          data: {
            approvalId: 'appr-hook-42',
            status: 'approved',
            proposal: { orderApproved: true },
          },
          timestamp: new Date().toISOString(),
        });
      }
    });

    // Verify UI updates to resolved
    await waitFor(() => {
      expect(screen.getByTestId('governed-action-resolved')).toBeDefined();
      expect(screen.getByText('Action Approved & Executed')).toBeDefined();
    });

    // Click Reset
    const resetButton = screen.getByRole('button', { name: 'Reset' });
    await user.click(resetButton);

    expect(screen.queryByTestId('governed-action-resolved')).toBeNull();
    const readyButton = screen.getByRole('button', { name: 'Submit Change Order' }) as HTMLButtonElement;
    expect(readyButton.disabled).toBe(false);
  });
});
