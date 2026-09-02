import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useBOM, useCableScheduleRows, useReferenceDesignators } from './derived';
import { useDocumentStore } from '../documentStore';

describe('derived selectors', () => {
  beforeEach(() => {
    useDocumentStore.setState({ document: null as any, selectedIds: [] });
  });

  describe('useReferenceDesignators', () => {
    it('generates designators for devices based on device type name', () => {
      const doc = {
        devices: [
          { id: 'd1', deviceTypeId: 'dt1' },
          { id: 'd2', deviceTypeId: 'dt1' },
          { id: 'd3', deviceTypeId: 'dt2' },
        ],
        deviceTypes: [
          { id: 'dt1', name: 'Amplifier' },
          { id: 'dt2', name: 'Speaker' },
        ]
      } as any;
      useDocumentStore.setState({ document: doc });

      const { result } = renderHook(() => useReferenceDesignators());
      expect(result.current).toEqual({
        d1: 'AM-01',
        d2: 'AM-02',
        d3: 'SP-01'
      });
    });
  });

  describe('useBOM', () => {
    it('aggregates BOM items and includes reference designators', () => {
      const doc = {
        devices: [
          { id: 'd1', deviceTypeId: 'dt1' },
          { id: 'd2', deviceTypeId: 'dt1' },
          { id: 'd3', deviceTypeId: 'dt2' },
        ],
        deviceTypes: [
          { id: 'dt1', name: 'Amplifier', manufacturer: 'Acme', pricing: { msrp: 100 } },
          { id: 'dt2', name: 'Speaker', manufacturer: 'Globex' },
        ]
      } as any;
      useDocumentStore.setState({ document: doc });

      const { result } = renderHook(() => useBOM());
      
      const bom = result.current;
      expect(bom).toHaveLength(2);
      
      const amp = bom.find(i => i.deviceTypeId === 'dt1');
      expect(amp).toBeDefined();
      expect(amp?.quantity).toBe(2);
      expect(amp?.designators).toEqual(['AM-01', 'AM-02']);
      expect(amp?.unitPrice).toBe(100);

      const spk = bom.find(i => i.deviceTypeId === 'dt2');
      expect(spk).toBeDefined();
      expect(spk?.quantity).toBe(1);
      expect(spk?.designators).toEqual(['SP-01']);
    });
  });

  describe('useCableScheduleRows', () => {
    it('uses pre-computed lengthM if available', () => {
      const doc = {
        deviceTypes: [],
        devices: [
          { id: 'd1', name: 'Device 1' },
          { id: 'd2', name: 'Device 2' }
        ],
        cables: [
          {
            id: 'c1',
            lengthM: 25,
            type: 'cat6',
            signalType: 'ETHERNET',
            terminations: [
              { deviceId: 'd1', portRef: { name: 'out' } },
              { deviceId: 'd2', portRef: { name: 'in' } }
            ]
          }
        ]
      } as any;
      useDocumentStore.setState({ document: doc });

      const { result } = renderHook(() => useCableScheduleRows());
      expect(result.current).toHaveLength(1);
      expect(result.current[0]?.lengthM).toBe(25);
    });

    it('derives Euclidean length from geometry if lengthM is missing', () => {
      const doc = {
        deviceTypes: [],
        devices: [
          { id: 'd1' },
          { id: 'd2' }
        ],
        geometry: {
          d1: { position: { x: 0, y: 0 } },
          d2: { position: { x: 300, y: 400 } } // dist = 500
        },
        cables: [
          {
            id: 'c1',
            terminations: [
              { deviceId: 'd1', portRef: { name: 'out' } },
              { deviceId: 'd2', portRef: { name: 'in' } }
            ]
          }
        ]
      } as any;
      useDocumentStore.setState({ document: doc });

      const { result } = renderHook(() => useCableScheduleRows());
      // distance 500 px -> 5 meters (0.01 scale)
      expect(result.current[0]?.lengthM).toBe(5);
    });
    
    it('returns undefined length if geometry is missing', () => {
      const doc = {
        deviceTypes: [],
        devices: [
          { id: 'd1' },
          { id: 'd2' }
        ],
        cables: [
          {
            id: 'c1',
            terminations: [
              { deviceId: 'd1', portRef: { name: 'out' } },
              { deviceId: 'd2', portRef: { name: 'in' } }
            ]
          }
        ]
      } as any;
      useDocumentStore.setState({ document: doc });

      const { result } = renderHook(() => useCableScheduleRows());
      expect(result.current[0]?.lengthM).toBeUndefined();
    });
  });
});
