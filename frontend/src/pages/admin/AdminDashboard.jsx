import { useState } from 'react';
import DashboardView from './DashboardView';
import SupportInboxPage from './SupportInboxPage';

const PAGES = new Set(['dashboard', 'support']);

export default function AdminDashboard({ email, onLogout }) {
  const [activePage, setActivePage] = useState('dashboard');

  const navigate = (pageId) => {
    if (PAGES.has(pageId)) {
      setActivePage(pageId);
    }
  };

  if (activePage === 'support') {
    return (
      <SupportInboxPage
        email={email}
        onLogout={onLogout}
        onNavigate={navigate}
      />
    );
  }

  return (
    <DashboardView
      email={email}
      onLogout={onLogout}
      onNavigate={navigate}
    />
  );
}
