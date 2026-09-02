import type { ReactElement, CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import type { GovernedActionState } from './types';

export interface GovernedActionStatusProps {
  state: GovernedActionState<any>;
  actionName?: string | undefined;
  onRetry?: (() => void) | undefined;
  className?: string | undefined;
  showDetails?: boolean | undefined;
}

export function GovernedActionStatus({
  state,
  actionName,
  onRetry,
  className = '',
  showDetails = true,
}: GovernedActionStatusProps): ReactElement | null {
  const { t } = useTranslation();

  if (state.isIdle) {
    return null;
  }

  const baseStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    lineHeight: '1.4',
    fontFamily: 'inherit',
    border: '1px solid transparent',
    margin: '8px 0',
  };

  if (state.isSubmitting) {
    return (
      <div
        role="status"
        aria-live="polite"
        data-testid="governed-action-submitting"
        data-status="submitting"
        className={className}
        style={{
          ...baseStyle,
          background: 'var(--copper-surface-container-high, var(--md-sys-color-surface-container-high))',
          color: 'var(--copper-on-surface, var(--md-sys-color-on-surface))',
          borderColor: 'var(--copper-outline-variant, var(--md-sys-color-outline-variant))',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              display: 'inline-block',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              border: '2px solid var(--copper-primary)',
              borderTopColor: 'transparent',
              animation: 'spin 1s linear infinite',
            }}
          />
          <span>
            {actionName
              ? t('action.submittingNamed', 'Submitting "{{name}}"...', { name: actionName })
              : t('action.submitting', 'Submitting action...')}
          </span>
        </div>
      </div>
    );
  }

  if (state.isPendingApproval) {
    return (
      <div
        role="status"
        aria-live="polite"
        data-testid="governed-action-pending-approval"
        data-status="pending-approval"
        className={className}
        style={{
          ...baseStyle,
          background: 'var(--copper-tertiary-container, var(--md-sys-color-tertiary-container))',
          color: 'var(--copper-primary)',
          borderColor: 'var(--copper-primary)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'var(--copper-primary)',
              }}
            />
            <span style={{ fontWeight: 600 }}>
              {t('action.governancePending', 'Governance Approval Pending')}
            </span>
          </div>
          {showDetails && (
            <div style={{ fontSize: '11px', opacity: 0.9 }}>
              <span>{t('action.awaitingResolution', 'Awaiting policy / manager resolution. ')}</span>
              {state.approvalId && (
                <span style={{ fontFamily: 'monospace' }}>
                  [{t('action.approvalIdLabel', 'ID:')} {state.approvalId}]
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (state.isResolved) {
    return (
      <div
        role="status"
        aria-live="polite"
        data-testid="governed-action-resolved"
        data-status="resolved"
        className={className}
        style={{
          ...baseStyle,
          background: 'var(--copper-surface-container-high, var(--md-sys-color-surface-container-high))',
          color: 'var(--copper-secondary)',
          borderColor: 'var(--copper-secondary)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: 600 }}>
            {t('action.approvedExecuted', 'Action Approved & Executed')}
          </span>
        </div>
      </div>
    );
  }

  if (state.isRejected) {
    const errorMsg =
      typeof state.error === 'string'
        ? state.error
        : state.error?.message || t('action.rejectedDefault', 'Action rejected by governance');

    return (
      <div
        role="alert"
        aria-live="assertive"
        data-testid="governed-action-rejected"
        data-status="rejected"
        className={className}
        style={{
          ...baseStyle,
          background: 'var(--copper-error-container, var(--md-sys-color-error-container))',
          color: 'var(--copper-semantic-risk)',
          borderColor: 'var(--copper-semantic-risk)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ fontWeight: 600 }}>{t('action.rejected', 'Action Rejected')}</div>
          {showDetails && <div style={{ fontSize: '11px' }}>{errorMsg}</div>}
        </div>
      </div>
    );
  }

  if (state.isFailed) {
    const errorMsg =
      typeof state.error === 'string'
        ? state.error
        : state.error?.message || t('action.executionFailed', 'Action execution failed');

    return (
      <div
        role="alert"
        aria-live="assertive"
        data-testid="governed-action-failed"
        data-status="failed"
        className={className}
        style={{
          ...baseStyle,
          background: 'var(--copper-error-container, var(--md-sys-color-error-container))',
          color: 'var(--copper-semantic-blocker)',
          borderColor: 'var(--copper-semantic-blocker)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ fontWeight: 600 }}>{t('action.error', 'Action Error')}</div>
          {showDetails && <div style={{ fontSize: '11px' }}>{errorMsg}</div>}
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            style={{
              background: 'transparent',
              border: '1px solid currentColor',
              borderRadius: '4px',
              color: 'inherit',
              padding: '4px 8px',
              fontSize: '11px',
              cursor: 'pointer',
            }}
          >
            {t('common.retry', 'Retry')}
          </button>
        )}
      </div>
    );
  }

  return null;
}
