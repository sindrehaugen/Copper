import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { CONTEXT_GROUPS, ContextGroupId } from './layout';

export interface ContextRailProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function ContextRail({
  isCollapsed = false,
  onToggleCollapse,
}: ContextRailProps) {
  const { t } = useTranslation();
  const location = useLocation();

  const isGroupActive = (groupId: ContextGroupId, defaultRoute: string) => {
    if (groupId === 'design') {
      return (
        location.pathname === '/' ||
        location.pathname.startsWith('/design') ||
        location.pathname === '/rack' ||
        location.pathname === '/schedule' ||
        location.pathname === '/3d' ||
        location.pathname === '/bom' ||
        location.pathname === '/compliance' ||
        location.pathname === '/ledwall'
      );
    }
    return location.pathname.startsWith(defaultRoute);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLUListElement>) => {
    const target = e.target as HTMLElement;
    if (!target) return;
    const links = Array.from(
      e.currentTarget.querySelectorAll<HTMLAnchorElement>('.copper-nav-group-item')
    );
    const currentIndex = links.indexOf(target as HTMLAnchorElement);
    if (currentIndex === -1) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % links.length;
      links[nextIndex]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = (currentIndex - 1 + links.length) % links.length;
      links[prevIndex]?.focus();
    }
  };

  return (
    <nav
      aria-label={t('nav.contextNavigation')}
      className={`copper-context-rail ${isCollapsed ? 'collapsed' : ''}`}
      data-testid="context-rail"
    >
      <div className="copper-context-rail-header">
        {!isCollapsed && <span>{t('nav.brandName')}</span>}
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={isCollapsed ? t('nav.expandRail') : t('nav.collapseRail')}
          className="copper-control-chip"
          data-testid="toggle-context-rail-btn"
        >
          {isCollapsed ? '▶' : '◀'}
        </button>
      </div>

      <ul
        className="copper-nav-group-list"
        role="menubar"
        aria-orientation="vertical"
        onKeyDown={handleKeyDown}
      >
        {CONTEXT_GROUPS.map(group => {
          const active = isGroupActive(group.id, group.defaultRoute);
          return (
            <li key={group.id} role="none">
              <Link
                to={group.defaultRoute}
                role="menuitem"
                tabIndex={0}
                className={`copper-nav-group-item ${active ? 'active' : ''}`}
                aria-current={active ? 'page' : undefined}
                data-testid={`context-group-${group.id}`}
                title={t(group.labelKey)}
              >
                <span className="copper-nav-group-icon" aria-hidden="true">
                  {group.icon}
                </span>
                {!isCollapsed && <span>{t(group.labelKey)}</span>}
              </Link>

              {!isCollapsed && active && group.id === 'design' && (
                <ul className="copper-nav-sub-list" role="menu">
                  <li role="none">
                    <Link
                      to="/"
                      role="menuitem"
                      tabIndex={0}
                      className={`copper-nav-sub-item ${location.pathname === '/' ? 'active' : ''}`}
                    >
                      {t('nav.canvas')}
                    </Link>
                  </li>
                  <li role="none">
                    <Link
                      to="/rack"
                      role="menuitem"
                      tabIndex={0}
                      className={`copper-nav-sub-item ${location.pathname === '/rack' ? 'active' : ''}`}
                    >
                      {t('nav.rack')}
                    </Link>
                  </li>
                  <li role="none">
                    <Link
                      to="/schedule"
                      role="menuitem"
                      tabIndex={0}
                      className={`copper-nav-sub-item ${location.pathname === '/schedule' ? 'active' : ''}`}
                    >
                      {t('nav.schedule')}
                    </Link>
                  </li>
                  <li role="none">
                    <Link
                      to="/3d"
                      role="menuitem"
                      tabIndex={0}
                      className={`copper-nav-sub-item ${location.pathname === '/3d' ? 'active' : ''}`}
                    >
                      {t('nav.walkthrough')}
                    </Link>
                  </li>
                  <li role="none">
                    <Link
                      to="/bom"
                      role="menuitem"
                      tabIndex={0}
                      className={`copper-nav-sub-item ${location.pathname === '/bom' ? 'active' : ''}`}
                    >
                      {t('nav.bom')}
                    </Link>
                  </li>
                  <li role="none">
                    <Link
                      to="/compliance"
                      role="menuitem"
                      tabIndex={0}
                      className={`copper-nav-sub-item ${location.pathname === '/compliance' ? 'active' : ''}`}
                    >
                      {t('nav.compliance')}
                    </Link>
                  </li>
                  <li role="none">
                    <Link
                      to="/ledwall"
                      role="menuitem"
                      tabIndex={0}
                      className={`copper-nav-sub-item ${location.pathname === '/ledwall' ? 'active' : ''}`}
                    >
                      {t('nav.ledwall')}
                    </Link>
                  </li>
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
