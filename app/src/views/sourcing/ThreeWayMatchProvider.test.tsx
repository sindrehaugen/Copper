import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { ThreeWayMatchProvider } from "./ThreeWayMatchProvider";
import { findingRegistry } from "../../shell/finding/registry";

vi.mock("../../shell/finding/registry", () => ({
  findingRegistry: {
    setProducerFindings: vi.fn(),
    removeProducerFindings: vi.fn(),
  },
}));

describe("ThreeWayMatchProvider", () => {
  it("mounts and registers mock findings on load", () => {
    const { unmount } = render(<ThreeWayMatchProvider />);
    expect(findingRegistry.setProducerFindings).toHaveBeenCalled();
    unmount();
    expect(findingRegistry.setProducerFindings).toHaveBeenCalledWith("three-way-match", []);
  });
});
