import { describe, it, expect } from "vitest";
import { AgentOrchestrator } from "./AgentOrchestrator";

describe("AgentOrchestrator", () => {
  it("fails closed on missing or unknown region", async () => {
    const res1 = await AgentOrchestrator.orchestrateMutation({
      action: "UPDATE_QUOTE",
      region: "",
      payload: {}
    });
    expect(res1.success).toBe(false);
    expect(res1.error).toContain("Failling closed");

    const res2 = await AgentOrchestrator.orchestrateMutation({
      action: "UPDATE_QUOTE",
      region: "UNKNOWN-REGION",
      payload: {}
    });
    expect(res2.success).toBe(false);
  });

  it("calculates cost and allows valid regions", async () => {
    const res = await AgentOrchestrator.orchestrateMutation({
      action: "BULK_UPDATE",
      region: "EU-WEST",
      payload: {}
    });
    expect(res.success).toBe(true);
    expect(res.cost).toBeGreaterThan(0.05); // bulk multiplier applied
  });
});
