import { useState, useMemo } from "react";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import { BaseLens } from "../BaseLens";
import type { BaseLensProps } from "../types";

export interface SLATierInfo {
  tier: string;
  responseTime: string;
  resolutionTime?: string | undefined;
  uptimeCommitment: string;
  coverageHours: string;
  preventativeMaintenanceVisits?: number | string | undefined;
  penaltyClause?: string | undefined;
}

export interface AgreementTermInfo {
  startDate: string;
  endDate: string;
  renewalNoticeDays?: number | undefined;
  autoRenew: boolean;
  renewalDate?: string | undefined;
  remainingDays?: number | undefined;
}

export interface AgreementValueInfo {
  annualValue: number;
  monthlyValue?: number | undefined;
  currency: string;
  billingCadence?: "annual" | "quarterly" | "monthly" | string | undefined;
  paymentTerms?: string | undefined;
}

export interface AgreementCoveredScope {
  locations?: Array<{
    id: string;
    name: string;
    siteName?: string | undefined;
    roomCount?: number | undefined;
  }> | undefined;
  deviceCount?: number | undefined;
  notes?: string | undefined;
}

export interface AgreementSignerInfo {
  signedAt?: string | undefined;
  signedBy?: string | undefined;
  signerRole?: string | undefined;
  contractHash?: string | undefined;
}

export interface AgreementItem {
  id: string;
  name: string;
  customerId: string;
  customerName: string;
  type: "sla" | "maintenance" | "subscription" | "managed_services" | string;
  status: "active" | "pending_renewal" | "in_negotiation" | "expired" | "draft" | "terminated" | string;
  term: AgreementTermInfo;
  value: AgreementValueInfo;
  sla: SLATierInfo;
  scope?: AgreementCoveredScope | undefined;
  signature?: AgreementSignerInfo | undefined;
}

export interface AgreementData {
  agreements?: AgreementItem[] | undefined;
  selectedId?: string | undefined;
  [key: string]: any;
}

export interface AgreementLensProps extends Partial<BaseLensProps> {
  entityId?: string | undefined;
  entityType?: string | undefined;
  agreements?: AgreementItem[] | undefined;
  selectedAgreement?: AgreementItem | undefined;
  data?: AgreementData | AgreementItem | null | undefined;
  viewMode?: "details" | "calendar" | "grid" | "all" | string | undefined;
  onNavigate?: ((path: string, entity?: any) => void) | undefined;
  onSelectAgreement?: ((agreement: AgreementItem) => void) | undefined;
  onInitiateRenewal?: ((agreementId: string) => void) | undefined;
  onAmend?: ((agreementId: string) => void) | undefined;
  currency?: string | undefined;
}

