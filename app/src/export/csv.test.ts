import { describe, expect, it } from 'vitest';
import { exportCablesToCsv } from './csv';
import type { DesignDocument } from '../model/schema';

describe('exportCablesToCsv', () => {
  it('should export cables correctly', () => {
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
      sites: [], locations: [], racks: [], deviceTypes: [], signalClasses: []
    };

    const csv = exportCablesToCsv(doc);
    expect(csv).toContain('Source Device,Source Port,Target Device,Target Port,Signal Type');
    expect(csv).toContain('"Device 1","port1","Device 2","port2","cat6"');
  });
});
