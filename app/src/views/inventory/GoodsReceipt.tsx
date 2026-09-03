import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { findingRegistry, THREE_WAY_MATCH_PRODUCER_ID } from '../../shell/finding/registry';
import type { Finding } from '../../shell/finding/types';

export interface GoodsReceiptItem {
  id: string;
  poNumber: string;
  lineItemNumber: number;
  sku: string;
  description: string;
  expectedQuantity: number;
  receivedQuantity: number;
  unit: string;
  unitPrice?: number;
}

export interface GoodsReceiptProps {
  poNumber?: string;
  items?: GoodsReceiptItem[];
  className?: string;
  onNavigate?: (path: string, entity?: any) => void;
  onReceiptRecorded?: (receipt: {
    poNumber: string;
    items: GoodsReceiptItem[];
    hasDiscrepancy: boolean;
    findingsCount: number;
  }) => void;
}

export const DEFAULT_RECEIPT_ITEMS: GoodsReceiptItem[] = [
  {
    id: 'item-1',
    poNumber: 'PO-123',
    lineItemNumber: 1,
    sku: 'CAB-CAT6-BLU',
    description: 'Cat6 UTP Network Cable 305m Spool',
    expectedQuantity: 50,
    receivedQuantity: 50,
    unit: 'spools',
    unitPrice: 120.0,
  },
];

