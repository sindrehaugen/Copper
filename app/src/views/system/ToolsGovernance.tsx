import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface ToolsGovernanceProps {
  className?: string;
  onNavigate?: (path: string, entity?: any) => void;
}

const initialTools = [
  { id: 'execute_query_template', name: 'Execute Query Template', namespace: 'system', status: 'active', desc: 'Executes pre-approved GraphQL and SQL read-only queries. Crucial for graph_search.' },
  { id: 'semantic_search', name: 'Semantic Search', namespace: 'mcp-core', status: 'active', desc: 'Vector search across the primary knowledge graph.' },
  { id: 'propose_mutation', name: 'Propose Mutation', namespace: 'mcp-core', status: 'active', desc: 'Pushes draft modifications to the Action Tray.' },
  { id: 'resolve_contradiction', name: 'Resolve Contradiction', namespace: 'mcp-admin', status: 'suspended', desc: 'Allows overriding explicit domain conflicts. (Suspended by default).' },
];

export function ToolsGovernance({ className = '', onNavigate }: ToolsGovernanceProps) {
  const { t } = useTranslation();
  const [tools, setTools] = useState(initialTools);

  const toggleTool = (id: string) => {
    setTools(tools.map(tool => 
      tool.id === id 
        ? { ...tool, status: tool.status === 'active' ? 'suspended' : 'active' }
        : tool
    ));
  };

  return (
    <div className={`flex flex-col h-full w-full bg-slate-50 dark:bg-slate-950 p-5 ${className}`} data-testid="tools-governance-surface">
      <header className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <svg className="w-6 h-6 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
            {t('op.tools.title', 'Tools Governance')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('op.tools.desc', 'MCP Tool registry and global kill switches. Implements strict fail-closed semantics.')}
          </p>
        </div>
        <div className="bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 px-3 py-1.5 rounded border border-rose-200 dark:border-rose-800 flex items-center gap-2 text-sm font-semibold">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
          </span>
          Fail-Closed Enforced
        </div>
      </header>

      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm flex-1 overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="p-4 font-medium border-b border-slate-200 dark:border-slate-800">{t('op.tools.colTool', 'Tool ID')}</th>
                <th className="p-4 font-medium border-b border-slate-200 dark:border-slate-800">{t('op.tools.colNamespace', 'Namespace')}</th>
                <th className="p-4 font-medium border-b border-slate-200 dark:border-slate-800">{t('op.tools.colDesc', 'Description')}</th>
                <th className="p-4 font-medium border-b border-slate-200 dark:border-slate-800">{t('op.tools.colStatus', 'Status')}</th>
                <th className="p-4 font-medium border-b border-slate-200 dark:border-slate-800 text-right">{t('op.tools.colAction', 'Kill Switch')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {tools.map(tool => (
                <tr key={tool.id} className={`transition-colors ${tool.status === 'suspended' ? 'bg-slate-50/50 dark:bg-slate-900/50 opacity-75' : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/40'}`}>
                  <td className="p-4">
                    <div className="font-mono font-semibold text-slate-900 dark:text-slate-100">{tool.id}</div>
                    <div className="text-xs text-slate-500 mt-1">{tool.name}</div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded font-medium text-xs">
                      {tool.namespace}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-400 max-w-md">
                    {tool.desc}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
                      tool.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400'
                    }`}>
                      {tool.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => toggleTool(tool.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                        tool.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        tool.status === 'active' ? 'translate-x-6' : 'translate-x-1'
                      }`} />
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
