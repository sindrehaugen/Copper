import React from 'react';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ShellSubscriptionClient } from './client';
import { ConnectionBanner } from './ConnectionBanner';
import { RailUpdatePayload, FindingsUpdatePayload, ApprovalUpdatePayload, SlaClockPayload } from './types';
import '../../locales/i18n';

// Mock EventSource implementation for testing
class MockEventSource {
  public url: string;
  public onopen: ((ev: Event) => any) | null = null;
  public onerror: ((ev: Event) => any) | null = null;
  public onmessage: ((ev: MessageEvent) => any) | null = null;
  public readyState: number = 0; // CONNECTING
  public listeners: Record<string, ((event: any) => void)[]> = {};

  constructor(url: string) {
    this.url = url;
    setTimeout(() => {
      this.readyState = 1; // OPEN
      if (this.onopen) this.onopen(new Event('open'));
    }, 0);
  }

  public addEventListener(type: string, listener: (event: any) => void) {
    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }
    this.listeners[type]!.push(listener);
  }

  public removeEventListener(type: string, listener: (event: any) => void) {
    if (this.listeners[type]) {
      this.listeners[type] = this.listeners[type]!.filter(l => l !== listener);
    }
  }

  public dispatchMockEvent(type: string, data: any, id?: string) {
    const event = {
      type,
      data: typeof data === 'string' ? data : JSON.stringify(data),
      lastEventId: id || 'test-id',
    };
    if (this.listeners[type]) {
      for (const fn of this.listeners[type]!) {
        fn(event);
      }
    }
    if (type === 'message' && this.onmessage) {
      this.onmessage(event as any);
    }
  }

  public triggerError() {
    this.readyState = 2; // CLOSED
    if (this.onerror) {
      this.onerror(new Event('error'));
    }
  }

  public close() {
    this.readyState = 2;
  }
}

