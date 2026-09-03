import React from 'react';
import { useTranslation } from 'react-i18next';

export interface NamespacesAndUsersProps {
  className?: string;
  onNavigate?: (path: string, entity?: any) => void;
}

const mockNamespaces = [
  { id: 'tn-alpha', name: 'Alpha Corp', activeUsers: 42, mcpBridges: 3, status: 'active' },
  { id: 'tn-beta', name: 'Beta Inc', activeUsers: 12, mcpBridges: 1, status: 'active' },
  { id: 'tn-gamma', name: 'Gamma LLC', activeUsers: 0, mcpBridges: 0, status: 'suspended' },
];

export function NamespacesAndUsers({ className = '', onNavigate }: NamespacesAndUsersProps) {
  const { t } = useTranslation();

  return (
    <div className={`flex flex-col h-full w-full bg-slate-50 dark:bg-slate-950 p-5 ${className}`} data-testid="namespaces-users-surface">
      <header className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            {t('op.namespaces.title', 'Namespaces & Users')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('op.namespaces.desc', 'Tenant administration, metadata, bridges, and user roles at the BFF boundary.')}
          </p>
        </div>
        <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium shadow transition-colors">
          {t('op.namespaces.addTenant', '+ New Tenant')}
        </button>
      </header>

      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm flex-1 overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="p-4 font-medium border-b border-slate-200 dark:border-slate-800">ID</th>
                <th className="p-4 font-medium border-b border-slate-200 dark:border-slate-800">Name</th>
                <th className="p-4 font-medium border-b border-slate-200 dark:border-slate-800">Status</th>
                <th className="p-4 font-medium border-b border-slate-200 dark:border-slate-800 text-right">Users</th>
                <th className="p-4 font-medium border-b border-slate-200 dark:border-slate-800 text-right">MCP Bridges</th>
                <th className="p-4 font-medium border-b border-slate-200 dark:border-slate-800"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {mockNamespaces.map(ns => (
                <tr key={ns.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 font-mono text-xs text-slate-500 dark:text-slate-400">
                    {ns.id}
                  </td>
                  <td className="p-4 font-semibold text-slate-800 dark:text-slate-200">
                    {ns.name}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
                      ns.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400'
                    }`}>
                      {ns.status}
                    </span>
                  </td>
                  <td className="p-4 text-right font-mono text-slate-600 dark:text-slate-300">
                    {ns.activeUsers}
                  </td>
                  <td className="p-4 text-right font-mono text-slate-600 dark:text-slate-300">
                    {ns.mcpBridges}
                  </td>
                  <td className="p-4 text-right">
                    <button className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium text-xs uppercase tracking-wider">
                      Manage
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
