/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions, i18next/no-literal-string */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { CanvasLens } from "./CanvasLens";
import { EntityLens } from "../EntityLens";
import { useDocumentStore } from "../../../store/documentStore";
import { findingRegistry, type FindingProducer } from "../../finding";
import type { DesignDocument } from "../../../model/schema";
import "../../../locales/i18n";

// Mock CanvasView so X6 does not require full SVG canvas APIs in jsdom
vi.mock("../../../views/canvas/CanvasView", () => ({
  CanvasView: ({ nodes = [], edges = [], enableWiring = false }: any) => (
    <div
      data-testid="canvas-view"
      data-nodes-count={nodes.length}
      data-edges-count={edges.length}
      data-enable-wiring={String(enableWiring)}
    >
      <div data-testid="canvas-nodes-list">
        {nodes.map((n: any) => (
          <div
            key={n.id}
            data-testid={`canvas-node-${n.id}`}
            data-selected={String(n.data?.isSelected ?? false)}
            onClick={() => useDocumentStore.getState().setSelectedIds([n.id])}
          >
            {n.data?.device?.name || n.id}
          </div>
        ))}
      </div>
    </div>
  ),
}));

const sampleDoc: DesignDocument = {
  schemaVersion: 1,
  designLabel: "Alpha Testing Hall",
  revision: "rev-1",
  sites: [{ id: "site-1", name: "Main Campus", slug: "main-campus" }],
  locations: [{ id: "room-101", name: "Lecture Hall A", slug: "lecture-hall-a", siteId: "site-1" }],
  racks: [
    {
      id: "rack-1",
      name: "AV Rack 01",
      locationId: "room-101",
      siteId: "site-1",
      status: "planned",
      uHeight: 42,
    },
  ],
  deviceTypes: [
    {
      id: "dt-amp",
      model: "AMP-4400",
      manufacturer: "CopperTech",
      slug: "amp-4400",
      uHeight: 2,
      isFullDepth: true,
    },
    {
      id: "dt-dsp",
      model: "DSP-128",
      manufacturer: "CopperTech",
      slug: "dsp-128",
      uHeight: 1,
      isFullDepth: true,
    },
  ],
  devices: [
    {
      id: "dev-dsp-1",
      name: "Primary DSP",
      deviceTypeId: "dt-dsp",
      siteId: "site-1",
      status: "planned",
      interfaces: [{ id: "if-lan1", name: "LAN1", type: "1000base-t" }],
    },
    {
      id: "dev-amp-1",
      name: "Zone Amplifier",
      deviceTypeId: "dt-amp",
      siteId: "site-1",
      status: "planned",
      interfaces: [{ id: "if-dante", name: "DANTE", type: "1000base-t" }],
    },
    {
      id: "dev-ctrl-1",
      name: "Touch Controller",
      deviceTypeId: "dt-dsp",
      siteId: "site-1",
      status: "planned",
      interfaces: [{ id: "if-ctrl", name: "CTRL", type: "1000base-t" }],
    },
  ],
  cables: [
    {
      id: "cable-sig-1",
      status: "planned",
      type: "cat6",
      signalType: "DANTE",
      terminations: [
        { deviceId: "dev-dsp-1", portRef: { kind: "interface", name: "LAN1" } },
        { deviceId: "dev-amp-1", portRef: { kind: "interface", name: "DANTE" } },
      ],
    } as any,
    {
      id: "cable-ctrl-1",
      status: "planned",
      type: "cat6",
      signalType: "CONTROL",
      terminations: [
        { deviceId: "dev-ctrl-1", portRef: { kind: "interface", name: "CTRL" } },
        { deviceId: "dev-dsp-1", portRef: { kind: "interface", name: "LAN1" } },
      ],
    } as any,
    {
      id: "cable-pwr-1",
      status: "planned",
      type: "power",
      signalType: "POWER",
      terminations: [
        { deviceId: "dev-amp-1", portRef: { kind: "powerPort", name: "AC_IN" } },
        { deviceId: "dev-ctrl-1", portRef: { kind: "powerPort", name: "DC_IN" } },
      ],
    } as any,
  ],
  signalClasses: [],
  zones: [],
};

