import type { CSSProperties } from 'react';
import type { Edge } from '@xyflow/react';

export type BuiltInEdgeType = 'smoothstep' | 'bezier' | 'straight' | 'step' | 'default';

export interface NaiveEdgeOptions {
  /**
   * React Flow built-in edge path type. Defaults to 'smoothstep'.
   */
  type?: BuiltInEdgeType | string;
  /**
   * Whether the edge should be rendered with animated dashes. Defaults to false.
   */
  animated?: boolean;
  /**
   * Additional or overriding CSS style properties for the edge SVG path.
   */
  style?: CSSProperties;
  /**
   * Custom CSS class name for the edge.
   */
  className?: string;
  /**
   * Hit-box area width in pixels for interaction/hover.
   */
  interactionWidth?: number;
  /**
   * Whether the edge is selectable.
   */
  selectable?: boolean;
  /**
   * Whether the edge is deletable.
   */
  deletable?: boolean;
  /**
   * Additional arbitrary edge data payload.
   */
  data?: Record<string, unknown>;
}

export const DEFAULT_EDGE_TYPE: BuiltInEdgeType = 'smoothstep';

export const DEFAULT_EDGE_STYLE: CSSProperties = {
  stroke: 'var(--md-sys-color-outline, #79747e)',
  strokeWidth: 2,
};

/**
 * Enhances a single raw edge with visual React Flow presentation properties.
 * Pure function: does not mutate the incoming edge object.
 */
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

  return enhanced;
}

/**
 * Maps an array of raw edges (e.g. from `toFlow`) into React Flow visual edges
 * configured with smoothstep/bezier routing and M3 token styling.
 * Pure function: does not mutate the incoming array or edge objects.
 */
export function createNaiveEdges(
  edges: Edge[],
  options?: NaiveEdgeOptions
): Edge[] {
  return edges.map((edge) => createNaiveEdge(edge, options));
}

/**
 * Alias for `createNaiveEdges` providing semantic flexibility.
 */
export const enhanceEdges = createNaiveEdges;
