import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface RmaDisposalProps {
  rmaNumber?: string;
  className?: string;
  onNavigate?: (path: string, entity?: any) => void;
}

export function RmaDisposal({ rmaNumber = '', className = '', onNavigate }: RmaDisposalProps) {
  const { t } = useTranslation();
  const [currentRma, setCurrentRma] = useState(rmaNumber);
  const [sku, setSku] = useState('');
  const [condition, setCondition] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'info'; message: string } | null>(null);

  const handleRestock = () => {
    if (!currentRma || !sku || !condition) return;
    setFeedback({
      type: 'info',
      message: t('inventory.restockSuccess', 'Item {{sku}} (RMA: {{rma}}) has been scheduled for restock.', {
        sku,
        rma: currentRma,
      }),
    });
    setSku('');
    setCondition('');
  };

  const handleDispose = () => {
    if (!currentRma || !sku || !condition) return;
    // Simulate WEEE compliance record ID
    const recordId = `WEEE-REC-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    setFeedback({
      type: 'success',
      message: t('inventory.weeeSuccess', 'Item {{sku}} sent to WEEE disposal. Compliance record: {{recordId}}', {
        sku,
        recordId,
      }),
    });
    setSku('');
    setCondition('');
  };

  return (
    <div className={`flex flex-col h-full w-full bg-slate-50 dark:bg-slate-950 p-5 ${className}`} data-testid="rma-disposal-surface">
      <header className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300">
            {t('inventory.rmaBadge', 'Returns & Disposal')}
          </span>
        </div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          {t('inventory.rmaTitle', 'RMA Intake & Grading')}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t('inventory.rmaSubtitle', 'Process returned units, evaluate for restock, or route to WEEE compliance disposal.')}
        </p>
      </header>

      {feedback && (
        <div
          role="status"
          data-testid="rma-feedback"
          className={`mb-6 p-4 rounded-md border text-sm flex items-start justify-between shadow-sm ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-300'
              : 'bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950/60 dark:border-blue-800 dark:text-blue-300'
          }`}
        >
          <div>
            <h4 className="font-semibold mb-1">
              {feedback.type === 'success' ? t('inventory.successTitle', 'Action Successful') : t('inventory.infoTitle', 'Status Updated')}
            </h4>
            <p>{feedback.message}</p>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="px-2 py-1 text-xs font-semibold rounded bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
          >
            {t('common.dismiss', 'Dismiss')}
          </button>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm max-w-2xl">
        <div className="grid gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t('inventory.rmaNumber', 'RMA Authorization Number')}
            </label>
            <input
              type="text"
              value={currentRma}
              onChange={e => setCurrentRma(e.target.value)}
              placeholder="e.g. RMA-9092"
              className="w-full text-sm rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t('inventory.sku', 'SKU / Serial Number')}
            </label>
            <input
              type="text"
              value={sku}
              onChange={e => setSku(e.target.value)}
              placeholder="e.g. RTR-002-SN1234"
              className="w-full text-sm rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t('inventory.condition', 'Evaluation Condition')}
            </label>
            <select
              value={condition}
              onChange={e => setCondition(e.target.value)}
              className="w-full text-sm rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            >
              <option value="">{t('inventory.selectCondition', '-- Select Condition --')}</option>
              <option value="new_open_box">{t('inventory.conditionNew', 'New (Open Box)')}</option>
              <option value="used_good">{t('inventory.conditionUsed', 'Used - Good')}</option>
              <option value="defective">{t('inventory.conditionDefective', 'Defective / Broken')}</option>
              <option value="doa">{t('inventory.conditionDoa', 'Dead on Arrival (DOA)')}</option>
            </select>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex gap-3">
            <button
              type="button"
              disabled={!currentRma || !sku || !condition}
              onClick={handleRestock}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {t('inventory.actionRestock', 'Restock to Inventory')}
            </button>
            <button
              type="button"
              disabled={!currentRma || !sku || !condition}
              onClick={handleDispose}
              className="flex-1 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
              {t('inventory.actionDispose', 'WEEE Disposal')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
