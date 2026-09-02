import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getEntityMetadata } from "@copper/spine";
import { BaseLens } from "./BaseLens";
import type { EntityLensProps } from "./types";
import { FacetContainer } from "../facet";
import { useFindings } from "../finding";

export function EntityLens(props: EntityLensProps) {
  const { t } = useTranslation();
  const routeParams = useParams<{ type?: string; id?: string }>();
  const entityType = props.entityType ?? routeParams.type ?? "UNKNOWN";
  const entityId = props.entityId ?? routeParams.id ?? "";
  const metadata = getEntityMetadata(entityType);

  const { findings, blockers, risks, advice } = useFindings({
    entityType,
    entityId,
  });

  const displayTitle =
    props.title ?? (entityId ? `${metadata.label} ${entityId}` : metadata.label);

  return (
    <BaseLens
      {...props}
      title={displayTitle}
      lensKind="entity"
      data-entity-type={entityType}
      data-entity-id={entityId}
    >
      {findings.length > 0 && (
        <div
          className="copper-entity-findings-badge"
          data-testid="entity-findings-badge"
        >
          <span style={{ fontWeight: 600 }}>
            {t("nav.findings", "Findings")}:
          </span>
          {blockers.length > 0 && (
            <span className="copper-severity-badge copper-severity-blocker">
              {blockers.length} {t("common.blockers", "blocker(s)")}
            </span>
          )}
          {risks.length > 0 && (
            <span className="copper-severity-badge copper-severity-risk">
              {risks.length} {t("common.risks", "risk(s)")}
            </span>
          )}
          {advice.length > 0 && (
            <span className="copper-severity-badge copper-severity-advice">
              {advice.length} {t("common.advice", "advice")}
            </span>
          )}
          <span style={{ marginLeft: "8px", display: "inline-flex", gap: "4px" }}>
            {findings.map(f => (
              <span
                key={f.id}
                className="copper-finding-rule"
                style={{ fontSize: "11px", color: "var(--md-sys-color-on-surface-variant)" }}
              >
                {f.rule}
              </span>
            ))}
          </span>
        </div>
      )}
      {props.children}
      <FacetContainer entityType={entityType} entityId={entityId} />
    </BaseLens>
  );
}
