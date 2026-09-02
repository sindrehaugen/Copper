import { useState, useEffect, useRef, useCallback } from "react";
import { SearchItem, UseGlobalSearchOptions, UseGlobalSearchResult, TopologyFetcher } from "./types";
import { rerankItems } from "./reranker";
import { getDefaultCommands } from "./commands";
import { getRecentSearches, getFrequentCommands } from "./history";
import { FIXTURE_ENTITIES } from "./fixtures";

export const defaultTopologyFetcher: TopologyFetcher = async (
  namespaceId: string = "default",
  signal?: AbortSignal
): Promise<any> => {
  const init: RequestInit = {
    headers: { "Content-Type": "application/json" },
  };
  if (signal) {
    init.signal = signal;
  }

  const res = await fetch(
    `/api/design/topology?namespace_id=${encodeURIComponent(namespaceId)}`,
    init
  );
  if (!res.ok) {
    throw new Error(`Failed to fetch topology: ${res.status} ${res.statusText}`);
  }
  return res.json();
};

export function transformTopologyToSearchItems(doc: any): SearchItem[] {
  if (!doc || typeof doc !== "object") return [];

  const items: SearchItem[] = [];

  // Locations / Rooms
  if (Array.isArray(doc.locations)) {
    doc.locations.forEach((loc: any) => {
      if (!loc || !loc.id) return;
      items.push({
        id: loc.id,
        type: "FUNCTIONAL_LOCATION",
        title: loc.name || loc.slug || loc.id,
        subtitle: loc.description || `Location: ${loc.slug || loc.id}`,
        code: loc.slug || loc.id,
        keywords: [loc.name, loc.slug, loc.description, "location", "room", loc.id].filter(Boolean),
        category: "entity",
        url: `/e/FUNCTIONAL_LOCATION/${loc.id}`,
      });
    });
  }

  // Sites
  if (Array.isArray(doc.sites)) {
    doc.sites.forEach((site: any) => {
      if (!site || !site.id) return;
      items.push({
        id: site.id,
        type: "FUNCTIONAL_LOCATION",
        title: site.name || site.slug || site.id,
        subtitle: site.description || `Site: ${site.slug || site.id}`,
        code: site.slug || site.id,
        keywords: [site.name, site.slug, site.description, "site", site.id].filter(Boolean),
        category: "entity",
        url: `/e/FUNCTIONAL_LOCATION/${site.id}`,
      });
    });
  }

  // Racks
  if (Array.isArray(doc.racks)) {
    doc.racks.forEach((rack: any) => {
      if (!rack || !rack.id) return;
      items.push({
        id: rack.id,
        type: "RACK",
        title: rack.name || rack.id,
        subtitle: `Rack (${rack.uHeight ?? 42}U) - Status: ${rack.status ?? "active"}`,
        code: rack.id,
        keywords: [rack.name, rack.id, "rack", rack.status].filter(Boolean),
        category: "entity",
        url: `/e/RACK/${rack.id}`,
      });
    });
  }

  // Devices / Assets
  if (Array.isArray(doc.devices)) {
    doc.devices.forEach((dev: any) => {
      if (!dev || !dev.id) return;
      items.push({
        id: dev.id,
        type: "ASSET",
        title: dev.name || dev.designation || dev.id,
        subtitle: dev.description || `Device: ${dev.designation || dev.id} (${dev.status ?? "active"})`,
        code: dev.designation || dev.id,
        keywords: [
          dev.name,
          dev.designation,
          dev.deviceTypeId,
          dev.description,
          "device",
          "asset",
          dev.id,
        ].filter(Boolean),
        category: "entity",
        url: `/e/ASSET/${dev.id}`,
      });
    });
  }

  return items;
}

