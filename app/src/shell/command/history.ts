import { SearchItem } from "./types";

const RECENT_STORAGE_KEY = "copper:command:recent";
const FREQUENT_STORAGE_KEY = "copper:command:frequent";
const MAX_RECENT_ITEMS = 8;

interface FrequentEntry {
  item: SearchItem;
  count: number;
  lastUsed: number;
}

export function getRecentSearches(): SearchItem[] {
  try {
    if (typeof localStorage === "undefined") return [];
    const raw = localStorage.getItem(RECENT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveRecentItem(item: SearchItem): void {
  try {
    if (typeof localStorage === "undefined") return;
    const current = getRecentSearches();
    const filtered = current.filter((i) => i.id !== item.id);
    const updated = [item, ...filtered].slice(0, MAX_RECENT_ITEMS);
    localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(updated));

    // Also update frequent stats
    recordCommandExecution(item);
  } catch {
    // Ignore storage errors
  }
}

export function clearRecentSearches(): void {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.removeItem(RECENT_STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}

export function recordCommandExecution(item: SearchItem): void {
  try {
    if (typeof localStorage === "undefined") return;
    const raw = localStorage.getItem(FREQUENT_STORAGE_KEY);
    const entries: Record<string, FrequentEntry> = raw ? JSON.parse(raw) : {};

    const existing = entries[item.id];
    if (existing) {
      existing.count += 1;
      existing.lastUsed = Date.now();
      existing.item = item;
    } else {
      entries[item.id] = {
        item,
        count: 1,
        lastUsed: Date.now(),
      };
    }

    localStorage.setItem(FREQUENT_STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Ignore storage errors
  }
}

export function getFrequentCommands(limit = 5): SearchItem[] {
  try {
    if (typeof localStorage === "undefined") return [];
    const raw = localStorage.getItem(FREQUENT_STORAGE_KEY);
    if (!raw) return [];
    const entries: Record<string, FrequentEntry> = JSON.parse(raw);
    const list = Object.values(entries);
    list.sort((a, b) => b.count - a.count || b.lastUsed - a.lastUsed);
    return list.slice(0, limit).map((e) => e.item);
  } catch {
    return [];
  }
}
