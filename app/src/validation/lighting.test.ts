import { describe, it, expect } from "vitest";
import { validateLighting } from "./lighting";
import { DesignDocument } from "../model/schema";

describe("lighting validation", () => {
  it("produces a finding when participant zone is dim, and adding a fixture clears it", () => {
    const doc: any = {
      deviceTypes: [],
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
          position: { x: 0, y: 0 },
          size: { width: 100, height: 100 }
        }
      }
    };

    let result = validateLighting(doc as DesignDocument);
    let warning = result.findings.find(f => f.message.includes("Estimated illuminance"));
    expect(warning).toBeDefined();
    
    // Add a fixture
    doc.devices.push({
      id: "light1",
      deviceTypeId: "t1",
      locationId: "room1",
      customFields: {
        luminaire: {
          lumens: 10000,
          beam_angle: 90,
          cri: 90,
          cct: 4000
        }
      }
    });
    
    doc.geometry.light1 = {
      position: { x: 0, y: 0, z: 250 } // 2.5m directly above
    };

    result = validateLighting(doc as DesignDocument);
    warning = result.findings.find(f => f.message.includes("Estimated illuminance"));
    expect(warning).toBeUndefined();
  });
});
