import React, { useCallback } from 'react';
import { getBezierPath, useConnection, type ConnectionLineComponentProps, type Connection } from '@xyflow/react';
import { useDocumentStore } from '../../store/documentStore';
import { validateJoin, type Port, type JoinStatus } from '../../model/validate-join';
import { getDevicePorts } from './nodes/DeviceNode';
import type { Cable, PortRef } from '../../model/schema';

export function CanvasWiringConnectionLine({
  fromX,
  fromY,
  fromPosition,
  toX,
  toY,
  toPosition,
}: ConnectionLineComponentProps) {
  const connection = useConnection();
  const document = useDocumentStore((s) => s.document);

  const [edgePath] = getBezierPath({
    sourceX: fromX,
    sourceY: fromY,
    sourcePosition: fromPosition,
    targetX: toX,
    targetY: toY,
    targetPosition: toPosition,
  });

  let status: JoinStatus | 'none' = 'none';

  if (connection && connection.toHandle && connection.fromHandle && document) {
    const fromNodeId = connection.fromHandle.nodeId;
    const fromPortId = connection.fromHandle.id;
    const toNodeId = connection.toHandle.nodeId;
    const toPortId = connection.toHandle.id;

    const sourceDevice = document.devices.find((d) => d.id === fromNodeId);
    const targetDevice = document.devices.find((d) => d.id === toNodeId);

    if (sourceDevice && targetDevice) {
      const sourcePorts = getDevicePorts(sourceDevice);
      const targetPorts = getDevicePorts(targetDevice);
      
      const sPort = sourcePorts.find((p) => p.id === fromPortId);
      const tPort = targetPorts.find((p) => p.id === toPortId);

      if (sPort && tPort) {
        const sPortType: Port = {
          signalType: sPort.signalClassId ?? 'UNKNOWN',
          connectorType: sPort.type ?? 'UNKNOWN',
        };
        const tPortType: Port = {
          signalType: tPort.signalClassId ?? 'UNKNOWN',
          connectorType: tPort.type ?? 'UNKNOWN',
        };

        status = validateJoin(sPortType, tPortType);
      }
    }
  }

  let strokeColor = 'var(--md-sys-color-primary, #6750a4)';
  if (status === 'direct' || status === 'adapter') {
    strokeColor = 'var(--md-sys-color-success, #2e7d32)';
  } else if (status === 'incompatible') {
    strokeColor = 'var(--md-sys-color-error, #b3261e)';
  }

  return (
    <g>
      <path
        fill="none"
        stroke={strokeColor}
        strokeWidth={3}
        className="copper-connection-line"
        d={edgePath}
      />
      <circle cx={toX} cy={toY} fill={strokeColor} r={4} stroke={strokeColor} strokeWidth={2} />
    </g>
  );
}

export function useWiringInteraction() {
  const updateDocument = useDocumentStore((s) => s.updateDocument);
  const document = useDocumentStore((s) => s.document);

  const onConnect = useCallback((connection: Connection) => {
    if (!document) return;
    const { source, sourceHandle, target, targetHandle } = connection;
    if (!source || !sourceHandle || !target || !targetHandle) return;

    const sourceDevice = document.devices.find((d) => d.id === source);
    const targetDevice = document.devices.find((d) => d.id === target);
    if (!sourceDevice || !targetDevice) return;

    const sPort = getDevicePorts(sourceDevice).find((p) => p.id === sourceHandle);
    const tPort = getDevicePorts(targetDevice).find((p) => p.id === targetHandle);
    if (!sPort || !tPort) return;

    const sId = sPort.id === `${sPort.kind}-${sPort.name}` ? undefined : sPort.id;
    const tId = tPort.id === `${tPort.kind}-${tPort.name}` ? undefined : tPort.id;

    const sPortRef = { kind: sPort.kind, name: sPort.name, id: sId } as PortRef;
    const tPortRef = { kind: tPort.kind, name: tPort.name, id: tId } as PortRef;

    updateDocument((draft) => {
      const newCable: Cable = {
        id: crypto.randomUUID(),
        terminations: [
          { deviceId: source, portRef: sPortRef },
          { deviceId: target, portRef: tPortRef }
        ],
        status: 'planned'
      };
      if (!draft.cables) {
        draft.cables = [];
      }
      draft.cables.push(newCable);
    });
  }, [document, updateDocument]);

  return {
    connectionLineComponent: CanvasWiringConnectionLine,
    onConnect,
    isValidConnection: () => true
  };
}
