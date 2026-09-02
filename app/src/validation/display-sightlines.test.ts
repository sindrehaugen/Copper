import { describe, it, expect } from "vitest";
import { validateDisplaySightlines } from "./display-sightlines";
import { DesignDocument } from "../model/schema";

describe("display-sightlines", () => {
  it("fails DISCAS when viewing distance is too large, and passes when display is swapped to larger size", () => {
    // 65 inch display => height is ~0.8m => max distance is ~4.8m
    // Place viewer zone at 6m away -> should fail
    const doc: any = {
      deviceTypes: [],
      devices: [
        {
          id: "disp1",
          deviceTypeId: "t1",
          locationId: "room1",
          customFields: {
            display: {
              diagonal: 65,
              nits: 400
            }
          }
        }
      ],
      zones: [
        {
          id: "zone1",
          name: "Back Row",
          type: "viewer",
          locationId: "room1"
        }
      ],
      geometry: {
        disp1: {
          position: { x: 0, y: 0 },
          size: { width: 140, height: 80 },
          rotation: 90
        },
        zone1: {
          position: { x: 600, y: 0 }, // 6 meters away
          size: { width: 100, height: 100 }
        }
      }
    };

    let result = validateDisplaySightlines(doc as DesignDocument);
    const discasWarning = result.findings.find(f => f.message.includes("exceeds DISCAS max viewing distance"));
    expect(discasWarning).toBeDefined();

    // Swap to larger display: 100 inch => height ~1.24m => max distance ~7.4m
    // Place viewer zone at 6m away -> should pass
    doc.devices[0].customFields.display.diagonal = 100;
    
    result = validateDisplaySightlines(doc as DesignDocument);
    const discasWarning2 = result.findings.find(f => f.message.includes("exceeds DISCAS max viewing distance"));
    expect(discasWarning2).toBeUndefined();
  });
});

