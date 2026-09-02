import type { ColumnDef } from '../DataGrid';
import {
  applyGridViewFiltersAndSort,
  type GridViewState,
} from '../views/GridViewManager';

export type ExportMaskBehavior = 'mask' | 'omit';

export interface ExportColumnDef<T> extends ColumnDef<T> {
  exportHeader?: string;
  isSensitive?: boolean;
  maskable?: boolean;
  maskBehavior?: ExportMaskBehavior;
  maskedValue?: string | ((val: any, row: T) => string);
  exportValue?: (row: T, rawValue: any) => string | number | boolean | null | undefined;
  exportable?: boolean;
}

export type ExportFormat = 'csv' | 'tsv' | 'json' | 'xlsx';

export interface GridExportOptions<T> {
  masking?: boolean;
  isMasked?: boolean;
  viewState?: GridViewState;
  filename?: string;
  format?: ExportFormat;
  includeHeaders?: boolean;
  delimiter?: string;
  nullValue?: string;
  customPredicate?: (row: T) => boolean;
}

export interface ExportGridResult {
  filename: string;
  mimeType: string;
  headers: string[];
  rows: (string | number | boolean | null)[][];
  content: string;
}

// C8 / PII regex patterns aligned with bff/src/routes/redaction.ts
const MARGIN_REGEX =
  /^(_?)(gross_?margin|profit_?margin|target_?margin|margin_?percent|margin_?rate|margin_?amount|margin_?target|margin)$/i;
const COST_REGEX =
  /^(_?)(unit_?cost|total_?cost|cost_?price|internal_?cost|purchase_?cost|estimated_?cost|labor_?cost|material_?cost|cogs|cost)$/i;
const INTERNAL_NOTES_REGEX =
  /^(_?)(internal_?notes?|private_?notes?|admin_?notes?|technician_?notes?|confidential_?notes?|internal_?comments?|internal_?remarks?)$/i;
const HEALTH_SCORE_REGEX =
  /^(_?)(health_?scores?|customer_?health|health_?ratings?|churn_?risks?|churn_?probability|account_?health|churn_?score)$/i;
const PII_REGEX =
  /^(_?)(ssn|social_?security|tax_?id|dob|date_?of_?birth|salary|compensation|home_?address|personal_?phone)$/i;

/**
 * Checks if a column represents a sensitive C8 or PII field.
 */
export function isSensitiveColumn<T>(col: ExportColumnDef<T>): boolean {
  if (col.isSensitive !== undefined) return col.isSensitive;
  if (col.maskable !== undefined) return col.maskable;

  const key = String(col.accessorKey || col.id);
  const headerStr = typeof col.header === 'string' ? col.header : '';

  return (
    MARGIN_REGEX.test(key) ||
    MARGIN_REGEX.test(headerStr) ||
    COST_REGEX.test(key) ||
    COST_REGEX.test(headerStr) ||
    INTERNAL_NOTES_REGEX.test(key) ||
    INTERNAL_NOTES_REGEX.test(headerStr) ||
    HEALTH_SCORE_REGEX.test(key) ||
    HEALTH_SCORE_REGEX.test(headerStr) ||
    PII_REGEX.test(key) ||
    PII_REGEX.test(headerStr)
  );
}

/**
 * Formats a value for RFC 4180 CSV / TSV compliance.
 */
