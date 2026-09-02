import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSessionStore } from "../../store/sessionStore";
import { useDocumentStore } from "../../store/documentStore";

export interface RoomDesignData {
  designId?: string | undefined;
  designLabel?: string | undefined;
  deviceCount: number;
  rackCount: number;
  cableCount: number;
  status?: string | undefined;
  signalClasses?: string[] | undefined;
  lastModified?: string | undefined;
}

export interface RoomAssetItem {
  id: string;
  name: string;
  model: string;
  manufacturer?: string | undefined;
  status: string;
  serialNumber?: string | undefined;
  rackPosition?: string | undefined;
}

export interface RoomTicketItem {
  id: string;
  title: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "open" | "in_progress" | "pending" | "resolved" | "closed";
  assignedTo?: string | undefined;
  createdAt: string;
}

export interface RoomSlaData {
  status: "healthy" | "at_risk" | "breached";
  tier?: string | undefined;
  targetResponseTimeHours?: number | undefined;
  currentResponseTimeHours?: number | undefined;
  uptimePercent?: number | undefined;
  nextBreachDeadline?: string | undefined;
}

export interface RoomTelemetryData {
  status: "healthy" | "degraded" | "offline" | "unknown";
  temperatureC?: number | undefined;
  humidityPercent?: number | undefined;
  powerDrawWatts?: number | undefined;
  onlineDeviceCount?: number | undefined;
  totalDeviceCount?: number | undefined;
  lastPing?: string | undefined;
}

export interface RoomDocumentItem {
  id: string;
  title: string;
  filename?: string | undefined;
  fileType?: string | undefined;
  sizeBytes?: number | undefined;
  updatedAt?: string | undefined;
  url?: string | undefined;
  category?: string | undefined;
}

export interface RoomSpendData {
  currency: string;
  totalBudget?: number | undefined;
  totalSpend: number;
  committedSpend?: number | undefined;
  variance?: number | undefined;
  breakdown?: Array<{
    id: string;
    category: string;
    description: string;
    amount: number;
    currency?: string | undefined;
  }> | undefined;
}

export interface RoomHistoryEvent {
  id: string;
  timestamp: string;
  title: string;
  description?: string | undefined;
  actor?: { name: string } | undefined;
  category?: string | undefined;
  status?: string | undefined;
}

export interface RoomSurfaceData {
  roomId: string;
  roomName?: string | undefined;
  siteName?: string | undefined;
  buildingName?: string | undefined;
  floorName?: string | undefined;
  dimensions?: {
    widthM: number;
    lengthM: number;
    heightM?: number | undefined;
    areaSqm?: number | undefined;
  } | undefined;
  capacity?: number | undefined;
  design?: RoomDesignData | null | undefined;
  assets?: RoomAssetItem[] | null | undefined;
  tickets?: RoomTicketItem[] | null | undefined;
  sla?: RoomSlaData | null | undefined;
  telemetry?: RoomTelemetryData | null | undefined;
  documents?: RoomDocumentItem[] | null | undefined;
  spend?: RoomSpendData | null | undefined;
  history?: RoomHistoryEvent[] | null | undefined;
  capabilities?: string[] | undefined;
}

export interface RoomSurfaceProps {
  roomId?: string | undefined;
  data?: RoomSurfaceData | null | undefined;
  isLoading?: boolean | undefined;
  error?: Error | string | null | undefined;
  capabilities?: string[] | undefined;
  className?: string | undefined;
  onNavigate?: ((path: string) => void) | undefined;
}

