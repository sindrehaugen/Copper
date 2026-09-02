// @ts-nocheck
import { describe, it, expect } from "vitest";
import { validateAudioLines, suggestAmpsForNode, suggestCablesForEdge } from "./audio-line";
import { DesignDocument, DeviceType, Device, Cable } from "../model/schema";

const deviceTypes: DeviceType[] = [
  {
    id: "amp-1",
    manufacturer: "Acme",
    model: "Amp 1",
    customFields: {
      acoustics: { device_class: "amplifier", min_load: 4, watt_8: 100 }
    }
  },
  {
    id: "spk-1",
    manufacturer: "Acme",
    model: "Speaker 1",
    customFields: {
      acoustics: { device_class: "speaker", impedance: 2, z_min: 1.5, type: "Low-Z" } // Impedance lower than amp's min_load
    }
  },
  {
    id: "cab-1",
    manufacturer: "Acme",
    model: "Cable 1",
    customFields: {
      acoustics: { device_class: "cable", resistance: 2.5 } // high resistance to cause drop
    }
  }
];

const devices: Device[] = [
  { id: "node-amp", name: "Amp", deviceTypeId: "amp-1", x: 0, y: 0 },
  { id: "node-spk", name: "Speaker", deviceTypeId: "spk-1", x: 10, y: 10 }
];

const cables: any[] = [
  { 
    id: "edge-1", 
    type: "cab-1", 
    lengthM: 1000,
    terminations: [
      { deviceId: "node-amp", portRef: { kind: 'port', name: 'out1' } },
      { deviceId: "node-spk", portRef: { kind: 'port', name: 'in1' } }
    ]
  }
];

import { analyseChain, buildChainInput } from "@copper/acoustics";

describe("AudioLine Validation", () => {
  it("detects audio line faults", () => {
    const doc = { devices, deviceTypes, cables } as DesignDocument;
    
    // Also try to check what analyseChain is doing
    const chainInput = buildChainInput(doc as any);
    const analysis = analyseChain(chainInput);
    console.log("ANALYSIS ENTRIES:", Array.from(analysis.entries()).map(([k, v]) => ({ slug: k, status: v.results.status, res: v.results })));

    const { findings } = validateAudioLines(doc);
    console.log("FINDINGS:", findings);
    expect(findings.length).toBeGreaterThan(0);
    // At least one finding should be an Error due to voltage drop or impedance
    const hasError = findings.some(f => f.severity === 'Error');
    expect(hasError).toBe(true);
  });
});