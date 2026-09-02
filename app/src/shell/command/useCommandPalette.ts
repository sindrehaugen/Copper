import { useState, useEffect, useCallback, useRef } from "react";
import { SearchItem, CommandPaletteProps } from "./types";
import { searchCommandItems } from "./searchService";
import { saveRecentItem } from "./history";

export function useCommandPalette({
  isOpen: controlledIsOpen,
  onClose,
  onSelect,
  items: initialItems,
  namespace,
}: Partial<CommandPaletteProps> = {}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  const open = useCallback(() => {
    setInternalIsOpen(true);
    setSelectedIndex(0);
  }, []);

  const close = useCallback(() => {
    setInternalIsOpen(false);
    onClose?.();
    setQuery("");
    setSelectedIndex(0);
  }, [onClose]);

  const toggle = useCallback(() => {
    if (isOpen) close();
    else open();
  }, [isOpen, open, close]);

  // Global keyboard shortcut listener for ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        toggle();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggle]);

  // Perform search / rerank when query or open state changes
  useEffect(() => {
    if (!isOpen) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setIsLoading(true);
    searchCommandItems(query, initialItems, {
      namespace,
      signal: abortController.signal,
    })
      .then((res) => {
        setResults(res);
        setSelectedIndex(0);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });

    return () => {
      abortController.abort();
    };
  }, [query, isOpen, initialItems, namespace]);

  const handleSelectItem = useCallback(
    (item: SearchItem) => {
      saveRecentItem(item);

      if (onSelect) {
        onSelect(item);
      } else if (item.action) {
        item.action();
      } else if (item.url && typeof window !== "undefined") {
        if (window.location.pathname !== item.url) {
          window.location.href = item.url;
        }
      }

      close();
    },
    [onSelect, close]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (results.length > 0 ? (prev + 1) % results.length : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          results.length > 0 ? (prev - 1 + results.length) % results.length : 0
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (results.length > 0 && results[selectedIndex]) {
          handleSelectItem(results[selectedIndex]);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        close();
      } else if (e.key === "Home") {
        e.preventDefault();
        setSelectedIndex(0);
      } else if (e.key === "End") {
        e.preventDefault();
        setSelectedIndex(Math.max(0, results.length - 1));
      }
    },
    [results, selectedIndex, handleSelectItem, close]
  );

  return {
    isOpen,
    open,
    close,
    toggle,
    query,
    setQuery,
    results,
    selectedIndex,
    setSelectedIndex,
    isLoading,
    handleKeyDown,
    handleSelectItem,
  };
}
