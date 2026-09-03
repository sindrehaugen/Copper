import { useState, useEffect, useMemo } from "react";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import { useSessionStore } from "../../store/sessionStore";
import { useDocumentStore } from "../../store/documentStore";
import { useMasking } from "../../shell/masking/index.js";

export interface CustomerQuoteItem {
  id: string;
  title: string;
  value: number;
  currency?: string | undefined;
  status: "draft" | "in_review" | "approved" | "sent" | "accepted" | "rejected" | string;
  validUntil?: string | undefined;
  marginPercent?: number | undefined;
  createdAt?: string | undefined;
}

export interface CustomerAgreementItem {
  id: string;
  name: string;
  type: "sla" | "maintenance" | "subscription" | "managed_services" | string;
  status: "active" | "pending_renewal" | "expired" | "terminated" | string;
  startDate: string;
  endDate: string;
  annualValue?: number | undefined;
  tier?: string | undefined;
}

export interface CustomerRoomItem {
  id: string;
  name: string;
  siteName?: string | undefined;
  buildingName?: string | undefined;
  floorName?: string | undefined;
  deviceCount?: number | undefined;
  status?: "operational" | "maintenance" | "offline" | string | undefined;
}

export interface CustomerAssetItem {
  id: string;
  name: string;
  model: string;
  manufacturer?: string | undefined;
  roomId?: string | undefined;
  roomName?: string | undefined;
  status: "active" | "maintenance" | "offline" | "decommissioned" | string;
  serialNumber?: string | undefined;
  installedDate?: string | undefined;
}

export interface CustomerTicketItem {
  id: string;
  title: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "open" | "in_progress" | "pending" | "resolved" | "closed";
  assignedTo?: string | undefined;
  roomId?: string | undefined;
  roomName?: string | undefined;
  createdAt: string;
}

export interface CustomerSpendData {
  currency: string;
  totalSpend: number;
  ytdSpend?: number | undefined;
  lifetimeValue?: number | undefined;
  committedSpend?: number | undefined;
  breakdown?: Array<{
    id: string;
    category: string;
    description: string;
    amount: number;
    percentage?: number | undefined;
  }> | undefined;
}

export interface CustomerHealthData {
  overallScore: number;
  status: "healthy" | "good" | "at_risk" | "critical" | string;
  trend?: "improving" | "stable" | "declining" | undefined;
  nps?: number | undefined;
  slaCompliancePercent?: number | undefined;
  ticketsOpenCount?: number | undefined;
  lastReviewDate?: string | undefined;
  riskFactors?: string[] | undefined;
  internalNotes?: string | undefined;
}

export interface CustomerSurfaceData {
  customerId: string;
  customerName?: string | undefined;
  tier?: "enterprise" | "mid_market" | "smb" | "strategic" | string | undefined;
  status?: "active" | "onboarding" | "at_risk" | "churned" | string | undefined;
  primaryContact?: {
    name: string;
    email?: string | undefined;
    phone?: string | undefined;
    role?: string | undefined;
  } | undefined;
  accountManager?: string | undefined;
  industry?: string | undefined;
  currency?: string | undefined;
  quotes?: CustomerQuoteItem[] | null | undefined;
  agreements?: CustomerAgreementItem[] | null | undefined;
  rooms?: CustomerRoomItem[] | null | undefined;
  assets?: CustomerAssetItem[] | null | undefined;
  tickets?: CustomerTicketItem[] | null | undefined;
  spend?: CustomerSpendData | null | undefined;
  health?: CustomerHealthData | null | undefined;
  capabilities?: string[] | undefined;
}

