import { describe, it, expect } from 'vitest';
import { validateDisplaySightlines } from './display-sightlines';
import { DesignDocument } from '../model/schema';

describe('B126 Accept Criteria - Zone Authoring', () => {
  it('reads zone geometry from doc and computes sightlines, generating a warning', () => {
    const doc: Partial<DesignDocument> = {
      deviceTypes: [
        { 
          id: 't-disp', manufacturer: 'Sony', model: 'Bravia', 
          slug: 'bravia', uHeight: 0, isFullDepth: false,
          customFields: { display: { diagonal: 55, nits: 300 } }
        }
      ],
      devices: [
        { id: 'd-disp', deviceTypeId: 't-disp', status: 'active', siteId: 's1' }
      ],
      zones: [
        { id: 'z1', name: 'Viewer Zone', type: 'viewer' }
      ],
      geometry: {
        'd-disp': { position: { x: 0, y: 0 } }, // screen is at origin (0cm, 0cm)
        'z1': { position: { x: 0, y: 1000 }, size: { width: 100, height: 100 } } // 10m away
      }
    };

    const { findings } = validateDisplaySightlines(doc as DesignDocument);
    expect(findings.length).toBeGreaterThan(0);
    const sightlineWarnings = findings.filter(f => f.message.includes('DISCAS max viewing distance'));
    expect(sightlineWarnings.length).toBeGreaterThan(0);
  });
});
