
import { useTranslation } from 'react-i18next';

export function LoadingState() {
  const { t } = useTranslation();
  
  return (
    <div className="loading-state" role="status">
      <p>{t('common.loading')}</p>
    </div>
  );
}
