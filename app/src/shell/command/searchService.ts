import { SearchItem, RerankOptions } from "./types";
import { rerankItems } from "./reranker";
import { FIXTURE_ENTITIES } from "./fixtures";
import { getDefaultCommands } from "./commands";
import { getRecentSearches, getFrequentCommands } from "./history";

export interface SearchOptions extends RerankOptions {
  namespace?: string | undefined;
  signal?: AbortSignal | undefined;
  customCommands?: SearchItem[] | undefined;
}

/**
 * Aggregates results from server (/api/search) + local action commands + navigation + recent history,
 * and performs a unified rerank pass so all items score on the exact same scale.
 */
export async function searchCommandItems(
  query: string,
  localItems: SearchItem[] = FIXTURE_ENTITIES,
  options?: SearchOptions
): Promise<SearchItem[]> {
  const trimmed = query.trim();

  // If query is empty, return recent searches + frequent commands
  if (!trimmed) {
    const recents = getRecentSearches();
    const frequents = getFrequentCommands();
    const defaultCmds = options?.customCommands || getDefaultCommands();

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

  // Gather candidates
  const allCandidates = new Map<string, SearchItem>();

  // Add local / fixture items
  localItems.forEach((item) => {
    allCandidates.set(item.id, item);
  });

  // Add default actions and navigation
  const defaultCmds = options?.customCommands || getDefaultCommands();
  defaultCmds.forEach((cmd) => {
    if (!allCandidates.has(cmd.id)) {
      allCandidates.set(cmd.id, cmd);
    }
  });

  // Query server search mirror if in browser environment and not offline
  try {
    const nsParam = options?.namespace ? `&namespace_id=${encodeURIComponent(options.namespace)}` : "";
    const fetchInit: RequestInit = options?.signal ? { signal: options.signal } : {};
    const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}${nsParam}`, fetchInit);
    if (res.ok) {
      const serverResults = await res.json();
      if (Array.isArray(serverResults)) {
        serverResults.forEach((sr: any) => {
          if (sr && sr.id) {
            allCandidates.set(sr.id, {
              id: sr.id,
              type: sr.type || "ENTITY",
              code: sr.code || sr.id,
              title: sr.title || sr.name || sr.id,
              subtitle: sr.subtitle || sr.description,
              keywords: sr.keywords,
              category: "entity",
              url: sr.url || `/e/${sr.type || "ENTITY"}/${sr.id}`,
            });
          }
        });
      }
    }
  } catch {
    // Network or mock error - continue with available candidates
  }

  // Execute unified rerank pass
  const candidateArray = Array.from(allCandidates.values());
  return rerankItems(trimmed, candidateArray, options);
}
