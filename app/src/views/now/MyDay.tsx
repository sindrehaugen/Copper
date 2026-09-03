import React from 'react';
import { useTranslation } from 'react-i18next';

export interface MyDayProps {
  className?: string;
  onNavigate?: (path: string, entity?: any) => void;
}

const mockTasks = [
  { id: 'TSK-001', title: 'Approve Vendor Scorecard', type: 'approval', status: 'pending', time: '10:00 AM' },
  { id: 'TSK-002', title: 'Phase Gate Review (G2->G3)', type: 'gate', status: 'pending', time: '1:30 PM' },
  { id: 'TSK-003', title: 'Asset Maintenance (AST-9002)', type: 'task', status: 'in_progress', time: 'Overdue' },
];

const mockDeltas = [
  { id: 'D-1', message: 'Project PRJ-1092 budget updated (+kr 5,000)', time: '2 hours ago' },
  { id: 'D-2', message: 'New finding: Warranty Expiring on AST-9001', time: '4 hours ago' },
];

export function MyDay({ className = '', onNavigate }: MyDayProps) {
  const { t } = useTranslation();
  
  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className={`flex flex-col h-full w-full bg-slate-50 dark:bg-slate-950 p-5 overflow-auto ${className}`} data-testid="my-day-surface">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          {t('now.myday.greeting', 'Good Morning, Sindre')}
        </h1>
        <p className="text-base text-slate-500 dark:text-slate-400 mt-2">
          {t('now.myday.date', 'Today is {{date}}', { date: today })}
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Approvals Widget */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm p-5 col-span-1 lg:col-span-2 flex flex-col h-full">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center justify-between">
            {t('now.myday.tasksTitle', 'Tasks & Approvals')}
            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 text-xs rounded-full font-bold">
              {mockTasks.length} {t('now.myday.pending', 'Pending')}
            </span>
          </h2>
          <div className="flex-1 space-y-3">
            {mockTasks.map(task => (
              <div key={task.id} className="flex items-center justify-between p-3 border border-slate-100 dark:border-slate-800/60 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    task.type === 'approval' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' :
                    task.type === 'gate' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
                    'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    {task.type === 'approval' ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    ) : task.type === 'gate' ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"></path></svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{task.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{task.id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-semibold ${task.time === 'Overdue' ? 'text-rose-500' : 'text-slate-500 dark:text-slate-400'}`}>
                    {task.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Delta Widget */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm p-5 col-span-1 flex flex-col h-full">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            {t('now.myday.deltasTitle', 'Since You Left')}
          </h2>
          <div className="flex-1 space-y-4">
            {mockDeltas.map(delta => (
              <div key={delta.id} className="flex flex-col relative pl-4 border-l-2 border-purple-500">
                <span className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-tight">
                  {delta.message}
                </span>
                <span className="text-xs text-slate-400 mt-1">{delta.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SLA Clocks Row */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm p-5">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          {t('now.myday.slaTitle', 'Active SLA Clocks')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-slate-100 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-900/50 flex flex-col">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">INC-9912 (Critical)</span>
            <span className="text-3xl font-mono font-bold text-rose-500 mb-1">00:14:22</span>
            <span className="text-xs text-slate-500 font-medium">Time to Response (TTR)</span>
          </div>
          <div className="p-4 border border-slate-100 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-900/50 flex flex-col">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">INC-9890 (High)</span>
            <span className="text-3xl font-mono font-bold text-amber-500 mb-1">02:45:00</span>
            <span className="text-xs text-slate-500 font-medium">Time to Resolution</span>
          </div>
        </div>
      </div>

    </div>
  );
}
