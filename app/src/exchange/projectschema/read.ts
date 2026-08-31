import { z } from 'zod';
import {
  DesignDocumentSchema,
  type Cable,
  type DesignDocument,
  type Device,
  type DeviceType,
  type Interface,
  type Location,
  type Rack,
  type Site,
} from '../../model/schema';

// ============================================================================
// Report Types & Interfaces
// ============================================================================

export interface SkippedObject {
  kind: string;
  id: string;
  reason: string;
}

export interface ImportReport {
  unmappedFields: Record<string, number>;
  skippedObjects: SkippedObject[];
  signalTypes: Record<string, number>;
  deviceCount: number;
  cableCount: number;
  locationCount: number;
  rackCount: number;
  portCount: number;
}

// ============================================================================
// Lenient Foreign Zod Schemas (passthrough)
// ============================================================================

const EsPortSchema = z
  .object({
    id: z.string(),
    label: z.string().optional(),
    signalType: z.string().optional(),
    direction: z.string().optional(),
    connectorType: z.string().optional(),
  })
  .passthrough();

const EsAuxRowSchema = z
  .object({
    text: z.string().optional(),
    position: z.string().optional(),
  })
  .passthrough();

const EsNodeDataSchema = z
  .object({
    label: z.string().optional(),
    locked: z.boolean().optional(),
    deviceType: z.string().optional(),
    manufacturer: z.string().optional(),
    modelNumber: z.string().optional(),
    ports: z.array(EsPortSchema).optional(),
    auxiliaryData: z.array(EsAuxRowSchema).optional(),
    html: z.string().optional(),
  })
  .passthrough();

const EsNodeSchema = z
  .object({
    id: z.string(),
    type: z.string(),
    position: z.object({ x: z.number(), y: z.number() }).optional(),
    parentId: z.string().optional(),
    data: EsNodeDataSchema.optional(),
    style: z.record(z.unknown()).optional(),
    width: z.number().optional(),
    height: z.number().optional(),
    zIndex: z.number().optional(),
  })
  .passthrough();

const EsEdgeDataSchema = z
  .object({
    signalType: z.string().optional(),
    label: z.string().optional(),
  })
  .passthrough();

const EsEdgeSchema = z
  .object({
    id: z.string(),
    source: z.string(),
    target: z.string(),
    sourceHandle: z.string(),
    targetHandle: z.string(),
    data: EsEdgeDataSchema.optional(),
    style: z.record(z.unknown()).optional(),
  })
  .passthrough();

const EsTitleBlockSchema = z
  .object({
    showName: z.string().optional(),
    venue: z.string().optional(),
    designer: z.string().optional(),
    engineer: z.string().optional(),
    drawingTitle: z.string().optional(),
    date: z.string().optional(),
    company: z.string().optional(),
    revision: z.string().optional(),
  })
  .passthrough();

const EsFileSchema = z
  .object({
    version: z.number().optional(),
    name: z.string().optional(),
    nodes: z.array(EsNodeSchema).optional().default([]),
    edges: z.array(EsEdgeSchema).optional().default([]),
    printPaperId: z.string().optional(),
    printOrientation: z.string().optional(),
    printScale: z.number().optional(),
    titleBlock: EsTitleBlockSchema.optional(),
    customFields: z.array(z.unknown()).optional(),
  })
  .passthrough();

type EsFile = z.infer<typeof EsFileSchema>;

// ============================================================================
// Helper Utilities
// ============================================================================

function recordUnmapped(report: ImportReport, key: string, count = 1): void {
  report.unmappedFields[key] = (report.unmappedFields[key] || 0) + count;
}

function toIdentifier(raw: string): string {
  const sanitized = raw.trim().replace(/[_%\s]+/g, '-');
  return sanitized || 'id';
}

function extractDesignation(aux?: Array<{ text?: string | undefined }>): string | undefined {
  if (!aux) return undefined;
  for (const row of aux) {
    const txt = (row.text ?? '').trim();
    if (txt && /^[A-Z0-9.:+=-]+$/.test(txt)) {
      return txt;
    }
  }
  return undefined;
}

// ============================================================================
// Main Reader Function
// ============================================================================

/**
 * Parses an ProjectSchema JSON document into Copper's DesignDocument model,
 * transparently tracking all unmapped fields and skipped objects in ImportReport.
 */