describe('Shell Server-Sent Events (SSE) Subscription Service (SH.W8 / Batch 136)', () => {
  let mockEventSourceInstance: MockEventSource | null = null;

  beforeEach(() => {
    vi.useFakeTimers();
    mockEventSourceInstance = null;
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  const createClient = (options = {}) => {
    return new ShellSubscriptionClient({
      url: '/api/events',
      initialBackoffMs: 100,
      maxBackoffMs: 1000,
      backoffMultiplier: 2,
      maxRetries: 3,
      eventSourceFactory: (url) => {
        mockEventSourceInstance = new MockEventSource(url);
        return mockEventSourceInstance as unknown as EventSource;
      },
      ...options,
    });
  };

  it('connects to SSE endpoint and tracks connection lifecycle state', () => {
    const client = createClient();
    expect(client.getStatus()).toBe('DISCONNECTED');

    const statusChanges: string[] = [];
    client.onStatusChange((status) => statusChanges.push(status));

    client.connect();
    expect(client.getStatus()).toBe('CONNECTING');

    vi.advanceTimersByTime(1);
    expect(client.getStatus()).toBe('CONNECTED');
    expect(statusChanges).toEqual(['CONNECTING', 'CONNECTED']);

    client.disconnect();
    expect(client.getStatus()).toBe('DISCONNECTED');
  });

  it('dispatches incoming rail updates to registered topic listeners', () => {
    const client = createClient();
    client.connect();
    vi.advanceTimersByTime(1);

    const receivedRailEvents: RailUpdatePayload[] = [];
    const unsubscribe = client.subscribe<RailUpdatePayload>('rail', (event) => {
      receivedRailEvents.push(event.data);
    });

    const railPayload: RailUpdatePayload = {
      sectionId: 'proposals',
      action: 'update',
      item: { id: 'p1', title: 'New Proposal' },
    };

    mockEventSourceInstance?.dispatchMockEvent('rail', railPayload);

    expect(receivedRailEvents.length).toBe(1);
    expect(receivedRailEvents[0]).toEqual(railPayload);

    // Verify unsubscribe stops dispatching
    unsubscribe();
    mockEventSourceInstance?.dispatchMockEvent('rail', { sectionId: 'proposals', action: 'delete' });
    expect(receivedRailEvents.length).toBe(1);

    client.disconnect();
  });

  it('dispatches incoming findings updates to registered findings listeners', () => {
    const client = createClient();
    client.connect();
    vi.advanceTimersByTime(1);

    const receivedFindings: FindingsUpdatePayload[] = [];
    client.subscribe<FindingsUpdatePayload>('findings', (event) => {
      receivedFindings.push(event.data);
    });

    const findingPayload: FindingsUpdatePayload = {
      action: 'add',
      finding: {
        id: 'f-sse-1',
        rule: 'AV-001',
        severity: 'blocker',
        message: 'Realtime blocker detected',
      },
    };

    mockEventSourceInstance?.dispatchMockEvent('findings', findingPayload);

    expect(receivedFindings.length).toBe(1);
    expect(receivedFindings[0]!.finding?.message).toBe('Realtime blocker detected');

    client.disconnect();
  });

  it('dispatches incoming approvals updates to registered approvals listeners', () => {
    const client = createClient();
    client.connect();
    vi.advanceTimersByTime(1);

    const receivedApprovals: ApprovalUpdatePayload[] = [];
    client.subscribe<ApprovalUpdatePayload>('approvals', (event) => {
      receivedApprovals.push(event.data);
    });

    const approvalPayload: ApprovalUpdatePayload = {
      approvalId: 'appr-123',
      status: 'approved',
      timestamp: '2026-09-02T22:00:00Z',
    };

    mockEventSourceInstance?.dispatchMockEvent('approvals', approvalPayload);

    expect(receivedApprovals.length).toBe(1);
    expect(receivedApprovals[0]!.status).toBe('approved');
    expect(receivedApprovals[0]!.approvalId).toBe('appr-123');

    client.disconnect();
  });

  it('dispatches incoming SLA clock updates to registered SLA listeners', () => {
    const client = createClient();
    client.connect();
    vi.advanceTimersByTime(1);

    const receivedSla: SlaClockPayload[] = [];
    client.subscribe<SlaClockPayload>('sla_clock', (event) => {
      receivedSla.push(event.data);
    });

    const slaPayload: SlaClockPayload = {
      ticketId: 't-999',
      remainingMs: 45000,
      status: 'running',
      timestamp: '2026-09-02T22:00:00Z',
    };

    mockEventSourceInstance?.dispatchMockEvent('sla_clock', slaPayload);

    expect(receivedSla.length).toBe(1);
    expect(receivedSla[0]!.ticketId).toBe('t-999');
    expect(receivedSla[0]!.remainingMs).toBe(45000);

    client.disconnect();
  });

  it('handles wildcard listener receiving all message types', () => {
    const client = createClient();
    client.connect();
    vi.advanceTimersByTime(1);

    const allEvents: string[] = [];
    client.subscribe('*', (event) => {
      allEvents.push(event.topic);
    });

    mockEventSourceInstance?.dispatchMockEvent('rail', { action: 'update' });
    mockEventSourceInstance?.dispatchMockEvent('findings', { action: 'add' });
    mockEventSourceInstance?.dispatchMockEvent('approvals', { status: 'pending' });
    mockEventSourceInstance?.dispatchMockEvent('sla_clock', { status: 'running' });

    expect(allEvents).toEqual(['rail', 'findings', 'approvals', 'sla_clock']);

    client.disconnect();
  });

  it('reconnects with exponential backoff when connection drops', () => {
    const client = createClient({
      initialBackoffMs: 100,
      backoffMultiplier: 2,
      maxRetries: 3,
    });

    client.connect();
    vi.advanceTimersByTime(1);
    expect(client.getStatus()).toBe('CONNECTED');

    // Trigger connection error
    mockEventSourceInstance?.triggerError();
    expect(client.getStatus()).toBe('RECONNECTING');

    // Fast-forward backoff delay (100ms)
    vi.advanceTimersByTime(100);
    expect(client.getStatus()).toBe('CONNECTING');

    // Establish connection again
    vi.advanceTimersByTime(1);
    expect(client.getStatus()).toBe('CONNECTED');

    client.disconnect();
  });

  it('transitions to DEGRADED state after max retries are exhausted', () => {
    const instances: MockEventSource[] = [];
    const client = new ShellSubscriptionClient({
      url: '/api/events',
      initialBackoffMs: 50,
      backoffMultiplier: 2,
      maxRetries: 2,
      eventSourceFactory: (url) => {
        const inst = new MockEventSource(url);
        instances.push(inst);
        return inst as unknown as EventSource;
      },
    });

    client.connect();
    expect(client.getStatus()).toBe('CONNECTING');
    vi.advanceTimersByTime(1);
    expect(client.getStatus()).toBe('CONNECTED');

    // Fail attempt 1
    instances[0]?.triggerError();
    expect(client.getStatus()).toBe('RECONNECTING');
    expect(client.getRetryCount()).toBe(1);

    // Wait for backoff 1 (50ms)
    vi.advanceTimersByTime(50);
    expect(client.getStatus()).toBe('CONNECTING');
    vi.advanceTimersByTime(1);
    expect(client.getStatus()).toBe('CONNECTED');

    // Fail attempt 2
    instances[1]?.triggerError();
    expect(client.getStatus()).toBe('RECONNECTING');
    expect(client.getRetryCount()).toBe(2);

    // Wait for backoff 2 (100ms)
    vi.advanceTimersByTime(100);
    expect(client.getStatus()).toBe('CONNECTING');
    vi.advanceTimersByTime(1);
    expect(client.getStatus()).toBe('CONNECTED');

    // Fail attempt 3 (exceeds maxRetries = 2)
    instances[2]?.triggerError();
    expect(client.getStatus()).toBe('DEGRADED');

    client.disconnect();
  });

  describe('ConnectionBanner UI', () => {
    it('renders nothing when status is CONNECTED or DISCONNECTED', () => {
      const { container, rerender } = render(<ConnectionBanner status="CONNECTED" />);
      expect(container.firstChild).toBeNull();

      rerender(<ConnectionBanner status="DISCONNECTED" />);
      expect(container.firstChild).toBeNull();
    });

    it('renders reconnecting banner with retry count and retry button', () => {
      const handleRetry = vi.fn();
      render(<ConnectionBanner status="RECONNECTING" retryCount={2} onRetry={handleRetry} />);

      const banner = screen.getByTestId('subscription-status-banner');
      expect(banner).toBeDefined();

      const retryBtn = screen.getByTestId('subscription-retry-btn');
      fireEvent.click(retryBtn);
      expect(handleRetry).toHaveBeenCalledTimes(1);
    });

    it('renders degraded banner when connection is DEGRADED', () => {
      render(<ConnectionBanner status="DEGRADED" />);

      const banner = screen.getByTestId('subscription-status-banner');
      expect(banner).toBeDefined();
      expect(banner.className).toContain('copper-connection-degraded');
    });
  });
});
