import React from 'react';
import { useTranslation } from 'react-i18next';
import { ConnectionStatus } from './types';

export interface ConnectionBannerProps {
  status: ConnectionStatus;
  retryCount?: number;
  onRetry?: () => void;
}

/**
 * Real-time Subscription Connection Status Banner
 * Contract: A dropped connection degrades to a visible banner, never silence.
 */
export function ConnectionBanner({
  status,
  retryCount = 0,
  onRetry,
}: ConnectionBannerProps) {
  const { t } = useTranslation();

  if (status === 'CONNECTED' || status === 'CONNECTING' || status === 'DISCONNECTED') {
    return null;
  }

  const isDegraded = status === 'DEGRADED';

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`copper-connection-banner ${isDegraded ? 'copper-connection-degraded' : 'copper-connection-reconnecting'}`}
      data-testid="subscription-status-banner"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 16px',
        backgroundColor: isDegraded ? 'var(--copper-error-container, #8C1D18)' : 'var(--copper-surface-variant, #2C2C2C)',
        color: isDegraded ? 'var(--copper-on-error-container, #F9DEDC)' : 'var(--copper-on-surface, #E6E1E5)',
        fontSize: '13px',
        borderBottom: '1px solid var(--copper-outline-variant, #49454F)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span aria-hidden="true">{isDegraded ? '⚠️' : '🔄'}</span>
        <span>
          {isDegraded
            ? t('subscription.degraded', 'Real-time subscription disconnected. Live updates paused.')
            : t('subscription.reconnecting', 'Reconnecting real-time stream (attempt {{count}})...', { count: retryCount })}
        </span>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="copper-control-chip"
          data-testid="subscription-retry-btn"
          style={{
            background: 'transparent',
            border: '1px solid currentColor',
            color: 'inherit',
            padding: '4px 10px',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          {t('subscription.retry', 'Retry Now')}
        </button>
      )}
    </div>
  );
}
