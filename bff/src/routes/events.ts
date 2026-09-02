import { Hono } from 'hono';
import { streamSSE } from 'hono/streaming';

/**
 * Supported real-time shell topics per Batch 136 / SH.W8
 */
export type SseTopic = 'rail' | 'findings' | 'approvals' | 'sla_clock' | 'status' | 'ping';

export interface SsePayload<T = unknown> {
  topic: SseTopic | string;
  data: T;
  id?: string;
  timestamp?: string;
}

export type SseListener = (event: SsePayload) => void;

class SseBroadcaster {
  private listeners: Set<SseListener> = new Set();

  public subscribe(listener: SseListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public broadcast(topic: SseTopic | string, data: unknown, id?: string): void {
    const payload: SsePayload = {
      topic,
      data,
      id: id || `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
    };
    for (const listener of this.listeners) {
      try {
        listener(payload);
      } catch (err) {
        console.error('Error dispatching SSE event to listener:', err);
      }
    }
  }

  public getListenerCount(): number {
    return this.listeners.size;
  }
}

export const broadcaster = new SseBroadcaster();

/**
 * Format a typed payload as standard SSE text wire format
 */
export function formatSseMessage(params: {
  event?: string;
  data: unknown;
  id?: string;
  retry?: number;
}): string {
  let msg = '';
  if (params.event) {
    msg += `event: ${params.event}\n`;
  }
  if (params.id) {
    msg += `id: ${params.id}\n`;
  }
  if (params.retry) {
    msg += `retry: ${params.retry}\n`;
  }
  const dataStr = typeof params.data === 'string' ? params.data : JSON.stringify(params.data);
  const dataLines = dataStr.split('\n');
  for (const line of dataLines) {
    msg += `data: ${line}\n`;
  }
  msg += '\n';
  return msg;
}

export const eventsRoutes = new Hono();

/**
 * Server-Sent Events endpoint: GET /api/events
 * Streams real-time shell events (rail, findings, approvals, sla clocks).
 */
eventsRoutes.get('/', async (c) => {
  const namespace = c.req.query('namespace') || 'default';

  return streamSSE(c, async (stream) => {
    // Send initial connected state
    await stream.writeSSE({
      event: 'status',
      data: JSON.stringify({
        status: 'CONNECTED',
        namespace,
        timestamp: new Date().toISOString(),
        supportedTopics: ['rail', 'findings', 'approvals', 'sla_clock'],
      }),
    });

    // Subscribe client to broadcast channel
    const unsubscribe = broadcaster.subscribe(async (payload) => {
      try {
        const sseMsg: { event: string; data: string; id?: string } = {
          event: payload.topic,
          data: JSON.stringify(payload.data),
        };
        if (payload.id !== undefined) {
          sseMsg.id = payload.id;
        }
        await stream.writeSSE(sseMsg);
      } catch (err) {
        console.warn('Error writing SSE to client stream:', err);
      }
    });

    stream.onAbort(() => {
      unsubscribe();
    });

    // Keepalive loop waiting on client abort
    while (!stream.aborted) {
      await stream.sleep(25000);
      if (!stream.aborted) {
        await stream.writeSSE({
          event: 'ping',
          data: JSON.stringify({ timestamp: new Date().toISOString() }),
        });
      }
    }
  });
});

/**
 * Helper endpoint to publish/broadcast events in test or dev mode
 */
eventsRoutes.post('/publish', async (c) => {
  try {
    const body = await c.req.json();
    const { topic, data, id } = body;
    if (!topic || data === undefined) {
      return c.json({ error: 'Missing topic or data in request body' }, 400);
    }
    broadcaster.broadcast(topic, data, id);
    return c.json({ ok: true, recipientCount: broadcaster.getListenerCount() });
  } catch (err: any) {
    return c.json({ error: err?.message || 'Invalid JSON body' }, 400);
  }
});
