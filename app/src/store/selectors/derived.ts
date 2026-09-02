import { useMemo } from 'react';
import { useDocumentStore } from '../documentStore';

export interface BOMItem {
  deviceTypeId: string;
  name: string;
  manufacturer: string;
  quantity: number;
  unitPrice?: number;
}

export function useBOM(): BOMItem[] {
  const document = useDocumentStore(state => state.document);

  return useMemo(() => {
    if (!document) return [];
    
    const countMap = new Map<string, number>();
    for (const dev of document.devices) {
      countMap.set(dev.deviceTypeId, (countMap.get(dev.deviceTypeId) || 0) + 1);
    }

    const bom: BOMItem[] = [];
    for (const [typeId, qty] of countMap.entries()) {
      const dt = document.deviceTypes.find(d => d.id === typeId);
      if (dt) {
        bom.push({
          deviceTypeId: typeId,
          name: dt.name as string,
          manufacturer: dt.manufacturer as string,
          quantity: qty,
          unitPrice: (dt.pricing as any)?.msrp
        });
      }
    }
    
    return bom.sort((a, b) => b.quantity - a.quantity);
  }, [document]);
}

export interface CableScheduleRow {
  edgeId: string;
  cableId: string;
  sourceDev: string;
  sourcePort: string;
  targetDev: string;
  targetPort: string;
  lengthM: number;
  type: string;
  signal: string;
}

export function useCableScheduleRows(): CableScheduleRow[] {
  const document = useDocumentStore(state => state.document);

  return useMemo(() => {
    if (!document) return [];

    const deviceMap = new Map(document.devices.map(d => [d.id, d.name ?? d.id]));

    return document.cables.map((e: any) => ({
      edgeId: e.id,
      cableId: e.id.substring(0, 8),
      sourceDev: deviceMap.get(e.terminations[0].deviceId) || e.terminations[0].deviceId,
      sourcePort: e.terminations[0].portRef.name,
      targetDev: deviceMap.get(e.terminations[1].deviceId) || e.terminations[1].deviceId,
      targetPort: e.terminations[1].portRef.name,
      lengthM: e.lengthM, // will be overridden by B109
      type: e.type,
      signal: e.signalType
    }));
  }, [document]);
}

// B103 Reference Designators live derivations
export function useReferenceDesignators(): Record<string, string> {
  const document = useDocumentStore(state => state.document);
  return useMemo(() => {
    if (!document) return {};
    const designators: Record<string, string> = {};
    const typeCount: Record<string, number> = {};
    
    for (const dev of document.devices) {
      const dt = document.deviceTypes.find(d => d.id === dev.deviceTypeId);
      const prefix = (dt?.name as string | undefined)?.substring(0, 2).toUpperCase() || 'DV';
      typeCount[prefix] = (typeCount[prefix] || 0) + 1;
      designators[dev.id] = `${prefix}-${typeCount[prefix].toString().padStart(2, '0')}`;
    }
    return designators;
  }, [document]);
}
