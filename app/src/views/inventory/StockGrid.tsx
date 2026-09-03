import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export interface StockLocation {
  id: string;
  name: string;
  type: 'warehouse' | 'van';
}

export interface StockItem {
  id: string;
  sku: string;
  name: string;
  onHand: number;
  reserved: number;
  available: number;
  unitValue: number;
  locationId: string;
}

export interface StockGridProps {
  locationId?: string;
  className?: string;
  onNavigate?: (path: string, entity?: any) => void;
}

// Mock Data
const MOCK_LOCATIONS: StockLocation[] = [
  { id: 'loc-1', name: 'Main Distribution Center', type: 'warehouse' },
  { id: 'loc-2', name: 'Van 4 - Oslo North', type: 'van' },
];

const MOCK_STOCK: StockItem[] = [
  { id: 'st-1', sku: 'CBL-001', name: 'Cat6 Cable 300m', onHand: 45, reserved: 5, available: 40, unitValue: 120.0, locationId: 'loc-1' },
  { id: 'st-2', sku: 'RTR-002', name: 'Enterprise Router 9000', onHand: 12, reserved: 12, available: 0, unitValue: 1450.0, locationId: 'loc-1' },
  { id: 'st-3', sku: 'CBL-001', name: 'Cat6 Cable 300m', onHand: 2, reserved: 0, available: 2, unitValue: 120.0, locationId: 'loc-2' },
];

export function StockGrid({ locationId, className = '', onNavigate }: StockGridProps) {
  const { t } = useTranslation();

  const location = MOCK_LOCATIONS.find(l => l.id === locationId) || MOCK_LOCATIONS[0];
  const items = useMemo(() => MOCK_STOCK.filter(i => i.locationId === location.id), [location.id]);

  const totalValue = items.reduce((sum, item) => sum + (item.onHand * item.unitValue), 0);

  return (
    <div className={`flex flex-col h-full w-full bg-slate-50 dark:bg-slate-950 ${className}`} data-testid="stock-grid-surface">
      <header className="p-5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex items-center gap-3 mb-2">
          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
            {location.type === 'warehouse' ? t('inventory.warehouse', 'Warehouse') : t('inventory.van', 'Van')}
          </span>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            {location.name}
          </h1>
        </div>
        <div className="flex gap-6 text-sm">
          <div>
            <span className="text-slate-500 dark:text-slate-400">{t('inventory.totalItems', 'Total Items')}: </span>
            <span className="font-medium text-slate-900 dark:text-slate-100">{items.length}</span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400">{t('inventory.totalValue', 'Total Value')}: </span>
            <span className="font-medium text-emerald-600 dark:text-emerald-400">${totalValue.toLocaleString()}</span>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-5">
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="p-3 font-medium border-b border-slate-200 dark:border-slate-800">{t('inventory.sku', 'SKU')}</th>
                <th className="p-3 font-medium border-b border-slate-200 dark:border-slate-800">{t('inventory.name', 'Product Name')}</th>
                <th className="p-3 font-medium border-b border-slate-200 dark:border-slate-800 text-right">{t('inventory.onHand', 'On Hand')}</th>
                <th className="p-3 font-medium border-b border-slate-200 dark:border-slate-800 text-right">{t('inventory.reserved', 'Reserved')}</th>
                <th className="p-3 font-medium border-b border-slate-200 dark:border-slate-800 text-right">{t('inventory.available', 'Available')}</th>
                <th className="p-3 font-medium border-b border-slate-200 dark:border-slate-800 text-right">{t('inventory.value', 'Total Value')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {items.map(item => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="p-3 font-mono text-xs">{item.sku}</td>
                  <td className="p-3 font-medium text-slate-900 dark:text-slate-100">{item.name}</td>
                  <td className="p-3 text-right tabular-nums">{item.onHand}</td>
                  <td className="p-3 text-right tabular-nums text-amber-600 dark:text-amber-400">{item.reserved > 0 ? item.reserved : '-'}</td>
                  <td className="p-3 text-right tabular-nums font-medium text-emerald-600 dark:text-emerald-400">{item.available}</td>
                  <td className="p-3 text-right tabular-nums text-slate-500 dark:text-slate-400">
                    ${(item.onHand * item.unitValue).toLocaleString()}
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 dark:text-slate-400">
                    {t('inventory.empty', 'No stock items found for this location.')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
