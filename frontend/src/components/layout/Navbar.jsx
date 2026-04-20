import { Bell, ChevronRight, Menu } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const PAGE_NAMES = {
  dashboard: 'Dashboard',
  members: 'Members',
  attendance: 'Attendance',
  donations: 'Finance',
  groups: 'Groups',
  events: 'Events',
  communication: 'Communication',
  reports: 'Reports',
};

function getInitials(user) {
  if (!user) return '?';
  const email = user.email || '';
  const parts = email.split('@')[0].split('.');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return email.slice(0, 2).toUpperCase();
}

export default function Navbar({ onMenuClick }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const segments = location.pathname.replace(/^\//, '').split('/').filter(Boolean);
  const rootSegment = segments[0] || 'dashboard';
  const pageName = PAGE_NAMES[rootSegment] ?? rootSegment.charAt(0).toUpperCase() + rootSegment.slice(1);

  const today = useMemo(
    () => new Intl.DateTimeFormat('en-GH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(new Date()),
    []
  );

  function onLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:px-6">
      {/* Left: hamburger (mobile) + breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden"
          aria-label="Open navigation"
        >
          <Menu size={20} />
        </button>

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-sm">
          <span className="text-slate-400">Living Springs</span>
          <ChevronRight size={14} className="text-slate-300" />
          <span className="font-semibold text-slate-800">{pageName}</span>
        </nav>
      </div>

      {/* Right: date + bell + avatar */}
      <div className="flex items-center gap-2">
        <span className="hidden text-xs text-slate-400 md:block">{today}</span>

        <button
          type="button"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
          aria-label="Notifications"
        >
          <Bell size={18} />
        </button>

        {/* Avatar dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-800 hover:ring-2 hover:ring-brand-300 transition"
            aria-label="User menu"
          >
            {getInitials(user)}
          </button>

          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 top-11 z-20 min-w-[200px] rounded-2xl bg-white py-2 shadow-lg ring-1 ring-slate-200">
                <div className="border-b border-slate-100 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-900 truncate">{user?.email}</p>
                  <p className="text-xs text-slate-500 mt-0.5 capitalize">{user?.role?.replace('_', ' ')}</p>
                </div>
                <button
                  type="button"
                  onClick={onLogout}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium text-accent-700 hover:bg-accent-50 transition"
                >
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
