import { useEffect, useRef, CSSProperties, useState } from 'react';
import { Graph } from '@antv/x6';
import { register, getProvider } from '@antv/x6-react-shape';
import { DeviceNodeComponent } from './nodes/DeviceNode';
import { LegendNodeComponent } from './nodes/LegendNode';
import { useDocumentStore } from '../../store/documentStore';
import { getPortSignature } from '../../utils/portSignature';
import { canConnect, getSuggestedAdapters } from '../../model/connector-accepts';

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

  const documentRef = useRef(document);
  useEffect(() => { documentRef.current = document; }, [document]);

  const lastIncompatibleRef = useRef<any>(null);

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
        highlight: true,
        validateConnection({ sourceMagnet, targetMagnet, sourceCell, targetCell }) {
          // Clear any previous incompatible hover
          lastIncompatibleRef.current = null;

          if (!sourceMagnet || !targetMagnet || !sourceCell || !targetCell) return false;
          if (sourceCell === targetCell) return false;
          const srcPortGroup = sourceMagnet.getAttribute('port-group');
          const tgtPortGroup = targetMagnet.getAttribute('port-group');
          if (srcPortGroup === tgtPortGroup) return false; // Prevent in->in or out->out

          const sourcePort = sourceMagnet.getAttribute('port');
          const targetPort = targetMagnet.getAttribute('port');
          if (!sourcePort || !targetPort) return false;

          const doc = documentRef.current;
          if (!doc) return true;

          const srcSig = getPortSignature(doc, sourceCell.id, sourcePort);
          const tgtSig = getPortSignature(doc, targetCell.id, targetPort);

          if (srcSig && tgtSig) {
            const compatible = canConnect(srcSig, tgtSig);
            if (!compatible) {
              const srcDevice = doc.devices.find(d => d.id === sourceCell.id)?.name || sourceCell.id;
              const tgtDevice = doc.devices.find(d => d.id === targetCell.id)?.name || targetCell.id;
              lastIncompatibleRef.current = {
                srcDevice,
                tgtDevice,
                srcPortType: srcSig.connectorType,
                tgtPortType: tgtSig.connectorType,
                suggestedAdapters: getSuggestedAdapters(srcSig, tgtSig)
              };
              return false;
            }
            return true;
          }
          return true;
        }
      }
    });

    graphRef.current = graph;

    // Listen to edge routing failure or general mouse up to show reject popup
    const handleMouseUp = () => {
      if (lastIncompatibleRef.current) {
        setRejectedDrop(lastIncompatibleRef.current);
        lastIncompatibleRef.current = null;
      }
    };
    
    // Add mouseup to container to catch when a connection is dropped over a target but rejected
    containerRef.current.addEventListener('mouseup', handleMouseUp);

    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener('mouseup', handleMouseUp);
      }
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
        const srcSig = getPortSignature(document, source.cell, source.port);
        
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
          background: 'var(--md-sys-color-surface-container-high)', border: '1px solid var(--md-sys-color-outline)', padding: 24, borderRadius: 12,
          boxShadow: 'var(--md-sys-elevation-level-4)', zIndex: 10000, color: 'var(--md-sys-color-on-surface)'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: 'var(--md-sys-color-error)' }}>Incompatible Connection</h3>
          <p style={{ margin: '0 0 16px 0' }}>
            Cannot connect <b>{rejectedDrop.srcPortType}</b> ({rejectedDrop.srcDevice}) to <b>{rejectedDrop.tgtPortType}</b> ({rejectedDrop.tgtDevice}).
          </p>
          {rejectedDrop.suggestedAdapters.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <strong style={{ display: 'block', marginBottom: 8 }}>Suggested Adapters:</strong>
              {rejectedDrop.suggestedAdapters.map((a: string, i: number) => (
                <button key={i} style={{ padding: '4px 12px', background: 'var(--md-sys-color-primary-container)', color: 'var(--md-sys-color-on-primary-container)', border: 'none', borderRadius: 4, marginRight: 8 }}>
                  {a}
                </button>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={() => setRejectedDrop(null)} style={{ padding: '8px 16px', background: 'var(--md-sys-color-primary)', color: 'var(--md-sys-color-on-primary)', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}