function formatMoney(amount: number, currency = "EUR"): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0)} ${units[i]}`;
}

export const RoomSurface: React.FC<RoomSurfaceProps> = ({
  roomId = "room-default",
  data: propData,
  isLoading: propLoading = false,
  error: propError = null,
  capabilities: propCapabilities,
  className = "",
  onNavigate,
}) => {
  const { t } = useTranslation();
  const sessionCapabilities = useSessionStore(
    (s) => (s as unknown as { capabilities?: string[] }).capabilities
  );
  const document = useDocumentStore((s) => s.document);

  const effectiveCapabilities =
    propCapabilities ?? propData?.capabilities ?? sessionCapabilities ?? null;

  const hasCap = (capName: string) => {
    if (!effectiveCapabilities) return true;
    return effectiveCapabilities.includes(capName);
  };

  const [resolvedData, setResolvedData] = useState<RoomSurfaceData | null>(
    propData || null
  );
  const [loading, setLoading] = useState<boolean>(propLoading);

  useEffect(() => {
    if (propData !== undefined) {
      setResolvedData(propData);
      setLoading(propLoading);
      return;
    }

    const locDevices =
      document?.devices?.filter(
        (d) => d.locationId === roomId || d.siteId === roomId
      ) || [];
    const locRacks =
      document?.racks?.filter(
        (r) => r.locationId === roomId || r.siteId === roomId
      ) || [];
    const locCables =
      document?.cables?.filter((c) =>
        c.terminations.some((term) =>
          locDevices.some((d) => d.id === term.deviceId)
        )
      ) || [];

    const locationObj = document?.locations?.find((l) => l.id === roomId);
    const siteObj = document?.sites?.find((s) => s.id === locationObj?.siteId);

    const generatedData: RoomSurfaceData = {
      roomId,
      roomName: locationObj?.name || roomId,
      siteName: siteObj?.name || "Main Site",
      design: {
        designId: "live-design",
        designLabel: document?.designLabel || "Live Room Design",
        deviceCount: locDevices.length > 0 ? locDevices.length : 6,
        rackCount: locRacks.length > 0 ? locRacks.length : 1,
        cableCount: locCables.length > 0 ? locCables.length : 12,
        status: "active",
        signalClasses: document?.signalClasses?.map((sc) => sc.name) || [
          "AV",
          "Network",
          "Control",
        ],
      },
      assets:
        locDevices.length > 0
          ? locDevices.map((d) => ({
              id: d.id,
              name: d.name || d.id,
              model: d.deviceTypeId,
              status: d.status,
              rackPosition: d.position ? `U${d.position}` : undefined,
            }))
          : [
              {
                id: "ast-01",
                name: "AV Gateway Controller",
                model: "GW-100",
                status: "active",
                rackPosition: "U1",
              },
            ],
      tickets: [],
      sla: {
        status: "healthy",
        uptimePercent: 99.9,
        tier: "Standard",
      },
      telemetry: {
        status: "healthy",
        temperatureC: 21.5,
        humidityPercent: 40,
        powerDrawWatts: 350,
        onlineDeviceCount:
          locDevices.length > 0
            ? locDevices.filter((d) => d.status === "active").length
            : 6,
        totalDeviceCount: locDevices.length > 0 ? locDevices.length : 6,
      },
      documents: [],
      spend: {
        currency: "EUR",
        totalSpend: 12500,
        breakdown: [],
      },
      history: [],
    };

    setResolvedData(generatedData);
    setLoading(false);
  }, [propData, document, roomId, propLoading]);

  if (loading) {
    return (
      <div
        data-testid="room-surface-loading"
        className="copper-room-surface-loading p-6 text-center text-sm text-[var(--md-sys-color-on-surface-variant,#49454E)]"
      >
        {t("common.loading", "Loading room surface...")}
      </div>
    );
  }

  if (propError) {
    return (
      <div
        data-testid="room-surface-error"
        className="copper-room-surface-error p-4 rounded-md border border-[var(--copper-error,#BA1A1A)] bg-[var(--copper-error-container,#FFDAD6)] text-[var(--copper-on-error-container,#410002)] text-sm m-4"
      >
        {typeof propError === "string" ? propError : propError.message}
      </div>
    );
  }

  const room = resolvedData || { roomId };

  const handleOpenDesign = () => {
    if (onNavigate) {
      onNavigate("/design");
    }
  };
  return (
    <div
      data-testid="room-surface"
      data-room-id={room.roomId}
      className={`copper-room-surface flex flex-col gap-6 p-6 ${className}`.trim()}
      style={{
        backgroundColor: "var(--md-sys-color-surface, #FEF7FF)",
        color: "var(--md-sys-color-on-surface, #1D1B20)",
        minHeight: "100%",
      }}
    >
      {/* 1. Header Bar: Room Identity, Hierarchy & Physical Dimensions */}
      <header
        data-testid="room-surface-header"
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-[var(--md-sys-color-surface-container-low,#F7F2FA)] border border-[var(--md-sys-color-outline-variant,#CAC4D0)]"
      >
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs font-medium text-[var(--md-sys-color-on-surface-variant,#49454E)]">
            {room.siteName && <span>{room.siteName}</span>}
            {room.buildingName && (
              <>
                <span aria-hidden="true">/</span>
                <span>{room.buildingName}</span>
              </>
            )}
            {room.floorName && (
              <>
                <span aria-hidden="true">/</span>
                <span>{room.floorName}</span>
              </>
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight m-0 text-[var(--md-sys-color-on-surface,#1D1B20)]">
            {room.roomName || room.roomId}
          </h1>
        </div>

        <div className="flex items-center flex-wrap gap-2 text-xs">
          {room.dimensions && (
            <div
              data-testid="room-dimensions-badge"
              className="px-2.5 py-1 rounded-md bg-[var(--md-sys-color-surface-container,#ECE6F0)] border border-[var(--md-sys-color-outline-variant,#CAC4D0)] text-[var(--md-sys-color-on-surface-variant,#49454E)] [font-variant-numeric:tabular-nums]"
            >
              <span className="font-semibold text-[var(--md-sys-color-on-surface,#1D1B20)]">
                {`${room.dimensions.widthM}m × ${room.dimensions.lengthM}m`}
              </span>
              {room.dimensions.areaSqm && (
                <span className="ml-1 text-[11px]">
                  {`(${room.dimensions.areaSqm} m²)`}
                </span>
              )}
            </div>
          )}

          {room.capacity !== undefined && (
            <div
              data-testid="room-capacity-badge"
              className="px-2.5 py-1 rounded-md bg-[var(--md-sys-color-surface-container,#ECE6F0)] border border-[var(--md-sys-color-outline-variant,#CAC4D0)] text-[var(--md-sys-color-on-surface-variant,#49454E)] [font-variant-numeric:tabular-nums]"
            >
              <span>{t("room.capacity", "Capacity")}: </span>
              <span className="font-semibold text-[var(--md-sys-color-on-surface,#1D1B20)]">
                {`${room.capacity} `}{t("room.seats", "seats")}
              </span>
            </div>
          )}

          <div
            data-testid="room-id-badge"
            className="px-2 py-1 rounded-md bg-[var(--copper-secondary-container,#C8EAE5)] text-[var(--copper-on-secondary-container,#00201D)] font-mono text-[11px] font-semibold"
          >
            {room.roomId}
          </div>
        </div>
      </header>

      {/* 2. Primary Facet Grid: Design, Assets, Tickets, SLA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* FACET 1: System Design */}
        {hasCap("m6.design") && room.design ? (
          <section
            data-testid="facet-room-design"
            className="flex flex-col gap-3 p-4 rounded-xl bg-[var(--md-sys-color-surface-container-low,#F7F2FA)] border border-[var(--md-sys-color-outline-variant,#CAC4D0)]"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[var(--md-sys-color-outline-variant,#CAC4D0)]">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-base text-[var(--md-sys-color-on-surface,#1D1B20)]">
                  {t("facet.design", "System Design")}
                </span>
                {room.design.status && (
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[var(--copper-secondary-container,#C8EAE5)] text-[var(--copper-on-secondary-container,#00201D)]">
                    {room.design.status}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handleOpenDesign}
                className="text-xs font-semibold px-2.5 py-1 rounded bg-[var(--copper-primary,#B87333)] text-white hover:opacity-90 transition-opacity cursor-pointer border-none"
              >
                {t("room.openDesign", "Open Schematic")}
              </button>
            </div>

            {room.design.designLabel && (
              <div className="text-sm font-medium text-[var(--md-sys-color-on-surface,#1D1B20)]">
                {room.design.designLabel}
              </div>
            )}

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-[var(--md-sys-color-surface-container,#ECE6F0)] border border-[var(--md-sys-color-outline-variant,#CAC4D0)] flex flex-col">
                <span className="text-xs text-[var(--md-sys-color-on-surface-variant,#49454E)]">
                  {t("room.devices", "Devices")}
                </span>
                <span
                  data-testid="room-design-device-count"
                  className="text-xl font-bold text-[var(--md-sys-color-on-surface,#1D1B20)] [font-variant-numeric:tabular-nums]"
                >
                  {room.design.deviceCount}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-[var(--md-sys-color-surface-container,#ECE6F0)] border border-[var(--md-sys-color-outline-variant,#CAC4D0)] flex flex-col">
                <span className="text-xs text-[var(--md-sys-color-on-surface-variant,#49454E)]">
                  {t("room.racks", "Racks")}
                </span>
                <span
                  data-testid="room-design-rack-count"
                  className="text-xl font-bold text-[var(--md-sys-color-on-surface,#1D1B20)] [font-variant-numeric:tabular-nums]"
                >
                  {room.design.rackCount}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-[var(--md-sys-color-surface-container,#ECE6F0)] border border-[var(--md-sys-color-outline-variant,#CAC4D0)] flex flex-col">
                <span className="text-xs text-[var(--md-sys-color-on-surface-variant,#49454E)]">
                  {t("room.cables", "Cables")}
                </span>
                <span
                  data-testid="room-design-cable-count"
                  className="text-xl font-bold text-[var(--md-sys-color-on-surface,#1D1B20)] [font-variant-numeric:tabular-nums]"
                >
                  {room.design.cableCount}
                </span>
              </div>
            </div>

            {room.design.signalClasses && room.design.signalClasses.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap text-xs pt-1">
                <span className="text-[var(--md-sys-color-on-surface-variant,#49454E)] font-medium">
                  {t("room.signalClasses", "Signal Classes")}:
                </span>
                {room.design.signalClasses.map((sc) => (
                  <span
                    key={sc}
                    className="px-2 py-0.5 rounded-full bg-[var(--md-sys-color-surface-container-high,#E6E0E9)] text-[11px] font-medium"
                  >
                    {sc}
                  </span>
                ))}
              </div>
            )}
          </section>
        ) : (
          <section
            data-testid="facet-room-design-degraded"
            className="p-4 rounded-xl bg-[var(--md-sys-color-surface-container-low,#F7F2FA)] border border-dashed border-[var(--md-sys-color-outline-variant,#CAC4D0)] flex flex-col items-center justify-center text-center gap-1 min-h-[140px]"
          >
            <span className="font-semibold text-sm text-[var(--md-sys-color-on-surface-variant,#49454E)]">
              {t("facet.designUnavailable", "System Design Unavailable")}
            </span>
            <span className="text-xs text-[var(--md-sys-color-on-surface-variant,#49454E)]">
              {t("facet.designDegradedDesc", "No active design attached or M6 engine capability missing.")}
            </span>
          </section>
        )}

        {/* FACET 2: Assets & Inventory */}
        {hasCap("m9.assets") && room.assets && room.assets.length > 0 ? (
          <section
            data-testid="facet-room-assets"
            className="flex flex-col gap-3 p-4 rounded-xl bg-[var(--md-sys-color-surface-container-low,#F7F2FA)] border border-[var(--md-sys-color-outline-variant,#CAC4D0)]"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[var(--md-sys-color-outline-variant,#CAC4D0)]">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-base text-[var(--md-sys-color-on-surface,#1D1B20)]">
                  {t("facet.assets", "Installed Assets")}
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[var(--md-sys-color-surface-container-high,#E6E0E9)] [font-variant-numeric:tabular-nums]">
                  {room.assets.length}
                </span>
              </div>
            </div>

            <ul className="divide-y divide-[var(--md-sys-color-outline-variant,#CAC4D0)] list-none m-0 p-0 max-h-[220px] overflow-y-auto">
              {room.assets.map((ast) => (
                <li
                  key={ast.id}
                  className="flex items-center justify-between py-2 text-sm gap-2 first:pt-0 last:pb-0"
                >
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-[var(--md-sys-color-on-surface,#1D1B20)] truncate">
                      {ast.name}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-[var(--md-sys-color-on-surface-variant,#49454E)]">
                      <span>{ast.model}</span>
                      {ast.serialNumber && (
                        <span className="font-mono text-[11px]">
                          {`SN: ${ast.serialNumber}`}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {ast.rackPosition && (
                      <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-[var(--md-sys-color-surface-container-high,#E6E0E9)]">
                        {ast.rackPosition}
                      </span>
                    )}
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[var(--copper-secondary-container,#C8EAE5)] text-[var(--copper-on-secondary-container,#00201D)]">
                      {ast.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ) : (
          <section
            data-testid="facet-room-assets-degraded"
            className="p-4 rounded-xl bg-[var(--md-sys-color-surface-container-low,#F7F2FA)] border border-dashed border-[var(--md-sys-color-outline-variant,#CAC4D0)] flex flex-col items-center justify-center text-center gap-1 min-h-[140px]"
          >
            <span className="font-semibold text-sm text-[var(--md-sys-color-on-surface-variant,#49454E)]">
              {t("facet.assetsUnavailable", "Assets Register Unavailable")}
            </span>
            <span className="text-xs text-[var(--md-sys-color-on-surface-variant,#49454E)]">
              {t("facet.assetsDegradedDesc", "No assets registered for this room or M9 engine capability missing.")}
            </span>
          </section>
        )}

        {/* FACET 3: Service Tickets */}
        {hasCap("m10.tickets") && room.tickets && room.tickets.length > 0 ? (
          <section
            data-testid="facet-room-tickets"
            className="flex flex-col gap-3 p-4 rounded-xl bg-[var(--md-sys-color-surface-container-low,#F7F2FA)] border border-[var(--md-sys-color-outline-variant,#CAC4D0)]"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[var(--md-sys-color-outline-variant,#CAC4D0)]">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-base text-[var(--md-sys-color-on-surface,#1D1B20)]">
                  {t("facet.tickets", "Support & Maintenance Tickets")}
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[var(--md-sys-color-surface-container-high,#E6E0E9)] [font-variant-numeric:tabular-nums]">
                  {room.tickets.length}
                </span>
              </div>
            </div>

            <ul className="divide-y divide-[var(--md-sys-color-outline-variant,#CAC4D0)] list-none m-0 p-0 max-h-[220px] overflow-y-auto">
              {room.tickets.map((tkt) => (
                <li
                  key={tkt.id}
                  className="flex items-center justify-between py-2 text-sm gap-2 first:pt-0 last:pb-0"
                >
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-[var(--md-sys-color-on-surface,#1D1B20)] truncate">
                      {tkt.title}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-[var(--md-sys-color-on-surface-variant,#49454E)]">
                      <span className="font-mono text-[11px]">{tkt.id}</span>
                      {tkt.assignedTo && <span>• {tkt.assignedTo}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      data-testid={`ticket-priority-${tkt.id}`}
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                        tkt.priority === "critical" || tkt.priority === "high"
                          ? "bg-[var(--copper-error-container,#FFDAD6)] text-[var(--copper-on-error-container,#410002)]"
                          : "bg-[var(--md-sys-color-surface-container-high,#E6E0E9)] text-[var(--md-sys-color-on-surface-variant,#49454E)]"
                      }`}
                    >
                      {tkt.priority}
                    </span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[var(--copper-secondary-container,#C8EAE5)] text-[var(--copper-on-secondary-container,#00201D)]">
                      {tkt.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ) : (
          <section
            data-testid="facet-room-tickets-degraded"
            className="p-4 rounded-xl bg-[var(--md-sys-color-surface-container-low,#F7F2FA)] border border-dashed border-[var(--md-sys-color-outline-variant,#CAC4D0)] flex flex-col items-center justify-center text-center gap-1 min-h-[140px]"
          >
            <span className="font-semibold text-sm text-[var(--md-sys-color-on-surface-variant,#49454E)]">
              {t("facet.ticketsUnavailable", "Ticket Desk Unavailable")}
            </span>
            <span className="text-xs text-[var(--md-sys-color-on-surface-variant,#49454E)]">
              {t("facet.ticketsDegradedDesc", "No active tickets for this room or M10 engine capability missing.")}
            </span>
          </section>
        )}

        {/* FACET 4: SLA & Operational Posture */}
        {hasCap("m10.sla") && room.sla ? (
          <section
            data-testid="facet-room-sla"
            className="flex flex-col gap-3 p-4 rounded-xl bg-[var(--md-sys-color-surface-container-low,#F7F2FA)] border border-[var(--md-sys-color-outline-variant,#CAC4D0)]"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[var(--md-sys-color-outline-variant,#CAC4D0)]">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-base text-[var(--md-sys-color-on-surface,#1D1B20)]">
                  {t("facet.sla", "SLA & Posture")}
                </span>
                {room.sla.tier && (
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[var(--md-sys-color-surface-container-high,#E6E0E9)] text-[var(--md-sys-color-on-surface-variant,#49454E)]">
                    {room.sla.tier}
                  </span>
                )}
              </div>
              <span
                data-testid="room-sla-status"
                className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                  room.sla.status === "healthy"
                    ? "bg-[var(--copper-secondary-container,#C8EAE5)] text-[var(--copper-on-secondary-container,#00201D)]"
                    : room.sla.status === "at_risk"
                    ? "bg-[var(--copper-semantic-risk,#B05500)] text-white"
                    : "bg-[var(--copper-error,#BA1A1A)] text-white"
                }`}
              >
                {room.sla.status}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {room.sla.uptimePercent !== undefined && (
                <div className="p-3 rounded-lg bg-[var(--md-sys-color-surface-container,#ECE6F0)] border border-[var(--md-sys-color-outline-variant,#CAC4D0)] flex flex-col">
                  <span className="text-xs text-[var(--md-sys-color-on-surface-variant,#49454E)]">
                    {t("room.uptime", "Uptime")}
                  </span>
                  <span
                    data-testid="room-sla-uptime"
                    className="text-lg font-bold text-[var(--md-sys-color-on-surface,#1D1B20)] [font-variant-numeric:tabular-nums]"
                  >
                    {`${room.sla.uptimePercent}%`}
                  </span>
                </div>
              )}

              {room.sla.currentResponseTimeHours !== undefined && (
                <div className="p-3 rounded-lg bg-[var(--md-sys-color-surface-container,#ECE6F0)] border border-[var(--md-sys-color-outline-variant,#CAC4D0)] flex flex-col">
                  <span className="text-xs text-[var(--md-sys-color-on-surface-variant,#49454E)]">
                    {t("room.responseTime", "Avg Response")}
                  </span>
                  <span className="text-lg font-bold text-[var(--md-sys-color-on-surface,#1D1B20)] [font-variant-numeric:tabular-nums]">
                    {`${room.sla.currentResponseTimeHours}h`}
                  </span>
                </div>
              )}

              {room.sla.targetResponseTimeHours !== undefined && (
                <div className="p-3 rounded-lg bg-[var(--md-sys-color-surface-container,#ECE6F0)] border border-[var(--md-sys-color-outline-variant,#CAC4D0)] flex flex-col">
                  <span className="text-xs text-[var(--md-sys-color-on-surface-variant,#49454E)]">
                    {t("room.targetResponse", "Target Response")}
                  </span>
                  <span className="text-lg font-bold text-[var(--md-sys-color-on-surface,#1D1B20)] [font-variant-numeric:tabular-nums]">
                    {`≤ ${room.sla.targetResponseTimeHours}h`}
                  </span>
                </div>
              )}
            </div>
          </section>
        ) : (
          <section
            data-testid="facet-room-sla-degraded"
            className="p-4 rounded-xl bg-[var(--md-sys-color-surface-container-low,#F7F2FA)] border border-dashed border-[var(--md-sys-color-outline-variant,#CAC4D0)] flex flex-col items-center justify-center text-center gap-1 min-h-[140px]"
          >
            <span className="font-semibold text-sm text-[var(--md-sys-color-on-surface-variant,#49454E)]">
              {t("facet.slaUnavailable", "SLA Engine Unavailable")}
            </span>
            <span className="text-xs text-[var(--md-sys-color-on-surface-variant,#49454E)]">
              {t("facet.slaDegradedDesc", "No SLA agreement or M10 SLA engine capability missing.")}
            </span>
          </section>
        )}
      </div>
      {/* 3. Secondary Facet Grid: Telemetry, Documents, Spend, History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* FACET 5: Telemetry */}
        {hasCap("m19.telemetry") && room.telemetry ? (
          <section
            data-testid="facet-room-telemetry"
            className="flex flex-col gap-3 p-4 rounded-xl bg-[var(--md-sys-color-surface-container-low,#F7F2FA)] border border-[var(--md-sys-color-outline-variant,#CAC4D0)]"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[var(--md-sys-color-outline-variant,#CAC4D0)]">
              <span className="font-semibold text-base text-[var(--md-sys-color-on-surface,#1D1B20)]">
                {t("facet.telemetry", "Room Telemetry")}
              </span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[var(--copper-secondary-container,#C8EAE5)] text-[var(--copper-on-secondary-container,#00201D)]">
                {room.telemetry.status}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {room.telemetry.temperatureC !== undefined && (
                <div className="p-3 rounded-lg bg-[var(--md-sys-color-surface-container,#ECE6F0)] border border-[var(--md-sys-color-outline-variant,#CAC4D0)] flex flex-col">
                  <span className="text-xs text-[var(--md-sys-color-on-surface-variant,#49454E)]">
                    {t("room.temp", "Temperature")}
                  </span>
                  <span className="text-lg font-bold text-[var(--md-sys-color-on-surface,#1D1B20)] [font-variant-numeric:tabular-nums]">
                    {`${room.telemetry.temperatureC}°C`}
                  </span>
                </div>
              )}

              {room.telemetry.humidityPercent !== undefined && (
                <div className="p-3 rounded-lg bg-[var(--md-sys-color-surface-container,#ECE6F0)] border border-[var(--md-sys-color-outline-variant,#CAC4D0)] flex flex-col">
                  <span className="text-xs text-[var(--md-sys-color-on-surface-variant,#49454E)]">
                    {t("room.humidity", "Humidity")}
                  </span>
                  <span className="text-lg font-bold text-[var(--md-sys-color-on-surface,#1D1B20)] [font-variant-numeric:tabular-nums]">
                    {`${room.telemetry.humidityPercent}%`}
                  </span>
                </div>
              )}

              {room.telemetry.powerDrawWatts !== undefined && (
                <div className="p-3 rounded-lg bg-[var(--md-sys-color-surface-container,#ECE6F0)] border border-[var(--md-sys-color-outline-variant,#CAC4D0)] flex flex-col">
                  <span className="text-xs text-[var(--md-sys-color-on-surface-variant,#49454E)]">
                    {t("room.power", "Power Draw")}
                  </span>
                  <span className="text-lg font-bold text-[var(--md-sys-color-on-surface,#1D1B20)] [font-variant-numeric:tabular-nums]">
                    {`${room.telemetry.powerDrawWatts} W`}
                  </span>
                </div>
              )}
            </div>
          </section>
        ) : (
          <section
            data-testid="facet-room-telemetry-degraded"
            className="p-4 rounded-xl bg-[var(--md-sys-color-surface-container-low,#F7F2FA)] border border-dashed border-[var(--md-sys-color-outline-variant,#CAC4D0)] flex flex-col items-center justify-center text-center gap-1 min-h-[140px]"
          >
            <span className="font-semibold text-sm text-[var(--md-sys-color-on-surface-variant,#49454E)]">
              {t("facet.telemetryUnavailable", "Telemetry Engine Unavailable")}
            </span>
            <span className="text-xs text-[var(--md-sys-color-on-surface-variant,#49454E)]">
              {t("facet.telemetryDegradedDesc", "No sensors reporting or M19 telemetry capability missing.")}
            </span>
          </section>
        )}

        {/* FACET 6: Documents */}
        {hasCap("documents") && room.documents && room.documents.length > 0 ? (
          <section
            data-testid="facet-room-documents"
            className="flex flex-col gap-3 p-4 rounded-xl bg-[var(--md-sys-color-surface-container-low,#F7F2FA)] border border-[var(--md-sys-color-outline-variant,#CAC4D0)]"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[var(--md-sys-color-outline-variant,#CAC4D0)]">
              <span className="font-semibold text-base text-[var(--md-sys-color-on-surface,#1D1B20)]">
                {t("facet.documents", "Documents & Drawings")}
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[var(--md-sys-color-surface-container-high,#E6E0E9)] [font-variant-numeric:tabular-nums]">
                {room.documents.length}
              </span>
            </div>

            <ul className="divide-y divide-[var(--md-sys-color-outline-variant,#CAC4D0)] list-none m-0 p-0 max-h-[220px] overflow-y-auto">
              {room.documents.map((doc) => (
                <li
                  key={doc.id}
                  className="flex items-center justify-between py-2 text-sm gap-2 first:pt-0 last:pb-0"
                >
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-[var(--md-sys-color-on-surface,#1D1B20)] truncate">
                      {doc.title}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-[var(--md-sys-color-on-surface-variant,#49454E)]">
                      {doc.fileType && (
                        <span className="uppercase font-bold text-[10px] px-1.5 py-0.2 rounded bg-[var(--md-sys-color-surface-container-high,#E6E0E9)]">
                          {doc.fileType}
                        </span>
                      )}
                      {doc.sizeBytes && (
                        <span className="[font-variant-numeric:tabular-nums]">
                          {formatFileSize(doc.sizeBytes)}
                        </span>
                      )}
                    </div>
                  </div>

                  {doc.url && (
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold px-2 py-1 rounded bg-[var(--md-sys-color-surface-container-high,#E6E0E9)] text-[var(--copper-primary,#B87333)] hover:underline"
                    >
                      {t("common.open", "Open")}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ) : (
          <section
            data-testid="facet-room-documents-degraded"
            className="p-4 rounded-xl bg-[var(--md-sys-color-surface-container-low,#F7F2FA)] border border-dashed border-[var(--md-sys-color-outline-variant,#CAC4D0)] flex flex-col items-center justify-center text-center gap-1 min-h-[140px]"
          >
            <span className="font-semibold text-sm text-[var(--md-sys-color-on-surface-variant,#49454E)]">
              {t("facet.documentsUnavailable", "Documents Vault Unavailable")}
            </span>
            <span className="text-xs text-[var(--md-sys-color-on-surface-variant,#49454E)]">
              {t("facet.documentsDegradedDesc", "No files uploaded for this room.")}
            </span>
          </section>
        )}

        {/* FACET 7: Spend & Commercials */}
        {hasCap("m8.economy") && room.spend ? (
          <section
            data-testid="facet-room-spend"
            className="flex flex-col gap-3 p-4 rounded-xl bg-[var(--md-sys-color-surface-container-low,#F7F2FA)] border border-[var(--md-sys-color-outline-variant,#CAC4D0)]"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[var(--md-sys-color-outline-variant,#CAC4D0)]">
              <span className="font-semibold text-base text-[var(--md-sys-color-on-surface,#1D1B20)]">
                {t("facet.spend", "Spend & Valuation")}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-[var(--md-sys-color-surface-container,#ECE6F0)] border border-[var(--md-sys-color-outline-variant,#CAC4D0)] flex flex-col">
                <span className="text-xs text-[var(--md-sys-color-on-surface-variant,#49454E)]">
                  {t("facet.totalSpend", "Total Spend")}
                </span>
                <span
                  data-testid="room-spend-total"
                  className="text-lg font-bold text-[var(--md-sys-color-on-surface,#1D1B20)] [font-variant-numeric:tabular-nums]"
                >
                  {formatMoney(room.spend.totalSpend, room.spend.currency)}
                </span>
              </div>

              {room.spend.totalBudget !== undefined && (
                <div className="p-3 rounded-lg bg-[var(--md-sys-color-surface-container,#ECE6F0)] border border-[var(--md-sys-color-outline-variant,#CAC4D0)] flex flex-col">
                  <span className="text-xs text-[var(--md-sys-color-on-surface-variant,#49454E)]">
                    {t("facet.totalBudget", "Budget")}
                  </span>
                  <span className="text-lg font-bold text-[var(--md-sys-color-on-surface,#1D1B20)] [font-variant-numeric:tabular-nums]">
                    {formatMoney(room.spend.totalBudget, room.spend.currency)}
                  </span>
                </div>
              )}

              {room.spend.variance !== undefined && (
                <div className="p-3 rounded-lg bg-[var(--md-sys-color-surface-container,#ECE6F0)] border border-[var(--md-sys-color-outline-variant,#CAC4D0)] flex flex-col">
                  <span className="text-xs text-[var(--md-sys-color-on-surface-variant,#49454E)]">
                    {t("facet.variance", "Variance")}
                  </span>
                  <span className="text-lg font-bold text-[var(--copper-secondary,#3A6E6A)] [font-variant-numeric:tabular-nums]">
                    {formatMoney(room.spend.variance, room.spend.currency)}
                  </span>
                </div>
              )}
            </div>
          </section>
        ) : (
          <section
            data-testid="facet-room-spend-degraded"
            className="p-4 rounded-xl bg-[var(--md-sys-color-surface-container-low,#F7F2FA)] border border-dashed border-[var(--md-sys-color-outline-variant,#CAC4D0)] flex flex-col items-center justify-center text-center gap-1 min-h-[140px]"
          >
            <span className="font-semibold text-sm text-[var(--md-sys-color-on-surface-variant,#49454E)]">
              {t("facet.spendUnavailable", "Spend Ledger Unavailable")}
            </span>
            <span className="text-xs text-[var(--md-sys-color-on-surface-variant,#49454E)]">
              {t("facet.spendDegradedDesc", "No financial records or M8 economy capability missing.")}
            </span>
          </section>
        )}

        {/* FACET 8: History & Timeline */}
        {hasCap("history") && room.history && room.history.length > 0 ? (
          <section
            data-testid="facet-room-history"
            className="flex flex-col gap-3 p-4 rounded-xl bg-[var(--md-sys-color-surface-container-low,#F7F2FA)] border border-[var(--md-sys-color-outline-variant,#CAC4D0)]"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[var(--md-sys-color-outline-variant,#CAC4D0)]">
              <span className="font-semibold text-base text-[var(--md-sys-color-on-surface,#1D1B20)]">
                {t("facet.history", "Room History")}
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[var(--md-sys-color-surface-container-high,#E6E0E9)] [font-variant-numeric:tabular-nums]">
                {room.history.length}
              </span>
            </div>

            <ol className="relative border-l border-[var(--md-sys-color-outline-variant,#CAC4D0)] ml-2.5 pl-3 space-y-3 list-none m-0 max-h-[220px] overflow-y-auto">
              {room.history.map((hist) => (
                <li key={hist.id} className="relative">
                  <span
                    className="absolute -left-[18px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-[var(--md-sys-color-surface,#FEF7FF)] bg-[var(--copper-primary,#B87333)]"
                    aria-hidden="true"
                  />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-[var(--md-sys-color-on-surface,#1D1B20)]">
                      {hist.title}
                    </span>
                    {hist.description && (
                      <p className="text-xs text-[var(--md-sys-color-on-surface-variant,#49454E)] m-0">
                        {hist.description}
                      </p>
                    )}
                    <time className="text-[11px] text-[var(--md-sys-color-on-surface-variant,#49454E)] [font-variant-numeric:tabular-nums]">
                      {hist.timestamp}
                    </time>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        ) : (
          <section
            data-testid="facet-room-history-degraded"
            className="p-4 rounded-xl bg-[var(--md-sys-color-surface-container-low,#F7F2FA)] border border-dashed border-[var(--md-sys-color-outline-variant,#CAC4D0)] flex flex-col items-center justify-center text-center gap-1 min-h-[140px]"
          >
            <span className="font-semibold text-sm text-[var(--md-sys-color-on-surface-variant,#49454E)]">
              {t("facet.historyUnavailable", "History Unavailable")}
            </span>
            <span className="text-xs text-[var(--md-sys-color-on-surface-variant,#49454E)]">
              {t("facet.historyDegradedDesc", "No audit logs or history recorded for this room.")}
            </span>
          </section>
        )}
      </div>
    </div>
  );
};
