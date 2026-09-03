import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface SettingsPlaneProps {
  className?: string;
  onNavigate?: (path: string, entity?: any) => void;
}

export function SettingsPlane({ className = '', onNavigate }: SettingsPlaneProps) {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState<'localization' | 'routing' | 'tolerances'>('localization');
  const [routingRegion, setRoutingRegion] = useState('EU-WEST');
  const [tolerance, setTolerance] = useState(5.0);

  return (
    <div className={`flex flex-col h-full w-full bg-slate-50 dark:bg-slate-950 p-5 ${className}`} data-testid="settings-plane-surface">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <svg className="w-6 h-6 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          {t('sys.settings.title', 'Tenant Settings')}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t('sys.settings.desc', 'Configure core tenant parameters, localization, and operational guardrails.')}
        </p>
      </header>

      <div className="flex gap-6 h-full">
        {/* Sidebar Nav */}
        <div className="w-64 flex flex-col gap-2">
          <button 
            onClick={() => setActiveTab('localization')}
            className={`text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'localization' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
          >
            {t('sys.settings.tabLocalization', 'Localization')}
          </button>
          <button 
            onClick={() => setActiveTab('routing')}
            className={`text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'routing' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
          >
            {t('sys.settings.tabRouting', 'Routing Preferences')}
          </button>
          <button 
            onClick={() => setActiveTab('tolerances')}
            className={`text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'tolerances' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
          >
            {t('sys.settings.tabTolerances', 'Tolerances & Limits')}
          </button>
        </div>

        {/* Content Pane */}
        <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6">
          
          {activeTab === 'localization' && (
            <div className="space-y-6 max-w-lg">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">{t('sys.settings.tabLocalization', 'Localization')}</h2>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('sys.settings.language', 'Interface Language')}</label>
                <select 
                  value={(i18n?.language || 'en')}
                  onChange={(e) => i18n?.changeLanguage(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                >
                  <option value="en">English (US)</option>
                  <option value="no">Norsk (Bokmål)</option>
                  <option value="de">Deutsch</option>
                  <option value="sv">Svenska</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('sys.settings.timezone', 'Timezone')}</label>
                <select className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-100">
                  <option value="UTC">UTC (Coordinated Universal Time)</option>
                  <option value="Europe/Oslo">Europe/Oslo</option>
                  <option value="Europe/London">Europe/London</option>
                  <option value="America/New_York">America/New_York</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'routing' && (
            <div className="space-y-6 max-w-lg">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">{t('sys.settings.tabRouting', 'Routing Preferences')}</h2>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('sys.settings.agentRegion', 'AI Execution Region')}</label>
                <p className="text-xs text-slate-500 mb-2">Controls where MCP mutations and LLM inferences are executed for data sovereignty.</p>
                <select 
                  value={routingRegion}
                  onChange={(e) => setRoutingRegion(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                >
                  <option value="EU-WEST">EU-WEST (Frankfurt, Paris)</option>
                  <option value="US-EAST">US-EAST (N. Virginia)</option>
                  <option value="AP-SOUTH">AP-SOUTH (Mumbai, Singapore)</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'tolerances' && (
            <div className="space-y-6 max-w-lg">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">{t('sys.settings.tabTolerances', 'Tolerances & Limits')}</h2>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t('sys.settings.budgetTolerance', 'Budget Variance Tolerance (%)')}
                </label>
                <p className="text-xs text-slate-500 mb-2">Projects exceeding this variance threshold require G2 Phase Gate approval.</p>
                <div className="flex items-center gap-4">
                  <input 
                    type="range" 
                    min="1" max="25" step="0.5" 
                    value={tolerance}
                    onChange={(e) => setTolerance(parseFloat(e.target.value))}
                    className="flex-1 accent-indigo-600"
                  />
                  <span className="font-mono text-sm text-slate-700 dark:text-slate-300 font-bold">{tolerance}%</span>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