function getEmptyQueryResults(): SearchItem[] {
  const recents = getRecentSearches();
  const frequents = getFrequentCommands();
  const defaultCmds = getDefaultCommands();

  const emptyResults: SearchItem[] = [];

  recents.forEach((item) => {
    emptyResults.push({
      id: item.id,
      type: item.type,
      title: item.title,
      subtitle: item.subtitle,
      code: item.code,
      keywords: item.keywords,
      category: "recent",
      url: item.url,
      action: item.action,
      icon: item.icon,
      metadata: item.metadata,
      score: 1.0,
    });
  });

  frequents.forEach((item) => {
    if (!emptyResults.some((r) => r.id === item.id)) {
      emptyResults.push({
        id: item.id,
        type: item.type,
        title: item.title,
        subtitle: item.subtitle,
        code: item.code,
        keywords: item.keywords,
        category: "frequent",
        url: item.url,
        action: item.action,
        icon: item.icon,
        metadata: item.metadata,
        score: 0.95,
      });
    }
  });

  defaultCmds.slice(0, 5).forEach((cmd) => {
    if (!emptyResults.some((r) => r.id === cmd.id)) {
      emptyResults.push({
        id: cmd.id,
        type: cmd.type,
        title: cmd.title,
        subtitle: cmd.subtitle,
        code: cmd.code,
        keywords: cmd.keywords,
        category: cmd.category,
        url: cmd.url,
        action: cmd.action,
        icon: cmd.icon,
        metadata: cmd.metadata,
        score: 0.8,
      });
    }
  });

  return emptyResults;
}

export function useGlobalSearch({
  query: controlledQuery,
  namespace = "default",
  fetcher = defaultTopologyFetcher,
  debounceMs = 0,
  localItems,
  enabled = true,
  options,
}: UseGlobalSearchOptions = {}): UseGlobalSearchResult {
  const [internalQuery, setInternalQuery] = useState("");
  const query = controlledQuery !== undefined ? controlledQuery : internalQuery;

  const [topologyItems, setTopologyItems] = useState<SearchItem[]>([]);
  const [results, setResults] = useState<SearchItem[]>(() => getEmptyQueryResults());
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchAbortRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchTopology = useCallback(async () => {
    if (!enabled) return;

    if (fetchAbortRef.current) {
      fetchAbortRef.current.abort();
    }
    const abortController = new AbortController();
    fetchAbortRef.current = abortController;

    setIsFetching(true);
    setError(null);

    try {
      const doc = await fetcher(namespace, abortController.signal);
      const items = transformTopologyToSearchItems(doc);
      setTopologyItems(items);
      setIsFetching(false);
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setError(err instanceof Error ? err : new Error(String(err)));
        // Fallback to local/fixture items if fetch fails
        if (localItems && localItems.length > 0) {
          setTopologyItems(localItems);
        } else {
          setTopologyItems(FIXTURE_ENTITIES);
        }
      }
      setIsFetching(false);
    }
  }, [enabled, namespace, fetcher, localItems]);

  // Fetch live topology when enabled or namespace/fetcher changes
  useEffect(() => {
    if (enabled) {
      fetchTopology();
    }
    return () => {
      if (fetchAbortRef.current) {
        fetchAbortRef.current.abort();
      }
    };
  }, [enabled, fetchTopology]);

  // Execute debounced indexing and search
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const trimmed = query.trim();

    if (!trimmed) {
      setResults(getEmptyQueryResults());
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const performSearch = () => {
      // Gather all candidates
      const candidateMap = new Map<string, SearchItem>();

      // Add local items if explicitly provided
      if (localItems && localItems.length > 0) {
        localItems.forEach((item) => candidateMap.set(item.id, item));
      }

      // Add live topology items
      topologyItems.forEach((item) => candidateMap.set(item.id, item));

      // Add default actions / navigation commands
      getDefaultCommands().forEach((cmd) => {
        if (!candidateMap.has(cmd.id)) {
          candidateMap.set(cmd.id, cmd);
        }
      });

      const candidateArray = Array.from(candidateMap.values());
      const ranked = rerankItems(trimmed, candidateArray, options);

      setResults(ranked);
      setIsLoading(false);
    };

    if (debounceMs <= 0) {
      performSearch();
    } else {
      debounceTimerRef.current = setTimeout(performSearch, debounceMs);
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query, topologyItems, localItems, debounceMs, options]);

  return {
    query,
    setQuery: setInternalQuery,
    results,
    isLoading: isLoading || isFetching,
    isFetching,
    error,
    refetch: fetchTopology,
    topologyItems,
  };
}
