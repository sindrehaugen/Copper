import { useEffect, useRef, CSSProperties } from 'react';
import { Graph } from '@antv/x6';
import { register, getProvider } from '@antv/x6-react-shape';
import { DeviceNodeComponent } from './nodes/DeviceNode';
import { LegendNodeComponent } from './nodes/LegendNode';
import { useDocumentStore } from '../../store/documentStore';

register({
  shape: 'device-node',
  width: 200,
  height: 100,
  component: DeviceNodeComponent,
});

register({
  shape: 'legend-node',
  width: 300,
  height: 250,
  component: LegendNodeComponent,
});

const ReactShapeProvider = getProvider();

export interface CanvasViewProps {
  nodes?: any[];
  edges?: any[];
  className?: string;
  style?: CSSProperties;
  enableWiring?: boolean;
}

import { getPortSignature } from '../../utils/portSignature';
import { canConnect } from '../../model/connector-accepts';
import { useState } from 'react';

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
  const setSelectedIds = useDocumentStore(state => state.setSelectedIds);
  const updateDocument = useDocumentStore(state => state.updateDocument);
  const document = useDocumentStore(state => state.document);
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<Graph | null>(null);

  const [rejectedDrop, setRejectedDrop] = useState<{ srcDevice: string; tgtDevice: string; srcPortType: string; tgtPortType: string; suggestedAdapters: string[] } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const graph = new Graph({
      container: containerRef.current,
      autoResize: true,
      background: { color: 'var(--md-sys-color-surface-container-lowest)' },
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
        validateConnection({ sourceMagnet, targetMagnet, sourceCell, targetCell }) {
          if (!sourceMagnet || !targetMagnet) return false;
          if (sourceCell === targetCell) return false;
          const srcPortGroup = sourceMagnet.getAttribute('port-group');
          const tgtPortGroup = targetMagnet.getAttribute('port-group');
          if (srcPortGroup === tgtPortGroup) return false; // Prevent in->in or out->out

          // Additional logic for B102: Check connector/signal class compatibility
          // For now just prevent same-group wiring. Full check happens at drop.
          return true;
        }
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
              circle: { r: 4, magnet: true, stroke: 'var(--md-sys-color-outline)', fill: 'var(--md-sys-color-surface)', strokeWidth: 1 }
            }
          },
          out: {
            position: 'absolute',
            attrs: {
              circle: { r: 4, magnet: true, stroke: 'var(--md-sys-color-outline)', fill: 'var(--md-sys-color-surface)', strokeWidth: 1 }
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
          stroke: 'var(--md-sys-color-outline)',
          strokeWidth: 2,
          targetMarker: { name: 'block', width: 6, height: 6 }
        }
      }
    }));

    graph.fromJSON({ nodes: x6Nodes, edges: x6Edges });
    graph.centerContent();

    graph.on('cell:click', ({ cell }) => {
      setSelectedIds([cell.id]);
    });
    
    graph.on('blank:click', () => {
      setSelectedIds([]);
    });

    graph.on('edge:connected', ({ isNew, edge }: any) => {
      if (!isNew || !document) return;
      const source = edge.getSource();
      const target = edge.getTarget();
      
      if (source.cell && target.cell && source.port && target.port) {
        // B102: Connect Assist Validation
        const srcSig = getPortSignature(document, source.cell, source.port);
        const tgtSig = getPortSignature(document, target.cell, target.port);

        if (srcSig && tgtSig && !canConnect(srcSig, tgtSig)) {
          // Reject
          edge.remove();
          
          // Suggest adapters (naive mock for Dante etc)
          const suggestedAdapters: string[] = [];
          if (srcSig.signalType === 'AUDIO' && tgtSig.signalType === 'NETWORK') {
            suggestedAdapters.push('Dante AVIO Adapter');
          } else if (srcSig.signalType === 'VIDEO' && tgtSig.signalType === 'NETWORK') {
            suggestedAdapters.push('SDVoE Encoder');
          }

          setRejectedDrop({
            srcDevice: document.devices.find(d => d.id === source.cell)?.name || source.cell,
            tgtDevice: document.devices.find(d => d.id === target.cell)?.name || target.cell,
            srcPortType: srcSig.connectorType,
            tgtPortType: tgtSig.connectorType,
            suggestedAdapters
          });
          return;
        }

        updateDocument(draft => {
          draft.cables.push({
            id: edge.id,
            terminations: [
              { deviceId: source.cell, portRef: { name: source.port.split('-').pop() || source.port, kind: source.port.split('-')[0] || 'interface' } as any },
              { deviceId: target.cell, portRef: { name: target.port.split('-').pop() || target.port, kind: target.port.split('-')[0] || 'interface' } as any }
            ],
            type: 'cat6',
            signalType: srcSig?.signalType || 'ETHERNET',
            status: 'planned'
          });
        });
      }
    });

  }, [nodes, edges, setSelectedIds, document, updateDocument]);

  return (
    <div className="copper-canvas-container" style={{ ...defaultCanvasStyle, ...style }} data-testid="copper-canvas-view">
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      <ReactShapeProvider />
      {rejectedDrop && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          background: 'var(--copper-surface-container-high)', border: '1px solid var(--copper-outline)', padding: 24, borderRadius: 12,
          boxShadow: 'var(--md-sys-elevation-level-4)', zIndex: 10000, color: 'var(--copper-on-surface)'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: 'var(--copper-error)' }}>Incompatible Connection</h3>
          <p style={{ margin: '0 0 16px 0' }}>
            Cannot connect <b>{rejectedDrop.srcPortType}</b> ({rejectedDrop.srcDevice}) to <b>{rejectedDrop.tgtPortType}</b> ({rejectedDrop.tgtDevice}).
          </p>
          {rejectedDrop.suggestedAdapters.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <strong style={{ display: 'block', marginBottom: 8 }}>Suggested Adapters:</strong>
              {rejectedDrop.suggestedAdapters.map((a: string, i: number) => (
                <button key={i} style={{ padding: '4px 12px', background: 'var(--copper-primary-container)', color: 'var(--copper-on-primary-container)', border: 'none', borderRadius: 4, marginRight: 8 }}>
                  {a}
                </button>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={() => setRejectedDrop(null)} style={{ padding: '8px 16px', background: 'var(--copper-primary)', color: 'var(--copper-on-primary)', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}









