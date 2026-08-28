import { ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ErrorState } from './error-state';

function Layout({ children }: { children: ReactNode }) {
  const { t } = useTranslation();

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
      </header>
      <main>
        {children}
      </main>
    </div>
  );
}

function Home() {
  const { t } = useTranslation();
  return <div><h1>{t('nav.home')}</h1></div>;
}

export function AppShell() {
  return (
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
  );
}
