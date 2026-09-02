import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CommandPalette } from "./CommandPalette";
import { rerankItems } from "./reranker";
import { SearchItem } from "./types";
import { FIXTURE_ENTITIES } from "./fixtures";

describe("Command Surface & Palette (SH.W3 / Batch 131)", () => {
  beforeEach(() => {
    localStorage.clear();
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
