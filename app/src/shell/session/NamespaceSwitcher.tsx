import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSession } from './useSession';
import type { NamespaceSwitcherProps } from './types';

export function NamespaceSwitcher({
  currentNamespace: propNamespace,
  allowedNamespaces: propAllowed,
  onSwitchNamespace,
  className = '',
}: NamespaceSwitcherProps) {
  const { t } = useTranslation();
  const session = useSession();

  const currentNamespace = propNamespace ?? session.currentNamespace;
  const allowedNamespaces = propAllowed ?? session.allowedNamespaces;

  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
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

    window.document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next) {
        setFocusedIndex(
          Math.max(0, allowedNamespaces.indexOf(currentNamespace))
        );
      }
      return next;
    });
  };

  const handleSelect = (ns: string) => {
    if (onSwitchNamespace) {
      onSwitchNamespace(ns);
    } else {
      session.switchNamespace(ns);
    }
    setIsOpen(false);
    buttonRef.current?.focus();
  };

  const handleButtonKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
        setFocusedIndex(
          Math.max(0, allowedNamespaces.indexOf(currentNamespace))
        );
      }
    } else {
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsOpen(false);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIndex((prev) => (prev + 1) % allowedNamespaces.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex(
          (prev) => (prev - 1 + allowedNamespaces.length) % allowedNamespaces.length
        );
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < allowedNamespaces.length) {
          const selected = allowedNamespaces[focusedIndex];
          if (selected) handleSelect(selected);
        }
      } else if (e.key === 'Tab') {
        setIsOpen(false);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={`copper-namespace-switcher-container ${className}`}
      style={{ position: 'relative', display: 'inline-block' }}
    >
      <button
        ref={buttonRef}
        type="button"
        className={`copper-control-chip ${isOpen ? 'active' : ''}`}
        onClick={handleToggle}
        onKeyDown={handleButtonKeyDown}
        aria-label={`${t('nav.namespace', 'Namespace')}: ${currentNamespace}`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        data-testid="namespace-switcher"
      >
        <span>{`ns:${currentNamespace} ${isOpen ? '▋' : '₵'}`}</span>
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          role="menu"
          tabIndex={-1}
          aria-label={t('nav.namespace', 'Namespace')}
          data-testid="namespace-menu"
          onKeyDown={handleButtonKeyDown}
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            right: 0,
            minWidth: '180px',
            backgroundColor: 'var(--md-sys-color-surface-container-high)',
            color: 'var(--md-sys-color-on-surface)',
            borderRadius: 'var(--md-sys-shape-corner-small, 8px)',
            border: '1px solid var(--md-sys-color-outline-variant)',
            padding: '4px',
            zIndex: 1100,
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
          }}
        >
          <div
            style={{
              padding: '6px 8px 4px 8px',
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--md-sys-color-on-surface-variant)',
              fontWeight: 600,
            }}
          >
            {t('nav.namespace', 'Tenant Namespace')}
          </div>

          {allowedNamespaces.map((ns, idx) => {
            const isCurrent = ns === currentNamespace;
            const isFocused = idx === focusedIndex;

            return (
              <button
                key={ns}
                type="button"
                role="menuitem"
                tabIndex={-1}
                aria-current={isCurrent ? 'true' : undefined}
                data-testid={`namespace-option-${ns}`}
                onClick={() => handleSelect(ns)}
                onMouseEnter={() => setFocusedIndex(idx)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: 'var(--md-sys-shape-corner-extra-small, 6px)',
                  border: 'none',
                  textAlign: 'left',
                  fontFamily: 'inherit',
                  fontSize: '13px',
                  cursor: 'pointer',
                  backgroundColor: isFocused
                    ? 'var(--md-sys-color-surface-container-highest)'
                    : 'transparent',
                  color: isCurrent
                    ? 'var(--copper-accent, var(--md-sys-color-primary))'
                    : 'var(--md-sys-color-on-surface)',
                  fontWeight: isCurrent ? 600 : 400,
                }}
              >
                <span>{ns}</span>
                {isCurrent && (
                  <span
                    aria-hidden="true"
                    style={{
                      fontSize: '12px',
                      color: 'var(--copper-accent, var(--md-sys-color-primary))',
                    }}
                  >
                    {'\u2713'}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
