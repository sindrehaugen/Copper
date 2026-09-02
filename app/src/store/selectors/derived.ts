import { useMemo } from 'react';
import { useDocumentStore } from '../documentStore';

export interface BOMItem {
  deviceTypeId: string;
  name: string;
  manufacturer: string;
  quantity: number;
  unitPrice?: number;
  designators?: string[];
}

export function useBOM(): BOMItem[] {
  const document = useDocumentStore(state => state.document);
  const refs = useReferenceDesignators();

  return useMemo(() => {
    if (!document) return [];
    
    const countMap = new Map<string, number>();
    const desMap = new Map<string, string[]>();

    for (const dev of document.devices) {
      countMap.set(dev.deviceTypeId, (countMap.get(dev.deviceTypeId) || 0) + 1);
      const des = refs[dev.id];
      if (des) {
        if (!desMap.has(dev.deviceTypeId)) desMap.set(dev.deviceTypeId, []);
        desMap.get(dev.deviceTypeId)!.push(des);
      }
    }

    const bom: BOMItem[] = [];
    for (const [typeId, qty] of countMap.entries()) {
      const dt = document.deviceTypes.find(d => d.id === typeId);
      if (dt) {
        if (dt.customFields?.ledConfig) {
          const cfg = dt.customFields.ledConfig as any;
          const numCabinets = (cfg.cols || 1) * (cfg.rows || 1);
          bom.push({
            deviceTypeId: typeId + '_cabinet',
            name: cfg.preset + ' Cabinet',
            manufacturer: 'LED Vendor',
            quantity: qty * numCabinets,
            unitPrice: 0,
            designators: []
          });
          bom.push({
            deviceTypeId: typeId + '_processor',
            name: 'NovaStar H-Series (or similar)',
            manufacturer: 'NovaStar',
            quantity: qty,
            unitPrice: 0,
            designators: []
          });
        }
        bom.push({
          deviceTypeId: typeId,
          name: dt.name as string,
          manufacturer: dt.manufacturer as string,
          quantity: qty,
          unitPrice: (dt.pricing as any)?.msrp,
          designators: desMap.get(typeId) || []
        });
      }
    }
    
    return bom.sort((a, b) => b.quantity - a.quantity);
  }, [document, refs]);
}

export interface CableScheduleRow {
  edgeId: string;
  cableId: string;
  sourceDev: string;
  sourcePort: string;
  targetDev: string;
  targetPort: string;
  lengthM: number | undefined;
  type: string;
  signal: string;
}

export function useCableScheduleRows(): CableScheduleRow[] {
  const document = useDocumentStore(state => state.document);

  return useMemo(() => {
    if (!document) return [];

    const deviceMap = new Map(document.devices.map(d => [d.id, d.name ?? d.id]));

    return document.cables.map((e: any) => {
      let lengthM = e.lengthM !== undefined ? e.lengthM : e.length;
      if (lengthM === undefined) {
        const srcId = e.terminations?.[0]?.deviceId;
        const tgtId = e.terminations?.[1]?.deviceId;
        const p1 = document.geometry?.[srcId]?.position;
        const p2 = document.geometry?.[tgtId]?.position;
        if (p1 && p2) {
          const dist = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
          lengthM = Math.max(1, Math.round(dist * 0.01 * 10) / 10);
        }
      }

      return {
        edgeId: e.id,
        cableId: e.id.substring(0, 8),
        sourceDev: deviceMap.get(e.terminations[0].deviceId) || e.terminations[0].deviceId,
        sourcePort: e.terminations[0].portRef.name,
        targetDev: deviceMap.get(e.terminations[1].deviceId) || e.terminations[1].deviceId,
        targetPort: e.terminations[1].portRef.name,
        lengthM,
        type: e.type,
        signal: e.signalType
      };
    });
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