export function readProjectSchema(json: unknown): {
  document: DesignDocument;
  report: ImportReport;
} {
  const report: ImportReport = {
    unmappedFields: {},
    skippedObjects: [],
    signalTypes: {},
    deviceCount: 0,
    cableCount: 0,
    locationCount: 0,
    rackCount: 0,
    portCount: 0,
  };

  const parsedFile: EsFile = EsFileSchema.parse(json);

  // --- Track Unmapped Top-Level & TitleBlock Fields ---
  const mappedRootKeys = new Set(['name', 'nodes', 'edges', 'titleBlock']);
  if (typeof json === 'object' && json !== null) {
    for (const key of Object.keys(json as Record<string, unknown>)) {
      if (!mappedRootKeys.has(key)) {
        recordUnmapped(report, key);
      }
    }
  }

  if (parsedFile.titleBlock) {
    const mappedTitleBlockKeys = new Set(['showName', 'venue', 'revision']);
    for (const key of Object.keys(parsedFile.titleBlock)) {
      if (!mappedTitleBlockKeys.has(key)) {
        recordUnmapped(report, key);
      }
    }
  }

  // --- 1. Site Creation ---
  const siteName = parsedFile.titleBlock?.showName?.trim() || parsedFile.name?.trim() || 'Default Site';
  const site: Site = {
    id: 'site-main',
    name: siteName,
    slug: 'site-main',
    description: parsedFile.titleBlock?.venue?.trim() || undefined,
  };

  // --- 2. Process Nodes (Rooms -> Locations, Devices -> Devices & DeviceTypes, Racks -> Racks) ---
  const locations: Location[] = [];
  const locationIdSet = new Set<string>();
  const racks: Rack[] = [];
  const dtMap = new Map<string, DeviceType>();
  const devices: Device[] = [];
  const deviceMap = new Map<string, Device>();

  for (const node of parsedFile.nodes) {
    // Track unmapped layout & styling keys on nodes
    if (node.position !== undefined) recordUnmapped(report, 'position');
    if (node.style !== undefined) recordUnmapped(report, 'style');
    if (node.width !== undefined) recordUnmapped(report, 'width');
    if (node.height !== undefined) recordUnmapped(report, 'height');
    if (node.zIndex !== undefined) recordUnmapped(report, 'zIndex');

    // Track unexpected keys on node object
    const standardNodeKeys = new Set([
      'id',
      'type',
      'position',
      'parentId',
      'data',
      'style',
      'width',
      'height',
      'zIndex',
    ]);
    for (const key of Object.keys(node)) {
      if (!standardNodeKeys.has(key)) {
        recordUnmapped(report, key);
      }
    }

    if (node.type === 'room' || node.type === 'zone') {
      const locId = toIdentifier(node.id);
      const locName = node.data?.label?.trim() || locId;

      if (node.data) {
        const mappedRoomDataKeys = new Set(['label']);
        for (const key of Object.keys(node.data)) {
          if (!mappedRoomDataKeys.has(key)) {
            recordUnmapped(report, key);
          }
        }
      }

      locations.push({
        id: locId,
        name: locName,
        slug: locId.toLowerCase(),
        siteId: site.id,
      });
      locationIdSet.add(locId);
    } else if (node.type === 'rack') {
      const rackId = toIdentifier(node.id);
      const rackName = node.data?.label?.trim() || rackId;

      if (node.data) {
        const mappedRackDataKeys = new Set(['label']);
        for (const key of Object.keys(node.data)) {
          if (!mappedRackDataKeys.has(key)) {
            recordUnmapped(report, key);
          }
        }
      }

      racks.push({
        id: rackId,
        name: rackName,
        siteId: site.id,
        locationId: node.parentId ? toIdentifier(node.parentId) : undefined,
        uHeight: 42,
        status: 'active',
      });
    } else if (node.type === 'device') {
      const data = node.data;
      if (data) {
        const mappedDeviceDataKeys = new Set([
          'label',
          'deviceType',
          'manufacturer',
          'modelNumber',
          'ports',
          'auxiliaryData',
        ]);
        for (const key of Object.keys(data)) {
          if (!mappedDeviceDataKeys.has(key)) {
            recordUnmapped(report, key);
          }
        }

        if (data.auxiliaryData) {
          const standardAuxKeys = new Set(['text', 'position']);
          for (const row of data.auxiliaryData) {
            for (const key of Object.keys(row)) {
              if (!standardAuxKeys.has(key)) {
                recordUnmapped(report, key);
              }
            }
          }
        }
      }

      const mfg = data?.manufacturer?.trim() || 'Generic';
      const model = data?.modelNumber?.trim() || data?.label?.trim() || 'Unknown';
      const prodKey = `${mfg}|${model}`;

      if (!dtMap.has(prodKey)) {
        const dtId = toIdentifier(`dt-${mfg.toLowerCase()}-${model.toLowerCase()}`);
        dtMap.set(prodKey, {
          id: dtId,
          manufacturer: mfg,
          model: model,
          slug: dtId.replace(/^dt-/, ''),
          uHeight: 1,
          isFullDepth: false,
          description: data?.deviceType || undefined,
        });
      }

      const devType = dtMap.get(prodKey)!;
      const devId = toIdentifier(node.id);
      const devName = data?.label?.trim() || data?.modelNumber?.trim() || devId;
      const parentLocId = node.parentId ? toIdentifier(node.parentId) : undefined;
      const validLocationId = parentLocId && locationIdSet.has(parentLocId) ? parentLocId : undefined;
      const designation = extractDesignation(data?.auxiliaryData);

      // Materialize ports
      const interfaces: Interface[] = (data?.ports ?? []).map((p) => {
        // Track extra port keys
        const standardPortKeys = new Set(['id', 'label', 'signalType', 'direction', 'connectorType']);
        for (const key of Object.keys(p)) {
          if (!standardPortKeys.has(key)) {
            recordUnmapped(report, key);
          }
        }

        const pSignal = p.signalType?.trim();
        const pConnector = p.connectorType?.trim();

        if (pSignal) {
          report.signalTypes[pSignal] = (report.signalTypes[pSignal] || 0) + 1;
        }

        const pId = toIdentifier(p.id);
        const pName = p.label?.trim() || pId;

        return {
          id: pId,
          name: pName,
          label: p.label?.trim() || undefined,
          type: pConnector || pSignal || 'other',
          connectorType: pConnector || undefined,
          signalClassId: pSignal && /^[^_%\s]+$/.test(pSignal) ? pSignal : undefined,
        };
      });

      report.portCount += interfaces.length;

      const device: Device = {
        id: devId,
        name: devName,
        deviceTypeId: devType.id,
        siteId: site.id,
        locationId: validLocationId,
        status: 'active',
        designation: designation,
        interfaces: interfaces.length > 0 ? interfaces : undefined,
      };

      devices.push(device);
      deviceMap.set(devId, device);
    } else {
      // Unhandled node type (e.g. note) -> skip and record
      report.skippedObjects.push({
        kind: node.type || 'unknown',
        id: node.id,
        reason: `Node type "${node.type}" is not supported in DesignDocument`,
      });

      if (node.data) {
        for (const key of Object.keys(node.data)) {
          recordUnmapped(report, key);
        }
      }
    }
  }

  report.locationCount = locations.length;
  report.rackCount = racks.length;
  report.deviceCount = devices.length;

  // --- 3. Process Edges -> Cables ---
  const cables: Cable[] = [];

  for (const edge of parsedFile.edges) {
    if (edge.style !== undefined) recordUnmapped(report, 'style');

    const standardEdgeKeys = new Set(['id', 'source', 'target', 'sourceHandle', 'targetHandle', 'data', 'style']);
    for (const key of Object.keys(edge)) {
      if (!standardEdgeKeys.has(key)) {
        recordUnmapped(report, key);
      }
    }

    if (edge.data) {
      const standardEdgeDataKeys = new Set(['signalType', 'label']);
      for (const key of Object.keys(edge.data)) {
        if (!standardEdgeDataKeys.has(key)) {
          recordUnmapped(report, key);
        }
      }
    }

    const edgeSignal = edge.data?.signalType?.trim();
    if (edgeSignal) {
      report.signalTypes[edgeSignal] = (report.signalTypes[edgeSignal] || 0) + 1;
    }

    const sourceDevId = toIdentifier(edge.source);
    const targetDevId = toIdentifier(edge.target);
    const sourceDev = deviceMap.get(sourceDevId);
    const targetDev = deviceMap.get(targetDevId);

    // Wire endpoint guard: check device existence
    if (!sourceDev || !targetDev) {
      report.skippedObjects.push({
        kind: 'cable',
        id: edge.id,
        reason: `Missing endpoint device: source "${edge.source}" found=${!!sourceDev}, target "${edge.target}" found=${!!targetDev}`,
      });
      continue;
    }

    // Wire endpoint guard: check port existence
    const sourcePort = sourceDev.interfaces?.find(
      (i) => i.id === toIdentifier(edge.sourceHandle) || i.name === edge.sourceHandle
    );
    const targetPort = targetDev.interfaces?.find(
      (i) => i.id === toIdentifier(edge.targetHandle) || i.name === edge.targetHandle
    );

    if (!sourcePort || !targetPort) {
      report.skippedObjects.push({
        kind: 'cable',
        id: edge.id,
        reason: `Missing endpoint port: sourceHandle "${edge.sourceHandle}" on ${sourceDevId} found=${!!sourcePort}, targetHandle "${edge.targetHandle}" on ${targetDevId} found=${!!targetPort}`,
      });
      continue;
    }

    const cable: Cable = {
      id: toIdentifier(edge.id),
      status: 'connected',
      type: edgeSignal || undefined,
      label: edge.data?.label?.trim() || undefined,
      terminations: [
        {
          deviceId: sourceDev.id,
          portRef: {
            kind: 'interface',
            name: sourcePort.name,
            id: sourcePort.id,
          },
        },
        {
          deviceId: targetDev.id,
          portRef: {
            kind: 'interface',
            name: targetPort.name,
            id: targetPort.id,
          },
        },
      ],
    };

    cables.push(cable);
  }

  report.cableCount = cables.length;

  // --- 4. Assemble and Strictly Validate DesignDocument ---
  const doc: DesignDocument = {
    schemaVersion: 1,
    designLabel: parsedFile.name?.trim() || 'Untitled ProjectSchema Design',
    revision: parsedFile.titleBlock?.revision?.trim() || undefined,
    sites: [site],
    locations: locations,
    racks: racks,
    deviceTypes: Array.from(dtMap.values()),
    devices: devices,
    cables: cables,
    signalClasses: [],
  };

  const validatedDocument = DesignDocumentSchema.parse(doc);

  return {
    document: validatedDocument,
    report,
  };
}
