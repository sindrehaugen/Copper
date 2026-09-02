import React, { useRef, useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useInRouterContext, useNavigate } from "react-router-dom";
import { CommandPaletteProps, SearchItem } from "./types";
import { useGlobalSearch } from "./useGlobalSearch";
import { saveRecentItem } from "./history";
import { EntityChip } from "@copper/spine";
import "./command.css";

function RouterBridge({
  navigateRef,
}: {
  navigateRef: React.MutableRefObject<((to: string) => void) | null>;
}) {
  const navigate = useNavigate();
  navigateRef.current = navigate;
  return null;
}

export function CommandPalette({
  isOpen,
  onClose,
  onSelect,
  items,
  placeholder,
  namespace,
  fetcher,
  debounceMs = 0,
}: CommandPaletteProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const inRouter = useInRouterContext();
  const navigateRef = useRef<((to: string) => void) | null>(null);

  const [selectedIndex, setSelectedIndex] = useState(0);

  const {
    query,
    setQuery,
    results,
    isLoading,
    isFetching,
  } = useGlobalSearch({
    namespace,
    fetcher,
    debounceMs,
    localItems: items,
    enabled: isOpen,
  });

  // Focus input on mount / when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleNavigate = useCallback(
    (url: string) => {
      if (navigateRef.current) {
        navigateRef.current(url);
      } else if (typeof window !== "undefined") {
        if (window.history && typeof window.history.pushState === "function") {
          window.history.pushState(null, "", url);
          window.dispatchEvent(new PopStateEvent("popstate"));
        } else {
          window.location.href = url;
        }
      }
    },
    []
  );

  const handleSelectItem = useCallback(
    (item: SearchItem) => {
      saveRecentItem(item);

      if (onSelect) {
        onSelect(item);
      } else if (item.action) {
        item.action();
      } else {
        const targetUrl =
          item.url ||
          (item.category === "entity" ? `/e/${item.type}/${item.id}` : undefined);
        if (targetUrl) {
          handleNavigate(targetUrl);
        }
      }

      onClose();
    },
    [onSelect, handleNavigate, onClose]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          results.length > 0 ? (prev + 1) % results.length : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          results.length > 0 ? (prev - 1 + results.length) % results.length : 0
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (results.length > 0 && results[selectedIndex]) {
          handleSelectItem(results[selectedIndex]!);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "Home") {
        e.preventDefault();
        setSelectedIndex(0);
      } else if (e.key === "End") {
        e.preventDefault();
        setSelectedIndex(Math.max(0, results.length - 1));
      }
    },
    [results, selectedIndex, handleSelectItem, onClose]
  );

  if (!isOpen) return null;

  const activeOptionId =
    results.length > 0 && selectedIndex >= 0 && selectedIndex < results.length
      ? `copper-command-opt-${selectedIndex}`
      : undefined;

  const isQueryEmpty = !query.trim();

  const renderItem = (item: SearchItem, index: number) => {
    const isSelected = index === selectedIndex;
    const optionId = `copper-command-opt-${index}`;

    return (
      <div
        key={item.id}
        id={optionId}
        role="option"
        tabIndex={-1}
        aria-selected={isSelected ? "true" : "false"}
        className={`copper-command-item ${isSelected ? "selected" : ""}`}
        onClick={() => handleSelectItem(item)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleSelectItem(item);
          }
        }}
        onMouseEnter={() => setSelectedIndex(index)}
      >
        <div className="copper-command-item-main">
          {item.category === "entity" ? (
            <EntityChip
              type={item.type}
              code={item.code}
              label={item.type}
              variant="compact"
            />
          ) : (
            <div className="copper-command-item-icon" aria-hidden="true">
              {item.icon || (item.category === "action" ? "⚡" : "🧭")}
            </div>
          )}

          <div className="copper-command-item-text">
            <span className="copper-command-item-title">{item.title}</span>
            {item.subtitle && (
              <span className="copper-command-item-subtitle">{item.subtitle}</span>
            )}
          </div>
        </div>

        <div className="copper-command-item-meta">
          {typeof item.score === "number" && query.trim() && (
            <span
              className="copper-command-badge"
              title={`${t("nav.matchScore", "Match score")}: ${Math.round(item.score * 100)}%`}
            >
              {`${Math.round(item.score * 100)}%`}
            </span>
          )}
          {item.category === "action" && (
            <span className="copper-command-badge">
              {t("nav.actionBadge", "Action")}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      role="presentation"
      className="copper-command-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      data-testid="command-palette-overlay"
    >
      {inRouter && <RouterBridge navigateRef={navigateRef} />}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("nav.commandPalette", "Command Palette")}
        className="copper-command-dialog"
      >
        <div className="copper-command-header">
          <span className="copper-command-search-icon" aria-hidden="true">
            {isLoading || isFetching ? "⏳" : "🔍"}
          </span>
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded="true"
            aria-controls="copper-command-results"
            aria-activedescendant={activeOptionId}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              placeholder ||
              t("nav.commandPlaceholder", "Type a command, entity name or jump to...")
            }
            className="copper-command-input"
            data-testid="command-input"
          />
          <span className="copper-command-badge" aria-hidden="true">
            {t("nav.escKey", "ESC")}
          </span>
        </div>

        <div
          role="listbox"
          id="copper-command-results"
          className="copper-command-results"
          data-testid="command-results-list"
        >
          {results.length === 0 ? (
            <div className="copper-command-empty">
              {isLoading
                ? t("nav.searching", "Searching...")
                : t("nav.noCommandsFound", "No matching entities or actions found.")}
            </div>
          ) : isQueryEmpty ? (
            <>
              {results.some((r) => r.category === "recent") && (
                <div className="copper-command-group-header">
                  {t("nav.recentGroup", "Recent")}
                </div>
              )}
              {results.map((item, idx) => {
                const prevItem = idx > 0 ? results[idx - 1] : undefined;
                const isFirstNonRecent =
                  item.category !== "recent" &&
                  (idx === 0 || (prevItem && prevItem.category === "recent"));
                return (
                  <React.Fragment key={item.id}>
                    {isFirstNonRecent && (
                      <div className="copper-command-group-header">
                        {t("nav.suggestedGroup", "Suggested Commands")}
                      </div>
                    )}
                    {renderItem(item, idx)}
                  </React.Fragment>
                );
              })}
            </>
          ) : (
            results.map((item, idx) => renderItem(item, idx))
          )}
        </div>

        <div className="copper-command-footer">
          <div className="copper-command-footer-hints">
            <span className="copper-command-key-hint">
              <kbd className="copper-command-key">{"↑"}</kbd>
              <kbd className="copper-command-key">{"↓"}</kbd>
              <span>{` ${t("nav.toNavigate", "to navigate")}`}</span>
            </span>
            <span className="copper-command-key-hint">
              <kbd className="copper-command-key">{"↵"}</kbd>
              <span>{` ${t("nav.toSelect", "to select")}`}</span>
            </span>
            <span className="copper-command-key-hint">
              <kbd className="copper-command-key">{t("nav.escKeyLower", "esc")}</kbd>
              <span>{` ${t("nav.toClose", "to close")}`}</span>
            </span>
          </div>
          {results.length > 0 && (
            <span>
              {`${results.length} ${results.length === 1 ? t("nav.singleResult", "result") : t("nav.multipleResults", "results")}`}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
