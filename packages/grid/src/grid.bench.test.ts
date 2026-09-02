import { describe, it, expect } from 'vitest';
import { calculateVirtualWindow, filterGridData, ColumnDef } from './DataGrid';

interface BenchItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  location: string;
  status: string;
  quantity: number;
  unitPrice: number;
}

const benchColumns: ColumnDef<BenchItem>[] = [
  { id: 'id', header: 'ID', accessorKey: 'id' },
  { id: 'name', header: 'Device Name', accessorKey: 'name' },
  { id: 'sku', header: 'SKU', accessorKey: 'sku' },
  { id: 'category', header: 'Category', accessorKey: 'category' },
  { id: 'location', header: 'Location', accessorKey: 'location' },
  { id: 'status', header: 'Status', accessorKey: 'status' },
  { id: 'quantity', header: 'Quantity', accessorKey: 'quantity' },
  { id: 'unitPrice', header: 'Price', accessorKey: 'unitPrice' },
];

function generate50kFixture(): BenchItem[] {
  const categories = ['Audio', 'Video', 'Control', 'Lighting', 'Network', 'Compute'];
  const locations = ['Rack A1', 'Rack B2', 'Room 101', 'Room 204', 'Warehouse North', 'Staging Area'];
  const statuses = ['Active', 'In Service', 'Planned', 'Maintenance', 'Decommissioned'];

  const fixture: BenchItem[] = new Array(50000);
  for (let i = 0; i < 50000; i++) {
    fixture[i] = {
      id: `dev-${i + 1}`,
      name: `Enterprise AV Endpoint ${i + 1} Pro Series`,
      sku: `SKU-${100000 + i}`,
      category: categories[i % categories.length],
      location: locations[i % locations.length],
      status: statuses[i % statuses.length],
      quantity: (i % 50) + 1,
      unitPrice: 100 + ((i * 17) % 5000),
    };
  }
  return fixture;
}

describe('DataGrid Performance Benchmark (GR.W1 / B146)', () => {
  const data50k = generate50kFixture();

  it('virtualization engine asserts 60 fps scroll performance (frame compute budget < 16.6 ms) on a 50k fixture', () => {
    const rowHeight = 36; // compact default
    const viewportHeight = 720;
    const overscan = 5;
    const totalRows = data50k.length; // 50,000

    const scrollIterations = 1000;
    const frameTimes: number[] = [];

    // Simulate high-frequency scroll frames across entire 50k range
    for (let i = 0; i < scrollIterations; i++) {
      const scrollTop = (i * 1800) % (totalRows * rowHeight - viewportHeight);
      const start = performance.now();
      const windowResult = calculateVirtualWindow({
        totalRows,
        rowHeight,
        viewportHeight,
        scrollTop,
        overscan,
      });
      const end = performance.now();
      frameTimes.push(end - start);

      expect(windowResult.visibleCount).toBeGreaterThan(0);
      expect(windowResult.visibleCount).toBeLessThan(40); // bounded DOM nodes
      expect(windowResult.startIndex).toBeGreaterThanOrEqual(0);
      expect(windowResult.endIndex).toBeLessThanOrEqual(totalRows);
    }

    const mean = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
    frameTimes.sort((a, b) => a - b);
    const p95 = frameTimes[Math.floor(frameTimes.length * 0.95)];
    const max = frameTimes[frameTimes.length - 1];

    console.log(`[50k Scroll Benchmark] Iterations: ${scrollIterations}, Mean: ${mean.toFixed(4)}ms, P95: ${p95.toFixed(4)}ms, Max: ${max.toFixed(4)}ms`);

    // 60 fps budget is 16.67 ms. Virtual window slice math should take < 1 ms (p95 < 2ms, max < 16.6ms)
    expect(mean).toBeLessThan(1.0);
    expect(p95).toBeLessThan(2.0);
    expect(max).toBeLessThan(16.67);
  });

  it('asserts < 120 ms filter on a 50k fixture', () => {
    const query = 'Rack A1 Pro Series Active';
    const filterRuns = 10;
    const filterTimes: number[] = [];

    for (let r = 0; r < filterRuns; r++) {
      const start = performance.now();
      const filtered = filterGridData(data50k, benchColumns, query);
      const end = performance.now();
      filterTimes.push(end - start);
      expect(filtered.length).toBeGreaterThan(0);
    }

    const mean = filterTimes.reduce((a, b) => a + b, 0) / filterTimes.length;
    filterTimes.sort((a, b) => a - b);
    const p95 = filterTimes[Math.floor(filterTimes.length * 0.95)];
    const max = filterTimes[filterTimes.length - 1];

    console.log(`[50k Filter Benchmark] Runs: ${filterRuns}, Mean: ${mean.toFixed(2)}ms, P95: ${p95.toFixed(2)}ms, Max: ${max.toFixed(2)}ms`);

    // Must satisfy acceptance criteria: < 120 ms filter on a 50k fixture
    expect(p95).toBeLessThan(120);
    expect(mean).toBeLessThan(120);
  });
});
