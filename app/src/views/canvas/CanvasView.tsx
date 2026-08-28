import type { CSSProperties, JSX } from 'react';
import {
  ReactFlow,
  type Node,
  type Edge,
  type NodeTypes,
  type ReactFlowProps,
} from '@xyflow/react';
import { DeviceNode } from './nodes/DeviceNode';

export const defaultNodeTypes: NodeTypes = {
  device: DeviceNode,
};

export interface CanvasViewProps extends Omit<ReactFlowProps, 'nodes' | 'edges'> {
  nodes?: Node[];
  edges?: Edge[];
  className?: string;
  style?: CSSProperties;
}

const defaultCanvasStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  minHeight: '400px',
};

/**
 * Read-only React Flow CanvasView rendering toFlow projection.
 * Defaults to read-only interaction and wires custom DeviceNode.
 */
export function CanvasView({
  nodes = [],
  edges = [],
  nodeTypes = defaultNodeTypes,
  nodesDraggable = false,
  nodesConnectable = false,
  elementsSelectable = true,
  fitView = true,
  style,
  ...restProps
}: CanvasViewProps): JSX.Element {
  return (
    <div
      className="copper-canvas-container"
      style={{ ...defaultCanvasStyle, ...style }}
      data-testid="copper-canvas-view"
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        nodesDraggable={nodesDraggable}
        nodesConnectable={nodesConnectable}
        elementsSelectable={elementsSelectable}
        fitView={fitView}
        {...restProps}
      />
    </div>
  );
}
