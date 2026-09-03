import React from 'react';
import { useTranslation } from 'react-i18next';

export interface FinanceWBSProps {
  projectId?: string;
  className?: string;
  onNavigate?: (path: string, entity?: any) => void;
}

const mockWBS = [
  { id: '1.0', name: 'Project Initialization', budget: 5000, actual: 5200, status: 'completed' },
  { id: '2.0', name: 'Site Preparation', budget: 15000, actual: 12500, status: 'active' },
  { id: '2.1', name: 'Safety Inspection', budget: 2000, actual: 2000, status: 'completed', isChild: true },
  { id: '2.2', name: 'Demolition Phase', budget: 13000, actual: 10500, status: 'active', isChild: true },
  { id: '3.0', name: 'Infrastructure Setup', budget: 45000, actual: 0, status: 'locked' },
  { id: '3.1', name: 'Electrical Wiring', budget: 20000, actual: 0, status: 'locked', isChild: true },
  { id: '3.2', name: 'HVAC Installation', budget: 25000, actual: 0, status: 'locked', isChild: true },
];

export function FinanceWBS({ projectId = 'PRJ-1092', className = '', onNavigate }: FinanceWBSProps) {
  const { t } = useTranslation();

  return (
    <div className={`flex flex-col h-full w-full bg-slate-50 dark:bg-slate-950 p-5 ${className}`} data-testid="finance-wbs-surface">
      <header className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            {t('projects.wbs.title', 'Finance WBS: {{projectId}}', { projectId })}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('projects.wbs.desc', 'Work Breakdown Structure and budget tracking.')}
          </p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs text-slate-500 uppercase tracking-wider">{t('projects.wbs.totalBudget', 'Total Budget')}</span>
          <span className="text-lg font-bold text-slate-900 dark:text-white">kr 65,000</span>
        </div>
      </header>

      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm flex-1 overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="p-4 font-medium border-b border-slate-200 dark:border-slate-800">{t('projects.wbs.colTask', 'WBS Task')}</th>
                <th className="p-4 font-medium border-b border-slate-200 dark:border-slate-800 text-right">{t('projects.wbs.colBudget', 'Planned Budget')}</th>
                <th className="p-4 font-medium border-b border-slate-200 dark:border-slate-800 text-right">{t('projects.wbs.colActual', 'Actual Spend')}</th>
                <th className="p-4 font-medium border-b border-slate-200 dark:border-slate-800 text-right">{t('projects.wbs.colVariance', 'Variance')}</th>
                <th className="p-4 font-medium border-b border-slate-200 dark:border-slate-800 text-center">{t('projects.wbs.colStatus', 'Status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {mockWBS.map(item => {
                const variance = item.budget - item.actual;
                const isOverBudget = variance < 0;
                
                return (
                  <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className={`p-4 font-medium text-slate-900 dark:text-slate-100 flex items-center gap-2 ${item.isChild ? 'pl-10' : ''}`}>
                      <span className="text-xs font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                        {item.id}
                      </span>
                      {item.name}
                    </td>
                    <td className="p-4 text-right text-slate-700 dark:text-slate-300">
                      kr {item.budget.toLocaleString()}
                    </td>
                    <td className="p-4 text-right text-slate-700 dark:text-slate-300">
                      kr {item.actual.toLocaleString()}
                    </td>
                    <td className={`p-4 text-right font-semibold ${isOverBudget ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {variance > 0 ? '+' : ''}{variance.toLocaleString()}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-1 text-[10px] uppercase font-bold tracking-wider rounded inline-block w-20 ${
                        item.status === 'completed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' :
                        item.status === 'active' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' :
                        'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {item.status}
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
