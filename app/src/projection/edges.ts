import type { CSSProperties } from 'react';
import type { Edge } from '@xyflow/react';

export type BuiltInEdgeType = 'smoothstep' | 'bezier' | 'straight' | 'step' | 'default';

export interface NaiveEdgeOptions {
  type?: BuiltInEdgeType | string;
  animated?: boolean;
  style?: CSSProperties;
  className?: string;
  interactionWidth?: number;
  selectable?: boolean;
  deletable?: boolean;
  data?: Record<string, unknown>;
  
  showLabel?: boolean;
  labelPosition?: 'start' | 'middle' | 'end';
}

export const DEFAULT_EDGE_TYPE: BuiltInEdgeType = 'smoothstep';

export const DEFAULT_EDGE_STYLE: CSSProperties = {
  stroke: 'var(--md-sys-color-outline, #79747e)',
  strokeWidth: 2,
};

export function createNaiveEdge(
  edge: Edge,
  options?: NaiveEdgeOptions
): Edge {
  const edgeType = options?.type ?? edge.type ?? DEFAULT_EDGE_TYPE;
  const mergedStyle: CSSProperties = {
    ...DEFAULT_EDGE_STYLE,
    ...edge.style,
    ...options?.style,
  };

  const enhanced: Edge = {
    ...edge,
    type: edgeType,
    style: mergedStyle,
  };

  if (options?.animated !== undefined) {
    enhanced.animated = options.animated;
  } else if (edge.animated !== undefined) {
    enhanced.animated = edge.animated;
  }

  if (options?.className !== undefined) {
    enhanced.className = options.className;
  }
  if (options?.interactionWidth !== undefined) {
    enhanced.interactionWidth = options.interactionWidth;
  }
  if (options?.selectable !== undefined) {
    enhanced.selectable = options.selectable;
  }
  if (options?.deletable !== undefined) {
    enhanced.deletable = options.deletable;
  }
  if (options?.data !== undefined || edge.data !== undefined) {
    enhanced.data = {
      ...edge.data,
      ...options?.data,
    };
  }

  // Label settings
  if (options?.showLabel) {
    const cableData = enhanced.data?.cable as any;
    if (cableData && cableData.type) {
      enhanced.label = cableData.type;
      enhanced.labelStyle = { fill: 'var(--md-sys-color-on-surface, #1c1b1f)', fontSize: '10px', fontWeight: 500 };
      enhanced.labelBgStyle = { fill: 'var(--md-sys-color-surface, #f4f4f5)', fillOpacity: 0.8 };
      enhanced.labelShowBg = true;
      
      // label position is usually controlled by labelBgPadding or custom edge.
      // But we can approximate start/middle/end on built-in edges?
      // Actually React Flow doesn't natively support labelPosition='start' on default edges easily without a custom edge.
      // We can pass it into `data` for a custom edge, but for now we'll just set it.
      // wait, `edge` supports `labelX` / `labelY`? No, it's automatic.
      // Let's just pass it to `data` for a future custom edge.
      enhanced.data = { ...enhanced.data, labelPosition: options.labelPosition };
    }
  }

  return enhanced;
}

export function createNaiveEdges(
  edges: Edge[],
  options?: NaiveEdgeOptions
): Edge[] {
  return edges.map((edge) => createNaiveEdge(edge, options));
}

export const enhanceEdges = createNaiveEdges;
