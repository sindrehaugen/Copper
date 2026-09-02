import { describe, it, expect } from "vitest";
import { validateCameraCoverage } from "./camera-coverage";
import { DesignDocument } from "../model/schema";

describe("camera-coverage", () => {
  it("produces a finding when participant zone is uncovered, and widening lens clears it", () => {
    const doc: any = {
      deviceTypes: [],
      devices: [
        {
          id: "cam1",
          deviceTypeId: "t1",
          locationId: "room1",
          customFields: {
            camera: {
              sensor_size: 6, // mm
              focal_min: 10 // mm, narrow lens
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
        cam1: {
          position: { x: 0, y: 0 },
          size: { width: 10, height: 10 },
          rotation: 0
        },
        zone1: {
          position: { x: 200, y: -200 },
          size: { width: 400, height: 100 }
        }
      }
    };

    let result = validateCameraCoverage(doc as DesignDocument);
    let warning = result.findings.find(f => f.message.includes("cannot cover the entire width"));
    expect(warning).toBeDefined();
    if (warning) {
      expect(warning.details).toBeDefined();
      expect(warning.details.fixActions).toContain("Suggest wider lens");
    }

    doc.devices[0].customFields.camera.focal_min = 3;

    result = validateCameraCoverage(doc as DesignDocument);
    warning = result.findings.find(f => f.message.includes("cannot cover the entire width"));
    expect(warning).toBeUndefined();
  });
});
