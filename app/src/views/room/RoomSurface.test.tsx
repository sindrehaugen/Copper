import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { RoomSurface, type RoomSurfaceData } from "./RoomSurface";
import { EntityLens } from "../../shell/lens/EntityLens";
import "../../locales/i18n";

describe("RoomSurface & EntityLens Room Integration (Batch 156 / SP.W2)", () => {
  afterEach(() => {
    cleanup();
  });

  const mockFullRoomData: RoomSurfaceData = {
    roomId: "loc-room-101",
    roomName: "Main Boardroom A",
    siteName: "Oslo HQ",
    buildingName: "Building 1",
    floorName: "Floor 2",
    dimensions: {
      widthM: 8.5,
      lengthM: 6.0,
      heightM: 3.0,
      areaSqm: 51.0,
    },
    capacity: 20,
    design: {
      designId: "des-boardroom-101",
      designLabel: "Boardroom Dual-Display AV Design",
      deviceCount: 14,
      rackCount: 1,
      cableCount: 28,
      status: "active",
      signalClasses: ["HDMI", "Dante", "Control", "100V"],
      lastModified: "2026-09-01T14:30:00Z",
    },
    assets: [
      {
        id: "ast-dsp-01",
        name: "Q-SYS Core 110f",
        model: "Core 110f",
        manufacturer: "QSC",
        status: "active",
        serialNumber: "QSC-998811",
        rackPosition: "Rack-A U10",
      },
      {
        id: "ast-disp-01",
        name: "Samsung QM85C",
        model: "QM85C 85-inch Display",
        manufacturer: "Samsung",
        status: "active",
        serialNumber: "SAM-442211",
        rackPosition: "Front Wall",
      },
    ],
    tickets: [
      {
        id: "tkt-8041",
        title: "Microphone array buzzing on Channel 3",
        priority: "high",
        status: "open",
        assignedTo: "Lars Hansen",
        createdAt: "2026-09-02T08:15:00Z",
      },
      {
        id: "tkt-8012",
        title: "Scheduled quarterly laser projector filter clean",
        priority: "low",
        status: "pending",
        assignedTo: "Kari Nordmann",
        createdAt: "2026-08-28T11:00:00Z",
      },
    ],
    sla: {
      status: "healthy",
      tier: "Platinum 24/7",
      targetResponseTimeHours: 2,
      currentResponseTimeHours: 0.5,
      uptimePercent: 99.98,
      nextBreachDeadline: "2026-09-04T12:00:00Z",
    },
    telemetry: {
      status: "healthy",
      temperatureC: 21.8,
      humidityPercent: 44,
      powerDrawWatts: 680,
      onlineDeviceCount: 14,
      totalDeviceCount: 14,
      lastPing: "2026-09-03T01:20:00Z",
    },
    documents: [
      {
        id: "doc-01",
        title: "Boardroom Audio Signal Flow & As-Built",
        filename: "boardroom-asbuilt-v2.pdf",
        fileType: "PDF",
        sizeBytes: 4200000,
        updatedAt: "2026-08-30",
        category: "Schematic",
        url: "https://docs.copper.local/room101-asbuilt.pdf",
      },
    ],
    spend: {
      currency: "EUR",
      totalBudget: 45000,
      totalSpend: 39500,
      committedSpend: 2500,
      variance: 3000,
      breakdown: [
        {
          id: "sp-01",
          category: "Hardware",
          description: "Displays, DSP & Microphones",
          amount: 32000,
        },
        {
          id: "sp-02",
          category: "Installation",
          description: "Cabling and Commissioning",
          amount: 7500,
        },
      ],
    },
    history: [
      {
        id: "hist-01",
        timestamp: "2026-09-01T14:30:00Z",
        title: "Design version 2.1 promoted to active",
        description: "Added second 85-inch confidence monitor and Dante beamforming mic",
        actor: { name: "Sindre Haugen" },
        status: "completed",
      },
    ],
  };

  it("renders the RoomSurface with all core facets (Design, Assets, Tickets, SLA, Telemetry, Documents, Spend, History)", () => {
    render(
      <MemoryRouter>
        <RoomSurface data={mockFullRoomData} roomId="loc-room-101" />
      </MemoryRouter>
    );

    // Main surface container
    expect(screen.getByTestId("room-surface")).toBeDefined();
    expect(screen.getByText(/Main Boardroom A/i)).toBeDefined();
    expect(screen.getByText(/Oslo HQ/i)).toBeDefined();

    // 1. Core Facet: Design
    expect(screen.getByTestId("facet-room-design")).toBeDefined();
    expect(screen.getByText(/Boardroom Dual-Display AV Design/i)).toBeDefined();
    expect(screen.getByTestId("room-design-device-count").textContent).toContain("14");
    expect(screen.getByTestId("room-design-cable-count").textContent).toContain("28");

    // 2. Core Facet: Assets
    expect(screen.getByTestId("facet-room-assets")).toBeDefined();
    expect(screen.getByText(/Q-SYS Core 110f/i)).toBeDefined();
    expect(screen.getByText(/Samsung QM85C/i)).toBeDefined();
    expect(screen.getByText(/QSC-998811/i)).toBeDefined();

    // 3. Core Facet: Tickets
    expect(screen.getByTestId("facet-room-tickets")).toBeDefined();
    expect(screen.getByText(/Microphone array buzzing on Channel 3/i)).toBeDefined();
    expect(screen.getByText(/Scheduled quarterly laser projector filter clean/i)).toBeDefined();
    expect(screen.getByTestId("ticket-priority-tkt-8041").textContent).toMatch(/high/i);

    // 4. Core Facet: SLA
    expect(screen.getByTestId("facet-room-sla")).toBeDefined();
    expect(screen.getByText(/Platinum 24\/7/i)).toBeDefined();
    expect(screen.getByTestId("room-sla-uptime").textContent).toContain("99.98%");
    expect(screen.getByTestId("room-sla-status").textContent).toMatch(/healthy/i);

    // 5. Telemetry
    expect(screen.getByTestId("facet-room-telemetry")).toBeDefined();
    expect(screen.getByText(/21.8/i)).toBeDefined();
    expect(screen.getByText(/680/i)).toBeDefined();

    // 6. Documents
    expect(screen.getByTestId("facet-room-documents")).toBeDefined();
    expect(screen.getByText(/Boardroom Audio Signal Flow & As-Built/i)).toBeDefined();

    // 7. Spend
    expect(screen.getByTestId("facet-room-spend")).toBeDefined();
    expect(screen.getByTestId("room-spend-total")).toBeDefined();

    // 8. History
    expect(screen.getByTestId("facet-room-history")).toBeDefined();
    expect(screen.getByText(/Design version 2.1 promoted to active/i)).toBeDefined();
  });

  it("proves facets degrade gracefully when required engine context or data is missing", () => {
    const degradedData: RoomSurfaceData = {
      roomId: "loc-room-sparse-02",
      roomName: "Small Huddle 02",
      design: null,
      assets: null,
      tickets: null,
      sla: null,
      telemetry: null,
      documents: null,
      spend: null,
      history: null,
    };

    render(
      <MemoryRouter>
        <RoomSurface data={degradedData} roomId="loc-room-sparse-02" />
      </MemoryRouter>
    );

    expect(screen.getByTestId("room-surface")).toBeDefined();
    expect(screen.getByText(/Small Huddle 02/i)).toBeDefined();

    // Degraded cards or honest empty indicators are rendered
    expect(screen.getByTestId("facet-room-design-degraded")).toBeDefined();
    expect(screen.getByTestId("facet-room-assets-degraded")).toBeDefined();
    expect(screen.getByTestId("facet-room-tickets-degraded")).toBeDefined();
    expect(screen.getByTestId("facet-room-sla-degraded")).toBeDefined();
    expect(screen.getByTestId("facet-room-telemetry-degraded")).toBeDefined();
    expect(screen.getByTestId("facet-room-documents-degraded")).toBeDefined();
    expect(screen.getByTestId("facet-room-spend-degraded")).toBeDefined();
    expect(screen.getByTestId("facet-room-history-degraded")).toBeDefined();
  });

  it("proves capability gating hides or disables facets whose engine capability is absent", () => {
    // Only design and assets capability enabled
    const restrictedData: RoomSurfaceData = {
      ...mockFullRoomData,
      capabilities: ["m6.design", "m9.assets"],
    };

    render(
      <MemoryRouter>
        <RoomSurface data={restrictedData} roomId="loc-room-101" capabilities={["m6.design", "m9.assets"]} />
      </MemoryRouter>
    );

    // Active facets
    expect(screen.getByTestId("facet-room-design")).toBeDefined();
    expect(screen.getByTestId("facet-room-assets")).toBeDefined();

    // Missing capability facets degrade gracefully
    expect(screen.getByTestId("facet-room-tickets-degraded")).toBeDefined();
    expect(screen.getByTestId("facet-room-sla-degraded")).toBeDefined();
  });

  it("integrates into EntityLens so /e/FUNCTIONAL_LOCATION/:id renders RoomSurface when level is room", () => {
    render(
      <MemoryRouter initialEntries={["/e/FUNCTIONAL_LOCATION/room-auditorium-01?level=room"]}>
        <Routes>
          <Route path="/e/:type/:id" element={<EntityLens />} />
        </Routes>
      </MemoryRouter>
    );

    const lensEl = screen.getByTestId("lens-entity");
    expect(lensEl).toBeDefined();

    // Room surface must be mounted inside the EntityLens
    expect(screen.getByTestId("room-surface")).toBeDefined();
    expect(screen.getByTestId("facet-room-design")).toBeDefined();
  });

  it("integrates into EntityLens with explicit level='room' or type='ROOM'", () => {
    render(
      <MemoryRouter initialEntries={["/e/ROOM/conf-room-200"]}>
        <Routes>
          <Route path="/e/:type/:id" element={<EntityLens />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId("room-surface")).toBeDefined();
  });
});
