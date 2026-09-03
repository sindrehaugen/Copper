/* eslint-disable i18next/no-literal-string */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DesignDerivationsTray } from "./DesignDerivationsTray";
import { CanvasLens } from "./CanvasLens";
import { useDocumentStore } from "../../../store/documentStore";
import type { DesignDocument } from "../../../model/schema";
import "../../../locales/i18n";

// Mock CanvasView so X6 does not require SVG canvas APIs in jsdom
vi.mock("../../../views/canvas/CanvasView", () => ({
  CanvasView: () => <div data-testid="canvas-view">Canvas View Mock</div>,
}));

const mockDoc: DesignDocument = {
  schemaVersion: 1,
  designLabel: "Engineering Hall B",
  revision: "rev-2",
  sites: [{ id: "site-1", name: "Campus Central", slug: "campus-central" }],
  locations: [{ id: "loc-1", name: "Control Room", slug: "control-room", siteId: "site-1" }],
  racks: [],
  deviceTypes: [
    {
      id: "dt-amp",
      name: "Amplifier",
      model: "AMP-800",
      manufacturer: "Dynacord",
      slug: "amp-800",
      uHeight: 2,
      isFullDepth: true,
      pricing: { msrp: 1200 },
    } as any,
    {
      id: "dt-spk",
      name: "Speaker",
      model: "SPK-12",
      manufacturer: "ElectroVoice",
      slug: "spk-12",
      uHeight: 1,
      isFullDepth: false,
      pricing: { msrp: 450 },
    } as any,
  ],
  devices: [
    {
      id: "dev-amp-1",
      name: "Main Amp 1",
      deviceTypeId: "dt-amp",
      siteId: "site-1",
      status: "planned",
      interfaces: [{ id: "if-1", name: "OUT1", type: "speaker" }],
    },
    {
      id: "dev-amp-2",
      name: "Main Amp 2",
      deviceTypeId: "dt-amp",
      siteId: "site-1",
      status: "planned",
      interfaces: [{ id: "if-2", name: "OUT1", type: "speaker" }],
    },
    {
      id: "dev-spk-1",
      name: "Lobby Speaker",
      deviceTypeId: "dt-spk",
      siteId: "site-1",
      status: "planned",
      interfaces: [{ id: "if-in", name: "IN", type: "speaker" }],
    },
  ],
  cables: [
    {
      id: "cable-routed-1",
      status: "planned",
      type: "speaker-12awg",
      lengthM: 42, // Physical routed length computed by spatial routing
      length: 999, // Schematic fallback - MUST BE IGNORED
      terminations: [
        { deviceId: "dev-amp-1", portRef: { kind: "interface", name: "OUT1" } },
        { deviceId: "dev-spk-1", portRef: { kind: "interface", name: "IN" } },
      ],
    } as any,
    {
      id: "cable-unrouted-1",
      status: "planned",
      type: "speaker-12awg",
      // lengthM is undefined (unrouted)
      length: 150, // Schematic fallback - MUST BE IGNORED
      terminations: [
        { deviceId: "dev-amp-2", portRef: { kind: "interface", name: "OUT1" } },
        { deviceId: "dev-spk-1", portRef: { kind: "interface", name: "IN" } },
      ],
    } as any,
  ],
  geometry: {
    "dev-amp-1": { position: { x: 0, y: 0 } },
    "dev-spk-1": { position: { x: 300, y: 400 } }, // Euclidean schematic distance = 5m - MUST BE IGNORED
    "dev-amp-2": { position: { x: 0, y: 0 } },
  } as any,
  signalClasses: [],
  zones: [],
};

