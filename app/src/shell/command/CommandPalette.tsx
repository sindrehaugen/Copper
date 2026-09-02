import React, { useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { CommandPaletteProps, SearchItem } from "./types";
import { useCommandPalette } from "./useCommandPalette";
import { EntityChip } from "@copper/spine";
import "./command.css";

export function CommandPalette({
  isOpen,
  onClose,
  onSelect,
  items,
  placeholder,
  namespace,
}: CommandPaletteProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    query,
    setQuery,
    results,
    selectedIndex,
    setSelectedIndex,
    handleKeyDown,
    handleSelectItem,
  } = useCommandPalette({
    isOpen,
    onClose,
    onSelect,
    items,
    namespace,
  });

  // Focus input on mount / when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

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
        aria-selected={isSelected ? "true" : "false"}
        className={`copper-command-item ${isSelected ? "selected" : ""}`}
        onClick={() => handleSelectItem(item)}
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
              title={`Match score: ${Math.round(item.score * 100)}%`}
            >
              {Math.round(item.score * 100)}%
            </span>
          )}
          {item.category === "action" && (
            <span className="copper-command-badge">Action</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className="copper-command-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      data-testid="command-palette-overlay"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("nav.commandPalette", "Command Palette")}
        className="copper-command-dialog"
      >
        <div className="copper-command-header">
          <span className="copper-command-search-icon" aria-hidden="true">
            🔍
          </span>
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            autoFocus
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
            ESC
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
              {t("nav.noCommandsFound", "No matching entities or actions found.")}
            </div>
          ) : isQueryEmpty ? (
            <>
              {results.some((r) => r.category === "recent") && (
                <div className="copper-command-group-header">Recent</div>
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
                        Suggested Commands
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
              <kbd className="copper-command-key">↑</kbd>
              <kbd className="copper-command-key">↓</kbd> to navigate
            </span>
            <span className="copper-command-key-hint">
              <kbd className="copper-command-key">↵</kbd> to select
            </span>
            <span className="copper-command-key-hint">
              <kbd className="copper-command-key">esc</kbd> to close
            </span>
          </div>
          {results.length > 0 && (
            <span>
              {results.length} result{results.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
