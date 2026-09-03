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
import { PipelineBoard, type PipelineBoardProps } from "./board/PipelineBoard";
import { CustomerSurface, type CustomerSurfaceData, type CustomerSurfaceProps } from "../../views/customer/CustomerSurface";
import { QuoteViewer, type QuoteData, type QuoteViewerProps } from "../../views/quote/QuoteViewer";
import { SalesPerformanceLens, type SalesPerformanceData, type SalesPerformanceLensProps } from "./sales/SalesPerformanceLens";

export interface ExtendedEntityLensProps extends EntityLensProps {
  level?: string | undefined;
  isRoom?: boolean | undefined;
  isSite?: boolean | undefined;
  isCanvas?: boolean | undefined;
  isPipeline?: boolean | undefined;
  isBoard?: boolean | undefined;
  isCustomer?: boolean | undefined;
  isQuote?: boolean | undefined;
  isBaseline?: boolean | undefined;
  isSalesPerformance?: boolean | undefined;
  isPerformance?: boolean | undefined;
  salesPerformanceData?: SalesPerformanceData | null | undefined;
  salesPerformanceProps?: SalesPerformanceLensProps | undefined;
  viewMode?: string | undefined;
  mode?: string | undefined;
  roomData?: RoomSurfaceData | null | undefined;
  customerData?: CustomerSurfaceData | null | undefined;
  quoteData?: QuoteData | null | undefined;
  estateMapProps?: EstateMapProps | undefined;
  canvasProps?: ExtendedCanvasLensProps | undefined;
  pipelineProps?: PipelineBoardProps | undefined;
  customerProps?: CustomerSurfaceProps | undefined;
  quoteProps?: QuoteViewerProps | undefined;
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

  const isSalesPerformance =
    props.isSalesPerformance === true ||
    props.isPerformance === true ||
    entityType.toUpperCase() === "SALES_PERFORMANCE" ||
    entityType.toUpperCase() === "PERFORMANCE" ||
    (entityType.toUpperCase() === "SALES" &&
      (entityId.toLowerCase() === "performance" ||
        entityId.toLowerCase() === "cockpit" ||
        viewMode?.toLowerCase() === "performance" ||
        viewMode?.toLowerCase() === "cockpit" ||
        searchParams.get("view") === "performance" ||
        searchParams.get("mode") === "performance")) ||
    viewMode?.toLowerCase() === "performance" ||
    viewMode?.toLowerCase() === "cockpit" ||
    searchParams.get("view") === "performance" ||
    searchParams.get("mode") === "performance";

  const isPipeline =
    !isSalesPerformance &&
    (props.isPipeline === true ||
    props.isBoard === true ||
    viewMode?.toLowerCase() === "pipeline" ||
    viewMode?.toLowerCase() === "board" ||
    entityType.toUpperCase() === "PIPELINE" ||
    (entityType.toUpperCase() === "SALES" &&
      (entityId.toLowerCase() === "pipeline" ||
        entityId.toLowerCase() === "board" ||
        entityId.toLowerCase() === "overview" ||
        !entityId ||
        viewMode?.toLowerCase() === "board" ||
        viewMode?.toLowerCase() === "pipeline")) ||
    (entityType.toUpperCase() === "OPPORTUNITY" &&
      (entityId.toLowerCase() === "pipeline" ||
        entityId.toLowerCase() === "board" ||
        viewMode?.toLowerCase() === "board" ||
        viewMode?.toLowerCase() === "pipeline")));

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

  const isCustomer =
    props.isCustomer === true ||
    entityType.toUpperCase() === "CUSTOMER" ||
    (entityType.toUpperCase() === "SALES" &&
      (viewMode?.toLowerCase() === "customer" || searchParams.get("view") === "customer"));

  const isBaseline =
    props.isBaseline === true ||
    entityType.toUpperCase() === "BASELINE" ||
    entityType.toUpperCase() === "SIGNED_BASELINE" ||
    viewMode?.toLowerCase() === "baseline" ||
    searchParams.get("view") === "baseline" ||
    searchParams.get("mode") === "baseline";

  const isQuote =
    props.isQuote === true ||
    isBaseline ||
    entityType.toUpperCase() === "QUOTE" ||
    viewMode?.toLowerCase() === "quote" ||
    searchParams.get("view") === "quote";

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

  if (isSalesPerformance) {
    return (
      <SalesPerformanceLens
        title={displayTitle}
        data-entity-type={entityType}
        data-entity-id={entityId}
        onNavigate={props.onNavigate}
        data={props.salesPerformanceData}
        {...props.salesPerformanceProps}
        {...props}
      />
    );
  }

  if (isPipeline) {
    return (
      <PipelineBoard
        title={displayTitle}
        data-entity-type={entityType}
        data-entity-id={entityId}
        {...props.pipelineProps}
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
      ) : isCustomer ? (
        <CustomerSurface
          customerId={entityId}
          data={props.customerData}
          onNavigate={props.onNavigate}
          {...props.customerProps}
        />
      ) : isQuote ? (
        <QuoteViewer
          entityId={entityId}
          entityType={entityType}
          isBaseline={isBaseline}
          data={props.quoteData}
          onNavigate={props.onNavigate}
          {...props.quoteProps}
        />
      ) : (
        <FacetContainer entityType={entityType} entityId={entityId} />
      )}
    </BaseLens>
  );
}

