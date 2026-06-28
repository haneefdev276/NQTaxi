import React from 'react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'home' },
  { id: 'analytics', label: 'Analytics', icon: 'chart' },
  { id: 'fleet', label: 'Fleet', icon: 'truck' },
  { id: 'users', label: 'Users', icon: 'users' },
  { id: 'support', label: 'Support & Help Center', icon: 'help' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
  { id: 'calendar', label: 'Calendar', icon: 'calendar' },

];

function NavIcon({ name }) {
  switch (name) {
    case 'home':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4.5 w-4.5">
          <path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1v-9.5z" />
        </svg>
      );
    case 'chart':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4.5 w-4.5">
          <path d="M4 19V5M10 19V9M16 19v-4M22 19V3" />
        </svg>
      );
    case 'truck':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4.5 w-4.5">
          <path d="M14 18V6a2 2 0 00-2-2H4a2 2 0 00-2 2v11M14 18H2M14 18h2a2 2 0 002-2v-3h3l-2-4h-5v9zM18 18h2v-3h-2v3zM6 18a2 2 0 100-4 2 2 0 000 4zM18 18a2 2 0 100-4 2 2 0 000 4z" />
        </svg>
      );
    case 'users':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4.5 w-4.5">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
        </svg>
      );
    case 'help':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4.5 w-4.5">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" />
        </svg>
      );
    case 'mail':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4.5 w-4.5">
          <path d="M4 4h16v16H4zM4 4l8 8 8-8" />
        </svg>
      );
    case 'settings':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4.5 w-4.5">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      );
    case 'calendar':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4.5 w-4.5">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      );
    default:
      return null;
  }
}

export default function AdminSidebar({ activePage, onNavigate, isOpen, onClose, onLogout }) {
  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-[#1A1A1A] text-white">
      {/* Upper Area */}
      <div>
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-white/[0.08] px-6">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🚕</span>
            <span className="text-lg font-black tracking-wider text-white">
              NQ<span className="text-[#F5C518]">Taxi</span>
            </span>
          </div>
          {/* Close button on mobile */}
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 hover:bg-white/5 md:hidden"
            aria-label="Close menu"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 text-gray-400">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation list */}
        <nav className="mt-6 flex flex-col gap-1 px-3" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onNavigate(item.id);
                  if (onClose) onClose();
                }}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-[#F5C518]/10 text-[#F5C518] shadow-sm'
                    : 'text-gray-400 hover:bg-white/[0.03] hover:text-white'
                }`}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className={isActive ? 'text-[#F5C518]' : 'text-gray-400'}>
                  <NavIcon name={item.icon} />
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Area (Logout button inside sidebar) */}
      <div className="border-t border-white/[0.08] p-4">
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] py-2.5 text-xs font-semibold text-gray-300 hover:border-[#F44336]/30 hover:bg-[#F44336]/5 hover:text-[#F44336] transition-all"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
          </svg>
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Fixed/Static on the left, independent of layout scrolling) */}
      <aside className="hidden h-screen w-60 shrink-0 border-r border-white/[0.08] bg-[#1A1A1A] md:block fixed left-0 top-0 bottom-0 z-30">
        {sidebarContent}
      </aside>


      {/* Mobile Slide-in Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-60 transform bg-[#1A1A1A] transition-transform duration-300 ease-in-out md:hidden shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
