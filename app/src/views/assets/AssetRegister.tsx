import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface AssetRegisterProps {
  assetId?: string;
  className?: string;
  onNavigate?: (path: string, entity?: any) => void;
}

const mockAssets = [
  { id: 'AST-9001', name: 'Cisco Catalyst 9300', status: 'active', room: 'Server Room A (L1)', type: 'Network Switch' },
  { id: 'AST-9002', name: 'Samsung QMR 65"', status: 'maintenance', room: 'Conference Room 3B', type: 'Display' },
  { id: 'AST-9003', name: 'Crestron CP4N', status: 'active', room: 'AV Rack 1', type: 'Control Processor' },
  { id: 'AST-9004', name: 'Logitech Rally Bar', status: 'offline', room: 'Huddle Space 2', type: 'Video Conferencing' },
];

export function AssetRegister({ assetId, className = '', onNavigate }: AssetRegisterProps) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = mockAssets.filter(
    a => 
      a.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.room.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`flex flex-col h-full w-full bg-slate-50 dark:bg-slate-950 p-5 ${className}`} data-testid="asset-register-surface">
      <header className="mb-6">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          {t('assets.register.title', 'Asset Register')}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t('assets.register.desc', 'View and manage deployed physical assets linked to spaces (lives_in).')}
        </p>
      </header>
      
      <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm flex-1 flex flex-col">
        <div className="mb-4 flex items-center justify-between">
          <input
            type="text"
            placeholder={t('assets.register.search', 'Search assets, IDs, or rooms...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md text-sm rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded text-sm transition-colors shadow-sm">
            {t('assets.register.add', 'Register Asset')}
          </button>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="p-3 font-medium border-b border-slate-200 dark:border-slate-800">{t('assets.register.colId', 'Asset ID')}</th>
                <th className="p-3 font-medium border-b border-slate-200 dark:border-slate-800">{t('assets.register.colName', 'Name / Model')}</th>
                <th className="p-3 font-medium border-b border-slate-200 dark:border-slate-800">{t('assets.register.colType', 'Category')}</th>
                <th className="p-3 font-medium border-b border-slate-200 dark:border-slate-800">{t('assets.register.colLocation', 'Location (lives_in)')}</th>
                <th className="p-3 font-medium border-b border-slate-200 dark:border-slate-800">{t('assets.register.colStatus', 'Status')}</th>
                <th className="p-3 font-medium border-b border-slate-200 dark:border-slate-800 text-right">{t('assets.register.colActions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filtered.map(asset => (
                <tr key={asset.id} className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/40 ${assetId === asset.id ? 'bg-purple-50/50 dark:bg-purple-900/10' : ''}`}>
                  <td className="p-3 font-mono text-xs font-semibold text-slate-900 dark:text-slate-100">
                    <button 
                      onClick={() => onNavigate?.(`/asset/${asset.id}`, { id: asset.id, type: 'ASSET' })}
                      className="text-purple-600 dark:text-purple-400 hover:underline text-left"
                    >
                      {asset.id}
                    </button>
                  </td>
                  <td className="p-3 font-medium text-slate-900 dark:text-slate-100">{asset.name}</td>
                  <td className="p-3 text-slate-700 dark:text-slate-300">{asset.type}</td>
                  <td className="p-3 text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <svg className="w-4 h-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    {asset.room}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 text-[10px] uppercase font-bold tracking-wider rounded ${
                      asset.status === 'active' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' :
                      asset.status === 'maintenance' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' :
                      'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'
                    }`}>
                      {asset.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                      {t('assets.register.btnDetails', 'Details')}
                    </button>
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
