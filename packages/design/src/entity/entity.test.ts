import { describe, it, expect } from 'vitest';
import {
  ENTITY_METADATA,
  getEntityMetadata,
} from './index';

describe('Entity Design Metadata Registry (Batch 139 / OB.W1)', () => {
  it('maps each entity type to label, icon, and colour tokens', () => {
    expect(ENTITY_METADATA).toBeDefined();

    const sampleTypes = [
      'FUNCTIONAL_LOCATION',
      'ASSET',
      'QUOTE',
      'TICKET',
      'PO_LINE',
      'GOODS_RECEIPT',
      'CUSTOMER',
      'PRODUCT_SKU',
      'DESIGN',
      'DEVICE',
      'VENDOR',
      'AGREEMENT',
      'INVOICE',
    ];

    for (const type of sampleTypes) {
      const meta = getEntityMetadata(type);
      expect(meta).toBeDefined();
      expect(meta.label).toBeTypeOf('string');
      expect(meta.label.length).toBeGreaterThan(0);
      expect(meta.icon).toBeTypeOf('string');
      expect(meta.icon.length).toBeGreaterThan(0);
      expect(meta.bgVar).toBeTypeOf('string');
      expect(meta.textVar).toBeTypeOf('string');
      expect(meta.bgVar).toContain('var(');
      expect(meta.textVar).toContain('var(');
    }
  });

  it('resolves metadata case-insensitively and handles hyphenation', () => {
    const metaUpper = getEntityMetadata('FUNCTIONAL_LOCATION');
    const metaLower = getEntityMetadata('functional_location');
    const metaHyphen = getEntityMetadata('functional-location');

    expect(metaUpper).toEqual(metaLower);
    expect(metaUpper).toEqual(metaHyphen);
    expect(metaUpper.label).toBe('Location');
    expect(metaUpper.icon).toBe('🏢');
  });

  it('provides safe fallback for unknown entity types', () => {
    const meta = getEntityMetadata('CUSTOM_UNKNOWN_TYPE');
    expect(meta).toBeDefined();
    expect(meta.label).toBe('CUSTOM_UNKNOWN_TYPE');
    expect(meta.icon).toBe('🔹');
    expect(meta.bgVar).toBeDefined();
    expect(meta.textVar).toBeDefined();
  });
});
