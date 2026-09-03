import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export function AskAgentModal() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  // Simulated active context
  const activeContext = { type: 'PROJECT', id: 'PRJ-1092' };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-slate-900/50 backdrop-blur-sm" data-testid="ask-agent-modal">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[70vh]">
        
        {/* Input Header */}
        <div className="flex flex-col border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center p-4 pb-2">
            <svg className="w-5 h-5 text-purple-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            <input 
              type="text"
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={t('shell.agent.placeholderScoped', 'Ask about {{id}}...', { id: activeContext.id })}
              className="flex-1 bg-transparent border-none outline-none text-lg text-slate-900 dark:text-white placeholder-slate-400"
            />
            <button onClick={() => setIsOpen(false)} className="ml-2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          
          {/* Context Pill */}
          <div className="px-11 pb-3 flex gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800" data-testid="context-pill">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
              {t('shell.agent.scopedTo', 'Scoped to: ')}{activeContext.type} {activeContext.id}
            </span>
          </div>
        </div>

        {/* Chat Body */}
        <div className="flex-1 p-4 overflow-y-auto bg-slate-50 dark:bg-slate-950/50 min-h-[300px]">
          {query.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <p className="text-sm">{t('shell.agent.emptyState', 'I can help you analyze metrics, find entities, or take actions.')}</p>
              <div className="mt-4 flex gap-2">
                <span className="px-2 py-1 bg-slate-200 dark:bg-slate-800 rounded text-xs font-mono text-slate-500">⌘K to close</span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">U</div>
                <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200">
                  {query}
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </div>
                <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 text-sm text-slate-500 italic">
                  {t('shell.agent.thinking', 'Analyzing your request...')}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center text-xs text-slate-500">
          <div className="flex gap-4">
            <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono">↵</kbd> {t('shell.agent.send', 'Send')}</span>
            <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono">↑↓</kbd> {t('shell.agent.history', 'History')}</span>
          </div>
          <span>Powered by Copper Intelligence</span>
        </div>
      </div>
    </div>
  );
}
