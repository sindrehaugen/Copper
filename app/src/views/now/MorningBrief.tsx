import React from 'react';
import { useTranslation } from 'react-i18next';

export interface MorningBriefProps {
  className?: string;
  onNavigate?: (path: string, entity?: any) => void;
}

const mockBriefs = [
  { id: 'MB-1', type: 'finding', title: 'Thermal Throttling on Switch-A1', severity: 'high', entity: 'AST-9002' },
  { id: 'MB-2', type: 'approval', title: 'G2 Phase Gate Review Required', severity: 'medium', entity: 'PRJ-1092' },
  { id: 'MB-3', type: 'delta', title: 'Budget exceeded in Demolition Phase', severity: 'medium', entity: 'PRJ-1092' },
];

export function MorningBrief({ className = '', onNavigate }: MorningBriefProps) {
  const { t } = useTranslation();

  return (
    <div className={`flex flex-col h-full w-full bg-slate-50 dark:bg-slate-950 p-5 ${className}`} data-testid="morning-brief-surface">
      <header className="mb-6 flex justify-between items-end border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"></path></svg>
            {t('now.morning.title', 'Morning Brief')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('now.morning.desc', 'Actionable synthesis of what needs your attention today.')}
          </p>
        </div>
        <span className="text-xs font-mono bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-1 rounded">
          {new Date().toISOString().split('T')[0]}
        </span>
      </header>

      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm p-5 flex-1">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
          {t('now.morning.priority', 'Priority Rollup')}
        </h2>
        
        <div className="space-y-3">
          {mockBriefs.map(brief => (
            <div 
              key={brief.id} 
              className="flex items-start justify-between p-4 border border-slate-100 dark:border-slate-800 rounded-lg hover:border-purple-300 dark:hover:border-purple-700 transition-colors group cursor-pointer"
              onClick={() => onNavigate?.(`/e/project/${brief.entity}`)}
            >
              <div className="flex items-start gap-4">
                <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${brief.severity === 'high' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {brief.title}
                  </h3>
                  <div className="flex gap-2 mt-1">
                    <span className="text-xs font-mono text-slate-400">{brief.entity}</span>
                    <span className="text-xs text-slate-400 uppercase">• {brief.type}</span>
                  </div>
                </div>
              </div>
              <svg className="w-5 h-5 text-slate-300 dark:text-slate-700 group-hover:text-purple-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
