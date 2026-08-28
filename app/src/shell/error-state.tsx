
import { useTranslation } from 'react-i18next';

export interface ErrorStateProps {
  error?: Error | string | { code?: number | string; message?: string };
  onRetry?: () => void;
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  const { t } = useTranslation();

  let errorMessage = t('common.error');
  if (error) {
    if (typeof error === 'string') {
      errorMessage = error;
    } else if ('code' in error && error.code === -32005) {
      errorMessage = t('errors.-32005');
    } else if (error instanceof Error) {
      errorMessage = error.message;
    } else if ('message' in error && error.message) {
      errorMessage = error.message;
    }
  }

  return (
    <div className="error-state" role="alert">
      <p>{errorMessage}</p>
      {onRetry && (
        <button onClick={onRetry}>{t('common.retry')}</button>
      )}
    </div>
  );
}
