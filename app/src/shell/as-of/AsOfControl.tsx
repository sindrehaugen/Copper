import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAsOfStore } from './asOfStore';
import type { AsOfControlProps } from './types';

export function AsOfControl({ className = '', onAsOfChange }: AsOfControlProps) {
  const { t } = useTranslation();
  const asOf = useAsOfStore((state) => state.asOf);
  const setAsOf = useAsOfStore((state) => state.setAsOf);
  const clearAsOf = useAsOfStore((state) => state.clearAsOf);

  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(asOf || '');
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const isHistorical = asOf !== null && asOf.trim().length > 0;

  useEffect(() => {
    setInputValue(asOf || '');
  }, [asOf]);

  // Outside click & keyboard Escape listener
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handleApply = (valueToApply?: string) => {
    const val = (valueToApply !== undefined ? valueToApply : inputValue).trim();
    if (val.length > 0) {
      setAsOf(val);
      if (onAsOfChange) onAsOfChange(val);
    } else {
      clearAsOf();
      if (onAsOfChange) onAsOfChange(null);
    }
    setIsOpen(false);
    buttonRef.current?.focus();
  };

  const handleClear = () => {
    clearAsOf();
    setInputValue('');
    if (onAsOfChange) onAsOfChange(null);
    setIsOpen(false);
    buttonRef.current?.focus();
  };

  const setPreset = (hoursAgo: number) => {
    const date = new Date(Date.now() - hoursAgo * 3600 * 1000);
    const isoString = date.toISOString();
    setInputValue(isoString);
    handleApply(isoString);
  };

  const displayLabel = isHistorical
    ? `${t('nav.asOf', 'As of')}: ${asOf}`
    : `${t('nav.asOf', 'As of')}: ${t('nav.asOfNow', 'now')}`;

  return (
    <div
      ref={containerRef}
      className={`copper-as-of-control-container ${className}`}
      style={{ position: 'relative', display: 'inline-block' }}
    >
      <button
        ref={buttonRef}
        type="button"
        className={`copper-control-chip ${isHistorical ? 'as-of-active active' : ''}`}
        onClick={handleToggle}
        aria-label={displayLabel}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        data-testid="as-of-toggle"
      >
        <span>{`${displayLabel} ▾`}</span>
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label={t('nav.asOf', 'As of')}
          data-testid="as-of-popover"
          className="copper-as-of-popover"
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--md-sys-color-outline-variant)',
              paddingBottom: '6px',
            }}
          >
            <span className="copper-as-of-popover-title">
              {isHistorical
                ? t('nav.historicalView', 'Historical Snapshot (Read-Only)')
                : t('nav.asOf', 'Time Travel / Snapshot')}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label
              htmlFor="as-of-input-field"
              style={{
                fontSize: 'var(--md-sys-typescale-body-small-font-size)',
                color: 'var(--md-sys-color-on-surface-variant)',
              }}
            >
              {t('nav.asOf', 'ISO Datetime / Snapshot')}
            </label>
            <input
              id="as-of-input-field"
              type="text"
              className="copper-as-of-input"
              data-testid="as-of-input"
              value={inputValue}
              placeholder="e.g. 2026-08-15T10:00:00Z"
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleApply();
                }
              }}
            />
          </div>

          {/* Quick presets */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="copper-control-chip"
              onClick={() => setPreset(1)}
              style={{ fontSize: 'var(--md-sys-typescale-label-small-font-size)', padding: '2px 8px' }}
            >
              {'-1h'}
            </button>
            <button
              type="button"
              className="copper-control-chip"
              onClick={() => setPreset(24)}
              style={{ fontSize: 'var(--md-sys-typescale-label-small-font-size)', padding: '2px 8px' }}
            >
              {'-24h'}
            </button>
            <button
              type="button"
              className="copper-control-chip"
              onClick={() => setPreset(168)}
              style={{ fontSize: 'var(--md-sys-typescale-label-small-font-size)', padding: '2px 8px' }}
            >
              {'-7d'}
            </button>
          </div>

          <div className="copper-as-of-notice">
            {t(
              'nav.cleanState',
              'Historical view: Every read carries as-of snapshot; all mutations disabled.'
            )}
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '8px',
              marginTop: '4px',
            }}
          >
            {isHistorical && (
              <button
                type="button"
                className="copper-control-chip"
                onClick={handleClear}
                data-testid="as-of-live-btn"
                style={{
                  backgroundColor: 'transparent',
                  color: 'var(--copper-primary, var(--md-sys-color-primary))',
                  borderColor: 'var(--md-sys-color-outline-variant)',
                }}
              >
                {t('nav.asOfNow', 'Return to Live')}
              </button>
            )}

            <button
              type="button"
              className="copper-control-chip copper-as-of-apply-btn active"
              onClick={() => handleApply()}
              data-testid="as-of-apply-btn"
            >
              {t('nav.reloadReapply', 'Apply')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