export const DEFAULT_AGREEMENTS_DATA: AgreementItem[] = [
  {
    id: "agr-2026-gold",
    name: "Enterprise Mission Critical AV Support & SLA",
    customerId: "cust-nordic-corp",
    customerName: "Nordic Enterprise AS",
    type: "sla",
    status: "active",
    term: {
      startDate: "2026-01-01",
      endDate: "2027-01-01",
      renewalDate: "2026-11-01",
      renewalNoticeDays: 60,
      autoRenew: true,
      remainingDays: 120,
    },
    value: {
      annualValue: 72000,
      monthlyValue: 6000,
      currency: "EUR",
      billingCadence: "annual",
      paymentTerms: "Net 30",
    },
    sla: {
      tier: "Gold 24/7",
      responseTime: "15 min (Critical)",
      resolutionTime: "4h MTTR",
      uptimeCommitment: "99.9%",
      coverageHours: "24/7/365",
      preventativeMaintenanceVisits: 4,
      penaltyClause: "5% credit per 0.1% breach",
    },
    scope: {
      locations: [
        { id: "loc-oslo-hq", name: "Oslo HQ Campus", roomCount: 12 },
        { id: "loc-bergen-hub", name: "Bergen Innovation Hub", roomCount: 4 },
      ],
      deviceCount: 96,
      notes: "Covers all high-impact boardrooms, auditorium, and digital video wall",
    },
    signature: {
      signedAt: "2025-12-15T14:30:00Z",
      signedBy: "Kari Nordmann",
      signerRole: "VP IT Infrastructure",
      contractHash: "sha256-a9b8c7d6e5f41234",
    },
  },
  {
    id: "agr-2026-plat",
    name: "Global Operations Center Platinum SLA",
    customerId: "cust-equinor",
    customerName: "Equinor Energy Tech",
    type: "sla",
    status: "pending_renewal",
    term: {
      startDate: "2025-10-01",
      endDate: "2026-10-01",
      renewalDate: "2026-08-01",
      renewalNoticeDays: 60,
      autoRenew: false,
      remainingDays: 28,
    },
    value: {
      annualValue: 145000,
      monthlyValue: 12083,
      currency: "EUR",
      billingCadence: "quarterly",
      paymentTerms: "Net 15",
    },
    sla: {
      tier: "Platinum Mission Critical",
      responseTime: "10 min (Critical)",
      resolutionTime: "2h MTTR",
      uptimeCommitment: "99.99%",
      coverageHours: "24/7/365",
      preventativeMaintenanceVisits: 12,
      penaltyClause: "10% credit per 0.05% breach",
    },
    scope: {
      locations: [
        { id: "loc-stavanger-goc", name: "Stavanger Operations Center", roomCount: 18 },
      ],
      deviceCount: 220,
      notes: "24/7 monitoring of control rooms and emergency dispatch centers",
    },
    signature: {
      signedAt: "2025-09-20T10:15:00Z",
      signedBy: "Torvald Helmer",
      signerRole: "Chief Technology Officer",
      contractHash: "sha256-bb432f8910cd4",
    },
  },
  {
    id: "agr-2026-maint",
    name: "Branch Campus Hardware Maintenance",
    customerId: "cust-dnb",
    customerName: "DNB Financial Hub",
    type: "maintenance",
    status: "active",
    term: {
      startDate: "2026-03-01",
      endDate: "2027-03-01",
      renewalDate: "2027-01-01",
      renewalNoticeDays: 60,
      autoRenew: true,
      remainingDays: 179,
    },
    value: {
      annualValue: 38000,
      monthlyValue: 3166,
      currency: "EUR",
      billingCadence: "annual",
      paymentTerms: "Net 30",
    },
    sla: {
      tier: "Silver Business Hours",
      responseTime: "2 hours",
      resolutionTime: "8h MTTR",
      uptimeCommitment: "99.5%",
      coverageHours: "08:00 - 18:00 CET",
      preventativeMaintenanceVisits: 2,
    },
    scope: {
      locations: [
        { id: "loc-oslo-bjorvika", name: "Bjørvika Headquarters", roomCount: 8 },
      ],
      deviceCount: 42,
    },
    signature: {
      signedAt: "2026-02-14T09:00:00Z",
      signedBy: "Silje Moe",
      signerRole: "Procurement Director",
      contractHash: "sha256-ff761a2938de1",
    },
  },
  {
    id: "agr-2026-sub",
    name: "Unified Cloud Collaboration Subscription",
    customerId: "cust-telenor",
    customerName: "Telenor Media Suite",
    type: "subscription",
    status: "active",
    term: {
      startDate: "2026-05-01",
      endDate: "2027-05-01",
      renewalDate: "2027-03-01",
      renewalNoticeDays: 60,
      autoRenew: true,
      remainingDays: 240,
    },
    value: {
      annualValue: 24000,
      monthlyValue: 2000,
      currency: "EUR",
      billingCadence: "monthly",
      paymentTerms: "Net 30",
    },
    sla: {
      tier: "Standard Cloud SLA",
      responseTime: "1 hour",
      resolutionTime: "6h MTTR",
      uptimeCommitment: "99.9%",
      coverageHours: "24/7/365",
      preventativeMaintenanceVisits: 0,
    },
    scope: {
      locations: [
        { id: "loc-fornebu", name: "Fornebu Telecom Center", roomCount: 15 },
      ],
      deviceCount: 65,
    },
    signature: {
      signedAt: "2026-04-22T11:00:00Z",
      signedBy: "Erlend Viken",
      signerRole: "Head of Digital Workplace",
      contractHash: "sha256-339ac0184bde",
    },
  },
];

