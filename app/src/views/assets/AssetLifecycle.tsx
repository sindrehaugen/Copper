import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { findingRegistry, ASSET_LIFECYCLE_PRODUCER_ID } from '../../shell/finding/registry';

export interface AssetLifecycleProps {
  assetId?: string;
  className?: string;
  onNavigate?: (path: string, entity?: any) => void;
}

const mockTimeline = [
  { id: 't1', state: 'procured', date: '2025-01-15T09:00:00Z', user: 'system' },
  { id: 't2', state: 'provisioned', date: '2025-01-18T14:30:00Z', user: 'SindreL' },
  { id: 't3', state: 'active', date: '2025-01-20T10:15:00Z', user: 'system' },
  { id: 't4', state: 'in_repair', date: '2025-08-11T08:45:00Z', user: 'TechOps' },
  { id: 't5', state: 'active', date: '2025-08-15T16:20:00Z', user: 'TechOps' },
];

export function AssetLifecycle({ assetId = 'AST-9001', className = '', onNavigate }: AssetLifecycleProps) {
  const { t } = useTranslation();

  useEffect(() => {
    findingRegistry.addFindings(ASSET_LIFECYCLE_PRODUCER_ID, [
      {
        id: `ast-eol-${assetId}`,
        severity: 'risk',
        message: t('assets.lifecycle.eolWarning', 'Asset {{assetId}} is approaching End-Of-Life (EOL) in 45 days.', { assetId }),
        timestamp: new Date().toISOString(),
      },
      {
        id: `ast-war-${assetId}`,
        severity: 'advice',
        message: t('assets.lifecycle.warrantyExpiring', 'Manufacturer warranty for {{assetId}} expires next week.', { assetId }),
        timestamp: new Date().toISOString(),
      }
    ]);

    return () => {
      findingRegistry.clearProducerFindings(ASSET_LIFECYCLE_PRODUCER_ID);
    };
  }, [assetId, t]);

  return (
    <div className={`flex flex-col h-full w-full bg-slate-50 dark:bg-slate-950 p-5 ${className}`} data-testid="asset-lifecycle-surface">
      <header className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            {t('assets.lifecycle.title', 'Asset Lifecycle: {{assetId}}', { assetId })}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('assets.lifecycle.desc', '14-state timeline and governed transition history.')}
          </p>
        </div>
        <div className="px-3 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 font-bold rounded shadow-sm text-sm uppercase tracking-wider">
          {t('assets.lifecycle.currentState', 'State: ACTIVE')}
        </div>
      </header>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm flex-1">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-6">
          {t('assets.lifecycle.timelineTitle', 'Transition Timeline')}
        </h2>
        
        <div className="relative border-l border-slate-200 dark:border-slate-700 ml-3 space-y-6 pb-4">
          {mockTimeline.map((event, index) => (
            <div key={event.id} className="relative pl-6">
              <div className="absolute w-3 h-3 bg-purple-500 rounded-full -left-[6.5px] top-1.5 border-2 border-white dark:border-slate-900"></div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                  {event.state.replace('_', ' ')}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {new Date(event.date).toLocaleString()} &bull; {t('assets.lifecycle.byUser', 'by {{user}}', { user: event.user })}
                </span>
              </div>
            </div>
          ))}
          
          <div className="relative pl-6 opacity-50">
            <div className="absolute w-3 h-3 bg-slate-300 dark:bg-slate-700 rounded-full -left-[6.5px] top-1.5 border-2 border-white dark:border-slate-900"></div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wide">
                {t('assets.lifecycle.nextPossible', 'Next Possible State...')}
              </span>
              <div className="flex gap-2 mt-2">
                <button className="px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold rounded">
                  {t('assets.lifecycle.transitionRepair', 'In Repair')}
                </button>
                <button className="px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold rounded">
                  {t('assets.lifecycle.transitionRetire', 'Retired')}
                </button>
                <button className="px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold rounded">
                  {t('assets.lifecycle.transitionLost', 'Lost / Stolen')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
