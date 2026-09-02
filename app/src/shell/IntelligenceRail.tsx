import { useTranslation } from 'react-i18next';
import {
  IntelligenceSection,
  CONTRACT_R_BUDGET,
} from './layout';

export interface IntelligenceRailProps {
  sections?: IntelligenceSection[];
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onAskAboutThis?: () => void;
}

/**
 * Intelligence Rail — Permanent chrome (Batch 130 / SH.W2)
 * CONTRACT-R: Max 5 sections, max 3 items each.
 * When total items is 0, renders NOTHING (empty/hidden, no placeholder).
 */
export function IntelligenceRail({
  sections = [],
  isCollapsed = false,
  onToggleCollapse,
  onAskAboutThis,
}: IntelligenceRailProps) {
  const { t } = useTranslation();

  const effectiveSections = sections
    .filter(sec => sec.items && sec.items.length > 0)
    .slice(0, CONTRACT_R_BUDGET.maxSections)
    .map(sec => ({
      ...sec,
      items: sec.items.slice(0, CONTRACT_R_BUDGET.maxItemsPerSection),
    }));

  const totalItemsCount = effectiveSections.reduce(
    (acc, sec) => acc + sec.items.length,
    0
  );

  if (totalItemsCount === 0) {
    return null;
  }

  return (
    <aside
      aria-label={t('nav.intelligenceRail')}
      className={`copper-intelligence-rail ${isCollapsed ? 'collapsed' : ''}`}
      data-testid="intelligence-rail"
    >
      <div className="copper-intelligence-header">
        {!isCollapsed && <span>{t('nav.intelligenceRail')}</span>}
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={isCollapsed ? t('nav.expandRail') : t('nav.collapseRail')}
          className="copper-control-chip"
          data-testid="toggle-intelligence-rail-btn"
        >
          {isCollapsed ? '◀' : '▶'}
        </button>
      </div>

      {!isCollapsed && (
        <>
          {effectiveSections.map(sec => (
            <div
              key={sec.id}
              className="copper-intelligence-section"
              data-testid={`intelligence-section-${sec.id}`}
            >
              <div className="copper-intelligence-section-title">
                <span>{t(sec.titleKey)}</span>
                <span className="copper-control-chip">{sec.items.length}</span>
              </div>
              <div>
                {sec.items.map(item => (
                  <div
                    key={item.id}
                    className="copper-intelligence-item"
                    data-testid={`intelligence-item-${item.id}`}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600 }}>{item.title}</span>
                      {item.badge && (
                        <span
                          className={`copper-severity-badge copper-severity-${item.badgeVariant || 'advice'}`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                    {item.subtitle && (
                      <div style={{ color: 'var(--md-sys-color-on-surface-variant)', fontSize: '12px' }}>
                        {item.subtitle}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={onAskAboutThis}
            className="copper-intelligence-ask-btn"
            aria-label={t('nav.askAboutThis')}
            data-testid="ask-about-this-btn"
          >
            <span>{'⌥K'}</span>
            <span>{t('nav.askAboutThis')}</span>
          </button>
        </>
      )}
    </aside>
  );
}
