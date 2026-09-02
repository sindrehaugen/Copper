import type { ButtonHTMLAttributes, ReactElement, ReactNode } from 'react';
import type { GovernedActionState } from './types';

export interface GovernedActionButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  state?: GovernedActionState<any> | undefined;
  label: string;
  loadingLabel?: string | undefined;
  pendingLabel?: string | undefined;
  children?: ReactNode;
}

export function GovernedActionButton({
  state,
  label,
  loadingLabel = 'Submitting...',
  pendingLabel = 'Pending Approval...',
  children,
  disabled,
  style,
  ...rest
}: GovernedActionButtonProps): ReactElement {
  const isPending = state?.isPendingApproval ?? false;
  const isSubmitting = state?.isSubmitting ?? false;
  const isDisabled = disabled || isSubmitting || isPending;

  let displayContent: ReactNode = children || label;
  if (isSubmitting) {
    displayContent = loadingLabel;
  } else if (isPending) {
    displayContent = pendingLabel;
  }

  return (
    <button
      type="button"
      disabled={isDisabled}
      aria-busy={isSubmitting}
      data-action-status={state?.status || 'idle'}
      style={{
        padding: '8px 16px',
        borderRadius: '6px',
        fontWeight: 500,
        fontSize: '13px',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.7 : 1,
        border: '1px solid var(--copper-accent-primary)',
        background: isPending
          ? 'var(--copper-tertiary-container, var(--md-sys-color-tertiary-container))'
          : 'var(--copper-accent-primary)',
        color: isPending
          ? 'var(--copper-accent-primary)'
          : 'var(--copper-on-accent-primary, var(--md-sys-color-on-primary))',
        transition: 'all 120ms ease-in-out',
        ...style,
      }}
      {...rest}
    >
      {displayContent}
    </button>
  );
}
