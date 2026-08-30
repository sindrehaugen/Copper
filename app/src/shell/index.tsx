import { ReactNode, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDocumentStore } from '../store/documentStore';
import { ErrorState } from './error-state';

// Placeholder Context for Session/Tenancy
interface SessionContextType {
  tenantId: string;
  userId: string;
}

const SessionContext = createContext<SessionContextType | null>(null);

function Layout({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const { document, promoteDocument, isSaving } = useDocumentStore();
  const session = useContext(SessionContext);

  return (
    <div className="app-layout">
      <header>
        <nav>
          <ul>
            <li>
              <Link to="/">{t('nav.home')}</Link>
            </li>
            <li>
              <Link to="/dashboard">{t('nav.dashboard')}</Link>
            </li>
            <li>
              <Link to="/settings">{t('nav.settings')}</Link>
            </li>
          </ul>
        </nav>
        <div className="session-info">
          Tenant: {session?.tenantId} | User: {session?.userId}
        </div>
      </header>
      <main>
        {children}
      </main>
    </div>
  );
}

function Home() {
  const { t } = useTranslation();
  const { document, promoteDocument, isSaving } = useDocumentStore();
  return <div><h1>{t('nav.home')}</h1></div>;
}

export function AppShell() {
  const placeholderSession = { tenantId: 'tenant-1', userId: 'user-1' };

  return (
    <SessionContext.Provider value={placeholderSession}>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<div>Dashboard</div>} />
            <Route path="/settings" element={<div>Settings</div>} />
            <Route path="*" element={<ErrorState error={{ code: -32005 }} />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </SessionContext.Provider>
  );
}

