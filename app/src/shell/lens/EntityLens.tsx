import { useParams, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getEntityMetadata } from "@copper/spine";
import { BaseLens } from "./BaseLens";
import type { EntityLensProps } from "./types";
import { FacetContainer } from "../facet";
import { useFindings, FindingsTray } from "../finding";
import { RoomSurface, type RoomSurfaceData } from "../../views/room/RoomSurface";
import { EstateMap, type EstateMapProps } from "../../views/map/EstateMap";
import { CanvasLens, type ExtendedCanvasLensProps } from "./canvas/CanvasLens";

export interface ExtendedEntityLensProps extends EntityLensProps {
  level?: string | undefined;
  isRoom?: boolean | undefined;
  isSite?: boolean | undefined;
  isCanvas?: boolean | undefined;
  viewMode?: string | undefined;
  mode?: string | undefined;
  roomData?: RoomSurfaceData | null | undefined;
  estateMapProps?: EstateMapProps | undefined;
  canvasProps?: ExtendedCanvasLensProps | undefined;
  onNavigate?: ((path: string, entity?: any) => void) | undefined;
}

function useSafeLocationSearch(): string {
  try {
    const loc = useLocation();
    return loc?.search || "";
  } catch {
    if (typeof window !== "undefined" && window.location?.search) {
      return window.location.search;
    }
    return "";
  }
}

export function EntityLens(props: ExtendedEntityLensProps) {
  const { t } = useTranslation();
  let routeParams: { type?: string; id?: string } = {};
  try {
    routeParams = useParams<{ type?: string; id?: string }>();
  } catch {
    routeParams = {};
  }

  const searchStr = useSafeLocationSearch();
  const searchParams = new URLSearchParams(searchStr);

  const entityType = props.entityType ?? routeParams.type ?? "UNKNOWN";
  const entityId = props.entityId ?? routeParams.id ?? "";
  const metadata = getEntityMetadata(entityType);

  const level = props.level ?? searchParams.get("level");
  const viewMode = props.viewMode ?? props.mode ?? searchParams.get("view") ?? searchParams.get("mode");

  const isCanvas =
    props.isCanvas === true ||
    viewMode?.toLowerCase() === "canvas" ||
    viewMode?.toLowerCase() === "schematic";

  const isRoom =
    entityType.toUpperCase() === "ROOM" ||
    (entityType.toUpperCase() === "FUNCTIONAL_LOCATION" &&
      (level?.toLowerCase() === "room" ||
        props.isRoom === true ||
        searchParams.get("level") === "room" ||
        entityId.toLowerCase().startsWith("room-") ||
        entityId.toLowerCase().includes("room")));

  const isSite =
    entityType.toUpperCase() === "SITE" ||
    props.isSite === true ||
    (entityType.toUpperCase() === "FUNCTIONAL_LOCATION" &&
      (level?.toLowerCase() === "site" ||
        searchParams.get("level") === "site" ||
        entityId.toLowerCase().startsWith("site-") ||
        entityId.toLowerCase().includes("site")));

  const { findings, blockers, risks, advice } = useFindings({
    entityType,
    entityId,
  });

  const displayTitle =
    props.title ?? (entityId ? `${metadata.label} ${entityId}` : metadata.label);

  if (isCanvas) {
    return (
      <CanvasLens
        title={displayTitle}
        data-entity-type={entityType}
        data-entity-id={entityId}
        {...props.canvasProps}
        {...props}
      />
    );
  }

  return (
    <BaseLens
      {...props}
      title={displayTitle}
      lensKind="entity"
      data-entity-type={entityType}
      data-entity-id={entityId}
      headerSlot={
        <>
          {props.headerSlot}
          <FindingsTray filter={{ entityType, entityId }} />
        </>
      }
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
      {isRoom ? (
        <RoomSurface
          roomId={entityId}
          data={props.roomData}
        />
      ) : isSite ? (
        <EstateMap
          siteId={entityId}
          onNavigate={props.onNavigate}
          {...props.estateMapProps}
        />
      ) : (
        <FacetContainer entityType={entityType} entityId={entityId} />
      )}
    </BaseLens>
  );
}
