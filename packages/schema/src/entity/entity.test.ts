import { describe, it, expect } from 'vitest';
import {
  ENTITY_TYPES,
  EntityTypeSchema,
  EntityRefSchema,
  isEntityType,
  parseEntityRef,
  formatEntityRef,
  type EntityType,
  type EntityRef,
} from './index';

describe('Entity Schema & Registry (Batch 139 / OB.W1)', () => {
  it('strictly defines the 29+ entity types including required nodes', () => {
    expect(ENTITY_TYPES).toBeDefined();
    expect(ENTITY_TYPES.length).toBeGreaterThanOrEqual(29);

    // Required types from NCE node-ownership.json and brief
    const requiredTypes: EntityType[] = [
      'FUNCTIONAL_LOCATION',
      'ASSET',
      'QUOTE',
      'TICKET',
      'PO_LINE',
      'GOODS_RECEIPT',
      'CUSTOMER',
      'VENDOR',
      'AGREEMENT',
      'DESIGN',
      'DEVICE',
      'PORT',
      'RACK',
      'CABLE',
      'PRODUCT_SKU',
      'PO',
      'STOCK_LOCATION',
      'INVENTORY_ITEM',
      'INVENTORY_RMA',
      'PROJECT_PROJECT',
      'PROJECT_GATE',
      'PROJECT_TASK',
      'INVOICE',
      'POSTING',
      'PERIOD',
      'MARGIN',
      'CONTRACTOR',
      'CERT',
      'SIGNED_BASELINE',
    ];

    for (const reqType of requiredTypes) {
      expect(ENTITY_TYPES).toContain(reqType);
      const parsed = EntityTypeSchema.safeParse(reqType);
      expect(parsed.success).toBe(true);
      expect(isEntityType(reqType)).toBe(true);
    }
  });

  it('rejects invalid entity types', () => {
    expect(isEntityType('INVALID_TYPE')).toBe(false);
    expect(isEntityType(123)).toBe(false);
    const result = EntityTypeSchema.safeParse('UNKNOWN_NODE_TYPE');
    expect(result.success).toBe(false);
  });

  it('strictly validates EntityRef objects', () => {
    const validRef: EntityRef = {
      type: 'FUNCTIONAL_LOCATION',
      id: 'loc-123',
      namespace: 'tenant-a',
    };
    const parsed = EntityRefSchema.safeParse(validRef);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.type).toBe('FUNCTIONAL_LOCATION');
      expect(parsed.data.id).toBe('loc-123');
      expect(parsed.data.namespace).toBe('tenant-a');
    }

    // Invalid without id
    expect(EntityRefSchema.safeParse({ type: 'ASSET' }).success).toBe(false);
    // Invalid with empty id
    expect(EntityRefSchema.safeParse({ type: 'ASSET', id: '' }).success).toBe(false);
    // Invalid with bad type
    expect(EntityRefSchema.safeParse({ type: 'BAD_TYPE', id: '123' }).success).toBe(false);
  });

  it('correctly parses and formats entity references', () => {
    const ref = parseEntityRef('FUNCTIONAL_LOCATION:loc-999');
    expect(ref).toEqual({
      type: 'FUNCTIONAL_LOCATION',
      id: 'loc-999',
    });

    const routeRef = parseEntityRef('/e/ASSET/ast-001');
    expect(routeRef).toEqual({
      type: 'ASSET',
      id: 'ast-001',
    });

    const formattedColon = formatEntityRef({ type: 'QUOTE', id: 'q-42' });
    expect(formattedColon).toBe('QUOTE:q-42');

    const formattedRoute = formatEntityRef({ type: 'TICKET', id: 't-101' }, 'route');
    expect(formattedRoute).toBe('/e/TICKET/t-101');
  });
});