export function GoodsReceipt({
  poNumber = 'PO-123',
  items: initialItems,
  className = '',
  onReceiptRecorded,
}: GoodsReceiptProps) {
  const { t } = useTranslation();

  const [items, setItems] = useState<GoodsReceiptItem[]>(() => {
    if (initialItems && initialItems.length > 0) {
      return initialItems;
    }
    return DEFAULT_RECEIPT_ITEMS.map((item) => ({
      ...item,
      poNumber: poNumber || item.poNumber,
    }));
  });

  const [packingSlip, setPackingSlip] = useState('DN-2026-9041');
  const [carrier, setCarrier] = useState('DHL Express');
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'warning' | 'error';
    message: string;
  } | null>(null);

  const totalExpected = useMemo(
    () => items.reduce((sum, item) => sum + item.expectedQuantity, 0),
    [items]
  );

  const totalReceived = useMemo(
    () => items.reduce((sum, item) => sum + item.receivedQuantity, 0),
    [items]
  );

  const hasDiscrepancy = totalExpected !== totalReceived || items.some(i => i.expectedQuantity !== i.receivedQuantity);

  const handleQuantityChange = (id: string, rawVal: string) => {
    const val = rawVal === '' ? 0 : Math.max(0, parseInt(rawVal, 10) || 0);
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, receivedQuantity: val } : item))
    );
  };

  const handleResetToExpected = () => {
    setItems((prev) =>
      prev.map((item) => ({
        ...item,
        receivedQuantity: item.expectedQuantity,
      }))
    );
    setFeedback(null);
  };

  const handleRecordReceipt = () => {
    const mismatchedItems = items.filter(
      (item) => item.receivedQuantity !== item.expectedQuantity
    );

    if (mismatchedItems.length > 0) {
      const newFindings: Finding[] = mismatchedItems.map((item) => {
        const variance = item.receivedQuantity - item.expectedQuantity;
        const findingId = `twm-receipt-qty-mismatch-${item.poNumber}-${item.id}`;

        return {
          id: findingId,
          severity: 'risk',
          rule: 'receipt-quantity-mismatch',
          message: t(
            'inventory.mismatchFindingMessage',
            'Receipt quantity mismatch on PO {{poNumber}}: expected {{expected}} {{unit}}, received {{received}} {{unit}}',
            {
              poNumber: item.poNumber,
              sku: item.sku,
              expected: item.expectedQuantity,
              received: item.receivedQuantity,
              unit: item.unit,
            }
          ),
          entityRef: {
            type: 'PURCHASE_ORDER',
            id: item.poNumber,
          },
          evidence: {
            poNumber: item.poNumber,
            sku: item.sku,
            expectedQuantity: item.expectedQuantity,
            receivedQuantity: item.receivedQuantity,
            variance,
            packingSlip,
            carrier,
          },
          provenanceRef: `prov://inventory/receipt/${item.poNumber}/${item.id}`,
          fix: {
            id: `fix-receipt-variance-${item.id}`,
            label: t('inventory.fixAuthorizeVariance', 'Authorize quantity variance'),
            apply: () => {
              findingRegistry.clearFinding(findingId);
            },
          },
          producerId: THREE_WAY_MATCH_PRODUCER_ID,
          timestamp: Date.now(),
        };
      });

      findingRegistry.addFindings(THREE_WAY_MATCH_PRODUCER_ID, newFindings);

      setFeedback({
        type: 'warning',
        message: t(
          'inventory.receiptDiscrepancyAlert',
          'Receipt recorded with discrepancy: 3-way match finding raised.'
        ),
      });

      onReceiptRecorded?.({
        poNumber,
        items,
        hasDiscrepancy: true,
        findingsCount: newFindings.length,
      });
    } else {
      setFeedback({
        type: 'success',
        message: t(
          'inventory.receiptSuccessMessage',
          'Receipt recorded successfully. All quantities match purchase order.'
        ),
      });

      onReceiptRecorded?.({
        poNumber,
        items,
        hasDiscrepancy: false,
        findingsCount: 0,
      });
    }
  };

  return (
    <div
      className={`flex flex-col h-full w-full bg-slate-50 dark:bg-slate-950 ${className}`}
      data-testid="goods-receipt-surface"
    >
      <header className="p-5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                {t('inventory.goodsReceipt', 'Goods Receipt')}
              </span>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                {poNumber}
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              {t('inventory.receiptCaptureTitle', 'Receipt Capture')}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t(
                'inventory.receiptCaptureDesc',
                'Verify and record incoming shipment quantities against Purchase Order'
              )}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleResetToExpected}
              data-testid="reset-to-expected-button"
              className="px-3 py-1.5 text-xs font-medium rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              {t('inventory.resetToExpected', 'Reset to Expected')}
            </button>
            <button
              type="button"
              onClick={handleRecordReceipt}
              data-testid="record-receipt-button"
              className="px-4 py-1.5 text-xs font-semibold rounded bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors"
            >
              {t('inventory.recordReceipt', 'Record Receipt')}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/60 text-xs">
          <div>
            <span className="text-slate-500 dark:text-slate-400 block">
              {t('inventory.purchaseOrder', 'Purchase Order')}
            </span>
            <span className="font-semibold text-slate-900 dark:text-slate-100 font-mono">
              {poNumber}
            </span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 block">
              {t('inventory.totalExpected', 'Total Expected')}
            </span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {totalExpected}
            </span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 block">
              {t('inventory.totalReceived', 'Total Received')}
            </span>
            <span
              className={`font-semibold ${
                hasDiscrepancy
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {totalReceived}
            </span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 block">
              {t('inventory.matchStatus', 'Match Status')}
            </span>
            <span
              className={`font-semibold inline-flex items-center gap-1 ${
                hasDiscrepancy
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {hasDiscrepancy
                ? t('inventory.statusMismatch', 'Quantity Mismatch')
                : t('inventory.statusMatched', 'Matched')}
            </span>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-5 space-y-4">
        {feedback && (
          <div
            role={feedback.type === 'warning' || feedback.type === 'error' ? 'alert' : 'status'}
            data-testid="goods-receipt-feedback"
            className={`p-3 rounded-md text-xs flex items-center justify-between border shadow-sm ${
              feedback.type === 'warning'
                ? 'bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/60 dark:border-amber-800 dark:text-amber-300'
                : feedback.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-950/60 dark:border-rose-800 dark:text-rose-300'
                : 'bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-300'
            }`}
          >
            <span>{feedback.message}</span>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              data-testid="dismiss-feedback-button"
              className="px-2 py-0.5 font-semibold rounded bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
            >
              {t('common.dismiss', 'Dismiss')}
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
          <div>
            <label
              htmlFor="receipt-packing-slip"
              className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
            >
              {t('inventory.packingSlipNumber', 'Packing Slip / DN')}
            </label>
            <input
              id="receipt-packing-slip"
              type="text"
              value={packingSlip}
              onChange={(e) => setPackingSlip(e.target.value)}
              placeholder={t('inventory.packingSlipPlaceholder', 'e.g. DN-2026-9041')}
              className="w-full text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="receipt-carrier"
              className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
            >
              {t('inventory.carrier', 'Carrier')}
            </label>
            <input
              id="receipt-carrier"
              type="text"
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              placeholder={t('inventory.carrierPlaceholder', 'e.g. DHL Express')}
              className="w-full text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="p-3 font-medium border-b border-slate-200 dark:border-slate-800">
                  {t('inventory.line', 'Line')}
                </th>
                <th className="p-3 font-medium border-b border-slate-200 dark:border-slate-800">
                  {t('inventory.sku', 'SKU')}
                </th>
                <th className="p-3 font-medium border-b border-slate-200 dark:border-slate-800">
                  {t('inventory.itemDescription', 'Item Description')}
                </th>
                <th className="p-3 font-medium border-b border-slate-200 dark:border-slate-800 text-right">
                  {t('inventory.expectedQty', 'Expected Qty')}
                </th>
                <th className="p-3 font-medium border-b border-slate-200 dark:border-slate-800 text-right">
                  {t('inventory.receivedQty', 'Received Qty')}
                </th>
                <th className="p-3 font-medium border-b border-slate-200 dark:border-slate-800">
                  {t('inventory.unit', 'Unit')}
                </th>
                <th className="p-3 font-medium border-b border-slate-200 dark:border-slate-800 text-right">
                  {t('inventory.variance', 'Variance')}
                </th>
                <th className="p-3 font-medium border-b border-slate-200 dark:border-slate-800 text-right">
                  {t('inventory.status', 'Status')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {items.map((item, index) => {
                const variance = item.receivedQuantity - item.expectedQuantity;
                const isMatch = variance === 0;

                return (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-mono">{item.lineItemNumber}</td>
                    <td className="p-3 font-mono font-medium text-slate-900 dark:text-slate-100">
                      {item.sku}
                    </td>
                    <td className="p-3 text-slate-700 dark:text-slate-300">
                      {item.description}
                    </td>
                    <td className="p-3 text-right tabular-nums font-semibold text-slate-900 dark:text-slate-100">
                      {item.expectedQuantity}
                    </td>
                    <td className="p-3 text-right">
                      <input
                        type="number"
                        min="0"
                        value={item.receivedQuantity}
                        onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                        data-testid={index === 0 ? 'received-quantity-input' : `received-quantity-input-${item.id}`}
                        aria-label={t('inventory.enterReceivedQty', 'Enter received quantity')}
                        className={`w-24 text-right tabular-nums font-semibold text-xs rounded border px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                          isMatch
                            ? 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                            : 'border-amber-400 dark:border-amber-600 bg-amber-50/50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200'
                        }`}
                      />
                    </td>
                    <td className="p-3 text-slate-500 dark:text-slate-400">
                      {item.unit}
                    </td>
                    <td className="p-3 text-right tabular-nums font-semibold">
                      <span
                        className={
                          variance === 0
                            ? 'text-slate-400'
                            : variance < 0
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-blue-600 dark:text-blue-400'
                        }
                      >
                        {variance}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded font-medium text-[11px] ${
                          isMatch
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
                        }`}
                      >
                        {isMatch
                          ? t('inventory.statusMatched', 'Matched')
                          : t('inventory.statusMismatch', 'Quantity Mismatch')}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