export function formatCsvValue(val: any, delimiter: string = ','): string {
  if (val === null || val === undefined) {
    return '';
  }
  if (typeof val === 'boolean' || typeof val === 'number') {
    return String(val);
  }

  const str = String(val);
  const needsQuotes =
    str.includes(delimiter) ||
    str.includes('"') ||
    str.includes('\n') ||
    str.includes('\r');

  if (needsQuotes) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Prepares the filtered, ordered columns and rows for export based on active view and masking.
 */
export function prepareGridExportPayload<T>(
  data: T[],
  columns: ExportColumnDef<T>[],
  options: GridExportOptions<T> = {}
): {
  exportColumns: ExportColumnDef<T>[];
  headers: string[];
  rows: (string | number | boolean | null)[][];
} {
  const isMasked = Boolean(options.masking || options.isMasked);
  const viewState = options.viewState;

  // 1. Filter out explicitly unexportable columns
  let candidateCols = columns.filter((col) => col.exportable !== false);

  // 2. Filter by visibleColumnIds if active in viewState
  if (viewState?.visibleColumnIds && viewState.visibleColumnIds.length > 0) {
    const visibleSet = new Set(viewState.visibleColumnIds);
    candidateCols = candidateCols.filter((col) => visibleSet.has(col.id));
  }

  // 3. Order columns per columnOrder if active
  const orderList = viewState?.columnOrder;
  if (orderList && orderList.length > 0) {
    const colMap = new Map(candidateCols.map((c) => [c.id, c]));
    const ordered: ExportColumnDef<T>[] = [];
    orderList.forEach((id) => {
      const col = colMap.get(id);
      if (col) {
        ordered.push(col);
        colMap.delete(id);
      }
    });
    // Append remaining columns
    colMap.forEach((col) => ordered.push(col));
    candidateCols = ordered;
  }

  // 4. Apply Masking Omission: if masking is ON, omit columns with maskBehavior === 'omit'
  // or internal notes when masking is ON
  if (isMasked) {
    candidateCols = candidateCols.filter((col) => {
      if (col.maskBehavior === 'omit') return false;
      const key = String(col.accessorKey || col.id);
      if (INTERNAL_NOTES_REGEX.test(key)) return false;
      return true;
    });
  }

  // 5. Apply View State Filters and Sorts to data
  let processedData = data;
  if (viewState) {
    processedData = applyGridViewFiltersAndSort(data, columns, viewState);
  }
  if (options.customPredicate) {
    processedData = processedData.filter(options.customPredicate);
  }

  // 6. Extract Headers
  const headers = candidateCols.map((col) => {
    if (col.exportHeader) return col.exportHeader;
    if (typeof col.header === 'string') return col.header;
    return col.id;
  });

  // 7. Extract Rows with Masking Values applied
  const rows = processedData.map((row) => {
    return candidateCols.map((col) => {
      let rawVal: any;
      if (col.accessorFn) {
        rawVal = col.accessorFn(row);
      } else if (col.accessorKey) {
        rawVal = row[col.accessorKey as keyof T];
      } else {
        rawVal = (row as any)[col.id];
      }

      // Check if masked
      if (isMasked && isSensitiveColumn(col)) {
        if (typeof col.maskedValue === 'function') {
          return col.maskedValue(rawVal, row);
        }
        if (typeof col.maskedValue === 'string') {
          return col.maskedValue;
        }
        return '***';
      }

      // Custom exportValue formatter
      if (col.exportValue) {
        return col.exportValue(row, rawVal);
      }

      return rawVal ?? null;
    });
  });

  return {
    exportColumns: candidateCols,
    headers,
    rows,
  };
}

/**
 * Generates an RFC 4180 CSV string from grid data.
 */
export function exportGridToCsv<T>(
  data: T[],
  columns: ExportColumnDef<T>[],
  options: GridExportOptions<T> = {}
): string {
  const delimiter = options.delimiter || ',';
  const includeHeaders = options.includeHeaders !== false;
  const { headers, rows } = prepareGridExportPayload(data, columns, options);

  const lines: string[] = [];

  if (includeHeaders) {
    lines.push(headers.map((h) => formatCsvValue(h, delimiter)).join(delimiter));
  }

  for (const row of rows) {
    lines.push(row.map((val) => formatCsvValue(val, delimiter)).join(delimiter));
  }

  return lines.join('\n');
}

/**
 * Generates a TSV string from grid data.
 */
export function exportGridToTsv<T>(
  data: T[],
  columns: ExportColumnDef<T>[],
  options: GridExportOptions<T> = {}
): string {
  return exportGridToCsv(data, columns, {
    ...options,
    delimiter: '\t',
  });
}

/**
 * Generates structured export data with content, metadata, headers, and rows.
 */
export function exportGridData<T>(
  data: T[],
  columns: ExportColumnDef<T>[],
  options: GridExportOptions<T> = {}
): ExportGridResult {
  const format = options.format || 'csv';
  const baseFilename = options.filename || 'grid_export';
  const { headers, rows } = prepareGridExportPayload(data, columns, options);

  let content = '';
  let mimeType = 'text/plain;charset=utf-8;';
  let ext = 'txt';

  switch (format) {
    case 'tsv':
      content = exportGridToTsv(data, columns, options);
      mimeType = 'text/tab-separated-values;charset=utf-8;';
      ext = 'tsv';
      break;

    case 'json': {
      const jsonRows = rows.map((r) => {
        const obj: Record<string, any> = {};
        headers.forEach((h, idx) => {
          obj[h] = r[idx];
        });
        return obj;
      });
      content = JSON.stringify(jsonRows, null, 2);
      mimeType = 'application/json;charset=utf-8;';
      ext = 'json';
      break;
    }

    case 'xlsx': {
      // Clean XML Spreadsheet 2003 format (universally supported by Excel without third-party binary libraries)
      const xmlRows = [
        `<Row>${headers
          .map((h) => `<Cell><Data ss:Type="String">${escapeXml(h)}</Data></Cell>`)
          .join('')}</Row>`,
        ...rows.map(
          (r) =>
            `<Row>${r
              .map((val) => {
                const type = typeof val === 'number' ? 'Number' : 'String';
                return `<Cell><Data ss:Type="${type}">${escapeXml(String(val ?? ''))}</Data></Cell>`;
              })
              .join('')}</Row>`
        ),
      ].join('\n');

      content = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Worksheet ss:Name="Export">
  <Table>
   ${xmlRows}
  </Table>
 </Worksheet>
</Workbook>`;
      mimeType = 'application/vnd.ms-excel;charset=utf-8;';
      ext = 'xlsx';
      break;
    }

    case 'csv':
    default:
      content = exportGridToCsv(data, columns, options);
      mimeType = 'text/csv;charset=utf-8;';
      ext = 'csv';
      break;
  }

  const filename = baseFilename.endsWith(`.${ext}`) ? baseFilename : `${baseFilename}.${ext}`;

  return {
    filename,
    mimeType,
    headers,
    rows,
    content,
  };
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Triggers a browser download of the exported grid data.
 */
export function downloadGridExport<T>(
  data: T[],
  columns: ExportColumnDef<T>[],
  options: GridExportOptions<T> = {}
): ExportGridResult {
  const result = exportGridData(data, columns, options);

  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const blob = new Blob([result.content], { type: result.mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', result.filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return result;
}

export const exportGrid = downloadGridExport;
