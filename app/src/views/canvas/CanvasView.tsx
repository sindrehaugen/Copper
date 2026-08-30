import type { CSSProperties, JSX } from 'react';
import {
  ReactFlow,
  type Node,
  type Edge,
  type NodeTypes,
  type ReactFlowProps,
} from '@xyflow/react';
import { DeviceNode } from './nodes/DeviceNode';
import { useWiringInteraction } from './CanvasWiringInteraction';
import { useDocumentStore } from '../../store';

export const defaultNodeTypes: NodeTypes = {
  device: DeviceNode,
};

export interface CanvasViewProps extends Omit<ReactFlowProps, 'nodes' | 'edges'> {
  nodes?: Node[];
  edges?: Edge[];
  className?: string;
  style?: CSSProperties;
  enableWiring?: boolean;
}

const defaultCanvasStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  minHeight: '400px',
};

/**
 * React Flow CanvasView rendering toFlow projection.
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
  enableWiring = false,
  ...restProps
}: CanvasViewProps): JSX.Element {
  const wiringProps = useWiringInteraction();
  const setSelectedIds = useDocumentStore(state => state.setSelectedIds);
  
  // Only override interaction props if enableWiring is true
  const interactionProps = enableWiring ? {
    nodesConnectable: true,
    connectionLineComponent: wiringProps.connectionLineComponent,
    onConnect: wiringProps.onConnect,
    isValidConnection: wiringProps.isValidConnection,
  } : {
    nodesConnectable
  };

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
        elementsSelectable={elementsSelectable}
        fitView={fitView}
        onSelectionChange={({ nodes }) => setSelectedIds(nodes.map(n => n.id))}
        {...interactionProps}
        {...restProps}
      />
    </div>
  );
}

