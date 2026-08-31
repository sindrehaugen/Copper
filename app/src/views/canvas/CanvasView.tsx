import React, { useEffect, useRef, CSSProperties } from 'react';
import { Graph } from '@antv/x6';
import { register, getProvider } from '@antv/x6-react-shape';
import { DeviceNodeComponent } from './nodes/DeviceNode';

register({
  shape: 'device-node',
  width: 200,
  height: 100,
  component: DeviceNodeComponent,
});

const ReactShapeProvider = getProvider();

export interface CanvasViewProps {
  nodes?: any[];
  edges?: any[];
  className?: string;
  style?: CSSProperties;
  enableWiring?: boolean;
}

const defaultCanvasStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  minHeight: '400px',
  position: 'relative'
};

export function CanvasView({
  nodes = [],
  edges = [],
  style,
  enableWiring = false,
}: CanvasViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<Graph | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const graph = new Graph({
      container: containerRef.current,
      autoResize: true,
      background: { color: 'var(--md-sys-color-surface-container-lowest, #ffffff)' },
      panning: true,
      mousewheel: { enabled: true, modifiers: ['ctrl', 'meta'] },
      interacting: { nodeMovable: enableWiring, edgeMovable: enableWiring },
      connecting: {
        router: {
          name: 'normal',
        },
        connector: { name: 'rounded', args: { radius: 8 } },
        allowBlank: false,
        allowLoop: false,
        allowNode: false,
      }
    });

    graphRef.current = graph;

    return () => {
      graph.dispose();
    };
  }, [enableWiring]);

  useEffect(() => {
    const graph = graphRef.current;
    if (!graph) return;

    const x6Nodes = nodes.map(n => ({
      ...n,
      ports: {
        ...n.ports,
        groups: {
          in: {
            position: 'absolute',
            attrs: {
              circle: { r: 4, magnet: true, stroke: '#79747e', fill: '#ffffff', strokeWidth: 1 }
            }
          },
          out: {
            position: 'absolute',
            attrs: {
              circle: { r: 4, magnet: true, stroke: '#79747e', fill: '#ffffff', strokeWidth: 1 }
            }
          }
        }
      }
    }));

    const x6Edges = edges.map(e => ({
      ...e,
      tools: ['vertices', 'segments'],
      attrs: {
        line: {
          stroke: 'var(--md-sys-color-outline, #79747e)',
          strokeWidth: 2,
          targetMarker: { name: 'block', width: 6, height: 6 }
        }
      }
    }));

    graph.fromJSON({ nodes: x6Nodes, edges: x6Edges });
    graph.centerContent();
  }, [nodes, edges]);

  return (
    <div className="copper-canvas-container" style={{ ...defaultCanvasStyle, ...style }} data-testid="copper-canvas-view">
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      <ReactShapeProvider />
    </div>
  );
}








