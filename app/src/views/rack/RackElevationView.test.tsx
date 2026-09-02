import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RackElevationView } from './RackElevationView';
import { DesignDocument } from '../../model/schema';
import { useDocumentStore } from '../../store';

describe('RackElevationView', () => {
  afterEach(cleanup);
  beforeEach(() => {
    useDocumentStore.setState({ document: null, history: [], historyIndex: -1 });
  });

  it('renders correctly with an empty rack', () => {
    const doc: DesignDocument = {
      schemaVersion: 1,
      designLabel: 'Test',
      
      sites: [],
      locations: [],
      deviceTypes: [],
      racks: [
        { id: 'rack-1', name: 'Rack 1', uHeight: 42, locationId: 'loc-1', siteId: 'site-1', status: 'active' }
      ],
      devices: [],
      cables: [],
      signalClasses: [], zones: []
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
      schemaVersion: 1,
      designLabel: 'Test',
      
      sites: [],
      locations: [],
      deviceTypes: [
        { id: 'dt-1', manufacturer: 'Cisco', model: 'SG', slug: 'dt-1', isFullDepth: true, uHeight: 1, powerPortTemplates: [], interfaceTemplates: [] },
        { id: 'dt-2', manufacturer: 'Generic', model: 'Patch', slug: 'dt-2', isFullDepth: false, uHeight: 0.5, powerPortTemplates: [], interfaceTemplates: [] }
      ],
      racks: [
        { id: 'rack-1', name: 'Rack 1', uHeight: 42, locationId: 'loc-1', siteId: 'site-1', status: 'active' }
      ],
      devices: [
        { id: 'd-1', name: 'Core Switch', deviceTypeId: 'dt-1', rackId: 'rack-1', siteId: 'site-1', status: 'active' },
        { id: 'd-2', name: 'Half U Patch', deviceTypeId: 'dt-2', rackId: 'rack-1', siteId: 'site-1', status: 'active' }
      ],
      cables: [],
      signalClasses: [], zones: []
    };
    
    const geometryMap = {
      'd-1': { rack_position: 40, rack_face: 'front' },
      'd-2': { rack_position: 41.5, rack_face: 'rear' }
    };

    render(<RackElevationView doc={doc} geometryMap={geometryMap} selectedRackId="rack-1" />);
    
    const switchEls = screen.getAllByTestId('device-d-1-front');
    expect(switchEls.length).toBeGreaterThan(0);
    expect(switchEls[0]?.textContent).toBe('Core Switch');

    const patchEls = screen.getAllByTestId('device-d-2-rear');
    expect(patchEls.length).toBeGreaterThan(0);
    expect(patchEls[0]?.textContent).toBe('Half U Patch');
  });

  it('renders rack not found', () => {
    const doc: DesignDocument = {
      schemaVersion: 1, designLabel: 'Test', 
      sites: [], locations: [], deviceTypes: [], racks: [], devices: [], cables: [], signalClasses: [], zones: []
    };
    render(<RackElevationView doc={doc} geometryMap={{}} selectedRackId="nonexistent" />);
    expect(screen.getByTestId('rack-not-found')).toBeDefined();
  });

  it('handles valid drag and drop', () => {
    const doc: DesignDocument = {
      schemaVersion: 1,
      designLabel: 'Test',
      
      sites: [],
      locations: [],
      deviceTypes: [
        { id: 'dt-1', manufacturer: 'Cisco', model: 'SG', slug: 'dt-1', isFullDepth: true, uHeight: 1, powerPortTemplates: [], interfaceTemplates: [] },
      ],
      racks: [
        { id: 'rack-1', name: 'Rack 1', uHeight: 42, locationId: 'loc-1', siteId: 'site-1', status: 'active' }
      ],
      devices: [
        { id: 'd-1', name: 'Unassigned Switch', deviceTypeId: 'dt-1', siteId: 'site-1', status: 'active' },
      ],
      cables: [],
      signalClasses: [], zones: []
    };
    
    useDocumentStore.setState({ document: doc, history: [doc], historyIndex: 0 });

    render(<RackElevationView doc={doc} geometryMap={{}} selectedRackId="rack-1" />);
    
    const unassignedEl = screen.getByTestId('unassigned-d-1');
    expect(unassignedEl).toBeDefined();

    const slotEl = screen.getAllByTestId('slot-10-front')[0];
    
    // Simulate drop
    const dataTransfer = {
      getData: vi.fn().mockReturnValue('d-1'),
      setData: vi.fn(),
    };
    
    fireEvent.drop(slotEl as HTMLElement, {
      dataTransfer,
      preventDefault: vi.fn()
    });

    const state = useDocumentStore.getState();
    const updatedDoc = state.document!;
    const updatedDevice = updatedDoc.devices.find(d => d.id === 'd-1');
    expect(updatedDevice?.rackId).toBe('rack-1');
    expect(updatedDevice?.position).toBe(10);
    expect(updatedDevice?.face).toBe('front');
    expect(((updatedDoc as unknown as { geometry: Record<string, {rack_position: number, rack_face: string}> }).geometry['d-1'] || {}).rack_position).toBe(10);
    expect(((updatedDoc as unknown as { geometry: Record<string, {rack_position: number, rack_face: string}> }).geometry['d-1'] || {}).rack_face).toBe('front');
  });
});
