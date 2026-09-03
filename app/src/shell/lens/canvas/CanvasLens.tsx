import React, { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { BaseLens } from "../BaseLens";
import type { CanvasLensProps } from "../types";
import { useDocumentStore } from "../../../store/documentStore";
import { findingRegistry, type Finding, normalizeEntityRef } from "../../finding";
import { toX6 } from "../../../projection/toX6";
import type { DesignDocument, Cable } from "../../../model/schema";
import { DesignDerivationsTray } from "./DesignDerivationsTray";

// Lazy-load CanvasView so that @antv/x6 is not evaluated when importing CanvasLens
const LazyCanvasView = React.lazy(() =>
  import("../../../views/canvas/CanvasView").then(m => ({ default: m.CanvasView }))
);

export type CanvasMode = "wiring" | "signal" | "control" | "power";

export interface ExtendedCanvasLensProps extends Omit<CanvasLensProps, "title"> {
  title?: React.ReactNode | undefined;
  document?: DesignDocument | null | undefined;
  activeMode?: CanvasMode | undefined;
  onModeChange?: ((mode: CanvasMode) => void) | undefined;
  onSelectEntity?: ((entityId: string) => void) | undefined;
}

function getFindingTargetId(finding: Finding): string | undefined {
  if (finding.entityRef) {
    const normalized = normalizeEntityRef(finding.entityRef);
    if (normalized?.id) return normalized.id;
  }
  if ((finding as any).entityId) return (finding as any).entityId;
  if ((finding as any).targetId) return (finding as any).targetId;
  return undefined;
}

function isDesignFacetFinding(finding: Finding): boolean {
  const producer = (finding.producerId || "").toLowerCase();
  const rule = (finding.rule || "").toLowerCase();
  const facet = ((finding as any).facet || "").toLowerCase();
  const category = ((finding as any).category || "").toLowerCase();

  if (facet === "design" || category === "design") return true;
  if (producer.includes("design") || producer.includes("m6") || producer.includes("system-design")) return true;
  if (rule.startsWith("rule-design") || rule.includes("audio-drop") || rule.includes("poe-budget") || rule.includes("cable") || rule.includes("channel")) return true;

  return false;
}

export function CanvasLens(props: ExtendedCanvasLensProps) {
  const { t } = useTranslation();
  const storeDocument = useDocumentStore(state => state.document);
  const document = props.document !== undefined ? props.document : storeDocument;

  const selectedIds = useDocumentStore(state => state.selectedIds) || [];
  const setSelectedIds = useDocumentStore(state => state.setSelectedIds);

  const initialMode = (props.mode || props.activeMode || "wiring").toLowerCase() as CanvasMode;
  const [activeMode, setActiveMode] = useState<CanvasMode>(initialMode);
  const [registryFindings, setRegistryFindings] = useState<Finding[]>(() => findingRegistry.getAllFindings());
  const [isTrayOpen, setIsTrayOpen] = useState(true);
  const [showFindings, setShowFindings] = useState(true);
  const [showDerivations, setShowDerivations] = useState(true);

  useEffect(() => {
    setRegistryFindings(findingRegistry.getAllFindings());
    const unsub = findingRegistry.subscribe(updated => {
      setRegistryFindings(updated);
    });
    return unsub;
  }, []);

  const handleModeChange = useCallback((newMode: CanvasMode) => {
    setActiveMode(newMode);
    props.onModeChange?.(newMode);
  }, [props]);

  // Derive active canvas entities from document
  const activeCanvasEntityIds = useMemo(() => {
    const set = new Set<string>();
    if (!document) return set;
    document.devices?.forEach(d => set.add(d.id));
    document.cables?.forEach(c => set.add(c.id));
    document.racks?.forEach(r => set.add(r.id));
    document.locations?.forEach(l => set.add(l.id));
    return set;
  }, [document]);

  // Filter findings: Design facet findings related to currently selected or active canvas entities
  const relevantFindings = useMemo(() => {
    return registryFindings.filter(finding => {
      if (!isDesignFacetFinding(finding)) return false;

      const targetId = getFindingTargetId(finding);
      if (!targetId) return false;

      // If entities are selected, filter specifically to selected entities
      if (selectedIds.length > 0) {
        return selectedIds.includes(targetId);
      }

      // If no entity is selected, filter to active canvas entities
      return activeCanvasEntityIds.has(targetId);
    }).sort((a, b) => {
      const rank = (sev: string) => {
        if (sev === "blocker") return 1;
        if (sev === "risk") return 2;
        return 3;
      };
      return rank(a.severity) - rank(b.severity);
    });
  }, [registryFindings, selectedIds, activeCanvasEntityIds]);

  // Compute X6 nodes and edges from document
  const { nodes, edges } = useMemo(() => {
    if (!document) return { nodes: [], edges: [] };
    const raw = toX6(document, {});
    
    // Enrich nodes with selection status
    const enrichedNodes = raw.nodes.map(n => ({
      ...n,
      data: {
        ...n.data,
        isSelected: selectedIds.includes(n.id),
      },
    }));

    // Filter edges according to activeMode (CL2 four-mode canvas)
    const filteredEdges = raw.edges.filter(e => {
      const cable = e.data?.cable as (Cable & { signalType?: string }) | undefined;
      const sig = (cable?.signalType || "").toUpperCase();
      const cType = (cable?.type || "").toLowerCase();
      const portKinds = (cable?.terminations || []).map(t => t.portRef.kind);
      const isPower =
        sig === "POWER" ||
        cType.includes("power") ||
        portKinds.includes("powerPort") ||
        portKinds.includes("powerOutlet");
      const isControl =
        sig === "CONTROL" ||
        cType.includes("control") ||
        portKinds.includes("consolePort");

      if (activeMode === "wiring") {
        return true; // Full schematic wiring
      }
      if (activeMode === "signal") {
        return !isPower && !isControl;
      }
      if (activeMode === "control") {
        return isControl;
      }
      if (activeMode === "power") {
        return isPower;
      }
      return true;
    });

    return { nodes: enrichedNodes, edges: filteredEdges };
  }, [document, selectedIds, activeMode]);

  const handleSelectEntity = useCallback((id: string) => {
    setSelectedIds([id]);
    props.onSelectEntity?.(id);
  }, [setSelectedIds, props]);

  const handleApplyFix = useCallback(async (e: React.MouseEvent, finding: Finding) => {
    e.stopPropagation();
    if (!finding.fix) return;
    try {
      await finding.fix.apply();
      findingRegistry.clearFinding(finding.id);
    } catch (err) {
      console.error(`Failed to apply fix for finding ${finding.id}:`, err);
    }
  }, []);

  const displayTitle =
    props.title ?? (document?.designLabel ? `${document.designLabel} — Schematic Canvas` : "System Design Canvas");

  const modeButtons = (
    <div
      className="copper-canvas-mode-switcher"
      data-testid="canvas-mode-switcher"
      style={{
        display: "inline-flex",
        alignItems: "center",
        background: "var(--copper-surface-container, #1e2022)",
        borderRadius: "8px",
        padding: "2px",
        border: "1px solid var(--copper-outline, #3b4045)",
      }}
    >
      {(["wiring", "signal", "control", "power"] as const).map(m => {
        const isActive = activeMode === m;
        const label = m.charAt(0).toUpperCase() + m.slice(1);
        return (
          <button
            key={m}
            type="button"
            data-testid={`canvas-mode-${m}`}
            data-active={String(isActive)}
            onClick={() => handleModeChange(m)}
            style={{
              padding: "6px 14px",
              borderRadius: "6px",
              border: "none",
              fontSize: "12px",
              fontWeight: isActive ? 600 : 400,
              cursor: "pointer",
              background: isActive ? "var(--copper-primary, #b87333)" : "transparent",
              color: isActive ? "var(--copper-on-primary, #ffffff)" : "var(--copper-on-surface-variant, #99a1ab)",
              transition: "all 0.15s ease",
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );

  return (
    <BaseLens
      {...props}
      title={displayTitle}
      subtitle={props.subtitle ?? t("canvas.lensSubtitle", "Interactive schematic block diagram & wiring")}
      lensKind="canvas"
      dataTestId={props.dataTestId ?? "lens-canvas"}
      actions={
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {modeButtons}
          {props.actions}
        </div>
      }
    >
      <div
        className="copper-canvas-lens-viewport"
        data-testid="canvas-lens-viewport"
        style={{
          width: "100%",
          height: "100%",
          minHeight: "450px",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Integrated CL2 Canvas (lazy-loaded for fast boot & safe test isolation) */}
        <div style={{ flex: 1, width: "100%", height: "100%", position: "relative" }}>
          <Suspense fallback={<div data-testid="canvas-loading">{t("canvas.loading", "Loading canvas...")}</div>}>
            <LazyCanvasView
              nodes={nodes}
              edges={edges}
              enableWiring={activeMode === "wiring"}
            />
          </Suspense>
        </div>

        {/* Bottom Trays Container (Derivations Tray alongside Validation Tray) */}
        <div
          className="copper-canvas-trays-container"
          data-testid="canvas-trays-container"
          style={{
            position: "absolute",
            bottom: 16,
            right: 16,
            display: "flex",
            flexDirection: "row-reverse",
            alignItems: "flex-end",
            gap: "12px",
            zIndex: 800,
            pointerEvents: "none",
            maxWidth: "calc(100vw - 32px)",
          }}
        >
          {/* Tray Dock Toggle Controls */}
          <div
            className="copper-tray-toggle-bar"
            data-testid="canvas-tray-toggle-bar"
            style={{
              position: "absolute",
              top: -36,
              right: 0,
              display: "flex",
              alignItems: "center",
              gap: "6px",
              pointerEvents: "auto",
              background: "var(--copper-surface-container, #1e2022)",
              padding: "3px 6px",
              borderRadius: "6px",
              border: "1px solid var(--copper-outline, #30363d)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
            }}
          >
            <button
              type="button"
              data-testid="tray-toggle-findings"
              onClick={() => setShowFindings(prev => !prev)}
              style={{
                padding: "3px 8px",
                borderRadius: "4px",
                border: "none",
                fontSize: "11px",
                fontWeight: 600,
                cursor: "pointer",
                background: showFindings ? "var(--copper-primary, #b87333)" : "transparent",
                color: showFindings ? "#ffffff" : "var(--copper-on-surface-variant, #99a1ab)",
              }}
            >
              {t("canvas.findingsToggle", `Findings (${relevantFindings.length})`)}
            </button>
            <button
              type="button"
              data-testid="tray-toggle-derivations"
              onClick={() => setShowDerivations(prev => !prev)}
              style={{
                padding: "3px 8px",
                borderRadius: "4px",
                border: "none",
                fontSize: "11px",
                fontWeight: 600,
                cursor: "pointer",
                background: showDerivations ? "var(--copper-secondary, #3a6e6a)" : "transparent",
                color: showDerivations ? "#ffffff" : "var(--copper-on-surface-variant, #99a1ab)",
              }}
            >
              {t("canvas.derivationsToggle", "Derivations")}
            </button>
          </div>

          {/* Validation Tray */}
          {showFindings && (
        <aside
          className="copper-canvas-validation-tray"
          data-testid="canvas-validation-tray"
          aria-label={t("canvas.validationTray", "Canvas Validation Tray")}
          style={{
            pointerEvents: "auto",
            width: "min(420px, calc(100vw - 32px))",
            maxHeight: "min(360px, calc(100vh - 140px))",
            background: "var(--copper-surface-container, #1f2328)",
            color: "var(--copper-on-surface, #e6edf3)",
            borderRadius: "8px",
            display: "flex",
            flexDirection: "column",
            border: "1px solid var(--copper-outline, #30363d)",
            boxShadow: "0 4px 16px rgba(0,0,0,0.35)",
            zIndex: 800,
            overflow: "hidden",
            fontSize: "12px",
          }}
        >
          <button
            type="button"
            onClick={() => setIsTrayOpen(prev => !prev)}
            aria-expanded={isTrayOpen}
            data-testid="canvas-tray-toggle"
            style={{
              padding: "10px 14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "var(--copper-surface-container-high, #2d333b)",
              border: "none",
              borderBottom: isTrayOpen ? "1px solid var(--copper-outline, #30363d)" : "none",
              color: "inherit",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span>{isTrayOpen ? "▼" : "▲"}</span>
              <span>{t("canvas.designFindings", "Design Findings")}</span>
              <span
                data-testid="findings-count"
                style={{
                  padding: "1px 8px",
                  borderRadius: "10px",
                  background: relevantFindings.length > 0 ? "var(--copper-primary, #b87333)" : "var(--copper-outline, #444)",
                  color: "#ffffff",
                  fontSize: "11px",
                }}
              >
                {relevantFindings.length}
              </span>
            </div>
            {selectedIds.length > 0 && (
              <span style={{ fontSize: "11px", color: "var(--copper-secondary, #3a6e6a)" }}>
                {t("canvas.entitySelected", `Selected: ${selectedIds.length}`)}
              </span>
            )}
          </button>

          {isTrayOpen && (
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "8px 12px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              {relevantFindings.length === 0 ? (
                <div style={{ padding: "16px 8px", textAlign: "center", color: "var(--copper-on-surface-variant, #8b949e)" }}>
                  {t("canvas.noFindings", "No design findings for active canvas entities")}
                </div>
              ) : (
                relevantFindings.map(finding => {
                  const targetId = getFindingTargetId(finding);
                  const isBlocker = finding.severity === "blocker";
                  const isRisk = finding.severity === "risk";
                  const badgeColor = isBlocker ? "#cf222e" : isRisk ? "#d29922" : "#57ab5a";

                  return (
                    <div
                      key={finding.id}
                      data-testid={`canvas-finding-${finding.id}`}
                      role="button"
                      tabIndex={0}
                      onClick={() => targetId && handleSelectEntity(targetId)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          if (targetId) handleSelectEntity(targetId);
                        }
                      }}
                      style={{
                        padding: "8px 10px",
                        background: "var(--copper-surface, #161b22)",
                        border: `1px solid ${selectedIds.includes(targetId || "") ? "var(--copper-primary, #b87333)" : "var(--copper-outline, #30363d)"}`,
                        borderRadius: "6px",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span
                            style={{
                              display: "inline-block",
                              width: "8px",
                              height: "8px",
                              borderRadius: "50%",
                              background: badgeColor,
                            }}
                          />
                          <span style={{ fontWeight: 600, fontSize: "11px", fontFamily: "monospace" }}>
                            {finding.rule}
                          </span>
                        </div>
                        {targetId && (
                          <span
                            style={{
                              fontSize: "10px",
                              padding: "1px 6px",
                              background: "var(--copper-surface-container, #21262d)",
                              borderRadius: "4px",
                              color: "var(--copper-on-surface-variant, #8b949e)",
                            }}
                          >
                            {targetId}
                          </span>
                        )}
                      </div>

                      <div style={{ color: "var(--copper-on-surface, #e6edf3)", fontSize: "11px" }}>
                        {finding.message}
                      </div>

                      {finding.fix && (
                        <div style={{ marginTop: "4px", display: "flex", justifyContent: "flex-end" }}>
                          <button
                            type="button"
                            data-testid={`finding-fix-${finding.id}`}
                            onClick={(e) => handleApplyFix(e, finding)}
                            style={{
                              padding: "3px 8px",
                              borderRadius: "4px",
                              background: "var(--copper-secondary-container, #1f3a37)",
                              color: "var(--copper-secondary, #3a6e6a)",
                              border: "1px solid var(--copper-secondary, #3a6e6a)",
                              fontSize: "10px",
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            {finding.fix.label}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </aside>
          )}

          {/* Design Derivations Tray */}
          {showDerivations && (
            <div style={{ pointerEvents: "auto" }}>
              <DesignDerivationsTray
                document={document}
                onSelectEntity={handleSelectEntity}
              />
            </div>
          )}
        </div>
      </div>
    </BaseLens>
  );
}