function formatCurrencyNumber(val: number): string {
  return val.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function resolveRenewalQuarter(dateStr: string): string {
  if (!dateStr) return "Q4 2026";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "Q4 2026";
  const month = d.getMonth() + 1;
  const year = d.getFullYear();
  const q = Math.ceil(month / 3);
  return `Q${q} ${year}`;
}

export const AgreementLens: FC<AgreementLensProps> = (props) => {
  const { t } = useTranslation();

  const rawEntityId = props.entityId || "";
  const isModuleRoot =
    !rawEntityId ||
    rawEntityId.toLowerCase() === "root" ||
    rawEntityId.toLowerCase() === "grid" ||
    rawEntityId.toLowerCase() === "calendar" ||
    rawEntityId.toLowerCase() === "all" ||
    rawEntityId.toLowerCase() === "agreements";

  const allAgreements: AgreementItem[] = useMemo(() => {
    if (props.agreements && props.agreements.length > 0) {
      return props.agreements;
    }
    if (props.data) {
      if (Array.isArray((props.data as AgreementData).agreements)) {
        return (props.data as AgreementData).agreements!;
      }
      if ((props.data as AgreementItem).id) {
        return [props.data as AgreementItem];
      }
    }
    return DEFAULT_AGREEMENTS_DATA;
  }, [props.agreements, props.data]);

  const [selectedId, setSelectedId] = useState<string>(
    isModuleRoot ? "" : rawEntityId
  );

  const [activeTab, setActiveTab] = useState<"all" | "calendar" | "grid">(
    props.viewMode === "calendar"
      ? "calendar"
      : props.viewMode === "grid"
      ? "grid"
      : "all"
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const effectiveId = selectedId || (!isModuleRoot ? rawEntityId : "");

  const activeAgreement = useMemo(() => {
    if (!effectiveId) return null;
    const found = allAgreements.find((a) => a.id === effectiveId);
    if (found) return found;
    return allAgreements[0] || null;
  }, [effectiveId, allAgreements]);

  const handleSelectAgreement = (agreement: AgreementItem) => {
    if (props.onSelectAgreement) {
      props.onSelectAgreement(agreement);
    }
    if (props.onNavigate) {
      props.onNavigate(`/e/AGREEMENT/${agreement.id}`, agreement);
    }
    setSelectedId(agreement.id);
  };

  const handleBackToGrid = () => {
    setSelectedId("");
    if (props.onNavigate) {
      props.onNavigate("/e/AGREEMENT");
    }
  };

  const filteredAgreements = useMemo(() => {
    return allAgreements.filter((a) => {
      if (statusFilter !== "all" && a.status !== statusFilter) {
        return false;
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          a.name.toLowerCase().includes(q) ||
          a.id.toLowerCase().includes(q) ||
          a.customerName.toLowerCase().includes(q) ||
          a.sla.tier.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allAgreements, statusFilter, searchQuery]);

  const calendarGroups = useMemo(() => {
    const groups: Record<string, AgreementItem[]> = {
      "Q3 2026": [],
      "Q4 2026": [],
      "Q1 2027": [],
      "Q2 2027": [],
    };

    allAgreements.forEach((a) => {
      const q = resolveRenewalQuarter(a.term.renewalDate || a.term.endDate);
      if (!groups[q]) {
        groups[q] = [];
      }
      groups[q].push(a);
    });

    return groups;
  }, [allAgreements]);

  const totalAcv = useMemo(() => {
    return allAgreements.reduce((sum, a) => sum + (a.value.annualValue || 0), 0);
  }, [allAgreements]);

  const renewingCount = useMemo(() => {
    return allAgreements.filter(
      (a) =>
        a.status === "pending_renewal" ||
        (a.term.remainingDays !== undefined && a.term.remainingDays <= 90)
    ).length;
  }, [allAgreements]);

  // If viewing an individual agreement details surface
  if (activeAgreement) {
    return (
      <BaseLens
        title={props.title || activeAgreement.name}
        subtitle={
          props.subtitle ||
          `${activeAgreement.customerName} · ${activeAgreement.sla.tier}`
        }
        lensKind="entity"
        data-entity-type="AGREEMENT"
        data-entity-id={activeAgreement.id}
        dataTestId="lens-entity"
        actions={
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button
              type="button"
              className="m3-button m3-button-outlined"
              onClick={handleBackToGrid}
              data-testid="btn-back-agreements"
              style={{
                cursor: "pointer",
                padding: "6px 12px",
                borderRadius: "6px",
                border: "1px solid var(--md-sys-color-outline, #79747e)",
                background: "transparent",
                color: "var(--md-sys-color-on-surface, #1e1e1e)",
                fontSize: "13px",
              }}
            >
              {t("agreements.allAgreements", "← All Agreements")}
            </button>
            <button
              type="button"
              className="m3-button m3-button-filled"
              onClick={() => props.onInitiateRenewal?.(activeAgreement.id)}
              data-testid="btn-initiate-renewal"
              style={{
                cursor: "pointer",
                padding: "6px 14px",
                borderRadius: "6px",
                border: "none",
                background: "var(--copper-primary, #b87333)",
                color: "#ffffff",
                fontWeight: 600,
                fontSize: "13px",
              }}
            >
              {t("agreements.initiateRenewal", "Initiate Renewal")}
            </button>
          </div>
        }
      >
        <div
          className="copper-agreement-details-surface"
          data-testid="agreement-details-surface"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            padding: "16px 0",
          }}
        >
          {/* Header Overview Banner */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "16px 20px",
              backgroundColor: "var(--md-sys-color-surface-variant, #f4f4f4)",
              borderRadius: "8px",
              border: "1px solid var(--md-sys-color-outline-variant, #e0e0e0)",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
                <span
                  style={{
                    fontSize: "12px",
                    fontFamily: "monospace",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    backgroundColor: "var(--md-sys-color-surface, #ffffff)",
                    border: "1px solid var(--md-sys-color-outline-variant, #e0e0e0)",
                  }}
                >
                  {activeAgreement.id}
                </span>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: "4px",
                    backgroundColor:
                      activeAgreement.status === "active"
                        ? "#e8f5e9"
                        : activeAgreement.status === "pending_renewal"
                        ? "#fff3e0"
                        : "#f5f5f5",
                    color:
                      activeAgreement.status === "active"
                        ? "#2e7d32"
                        : activeAgreement.status === "pending_renewal"
                        ? "#e65100"
                        : "#616161",
                  }}
                >
                  {activeAgreement.status.toUpperCase()}
                </span>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: "4px",
                    backgroundColor: "rgba(58, 110, 106, 0.12)",
                    color: "var(--copper-secondary, #3a6e6a)",
                  }}
                >
                  {activeAgreement.sla.tier}
                </span>
              </div>
              <h2 style={{ margin: "0 0 4px 0", fontSize: "16px", fontWeight: 600 }}>
                {t("agreements.agreementOverview", "Agreement Overview")}
              </h2>
              <div style={{ color: "var(--md-sys-color-on-surface-variant, #5e5e5e)", fontSize: "14px" }}>
                <span>{t("agreements.client", "Client")}: </span>
                <strong>{activeAgreement.customerName}</strong>
                <span style={{ margin: "0 8px" }}>·</span>
                <span>{t("agreements.type", "Type")}: </span>
                <span style={{ textTransform: "capitalize" }}>{activeAgreement.type}</span>
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "12px", color: "var(--md-sys-color-on-surface-variant, #5e5e5e)" }}>
                {t("agreements.annualValueLabel", "Annual Contract Value")}
              </div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: 700,
                  fontVariantNumeric: "tabular-nums",
                  color: "var(--copper-primary, #b87333)",
                }}
              >
                {formatCurrencyNumber(activeAgreement.value.annualValue)} {activeAgreement.value.currency}
              </div>
            </div>
          </div>

          {/* Grid Layout of Facet Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "20px",
            }}
          >
            {/* Term & Renewal Facet */}
            <div
              data-testid="agreement-term-section"
              style={{
                backgroundColor: "var(--md-sys-color-surface, #ffffff)",
                padding: "18px 20px",
                borderRadius: "8px",
                border: "1px solid var(--md-sys-color-outline-variant, #e0e0e0)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: "1px solid var(--md-sys-color-outline-variant, #e0e0e0)",
                  paddingBottom: "10px",
                  marginBottom: "14px",
                }}
              >
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600 }}>
                  {t("agreements.termAndRenewal", "Term & Renewal Schedule")}
                </h3>
                {activeAgreement.term.autoRenew && (
                  <span
                    style={{
                      fontSize: "11px",
                      padding: "2px 6px",
                      backgroundColor: "rgba(58, 110, 106, 0.12)",
                      color: "var(--copper-secondary, #3a6e6a)",
                      borderRadius: "4px",
                      fontWeight: 600,
                    }}
                  >
                    {t("agreements.autoRenewTag", "Auto-Renew Active")}
                  </span>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--md-sys-color-on-surface-variant, #5e5e5e)" }}>
                    {t("agreements.startDate", "Start Date")}:
                  </span>
                  <span style={{ fontWeight: 500 }}>{activeAgreement.term.startDate}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--md-sys-color-on-surface-variant, #5e5e5e)" }}>
                    {t("agreements.endDate", "End Date")}:
                  </span>
                  <span style={{ fontWeight: 500 }}>{activeAgreement.term.endDate}</span>
                </div>
                {activeAgreement.term.renewalDate && (
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--md-sys-color-on-surface-variant, #5e5e5e)" }}>
                      {t("agreements.renewalNoticeDate", "Notice Date")}:
                    </span>
                    <span style={{ fontWeight: 500 }}>{activeAgreement.term.renewalDate}</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--md-sys-color-on-surface-variant, #5e5e5e)" }}>
                    {t("agreements.noticePeriod", "Notice Horizon")}:
                  </span>
                  <span style={{ fontWeight: 500 }}>
                    {activeAgreement.term.renewalNoticeDays || 60} {t("agreements.days", "days")}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--md-sys-color-on-surface-variant, #5e5e5e)" }}>
                    {t("agreements.daysRemaining", "Days Remaining")}:
                  </span>
                  <span
                    style={{
                      fontWeight: 600,
                      fontVariantNumeric: "tabular-nums",
                      color:
                        (activeAgreement.term.remainingDays ?? 100) < 60
                          ? "#d32f2f"
                          : "var(--copper-secondary, #3a6e6a)",
                    }}
                  >
                    {activeAgreement.term.remainingDays ?? 120} {t("agreements.days", "days")}
                  </span>
                </div>
              </div>
            </div>

            {/* Financial Value Facet */}
            <div
              data-testid="agreement-value-section"
              style={{
                backgroundColor: "var(--md-sys-color-surface, #ffffff)",
                padding: "18px 20px",
                borderRadius: "8px",
                border: "1px solid var(--md-sys-color-outline-variant, #e0e0e0)",
              }}
            >
              <div
                style={{
                  borderBottom: "1px solid var(--md-sys-color-outline-variant, #e0e0e0)",
                  paddingBottom: "10px",
                  marginBottom: "14px",
                }}
              >
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600 }}>
                  {t("agreements.financialCommercials", "Financial & Commercial Terms")}
                </h3>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--md-sys-color-on-surface-variant, #5e5e5e)" }}>
                    {t("agreements.acv", "Annual Contract Value (ACV)")}:
                  </span>
                  <span style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                    {formatCurrencyNumber(activeAgreement.value.annualValue)} {activeAgreement.value.currency}
                  </span>
                </div>
                {activeAgreement.value.monthlyValue && (
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--md-sys-color-on-surface-variant, #5e5e5e)" }}>
                      {t("agreements.mrr", "Monthly Run Rate (MRR)")}:
                    </span>
                    <span style={{ fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>
                      {formatCurrencyNumber(activeAgreement.value.monthlyValue)} {activeAgreement.value.currency}
                    </span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--md-sys-color-on-surface-variant, #5e5e5e)" }}>
                    {t("agreements.currency", "Billing Currency")}:
                  </span>
                  <span style={{ fontWeight: 500 }}>{activeAgreement.value.currency}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--md-sys-color-on-surface-variant, #5e5e5e)" }}>
                    {t("agreements.cadence", "Billing Cadence")}:
                  </span>
                  <span style={{ fontWeight: 500, textTransform: "capitalize" }}>
                    {activeAgreement.value.billingCadence || "Annual"}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--md-sys-color-on-surface-variant, #5e5e5e)" }}>
                    {t("agreements.paymentTerms", "Payment Terms")}:
                  </span>
                  <span style={{ fontWeight: 500 }}>
                    {activeAgreement.value.paymentTerms || "Net 30"}
                  </span>
                </div>
              </div>
            </div>

            {/* SLA Tiers & Commitments Facet */}
            <div
              data-testid="agreement-sla-section"
              style={{
                backgroundColor: "var(--md-sys-color-surface, #ffffff)",
                padding: "18px 20px",
                borderRadius: "8px",
                border: "1px solid var(--md-sys-color-outline-variant, #e0e0e0)",
              }}
            >
              <div
                style={{
                  borderBottom: "1px solid var(--md-sys-color-outline-variant, #e0e0e0)",
                  paddingBottom: "10px",
                  marginBottom: "14px",
                }}
              >
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600 }}>
                  {t("agreements.slaCommitments", "SLA Tiers & Commitments")}
                </h3>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--md-sys-color-on-surface-variant, #5e5e5e)" }}>
                    {t("agreements.tierName", "Service Level Tier")}:
                  </span>
                  <span style={{ fontWeight: 600, color: "var(--copper-secondary, #3a6e6a)" }}>
                    {activeAgreement.sla.tier}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--md-sys-color-on-surface-variant, #5e5e5e)" }}>
                    {t("agreements.responseTime", "Response Time Target")}:
                  </span>
                  <span style={{ fontWeight: 500 }}>{activeAgreement.sla.responseTime}</span>
                </div>
                {activeAgreement.sla.resolutionTime && (
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--md-sys-color-on-surface-variant, #5e5e5e)" }}>
                      {t("agreements.mttr", "Resolution Target (MTTR)")}:
                    </span>
                    <span style={{ fontWeight: 500 }}>{activeAgreement.sla.resolutionTime}</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--md-sys-color-on-surface-variant, #5e5e5e)" }}>
                    {t("agreements.uptime", "Uptime Commitment")}:
                  </span>
                  <span style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                    {activeAgreement.sla.uptimeCommitment}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--md-sys-color-on-surface-variant, #5e5e5e)" }}>
                    {t("agreements.hours", "Coverage Hours")}:
                  </span>
                  <span style={{ fontWeight: 500 }}>{activeAgreement.sla.coverageHours}</span>
                </div>
                {activeAgreement.sla.preventativeMaintenanceVisits !== undefined && (
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--md-sys-color-on-surface-variant, #5e5e5e)" }}>
                      {t("agreements.pmVisits", "PM Visits")}:
                    </span>
                    <span style={{ fontWeight: 500 }}>
                      {activeAgreement.sla.preventativeMaintenanceVisits} {t("agreements.perYear", "/ year")}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Scope & Covered Locations Facet */}
            <div
              data-testid="agreement-scope-section"
              style={{
                backgroundColor: "var(--md-sys-color-surface, #ffffff)",
                padding: "18px 20px",
                borderRadius: "8px",
                border: "1px solid var(--md-sys-color-outline-variant, #e0e0e0)",
              }}
            >
              <div
                style={{
                  borderBottom: "1px solid var(--md-sys-color-outline-variant, #e0e0e0)",
                  paddingBottom: "10px",
                  marginBottom: "14px",
                }}
              >
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600 }}>
                  {t("agreements.coveredScope", "Covered Scope & Estates")}
                </h3>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--md-sys-color-on-surface-variant, #5e5e5e)" }}>
                    {t("agreements.coveredDevices", "Covered Assets / Devices")}:
                  </span>
                  <span style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                    {activeAgreement.scope?.deviceCount ?? 96} {t("agreements.units", "units")}
                  </span>
                </div>

                <div style={{ marginTop: "4px" }}>
                  <span style={{ color: "var(--md-sys-color-on-surface-variant, #5e5e5e)", fontSize: "13px" }}>
                    {t("agreements.coveredLocationsList", "Locations:")}
                  </span>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "6px" }}>
                    {(activeAgreement.scope?.locations || [
                      { id: "loc-oslo-hq", name: "Oslo HQ Campus", roomCount: 12 },
                    ]).map((loc) => (
                      <div
                        key={loc.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          backgroundColor: "var(--md-sys-color-surface-variant, #f4f4f4)",
                          fontSize: "13px",
                        }}
                      >
                        <span>{loc.name}</span>
                        {loc.roomCount && (
                          <span style={{ color: "var(--md-sys-color-on-surface-variant, #5e5e5e)" }}>
                            {loc.roomCount} {t("agreements.rooms", "rooms")}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {activeAgreement.scope?.notes && (
                  <div
                    style={{
                      fontSize: "12px",
                      color: "var(--md-sys-color-on-surface-variant, #5e5e5e)",
                      marginTop: "6px",
                      fontStyle: "italic",
                    }}
                  >
                    {activeAgreement.scope.notes}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Signature & Baseline Audit Trail */}
          {activeAgreement.signature && (
            <div
              data-testid="agreement-signature-section"
              style={{
                backgroundColor: "var(--md-sys-color-surface, #ffffff)",
                padding: "16px 20px",
                borderRadius: "8px",
                border: "1px solid var(--md-sys-color-outline-variant, #e0e0e0)",
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
                fontSize: "13px",
              }}
            >
              <div>
                <span style={{ fontWeight: 600 }}>{t("agreements.executedBy", "Executed Signer")}: </span>
                <span>{activeAgreement.signature.signedBy}</span>
                {activeAgreement.signature.signerRole && (
                  <span style={{ color: "var(--md-sys-color-on-surface-variant, #5e5e5e)" }}>
                    {" "}
                    ({activeAgreement.signature.signerRole})
                  </span>
                )}
                <span style={{ margin: "0 8px" }}>·</span>
                <span style={{ color: "var(--md-sys-color-on-surface-variant, #5e5e5e)" }}>
                  {activeAgreement.signature.signedAt}
                </span>
              </div>
              <div>
                <span style={{ color: "var(--md-sys-color-on-surface-variant, #5e5e5e)" }}>
                  {t("agreements.hash", "WORM Hash")}:{" "}
                </span>
                <code
                  style={{
                    fontSize: "11px",
                    padding: "2px 6px",
                    backgroundColor: "var(--md-sys-color-surface-variant, #f4f4f4)",
                    borderRadius: "4px",
                  }}
                >
                  {activeAgreement.signature.contractHash}
                </code>
              </div>
            </div>
          )}
        </div>
      </BaseLens>
    );
  }

  // Root Aggregated View (Renewal Calendar + Grid Lens)
  return (
    <BaseLens
      title={props.title || t("agreements.agreementBook", "Agreement Book")}
      subtitle={
        props.subtitle ||
        t("agreements.aggregatedSubtitle", "Agreements & Renewal Calendar")
      }
      lensKind="grid"
      data-lens-kind="grid"
      dataTestId="lens-grid"
      actions={
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <div
            style={{
              display: "inline-flex",
              backgroundColor: "var(--md-sys-color-surface-variant, #f4f4f4)",
              borderRadius: "6px",
              padding: "2px",
            }}
          >
            <button
              type="button"
              data-testid="tab-renewal-calendar"
              onClick={() => setActiveTab("calendar")}
              style={{
                cursor: "pointer",
                padding: "6px 12px",
                borderRadius: "4px",
                border: "none",
                fontSize: "13px",
                fontWeight: activeTab === "calendar" ? 600 : 400,
                backgroundColor: activeTab === "calendar" ? "#ffffff" : "transparent",
                color:
                  activeTab === "calendar"
                    ? "var(--copper-primary, #b87333)"
                    : "var(--md-sys-color-on-surface-variant, #5e5e5e)",
                boxShadow: activeTab === "calendar" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
              }}
            >
              {t("agreements.renewalCalendar", "Renewal Calendar")}
            </button>
            <button
              type="button"
              data-testid="tab-agreements-grid"
              onClick={() => setActiveTab("grid")}
              style={{
                cursor: "pointer",
                padding: "6px 12px",
                borderRadius: "4px",
                border: "none",
                fontSize: "13px",
                fontWeight: activeTab === "grid" ? 600 : 400,
                backgroundColor: activeTab === "grid" ? "#ffffff" : "transparent",
                color:
                  activeTab === "grid"
                    ? "var(--copper-primary, #b87333)"
                    : "var(--md-sys-color-on-surface-variant, #5e5e5e)",
                boxShadow: activeTab === "grid" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
              }}
            >
              {t("agreements.gridView", "Agreements Grid")}
            </button>
          </div>
        </div>
      }
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          padding: "16px 0",
        }}
      >
        {/* KPI Summary Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
          }}
        >
          <div
            style={{
              padding: "16px",
              backgroundColor: "var(--md-sys-color-surface, #ffffff)",
              borderRadius: "8px",
              border: "1px solid var(--md-sys-color-outline-variant, #e0e0e0)",
            }}
          >
            <div style={{ fontSize: "12px", color: "var(--md-sys-color-on-surface-variant, #5e5e5e)", marginBottom: "4px" }}>
              {t("agreements.totalActive", "Total Active Agreements")}
            </div>
            <div style={{ fontSize: "24px", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
              {allAgreements.length}
            </div>
          </div>

          <div
            style={{
              padding: "16px",
              backgroundColor: "var(--md-sys-color-surface, #ffffff)",
              borderRadius: "8px",
              border: "1px solid var(--md-sys-color-outline-variant, #e0e0e0)",
            }}
          >
            <div style={{ fontSize: "12px", color: "var(--md-sys-color-on-surface-variant, #5e5e5e)", marginBottom: "4px" }}>
              {t("agreements.totalAcv", "Total Portfolio ACV")}
            </div>
            <div
              style={{
                fontSize: "24px",
                fontWeight: 700,
                fontVariantNumeric: "tabular-nums",
                color: "var(--copper-primary, #b87333)",
              }}
            >
              {formatCurrencyNumber(totalAcv)} EUR
            </div>
          </div>

          <div
            style={{
              padding: "16px",
              backgroundColor: "var(--md-sys-color-surface, #ffffff)",
              borderRadius: "8px",
              border: "1px solid var(--md-sys-color-outline-variant, #e0e0e0)",
            }}
          >
            <div style={{ fontSize: "12px", color: "var(--md-sys-color-on-surface-variant, #5e5e5e)", marginBottom: "4px" }}>
              {t("agreements.renewingSoon", "Renewing in ≤ 90 Days")}
            </div>
            <div
              style={{
                fontSize: "24px",
                fontWeight: 700,
                fontVariantNumeric: "tabular-nums",
                color: renewingCount > 0 ? "#ed6c02" : "inherit",
              }}
            >
              {renewingCount}
            </div>
          </div>

          <div
            style={{
              padding: "16px",
              backgroundColor: "var(--md-sys-color-surface, #ffffff)",
              borderRadius: "8px",
              border: "1px solid var(--md-sys-color-outline-variant, #e0e0e0)",
            }}
          >
            <div style={{ fontSize: "12px", color: "var(--md-sys-color-on-surface-variant, #5e5e5e)", marginBottom: "4px" }}>
              {t("agreements.autoRenewRatio", "Auto-Renewal Rate")}
            </div>
            <div style={{ fontSize: "24px", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
              {Math.round(
                (allAgreements.filter((a) => a.term.autoRenew).length /
                  Math.max(1, allAgreements.length)) *
                  100
              )}
              %
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            alignItems: "center",
            padding: "12px 16px",
            backgroundColor: "var(--md-sys-color-surface-variant, #f4f4f4)",
            borderRadius: "8px",
          }}
        >
          <input
            type="text"
            data-testid="search-agreements"
            placeholder={t("agreements.searchPlaceholder", "Search agreements, customers, SLA tiers...")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: "1 1 240px",
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid var(--md-sys-color-outline-variant, #e0e0e0)",
              fontSize: "14px",
            }}
          />
          <select
            data-testid="filter-status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid var(--md-sys-color-outline-variant, #e0e0e0)",
              backgroundColor: "#ffffff",
              fontSize: "14px",
            }}
          >
            <option value="all">{t("agreements.allStatuses", "All Statuses")}</option>
            <option value="active">{t("agreements.active", "Active")}</option>
            <option value="pending_renewal">{t("agreements.pendingRenewal", "Pending Renewal")}</option>
            <option value="expired">{t("agreements.expired", "Expired")}</option>
          </select>
        </div>

        {/* Facet 1: Renewal Calendar */}
        {(activeTab === "all" || activeTab === "calendar") && (
          <div
            data-testid="renewal-calendar"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 600 }}>
                {t("agreements.calendarHorizon", "Renewal Calendar Horizon")}
              </h3>
              <span style={{ fontSize: "13px", color: "var(--md-sys-color-on-surface-variant, #5e5e5e)" }}>
                {t("agreements.sortedByQuarter", "Grouped by renewal quarter")}
              </span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "16px",
              }}
            >
              {Object.entries(calendarGroups).map(([quarter, items]) => (
                <div
                  key={quarter}
                  style={{
                    backgroundColor: "var(--md-sys-color-surface, #ffffff)",
                    borderRadius: "8px",
                    border: "1px solid var(--md-sys-color-outline-variant, #e0e0e0)",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div
                    style={{
                      padding: "10px 14px",
                      backgroundColor: "var(--md-sys-color-surface-variant, #f4f4f4)",
                      borderBottom: "1px solid var(--md-sys-color-outline-variant, #e0e0e0)",
                      fontWeight: 600,
                      fontSize: "14px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span>{quarter}</span>
                    <span
                      style={{
                        fontSize: "12px",
                        padding: "1px 6px",
                        backgroundColor: "#ffffff",
                        borderRadius: "10px",
                        border: "1px solid var(--md-sys-color-outline-variant, #e0e0e0)",
                      }}
                    >
                      {items.length}
                    </span>
                  </div>

                  <div style={{ padding: "10px", display: "flex", flexDirection: "column", gap: "10px" }}>
                    {items.length === 0 ? (
                      <div
                        style={{
                          padding: "16px",
                          textAlign: "center",
                          fontSize: "13px",
                          color: "var(--md-sys-color-on-surface-variant, #5e5e5e)",
                        }}
                      >
                        {t("agreements.noRenewalsInQuarter", "No renewals scheduled")}
                      </div>
                    ) : (
                      items.map((item) => (
                        <div
                          key={item.id}
                          style={{
                            padding: "10px 12px",
                            borderRadius: "6px",
                            border: "1px solid var(--md-sys-color-outline-variant, #e0e0e0)",
                            backgroundColor: "#ffffff",
                            display: "flex",
                            flexDirection: "column",
                            gap: "4px",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <span style={{ fontWeight: 600, fontSize: "13px" }}>{item.name}</span>
                            <span
                              style={{
                                fontSize: "11px",
                                fontWeight: 600,
                                padding: "1px 5px",
                                borderRadius: "3px",
                                backgroundColor:
                                  item.status === "active"
                                    ? "#e8f5e9"
                                    : item.status === "pending_renewal"
                                    ? "#fff3e0"
                                    : "#f5f5f5",
                                color:
                                  item.status === "active"
                                    ? "#2e7d32"
                                    : item.status === "pending_renewal"
                                    ? "#e65100"
                                    : "#616161",
                              }}
                            >
                              {item.status.toUpperCase()}
                            </span>
                          </div>
                          <div style={{ fontSize: "12px", color: "var(--md-sys-color-on-surface-variant, #5e5e5e)" }}>
                            {item.customerName} · {item.sla.tier}
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginTop: "4px",
                              fontSize: "12px",
                            }}
                          >
                            <span style={{ fontWeight: 600, color: "var(--copper-primary, #b87333)" }}>
                              {formatCurrencyNumber(item.value.annualValue)} {item.value.currency}
                            </span>
                            <button
                              type="button"
                              data-testid={`calendar-view-agreement-${item.id}`}
                              onClick={() => handleSelectAgreement(item)}
                              style={{
                                cursor: "pointer",
                                padding: "3px 8px",
                                borderRadius: "4px",
                                border: "1px solid var(--copper-primary, #b87333)",
                                background: "transparent",
                                color: "var(--copper-primary, #b87333)",
                                fontSize: "11px",
                                fontWeight: 600,
                              }}
                            >
                              {t("agreements.viewDetails", "Details →")}
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Facet 2: Agreements Grid */}
        {(activeTab === "all" || activeTab === "grid") && (
          <div
            data-testid="agreements-grid"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 600 }}>
                {t("agreements.activeAgreementsGrid", "Agreements Register")}
              </h3>
              <span style={{ fontSize: "13px", color: "var(--md-sys-color-on-surface-variant, #5e5e5e)" }}>
                {filteredAgreements.length} {t("agreements.records", "agreements")}
              </span>
            </div>

            <div
              style={{
                overflowX: "auto",
                border: "1px solid var(--md-sys-color-outline-variant, #e0e0e0)",
                borderRadius: "8px",
                backgroundColor: "var(--md-sys-color-surface, #ffffff)",
              }}
            >
              <table
                role="grid"
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "13px",
                  textAlign: "left",
                }}
              >
                <thead>
                  <tr
                    style={{
                      backgroundColor: "var(--md-sys-color-surface-variant, #f4f4f4)",
                      borderBottom: "1px solid var(--md-sys-color-outline-variant, #e0e0e0)",
                    }}
                  >
                    <th style={{ padding: "10px 14px", fontWeight: 600 }}>{t("agreements.agreementHeader", "Agreement")}</th>
                    <th style={{ padding: "10px 14px", fontWeight: 600 }}>{t("agreements.clientHeader", "Client")}</th>
                    <th style={{ padding: "10px 14px", fontWeight: 600 }}>{t("agreements.typeHeader", "Type")}</th>
                    <th style={{ padding: "10px 14px", fontWeight: 600 }}>{t("agreements.tierHeader", "SLA Tier")}</th>
                    <th style={{ padding: "10px 14px", fontWeight: 600 }}>{t("agreements.expiryHeader", "Expires")}</th>
                    <th style={{ padding: "10px 14px", fontWeight: 600, textAlign: "right" }}>{t("agreements.valueHeader", "ACV")}</th>
                    <th style={{ padding: "10px 14px", fontWeight: 600 }}>{t("agreements.statusHeader", "Status")}</th>
                    <th style={{ padding: "10px 14px", fontWeight: 600, textAlign: "right" }}>{t("agreements.actionsHeader", "Action")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAgreements.map((ag, idx) => (
                    <tr
                      key={ag.id}
                      style={{
                        borderBottom:
                          idx < filteredAgreements.length - 1
                            ? "1px solid var(--md-sys-color-outline-variant, #e0e0e0)"
                            : "none",
                      }}
                    >
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ fontWeight: 600 }}>{ag.name}</div>
                        <div style={{ fontSize: "11px", color: "var(--md-sys-color-on-surface-variant, #5e5e5e)", fontFamily: "monospace" }}>
                          {ag.id}
                        </div>
                      </td>
                      <td style={{ padding: "12px 14px" }}>{ag.customerName}</td>
                      <td style={{ padding: "12px 14px", textTransform: "capitalize" }}>{ag.type}</td>
                      <td style={{ padding: "12px 14px" }}>
                        <span
                          style={{
                            fontSize: "11px",
                            padding: "2px 6px",
                            backgroundColor: "rgba(58, 110, 106, 0.12)",
                            color: "var(--copper-secondary, #3a6e6a)",
                            borderRadius: "4px",
                            fontWeight: 600,
                          }}
                        >
                          {ag.sla.tier}
                        </span>
                      </td>
                      <td style={{ padding: "12px 14px" }}>{ag.term.endDate}</td>
                      <td
                        style={{
                          padding: "12px 14px",
                          textAlign: "right",
                          fontWeight: 600,
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {formatCurrencyNumber(ag.value.annualValue)} {ag.value.currency}
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 600,
                            padding: "2px 6px",
                            borderRadius: "4px",
                            backgroundColor:
                              ag.status === "active"
                                ? "#e8f5e9"
                                : ag.status === "pending_renewal"
                                ? "#fff3e0"
                                : "#f5f5f5",
                            color:
                              ag.status === "active"
                                ? "#2e7d32"
                                : ag.status === "pending_renewal"
                                ? "#e65100"
                                : "#616161",
                          }}
                        >
                          {ag.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: "12px 14px", textAlign: "right" }}>
                        <button
                          type="button"
                          data-testid={`view-agreement-${ag.id}`}
                          onClick={() => handleSelectAgreement(ag)}
                          style={{
                            cursor: "pointer",
                            padding: "4px 10px",
                            borderRadius: "4px",
                            border: "1px solid var(--copper-primary, #b87333)",
                            backgroundColor: "transparent",
                            color: "var(--copper-primary, #b87333)",
                            fontWeight: 600,
                            fontSize: "12px",
                          }}
                        >
                          {t("agreements.viewDetails", "Details →")}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </BaseLens>
  );
};
