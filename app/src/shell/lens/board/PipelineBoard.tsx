import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { BaseLens } from "../BaseLens";
import type { BaseLensProps } from "../types";
import { executeGovernedAction, createInitialActionState } from "../../action/envelope";
import { GovernedActionStatus } from "../../action/GovernedActionStatus";
import type { GovernedActionState } from "../../action/types";

export interface PipelineStage {
  id: string;
  label: string;
  order: number;
  probability?: number | undefined;
  color?: string | undefined;
}

export interface SalesOpportunity {
  id: string;
  title: string;
  customerId?: string | undefined;
  customerName?: string | undefined;
  value: number;
  currency?: string | undefined;
  stage: string;
  confidence?: number | undefined;
  expectedCloseDate?: string | undefined;
  owner?: string | undefined;
  tags?: string[] | undefined;
  quoteId?: string | undefined;
  updatedAt?: string | undefined;
  isPendingApproval?: boolean | undefined;
  approvalId?: string | undefined;
}

export interface PipelineStats {
  totalValue: number;
  weightedValue: number;
  count: number;
  wonCount: number;
  conversionRate: number;
}

export interface PipelineBoardProps extends Partial<BaseLensProps> {
  opportunities?: SalesOpportunity[] | undefined;
  initialOpportunities?: SalesOpportunity[] | undefined;
  stages?: PipelineStage[] | undefined;
  onMoveOpportunity?: ((opportunityId: string, targetStage: string, fromStage: string) => Promise<void> | void) | undefined;
  onSelectOpportunity?: ((opportunity: SalesOpportunity) => void) | undefined;
  fetchFn?: typeof fetch | undefined;
  actionUrl?: string | undefined;
  actionName?: string | undefined;
  stats?: PipelineStats | undefined;
  readOnly?: boolean | undefined;
  currency?: string | undefined;
}

export const DEFAULT_PIPELINE_STAGES: PipelineStage[] = [
  { id: "qualification", label: "Qualification", order: 1, probability: 0.2, color: "var(--copper-secondary, #3a6e6a)" },
  { id: "scoping", label: "Scoping & Discovery", order: 2, probability: 0.4, color: "#457b9d" },
  { id: "proposal", label: "Proposal & Quote", order: 3, probability: 0.6, color: "var(--copper-primary, #b87333)" },
  { id: "negotiation", label: "Negotiation", order: 4, probability: 0.8, color: "#e76f51" },
  { id: "won", label: "Closed Won", order: 5, probability: 1.0, color: "#2a9d8f" },
  { id: "lost", label: "Closed Lost", order: 6, probability: 0.0, color: "#6c757d" },
];

export const DEFAULT_SAMPLE_OPPORTUNITIES: SalesOpportunity[] = [
  {
    id: "opp-101",
    title: "City Hall Auditorium Overhaul",
    customerId: "cust-001",
    customerName: "Oslo Municipality",
    value: 125000,
    currency: "EUR",
    stage: "qualification",
    confidence: 0.25,
    expectedCloseDate: "2026-11-15",
    owner: "Kari Nordmann",
    tags: ["auditorium", "pro-audio", "video-wall"],
  },
  {
    id: "opp-102",
    title: "Broadcast Media Control Room",
    customerId: "cust-002",
    customerName: "Nordic Streaming AS",
    value: 240000,
    currency: "EUR",
    stage: "scoping",
    confidence: 0.45,
    expectedCloseDate: "2026-10-30",
    owner: "Ola Hansen",
    tags: ["broadcast", "smpte-2110", "intercom"],
  },
  {
    id: "opp-103",
    title: "Corporate HQ Hybrid Meeting Rooms (12x)",
    customerId: "cust-003",
    customerName: "Equinor Innovation Hub",
    value: 180000,
    currency: "EUR",
    stage: "proposal",
    confidence: 0.65,
    expectedCloseDate: "2026-09-28",
    owner: "Sindre Haugen",
    tags: ["teams-rooms", "mics", "dsp"],
  },
  {
    id: "opp-104",
    title: "University Hospital Simulation Suite",
    customerId: "cust-004",
    customerName: "Helse Sør-Øst",
    value: 310000,
    currency: "EUR",
    stage: "negotiation",
    confidence: 0.85,
    expectedCloseDate: "2026-09-15",
    owner: "Kari Nordmann",
    tags: ["medical-av", "low-latency", "recording"],
  },
  {
    id: "opp-105",
    title: "Concert Hall Acoustic Tuning & Line Arrays",
    customerId: "cust-005",
    customerName: "Bergen Philharmonic",
    value: 95000,
    currency: "EUR",
    stage: "won",
    confidence: 1.0,
    expectedCloseDate: "2026-08-20",
    owner: "Ola Hansen",
    tags: ["line-array", "dsp-matrix"],
  },
];

