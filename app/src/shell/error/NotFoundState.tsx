import { useTranslation } from "react-i18next";
import type { NotFoundStateProps } from "./types";

export function NotFoundState({
  pathname,
  onNavigateHome,
  dataTestId = "not-found-state",
  className = "",
}: NotFoundStateProps) {
  const { t } = useTranslation();

  return (
    <div
      className={`copper-not-found-state ${className}`.trim()}
      role="region"
      aria-label={t("nav.notFound", "404 Not Found")}
      data-testid={dataTestId}
      style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1rem" }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <h2 style={{ margin: 0 }}>{t("nav.notFound", "404 Not Found")}</h2>
      </div>
      {pathname && (
        <p style={{ margin: 0, opacity: 0.8 }}>
          {pathname}
        </p>
      )}
      {onNavigateHome && (
        <button
          type="button"
          onClick={onNavigateHome}
          style={{ width: "fit-content", padding: "6px 12px", cursor: "pointer" }}
        >
          {t("nav.home", "Home")}
        </button>
      )}
    </div>
  );
}