describe("Batch 162 (EN.W1) — Canvas Lens as Lens-Kind Shell", () => {
  beforeEach(() => {
    findingRegistry.clearAll();
    useDocumentStore.getState().reset();
    useDocumentStore.getState().loadDocument(sampleDoc);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("proves CanvasLens mounts and integrates the CL2 canvas with four modes", async () => {
    const user = userEvent.setup();
    render(
      <CanvasLens
        title="Auditorium Schematic"
        subtitle="M6 System Design Canvas"
        badge={<span data-testid="lens-badge">Active</span>}
      />
    );

    // Conforms to lens-kind shell structure established in B135
    const lensEl = screen.getByTestId("lens-canvas");
    expect(lensEl).toBeDefined();
    expect(lensEl.getAttribute("data-lens-kind")).toBe("canvas");
    expect(screen.getByText("Auditorium Schematic")).toBeDefined();
    expect(screen.getByText("M6 System Design Canvas")).toBeDefined();
    expect(screen.getByTestId("lens-badge")).toBeDefined();

    // Renders integrated CL2 canvas view (via Suspense)
    const canvasView = await screen.findByTestId("canvas-view");
    expect(canvasView).toBeDefined();

    // Four-mode canvas controls are present: Wiring, Signal, Control, Power
    const wiringBtn = screen.getByTestId("canvas-mode-wiring");
    const signalBtn = screen.getByTestId("canvas-mode-signal");
    const controlBtn = screen.getByTestId("canvas-mode-control");
    const powerBtn = screen.getByTestId("canvas-mode-power");

    expect(wiringBtn).toBeDefined();
    expect(signalBtn).toBeDefined();
    expect(controlBtn).toBeDefined();
    expect(powerBtn).toBeDefined();

    // Default mode is wiring (all cables shown, wiring enabled)
    expect(wiringBtn.getAttribute("data-active")).toBe("true");
    expect(canvasView.getAttribute("data-enable-wiring")).toBe("true");
    expect(canvasView.getAttribute("data-edges-count")).toBe("3");

    // Switching to Signal mode filters to signal cables
    await user.click(signalBtn);
    expect(signalBtn.getAttribute("data-active")).toBe("true");
    expect(canvasView.getAttribute("data-edges-count")).toBe("1");

    // Switching to Control mode filters to control cables
    await user.click(controlBtn);
    expect(controlBtn.getAttribute("data-active")).toBe("true");
    expect(canvasView.getAttribute("data-edges-count")).toBe("1");

    // Switching to Power mode filters to power cables
    await user.click(powerBtn);
    expect(powerBtn.getAttribute("data-active")).toBe("true");
    expect(canvasView.getAttribute("data-edges-count")).toBe("1");
  });

  it("proves canvas selection properly syncs with global documentStore", async () => {
    const user = userEvent.setup();
    render(<CanvasLens />);

    // Initially no entities selected
    expect(useDocumentStore.getState().selectedIds).toEqual([]);

    // Wait for canvas nodes to be ready
    const dspNode = await screen.findByTestId("canvas-node-dev-dsp-1");
    expect(dspNode.getAttribute("data-selected")).toBe("false");

    await user.click(dspNode);

    // Global store selection is updated
    expect(useDocumentStore.getState().selectedIds).toEqual(["dev-dsp-1"]);
    expect(dspNode.getAttribute("data-selected")).toBe("true");

    // External change to documentStore syncs into CanvasLens
    useDocumentStore.getState().setSelectedIds(["dev-amp-1"]);

    await waitFor(() => {
      const ampNode = screen.getByTestId("canvas-node-dev-amp-1");
      expect(ampNode.getAttribute("data-selected")).toBe("true");
      expect(dspNode.getAttribute("data-selected")).toBe("false");
    });
  });

  it("proves the validation tray displays relevant findings from global registry filtering for Design facet and active/selected entities", async () => {
    const user = userEvent.setup();

    // Register findings from multiple producers (System Design M6 vs Procurement M1)
    const designProducer: FindingProducer = {
      id: "engine-system-design",
      name: "System Design Engine",
      findings: [
        {
          id: "f-design-amp",
          severity: "blocker",
          rule: "RULE-DESIGN-AUDIO-DROP",
          message: "Voltage drop exceeds 10% on amplifier line",
          entityRef: { type: "DEVICE", id: "dev-amp-1" },
          producerId: "engine-system-design",
          fix: {
            id: "fix-amp-wire",
            label: "Increase wire gauge",
            apply: () => {
              findingRegistry.clearFinding("f-design-amp");
            },
          },
        },
        {
          id: "f-design-dsp",
          severity: "risk",
          rule: "RULE-DESIGN-POE-BUDGET",
          message: "PoE allocation at 92% of budget",
          entityRef: { type: "DEVICE", id: "dev-dsp-1" },
          producerId: "engine-system-design",
        },
        {
          id: "f-design-unrelated",
          severity: "advice",
          rule: "RULE-DESIGN-FAN-NOISE",
          message: "Consider acoustic baffle for remote rack",
          entityRef: { type: "RACK", id: "rack-remote-999" }, // Not in this canvas
          producerId: "engine-system-design",
        },
      ],
    };

    const procurementProducer: FindingProducer = {
      id: "engine-procurement",
      name: "Procurement Engine",
      findings: [
        {
          id: "f-proc-mismatch",
          severity: "blocker",
          rule: "RULE-3WAY-MATCH-MISMATCH",
          message: "Invoice mismatch on PO Line",
          entityRef: { type: "PO_LINE", id: "pol-10" },
          producerId: "engine-procurement",
        },
      ],
    };

    findingRegistry.registerProducer(designProducer);
    findingRegistry.registerProducer(procurementProducer);

    render(<CanvasLens />);

    // Validation tray is mounted inside CanvasLens
    const tray = screen.getByTestId("canvas-validation-tray");
    expect(tray).toBeDefined();

    // Procurement finding should NOT appear in canvas validation tray
    expect(screen.queryByText("RULE-3WAY-MATCH-MISMATCH")).toBeNull();

    // Remote rack finding not in canvas should NOT appear in active canvas entities filter
    expect(screen.queryByText("RULE-DESIGN-FAN-NOISE")).toBeNull();

    // Active canvas design findings are displayed
    expect(screen.getByText("RULE-DESIGN-AUDIO-DROP")).toBeDefined();
    expect(screen.getByText("RULE-DESIGN-POE-BUDGET")).toBeDefined();

    // Select dev-amp-1: validation tray specifically filters to dev-amp-1 findings
    useDocumentStore.getState().setSelectedIds(["dev-amp-1"]);

    await waitFor(() => {
      expect(screen.getByText("RULE-DESIGN-AUDIO-DROP")).toBeDefined();
      expect(screen.queryByText("RULE-DESIGN-POE-BUDGET")).toBeNull();
    });

    // Applying fix resolves finding
    const fixBtn = screen.getByTestId("finding-fix-f-design-amp");
    await user.click(fixBtn);

    await waitFor(() => {
      expect(screen.queryByText("RULE-DESIGN-AUDIO-DROP")).toBeNull();
    });
  });

  it("proves EntityLens mounts CanvasLens based on view mode", async () => {
    // 1. Without canvas view mode: renders standard EntityLens
    const { unmount } = render(
      <MemoryRouter initialEntries={["/e/ROOM/room-101"]}>
        <Routes>
          <Route path="/e/:type/:id" element={<EntityLens />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId("lens-entity")).toBeDefined();
    expect(screen.queryByTestId("lens-canvas")).toBeNull();
    unmount();

    // 2. With view=canvas query parameter: mounts CanvasLens
    render(
      <MemoryRouter initialEntries={["/e/ROOM/room-101?view=canvas"]}>
        <Routes>
          <Route path="/e/:type/:id" element={<EntityLens />} />
        </Routes>
      </MemoryRouter>
    );

    const canvasLens = screen.getByTestId("lens-canvas");
    expect(canvasLens).toBeDefined();
    expect(canvasLens.getAttribute("data-lens-kind")).toBe("canvas");
    const canvasView = await screen.findByTestId("canvas-view");
    expect(canvasView).toBeDefined();
  });
});