function formatCurrency(amount: number, currency = "EUR"): string {
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

export function PipelineBoard(props: PipelineBoardProps) {
  const { t } = useTranslation();

  const stages = useMemo(() => {
    const list = props.stages && props.stages.length > 0 ? props.stages : DEFAULT_PIPELINE_STAGES;
    return [...list].sort((a, b) => a.order - b.order);
  }, [props.stages]);

  const [opportunities, setOpportunities] = useState<SalesOpportunity[]>(() => {
    if (props.opportunities) return props.opportunities;
    if (props.initialOpportunities) return props.initialOpportunities;
    return DEFAULT_SAMPLE_OPPORTUNITIES;
  });

  useEffect(() => {
    if (props.opportunities) {
      setOpportunities(props.opportunities);
    }
  }, [props.opportunities]);

  const [dragOverStageId, setDragOverStageId] = useState<string | null>(null);
  const [draggedOppId, setDraggedOppId] = useState<string | null>(null);
  const [movingOppId, setMovingOppId] = useState<string | null>(null);
  const [actionState, setActionState] = useState<GovernedActionState<unknown>>(() =>
    createInitialActionState()
  );

  const defaultCurrency = props.currency || "EUR";

  const calculatedStats = useMemo<PipelineStats>(() => {
    if (props.stats) return props.stats;

    let totalValue = 0;
    let weightedValue = 0;
    let wonCount = 0;

    for (const opp of opportunities) {
      totalValue += opp.value;
      const prob = opp.confidence !== undefined ? opp.confidence : 0.5;
      weightedValue += opp.value * prob;
      if (opp.stage === "won") {
        wonCount += 1;
      }
    }

    const count = opportunities.length;
    const conversionRate = count > 0 ? (wonCount / count) * 100 : 0;

    return {
      totalValue,
      weightedValue,
      count,
      wonCount,
      conversionRate,
    };
  }, [opportunities, props.stats]);

  const handleMoveStage = useCallback(
    async (opportunityId: string, targetStage: string) => {
      const opp = opportunities.find((o) => o.id === opportunityId);
      if (!opp || opp.stage === targetStage) return;

      const fromStage = opp.stage;
      const action = props.actionName || "sales.opportunity.move-stage";
      const url = props.actionUrl || `/api/sales/opportunities/${opportunityId}/stage`;

      setMovingOppId(opportunityId);

      try {
        const responseState = await executeGovernedAction<unknown, Record<string, unknown>>(
          {
            action,
            url,
            method: "POST",
            params: {
              opportunityId,
              fromStage,
              toStage: targetStage,
            },
          },
          {
            fetchFn: props.fetchFn,
            onStatusChange: (_status, updatedState) => {
              setActionState(updatedState);
            },
            onPendingApproval: (approvalId) => {
              setOpportunities((prev) =>
                prev.map((o) =>
                  o.id === opportunityId
                    ? { ...o, isPendingApproval: true, approvalId }
                    : o
                )
              );
            },
            onResolved: () => {
              setOpportunities((prev) =>
                prev.map((o) =>
                  o.id === opportunityId
                    ? { ...o, stage: targetStage, isPendingApproval: false, approvalId: undefined }
                    : o
                )
              );
            },
          }
        );

        setActionState(responseState);

        if (responseState.isResolved) {
          setOpportunities((prev) =>
            prev.map((o) =>
              o.id === opportunityId
                ? { ...o, stage: targetStage, isPendingApproval: false, approvalId: undefined }
                : o
            )
          );
        } else if (responseState.isPendingApproval) {
          setOpportunities((prev) =>
            prev.map((o) =>
              o.id === opportunityId
                ? { ...o, isPendingApproval: true, approvalId: responseState.approvalId }
                : o
            )
          );
        }

        await props.onMoveOpportunity?.(opportunityId, targetStage, fromStage);
      } catch (err: unknown) {
        console.error("Governed stage move failed:", err);
      } finally {
        setMovingOppId(null);
      }
    },
    [opportunities, props]
  );

  const handleDragStart = (e: React.DragEvent, opp: SalesOpportunity) => {
    e.dataTransfer.setData("text/plain", opp.id);
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({ opportunityId: opp.id, fromStage: opp.stage })
    );
    e.dataTransfer.effectAllowed = "move";
    setDraggedOppId(opp.id);
  };

  const handleDragEnd = () => {
    setDraggedOppId(null);
    setDragOverStageId(null);
  };

  const handleDrop = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    setDragOverStageId(null);
    let oppId = e.dataTransfer.getData("text/plain");
    if (!oppId) {
      try {
        const json = JSON.parse(e.dataTransfer.getData("application/json")) as {
          opportunityId?: string;
          id?: string;
        };
        oppId = json?.opportunityId || json?.id || "";
      } catch {
        oppId = "";
      }
    }
    if (oppId) {
      void handleMoveStage(oppId, stageId);
    }
  };

  const boardTitle = props.title ?? t("sales.pipelineBoard", "Sales Pipeline Board");
  const boardBadge =
    props.badge ?? `${calculatedStats.count} ${t("sales.opportunities", "opportunities")}`;

  return (
    <BaseLens
      {...props}
      title={boardTitle}
      lensKind="board"
      badge={boardBadge}
      dataTestId={props.dataTestId || "pipeline-board"}
      className={`copper-pipeline-board ${props.className || ""}`.trim()}
    >
      <div className="copper-pipeline-container" style={{ display: "flex", flexDirection: "column", height: "100%", gap: "16px" }}>
        {actionState && !actionState.isIdle && (
          <div className="copper-pipeline-action-status" data-testid="pipeline-action-status">
            <GovernedActionStatus
              state={actionState}
              actionName={props.actionName || "sales.opportunity.move-stage"}
            />
          </div>
        )}

        <div
          className="copper-pipeline-stats-bar"
          data-testid="pipeline-stats-bar"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "12px",
            padding: "12px 16px",
            backgroundColor: "var(--copper-surface-container, var(--md-sys-color-surface-container))",
            borderRadius: "8px",
            border: "1px solid var(--copper-outline-variant, var(--md-sys-color-outline-variant))",
          }}
        >
          <div className="copper-pipeline-stat-item" data-testid="stat-total-value">
            <div style={{ fontSize: "11px", color: "var(--md-sys-color-on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {t("sales.totalValue", "Total Pipeline")}
            </div>
            <div className="tabular-nums" style={{ fontSize: "18px", fontWeight: 700, color: "var(--copper-primary, var(--md-sys-color-primary))" }}>
              {formatCurrency(calculatedStats.totalValue, defaultCurrency)}
            </div>
          </div>

          <div className="copper-pipeline-stat-item" data-testid="stat-weighted-value">
            <div style={{ fontSize: "11px", color: "var(--md-sys-color-on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {t("sales.weightedValue", "Weighted Value")}
            </div>
            <div className="tabular-nums" style={{ fontSize: "18px", fontWeight: 700, color: "var(--copper-secondary, var(--md-sys-color-secondary))" }}>
              {formatCurrency(calculatedStats.weightedValue, defaultCurrency)}
            </div>
          </div>

          <div className="copper-pipeline-stat-item" data-testid="stat-opp-count">
            <div style={{ fontSize: "11px", color: "var(--md-sys-color-on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {t("sales.totalOpportunities", "Opportunities")}
            </div>
            <div className="tabular-nums" style={{ fontSize: "18px", fontWeight: 700 }}>
              {calculatedStats.count}
            </div>
          </div>

          <div className="copper-pipeline-stat-item" data-testid="stat-win-rate">
            <div style={{ fontSize: "11px", color: "var(--md-sys-color-on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {t("sales.winRate", "Win Rate")}
            </div>
            <div className="tabular-nums" style={{ fontSize: "18px", fontWeight: 700 }}>
              {calculatedStats.conversionRate.toFixed(1)}%
            </div>
          </div>
        </div>

        <div
          className="copper-board-columns"
          data-testid="pipeline-board-columns"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${stages.length}, minmax(260px, 1fr))`,
            gap: "16px",
            flex: 1,
            minHeight: "420px",
            overflowX: "auto",
            alignItems: "start",
          }}
        >
          {stages.map((stage) => {
            const columnOpps = opportunities.filter((o) => o.stage === stage.id);
            const stageValue = columnOpps.reduce((acc, curr) => acc + curr.value, 0);
            const isDragOver = dragOverStageId === stage.id;

            return (
              <div
                key={stage.id}
                data-testid={`stage-column-${stage.id}`}
                data-stage-id={stage.id}
                className={`copper-board-column ${isDragOver ? "copper-column-drag-over" : ""}`}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  backgroundColor: isDragOver
                    ? "var(--copper-surface-container-highest, var(--md-sys-color-surface-container-highest))"
                    : "var(--copper-surface-container-low, var(--md-sys-color-surface-container-low))",
                  borderRadius: "8px",
                  border: `1px solid ${isDragOver ? "var(--copper-primary, #b87333)" : "var(--copper-outline-variant, var(--md-sys-color-outline-variant))"}`,
                  padding: "12px",
                  gap: "12px",
                  minHeight: "360px",
                  transition: "background-color 150ms ease, border-color 150ms ease",
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  if (dragOverStageId !== stage.id) {
                    setDragOverStageId(stage.id);
                  }
                }}
                onDragLeave={(e) => {
                  if (e.currentTarget.contains(e.relatedTarget as Node)) return;
                  setDragOverStageId(null);
                }}
                onDrop={(e) => handleDrop(e, stage.id)}
              >
                <div
                  className="copper-board-column-header"
                  data-testid={`column-header-${stage.id}`}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                    borderBottom: "1px solid var(--copper-outline-variant, var(--md-sys-color-outline-variant))",
                    paddingBottom: "8px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span
                        className="copper-board-stage-dot"
                        style={{
                          width: "10px",
                          height: "10px",
                          borderRadius: "50%",
                          backgroundColor: stage.color || "var(--copper-primary, #b87333)",
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ fontWeight: 600, fontSize: "14px" }}>
                        {stage.label}
                      </span>
                    </div>
                    <span
                      className="copper-board-column-count-badge tabular-nums"
                      data-testid={`column-count-${stage.id}`}
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        padding: "2px 6px",
                        borderRadius: "10px",
                        backgroundColor: "var(--copper-surface-container-high, var(--md-sys-color-surface-container-high))",
                        color: "var(--md-sys-color-on-surface-variant)",
                      }}
                    >
                      {columnOpps.length}
                    </span>
                  </div>

                  <div
                    className="copper-board-column-value tabular-nums"
                    data-testid={`column-value-${stage.id}`}
                    style={{ fontSize: "12px", color: "var(--md-sys-color-on-surface-variant)", fontWeight: 500 }}
                  >
                    {formatCurrency(stageValue, defaultCurrency)}
                  </div>
                </div>

                <div
                  className="copper-board-column-cards"
                  style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}
                >
                  {columnOpps.length === 0 ? (
                    <div
                      className="copper-board-column-empty"
                      data-testid={`column-empty-${stage.id}`}
                      style={{
                        padding: "24px 12px",
                        textAlign: "center",
                        fontSize: "12px",
                        color: "var(--md-sys-color-on-surface-variant)",
                        border: "1px dashed var(--copper-outline-variant, var(--md-sys-color-outline-variant))",
                        borderRadius: "6px",
                      }}
                    >
                      {t("sales.noOpportunitiesInStage", "No opportunities")}
                    </div>
                  ) : (
                    columnOpps.map((opp) => {
                      const isMoving = movingOppId === opp.id;
                      const isDragging = draggedOppId === opp.id;

                      return (
                        <div
                          key={opp.id}
                          data-testid={`opportunity-card-${opp.id}`}
                          data-opportunity-id={opp.id}
                          data-stage-id={opp.stage}
                          className={`copper-opportunity-card ${isMoving ? "copper-card-moving" : ""} ${opp.isPendingApproval ? "copper-card-pending-approval" : ""}`}
                          draggable={!props.readOnly}
                          onDragStart={(e) => handleDragStart(e, opp)}
                          onDragEnd={handleDragEnd}
                          onClick={() => props.onSelectOpportunity?.(opp)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              props.onSelectOpportunity?.(opp);
                            }
                          }}
                          tabIndex={0}
                          role="button"
                          aria-label={`${opp.title}, ${formatCurrency(opp.value, opp.currency || defaultCurrency)}`}
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px",
                            padding: "12px",
                            backgroundColor: "var(--copper-surface, var(--md-sys-color-surface))",
                            borderRadius: "6px",
                            border: opp.isPendingApproval
                              ? "1px solid var(--copper-primary, #b87333)"
                              : "1px solid var(--copper-outline-variant, var(--md-sys-color-outline-variant))",
                            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.12)",
                            cursor: props.readOnly ? "default" : "grab",
                            opacity: isDragging ? 0.4 : isMoving ? 0.7 : 1,
                            transition: "box-shadow 150ms ease, opacity 150ms ease",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
                            <span
                              className="copper-opportunity-title"
                              style={{ fontWeight: 600, fontSize: "13px", lineHeight: "1.3" }}
                            >
                              {opp.title}
                            </span>
                            {opp.isPendingApproval && (
                              <span
                                className="copper-pending-badge"
                                data-testid={`pending-approval-badge-${opp.id}`}
                                style={{
                                  fontSize: "10px",
                                  fontWeight: 700,
                                  textTransform: "uppercase",
                                  letterSpacing: "0.04em",
                                  padding: "2px 6px",
                                  borderRadius: "4px",
                                  backgroundColor: "var(--copper-primary-container, #ffdcc1)",
                                  color: "var(--copper-on-primary-container, #2e1500)",
                                  flexShrink: 0,
                                }}
                              >
                                {t("action.pendingApproval", "Pending")}
                              </span>
                            )}
                          </div>

                          {opp.customerName && (
                            <div
                              className="copper-opportunity-customer"
                              data-testid={`opportunity-customer-${opp.id}`}
                              style={{ fontSize: "12px", color: "var(--md-sys-color-on-surface-variant)" }}
                            >
                              {opp.customerName}
                            </div>
                          )}

                          <div
                            className="copper-opportunity-meta-row"
                            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "2px" }}
                          >
                            <span
                              className="copper-opportunity-value tabular-nums"
                              data-testid={`opportunity-value-${opp.id}`}
                              style={{ fontWeight: 700, fontSize: "14px", color: "var(--copper-primary, var(--md-sys-color-primary))" }}
                            >
                              {formatCurrency(opp.value, opp.currency || defaultCurrency)}
                            </span>

                            {opp.confidence !== undefined && (
                              <span
                                className="copper-opportunity-confidence tabular-nums"
                                data-testid={`opportunity-confidence-${opp.id}`}
                                style={{
                                  fontSize: "11px",
                                  fontWeight: 600,
                                  padding: "2px 6px",
                                  borderRadius: "4px",
                                  backgroundColor: "var(--copper-surface-container-high, var(--md-sys-color-surface-container-high))",
                                  color: "var(--md-sys-color-on-surface-variant)",
                                }}
                              >
                                {Math.round(opp.confidence * 100)}%
                              </span>
                            )}
                          </div>

                          {opp.tags && opp.tags.length > 0 && (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "4px" }}>
                              {opp.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="copper-opportunity-tag"
                                  style={{
                                    fontSize: "10px",
                                    padding: "1px 5px",
                                    borderRadius: "3px",
                                    backgroundColor: "var(--copper-surface-container, var(--md-sys-color-surface-container))",
                                    color: "var(--md-sys-color-on-surface-variant)",
                                  }}
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          <div
                            className="copper-opportunity-actions"
                            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "6px", paddingTop: "6px", borderTop: "1px solid var(--copper-outline-variant, var(--md-sys-color-outline-variant))" }}
                            >
                            <label
                              htmlFor={`stage-select-${opp.id}`}
                              style={{ fontSize: "11px", color: "var(--md-sys-color-on-surface-variant)" }}
                            >
                              {t("sales.stage", "Stage")}:
                            </label>
                            <select
                              id={`stage-select-${opp.id}`}
                              data-testid={`move-stage-select-${opp.id}`}
                              value={opp.stage}
                              disabled={props.readOnly || isMoving}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => void handleMoveStage(opp.id, e.target.value)}
                              style={{
                                fontSize: "11px",
                                padding: "2px 6px",
                                borderRadius: "4px",
                                border: "1px solid var(--copper-outline-variant, var(--md-sys-color-outline-variant))",
                                backgroundColor: "var(--copper-surface-container-low, var(--md-sys-color-surface-container-low))",
                                color: "var(--md-sys-color-on-surface)",
                              }}
                            >
                              {stages.map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </BaseLens>
  );
}

