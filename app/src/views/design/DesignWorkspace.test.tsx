import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { DesignWorkspace } from './DesignWorkspace';
import { useDocumentStore } from '../../store/documentStore';

vi.mock('../../shell/index', () => ({
  ConnectedCanvasView: () => <div data-testid="schematic-view">Schematic View</div>
}));

vi.mock('../scene/SceneView', () => ({
  SceneView: () => <div data-testid="3d-view">3D Scene View</div>
}));

vi.mock('./FloorplanMode', () => ({
  FloorplanMode: () => <div data-testid="floorplan-view">Floorplan Mode</div>
}));

vi.mock('./CableRoutingMode', () => ({
  CableRoutingMode: () => <div data-testid="routing-view">Cable Routing Mode</div>
}));

vi.mock('../../ui/problems/ProblemsPanel', () => ({
  ProblemsPanel: () => <div data-testid="problems-panel">Problems Panel</div>
}));

describe('DesignWorkspace', () => {
  beforeEach(() => {
    useDocumentStore.setState({
      document: {
        id: 'doc-1',
        name: 'Test Doc',
        deviceTypes: [],
        cableTypes: [],
        sites: [],
        roles: [],
        actors: [],
        namespaces: [],
        versionId: '1',
        createdAt: '2022',
        updatedAt: '2022',
        createdBy: 'user',
        updatedBy: 'user',
        devices: [{ id: 'dev-1', name: 'Device 1', deviceTypeId: 'dt-1', siteId: 'site-1', status: 'planned' }],
        cables: [],
        locations: [],
        racks: []
      } as any,
      selectedIds: ['dev-1']
    });
  });

  const renderWorkspace = (initialMode = 'schematic') => {
    return render(
      <MemoryRouter initialEntries={[`/design/${initialMode}`]}>
        <Routes>
          <Route path="/design/:mode" element={<DesignWorkspace />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('keeps document and selection intact when switching modes', () => {
    const { unmount } = renderWorkspace('schematic');
    
    expect(screen.getByTestId('schematic-view')).toBeTruthy();
    
    // Simulate navigation to floorplan
    const floorplanBtn = screen.getByText('Floorplan');
    fireEvent.click(floorplanBtn);
    
    expect(useDocumentStore.getState().selectedIds).toEqual(['dev-1']);
    
    expect(useDocumentStore.getState().document?.devices?.[0]?.id).toBe('dev-1');
    
    unmount();
  });
});
