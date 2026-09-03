import React from 'react';
import { useTranslation } from 'react-i18next';

export interface ContractorMatchProps {
  className?: string;
  onNavigate?: (path: string, entity?: any) => void;
}

const mockPartners = [
  { id: 'p1', name: 'ProInstallers Ltd', score: 98, certs: ['ISO 9001', 'Electrical Level 3'], location: 'Oslo, NO' },
  { id: 'p2', name: 'Acme Tech Services', score: 92, certs: ['Plumbing Basic', 'HVAC Pro'], location: 'Bergen, NO' },
  { id: 'p3', name: 'Global Contracting Co.', score: 76, certs: ['General Construction'], location: 'Trondheim, NO' },
];

export function ContractorMatch({ className = '', onNavigate }: ContractorMatchProps) {
  const { t } = useTranslation();

  return (
    <div className={`flex flex-col h-full w-full bg-slate-50 dark:bg-slate-950 p-5 ${className}`} data-testid="contractor-match-surface">
      <header className="mb-6">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          {t('sourcing.contractor.title', 'Contractor Matching')}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t('sourcing.contractor.desc', 'Partner-scoped view honoring the A2A contractor allowlist.')}
        </p>
      </header>
      
      <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm flex-1">
        <div className="mb-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {t('sourcing.contractor.matchedPartners', 'Matched Partners')}
          </h2>
          <span className="text-xs font-semibold px-2 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 rounded">
            {t('sourcing.contractor.allowlistActive', 'Allowlist Active')}
          </span>
        </div>

        <div className="grid gap-4">
          {mockPartners.map(partner => (
            <div key={partner.id} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100">{partner.name}</h3>
                <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {partner.location} &bull; {partner.certs.join(', ')}
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className={`text-xl font-bold ${partner.score >= 90 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                  {partner.score}%
                </div>
                <div className="text-xs text-slate-400 uppercase tracking-wider">{t('sourcing.contractor.matchScore', 'Match Score')}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
