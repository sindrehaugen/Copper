// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import {
  LocalStorageGridViewStorage,
  MemoryGridViewStorage,
  serializeViewState,
  deserializeViewState,
  encodeViewStateToUrl,
  decodeViewStateFromUrl,
  applyGridViewFiltersAndSort,
  GridViewManager,
  type GridView,
  type GridViewState,
} from './GridViewManager';
import type { ColumnDef } from '../DataGrid';

interface MockDevice {
  id: string;
  name: string;
  type: string;
  watts: number;
  ip: string;
}

const sampleData: MockDevice[] = [
  { id: 'dev-1', name: 'Core Router A', type: 'network', watts: 120, ip: '10.0.0.1' },
  { id: 'dev-2', name: 'Edge Switch B', type: 'network', watts: 45, ip: '10.0.0.2' },
  { id: 'dev-3', name: 'AV DSP Matrix', type: 'audio', watts: 80, ip: '10.0.1.10' },
  { id: 'dev-4', name: 'Video Wall Processor', type: 'video', watts: 350, ip: '10.0.2.20' },
  { id: 'dev-5', name: 'Zone 1 Amp', type: 'audio', watts: 500, ip: '10.0.1.15' },
];

const sampleColumns: ColumnDef<MockDevice>[] = [
  { id: 'id', header: 'ID', accessorKey: 'id', width: 80 },
  { id: 'name', header: 'Device Name', accessorKey: 'name', width: 160 },
  { id: 'type', header: 'Category', accessorKey: 'type', width: 100 },
  { id: 'watts', header: 'Power (W)', accessorKey: 'watts', width: 100 },
  { id: 'ip', header: 'IP Address', accessorKey: 'ip', width: 120 },
];

