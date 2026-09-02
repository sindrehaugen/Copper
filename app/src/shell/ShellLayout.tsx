import { ReactNode, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { GlobalBar, GlobalBarProps } from './GlobalBar';
import { ContextRail } from './ContextRail';
import { IntelligenceRail } from './IntelligenceRail';
import { FindingsTray } from './FindingsTray';
import { IntelligenceSection, ShellFinding } from './layout';
import './shell.css';

export interface ShellLayoutProps {
  children: ReactNode;
  globalBarProps?: GlobalBarProps;
  intelligenceSections?: IntelligenceSection[];
  findings?: ShellFinding[];
}

export function ShellLayout({
  children,
  globalBarProps,
  intelligenceSections = [],
  findings = [],
}: ShellLayoutProps) {
  const { t } = useTranslation();
  const [contextRailCollapsed, setContextRailCollapsed] = useState(false);
  const [intelligenceRailCollapsed, setIntelligenceRailCollapsed] = useState(false);
  const [findingsTrayOpen, setFindingsTrayOpen] = useState(false);

  const toggleContextRail = useCallback(() => {
    setContextRailCollapsed(prev => !prev);
  }, []);

  const toggleIntelligenceRail = useCallback(() => {
    setIntelligenceRailCollapsed(prev => !prev);
  }, []);

  const toggleFindingsTray = useCallback(() => {
    setFindingsTrayOpen(prev => !prev);
  }, []);

  const handleCommandOpen = useCallback(() => {
    const searchBtn = document.querySelector<HTMLButtonElement>('[data-testid="global-search-btn"]');
    searchBtn?.focus();
  }, []);

  const handleAskAboutThis = useCallback(() => {
    const askBtn = document.querySelector<HTMLButtonElement>('[data-testid="ask-about-this-btn"]');
    askBtn?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command palette
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        handleCommandOpen();
      }
      // Intelligence Ask
      else if (e.altKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        handleAskAboutThis();
      }
      // Findings Tray Toggle
      else if (e.ctrlKey && e.key === '`') {
        e.preventDefault();
        toggleFindingsTray();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleCommandOpen, handleAskAboutThis, toggleFindingsTray]);

  return (
    <div className="copper-shell-container">
      <a href="#main-content" className="copper-skip-link">
        {t('nav.skipToContent')}
      </a>

      <GlobalBar
        {...globalBarProps}
        onOpenCommand={handleCommandOpen}
      />

      <div className="copper-workspace-body">
        <ContextRail
          isCollapsed={contextRailCollapsed}
          onToggleCollapse={toggleContextRail}
        />

        <main id="main-content" tabIndex={-1} className="copper-stage">
          {children}
        </main>

        <IntelligenceRail
          sections={intelligenceSections}
          isCollapsed={intelligenceRailCollapsed}
          onToggleCollapse={toggleIntelligenceRail}
          onAskAboutThis={handleAskAboutThis}
        />
      </div>

      <FindingsTray
        findings={findings}
        isOpen={findingsTrayOpen}
        onToggle={toggleFindingsTray}
      />
    </div>
  );
}
