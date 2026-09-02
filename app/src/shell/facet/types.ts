import type { ComponentType } from "react";

export type Capability = string;

export interface FacetLoadContext {
  entityType: string;
  entityId: string;
  signal: AbortSignal;
  session?: {
    actor?: string;
    currentNamespace?: string;
    capabilities?: Capability[];
    [key: string]: unknown;
  } | undefined;
}

export interface FacetRenderProps<TData = unknown> {
  entityType: string;
  entityId: string;
  data: TData;
  isLoading: boolean;
  error: Error | null;
  reload: () => void;
}

export interface FacetAction {
  id: string;
  label: string;
  icon?: string;
  disabled?: boolean;
  onExecute: (context: { entityType: string; entityId: string }) => void | Promise<void>;
}

export interface FacetFinding {
  id: string;
  severity: "blocker" | "risk" | "advice";
  rule: string;
  message: string;
}

export interface Facet<TData = unknown> {
  id: string;
  entity: string[];
  weight: number;
  requires?: Capability[] | undefined;
  title?: string | undefined;
  load: (context: FacetLoadContext) => Promise<TData>;
  Render: ComponentType<FacetRenderProps<TData>>;
  findings?:
    | ((data: TData, context: { entityType: string; entityId: string }) => FacetFinding[])
    | FacetFinding[]
    | undefined;
  actions?:
    | ((data: TData, context: { entityType: string; entityId: string }) => FacetAction[])
    | FacetAction[]
    | undefined;
}

export interface FacetCardProps<TData = unknown> {
  facet: Facet<TData>;
  entityType: string;
  entityId: string;
  className?: string | undefined;
}

export interface FacetContainerProps {
  entityType: string;
  entityId: string;
  capabilities?: Capability[] | undefined;
  className?: string | undefined;
}
