import { IntelligenceSection, ShellFinding } from '../layout';

export type SubscriptionTopic =
  | 'rail'
  | 'findings'
  | 'approvals'
  | 'sla_clock'
  | 'status'
  | 'ping'
  | string;

export type ConnectionStatus =
  | 'DISCONNECTED'
  | 'CONNECTING'
  | 'CONNECTED'
  | 'RECONNECTING'
  | 'DEGRADED';

export interface RailUpdatePayload {
  sectionId?: string;
  sections?: IntelligenceSection[];
  item?: any;
  action?: 'update' | 'replace' | 'delete';
}

export interface FindingsUpdatePayload {
  findings?: ShellFinding[];
  finding?: ShellFinding;
  action?: 'add' | 'remove' | 'clear' | 'replace';
}

export interface ApprovalUpdatePayload {
  approvalId: string;
  status: 'pending' | 'approved' | 'rejected' | 'resolved';
  proposal?: any;
  timestamp: string;
}

export interface SlaClockPayload {
  ticketId: string;
  remainingMs: number;
  status: 'running' | 'paused' | 'breached';
  timestamp: string;
}

export interface ShellEvent<T = any> {
  id?: string;
  topic: SubscriptionTopic;
  data: T;
  timestamp: string;
}

export type EventHandler<T = any> = (event: ShellEvent<T>) => void;
export type StatusChangeHandler = (
  status: ConnectionStatus,
  detail?: { retryCount?: number; error?: any }
) => void;

export interface SubscriptionClientOptions {
  url?: string;
  namespace?: string;
  autoReconnect?: boolean;
  initialBackoffMs?: number;
  maxBackoffMs?: number;
  backoffMultiplier?: number;
  maxRetries?: number;
  eventSourceFactory?: (url: string) => EventSource;
}
