import { describe, it, expect } from 'vitest';
import {
  exportGridToCsv,
  exportGridData,
  formatCsvValue,
  type ExportColumnDef,
} from './exportGrid';
import type { GridViewState } from '../views/GridViewManager';

interface ProductQuoteLine {
  id: string;
  sku: string;
  description: string;
  quantity: number;
  unitCost: number; // Sensitive / C8 financial
  marginPercent: number; // Sensitive / C8 financial
  internalNotes: string; // Sensitive / C8 notes
  customerPrice: number;
  contactEmail: string; // PII
}

const mockData: ProductQuoteLine[] = [
  {
    id: 'L1',
    sku: 'SPK-100',
    description: 'Line Array Module, 800W',
    quantity: 4,
    unitCost: 850,
    marginPercent: 35.5,
    internalNotes: 'Discount authorized by VP; supplier rebate eligible',
    customerPrice: 1317.83,
    contactEmail: 'buyer@client.com',
  },
  {
    id: 'L2',
    sku: 'AMP-4000',
    description: '4-Channel DSP Amplifier',
    quantity: 2,
    unitCost: 1900,
    marginPercent: 28.0,
    internalNotes: 'Special firmware 2.4 required',
    customerPrice: 2638.89,
    contactEmail: 'tech@client.com',
  },
  {
    id: 'L3',
    sku: 'CAB-NL4',
    description: 'Speakon Cable 15m "Pro, Touring"',
    quantity: 8,
    unitCost: 25,
    marginPercent: 50.0,
    internalNotes: 'Overstocked batch',
    customerPrice: 50.0,
    contactEmail: 'buyer@client.com',
  },
];

const columns: ExportColumnDef<ProductQuoteLine>[] = [
  { id: 'sku', header: 'SKU', accessorKey: 'sku' },
  { id: 'description', header: 'Description', accessorKey: 'description' },
  { id: 'quantity', header: 'Quantity', accessorKey: 'quantity' },
  {
    id: 'unitCost',
    header: 'Unit Cost',
    accessorKey: 'unitCost',
    isSensitive: true,
    maskBehavior: 'mask',
  },
  {
    id: 'marginPercent',
    header: 'Margin %',
    accessorKey: 'marginPercent',
    isSensitive: true,
    maskBehavior: 'mask',
  },
  {
    id: 'internalNotes',
    header: 'Internal Notes',
    accessorKey: 'internalNotes',
    isSensitive: true,
    maskBehavior: 'omit', // Omit completely on mask
  },
  {
    id: 'customerPrice',
    header: 'Customer Price',
    accessorKey: 'customerPrice',
  },
  {
    id: 'contactEmail',
    header: 'Contact Email',
    accessorKey: 'contactEmail',
    isSensitive: true,
    maskBehavior: 'mask',
    maskedValue: '***@***.***',
  },
];

