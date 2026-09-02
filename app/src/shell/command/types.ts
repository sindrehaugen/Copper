import React from "react";

export type EntityType =
  | "FUNCTIONAL_LOCATION"
  | "ROOM"
  | "ASSET"
  | "QUOTE"
  | "TICKET"
  | "CUSTOMER"
  | "PRODUCT"
  | "VENDOR"
  | "AGREEMENT"
  | "DESIGN"
  | "WORK_ORDER"
  | "PO_LINE"
  | "GOODS_RECEIPT"
  | "RACK"
  | "DEVICE"
  | "SITE"
  | "ACTION"
  | "NAV"
  | string;

export type SearchCategory = "entity" | "action" | "navigation" | "recent" | "frequent";

export interface SearchItem {
  id: string;
  type: EntityType;
  title: string;
  subtitle?: string | undefined;
  code?: string | undefined;
  keywords?: string[] | undefined;
  category: SearchCategory;
  url?: string | undefined;
  action?: (() => void) | undefined;
  icon?: (string | React.ReactNode) | undefined;
  metadata?: Record<string, any> | undefined;
  score?: number | undefined;
  highlightIndices?: {
    title?: [number, number][] | undefined;
    code?: [number, number][] | undefined;
  } | undefined;
}

export interface RerankOptions {
  limit?: number | undefined;
  minScore?: number | undefined;
  recentBonus?: number | undefined;
  typeBonus?: Record<string, number> | undefined;
}

export type TopologyFetcher = (
  namespaceId: string,
  signal?: AbortSignal
) => Promise<any>;

export interface UseGlobalSearchOptions {
  query?: string | undefined;
  namespace?: string | undefined;
  fetcher?: TopologyFetcher | undefined;
  debounceMs?: number | undefined;
  localItems?: SearchItem[] | undefined;
  enabled?: boolean | undefined;
  options?: RerankOptions | undefined;
}

export interface UseGlobalSearchResult {
  query: string;
  setQuery: (q: string) => void;
  results: SearchItem[];
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  topologyItems: SearchItem[];
}

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: ((item: SearchItem) => void) | undefined;
  items?: SearchItem[] | undefined;
  placeholder?: string | undefined;
  namespace?: string | undefined;
  fetcher?: TopologyFetcher | undefined;
  debounceMs?: number | undefined;
}
