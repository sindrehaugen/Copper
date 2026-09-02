import type { ReactNode, ComponentType } from "react";
import type {
  FacetLoadContext,
  FacetRenderProps,
  Capability,
  FacetFinding,
  FacetAction,
} from "../types";

export interface BaseFacetOptions<TData> {
  id?: string;
  entity: string[];
  weight?: number;
  requires?: Capability[];
  title?: string;
  load?: (context: FacetLoadContext) => Promise<TData>;
  Render?: ComponentType<FacetRenderProps<TData>>;
  findings?:
    | ((data: TData, context: { entityType: string; entityId: string }) => FacetFinding[])
    | FacetFinding[];
  actions?:
    | ((data: TData, context: { entityType: string; entityId: string }) => FacetAction[])
    | FacetAction[];
}

/* =========================================================================
   1. Summary Facet
   ========================================================================= */
export interface SummaryProperty {
  label: string;
  value: ReactNode;
  key?: string;
  badge?: {
    label: string;
    variant?: "neutral" | "success" | "warning" | "error" | "info";
  };
}

export interface SummaryMetric {
  label: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "flat";
}

export interface SummaryFacetData {
  title?: string;
  description?: string;
  status?: {
    label: string;
    variant?: "neutral" | "success" | "warning" | "error" | "info";
  };
  properties: SummaryProperty[];
  metrics?: SummaryMetric[];
}

export type SummaryFacetOptions = BaseFacetOptions<SummaryFacetData>;

/* =========================================================================
   2. Timeline Facet
   ========================================================================= */
export interface TimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  description?: string;
  actor?: {
    id?: string;
    name: string;
    avatarUrl?: string;
  };
  category?: string;
  status?: "completed" | "in_progress" | "failed" | "pending" | "info";
  metadata?: Record<string, unknown>;
}

export interface TimelineFacetData {
  events: TimelineEvent[];
  totalCount?: number;
  hasMore?: boolean;
}

export type TimelineFacetOptions = BaseFacetOptions<TimelineFacetData>;

/* =========================================================================
   3. Documents Facet
   ========================================================================= */
export interface DocumentItem {
  id: string;
  title: string;
  filename?: string;
  fileType?: string;
  sizeBytes?: number;
  updatedAt?: string;
  uploadedBy?: string;
  url?: string;
  category?: string;
  tags?: string[];
}

export interface DocumentsFacetData {
  documents: DocumentItem[];
  totalCount?: number;
}

export type DocumentsFacetOptions = BaseFacetOptions<DocumentsFacetData>;

/* =========================================================================
   4. Notes Facet
   ========================================================================= */
export interface NoteEntry {
  id: string;
  author: {
    id?: string;
    name: string;
  };
  content: string;
  createdAt: string;
  updatedAt?: string;
  isPinned?: boolean;
  tags?: string[];
}

export interface NotesFacetData {
  notes: NoteEntry[];
  totalCount?: number;
}

export type NotesFacetOptions = BaseFacetOptions<NotesFacetData>;

/* =========================================================================
   5. Spend Facet
   ========================================================================= */
export interface SpendBreakdownItem {
  id: string;
  category: string;
  description: string;
  amount: number;
  currency: string;
  status?: "committed" | "actual" | "forecast" | "pending";
  date?: string;
}

export interface SpendFacetData {
  currency: string;
  totalBudget?: number;
  totalSpend: number;
  committedSpend?: number;
  variance?: number;
  breakdown: SpendBreakdownItem[];
}

export type SpendFacetOptions = BaseFacetOptions<SpendFacetData>;

/* =========================================================================
   6. Telemetry Facet
   ========================================================================= */
export interface TelemetryMetric {
  id: string;
  name: string;
  value: number | string;
  unit?: string;
  status?: "normal" | "warning" | "critical" | "offline";
  lastUpdated?: string;
  history?: Array<{
    timestamp: string;
    value: number;
  }>;
}

export interface TelemetryFacetData {
  status: "healthy" | "degraded" | "offline" | "unknown";
  lastPing?: string;
  metrics: TelemetryMetric[];
}

export type TelemetryFacetOptions = BaseFacetOptions<TelemetryFacetData>;
