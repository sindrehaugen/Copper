import React, { useState, useMemo } from 'react';
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

export function StockGrid({ locationId, className = '' }: StockGridProps) {
  const { t } = useTranslation();

  const [items, setItems] = useState<StockItem[]>(MOCK_STOCK);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const location = MOCK_LOCATIONS.find(l => l.id === locationId) || MOCK_LOCATIONS[0];
  const displayedItems = useMemo(() => items.filter(i => i.locationId === location.id), [items, location.id]);

  const totalValue = displayedItems.reduce((sum, item) => sum + (item.onHand * item.unitValue), 0);

  const handleReserve = (itemId: string) => {
    // TODO: Wire governedAction
    setItems(prev =>
      prev.map(item => {
        if (item.id === itemId && item.available > 0) {
          return {
            ...item,
            reserved: item.reserved + 1,
            available: item.available - 1,
          };
        }
        return item;
      })
    );
  };

  const handleRelease = (itemId: string) => {
    // TODO: Wire governedAction
    setItems(prev =>
      prev.map(item => {
        if (item.id === itemId && item.reserved > 0) {
          return {
            ...item,
            reserved: item.reserved - 1,
            available: item.available + 1,
          };
        }
        return item;
      })
    );
  };

  const handleConsume = (itemId: string) => {
    // TODO: Wire governedAction
    setItems(prev =>
      prev.map(item => {
        if (item.id === itemId && item.available > 0) {
          return {
            ...item,
            onHand: item.onHand - 1,
            available: item.available - 1,
          };
        }
        return item;
      })
    );
  };

  const handleTransfer = (item: StockItem) => {
    // TODO: Wire governedAction
    setFeedbackMessage(
      t('inventory.transferSuccess', 'Stock transfer initiated for {{sku}} ({{name}})', {
        sku: item.sku,
        name: item.name,
      })
    );
  };

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
            <span className="font-medium text-slate-900 dark:text-slate-100">{displayedItems.length}</span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400">{t('inventory.totalValue', 'Total Value')}: </span>
            <span className="font-medium text-emerald-600 dark:text-emerald-400">{`$${totalValue.toLocaleString()}`}</span>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-5">
        {feedbackMessage && (
          <div
            role="status"
            data-testid="stock-flash-message"
            className="mb-4 p-3 rounded-md bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-sm flex items-center justify-between shadow-sm"
          >
            <span>{feedbackMessage}</span>
            <button
              type="button"
              onClick={() => setFeedbackMessage(null)}
              className="text-xs font-semibold px-2 py-1 rounded bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900 dark:hover:bg-emerald-800 text-emerald-800 dark:text-emerald-200 transition-colors"
            >
              {t('common.dismiss', 'Dismiss')}
            </button>
          </div>
        )}

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
                <th className="p-3 font-medium border-b border-slate-200 dark:border-slate-800 text-right">{t('inventory.actions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {displayedItems.map(item => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="p-3 font-mono text-xs">{item.sku}</td>
                  <td className="p-3 font-medium text-slate-900 dark:text-slate-100">{item.name}</td>
                  <td className="p-3 text-right tabular-nums">{item.onHand}</td>
                  <td className="p-3 text-right tabular-nums text-amber-600 dark:text-amber-400">{item.reserved > 0 ? item.reserved : '-'}</td>
                  <td className="p-3 text-right tabular-nums font-medium text-emerald-600 dark:text-emerald-400">{item.available}</td>
                  <td className="p-3 text-right tabular-nums text-slate-500 dark:text-slate-400">
                    {`$${(item.onHand * item.unitValue).toLocaleString()}`}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        disabled={item.available <= 0}
                        onClick={() => handleReserve(item.id)}
                        className="px-2 py-1 text-xs font-medium rounded border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        {t('inventory.reserve', 'Reserve')}
                      </button>
                      <button
                        type="button"
                        disabled={item.reserved <= 0}
                        onClick={() => handleRelease(item.id)}
                        className="px-2 py-1 text-xs font-medium rounded border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        {t('inventory.release', 'Release')}
                      </button>
                      <button
                        type="button"
                        disabled={item.available <= 0}
                        onClick={() => handleConsume(item.id)}
                        className="px-2 py-1 text-xs font-medium rounded border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        {t('inventory.consume', 'Consume')}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTransfer(item)}
                        className="px-2 py-1 text-xs font-medium rounded border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/60 transition-colors"
                      >
                        {t('inventory.transfer', 'Transfer')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {displayedItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 dark:text-slate-400">
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
