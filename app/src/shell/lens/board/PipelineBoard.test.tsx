import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { PipelineBoard, DEFAULT_PIPELINE_STAGES, type SalesOpportunity } from "./PipelineBoard";
import { EntityLens } from "../EntityLens";
import "../../../locales/i18n";

const TEST_OPPORTUNITIES: SalesOpportunity[] = [
  {
    id: "opp-test-1",
    title: "Auditorium DSP & Microphones",
    customerId: "cust-01",
    customerName: "City University",
    value: 50000,
    currency: "EUR",
    stage: "qualification",
    confidence: 0.3,
    tags: ["audio", "mics"],
  },
  {
    id: "opp-test-2",
    title: "Executive Boardroom Video Wall",
    customerId: "cust-02",
    customerName: "Nordic Bank HQ",
    value: 120000,
    currency: "EUR",
    stage: "proposal",
    confidence: 0.6,
    tags: ["led-wall", "teams"],
  },
  {
    id: "opp-test-3",
    title: "Concert Hall PA System",
    customerId: "cust-03",
    customerName: "Symphony Hall",
    value: 200000,
    currency: "EUR",
    stage: "won",
    confidence: 1.0,
    tags: ["pa", "line-array"],
  },
];

describe("Batch 165 (EN.W4) — Pipeline Board Lens", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("proves PipelineBoard renders columns and opportunity cards correctly", () => {
    render(
      <PipelineBoard
        opportunities={TEST_OPPORTUNITIES}
        title="Custom Sales Pipeline"
      />
    );

    // 1. Board shell & BaseLens conformance
    const boardEl = screen.getByTestId("pipeline-board");
    expect(boardEl).toBeDefined();
    expect(boardEl.getAttribute("data-lens-kind")).toBe("board");
    expect(screen.getByText("Custom Sales Pipeline")).toBeDefined();

    // 2. Columns representation for all stages
    for (const stage of DEFAULT_PIPELINE_STAGES) {
      const colEl = screen.getByTestId(`stage-column-${stage.id}`);
      expect(colEl).toBeDefined();
      const colHeader = screen.getByTestId(`column-header-${stage.id}`);
      expect(colHeader).toBeDefined();
      expect(within(colHeader).getByText(stage.label)).toBeDefined();
    }

    // 3. Card counts and stage values
    expect(screen.getByTestId("column-count-qualification").textContent).toBe("1");
    expect(screen.getByTestId("column-count-proposal").textContent).toBe("1");
    expect(screen.getByTestId("column-count-won").textContent).toBe("1");
    expect(screen.getByTestId("column-count-scoping").textContent).toBe("0");

    // 4. Cards render with titles, customer names, values, and tags
    const card1 = screen.getByTestId("opportunity-card-opp-test-1");
    expect(card1).toBeDefined();
    expect(screen.getByText("Auditorium DSP & Microphones")).toBeDefined();
    expect(screen.getByText("City University")).toBeDefined();
    expect(screen.getByTestId("opportunity-value-opp-test-1").textContent).toContain("50,000");
    expect(screen.getByText("audio")).toBeDefined();
    expect(screen.getByText("mics")).toBeDefined();

    const card2 = screen.getByTestId("opportunity-card-opp-test-2");
    expect(card2).toBeDefined();
    expect(screen.getByText("Executive Boardroom Video Wall")).toBeDefined();
    expect(screen.getByText("Nordic Bank HQ")).toBeDefined();
    expect(screen.getByTestId("opportunity-value-opp-test-2").textContent).toContain("120,000");

    // 5. Summary Stats Bar
    const statsBar = screen.getByTestId("pipeline-stats-bar");
    expect(statsBar).toBeDefined();
    expect(screen.getByTestId("stat-total-value").textContent).toContain("370,000");
    expect(screen.getByTestId("stat-opp-count").textContent).toContain("3");
  });

  it("proves that moving an opportunity between stages dispatches a governed action", async () => {
    let capturedRequest: any = null;
    const mockFetch = vi.fn().mockImplementation(async (url: string, init: any) => {
      capturedRequest = {
        url,
        method: init?.method,
        body: init?.body ? JSON.parse(init.body) : null,
        headers: init?.headers,
      };

      return {
        ok: true,
        status: 200,
        headers: {
          get: (name: string) => (name.toLowerCase() === "content-type" ? "application/json" : null),
        },
        json: async () => ({
          status: 200,
          data: { success: true },
        }),
        text: async () => JSON.stringify({ status: 200, data: { success: true } }),
      };
    });

    const onMoveSpy = vi.fn();

    render(
      <PipelineBoard
        opportunities={TEST_OPPORTUNITIES}
        fetchFn={mockFetch as any}
        onMoveOpportunity={onMoveSpy}
      />
    );

    // Initial state: opp-test-1 is in qualification
    expect(screen.getByTestId("column-count-qualification").textContent).toBe("1");
    expect(screen.getByTestId("column-count-negotiation").textContent).toBe("0");

    // Move opp-test-1 to 'negotiation' stage via accessible stage control
    const stageSelect = screen.getByTestId("move-stage-select-opp-test-1") as HTMLSelectElement;
    expect(stageSelect.value).toBe("qualification");

    fireEvent.change(stageSelect, { target: { value: "negotiation" } });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    // Verify governed action envelope was dispatched correctly
    expect(capturedRequest).not.toBeNull();
    expect(capturedRequest.url).toContain("/api/sales/opportunities/opp-test-1/stage");
    expect(capturedRequest.method).toBe("POST");
    expect(capturedRequest.body.action).toBe("sales.opportunity.move-stage");
    expect(capturedRequest.body.idempotency_key).toBeDefined();
    expect(capturedRequest.body.actor).toBeDefined();
    expect(capturedRequest.body.params).toEqual({
      opportunityId: "opp-test-1",
      fromStage: "qualification",
      toStage: "negotiation",
    });

    // Verify external handler notified
    expect(onMoveSpy).toHaveBeenCalledWith("opp-test-1", "negotiation", "qualification");

    // Verify UI updated: card moved to negotiation column
    await waitFor(() => {
      expect(screen.getByTestId("column-count-qualification").textContent).toBe("0");
      expect(screen.getByTestId("column-count-negotiation").textContent).toBe("1");
    });
  });

  it("proves HTML5 drag and drop stage move dispatches governed action", async () => {
    let capturedRequest: any = null;
    const mockFetch = vi.fn().mockImplementation(async (url: string, init: any) => {
      capturedRequest = {
        url,
        method: init?.method,
        body: init?.body ? JSON.parse(init.body) : null,
      };
      return {
        ok: true,
        status: 200,
        headers: {
          get: (name: string) => (name.toLowerCase() === "content-type" ? "application/json" : null),
        },
        json: async () => ({ status: 200, data: { ok: true } }),
        text: async () => JSON.stringify({ status: 200, data: { ok: true } }),
      };
    });

    render(
      <PipelineBoard
        opportunities={TEST_OPPORTUNITIES}
        fetchFn={mockFetch as any}
      />
    );

    const card = screen.getByTestId("opportunity-card-opp-test-2");
    const targetColumn = screen.getByTestId("stage-column-won");

    // Simulate drag start on opp-test-2 (currently in proposal)
    const dataTransfer = {
      setData: vi.fn(),
      getData: vi.fn().mockReturnValue("opp-test-2"),
      effectAllowed: "move",
      dropEffect: "move",
    };

    fireEvent.dragStart(card, { dataTransfer });
    fireEvent.dragOver(targetColumn, { dataTransfer });
    fireEvent.drop(targetColumn, { dataTransfer });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    expect(capturedRequest.body.action).toBe("sales.opportunity.move-stage");
    expect(capturedRequest.body.params.opportunityId).toBe("opp-test-2");
    expect(capturedRequest.body.params.fromStage).toBe("proposal");
    expect(capturedRequest.body.params.toStage).toBe("won");
  });

  it("proves governed action handles 202 Accepted + pending-approval state", async () => {
    const responsePayload = {
      status: 202,
      approval_id: "appr-sales-9876",
      message: "Stage move requires commercial director approval",
    };

    const mockFetch = vi.fn().mockImplementation(async () => {
      return {
        ok: true,
        status: 202,
        headers: {
          get: (name: string) => {
            if (name.toLowerCase() === "content-type") return "application/json";
            if (name.toLowerCase() === "x-approval-id") return "appr-sales-9876";
            return null;
          },
        },
        json: async () => responsePayload,
        text: async () => JSON.stringify(responsePayload),
      };
    });

    render(
      <PipelineBoard
        opportunities={TEST_OPPORTUNITIES}
        fetchFn={mockFetch as any}
      />
    );

    const stageSelect = screen.getByTestId("move-stage-select-opp-test-1");
    fireEvent.change(stageSelect, { target: { value: "won" } });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    // Card should display pending-approval badge
    await waitFor(() => {
      expect(screen.getByTestId("pending-approval-badge-opp-test-1")).toBeDefined();
    });

    // Governed action status banner displays approval reference
    const statusBanner = screen.getByTestId("pipeline-action-status");
    expect(statusBanner).toBeDefined();
    expect(screen.getByTestId("governed-action-pending-approval")).toBeDefined();
    expect(screen.getByTestId("governed-action-pending-approval").textContent).toContain("appr-sales-9876");
  });

  it("proves EntityLens mounts PipelineBoard for pipeline and sales routes", () => {
    // 1. Mounts via /e/SALES/pipeline
    const { unmount: unmount1 } = render(
      <MemoryRouter initialEntries={["/e/SALES/pipeline"]}>
        <Routes>
          <Route path="/e/:type/:id" element={<EntityLens />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId("pipeline-board")).toBeDefined();
    expect(screen.getByTestId("pipeline-board-columns")).toBeDefined();
    unmount1();

    // 2. Mounts via /e/sales/pipeline
    const { unmount: unmount2 } = render(
      <MemoryRouter initialEntries={["/e/sales/pipeline"]}>
        <Routes>
          <Route path="/e/:type/:id" element={<EntityLens />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId("pipeline-board")).toBeDefined();
    unmount2();

    // 3. Mounts via /e/OPPORTUNITY/pipeline
    const { unmount: unmount3 } = render(
      <MemoryRouter initialEntries={["/e/OPPORTUNITY/pipeline"]}>
        <Routes>
          <Route path="/e/:type/:id" element={<EntityLens />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId("pipeline-board")).toBeDefined();
    unmount3();

    // 4. Mounts via explicit props isPipeline={true}
    render(
      <EntityLens
        entityType="SALES"
        entityId="overview"
        isPipeline={true}
        title="Commercial Pipeline"
      />
    );

    expect(screen.getByTestId("pipeline-board")).toBeDefined();
    expect(screen.getByText("Commercial Pipeline")).toBeDefined();
  });
});






