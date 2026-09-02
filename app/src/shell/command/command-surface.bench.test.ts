import { describe, it, expect } from "vitest";
import { rerankItems } from "./reranker";
import { SearchItem } from "./types";

// Generate a realistic 5,000-entity fixture
export function generate5kFixture(): SearchItem[] {
  const types = [
    "FUNCTIONAL_LOCATION",
    "ASSET",
    "QUOTE",
    "TICKET",
    "PRODUCT",
    "VENDOR",
    "CUSTOMER",
    "AGREEMENT",
    "WORK_ORDER",
    "DESIGN"
  ];

  const codePrefixes: Record<string, string> = {
    FUNCTIONAL_LOCATION: "FL",
    ASSET: "AST",
    QUOTE: "Q",
    TICKET: "TCK",
    PRODUCT: "PRD",
    VENDOR: "VND",
    CUSTOMER: "CUST",
    AGREEMENT: "AGR",
    WORK_ORDER: "WO",
    DESIGN: "DSG",
  };

  const prefixes = ["Nordic", "Oslo", "Bergen", "Studio", "Rack", "Amp", "Speaker", "Switch", "Cisco", "Crestron", "QSC", "Shure", "Sennheiser", "Genelec", "Dante"];
  const nouns = ["Conference", "Boardroom", "Controller", "Processor", "Matrix", "DSP", "Amplifier", "Microphone", "Receiver", "Gateway", "Array", "Display", "Transmitter", "Core", "Server"];

  const items: SearchItem[] = [];

  for (let i = 0; i < 5000; i++) {
    const type = types[i % types.length] ?? "ASSET";
    const prefix = prefixes[i % prefixes.length] ?? "Unit";
    const noun = nouns[(i + 3) % nouns.length] ?? "Device";
    const codePrefix = codePrefixes[type] || "ENT";
    const idNum = 1000 + i;

    items.push({
      id: `${type}-${idNum}`,
      type,
      code: `${codePrefix}-${idNum}`,
      title: `${prefix} ${noun} Unit ${idNum}`,
      subtitle: `Building ${(i % 5) + 1}, Floor ${(i % 10) + 1} - System ${(i % 20) + 1}`,
      keywords: [prefix.toLowerCase(), noun.toLowerCase(), `sys-${i % 20}`],
      category: "entity",
    });
  }

  return items;
}

describe("Command Surface Benchmark (5k Entity Fixture)", () => {
  it("p95 < 120 ms on a 5k-entity fixture (prove via a benchmark test)", () => {
    const fixture = generate5kFixture();
    expect(fixture.length).toBe(5000);

    const testQueries = [
      "rack",
      "nordic",
      "cisco",
      "dsp",
      "oslo",
      "switch",
      "amp",
      "quote",
      "conference",
      "unit 105",
      "qsc",
      "mic",
      "shure",
      "crestron",
      "building 3",
      "fl-1",
      "ast-2",
      "dante",
      "genelec",
      "matrix"
    ];

    const latencies: number[] = [];

    // Warm-up run
    for (let i = 0; i < 5; i++) {
      rerankItems("test", fixture);
    }

    // Benchmark 100 searches (5 iterations across 20 diverse queries)
    for (let iter = 0; iter < 5; iter++) {
      for (const query of testQueries) {
        const start = performance.now();
        const results = rerankItems(query, fixture, { limit: 50 });
        const end = performance.now();

        expect(results.length).toBeGreaterThan(0);
        latencies.push(end - start);
      }
    }

    // Sort latencies ascending
    latencies.sort((a, b) => a - b);
    const p95Index = Math.floor(latencies.length * 0.95);
    const p95Latency = latencies[p95Index] ?? 0;
    const meanLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    const maxLatency = latencies[latencies.length - 1] ?? 0;

    console.log(`[5k Benchmark Results] Runs: ${latencies.length}, Mean: ${meanLatency.toFixed(2)}ms, P95: ${p95Latency.toFixed(2)}ms, Max: ${maxLatency.toFixed(2)}ms`);

    // Strict acceptance assertion: p95 must be < 120 ms
    expect(p95Latency).toBeLessThan(120);
  });
});
