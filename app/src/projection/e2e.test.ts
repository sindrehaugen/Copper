import { describe, expect, it } from 'vitest';
import fixtureGymmen from '../../tests/fixtures/av-fasit/AV_U1A21.easyschematic.json';
import fixtureStudio from '../../tests/fixtures/av-fasit/AV_H3B19.easyschematic.json';
import fixtureAuditorium from '../../tests/fixtures/av-fasit/AV_H1A04.easyschematic.json';
import { readEasySchematic } from '../exchange/easyschematic/read';
import { toFlow } from './toFlow';
import { applyElkLayout } from './layout';
import { enhanceEdges, DEFAULT_EDGE_STYLE, DEFAULT_EDGE_TYPE } from './edges';
import { DesignDocumentSchema } from '../model/schema';
import { CARD_WIDTH } from '../model/geometry';

/**
 * Batch 025 - P.W7 the-premise-proof
 * ============================================================================
 * End-to-end integration test proving the core premise:
 * External schematic JSON -> readEasySchematic (B5)
 *                         -> toFlow (B21)
 *                         -> applyElkLayout (B23)
 *                         -> enhanceEdges (B24)
 *                         -> Fully projected React Flow graph with valid geometry & styles
 * ============================================================================
 */

describe('Projection Pipeline E2E Integration (Batch 025 P.W7 the-premise-proof)', () => {
  describe('Pipeline Proof 1: AV_U1A21 (Gymmen) Fixture', () => {
    it('successfully processes full pipeline: read -> toFlow -> applyElkLayout -> enhanceEdges', async () => {
      // Step 1: Ingest foreign schematic into Copper DesignDocument
      const { document, report } = readEasySchematic(fixtureGymmen);

      // Verify lossless ingestion conforming strictly to DesignDocumentSchema
      expect(DesignDocumentSchema.safeParse(document).success).toBe(true);
      expect(document.devices).toHaveLength(12);
      expect(document.cables).toHaveLength(6);
      expect(report.deviceCount).toBe(12);
      expect(report.cableCount).toBe(6);

      // Step 2: Project DesignDocument to raw React Flow nodes and edges
      const { nodes: rawNodes, edges: rawEdges } = toFlow(document);

      expect(rawNodes).toHaveLength(12);
      expect(rawEdges).toHaveLength(6);

      // Verify un-layouted nodes start at default (0, 0)
      for (const node of rawNodes) {
        expect(node.position).toEqual({ x: 0, y: 0 });
        expect(node.initialWidth).toBe(CARD_WIDTH);
        expect(node.initialHeight).toBeGreaterThan(0);
        expect(node.data.device).toBeDefined();
      }

      // Step 3: Run ELK layered auto-layout
      const layoutedNodes = await applyElkLayout(rawNodes, rawEdges);

      expect(layoutedNodes).toHaveLength(12);

      // Step 4: Enhance raw edges into React Flow visual edges
      const visualEdges = enhanceEdges(rawEdges);

      expect(visualEdges).toHaveLength(6);

      // Assertions on Layouted Node Coordinates
      const xCoords = layoutedNodes.map((n) => n.position.x);
      const yCoords = layoutedNodes.map((n) => n.position.y);

      for (const node of layoutedNodes) {
        // Must be finite numbers, not NaN, not undefined
        expect(typeof node.position.x).toBe('number');
        expect(typeof node.position.y).toBe('number');
        expect(Number.isNaN(node.position.x)).toBe(false);
        expect(Number.isNaN(node.position.y)).toBe(false);
        expect(Number.isFinite(node.position.x)).toBe(true);
        expect(Number.isFinite(node.position.y)).toBe(true);
        expect(node.position.x).toBeGreaterThanOrEqual(0);
        expect(node.position.y).toBeGreaterThanOrEqual(0);
      }

      // Verify nodes are spread out across multiple horizontal/vertical positions
      const minX = Math.min(...xCoords);
      const maxX = Math.max(...xCoords);
      const uniqueX = new Set(xCoords);
      const uniqueY = new Set(yCoords);

      expect(maxX).toBeGreaterThan(minX);
      expect(uniqueX.size).toBeGreaterThan(1);
      expect(uniqueY.size).toBeGreaterThan(1);

      // Verify directional flow: downstream target nodes appear to the right of source nodes
      const nodeMap = new Map(layoutedNodes.map((n) => [n.id, n]));
      for (const edge of rawEdges) {
        const sourceNode = nodeMap.get(edge.source);
        const targetNode = nodeMap.get(edge.target);

        expect(sourceNode).toBeDefined();
        expect(targetNode).toBeDefined();

        if (sourceNode && targetNode && sourceNode.id !== targetNode.id) {
          // In ELK layered RIGHT direction, target is placed to the right of source
          expect(targetNode.position.x).toBeGreaterThan(sourceNode.position.x);
        }
      }

      // Assertions on Enhanced Edges
      for (const edge of visualEdges) {
        expect(edge.type).toBe(DEFAULT_EDGE_TYPE);
        expect(edge.type).toBe('smoothstep');
        expect(edge.style).toEqual(DEFAULT_EDGE_STYLE);
        expect(edge.style?.stroke).toBe('var(--md-sys-color-outline, #79747e)');
        expect(edge.style?.strokeWidth).toBe(2);
        expect(edge.source).toBeTruthy();
        expect(edge.target).toBeTruthy();
        expect(edge.sourceHandle).toBeTruthy();
        expect(edge.targetHandle).toBeTruthy();
      }

      // Spot-check specific edge-0 connection
      const edge0 = visualEdges.find((e) => e.id === 'edge-0');
      expect(edge0).toBeDefined();
      expect(edge0?.source).toBe('device-U1-UM003');
      expect(edge0?.target).toBe('device-U1-UM008');
      expect(edge0?.sourceHandle).toBe('p-U1-UM003-proj-POE2');
      expect(edge0?.targetHandle).toBe('p-U1-UM008-i0');
    });
  });

  describe('Pipeline Proof 2: AV_H3B19 (Studio) Fixture', () => {
    it('successfully processes full pipeline for multi-room studio topology', async () => {
      // Step 1: Read fixture
      const { document, report } = readEasySchematic(fixtureStudio);

      expect(DesignDocumentSchema.safeParse(document).success).toBe(true);
      expect(document.devices).toHaveLength(8);
      expect(document.cables).toHaveLength(7);
      expect(report.skippedObjects).toHaveLength(1); // 1 note skipped

      // Step 2: toFlow projection
      const { nodes: rawNodes, edges: rawEdges } = toFlow(document);
      expect(rawNodes).toHaveLength(8);
      expect(rawEdges).toHaveLength(7);

      // Step 3: applyElkLayout
      const layoutedNodes = await applyElkLayout(rawNodes, rawEdges);
      expect(layoutedNodes).toHaveLength(8);

      // Step 4: enhanceEdges
      const visualEdges = enhanceEdges(rawEdges);
      expect(visualEdges).toHaveLength(7);

      // Assert non-trivial layout coordinates
      const xCoords = layoutedNodes.map((n) => n.position.x);
      const minX = Math.min(...xCoords);
      const maxX = Math.max(...xCoords);
      expect(maxX).toBeGreaterThan(minX);

      for (const node of layoutedNodes) {
        expect(Number.isFinite(node.position.x)).toBe(true);
        expect(Number.isFinite(node.position.y)).toBe(true);
      }

      // Verify visual edge styles
      for (const edge of visualEdges) {
        expect(edge.type).toBe('smoothstep');
        expect(edge.style?.stroke).toBe('var(--md-sys-color-outline, #79747e)');
      }
    });
  });

  describe('Pipeline Proof 3: AV_H1A04 (Auditorium) Complex Fixture', () => {
    it('successfully processes full pipeline on complex auditorium schematic with high port count', async () => {
      // Step 1: Ingest large fixture
      const { document, report } = readEasySchematic(fixtureAuditorium);

      expect(DesignDocumentSchema.safeParse(document).success).toBe(true);
      expect(document.devices.length).toBeGreaterThan(10);
      expect(document.cables.length).toBeGreaterThan(5);
      expect(report.portCount).toBeGreaterThan(30);

      // Step 2: toFlow
      const { nodes: rawNodes, edges: rawEdges } = toFlow(document);
      expect(rawNodes.length).toBe(document.devices.length);
      expect(rawEdges.length).toBe(document.cables.length);

      // Step 3: Layout
      const layoutedNodes = await applyElkLayout(rawNodes, rawEdges);
      expect(layoutedNodes.length).toBe(rawNodes.length);

      // Step 4: Enhance edges
      const visualEdges = enhanceEdges(rawEdges);
      expect(visualEdges.length).toBe(rawEdges.length);

      // Every layouted node must have non-negative finite coordinate
      for (const node of layoutedNodes) {
        expect(node.position.x).toBeGreaterThanOrEqual(0);
        expect(node.position.y).toBeGreaterThanOrEqual(0);
        expect(Number.isFinite(node.position.x)).toBe(true);
        expect(Number.isFinite(node.position.y)).toBe(true);
      }

      // All edges properly typed and styled
      for (const edge of visualEdges) {
        expect(edge.type).toBe('smoothstep');
        expect(edge.style?.stroke).toBe('var(--md-sys-color-outline, #79747e)');
      }
    });
  });

  describe('Pipeline Immutability & Purity', () => {
    it('does not mutate raw nodes or raw edges during layout and edge enhancement', async () => {
      const { document } = readEasySchematic(fixtureGymmen);
      const { nodes: rawNodes, edges: rawEdges } = toFlow(document);

      // Deep freeze the raw nodes and raw edges before running pipeline steps
      const frozenRawNodes = rawNodes.map((n) => Object.freeze({ ...n, position: Object.freeze({ ...n.position }) }));
      const frozenRawEdges = rawEdges.map((e) => Object.freeze({ ...e }));

      const layoutedNodes = await applyElkLayout(
        frozenRawNodes as unknown as typeof rawNodes,
        frozenRawEdges as unknown as typeof rawEdges
      );
      const visualEdges = enhanceEdges(frozenRawEdges as unknown as typeof rawEdges);

      // Returned arrays and objects must be fresh references
      expect(layoutedNodes).not.toBe(frozenRawNodes);
      expect(visualEdges).not.toBe(frozenRawEdges);

      // Original frozen nodes position must still be { x: 0, y: 0 }
      for (const origNode of frozenRawNodes) {
        expect(origNode.position).toEqual({ x: 0, y: 0 });
      }

      // Original frozen edges type must still be undefined
      for (const origEdge of frozenRawEdges) {
        expect(origEdge.type).toBeUndefined();
      }
    });
  });

  describe('§6.4 Mutation Scenario: Broken / Bypassed Layout Detection', () => {
    it('verifies that without ELK layout all nodes remain stuck at (0,0)', () => {
      const { document } = readEasySchematic(fixtureGymmen);
      const { nodes: rawNodes } = toFlow(document);

      // If layout step is broken or omitted, all positions are stuck at { x: 0, y: 0 }
      const allZero = rawNodes.every((n) => n.position.x === 0 && n.position.y === 0);
      expect(allZero).toBe(true);

      const uniqueXPositions = new Set(rawNodes.map((n) => n.position.x));
      expect(uniqueXPositions.size).toBe(1); // exactly one position (0)
    });

    it('verifies that ELK layout breaks the (0,0) singularity and spreads nodes apart', async () => {
      const { document } = readEasySchematic(fixtureGymmen);
      const { nodes: rawNodes, edges: rawEdges } = toFlow(document);

      const layoutedNodes = await applyElkLayout(rawNodes, rawEdges);

      // After layout, nodes are no longer all at (0, 0)
      const allZeroAfterLayout = layoutedNodes.every((n) => n.position.x === 0 && n.position.y === 0);
      expect(allZeroAfterLayout).toBe(false);

      const uniqueXAfterLayout = new Set(layoutedNodes.map((n) => n.position.x));
      expect(uniqueXAfterLayout.size).toBeGreaterThan(1);
    });
  });
});