describe('Grid Export and Masking (GR.W4 / B149)', () => {
  describe('formatCsvValue helper', () => {
    it('properly escapes commas, quotes, and newlines per RFC 4180', () => {
      expect(formatCsvValue('Simple Text')).toBe('Simple Text');
      expect(formatCsvValue('Text, with comma')).toBe('"Text, with comma"');
      expect(formatCsvValue('Text with "quotes"')).toBe('"Text with ""quotes"""');
      expect(formatCsvValue('Text with\nnewline')).toBe('"Text with\nnewline"');
      expect(formatCsvValue(null)).toBe('');
      expect(formatCsvValue(undefined)).toBe('');
      expect(formatCsvValue(123.45)).toBe('123.45');
      expect(formatCsvValue(true)).toBe('true');
    });
  });

  describe('CSV Export with Masking OFF', () => {
    it('exports all columns and sensitive unmasked values when masking=false', () => {
      const csv = exportGridToCsv(mockData, columns, { masking: false });
      const lines = csv.split('\n');

      // Check header contains all columns
      expect(lines[0]).toBe(
        'SKU,Description,Quantity,Unit Cost,Margin %,Internal Notes,Customer Price,Contact Email'
      );

      // Check line 1 includes actual costs, margins, and notes
      expect(lines[1]).toContain('850');
      expect(lines[1]).toContain('35.5');
      expect(lines[1]).toContain('Discount authorized by VP; supplier rebate eligible');
      expect(lines[1]).toContain('buyer@client.com');

      // Check quoted string in line 3
      expect(lines[3]).toContain('"Speakon Cable 15m ""Pro, Touring"""');
    });
  });

  describe('CSV Export with Masking ON (Customer View Compliance)', () => {
    it('strictly omits or masks PII/financials when masking=true', () => {
      const csv = exportGridToCsv(mockData, columns, { masking: true });
      const lines = csv.split('\n');

      // 1. Column with maskBehavior="omit" ('Internal Notes') MUST be omitted from header
      expect(lines[0]).not.toContain('Internal Notes');
      expect(lines[0]).toBe(
        'SKU,Description,Quantity,Unit Cost,Margin %,Customer Price,Contact Email'
      );

      // 2. Sensitive financial columns (Unit Cost, Margin %) must be masked as '***'
      // 3. Sensitive PII (Contact Email) must use masked value '***@***.***'
      // 4. Internal Notes text must NEVER appear anywhere in the export payload
      lines.slice(1).forEach((line) => {
        expect(line).toContain('***');
        expect(line).toContain('***@***.***');
        expect(line).not.toContain('Discount authorized');
        expect(line).not.toContain('Special firmware');
        expect(line).not.toContain('Overstocked');
        expect(line).not.toContain('buyer@client.com');
        expect(line).not.toContain('tech@client.com');
      });

      // Assert specific row 1 format
      expect(lines[1]).toBe(
        'SPK-100,"Line Array Module, 800W",4,***,***,1317.83,***@***.***'
      );
    });

    it('auto-detects C8 sensitive keys (margin, cost, cogs, health_score, internal_notes) if column flag is omitted', () => {
      const bareColumns: ExportColumnDef<ProductQuoteLine>[] = [
        { id: 'sku', header: 'SKU', accessorKey: 'sku' },
        { id: 'unitCost', header: 'unit_cost', accessorKey: 'unitCost' },
        { id: 'marginPercent', header: 'gross_margin', accessorKey: 'marginPercent' },
        { id: 'customerPrice', header: 'Price', accessorKey: 'customerPrice' },
      ];

      const csv = exportGridToCsv(mockData, bareColumns, { masking: true });
      const lines = csv.split('\n');

      expect(lines[1]).toBe('SPK-100,***,***,1317.83');
      expect(csv).not.toContain('850');
      expect(csv).not.toContain('35.5');
    });
  });

  describe('Honoring Active Grid View (Columns, Filters, Sorts)', () => {
    it('honors active view state with visible columns and column order', () => {
      const viewState: GridViewState = {
        visibleColumnIds: ['customerPrice', 'sku', 'quantity'],
        columnOrder: ['customerPrice', 'sku', 'quantity'],
      };

      const csv = exportGridToCsv(mockData, columns, {
        viewState,
        masking: false,
      });

      const lines = csv.split('\n');
      expect(lines[0]).toBe('Customer Price,SKU,Quantity');
      expect(lines[1]).toBe('1317.83,SPK-100,4');
      expect(lines[2]).toBe('2638.89,AMP-4000,2');
      expect(lines[3]).toBe('50,CAB-NL4,8');
    });

    it('honors active view state with filters and multi-column sorting', () => {
      const viewState: GridViewState = {
        visibleColumnIds: ['sku', 'quantity', 'customerPrice'],
        columnFilters: [
          { columnId: 'quantity', operator: 'gte', value: 3 },
        ],
        sort: [
          { columnId: 'customerPrice', direction: 'desc' },
        ],
      };

      const csv = exportGridToCsv(mockData, columns, {
        viewState,
        masking: false,
      });

      const lines = csv.split('\n');
      expect(lines[0]).toBe('SKU,Quantity,Customer Price');
      // Line 1 should be SPK-100 (qty 4 >= 3, price 1317.83)
      expect(lines[1]).toBe('SPK-100,4,1317.83');
      // Line 2 should be CAB-NL4 (qty 8 >= 3, price 50)
      expect(lines[2]).toBe('CAB-NL4,8,50');
      // AMP-4000 (qty 2) filtered out
      expect(lines).toHaveLength(3);
    });

    it('honors global filter query in view state', () => {
      const viewState: GridViewState = {
        filterQuery: 'Amplifier',
      };

      const csv = exportGridToCsv(mockData, columns, {
        viewState,
        masking: false,
      });

      const lines = csv.split('\n');
      expect(lines).toHaveLength(2); // Header + 1 row (AMP-4000)
      expect(lines[1]).toContain('AMP-4000');
    });
  });

  describe('exportGridData structured payload and formats', () => {
    it('produces structured export metadata with filename, mimeType, headers, and rows', () => {
      const result = exportGridData(mockData, columns, {
        filename: 'quote_lines_export',
        format: 'csv',
        masking: true,
      });

      expect(result.filename).toBe('quote_lines_export.csv');
      expect(result.mimeType).toBe('text/csv;charset=utf-8;');
      expect(result.headers).toEqual([
        'SKU',
        'Description',
        'Quantity',
        'Unit Cost',
        'Margin %',
        'Customer Price',
        'Contact Email',
      ]);
      expect(result.rows).toHaveLength(3);
      expect(result.rows[0][3]).toBe('***');
    });

    it('supports tsv format export', () => {
      const result = exportGridData(mockData, columns, {
        filename: 'export_tsv',
        format: 'tsv',
        masking: true,
      });

      expect(result.filename).toBe('export_tsv.tsv');
      expect(result.mimeType).toBe('text/tab-separated-values;charset=utf-8;');
      expect(result.content).toContain('\t');
    });

    it('supports json format export', () => {
      const result = exportGridData(mockData, columns, {
        filename: 'export_json',
        format: 'json',
        masking: false,
      });

      expect(result.filename).toBe('export_json.json');
      expect(result.mimeType).toBe('application/json;charset=utf-8;');
      const parsed = JSON.parse(result.content);
      expect(parsed).toHaveLength(3);
      expect(parsed[0].SKU).toBe('SPK-100');
    });

    it('supports xlsx format export', () => {
      const result = exportGridData(mockData, columns, {
        filename: 'export_excel',
        format: 'xlsx',
        masking: true,
      });

      expect(result.filename).toBe('export_excel.xlsx');
      expect(result.mimeType).toBe('application/vnd.ms-excel;charset=utf-8;');
      expect(result.content).toContain('<?xml version="1.0"?>');
      expect(result.content).toContain('<Worksheet ss:Name="Export">');
    });
  });
});
