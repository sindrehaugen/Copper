import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export function ActionTray() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  // Mock data for multi-step actions in progress
  const [actions] = useState([
    { id: 'ACT-901', title: 'Convert Quote to Project', entity: 'QT-4402', step: 2, totalSteps: 3 },
    { id: 'ACT-902', title: 'Dispatch Field Tech', entity: 'INC-8812', step: 1, totalSteps: 2 },
  ]);

  if (actions.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end" data-testid="action-tray">
      {isOpen && (
        <div className="mb-4 w-80 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="bg-slate-100 dark:bg-slate-800 p-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-2">
              <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
              {t('shell.tray.title', 'Action Tray')}
            </h3>
            <span className="text-xs font-semibold bg-white dark:bg-slate-900 px-2 py-0.5 rounded text-slate-500">
              {actions.length} {t('shell.tray.pending', 'Pending')}
            </span>
          </div>
          <div className="p-2 space-y-2">
            {actions.map(act => (
              <div key={act.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">{act.title}</span>
                  <span className="text-xs font-mono text-slate-400">{act.entity}</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mb-2">
                  <div className="bg-purple-500 h-full rounded-full transition-all" style={{ width: \`\${(act.step / act.totalSteps) * 100}%\` }}></div>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 dark:text-slate-400">
                    {t('shell.tray.stepProgress', 'Step {{step}} of {{total}}', { step: act.step, total: act.totalSteps })}
                  </span>
                  <button className="text-purple-600 dark:text-purple-400 font-semibold hover:underline">
                    {t('shell.tray.resume', 'Resume')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <button 
        data-testid="action-tray-toggle"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-full shadow-lg hover:shadow-xl transition-all"
      >
        <span className="w-5 h-5 flex items-center justify-center bg-purple-500 text-white rounded-full text-xs">
          {actions.length}
        </span>
        {t('shell.tray.button', 'Actions')}
      </button>
    </div>
  );
}
