import React from 'react';
import { useTranslation } from 'react-i18next';

export interface CostAndUsageProps {
  className?: string;
  onNavigate?: (path: string, entity?: any) => void;
}

const mockLedger = [
  { id: 'L-101', timestamp: '2026-09-03T09:12:00Z', function: 'execute_query_template', model: 'gpt-4o', namespace: 'tn-alpha', cost: 0.12 },
  { id: 'L-102', timestamp: '2026-09-03T09:14:30Z', function: 'semantic_search', model: 'text-embedding-v3', namespace: 'tn-alpha', cost: 0.01 },
  { id: 'L-103', timestamp: '2026-09-03T10:05:00Z', function: 'graph_search', model: 'claude-3-haiku', namespace: 'tn-beta', cost: 0.04 },
  { id: 'L-104', timestamp: '2026-09-03T10:30:00Z', function: 'generate_proposal', model: 'gemini-1.5-pro', namespace: 'tn-alpha', cost: 0.45 },
];

export function CostAndUsage({ className = '', onNavigate }: CostAndUsageProps) {
  const { t } = useTranslation();

  const totalCost = mockLedger.reduce((sum, item) => sum + item.cost, 0);

  return (
    <div className={`flex flex-col h-full w-full bg-slate-50 dark:bg-slate-950 p-5 ${className}`} data-testid="cost-usage-surface">
      <header className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            {t('iq.cost.title', 'Cost & Usage Ledger')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('iq.cost.desc', 'Attribution tracked strictly at the call site per namespace, function, and model.')}
          </p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs text-slate-500 uppercase tracking-wider">{t('iq.cost.total', 'Total Spend (30d)')}</span>
          <span className="text-2xl font-bold text-slate-900 dark:text-white">${totalCost.toFixed(2)}</span>
        </div>
      </header>

      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm flex-1 overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="p-4 font-medium border-b border-slate-200 dark:border-slate-800">{t('iq.cost.colTime', 'Timestamp')}</th>
                <th className="p-4 font-medium border-b border-slate-200 dark:border-slate-800">{t('iq.cost.colNamespace', 'Namespace')}</th>
                <th className="p-4 font-medium border-b border-slate-200 dark:border-slate-800">{t('iq.cost.colFunction', 'Function')}</th>
                <th className="p-4 font-medium border-b border-slate-200 dark:border-slate-800">{t('iq.cost.colModel', 'Model')}</th>
                <th className="p-4 font-medium border-b border-slate-200 dark:border-slate-800 text-right">{t('iq.cost.colCost', 'Cost (USD)')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {mockLedger.map(entry => (
                <tr key={entry.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 font-mono text-xs text-slate-500 dark:text-slate-400">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded font-medium text-xs">
                      {entry.namespace}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-xs text-purple-600 dark:text-purple-400">
                    {entry.function}()
                  </td>
                  <td className="p-4 text-slate-700 dark:text-slate-300">
                    {entry.model}
                  </td>
                  <td className="p-4 text-right font-mono font-semibold text-slate-900 dark:text-slate-100">
                    ${entry.cost.toFixed(4)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
