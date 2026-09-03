import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export function GlobalSearch() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  // Simulated search results across domains
  const results = [
    { id: 'RES-1', type: 'Project', title: 'Data Center Alpha', desc: 'Phase G2 - Active', score: 0.98 },
    { id: 'RES-2', type: 'Space', title: 'Server Room A-1', desc: 'Located in HQ Building', score: 0.85 },
    { id: 'RES-3', type: 'Inventory', title: 'Cisco Switch 9300', desc: 'Stock: 14 units (TN-01)', score: 0.72 },
    { id: 'RES-4', type: 'Quote', title: 'QT-4402', desc: 'Pending Approval - Vendor V-908', score: 0.61 },
  ].filter(r => r.title.toLowerCase().includes(query.toLowerCase()) || r.type.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Use / or Cmd+P for global search
      if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] bg-slate-900/60 backdrop-blur-sm" data-testid="global-search-modal">
      <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[80vh]">
        
        {/* Input Header */}
        <div className="flex items-center p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
          <svg className="w-6 h-6 text-slate-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          <input 
            type="text"
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={t('shell.search.placeholder', 'Search projects, spaces, inventory, quotes...')}
            className="flex-1 bg-transparent border-none outline-none text-xl text-slate-900 dark:text-white placeholder-slate-400"
          />
          <button onClick={() => setIsOpen(false)} className="ml-2 px-2 py-1 text-xs font-mono text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 bg-slate-200 dark:bg-slate-800 rounded">
            ESC
          </button>
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-2 bg-white dark:bg-slate-950">
          {query.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400">
              <svg className="w-12 h-12 mb-4 text-slate-300 dark:text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
              <p className="text-sm">{t('shell.search.emptyState', 'Start typing to search across the entire domain.')}</p>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-1">
              <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                {t('shell.search.results', 'Top Results')}
              </div>
              {results.map(res => (
                <div key={res.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50 cursor-pointer group transition-colors">
                  <div className="flex items-center gap-4">
                    <span className={`w-16 text-center py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                      res.type === 'Project' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' :
                      res.type === 'Space' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' :
                      res.type === 'Inventory' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' :
                      'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400'
                    }`}>
                      {res.type}
                    </span>
                    <div>
                      <h4 className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {res.title}
                      </h4>
                      <p className="text-xs text-slate-500">{res.desc}</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-slate-400 bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded">
                    {(res.score * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400">
              <p className="text-sm">{t('shell.search.noResults', 'No matching entities found.')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
