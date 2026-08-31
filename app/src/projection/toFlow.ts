import type { Node, Edge } from '@xyflow/react';
import type { DesignDocument, PortRef } from '../model/schema';
import { CARD_WIDTH, CARD_HEADER_H, CARD_PAD_Y, PORT_ROW_H } from '../model/geometry';

export type LayoutData = Record<string, { x: number; y: number }>;

function getPortId(portRef: PortRef): string {
  return portRef.id ?? `${portRef.kind}-${portRef.name}`;
}

export function toFlow(
  document: DesignDocument,
  layout: LayoutData = {}
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = document.devices.map((device) => {
    const totalPorts =
      (device.interfaces?.length ?? 0) +
      (device.frontPorts?.length ?? 0) +
      (device.rearPorts?.length ?? 0) +
      (device.consolePorts?.length ?? 0) +
      (device.powerPorts?.length ?? 0) +
      (device.powerOutlets?.length ?? 0);

    const initialHeight = CARD_HEADER_H + CARD_PAD_Y + totalPorts * PORT_ROW_H;
    const position = layout[device.id] ?? { x: 0, y: 0 };

    return {
      id: device.id,
      type: 'device',
      position,
      data: { device },
      initialWidth: CARD_WIDTH,
      initialHeight,
    };
  });

  const edges: Edge[] = document.cables.map((cable) => {
    const sourceTerm = cable.terminations[0];
    const targetTerm = cable.terminations[1];

    return {
      id: cable.id,
      source: sourceTerm.deviceId,
      sourceHandle: getPortId(sourceTerm.portRef),
      target: targetTerm.deviceId,
      targetHandle: getPortId(targetTerm.portRef),
    };
  });

  return { nodes, edges };
}


