import { describe, it, expect } from 'vitest';
import { toX6 } from './toX6';


describe('toX6 projection', () => {
  it('projects devices and cables to X6 nodes and edges', () => {
    const doc: any = {
      schemaVersion: 1,
      designLabel: 'Test',
      sites: [], locations: [], racks: [], deviceTypes: [], signalClasses: [], zones: [],
      devices: [
        { id: 'd1', typeId: 't1', designator: 'SRC' },
        { id: 'd2', typeId: 't2', designator: 'DST' }
      ],
      cables: [
        {
          id: 'c1',
          typeId: 'cbl1',
          terminations: [
            { deviceId: 'd1', portRef: { kind: 'output', name: 'out1' } },
            { deviceId: 'd2', portRef: { kind: 'input', name: 'in1' } }
          ]
        }
      ]
    };

    const result = toX6(doc, { d1: { x: 10, y: 20 }, d2: { x: 100, y: 200 } });

    expect(result.nodes.length).toBe(3);
    expect(result.edges.length).toBe(1);

    const n1 = result.nodes.find((n: any) => n.id === 'd1');
    expect(n1?.x).toBe(10);
    expect(n1?.y).toBe(20);

    const edge = result.edges[0];
    expect(edge?.id).toBe('c1');
    expect(edge?.source.cell).toBe('d1');
    expect(edge?.target.cell).toBe('d2');
  });
});

