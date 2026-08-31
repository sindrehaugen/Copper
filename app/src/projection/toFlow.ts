import type { Node, Edge } from '@xyflow/react';
import type { DesignDocument, PortRef, Device } from '../model/schema';
import { CARD_WIDTH, CARD_HEADER_H, CARD_PAD_Y, PORT_ROW_H } from '../model/geometry';

export type LayoutData = Record<string, { x: number; y: number }>;

export interface ToFlowOptions {
  terminalSpacing?: number;
  headerHeight?: number;
}

function getPortId(portRef: PortRef): string {
  return portRef.id ?? `${portRef.kind}-${portRef.name}`;
}

export function toFlow(
  document: DesignDocument,
  layout: LayoutData = {},
  options?: ToFlowOptions
): { nodes: Node[]; edges: Edge[] } {
  const tSpacing = options?.terminalSpacing ?? PORT_ROW_H;
  const hHeight = options?.headerHeight ?? CARD_HEADER_H;

  const edges: Edge[] = document.cables.map((cable) => {
    const sourceTerm = cable.terminations[0];
    const targetTerm = cable.terminations[1];

    return {
      id: cable.id,
      source: sourceTerm.deviceId,
      sourceHandle: getPortId(sourceTerm.portRef),
      target: targetTerm.deviceId,
      targetHandle: getPortId(targetTerm.portRef),
      data: { cable },
    };
  });

  const sourceHandleIds = new Set(edges.map(e => e.sourceHandle));
  const targetHandleIds = new Set(edges.map(e => e.targetHandle));

  const nodes: Node[] = document.devices.map((device) => {
    const allPorts: Array<{id: string, name: string, label?: string, kind: string, type?: string}> = [];
    
    const addPorts = (list: any[] | undefined, kind: string) => {
      if (!list) return;
      for (const p of list) {
        allPorts.push({
          id: p.id ?? `${kind}-${p.name}`,
          name: p.name,
          label: p.label,
          kind,
          type: p.type
        });
      }
    };

    addPorts(device.interfaces, 'interface');
    addPorts(device.frontPorts, 'frontPort');
    addPorts(device.rearPorts, 'rearPort');
    addPorts(device.consolePorts, 'consolePort');
    addPorts(device.powerPorts, 'powerPort');
    addPorts(device.powerOutlets, 'powerOutlet');

    const inputPorts: typeof allPorts = [];
    const outputPorts: typeof allPorts = [];

    for (const p of allPorts) {
      if (targetHandleIds.has(p.id)) {
        inputPorts.push(p);
      } else if (sourceHandleIds.has(p.id)) {
        outputPorts.push(p);
      } else {
        const n = p.name.toUpperCase();
        if (n.includes('IN') || n.includes('RX')) {
          inputPorts.push(p);
        } else {
          outputPorts.push(p);
        }
      }
    }

    const totalRows = Math.max(inputPorts.length, outputPorts.length);
    const initialHeight = hHeight + CARD_PAD_Y + (totalRows * tSpacing);
    const position = layout[device.id] ?? { x: 0, y: 0 };

    return {
      id: device.id,
      type: 'device',
      position,
      data: { device, inputPorts, outputPorts },
      initialWidth: CARD_WIDTH,
      initialHeight,
    };
  });

  return { nodes, edges };
}