describe("Batch 163 (EN.W2) — Design Derivations Tray", () => {
  beforeEach(() => {
    useDocumentStore.getState().reset();
    useDocumentStore.getState().loadDocument(mockDoc);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("proves DesignDerivationsTray correctly consumes and displays the BOM and Reference Designators from CL2 hooks", async () => {
    const user = userEvent.setup();
    render(<DesignDerivationsTray />);

    // Derivations tray is rendered
    const tray = screen.getByTestId("design-derivations-tray");
    expect(tray).toBeDefined();

    // Derivations tab buttons are present
    const bomTabBtn = screen.getByTestId("derivations-tab-bom");
    const designatorsTabBtn = screen.getByTestId("derivations-tab-designators");
    expect(bomTabBtn).toBeDefined();
    expect(designatorsTabBtn).toBeDefined();

    // 1. Live BOM is rendered (consumed via useBOM)
    // Amp has quantity 2, Ev speaker has quantity 1
    const bomTable = screen.getByTestId("derivations-bom-table");
    expect(bomTable).toBeDefined();
    expect(screen.getByText("Dynacord")).toBeDefined();
    expect(screen.getByText("ElectroVoice")).toBeDefined();
    expect(screen.getByText("Amplifier")).toBeDefined();
    expect(screen.getByText("Speaker")).toBeDefined();

    // BOM displays reference designators derived from useReferenceDesignators
    // DT name starts with "AM" for Amp (AM-01, AM-02) and "SP" for Speaker (SP-01)
    expect(screen.getByText(/AM-01/)).toBeDefined();
    expect(screen.getByText(/AM-02/)).toBeDefined();
    expect(screen.getByText(/SP-01/)).toBeDefined();

    // 2. Switch to Reference Designators tab
    await user.click(designatorsTabBtn);
    const designatorsTable = screen.getByTestId("derivations-designators-table");
    expect(designatorsTable).toBeDefined();

    // Device IDs and their generated reference designators are listed
    expect(screen.getByTestId("designator-dev-amp-1").textContent).toBe("AM-01");
    expect(screen.getByTestId("designator-dev-amp-2").textContent).toBe("AM-02");
    expect(screen.getByTestId("designator-dev-spk-1").textContent).toBe("SP-01");
  });

  it("proves the Cable Schedule strictly sources length from physical routing (rejecting schematic fallbacks)", async () => {
    const user = userEvent.setup();
    render(<DesignDerivationsTray />);

    // Switch to Cable Schedule tab
    const cablesTabBtn = screen.getByTestId("derivations-tab-cables");
    await user.click(cablesTabBtn);

    const cablesTable = screen.getByTestId("derivations-cables-table");
    expect(cablesTable).toBeDefined();

    // Cable 1: Physically routed with lengthM = 42
    // Must display 42m (or 42)
    // MUST NOT display schematic length 999 or Euclidean schematic distance 5m
    const lengthCellRouted = screen.getByTestId("cable-length-cable-routed-1");
    expect(lengthCellRouted.textContent).toContain("42");
    expect(lengthCellRouted.textContent).not.toContain("999");
    expect(lengthCellRouted.textContent).not.toContain("5m");

    // Cable 2: Unrouted (lengthM is undefined)
    // Schematic length is 150, but schematic length DOES NOT EXIST in physical cable schedule
    // MUST NOT display 150 or any Euclidean geometry fallback
    const lengthCellUnrouted = screen.getByTestId("cable-length-cable-unrouted-1");
    expect(lengthCellUnrouted.textContent).toMatch(/—|unrouted|n\/a/i);
    expect(lengthCellUnrouted.textContent).not.toContain("150");
  });

  it("proves CanvasLens mounts DesignDerivationsTray alongside findings tray and allows toggling between or viewing both", async () => {
    const user = userEvent.setup();
    render(<CanvasLens />);

    // Derivations tray is mounted in CanvasLens
    const derivationsTray = await screen.findByTestId("design-derivations-tray");
    expect(derivationsTray).toBeDefined();

    // Validation tray is also present
    const validationTray = screen.getByTestId("canvas-validation-tray");
    expect(validationTray).toBeDefined();

    // Tray toggle controls allow switching between or viewing both
    const toggleDerivations = screen.getByTestId("tray-toggle-derivations");
    const toggleFindings = screen.getByTestId("tray-toggle-findings");
    expect(toggleDerivations).toBeDefined();
    expect(toggleFindings).toBeDefined();

    // Derivations tab button works inside CanvasLens
    const cablesTab = screen.getByTestId("derivations-tab-cables");
    await user.click(cablesTab);
    expect(screen.getByTestId("derivations-cables-table")).toBeDefined();
    expect(screen.getByTestId("cable-length-cable-routed-1").textContent).toContain("42");
  });
});
