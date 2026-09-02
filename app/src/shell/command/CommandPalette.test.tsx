import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";
import { CommandPalette } from "./CommandPalette";
import { rerankItems } from "./reranker";
import { SearchItem } from "./types";
import { FIXTURE_ENTITIES } from "./fixtures";
import "../../locales/i18n";

const mockTopologyDoc = {
  schemaVersion: 1,
  designLabel: "Live NCE Topology",
  sites: [
    { id: "site-oslo-01", name: "Oslo Campus HQ", slug: "oslo-hq" }
  ],
  locations: [
    { id: "loc-aud-101", name: "Main Auditorium Room", slug: "aud-101", siteId: "site-oslo-01", description: "Primary auditorium and presentation hall" },
    { id: "loc-board-202", name: "Executive Boardroom", slug: "board-202", siteId: "site-oslo-01", description: "Executive video conference suite" }
  ],
  racks: [
    { id: "rack-aud-r01", name: "Auditorium AV Rack 1", siteId: "site-oslo-01", locationId: "loc-aud-101", uHeight: 42, status: "active" }
  ],
  devices: [
    {
      id: "dev-dsp-qsys-01",
      name: "Q-SYS Core 610 Audio DSP",
      deviceTypeId: "qsys-core-610",
      siteId: "site-oslo-01",
      locationId: "loc-aud-101",
      rackId: "rack-aud-r01",
      designation: "DSP-01",
      status: "active",
      description: "Primary network audio DSP processor"
    },
    {
      id: "dev-sw-cisco-01",
      name: "Cisco Catalyst 9300 48P Switch",
      deviceTypeId: "cisco-c9300",
      siteId: "site-oslo-01",
      locationId: "loc-aud-101",
      rackId: "rack-aud-r01",
      designation: "SW-01",
      status: "active",
      description: "AV over IP core PoE++ switch"
    }
  ],
  cables: [],
  signalClasses: [],
  zones: []
};

describe("Command Surface & Palette (SH.W3 / Batch 131)", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("proves a fixture query returns entities of >=3 types ranked on one scale", () => {
    const query = "rack";
    const results = rerankItems(query, FIXTURE_ENTITIES);

    expect(results.length).toBeGreaterThanOrEqual(3);

    // Assert that results span at least 3 distinct entity types
    const types = new Set(results.map((r) => r.type));
    expect(types.size).toBeGreaterThanOrEqual(3);

    // Assert that all items are ranked on one shared scale [0, 1] and strictly ordered
    for (let i = 0; i < results.length; i++) {
      const current = results[i];
      const prev = i > 0 ? results[i - 1] : undefined;
      const score = current?.score ?? 0;
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);

      if (prev) {
        expect(score).toBeLessThanOrEqual(prev.score ?? 0);
      }
    }
  });

  it("asserts keyboard-only round trip (open -> type -> arrow navigation -> Enter selection)", async () => {
    const user = userEvent.setup();
    const handleSelect = vi.fn();
    const handleClose = vi.fn();

    render(
      <CommandPalette
        isOpen={true}
        onClose={handleClose}
        onSelect={handleSelect}
        items={FIXTURE_ENTITIES}
      />
    );

    const input = screen.getByRole("combobox");
    expect(document.activeElement).toBe(input);

    // Type search query
    await user.type(input, "rack");

    // Results should be displayed
    const options = await screen.findAllByRole("option");
    expect(options.length).toBeGreaterThan(0);

    // Initially first option is selected / active
    expect(options[0]?.getAttribute("aria-selected")).toBe("true");

    // Navigate down with ArrowDown
    await user.keyboard("{ArrowDown}");
    expect(options[1]?.getAttribute("aria-selected")).toBe("true");
    expect(options[0]?.getAttribute("aria-selected")).toBe("false");

    // Navigate down again
    await user.keyboard("{ArrowDown}");
    expect(options[2]?.getAttribute("aria-selected")).toBe("true");

    // Navigate up with ArrowUp
    await user.keyboard("{ArrowUp}");
    expect(options[1]?.getAttribute("aria-selected")).toBe("true");

    // Select with Enter
    await user.keyboard("{Enter}");

    // Assert onSelect was called with the selected item
    expect(handleSelect).toHaveBeenCalledTimes(1);

    // Assert dialog close was triggered
    expect(handleClose).toHaveBeenCalled();
  });

  it("closes cleanly on Escape key", async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();

    render(
      <CommandPalette
        isOpen={true}
        onClose={handleClose}
        items={FIXTURE_ENTITIES}
      />
    );

    await user.keyboard("{Escape}");
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("shows recent and frequent commands when query is empty", async () => {
    const recentItem: SearchItem = {
      id: "FL-AUD-101",
      type: "FUNCTIONAL_LOCATION",
      title: "Auditorium Main Rack Room",
      code: "FL-101",
      category: "entity",
    };

    localStorage.setItem("copper:command:recent", JSON.stringify([recentItem]));

    render(
      <CommandPalette
        isOpen={true}
        onClose={vi.fn()}
        items={FIXTURE_ENTITIES}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Recent")).toBeDefined();
      expect(screen.getByText("Auditorium Main Rack Room")).toBeDefined();
    });
  });

  it("provides full ARIA accessibility and proper combobox semantics", () => {
    render(
      <CommandPalette
        isOpen={true}
        onClose={vi.fn()}
        items={FIXTURE_ENTITIES}
      />
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog.getAttribute("aria-modal")).toBe("true");

    const input = screen.getByRole("combobox");
    expect(input.getAttribute("aria-autocomplete")).toBe("list");
    expect(input.getAttribute("aria-expanded")).toBe("true");
    expect(input.getAttribute("aria-controls")).toBe("copper-command-results");

    const listbox = screen.getByRole("listbox");
    expect(listbox.getAttribute("id")).toBe("copper-command-results");
  });
});

