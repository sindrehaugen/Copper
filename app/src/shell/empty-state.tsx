
import { useTranslation } from 'react-i18next';

export function EmptyState() {
  const { t } = useTranslation();
  
  return (
    <div className="empty-state">
      <p>{t('common.empty')}</p>
    </div>
  );
}
