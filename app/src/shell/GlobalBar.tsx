import React from 'react';
import { useTranslation } from 'react-i18next';
import { useMasking } from './masking/index.js';

export interface GlobalBarProps {
  tenantId?: string;
  userId?: string;
  isSaving?: boolean;
  syncConflict?: boolean;
  onSave?: () => void;
  onReload?: () => void;
  onOpenCommand?: () => void;
}

export function GlobalBar({
  tenantId = 'default',
  isSaving = false,
  syncConflict = false,
  onSave,
  onReload,
  onOpenCommand,
}: GlobalBarProps) {
  const { t } = useTranslation();
  const [asOfMode, setAsOfMode] = React.useState(false);
  const { isMasked: customerView, toggleMasked: toggleCustomerView } = useMasking();

  const toggleAsOfMode = () => {
    setAsOfMode((prev) => !prev);
  };

  return (
    <header role="banner" className="copper-global-bar">
      <div className="copper-brand-section">
        <span aria-hidden="true">{'⚡'}</span>
        <span>{t('nav.brandName')}</span>
      </div>

      <button
        type="button"
        className="copper-command-btn"
        onClick={onOpenCommand}
        aria-label={t('nav.searchPlaceholder')}
        data-testid="global-search-btn"
      >
        <span aria-hidden="true">{'⌘K'}</span>
        <span>{t('nav.searchPlaceholder')}</span>
      </button>

      <div className="copper-global-controls">
        <button
          type="button"
          className={`copper-control-chip ${asOfMode ? 'active' : ''}`}
          onClick={toggleAsOfMode}
          aria-label={t('nav.asOf')}
          aria-pressed={asOfMode}
          data-testid="as-of-toggle"
        >
          <span>{`${t('nav.asOf')}: ${t('nav.asOfNow')} ▾`}</span>
        </button>

        <button
          type="button"
          className={`copper-control-chip ${customerView ? 'active' : ''}`}
          onClick={toggleCustomerView}
          aria-label={t('nav.customerView')}
          aria-pressed={customerView}
          data-testid="customer-view-toggle"
        >
          <span>{`${t('nav.customerView')} ${customerView ? '●' : '○'}`}</span>
        </button>

        <button
          type="button"
          className="copper-control-chip"
          aria-label={t('nav.namespace')}
          data-testid="namespace-switcher"
        >
          <span>{`ns:${tenantId} ▾`}</span>
        </button>

        {syncConflict && (
          <div style={{ color: 'var(--md-sys-color-error)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>{t('nav.versionConflict')}</span>
            <button type="button" onClick={onReload} className="copper-control-chip">
              {t('nav.reloadReapply')}
            </button>
          </div>
        )}

        {onSave && (
          <button
            type="button"
            disabled={isSaving || syncConflict}
            onClick={onSave}
            className="copper-control-chip active"
            data-testid="save-design-btn"
          >
            {isSaving ? t('nav.saving') : t('nav.saveDesign')}
          </button>
        )}
      </div>
    </header>
  );
}