describe("Search Integration with Live Topology Endpoint (OB.W6 / Batch 144)", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("queries live NCE topology endpoint and indexes results into searchable entities", async () => {
    const user = userEvent.setup();
    const mockFetcher = vi.fn().mockResolvedValue(mockTopologyDoc);

    render(
      <CommandPalette
        isOpen={true}
        onClose={vi.fn()}
        namespace="tenant-nordic"
        fetcher={mockFetcher}
        debounceMs={0}
      />
    );

    // Verify the live endpoint fetcher was queried with the active namespace
    await waitFor(() => {
      expect(mockFetcher).toHaveBeenCalledWith("tenant-nordic", expect.any(AbortSignal));
    });

    const input = screen.getByRole("combobox");

    // Search for live topology device
    await user.type(input, "Q-SYS DSP");

    await waitFor(() => {
      expect(screen.getByText("Q-SYS Core 610 Audio DSP")).toBeDefined();
    });

    // Search for live topology room / location
    await user.clear(input);
    await user.type(input, "Boardroom");

    await waitFor(() => {
      expect(screen.getByText("Executive Boardroom")).toBeDefined();
    });
  });

  it("proves selecting a result navigates to /e/:type/:id", async () => {
    const user = userEvent.setup();
    const mockFetcher = vi.fn().mockResolvedValue(mockTopologyDoc);

    function RouteTracker() {
      const location = useLocation();
      return <div data-testid="current-pathname">{location.pathname}</div>;
    }

    render(
      <MemoryRouter initialEntries={["/"]}>
        <RouteTracker />
        <CommandPalette
          isOpen={true}
          onClose={vi.fn()}
          namespace="default"
          fetcher={mockFetcher}
          debounceMs={0}
        />
      </MemoryRouter>
    );

    const input = screen.getByRole("combobox");
    await user.type(input, "Cisco Switch");

    const resultOption = await screen.findByText("Cisco Catalyst 9300 48P Switch");
    expect(resultOption).toBeDefined();

    // Click on the result
    await user.click(resultOption);

    // Verify router pushed history to /e/:type/:id
    await waitFor(() => {
      const currentPath = screen.getByTestId("current-pathname").textContent;
      expect(currentPath).toBe("/e/ASSET/dev-sw-cisco-01");
    });
  });

  it("fetches via native fetch when no custom fetcher is provided", async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => mockTopologyDoc,
    } as any);

    render(
      <CommandPalette
        isOpen={true}
        onClose={vi.fn()}
        namespace="tenant-prod"
        debounceMs={0}
      />
    );

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(
        "/api/design/topology?namespace_id=tenant-prod",
        expect.objectContaining({ signal: expect.any(AbortSignal) })
      );
    });

    const input = screen.getByRole("combobox");
    await user.type(input, "Auditorium AV Rack");

    await waitFor(() => {
      expect(screen.getByText("Auditorium AV Rack 1")).toBeDefined();
    });
  });
});