export interface CustomerSurfaceProps {
  customerId?: string | undefined;
  data?: CustomerSurfaceData | null | undefined;
  isLoading?: boolean | undefined;
  error?: Error | string | null | undefined;
  isInternal?: boolean | undefined;
  capabilities?: string[] | undefined;
  activeFacet?: string | undefined;
  onFacetChange?: ((facet: string) => void) | undefined;
  className?: string | undefined;
  onNavigate?: ((path: string, entity?: unknown) => void) | undefined;
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

export const CustomerSurface: FC<CustomerSurfaceProps> = (props: CustomerSurfaceProps) => {
  const {
    customerId = "cust-default",
    data: propData,
    isLoading: propLoading = false,
    error: propError = null,
    isInternal: propIsInternal,
    capabilities: propCapabilities,
    activeFacet: controlledFacet,
    onFacetChange,
    className = "",
    onNavigate,
  } = props;

  const { t } = useTranslation();
  const { isMasked } = useMasking();
  const sessionCapabilities = useSessionStore(
    (s) => (s as unknown as { capabilities?: string[] }).capabilities
  );
  const document = useDocumentStore((s) => s.document);

  const effectiveIsInternal =
    propIsInternal !== undefined ? propIsInternal : !isMasked;

  const effectiveCapabilities =
    propCapabilities ?? propData?.capabilities ?? sessionCapabilities ?? null;

  const hasCap = (capName: string) => {
    if (!effectiveCapabilities) return true;
    return effectiveCapabilities.includes(capName);
  };

  const [resolvedData, setResolvedData] = useState<CustomerSurfaceData | null>(
    propData || null
  );
  const [loading, setLoading] = useState<boolean>(propLoading);
  const [internalActiveTab, setInternalActiveTab] = useState<string>("all");

  const activeTab = controlledFacet !== undefined ? controlledFacet : internalActiveTab;

  const handleTabChange = (tabId: string) => {
    setInternalActiveTab(tabId);
    if (onFacetChange) {
      onFacetChange(tabId);
    }
  };

  useEffect(() => {
    if (propData !== undefined) {
      setResolvedData(propData);
      setLoading(propLoading);
      return;
    }

    const docLocations = document?.locations || [];
    const docDevices = document?.devices || [];

    const defaultRooms: CustomerRoomItem[] =
      docLocations.length > 0
        ? docLocations.map((loc) => ({
            id: loc.id,
            name: loc.name || loc.id,
            siteName: "Primary Campus",
            deviceCount: docDevices.filter((d) => d.locationId === loc.id).length,
            status: "operational",
          }))
        : [
            {
              id: "loc-room-1",
              name: "Boardroom A",
              siteName: "HQ",
              deviceCount: 8,
              status: "operational",
            },
          ];

    const defaultAssets: CustomerAssetItem[] =
      docDevices.length > 0
        ? docDevices.map((d) => ({
            id: d.id,
            name: d.name || d.id,
            model: d.deviceTypeId,
            status: d.status || "active",
            roomId: d.locationId,
            roomName: docLocations.find((l) => l.id === d.locationId)?.name,
          }))
        : [
            {
              id: "ast-01",
              name: "Core DSP Processor",
              model: "DSP-300",
              status: "active",
            },
          ];

    const generatedData: CustomerSurfaceData = {
      customerId,
      customerName: `Customer ${customerId}`,
      tier: "enterprise",
      status: "active",
      currency: "EUR",
      primaryContact: {
        name: "Operations Lead",
        role: "Head of AV Systems",
      },
      accountManager: "Senior Account Director",
      industry: "Enterprise",
      quotes: [
        {
          id: "quo-live",
          title: document?.designLabel || "Active Design Implementation",
          value: 95000,
          currency: "EUR",
          status: "approved",
          validUntil: "2026-12-31",
          marginPercent: 32.0,
        },
      ],
      agreements: [
        {
          id: "agr-main",
          name: "Annual Standard Service Agreement",
          type: "sla",
          status: "active",
          startDate: "2026-01-01",
          endDate: "2026-12-31",
          annualValue: 24000,
          tier: "Standard",
        },
      ],
      rooms: defaultRooms,
      assets: defaultAssets,
      tickets: [],
      spend: {
        currency: "EUR",
        totalSpend: 119000,
        breakdown: [
          {
            id: "sp-1",
            category: "Equipment & Hardware",
            description: "Installed room infrastructure",
            amount: 95000,
          },
          {
            id: "sp-2",
            category: "Support Agreements",
            description: "Maintenance and SLA",
            amount: 24000,
          },
        ],
      },
      health: {
        overallScore: 88,
        status: "healthy",
        trend: "stable",
        slaCompliancePercent: 99.5,
        ticketsOpenCount: 0,
        internalNotes: "Standard customer baseline state.",
      },
    };

    setResolvedData(generatedData);
    setLoading(false);
  }, [propData, document, customerId, propLoading]);

  const customer = resolvedData || { customerId };

  const availableTabs = useMemo(() => {
    const tabs = [
      { id: "all", label: t("customer.tabs.all", "All Facets") },
      { id: "quotes", label: t("customer.tabs.quotes", "Quotes") },
      { id: "agreements", label: t("customer.tabs.agreements", "Agreements") },
      { id: "rooms", label: t("customer.tabs.rooms", "Rooms") },
      { id: "assets", label: t("customer.tabs.assets", "Assets") },
      { id: "tickets", label: t("customer.tabs.tickets", "Tickets") },
      { id: "spend", label: t("customer.tabs.spend", "Spend") },
    ];
    if (effectiveIsInternal) {
      tabs.push({ id: "health", label: t("customer.tabs.health", "Health") });
    }
    return tabs;
  }, [effectiveIsInternal, t]);

  if (loading) {
    return (
      <div
        data-testid="customer-surface-loading"
        className="copper-customer-surface-loading p-6 text-center text-sm text-[var(--md-sys-color-on-surface-variant,#49454e)]"
      >
        {t("common.loading", "Loading customer surface...")}
      </div>
    );
  }

  if (propError) {
    return (
      <div
        data-testid="customer-surface-error"
        className="copper-customer-surface-error p-4 rounded-md border border-[var(--copper-error,#ba1a1a)] bg-[var(--copper-error-container,#ffdad6)] text-[var(--copper-on-error-container,#410002)] text-sm m-4"
      >
        {typeof propError === "string"
          ? propError
          : propError instanceof Error
          ? propError.message
          : String(propError)}
      </div>
    );
  }

  const showAll = activeTab === "all";

  return (
    <div
      data-testid="customer-surface"
      data-customer-id={customer.customerId}
      className={`copper-customer-surface flex flex-col gap-6 p-6 ${className}`.trim()}
      style={{
        backgroundColor: "var(--md-sys-color-surface, #fef7ff)",
        color: "var(--md-sys-color-on-surface, #1d1b20)",
        minHeight: "100%",
      }}
    >
      {/* 1. Header Bar: Customer Identity & Metadata */}
      <header
        data-testid="customer-surface-header"
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-[var(--md-sys-color-surface-container-low,#f7f2fa)] border border-[var(--md-sys-color-outline-variant,#cac4d0)]"
      >
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs font-medium text-[var(--md-sys-color-on-surface-variant,#49454e)]">
            {customer.industry && <span>{customer.industry}</span>}
            {customer.accountManager && (
              <>
                <span aria-hidden="true">•</span>
                <span>{`${t("customer.accountManager", "AM")}: ${customer.accountManager}`}</span>
              </>
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight m-0 text-[var(--md-sys-color-on-surface,#1d1b20)]">
            {customer.customerName || customer.customerId}
          </h1>
          {customer.primaryContact && (
            <div className="flex items-center gap-2 text-xs text-[var(--md-sys-color-on-surface-variant,#49454e)]">
              <span className="font-medium text-[var(--md-sys-color-on-surface,#1d1b20)]">
                {customer.primaryContact.name}
              </span>
              {customer.primaryContact.role && (
                <span>({customer.primaryContact.role})</span>
              )}
              {customer.primaryContact.email && (
                <span>• {customer.primaryContact.email}</span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center flex-wrap gap-2 text-xs">
          {customer.tier && (
            <div
              data-testid="customer-tier-badge"
              className="px-2.5 py-1 rounded-md bg-[var(--copper-secondary-container,#c8eae5)] text-[var(--copper-on-secondary-container,#00201d)] uppercase font-semibold text-[11px]"
            >
              {customer.tier}
            </div>
          )}

          {customer.status && (
            <div
              data-testid="customer-status-badge"
              className={`px-2.5 py-1 rounded-md font-semibold text-[11px] uppercase ${
                customer.status === "active"
                  ? "bg-[var(--md-sys-color-surface-container-high,#e6e0e9)] text-[var(--copper-secondary,#3a6e6a)]"
                  : "bg-[var(--copper-error-container,#ffdad6)] text-[var(--copper-on-error-container,#410002)]"
              }`}
            >
              {customer.status}
            </div>
          )}

          <div
            data-testid="customer-id-badge"
            className="px-2 py-1 rounded-md bg-[var(--md-sys-color-surface-container,#ece6f0)] text-[var(--md-sys-color-on-surface-variant,#49454e)] font-mono text-[11px] font-semibold"
          >
            {customer.customerId}
          </div>
        </div>
      </header>

      {/* 2. Facet Tabs Bar */}
      <nav
        aria-label={t("customer.facetTabs", "Customer Facets")}
        className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[var(--md-sys-color-outline-variant,#cac4d0)]"
      >
        {availableTabs.map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              data-testid={`tab-customer-${tab.id}`}
              onClick={() => handleTabChange(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer border-none transition-colors ${
                isSelected
                  ? "bg-[var(--copper-primary,#b87333)] text-white shadow-sm"
                  : "bg-[var(--md-sys-color-surface-container,#ece6f0)] text-[var(--md-sys-color-on-surface-variant,#49454e)] hover:bg-[var(--md-sys-color-surface-container-high,#e6e0e9)]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* 3. Primary Facets Grid: Quotes, Agreements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* FACET 1: Quotes */}
        {(showAll || activeTab === "quotes") &&
          (hasCap("m5.quotes") && customer.quotes && customer.quotes.length > 0 ? (
            <section
              data-testid="facet-customer-quotes"
              className="flex flex-col gap-3 p-4 rounded-xl bg-[var(--md-sys-color-surface-container-low,#f7f2fa)] border border-[var(--md-sys-color-outline-variant,#cac4d0)]"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[var(--md-sys-color-outline-variant,#cac4d0)]">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-base text-[var(--md-sys-color-on-surface,#1d1b20)]">
                    {t("customer.quotes", "Quotes")}
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[var(--md-sys-color-surface-container-high,#e6e0e9)] [font-variant-numeric:tabular-nums]">
                    {customer.quotes.length}
                  </span>
                </div>
              </div>

              <ul className="divide-y divide-[var(--md-sys-color-outline-variant,#cac4d0)] list-none m-0 p-0 max-h-[260px] overflow-y-auto">
                {customer.quotes.map((quo) => (
                  <li
                    key={quo.id}
                    className="py-2.5 text-sm first:pt-0 last:pb-0"
                  >
                    <button
                      type="button"
                      className="flex items-center justify-between w-full text-left bg-transparent border-none p-1.5 rounded cursor-pointer text-inherit hover:bg-[var(--md-sys-color-surface-container,#ece6f0)] transition-colors"
                      onClick={() => onNavigate?.(`/quotes/${quo.id}`, quo)}
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-[var(--md-sys-color-on-surface,#1d1b20)] truncate">
                          {quo.title}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-[var(--md-sys-color-on-surface-variant,#49454e)]">
                          <span className="font-mono text-[11px]">{quo.id}</span>
                          {quo.validUntil && (
                            <span>
                              {`• ${t("customer.validUntil", "Valid")}: ${quo.validUntil}`}
                            </span>
                          )}
                          {effectiveIsInternal && quo.marginPercent !== undefined && (
                            <span className="text-[var(--copper-secondary,#3a6e6a)] font-medium">
                              {`• ${quo.marginPercent}% ${t("customer.margin", "margin")}`}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-bold text-[var(--md-sys-color-on-surface,#1d1b20)] [font-variant-numeric:tabular-nums]">
                          {formatMoney(quo.value, quo.currency || customer.currency)}
                        </span>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[var(--copper-secondary-container,#c8eae5)] text-[var(--copper-on-secondary-container,#00201d)]">
                          {quo.status}
                        </span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ) : (
            <section
              data-testid="facet-customer-quotes-degraded"
              className="p-4 rounded-xl bg-[var(--md-sys-color-surface-container-low,#f7f2fa)] border border-dashed border-[var(--md-sys-color-outline-variant,#cac4d0)] flex flex-col items-center justify-center text-center gap-1 min-h-[140px]"
            >
              <span className="font-semibold text-sm text-[var(--md-sys-color-on-surface-variant,#49454e)]">
                {t("customer.noQuotes", "Quotes Unavailable")}
              </span>
              <span className="text-xs text-[var(--md-sys-color-on-surface-variant,#49454e)]">
                {t("customer.noQuotesDesc", "No active quotes recorded for this customer.")}
              </span>
            </section>
          ))}

        {/* FACET 2: Agreements */}
        {(showAll || activeTab === "agreements") &&
          (hasCap("m3.agreements") && customer.agreements && customer.agreements.length > 0 ? (
            <section
              data-testid="facet-customer-agreements"
              className="flex flex-col gap-3 p-4 rounded-xl bg-[var(--md-sys-color-surface-container-low,#f7f2fa)] border border-[var(--md-sys-color-outline-variant,#cac4d0)]"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[var(--md-sys-color-outline-variant,#cac4d0)]">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-base text-[var(--md-sys-color-on-surface,#1d1b20)]">
                    {t("customer.agreements", "Agreements & Contracts")}
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[var(--md-sys-color-surface-container-high,#e6e0e9)] [font-variant-numeric:tabular-nums]">
                    {customer.agreements.length}
                  </span>
                </div>
              </div>

              <ul className="divide-y divide-[var(--md-sys-color-outline-variant,#cac4d0)] list-none m-0 p-0 max-h-[260px] overflow-y-auto">
                {customer.agreements.map((agr) => (
                  <li
                    key={agr.id}
                    className="py-2.5 text-sm first:pt-0 last:pb-0"
                  >
                    <button
                      type="button"
                      className="flex items-center justify-between w-full text-left bg-transparent border-none p-1.5 rounded cursor-pointer text-inherit hover:bg-[var(--md-sys-color-surface-container,#ece6f0)] transition-colors"
                      onClick={() => onNavigate?.(`/agreements/${agr.id}`, agr)}
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-[var(--md-sys-color-on-surface,#1d1b20)] truncate">
                          {agr.name}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-[var(--md-sys-color-on-surface-variant,#49454e)]">
                          <span className="font-mono text-[11px]">{agr.id}</span>
                          {agr.tier && <span>• {agr.tier}</span>}
                          <span>{`• ${agr.startDate} → ${agr.endDate}`}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {agr.annualValue !== undefined && (
                          <span className="font-bold text-[var(--md-sys-color-on-surface,#1d1b20)] [font-variant-numeric:tabular-nums]">
                            {`${formatMoney(agr.annualValue, customer.currency)}/${t("customer.yearShort", "yr")}`}
                          </span>
                        )}
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[var(--copper-secondary-container,#c8eae5)] text-[var(--copper-on-secondary-container,#00201d)]">
                          {agr.status}
                        </span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ) : (
            <section
              data-testid="facet-customer-agreements-degraded"
              className="p-4 rounded-xl bg-[var(--md-sys-color-surface-container-low,#f7f2fa)] border border-dashed border-[var(--md-sys-color-outline-variant,#cac4d0)] flex flex-col items-center justify-center text-center gap-1 min-h-[140px]"
            >
              <span className="font-semibold text-sm text-[var(--md-sys-color-on-surface-variant,#49454e)]">
                {t("customer.noAgreements", "Agreements Unavailable")}
              </span>
              <span className="text-xs text-[var(--md-sys-color-on-surface-variant,#49454e)]">
                {t("customer.noAgreementsDesc", "No agreements or service contracts attached.")}
              </span>
            </section>
          ))}
      </div>

      {/* 4. Rooms & Assets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* FACET 3: Rooms */}
        {(showAll || activeTab === "rooms") &&
          (customer.rooms && customer.rooms.length > 0 ? (
            <section
              data-testid="facet-customer-rooms"
              className="flex flex-col gap-3 p-4 rounded-xl bg-[var(--md-sys-color-surface-container-low,#f7f2fa)] border border-[var(--md-sys-color-outline-variant,#cac4d0)]"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[var(--md-sys-color-outline-variant,#cac4d0)]">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-base text-[var(--md-sys-color-on-surface,#1d1b20)]">
                    {t("customer.rooms", "Rooms & Locations")}
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[var(--md-sys-color-surface-container-high,#e6e0e9)] [font-variant-numeric:tabular-nums]">
                    {customer.rooms.length}
                  </span>
                </div>
              </div>

              <ul className="divide-y divide-[var(--md-sys-color-outline-variant,#cac4d0)] list-none m-0 p-0 max-h-[260px] overflow-y-auto">
                {customer.rooms.map((rm) => (
                  <li
                    key={rm.id}
                    className="py-2.5 text-sm first:pt-0 last:pb-0"
                  >
                    <button
                      type="button"
                      className="flex items-center justify-between w-full text-left bg-transparent border-none p-1.5 rounded cursor-pointer text-inherit hover:bg-[var(--md-sys-color-surface-container,#ece6f0)] transition-colors"
                      onClick={() => onNavigate?.(`/e/ROOM/${rm.id}`, rm)}
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-[var(--md-sys-color-on-surface,#1d1b20)] truncate">
                          {rm.name}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-[var(--md-sys-color-on-surface-variant,#49454e)]">
                          <span className="font-mono text-[11px]">{rm.id}</span>
                          {rm.siteName && <span>• {rm.siteName}</span>}
                          {rm.floorName && <span>• {rm.floorName}</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {rm.deviceCount !== undefined && (
                          <span className="text-xs text-[var(--md-sys-color-on-surface-variant,#49454e)] [font-variant-numeric:tabular-nums]">
                            {`${rm.deviceCount} ${t("customer.devices", "devices")}`}
                          </span>
                        )}
                        {rm.status && (
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[var(--copper-secondary-container,#c8eae5)] text-[var(--copper-on-secondary-container,#00201d)]">
                            {rm.status}
                          </span>
                        )}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ) : (
            <section
              data-testid="facet-customer-rooms-degraded"
              className="p-4 rounded-xl bg-[var(--md-sys-color-surface-container-low,#f7f2fa)] border border-dashed border-[var(--md-sys-color-outline-variant,#cac4d0)] flex flex-col items-center justify-center text-center gap-1 min-h-[140px]"
            >
              <span className="font-semibold text-sm text-[var(--md-sys-color-on-surface-variant,#49454e)]">
                {t("customer.noRooms", "Rooms Unavailable")}
              </span>
              <span className="text-xs text-[var(--md-sys-color-on-surface-variant,#49454e)]">
                {t("customer.noRoomsDesc", "No physical locations or rooms associated with this customer.")}
              </span>
            </section>
          ))}

        {/* FACET 4: Assets */}
        {(showAll || activeTab === "assets") &&
          (hasCap("m9.assets") && customer.assets && customer.assets.length > 0 ? (
            <section
              data-testid="facet-customer-assets"
              className="flex flex-col gap-3 p-4 rounded-xl bg-[var(--md-sys-color-surface-container-low,#f7f2fa)] border border-[var(--md-sys-color-outline-variant,#cac4d0)]"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[var(--md-sys-color-outline-variant,#cac4d0)]">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-base text-[var(--md-sys-color-on-surface,#1d1b20)]">
                    {t("customer.assets", "Installed Assets")}
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[var(--md-sys-color-surface-container-high,#e6e0e9)] [font-variant-numeric:tabular-nums]">
                    {customer.assets.length}
                  </span>
                </div>
              </div>

              <ul className="divide-y divide-[var(--md-sys-color-outline-variant,#cac4d0)] list-none m-0 p-0 max-h-[260px] overflow-y-auto">
                {customer.assets.map((ast) => (
                  <li
                    key={ast.id}
                    className="py-2.5 text-sm first:pt-0 last:pb-0"
                  >
                    <button
                      type="button"
                      className="flex items-center justify-between w-full text-left bg-transparent border-none p-1.5 rounded cursor-pointer text-inherit hover:bg-[var(--md-sys-color-surface-container,#ece6f0)] transition-colors"
                      onClick={() => onNavigate?.(`/e/ASSET/${ast.id}`, ast)}
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-[var(--md-sys-color-on-surface,#1d1b20)] truncate">
                          {ast.name}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-[var(--md-sys-color-on-surface-variant,#49454e)]">
                          <span>{ast.model}</span>
                          {ast.manufacturer && <span>• {ast.manufacturer}</span>}
                          {ast.roomName && <span>• {ast.roomName}</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {ast.serialNumber && (
                          <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-[var(--md-sys-color-surface-container-high,#e6e0e9)]">
                            {ast.serialNumber}
                          </span>
                        )}
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[var(--copper-secondary-container,#c8eae5)] text-[var(--copper-on-secondary-container,#00201d)]">
                          {ast.status}
                        </span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ) : (
            <section
              data-testid="facet-customer-assets-degraded"
              className="p-4 rounded-xl bg-[var(--md-sys-color-surface-container-low,#f7f2fa)] border border-dashed border-[var(--md-sys-color-outline-variant,#cac4d0)] flex flex-col items-center justify-center text-center gap-1 min-h-[140px]"
            >
              <span className="font-semibold text-sm text-[var(--md-sys-color-on-surface-variant,#49454e)]">
                {t("customer.noAssets", "Assets Register Unavailable")}
              </span>
              <span className="text-xs text-[var(--md-sys-color-on-surface-variant,#49454e)]">
                {t("customer.noAssetsDesc", "No equipment or active assets found for this customer.")}
              </span>
            </section>
          ))}
      </div>

      {/* 5. Tickets & Spend Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* FACET 5: Tickets */}
        {(showAll || activeTab === "tickets") &&
          (hasCap("m10.tickets") && customer.tickets && customer.tickets.length > 0 ? (
            <section
              data-testid="facet-customer-tickets"
              className="flex flex-col gap-3 p-4 rounded-xl bg-[var(--md-sys-color-surface-container-low,#f7f2fa)] border border-[var(--md-sys-color-outline-variant,#cac4d0)]"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[var(--md-sys-color-outline-variant,#cac4d0)]">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-base text-[var(--md-sys-color-on-surface,#1d1b20)]">
                    {t("customer.tickets", "Support & Maintenance Tickets")}
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[var(--md-sys-color-surface-container-high,#e6e0e9)] [font-variant-numeric:tabular-nums]">
                    {customer.tickets.length}
                  </span>
                </div>
              </div>

              <ul className="divide-y divide-[var(--md-sys-color-outline-variant,#cac4d0)] list-none m-0 p-0 max-h-[260px] overflow-y-auto">
                {customer.tickets.map((tkt) => (
                  <li
                    key={tkt.id}
                    className="py-2.5 text-sm first:pt-0 last:pb-0"
                  >
                    <button
                      type="button"
                      className="flex items-center justify-between w-full text-left bg-transparent border-none p-1.5 rounded cursor-pointer text-inherit hover:bg-[var(--md-sys-color-surface-container,#ece6f0)] transition-colors"
                      onClick={() => onNavigate?.(`/e/TICKET/${tkt.id}`, tkt)}
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-[var(--md-sys-color-on-surface,#1d1b20)] truncate">
                          {tkt.title}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-[var(--md-sys-color-on-surface-variant,#49454e)]">
                          <span className="font-mono text-[11px]">{tkt.id}</span>
                          {tkt.assignedTo && <span>• {tkt.assignedTo}</span>}
                          {tkt.roomName && <span>• {tkt.roomName}</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                            tkt.priority === "critical" || tkt.priority === "high"
                              ? "bg-[var(--copper-error-container,#ffdad6)] text-[var(--copper-on-error-container,#410002)]"
                              : "bg-[var(--md-sys-color-surface-container-high,#e6e0e9)] text-[var(--md-sys-color-on-surface-variant,#49454e)]"
                          }`}
                        >
                          {tkt.priority}
                        </span>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[var(--copper-secondary-container,#c8eae5)] text-[var(--copper-on-secondary-container,#00201d)]">
                          {tkt.status}
                        </span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ) : (
            <section
              data-testid="facet-customer-tickets-degraded"
              className="p-4 rounded-xl bg-[var(--md-sys-color-surface-container-low,#f7f2fa)] border border-dashed border-[var(--md-sys-color-outline-variant,#cac4d0)] flex flex-col items-center justify-center text-center gap-1 min-h-[140px]"
            >
              <span className="font-semibold text-sm text-[var(--md-sys-color-on-surface-variant,#49454e)]">
                {t("customer.noTickets", "Tickets Desk Clean")}
              </span>
              <span className="text-xs text-[var(--md-sys-color-on-surface-variant,#49454e)]">
                {t("customer.noTicketsDesc", "No open support or maintenance tickets for this customer.")}
              </span>
            </section>
          ))}

        {/* FACET 6: Spend */}
        {(showAll || activeTab === "spend") &&
          (hasCap("m8.economy") && customer.spend ? (
            <section
              data-testid="facet-customer-spend"
              className="flex flex-col gap-3 p-4 rounded-xl bg-[var(--md-sys-color-surface-container-low,#f7f2fa)] border border-[var(--md-sys-color-outline-variant,#cac4d0)]"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[var(--md-sys-color-outline-variant,#cac4d0)]">
                <span className="font-semibold text-base text-[var(--md-sys-color-on-surface,#1d1b20)]">
                  {t("customer.spend", "Customer Spend & Valuation")}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-[var(--md-sys-color-surface-container,#ece6f0)] border border-[var(--md-sys-color-outline-variant,#cac4d0)] flex flex-col">
                  <span className="text-xs text-[var(--md-sys-color-on-surface-variant,#49454e)]">
                    {t("customer.totalSpend", "Total Spend")}
                  </span>
                  <span
                    data-testid="customer-spend-total"
                    className="text-lg font-bold text-[var(--md-sys-color-on-surface,#1d1b20)] [font-variant-numeric:tabular-nums]"
                  >
                    {formatMoney(customer.spend.totalSpend, customer.spend.currency)}
                  </span>
                </div>

                {customer.spend.lifetimeValue !== undefined && (
                  <div className="p-3 rounded-lg bg-[var(--md-sys-color-surface-container,#ece6f0)] border border-[var(--md-sys-color-outline-variant,#cac4d0)] flex flex-col">
                    <span className="text-xs text-[var(--md-sys-color-on-surface-variant,#49454e)]">
                      {t("customer.ltv", "Lifetime Value")}
                    </span>
                    <span className="text-lg font-bold text-[var(--copper-secondary,#3a6e6a)] [font-variant-numeric:tabular-nums]">
                      {formatMoney(customer.spend.lifetimeValue, customer.spend.currency)}
                    </span>
                  </div>
                )}

                {customer.spend.committedSpend !== undefined && (
                  <div className="p-3 rounded-lg bg-[var(--md-sys-color-surface-container,#ece6f0)] border border-[var(--md-sys-color-outline-variant,#cac4d0)] flex flex-col">
                    <span className="text-xs text-[var(--md-sys-color-on-surface-variant,#49454e)]">
                      {t("customer.committed", "Committed")}
                    </span>
                    <span className="text-lg font-bold text-[var(--copper-primary,#b87333)] [font-variant-numeric:tabular-nums]">
                      {formatMoney(customer.spend.committedSpend, customer.spend.currency)}
                    </span>
                  </div>
                )}
              </div>

              {customer.spend.breakdown && customer.spend.breakdown.length > 0 && (
                <div className="flex flex-col gap-1.5 pt-2">
                  <span className="text-xs font-semibold text-[var(--md-sys-color-on-surface-variant,#49454e)]">
                    {`${t("customer.spendBreakdown", "Spend Breakdown")}:`}
                  </span>
                  {customer.spend.breakdown.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-xs py-1 border-b border-[var(--md-sys-color-outline-variant,#cac4d0)] last:border-none"
                    >
                      <span className="text-[var(--md-sys-color-on-surface,#1d1b20)]">
                        {item.category}
                      </span>
                      <span className="font-semibold text-[var(--md-sys-color-on-surface,#1d1b20)] [font-variant-numeric:tabular-nums]">
                        {formatMoney(item.amount, customer.spend?.currency || customer.currency)}
                        {item.percentage !== undefined && (
                          <span className="text-[11px] font-normal text-[var(--md-sys-color-on-surface-variant,#49454e)] ml-1">
                            {`(${item.percentage}%)`}
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ) : (
            <section
              data-testid="facet-customer-spend-degraded"
              className="p-4 rounded-xl bg-[var(--md-sys-color-surface-container-low,#f7f2fa)] border border-dashed border-[var(--md-sys-color-outline-variant,#cac4d0)] flex flex-col items-center justify-center text-center gap-1 min-h-[140px]"
            >
              <span className="font-semibold text-sm text-[var(--md-sys-color-on-surface-variant,#49454e)]">
                {t("customer.noSpend", "Spend Ledger Unavailable")}
              </span>
              <span className="text-xs text-[var(--md-sys-color-on-surface-variant,#49454e)]">
                {t("customer.noSpendDesc", "No financial or spend records attached.")}
              </span>
            </section>
          ))}
      </div>

      {/* 6. FACET 7: Health (STRICT INTERNAL-ONLY GATING) */}
      {effectiveIsInternal && (showAll || activeTab === "health") && (
        hasCap("m5.health") && customer.health ? (
          <section
            data-testid="facet-customer-health"
            className="flex flex-col gap-3 p-4 rounded-xl bg-[var(--md-sys-color-surface-container-low,#f7f2fa)] border border-[var(--copper-primary,#b87333)]"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[var(--md-sys-color-outline-variant,#cac4d0)]">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-base text-[var(--md-sys-color-on-surface,#1d1b20)]">
                  {t("customer.health", "Customer Health & Retention (Internal Only)")}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--copper-secondary-container,#c8eae5)] text-[var(--copper-on-secondary-container,#00201d)] uppercase font-bold">
                  {t("customer.internalBadge", "Internal")}
                </span>
              </div>
              <span
                data-testid="customer-health-status"
                className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                  customer.health.status === "healthy" || customer.health.status === "good"
                    ? "bg-[var(--copper-secondary-container,#c8eae5)] text-[var(--copper-on-secondary-container,#00201d)]"
                    : "bg-[var(--copper-error-container,#ffdad6)] text-[var(--copper-on-error-container,#410002)]"
                }`}
              >
                {customer.health.status}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-[var(--md-sys-color-surface-container,#ece6f0)] border border-[var(--md-sys-color-outline-variant,#cac4d0)] flex flex-col">
                <span className="text-xs text-[var(--md-sys-color-on-surface-variant,#49454e)]">
                  {t("customer.overallScore", "Health Score")}
                </span>
                <span
                  data-testid="customer-health-score"
                  className="text-2xl font-bold text-[var(--copper-primary,#b87333)] [font-variant-numeric:tabular-nums]"
                >
                  {`${customer.health.overallScore}/100`}
                </span>
              </div>

              {customer.health.trend && (
                <div className="p-3 rounded-lg bg-[var(--md-sys-color-surface-container,#ece6f0)] border border-[var(--md-sys-color-outline-variant,#cac4d0)] flex flex-col">
                  <span className="text-xs text-[var(--md-sys-color-on-surface-variant,#49454e)]">
                    {t("customer.trend", "Trend")}
                  </span>
                  <span className="text-lg font-bold uppercase text-[var(--md-sys-color-on-surface,#1d1b20)]">
                    {customer.health.trend}
                  </span>
                </div>
              )}

              {customer.health.nps !== undefined && (
                <div className="p-3 rounded-lg bg-[var(--md-sys-color-surface-container,#ece6f0)] border border-[var(--md-sys-color-outline-variant,#cac4d0)] flex flex-col">
                  <span className="text-xs text-[var(--md-sys-color-on-surface-variant,#49454e)]">
                    {t("customer.nps", "NPS")}
                  </span>
                  <span className="text-lg font-bold text-[var(--md-sys-color-on-surface,#1d1b20)] [font-variant-numeric:tabular-nums]">
                    {`+${customer.health.nps}`}
                  </span>
                </div>
              )}

              {customer.health.slaCompliancePercent !== undefined && (
                <div className="p-3 rounded-lg bg-[var(--md-sys-color-surface-container,#ece6f0)] border border-[var(--md-sys-color-outline-variant,#cac4d0)] flex flex-col">
                  <span className="text-xs text-[var(--md-sys-color-on-surface-variant,#49454e)]">
                    {t("customer.slaCompliance", "SLA Compliance")}
                  </span>
                  <span className="text-lg font-bold text-[var(--copper-secondary,#3a6e6a)] [font-variant-numeric:tabular-nums]">
                    {`${customer.health.slaCompliancePercent}%`}
                  </span>
                </div>
              )}
            </div>

            {customer.health.internalNotes && (
              <div className="p-3 rounded-lg bg-[var(--md-sys-color-surface-container,#ece6f0)] border border-[var(--md-sys-color-outline-variant,#cac4d0)] text-xs text-[var(--md-sys-color-on-surface,#1d1b20)]">
                <span className="font-semibold block mb-1 text-[var(--copper-primary,#b87333)]">
                  {`${t("customer.internalNotes", "Internal Account Notes")}:`}
                </span>
                <p className="m-0 leading-relaxed">{customer.health.internalNotes}</p>
              </div>
            )}
          </section>
        ) : (
          <section
            data-testid="facet-customer-health-degraded"
            className="p-4 rounded-xl bg-[var(--md-sys-color-surface-container-low,#f7f2fa)] border border-dashed border-[var(--md-sys-color-outline-variant,#cac4d0)] flex flex-col items-center justify-center text-center gap-1 min-h-[140px]"
          >
            <span className="font-semibold text-sm text-[var(--md-sys-color-on-surface-variant,#49454e)]">
              {t("customer.noHealth", "Health Radar Unavailable")}
            </span>
            <span className="text-xs text-[var(--md-sys-color-on-surface-variant,#49454e)]">
              {t("customer.noHealthDesc", "No internal health scores or telemetry available.")}
            </span>
          </section>
        )
      )}
    </div>
  );
};