describe('GridViewManager & Views Engine (GR.W2 / B147)', () => {
  beforeEach(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  });

  afterEach(() => {
    cleanup();
  });

  describe('Storage Persistence (per user, per lens)', () => {
    it('saves, retrieves, updates, and deletes views using LocalStorageGridViewStorage', async () => {
      const storage = new LocalStorageGridViewStorage('test:copper:grid');
      const lensKey = 'network-inventory';
      const userId = 'engineer-42';

      const viewA: GridView = {
        id: 'view-alpha',
        name: 'High Power Devices',
        lensKey,
        userId,
        visibleColumnIds: ['name', 'watts'],
        density: 'dense',
        columnFilters: [{ columnId: 'watts', operator: 'gte', value: 100 }],
        sort: [{ columnId: 'watts', direction: 'desc' }],
      };

      await storage.saveView(lensKey, viewA, userId);

      let loaded = await storage.loadViews(lensKey, userId);
      expect(loaded).toHaveLength(1);
      expect(loaded[0].name).toBe('High Power Devices');
      expect(loaded[0].visibleColumnIds).toEqual(['name', 'watts']);
      expect(loaded[0].columnFilters?.[0].operator).toBe('gte');

      // Update existing view
      const updatedView: GridView = {
        ...viewA,
        name: 'High Power Devices (Updated)',
        density: 'comfortable',
      };
      await storage.saveView(lensKey, updatedView, userId);
      loaded = await storage.loadViews(lensKey, userId);
      expect(loaded).toHaveLength(1);
      expect(loaded[0].name).toBe('High Power Devices (Updated)');
      expect(loaded[0].density).toBe('comfortable');

      // Delete view
      await storage.deleteView(lensKey, 'view-alpha', userId);
      loaded = await storage.loadViews(lensKey, userId);
      expect(loaded).toHaveLength(0);
    });

    it('isolates views across different users and different lenses', async () => {
      const storage = new MemoryGridViewStorage();

      const user1View: GridView = {
        id: 'v1',
        name: 'User 1 View',
        lensKey: 'audio-lens',
        userId: 'user-1',
        visibleColumnIds: ['id', 'name'],
      };

      const user2View: GridView = {
        id: 'v2',
        name: 'User 2 View',
        lensKey: 'audio-lens',
        userId: 'user-2',
        visibleColumnIds: ['name', 'ip'],
      };

      const lens2View: GridView = {
        id: 'v3',
        name: 'Lens 2 View',
        lensKey: 'video-lens',
        userId: 'user-1',
        visibleColumnIds: ['name', 'type'],
      };

      await storage.saveView('audio-lens', user1View, 'user-1');
      await storage.saveView('audio-lens', user2View, 'user-2');
      await storage.saveView('video-lens', lens2View, 'user-1');

      const u1Audio = await storage.loadViews('audio-lens', 'user-1');
      expect(u1Audio).toHaveLength(1);
      expect(u1Audio[0].id).toBe('v1');

      const u2Audio = await storage.loadViews('audio-lens', 'user-2');
      expect(u2Audio).toHaveLength(1);
      expect(u2Audio[0].id).toBe('v2');

      const u1Video = await storage.loadViews('video-lens', 'user-1');
      expect(u1Video).toHaveLength(1);
      expect(u1Video[0].id).toBe('v3');
    });
  });

  describe('URL Encoding & Deserialization (Shareable Link Round-Trip)', () => {
    it('encodes and decodes complete grid view state lossless to and from URL strings', () => {
      const state: GridViewState = {
        visibleColumnIds: ['name', 'type', 'watts'],
        columnOrder: ['type', 'name', 'watts'],
        columnWidths: { name: 200, watts: 150 },
        density: 'comfortable',
        filterQuery: 'audio rack',
        columnFilters: [
          { columnId: 'watts', operator: 'gte', value: 50 },
          { columnId: 'type', operator: 'equals', value: 'audio' },
        ],
        sort: [
          { columnId: 'watts', direction: 'desc' },
          { columnId: 'name', direction: 'asc' },
        ],
      };

      const baseUrl = 'https://copper.app/lenses/devices?tab=overview';
      const encodedUrl = encodeViewStateToUrl(state, baseUrl, 'gv');

      expect(encodedUrl).toContain('https://copper.app/lenses/devices?tab=overview&gv=');

      const decodedState = decodeViewStateFromUrl(encodedUrl, 'gv');
      expect(decodedState).not.toBeNull();
      expect(decodedState?.visibleColumnIds).toEqual(['name', 'type', 'watts']);
      expect(decodedState?.columnOrder).toEqual(['type', 'name', 'watts']);
      expect(decodedState?.columnWidths).toEqual({ name: 200, watts: 150 });
      expect(decodedState?.density).toBe('comfortable');
      expect(decodedState?.filterQuery).toBe('audio rack');
      expect(decodedState?.columnFilters).toEqual([
        { columnId: 'watts', operator: 'gte', value: 50 },
        { columnId: 'type', operator: 'equals', value: 'audio' },
      ]);
      expect(decodedState?.sort).toEqual([
        { columnId: 'watts', direction: 'desc' },
        { columnId: 'name', direction: 'asc' },
      ]);
    });

    it('safely handles malformed or empty URL parameters', () => {
      expect(decodeViewStateFromUrl('')).toBeNull();
      expect(decodeViewStateFromUrl('https://copper.app/?grid_view=invalid!!base64')).toBeNull();
      expect(deserializeViewState('')).toBeNull();
      expect(serializeViewState({} as any)).toBeDefined();
    });
  });

  describe('Filter & Sort Engine (applyGridViewFiltersAndSort)', () => {
    it('filters by multiple column filter operators correctly', () => {
      // Test operator: equals
      const eqResult = applyGridViewFiltersAndSort(sampleData, sampleColumns, {
        columnFilters: [{ columnId: 'type', operator: 'equals', value: 'audio' }],
      });
      expect(eqResult).toHaveLength(2);
      expect(eqResult.map((d) => d.name)).toEqual(['AV DSP Matrix', 'Zone 1 Amp']);

      // Test operator: gt & lt
      const rangeResult = applyGridViewFiltersAndSort(sampleData, sampleColumns, {
        columnFilters: [
          { columnId: 'watts', operator: 'gt', value: 50 },
          { columnId: 'watts', operator: 'lte', value: 350 },
        ],
      });
      expect(rangeResult.map((d) => d.name)).toEqual(['Core Router A', 'AV DSP Matrix', 'Video Wall Processor']);

      // Test operator: contains
      const containsResult = applyGridViewFiltersAndSort(sampleData, sampleColumns, {
        columnFilters: [{ columnId: 'name', operator: 'contains', value: 'wall' }],
      });
      expect(containsResult).toHaveLength(1);
      expect(containsResult[0].name).toBe('Video Wall Processor');

      // Test operator: in
      const inResult = applyGridViewFiltersAndSort(sampleData, sampleColumns, {
        columnFilters: [{ columnId: 'type', operator: 'in', value: ['audio', 'video'] }],
      });
      expect(inResult).toHaveLength(3);
    });

    it('combines global filterQuery with structured column filters and multi-column sorting', () => {
      const combined = applyGridViewFiltersAndSort(sampleData, sampleColumns, {
        filterQuery: '10.0.1', // matches dev-3 and dev-5
        columnFilters: [{ columnId: 'watts', operator: 'gt', value: 100 }], // only dev-5 (500W)
        sort: [{ columnId: 'watts', direction: 'desc' }],
      });

      expect(combined).toHaveLength(1);
      expect(combined[0].id).toBe('dev-5');
      expect(combined[0].name).toBe('Zone 1 Amp');
    });

    it('sorts data accurately ascending and descending across string and number fields', () => {
      const sortedByWattsDesc = applyGridViewFiltersAndSort(sampleData, sampleColumns, {
        sort: [{ columnId: 'watts', direction: 'desc' }],
      });
      expect(sortedByWattsDesc.map((d) => d.watts)).toEqual([500, 350, 120, 80, 45]);

      const sortedByNameAsc = applyGridViewFiltersAndSort(sampleData, sampleColumns, {
        sort: [{ columnId: 'name', direction: 'asc' }],
      });
      expect(sortedByNameAsc.map((d) => d.name)).toEqual([
        'AV DSP Matrix',
        'Core Router A',
        'Edge Switch B',
        'Video Wall Processor',
        'Zone 1 Amp',
      ]);
    });
  });

  describe('GridViewManager Component Integration', () => {
    it('renders the GridViewManager with default controls and underlying DataGrid', () => {
      render(
        <GridViewManager<MockDevice>
          data={sampleData}
          columns={sampleColumns}
          lensKey="devices-lens"
          userId="user-1"
          ariaLabel="Devices Grid"
        />
      );

      // Verify Toolbar Elements
      expect(screen.getByTestId('grid-view-manager')).toBeDefined();
      expect(screen.getByTestId('grid-view-toolbar')).toBeDefined();
      expect(screen.getByTestId('grid-view-selector')).toBeDefined();
      expect(screen.getByTestId('grid-view-save-btn')).toBeDefined();
      expect(screen.getByTestId('grid-view-search')).toBeDefined();
      expect(screen.getByTestId('grid-view-columns-btn')).toBeDefined();
      expect(screen.getByTestId('grid-view-density-btn')).toBeDefined();
      expect(screen.getByTestId('grid-view-share-btn')).toBeDefined();

      // Verify DataGrid is rendered
      expect(screen.getByRole('grid', { name: 'Devices Grid' })).toBeDefined();
      expect(screen.getAllByRole('row')).toHaveLength(6); // 1 header + 5 rows
    });

    it('toggles column visibility and updates visible columns in DataGrid', async () => {
      render(
        <GridViewManager<MockDevice>
          data={sampleData}
          columns={sampleColumns}
          lensKey="devices-lens"
          userId="user-1"
          ariaLabel="Devices Grid"
        />
      );

      expect(screen.getAllByRole('columnheader')).toHaveLength(5);

      // Open column visibility menu
      const colBtn = screen.getByTestId('grid-view-columns-btn');
      fireEvent.click(colBtn);

      // Uncheck Power (W) (watts)
      const wattsToggle = screen.getByTestId('grid-col-toggle-watts');
      fireEvent.click(wattsToggle);

      // Now 4 columns should be visible in headers
      expect(screen.getAllByRole('columnheader')).toHaveLength(4);
      expect(screen.queryByRole('columnheader', { name: /Power/i })).toBeNull();
    });

    it('filters data via search bar and column filter builders', async () => {
      render(
        <GridViewManager<MockDevice>
          data={sampleData}
          columns={sampleColumns}
          lensKey="devices-lens"
          userId="user-1"
          ariaLabel="Devices Grid"
        />
      );

      const searchInput = screen.getByTestId('grid-view-search');
      fireEvent.change(searchInput, { target: { value: 'Router' } });

      // Only Core Router A should remain
      expect(screen.getByText('Core Router A')).toBeDefined();
      expect(screen.queryByText('Video Wall Processor')).toBeNull();
    });

    it('saves a new view to storage and restores it upon selection', async () => {
      const storage = new MemoryGridViewStorage();
      const onSaveView = vi.fn();

      render(
        <GridViewManager<MockDevice>
          data={sampleData}
          columns={sampleColumns}
          lensKey="devices-lens"
          userId="user-1"
          storage={storage}
          onSaveView={onSaveView}
          ariaLabel="Devices Grid"
        />
      );

      // Type filter
      const searchInput = screen.getByTestId('grid-view-search');
      fireEvent.change(searchInput, { target: { value: 'Audio' } });

      // Click save view button
      const saveBtn = screen.getByTestId('grid-view-save-btn');
      fireEvent.click(saveBtn);

      // Fill in view name in modal/input
      const nameInput = screen.getByTestId('grid-view-name-input');
      fireEvent.change(nameInput, { target: { value: 'Audio Only' } });

      const confirmBtn = screen.getByTestId('grid-view-confirm-save-btn');
      fireEvent.click(confirmBtn);

      await waitFor(() => {
        expect(onSaveView).toHaveBeenCalled();
      });

      // Verify view is stored in storage
      const saved = await storage.loadViews('devices-lens', 'user-1');
      expect(saved).toHaveLength(1);
      expect(saved[0].name).toBe('Audio Only');
      expect(saved[0].filterQuery).toBe('Audio');
    });

    it('initializes from shareable URL search params with full state fidelity', () => {
      const shareState: GridViewState = {
        visibleColumnIds: ['id', 'name', 'watts'],
        filterQuery: 'Matrix',
        density: 'dense',
        sort: [{ columnId: 'watts', direction: 'asc' }],
      };

      const shareUrl = encodeViewStateToUrl(shareState, 'http://localhost/test');

      render(
        <GridViewManager<MockDevice>
          data={sampleData}
          columns={sampleColumns}
          lensKey="devices-lens"
          initialUrl={shareUrl}
          ariaLabel="Devices Grid"
        />
      );

      // DataGrid should reflect the URL state: only 3 columns visible, 1 row ('AV DSP Matrix')
      expect(screen.getAllByRole('columnheader')).toHaveLength(3);
      expect(screen.getByText('AV DSP Matrix')).toBeDefined();
      expect(screen.queryByText('Core Router A')).toBeNull();
      expect((screen.getByTestId('grid-view-search') as HTMLInputElement).value).toBe('Matrix');
    });

    it('generates share URL when clicking Share button and invokes onShareView', async () => {
      const onShareView = vi.fn();

      render(
        <GridViewManager<MockDevice>
          data={sampleData}
          columns={sampleColumns}
          lensKey="devices-lens"
          userId="user-1"
          onShareView={onShareView}
          ariaLabel="Devices Grid"
        />
      );

      const shareBtn = screen.getByTestId('grid-view-share-btn');
      fireEvent.click(shareBtn);

      expect(onShareView).toHaveBeenCalledTimes(1);
      const [shareUrl, sharedState] = onShareView.mock.calls[0];
      expect(typeof shareUrl).toBe('string');
      expect(shareUrl).toContain('grid_view=');
      expect(sharedState.visibleColumnIds).toEqual(['id', 'name', 'type', 'watts', 'ip']);
    });
  });
});
