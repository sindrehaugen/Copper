import { describe, it, expect } from "vitest";
import { validateMicCoverage } from "./mic-coverage";
import { DesignDocument } from "../model/schema";

describe("mic-coverage", () => {
  it("produces a finding when participant zone is uncovered, and adding a mic clears it", () => {
    const doc: any = {
      deviceTypes: [],
      locations: [{ id: "room1", volume: 100 }],
      devices: [],
      zones: [
        {
          id: "zone1",
          name: "Participant Row",
          type: "participant",
          locationId: "room1"
        }
      ],
      geometry: {
        zone1: {
          position: { x: 200, y: 0 },
          size: { width: 100, height: 100 }
        }
      }
    };

    let result = validateMicCoverage(doc as DesignDocument);
    let warning = result.findings.find(f => f.message.includes("not covered by any microphone") || f.message.includes("uncovered"));
    expect(warning).toBeDefined();

    doc.devices.push({
      id: "mic1",
      deviceTypeId: "t1",
      locationId: "room1",
      customFields: {
        microphone: {
          polar_pattern: "cardioid",
          rated_coverage: 5 // meters
        }
      }
    });
    doc.geometry.mic1 = {
      position: { x: 100, y: 0 },
      rotation: 0
    };

    result = validateMicCoverage(doc as DesignDocument);
    warning = result.findings.find(f => f.message.includes("not covered by any microphone") || f.message.includes("uncovered"));
    expect(warning).toBeUndefined();
  });

  it("produces a finding when PAG/NAG margin is too low", () => {
    const doc: any = {
      deviceTypes: [],
      locations: [{ id: "room1", volume: 100 }],
      devices: [
        {
          id: "mic1",
          deviceTypeId: "t1",
          locationId: "room1",
          customFields: {
            microphone: {
              polar_pattern: "cardioid",
              rated_coverage: 5
            }
          }
        }
      ],
      zones: [
        {
          id: "zone1",
          name: "Participant Row",
          type: "participant",
          locationId: "room1"
        }
      ],
      geometry: {
        mic1: { position: { x: 0, y: 0 }, rotation: 0 },
        zone1: { position: { x: 400, y: 0 }, size: { width: 100, height: 100 } }
      }
    };

    let result = validateMicCoverage(doc as DesignDocument);
    let warning = result.findings.find(f => f.message.includes("PAG/NAG margin is too low"));
    expect(warning).toBeDefined();
  });
});
