
import type { EquipmentDatabase, SignalNode } from './types/domain';
import type { ChainInput } from './engine';

export interface CopperDeviceType {
  id: string;
  manufacturer: string;
  model: string;
  slug: string;
  customFields?: {
    acoustics?: any;
  };
}

export interface CopperDevice {
  id: string;
  name?: string;
  typeId?: string;
  deviceTypeId?: string;
  interfaces?: { id: string; name: string }[];
  frontPorts?: { id: string; name: string }[];
  rearPorts?: { id: string; name: string }[];
  customFields?: {
    acoustics?: any;
  };
}

export interface CopperCable {
  type?: string;
  id: string;
  terminations: [
    { deviceId: string; portRef: { kind: string; id?: string; name: string } },
    { deviceId: string; portRef: { kind: string; id?: string; name: string } }
  ];
  lengthM?: number;
  customFields?: {
    acoustics?: any;
  };
}

export interface AdapterInput {
  deviceTypes: CopperDeviceType[];
  devices: CopperDevice[];
  cables: CopperCable[];
  tempC?: number;
}

export function buildChainInput(input: AdapterInput): ChainInput {
  const db: EquipmentDatabase = {
    speakers: {},
    cables: {},
    amplifiers: {}
  };

  const ampRack: Record<string, { slug: string; modelId: string; channelsUsed: number[] }> = {};
  
  for (const dt of input.deviceTypes) {
    const ac = dt.customFields?.acoustics;
    if (!ac) continue;
    
    if (ac.device_class === 'speaker') {
      db.speakers[dt.id] = {
        slug: dt.slug,
        manufacturer: dt.manufacturer,
        model: dt.model,
        impedance: ac.impedance ?? 8,
        z_min: ac.z_min,
        wattage_rms: ac.wattage_rms ?? 0,
        wattage_peak: ac.wattage_peak,
        max_spl: ac.max_spl,
        taps: ac.taps ?? [],
        type: ac.type as any,
        category: ac.category
      };
    } else if (ac.device_class === 'amplifier') {
      db.amplifiers[dt.id] = {
        slug: dt.slug,
        manufacturer: dt.manufacturer,
        model: dt.model,
        min_load: ac.min_load,
        watt_8: ac.watt_8,
        watt_4: ac.watt_4,
        watt_2: ac.watt_2,
        watt_100v: ac.watt_100v,
        min_load_bridge: ac.min_load_bridge,
        watt_bridge_8: ac.watt_bridge_8,
        watt_bridge_4: ac.watt_bridge_4
      };
    } else if (ac.device_class === 'cable') {
      db.cables[dt.id] = {
        slug: dt.slug,
        manufacturer: dt.manufacturer,
        model: dt.model,
        resistance: ac.resistance ?? 0,
        capacitance: ac.capacitance,
        inductance: ac.inductance
      };
    }
  }

  for (const c of input.cables) {
    const ac = c.customFields?.acoustics;
    if (ac && ac.device_class === 'cable') {
      db.cables[c.id] = {
        slug: c.id,
        manufacturer: 'Custom',
        model: 'Cable',
        resistance: ac.resistance ?? 0,
        capacitance: ac.capacitance,
        inductance: ac.inductance
      };
    }
  }

  const deviceMap = new Map<string, CopperDevice>();
  for (const d of input.devices) {
    deviceMap.set(d.id, d);
    const typeId = d.typeId || d.deviceTypeId || '';
    if (db.amplifiers[typeId]) {
      ampRack[d.id] = { slug: d.name || d.id, modelId: typeId, channelsUsed: [] };
    }
  }

  const connectionsByDevice = new Map<string, { cable: CopperCable, otherDevice: string, otherPort: string, myPort: string }[]>();
  for (const c of input.cables) {
    const t0 = c.terminations[0];
    const t1 = c.terminations[1];
    if (!connectionsByDevice.has(t0.deviceId)) connectionsByDevice.set(t0.deviceId, []);
    if (!connectionsByDevice.has(t1.deviceId)) connectionsByDevice.set(t1.deviceId, []);
    connectionsByDevice.get(t0.deviceId)!.push({ cable: c, otherDevice: t1.deviceId, otherPort: t1.portRef.name, myPort: t0.portRef.name });
    connectionsByDevice.get(t1.deviceId)!.push({ cable: c, otherDevice: t0.deviceId, otherPort: t0.portRef.name, myPort: t1.portRef.name });
  }

  const roots: SignalNode[] = [];
  const visitedNodes = new Set<string>();

  function buildTree(deviceId: string, cableFromParent: CopperCable | null, parentId: string | null, ampInstanceId: string): SignalNode | null {
    if (visitedNodes.has(deviceId)) return null;
    const dev = deviceMap.get(deviceId);
    if (!dev) return null;
    const typeId = dev.typeId || dev.deviceTypeId || '';
    const isAmp = !!db.amplifiers[typeId];
    const isSpeaker = !!db.speakers[typeId];
    if (!isAmp && !isSpeaker) return null;
    visitedNodes.add(deviceId);
    let cableType: string = '';
    if (cableFromParent?.type && db.cables[cableFromParent.type]) {
      cableType = cableFromParent.type;
    } else if (cableFromParent?.customFields?.acoustics?.device_class === 'cable') {
      cableType = cableFromParent.id;
    }
    if (!cableType && cableFromParent) {
      const dbCableKeys = Object.keys(db.cables);
      if (dbCableKeys.length > 0) cableType = dbCableKeys[0] as string;
    }
    const node: SignalNode = {
      slug: dev.id,
      parentId: parentId,
      userLabel: dev.name || dev.id,
      ampInstanceId: ampInstanceId,
      ampChannel: 1,
      useBridgeMode: false,
      speakerId: isSpeaker ? (dev.typeId as string) || (dev.deviceTypeId as string) || '' : '',
      parallelCount: 1,
      tapPower: dev.customFields?.acoustics?.taps?.[0] || 0,
      cableId: cableType || '',
      length: cableFromParent?.lengthM ?? 0,
      useCable2: false,
      cable2Id: '',
      length2: 0,
      children: [],
      results: { status: 'OK' }
    };
    const conns = connectionsByDevice.get(deviceId) || [];
    for (const conn of conns) {
      if (cableFromParent && conn.cable.id === cableFromParent.id) continue;
      const childNode = buildTree(conn.otherDevice, conn.cable, dev.id, ampInstanceId);
      if (childNode) node.children.push(childNode);
    }
    visitedNodes.delete(deviceId);
    return node;
  }

  for (const [id] of deviceMap.entries()) {
    if (ampRack[id]) {
      const conns = connectionsByDevice.get(id) || [];
      for (const conn of conns) {
        if (conn.myPort.toLowerCase().includes('in')) continue;
        const childNode = buildTree(conn.otherDevice, conn.cable, null, id);
        if (childNode) roots.push(childNode);
      }
    }
  }

  let mode: 'low-z' | 'high-v' = 'low-z';
  for (const root of roots) {
    const spk = db.speakers[root.speakerId];
    if (spk && (spk.type === '100V' || spk.type === 'Both' || root.tapPower > 0)) { mode = 'high-v'; break; }
  }

  return { roots, db, ampRack, mode, quality: { name: 'Standard', color: '#000000', minDamping: 20, maxDrop: 10, hfCheckHz: 10000 }, tempC: input.tempC ?? 20, grid: [100, 1000, 10000] };
}

