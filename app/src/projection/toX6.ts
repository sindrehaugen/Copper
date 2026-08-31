import type { DesignDocument, PortRef, Device } from '../model/schema';
import { CARD_WIDTH, CARD_HEADER_H, CARD_PAD_Y, PORT_ROW_H } from '../model/geometry';

export type LayoutData = Record<string, { x: number; y: number }>;

export interface ToX6Options {
  terminalSpacing?: number;
  headerHeight?: number;
}

function getPortId(portRef: PortRef): string {
  return portRef.id ?? `${portRef.kind}-${portRef.name}`;
}

export function toX6(
  document: DesignDocument,
  layout: LayoutData = {},
  options?: ToX6Options
) {
  const tSpacing = options?.terminalSpacing ?? PORT_ROW_H;
  const hHeight = options?.headerHeight ?? CARD_HEADER_H;

  const edges = document.cables.map((cable) => {
    const sourceTerm = cable.terminations[0];
    const targetTerm = cable.terminations[1];

    return {
      id: cable.id,
      source: { cell: sourceTerm.deviceId, port: getPortId(sourceTerm.portRef) },
      target: { cell: targetTerm.deviceId, port: getPortId(targetTerm.portRef) },
      data: { cable },
    };
  });

  const sourceHandleIds = new Set(edges.map(e => e.source.port));
  const targetHandleIds = new Set(edges.map(e => e.target.port));

  const nodes = document.devices.map((device) => {
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
    const x6Ports: any[] = [];

    // Define X6 ports layout
    let leftIndex = 0;
    let rightIndex = 0;

    for (const p of allPorts) {
      if (targetHandleIds.has(p.id)) {
        inputPorts.push(p);
        x6Ports.push({
          id: p.id,
          group: 'in',
          args: { x: 0, y: hHeight + CARD_PAD_Y + leftIndex * tSpacing + (tSpacing / 2) }
        });
        leftIndex++;
      } else if (sourceHandleIds.has(p.id)) {
        outputPorts.push(p);
        x6Ports.push({
          id: p.id,
          group: 'out',
          args: { x: CARD_WIDTH, y: hHeight + CARD_PAD_Y + rightIndex * tSpacing + (tSpacing / 2) }
        });
        rightIndex++;
      } else {
        const n = p.name.toUpperCase();
        if (n.includes('IN') || n.includes('RX')) {
          inputPorts.push(p);
          x6Ports.push({
            id: p.id,
            group: 'in',
            args: { x: 0, y: hHeight + CARD_PAD_Y + leftIndex * tSpacing + (tSpacing / 2) }
          });
          leftIndex++;
        } else {
          outputPorts.push(p);
          x6Ports.push({
            id: p.id,
            group: 'out',
            args: { x: CARD_WIDTH, y: hHeight + CARD_PAD_Y + rightIndex * tSpacing + (tSpacing / 2) }
          });
          rightIndex++;
        }
      }
    }

    const totalRows = Math.max(inputPorts.length, outputPorts.length);
    const initialHeight = hHeight + CARD_PAD_Y + (totalRows * tSpacing);
    const position = layout[device.id] ?? { x: 0, y: 0 };

    return {
      id: device.id,
      shape: 'device-node',
      x: position.x,
      y: position.y,
      width: CARD_WIDTH,
      height: initialHeight,
      ports: {
        groups: {
          in: { position: 'absolute' },
          out: { position: 'absolute' }
        },
        items: x6Ports
      },
      data: { device, inputPorts, outputPorts },
    };
  });

  return { nodes, edges };
}
