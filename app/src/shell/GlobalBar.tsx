import React from 'react';
import { useTranslation } from 'react-i18next';
import { AsOfControl, useAsOfStore } from './as-of';

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
  const [customerView, setCustomerView] = React.useState(false);

  const asOf = useAsOfStore((state) => state.asOf);
  const isAsOfActive = asOf !== null && asOf.trim().length > 0;

  const toggleCustomerView = () => {
    const next = !customerView;
    setCustomerView(next);
    if (typeof document !== 'undefined' && document.body) {
      if (next) {
        document.body.setAttribute('data-customer-view', 'true');
      } else {
        document.body.removeAttribute('data-customer-view');
      }
    }
  };

  return (
    <header
      role="banner"
      className={`copper-global-bar ${isAsOfActive ? 'as-of-mode' : ''}`}
    >
      <div className="copper-brand-section">
        <span aria-hidden="true">{'⚡'}</span>
        <span>{t('nav.brandName')}</span>
      </div>

      {isAsOfActive && (
        <div
          className="copper-as-of-historical-badge"
          data-testid="as-of-historical-badge"
        >
          <span aria-hidden="true">{'⏳'}</span>
          <span>{`${t('nav.asOf', 'Historical View')}: ${asOf}`}</span>
        </div>
      )}

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
        <AsOfControl />

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
            disabled={isSaving || syncConflict || isAsOfActive}
            onClick={onSave}
            className={`copper-control-chip ${isAsOfActive ? 'disabled' : 'active'}`}
            data-testid="save-design-btn"
          >
            {isSaving ? t('nav.saving') : t('nav.saveDesign')}
          </button>
        )}
      </div>
    </header>
  );
}
