import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import React from 'react';
import { RackElevationView } from './RackElevationView';
import { DesignDocument } from '../../model/schema';


describe('RackElevationView', () => {
  it('renders correctly with an empty rack', () => {
    const doc: DesignDocument = {
      sites: [],
      locations: [],
      deviceTypes: [],
      racks: [
        { id: 'rack-1', name: 'Rack 1', uHeight: 42, locationId: 'loc-1' }
      ],
      devices: []
    };
    
    render(<RackElevationView doc={doc} geometryMap={{}} selectedRackId="rack-1" />);
    
    expect(screen.getByText('Front Face')).toBeDefined();
    expect(screen.getByText('Rear Face')).toBeDefined();
    
    // Check if 42U is rendered
    expect(screen.getAllByText('42U').length).toBe(2);
    expect(screen.getAllByText('1U').length).toBe(2);
  });

  it('renders devices in correct slots', () => {
    const doc: DesignDocument = {
      sites: [],
      locations: [],
      deviceTypes: [
        { id: 'dt-1', name: 'Switch', make: 'Cisco', model: 'SG', uHeight: 1, powerPorts: [], networkPorts: [] },
        { id: 'dt-2', name: 'Patch', make: 'Generic', model: 'Patch', uHeight: 0.5, powerPorts: [], networkPorts: [] }
      ],
      racks: [
        { id: 'rack-1', name: 'Rack 1', uHeight: 42, locationId: 'loc-1' }
      ],
      devices: [
        { id: 'd-1', name: 'Core Switch', deviceTypeId: 'dt-1', rackId: 'rack-1' },
        { id: 'd-2', name: 'Half U Patch', deviceTypeId: 'dt-2', rackId: 'rack-1' }
      ]
    };
    
    const geometryMap = {
      'd-1': { rack_position: 40, rack_face: 'front' },
      'd-2': { rack_position: 41.5, rack_face: 'rear' }
    };

    render(<RackElevationView doc={doc} geometryMap={geometryMap} selectedRackId="rack-1" />);
    
    const switchEls = screen.getAllByTestId('device-d-1-front');
    expect(switchEls.length).toBeGreaterThan(0);
    expect(switchEls[0].textContent).toBe('Core Switch');

    const patchEls = screen.getAllByTestId('device-d-2-rear');
    expect(patchEls.length).toBeGreaterThan(0);
    expect(patchEls[0].textContent).toBe('Half U Patch');
  });

  it('renders rack not found', () => {
    const doc: DesignDocument = {
      sites: [], locations: [], deviceTypes: [], racks: [], devices: []
    };
    render(<RackElevationView doc={doc} geometryMap={{}} selectedRackId="nonexistent" />);
    expect(screen.getByTestId('rack-not-found')).toBeDefined();
  });
});
