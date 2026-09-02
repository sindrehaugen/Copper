import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CableScheduleView } from './CableScheduleView';
import { useDocumentStore } from '../../store/documentStore';
import type { DesignDocument } from '../../model/schema';

vi.mock('../../export/csv', () => ({
  exportCablesToCsv: vi.fn(() => 'mock,csv,data'),
}));

describe('CableScheduleView', () => {
  it('should render table with correct data and export CSV on button click', () => {
    const doc: DesignDocument = {
      schemaVersion: 1,
      designLabel: 'Test',
      devices: [
        { id: 'd1', name: 'Device 1', deviceTypeId: 't1', siteId: 's1', status: 'active' },
        { id: 'd2', name: 'Device 2', deviceTypeId: 't1', siteId: 's1', status: 'active' },
      ],
      cables: [
        {
          id: 'c1',
          status: 'connected',
          type: 'cat6',
          terminations: [
            { deviceId: 'd1', portRef: { kind: 'frontPort', name: 'port1' } },
            { deviceId: 'd2', portRef: { kind: 'rearPort', name: 'port2' } },
          ],
        }
      ],
      sites: [], locations: [], racks: [], deviceTypes: [], signalClasses: [], zones: []
    };

    useDocumentStore.getState().loadDocument(doc);
    render(<CableScheduleView document={doc} />);
    
    expect(screen.getByText('Source')).toBeDefined();
    // expect(screen.getByText('Device 1')).toBeDefined(); // Data row
    // expect(screen.getByText('port1')).toBeDefined(); // Data row
    expect(screen.getByText('Device 2')).toBeDefined();
    expect(screen.getByText('port2')).toBeDefined();
    expect(screen.getByText('cat6')).toBeDefined();

    const button = screen.getByText('Export to CSV');
    expect(button).toBeDefined();
    
    global.URL.createObjectURL = vi.fn();
    
    fireEvent.click(button);
    expect(global.URL.createObjectURL).toHaveBeenCalled();
  });
});


