import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useDocumentStore } from "../../../store/documentStore";
import { useBOM, useReferenceDesignators, type BOMItem } from "../../../store/selectors/derived";
import type { DesignDocument } from "../../../model/schema";

export interface DesignDerivationsTrayProps {
  document?: DesignDocument | null | undefined;
  bom?: BOMItem[] | undefined;
  referenceDesignators?: Record<string, string> | undefined;
  isOpen?: boolean | undefined;
  onToggle?: (() => void) | undefined;
  className?: string | undefined;
  defaultTab?: "bom" | "cables" | "designators" | undefined;
  onSelectEntity?: ((entityId: string) => void) | undefined;
}

export function DesignDerivationsTray(props: DesignDerivationsTrayProps) {
  const { t } = useTranslation();
  const storeDocument = useDocumentStore(state => state.document);
  const document = props.document !== undefined ? props.document : storeDocument;

  const hookBOM = useBOM();
  const bom = props.bom !== undefined ? props.bom : hookBOM;

  const hookDesignators = useReferenceDesignators();
  const referenceDesignators = props.referenceDesignators !== undefined ? props.referenceDesignators : hookDesignators;

  const [internalIsOpen, setInternalIsOpen] = useState(true);
  const isOpen = props.isOpen !== undefined ? props.isOpen : internalIsOpen;
  const handleToggle = props.onToggle || (() => setInternalIsOpen(prev => !prev));

  const [activeTab, setActiveTab] = useState<"bom" | "cables" | "designators">(props.defaultTab || "bom");

  // Strictly source cable length from physical routing (lengthM).
  // Enforces the core domain rule: schematic length does not exist, only routed physical length does.
  const cableRows = useMemo(() => {
    if (!document || !document.cables) return [];
    const devMap = new Map(document.devices?.map(d => [d.id, d.name ?? d.id]) || []);

    return document.cables.map(cable => {
      const srcId = cable.terminations?.[0]?.deviceId;
      const tgtId = cable.terminations?.[1]?.deviceId;
      const sourcePort = cable.terminations?.[0]?.portRef?.name || "—";
      const targetPort = cable.terminations?.[1]?.portRef?.name || "—";
      const sourceDev = srcId ? (devMap.get(srcId) || srcId) : "—";
      const targetDev = tgtId ? (devMap.get(tgtId) || tgtId) : "—";

      // Routed length is the ONLY source of length displayed in the cable schedule.
      // Any schematic property (like cable.length) or 2D Euclidean canvas fallback is strictly ignored.
      const routedLengthM = cable.lengthM;

      return {
        id: cable.id,
        cableId: cable.id.length > 8 ? cable.id.substring(0, 8) : cable.id,
        sourceDev,
        sourcePort,
        targetDev,
        targetPort,
        type: cable.type || "—",
        routedLengthM,
      };
    });
  }, [document]);

  const deviceList = useMemo(() => {
    if (!document || !document.devices) return [];
    const dtMap = new Map(document.deviceTypes?.map(dt => [dt.id, (dt as any).name || (dt as any).model || dt.id]) || []);
    return document.devices.map(d => ({
      id: d.id,
      name: d.name || d.id,
      typeName: dtMap.get(d.deviceTypeId) || d.deviceTypeId,
      designator: referenceDesignators[d.id] || "—",
    }));
  }, [document, referenceDesignators]);

  return (
    <aside
      className={`copper-design-derivations-tray ${props.className || ""}`}
      data-testid="design-derivations-tray"
      aria-label={t("canvas.designDerivationsTray", "Design Derivations Tray")}
      style={{
        width: "min(460px, calc(100vw - 32px))",
        maxHeight: "min(380px, calc(100vh - 140px))",
        background: "var(--copper-surface-container, #1f2328)",
        color: "var(--copper-on-surface, #e6edf3)",
        borderRadius: "8px",
        display: "flex",
        flexDirection: "column",
        border: "1px solid var(--copper-outline, #30363d)",
        boxShadow: "0 4px 16px rgba(0,0,0,0.35)",
        overflow: "hidden",
        fontSize: "12px",
      }}
    >
      {/* Tray Header */}
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={isOpen}
        data-testid="derivations-tray-toggle"
        style={{
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "var(--copper-surface-container-high, #2d333b)",
          border: "none",
          borderBottom: isOpen ? "1px solid var(--copper-outline, #30363d)" : "none",
          color: "inherit",
          cursor: "pointer",
          fontWeight: 600,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span>{isOpen ? "▼" : "▲"}</span>
          <span>{t("canvas.derivationsTitle", "Design Derivations")}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span
            style={{
              padding: "1px 6px",
              borderRadius: "10px",
              background: "var(--copper-secondary, #3a6e6a)",
              color: "#ffffff",
              fontSize: "10px",
            }}
          >
            {t("canvas.bomCount", `BOM: ${bom.length}`)}
          </span>
          <span
            style={{
              padding: "1px 6px",
              borderRadius: "10px",
              background: "var(--copper-primary, #b87333)",
              color: "#ffffff",
              fontSize: "10px",
            }}
          >
            {t("canvas.cablesCount", `Cables: ${cableRows.length}`)}
          </span>
        </div>
      </button>

      {isOpen && (
        <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
          {/* Tab Navigation */}
          <div
            style={{
              display: "flex",
              borderBottom: "1px solid var(--copper-outline, #30363d)",
              background: "var(--copper-surface, #161b22)",
            }}
          >
            <button
              type="button"
              data-testid="derivations-tab-bom"
              onClick={() => setActiveTab("bom")}
              style={{
                flex: 1,
                padding: "8px 10px",
                border: "none",
                background: activeTab === "bom" ? "var(--copper-surface-container, #1f2328)" : "transparent",
                color: activeTab === "bom" ? "var(--copper-primary, #b87333)" : "var(--copper-on-surface-variant, #8b949e)",
                fontWeight: activeTab === "bom" ? 600 : 400,
                borderBottom: activeTab === "bom" ? "2px solid var(--copper-primary, #b87333)" : "2px solid transparent",
                cursor: "pointer",
                fontSize: "11px",
              }}
            >
              {t("canvas.tabBOM", "Live BOM")} ({bom.length})
            </button>
            <button
              type="button"
              data-testid="derivations-tab-cables"
              onClick={() => setActiveTab("cables")}
              style={{
                flex: 1,
                padding: "8px 10px",
                border: "none",
                background: activeTab === "cables" ? "var(--copper-surface-container, #1f2328)" : "transparent",
                color: activeTab === "cables" ? "var(--copper-primary, #b87333)" : "var(--copper-on-surface-variant, #8b949e)",
                fontWeight: activeTab === "cables" ? 600 : 400,
                borderBottom: activeTab === "cables" ? "2px solid var(--copper-primary, #b87333)" : "2px solid transparent",
                cursor: "pointer",
                fontSize: "11px",
              }}
            >
              {t("canvas.tabCables", "Cable Schedule")} ({cableRows.length})
            </button>
            <button
              type="button"
              data-testid="derivations-tab-designators"
              onClick={() => setActiveTab("designators")}
              style={{
                flex: 1,
                padding: "8px 10px",
                border: "none",
                background: activeTab === "designators" ? "var(--copper-surface-container, #1f2328)" : "transparent",
                color: activeTab === "designators" ? "var(--copper-primary, #b87333)" : "var(--copper-on-surface-variant, #8b949e)",
                fontWeight: activeTab === "designators" ? 600 : 400,
                borderBottom: activeTab === "designators" ? "2px solid var(--copper-primary, #b87333)" : "2px solid transparent",
                cursor: "pointer",
                fontSize: "11px",
              }}
            >
              {t("canvas.tabDesignators", "Ref Designators")} ({deviceList.length})
            </button>
          </div>

          {/* Tab Content Container */}
          <div style={{ flex: 1, overflowY: "auto", padding: "8px 12px", minHeight: 0 }}>
            {/* 1. Live BOM Tab */}
            {activeTab === "bom" && (
              <div data-testid="derivations-bom-content">
                {bom.length === 0 ? (
                  <div style={{ padding: "16px 8px", textAlign: "center", color: "var(--copper-on-surface-variant, #8b949e)" }}>
                    {t("canvas.noBOM", "No BOM items derived")}
                  </div>
                ) : (
                  <table
                    data-testid="derivations-bom-table"
                    style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "11px" }}
                  >
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--copper-outline, #30363d)", color: "var(--copper-on-surface-variant, #8b949e)" }}>
                        <th style={{ padding: "6px 8px" }}>{t("common.manufacturer", "Manufacturer")}</th>
                        <th style={{ padding: "6px 8px" }}>{t("common.item", "Model / Item")}</th>
                        <th style={{ padding: "6px 8px", textAlign: "right" }}>{t("common.quantity", "Qty")}</th>
                        <th style={{ padding: "6px 8px" }}>{t("common.designators", "Designators")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bom.map((item, idx) => (
                        <tr
                          key={item.deviceTypeId || idx}
                          data-testid={`derivations-bom-row-${item.deviceTypeId}`}
                          style={{ borderBottom: "1px solid var(--copper-outline, #21262d)" }}
                        >
                          <td style={{ padding: "6px 8px", fontWeight: 500 }}>{item.manufacturer || "—"}</td>
                          <td style={{ padding: "6px 8px" }}>{item.name}</td>
                          <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: 600 }}>{item.quantity}</td>
                          <td style={{ padding: "6px 8px", color: "var(--copper-secondary, #3a6e6a)", fontFamily: "monospace" }}>
                            {item.designators && item.designators.length > 0 ? item.designators.join(", ") : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* 2. Cable Schedule Tab */}
            {activeTab === "cables" && (
              <div data-testid="derivations-cables-content">
                {cableRows.length === 0 ? (
                  <div style={{ padding: "16px 8px", textAlign: "center", color: "var(--copper-on-surface-variant, #8b949e)" }}>
                    {t("canvas.noCables", "No cables in schedule")}
                  </div>
                ) : (
                  <table
                    data-testid="derivations-cables-table"
                    style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "11px" }}
                  >
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--copper-outline, #30363d)", color: "var(--copper-on-surface-variant, #8b949e)" }}>
                        <th style={{ padding: "6px 8px" }}>{t("common.cableId", "Cable ID")}</th>
                        <th style={{ padding: "6px 8px" }}>{t("common.source", "Source")}</th>
                        <th style={{ padding: "6px 8px" }}>{t("common.target", "Target")}</th>
                        <th style={{ padding: "6px 8px" }}>{t("common.type", "Type")}</th>
                        <th style={{ padding: "6px 8px", textAlign: "right" }}>{t("common.routedLength", "Routed Length")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cableRows.map(row => (
                        <tr
                          key={row.id}
                          data-testid={`derivations-cable-row-${row.id}`}
                          style={{ borderBottom: "1px solid var(--copper-outline, #21262d)" }}
                        >
                          <td style={{ padding: "6px 8px", fontWeight: 600, fontFamily: "monospace" }}>{row.cableId}</td>
                          <td style={{ padding: "6px 8px" }}>{row.sourceDev}:{row.sourcePort}</td>
                          <td style={{ padding: "6px 8px" }}>{row.targetDev}:{row.targetPort}</td>
                          <td style={{ padding: "6px 8px", color: "var(--copper-on-surface-variant, #8b949e)" }}>{row.type}</td>
                          <td
                            data-testid={`cable-length-${row.id}`}
                            style={{
                              padding: "6px 8px",
                              textAlign: "right",
                              fontWeight: row.routedLengthM !== undefined ? 600 : 400,
                              color: row.routedLengthM !== undefined ? "var(--copper-primary, #b87333)" : "var(--copper-on-surface-variant, #8b949e)",
                            }}
                          >
                            {row.routedLengthM !== undefined ? `${row.routedLengthM}m` : "— (Unrouted)"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* 3. Reference Designators Tab */}
            {activeTab === "designators" && (
              <div data-testid="derivations-designators-content">
                {deviceList.length === 0 ? (
                  <div style={{ padding: "16px 8px", textAlign: "center", color: "var(--copper-on-surface-variant, #8b949e)" }}>
                    {t("canvas.noDesignators", "No reference designators derived")}
                  </div>
                ) : (
                  <table
                    data-testid="derivations-designators-table"
                    style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "11px" }}
                  >
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--copper-outline, #30363d)", color: "var(--copper-on-surface-variant, #8b949e)" }}>
                        <th style={{ padding: "6px 8px" }}>{t("common.designator", "Designator")}</th>
                        <th style={{ padding: "6px 8px" }}>{t("common.device", "Device Name")}</th>
                        <th style={{ padding: "6px 8px" }}>{t("common.deviceType", "Type")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deviceList.map(dev => (
                        <tr
                          key={dev.id}
                          data-testid={`derivations-designator-row-${dev.id}`}
                          onClick={() => props.onSelectEntity?.(dev.id)}
                          style={{
                            borderBottom: "1px solid var(--copper-outline, #21262d)",
                            cursor: props.onSelectEntity ? "pointer" : "default",
                          }}
                        >
                          <td
                            data-testid={`designator-${dev.id}`}
                            style={{
                              padding: "6px 8px",
                              fontWeight: 600,
                              fontFamily: "monospace",
                              color: "var(--copper-secondary, #3a6e6a)",
                            }}
                          >
                            {dev.designator}
                          </td>
                          <td style={{ padding: "6px 8px", fontWeight: 500 }}>{dev.name}</td>
                          <td style={{ padding: "6px 8px", color: "var(--copper-on-surface-variant, #8b949e)" }}>{dev.typeName}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
