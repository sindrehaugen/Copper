import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface PhaseBoardProps {
  projectId?: string;
  className?: string;
  onNavigate?: (path: string, entity?: any) => void;
}

const PHASES = [
  { id: 'G0', name: 'Opportunity', status: 'completed' },
  { id: 'G1', name: 'Proposal', status: 'completed' },
  { id: 'G2', name: 'Planning', status: 'active' },
  { id: 'G3', name: 'Execution', status: 'locked' },
  { id: 'G4', name: 'Handover', status: 'locked' },
  { id: 'G5', name: 'Closed', status: 'locked' },
];

export function PhaseBoard({ projectId = 'PRJ-1092', className = '', onNavigate }: PhaseBoardProps) {
  const { t } = useTranslation();
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleAdvance = () => {
    setFeedback({
      type: 'success',
      message: t('projects.phase.advanceSuccess', 'Project successfully advanced to Execution (G3).')
    });
  };

  return (
    <div className={`flex flex-col h-full w-full bg-slate-50 dark:bg-slate-950 p-5 ${className}`} data-testid="phase-board-surface">
      <header className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            {t('projects.phase.title', 'Project Phases: {{projectId}}', { projectId })}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('projects.phase.desc', 'G0-G5 gate board with can_enter_phase checks.')}
          </p>
        </div>
        <button 
          onClick={() => onNavigate?.('/quote/convert', { type: 'QUOTE' })}
          className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded shadow-sm text-sm"
        >
          {t('projects.phase.btnConvert', 'Convert Quote to Project')}
        </button>
      </header>

      {feedback && (
        <div
          data-testid="phase-feedback"
          className={`mb-6 p-4 rounded-md border text-sm flex items-start justify-between shadow-sm ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-300'
              : 'bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-950/60 dark:border-rose-800 dark:text-rose-300'
          }`}
        >
          <div>
            <h4 className="font-semibold mb-1">
              {feedback.type === 'success' ? t('projects.phase.successTitle', 'Phase Updated') : t('projects.phase.errorTitle', 'Validation Failed')}
            </h4>
            <p>{feedback.message}</p>
          </div>
          <button onClick={() => setFeedback(null)} className="px-2 py-1 text-xs font-semibold rounded bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors">
            {t('common.dismiss', 'Dismiss')}
          </button>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm flex-1">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {PHASES.map((phase, index) => (
            <div key={phase.id} className="flex-1 flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 z-10 ${
                phase.status === 'completed' ? 'bg-emerald-500 border-emerald-600 text-white' :
                phase.status === 'active' ? 'bg-blue-600 border-blue-700 text-white ring-4 ring-blue-100 dark:ring-blue-900/30' :
                'bg-slate-100 border-slate-300 text-slate-400 dark:bg-slate-800 dark:border-slate-700'
              }`}>
                {phase.status === 'completed' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                ) : phase.id}
              </div>
              <div className="text-center mt-3">
                <div className={`text-sm font-bold ${
                  phase.status === 'active' ? 'text-blue-600 dark:text-blue-400' : 
                  phase.status === 'completed' ? 'text-slate-900 dark:text-slate-100' :
                  'text-slate-500 dark:text-slate-500'
                }`}>
                  {phase.name}
                </div>
                <div className="text-xs text-slate-500 uppercase tracking-wider mt-0.5">
                  {t(`projects.phase.state_${phase.status}`, phase.status)}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wider">
            {t('projects.phase.gateChecks', 'Gate Checks (G2 -> G3)')}
          </h3>
          <ul className="space-y-3 mb-6">
            <li className="flex items-center gap-3 text-sm">
              <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              <span className="text-slate-700 dark:text-slate-300">{t('projects.phase.checkBudget', 'Budget Baseline Approved')}</span>
            </li>
            <li className="flex items-center gap-3 text-sm">
              <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              <span className="text-slate-700 dark:text-slate-300">{t('projects.phase.checkResources', 'Key Resources Allocated')}</span>
            </li>
            <li className="flex items-center gap-3 text-sm">
              <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              <span className="text-slate-700 dark:text-slate-300">{t('projects.phase.checkRisks', 'Risk Register Completed')}</span>
            </li>
          </ul>
          <button 
            data-testid="advance-phase-btn"
            onClick={handleAdvance}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded text-sm transition-colors shadow-sm"
          >
            {t('projects.phase.btnAdvance', 'Advance to Execution (G3)')}
          </button>
        </div>
      </div>
    </div>
  );
}
