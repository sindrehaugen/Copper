import { useTranslation } from "react-i18next";
import type { LensHeaderProps } from "./types";

export function LensHeader({
  title,
  subtitle,
  badge,
  actions,
  breadcrumbs,
  lensKind,
  className = "",
  children,
  dataTestId,
}: LensHeaderProps) {
  const { t } = useTranslation();

  return (
    <header
      className={`copper-lens-header ${className}`.trim()}
      data-testid={dataTestId || (lensKind ? `lens-header-${lensKind}` : "lens-header")}
    >
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label={t("common.breadcrumbs", "Breadcrumbs")} className="copper-lens-breadcrumbs">
          <ol style={{ display: "flex", alignItems: "center", listStyle: "none", margin: 0, padding: 0, gap: 6 }}>
            {breadcrumbs.map((crumb, idx) => (
              <li key={idx} className="copper-lens-breadcrumb-item">
                {crumb.onClick ? (
                  <button
                    type="button"
                    onClick={crumb.onClick}
                    className="copper-lens-breadcrumb-link"
                    style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "inherit", font: "inherit" }}
                  >
                    {crumb.label}
                  </button>
                ) : crumb.href ? (
                  <a href={crumb.href} className="copper-lens-breadcrumb-link">
                    {crumb.label}
                  </a>
                ) : (
                  <span>{crumb.label}</span>
                )}
                {idx < breadcrumbs.length - 1 && (
                  <span className="copper-lens-breadcrumb-separator" aria-hidden="true">
                    /
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      <div className="copper-lens-header-main">
        <div className="copper-lens-header-identity">
          {lensKind && (
            <span
              className="copper-lens-kind-badge"
              data-lens-kind={lensKind}
              aria-label={t(`lens.kind.${lensKind}`, lensKind)}
            >
              {t(`lens.kind.${lensKind}`, lensKind)}
            </span>
          )}

          <div className="copper-lens-title-group">
            <div className="copper-lens-title-row">
              <h1 className="copper-lens-title">{title}</h1>
              {badge && <div className="copper-lens-badge">{badge}</div>}
            </div>
            {subtitle && <p className="copper-lens-subtitle">{subtitle}</p>}
          </div>
        </div>

        {actions && <div className="copper-lens-actions">{actions}</div>}
      </div>

      {children}
    </header>
  );
}
