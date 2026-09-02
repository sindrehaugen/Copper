import {
  SubscriptionTopic,
  ConnectionStatus,
  ShellEvent,
  EventHandler,
  StatusChangeHandler,
  SubscriptionClientOptions,
} from './types';

export class ShellSubscriptionClient {
  private url: string;
  private namespace?: string | undefined;
  private autoReconnect: boolean;
  private initialBackoffMs: number;
  private maxBackoffMs: number;
  private backoffMultiplier: number;
  private maxRetries: number;
  private eventSourceFactory?: ((url: string) => EventSource) | undefined;

  private eventSource: EventSource | null = null;
  private status: ConnectionStatus = 'DISCONNECTED';
  private retryCount: number = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  private topicListeners: Map<string, Set<EventHandler>> = new Map();
  private wildcardListeners: Set<EventHandler> = new Set();
  private statusListeners: Set<StatusChangeHandler> = new Set();
  private attachedEventTypes: Set<string> = new Set();

  constructor(options: SubscriptionClientOptions = {}) {
    this.url = options.url || '/api/events';
    this.namespace = options.namespace;
    this.autoReconnect = options.autoReconnect ?? true;
    this.initialBackoffMs = options.initialBackoffMs ?? 1000;
    this.maxBackoffMs = options.maxBackoffMs ?? 30000;
    this.backoffMultiplier = options.backoffMultiplier ?? 1.5;
    this.maxRetries = options.maxRetries ?? 5;
    this.eventSourceFactory = options.eventSourceFactory;
  }

  public getStatus(): ConnectionStatus {
    return this.status;
  }

  public getRetryCount(): number {
    return this.retryCount;
  }

  private setStatus(newStatus: ConnectionStatus, detail?: { retryCount?: number; error?: any }): void {
    if (this.status !== newStatus) {
      this.status = newStatus;
      for (const listener of this.statusListeners) {
        try {
          listener(newStatus, detail);
        } catch (err) {
          console.error('Error in status change listener:', err);
        }
      }
    }
  }

  public connect(): void {
    if (this.status === 'CONNECTED' || this.status === 'CONNECTING') {
      return;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.setStatus('CONNECTING');

    const fullUrl = this.buildUrl();

    try {
      this.attachedEventTypes.clear();
      if (this.eventSourceFactory) {
        this.eventSource = this.eventSourceFactory(fullUrl);
      } else if (typeof EventSource !== 'undefined') {
        this.eventSource = new EventSource(fullUrl);
      } else {
        throw new Error('EventSource is not supported in this environment');
      }

      this.setupEventSourceHandlers();
    } catch (err) {
      console.error('Failed to initialize EventSource:', err);
      this.handleConnectionFailure(err);
    }
  }

  private buildUrl(): string {
    const params = new URLSearchParams();
    if (this.namespace) {
      params.set('namespace', this.namespace);
    }
    const query = params.toString();
    return query ? `${this.url}?${query}` : this.url;
  }

  private attachTopicListenerToEventSource(topic: string): void {
    if (!this.eventSource || this.attachedEventTypes.has(topic)) return;
    if (typeof this.eventSource.addEventListener === 'function') {
      this.eventSource.addEventListener(topic, (event: any) => {
        this.handleIncomingRawEvent(topic, event);
      });
      this.attachedEventTypes.add(topic);
    }
  }

  private setupEventSourceHandlers(): void {
    if (!this.eventSource) return;

    this.eventSource.onopen = () => {
      this.setStatus('CONNECTED');
    };

    this.eventSource.onerror = (err) => {
      this.handleConnectionFailure(err);
    };

    this.eventSource.onmessage = (event: MessageEvent) => {
      this.handleIncomingRawEvent('message', event);
    };

    // Standard shell topics
    const standardTopics = ['rail', 'findings', 'approvals', 'sla_clock', 'status', 'ping'];
    for (const topic of standardTopics) {
      this.attachTopicListenerToEventSource(topic);
    }

    // Also attach any previously subscribed custom topics
    for (const topic of this.topicListeners.keys()) {
      this.attachTopicListenerToEventSource(topic);
    }
  }

  private handleIncomingRawEvent(topic: string, event: MessageEvent | any): void {
    let parsedData: any = event.data;
    if (typeof event.data === 'string') {
      try {
        parsedData = JSON.parse(event.data);
      } catch {
        parsedData = event.data;
      }
    }

    const shellEvent: ShellEvent = {
      id: event.lastEventId || undefined,
      topic,
      data: parsedData,
      timestamp: new Date().toISOString(),
    };

    this.dispatchEvent(shellEvent);
  }

  private dispatchEvent(event: ShellEvent): void {
    // Dispatch to topic specific listeners
    const listeners = this.topicListeners.get(event.topic);
    if (listeners) {
      for (const listener of listeners) {
        try {
          listener(event);
        } catch (err) {
          console.error(`Error dispatching ${event.topic} event:`, err);
        }
      }
    }

    // Dispatch to wildcard listeners
    for (const listener of this.wildcardListeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Error dispatching wildcard event:', err);
      }
    }
  }

  private handleConnectionFailure(error?: any): void {
    if (this.eventSource) {
      try {
        this.eventSource.close();
      } catch {
        // ignore
      }
      this.eventSource = null;
    }

    if (!this.autoReconnect) {
      this.setStatus('DISCONNECTED', { error });
      return;
    }

    this.retryCount++;
    if (this.retryCount > this.maxRetries) {
      this.setStatus('DEGRADED', { retryCount: this.retryCount, error });
      return;
    }

    this.setStatus('RECONNECTING', { retryCount: this.retryCount, error });

    const delay = Math.min(
      this.maxBackoffMs,
      this.initialBackoffMs * Math.pow(this.backoffMultiplier, this.retryCount - 1)
    );

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  public subscribe<T = any>(
    topic: SubscriptionTopic,
    handler: EventHandler<T>
  ): () => void {
    if (topic === '*' || topic === 'all') {
      this.wildcardListeners.add(handler as EventHandler);
      return () => {
        this.wildcardListeners.delete(handler as EventHandler);
      };
    }

    if (!this.topicListeners.has(topic)) {
      this.topicListeners.set(topic, new Set());
      this.attachTopicListenerToEventSource(topic);
    }

    const listeners = this.topicListeners.get(topic)!;
    listeners.add(handler as EventHandler);

    return () => {
      listeners.delete(handler as EventHandler);
      if (listeners.size === 0) {
        this.topicListeners.delete(topic);
      }
    };
  }

  public onStatusChange(handler: StatusChangeHandler): () => void {
    this.statusListeners.add(handler);
    return () => {
      this.statusListeners.delete(handler);
    };
  }

  public retryNow(): void {
    this.retryCount = 0;
    this.connect();
  }

  public disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.eventSource) {
      try {
        this.eventSource.close();
      } catch {
        // ignore
      }
      this.eventSource = null;
    }

    this.retryCount = 0;
    this.setStatus('DISCONNECTED');
  }
}

// Global Singleton
let globalClientInstance: ShellSubscriptionClient | null = null;

export function getSubscriptionService(
  options?: SubscriptionClientOptions
): ShellSubscriptionClient {
  if (!globalClientInstance) {
    globalClientInstance = new ShellSubscriptionClient(options);
  }
  return globalClientInstance;
}

export function resetSubscriptionService(): void {
  if (globalClientInstance) {
    globalClientInstance.disconnect();
    globalClientInstance = null;
  }
}
