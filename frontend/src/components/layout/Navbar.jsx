import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const pageName = useMemo(() => {
    const value = location.pathname.replace('/', '') || 'dashboard';
    return value.charAt(0).toUpperCase() + value.slice(1);
  }, [location.pathname]);

  const today = new Intl.DateTimeFormat('en-GH', { dateStyle: 'full' }).format(new Date());

  return (
    <header className="panel mb-6 flex flex-wrap items-center justify-between gap-4 px-5 py-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{pageName}</p>
        <p className="mt-1 text-sm text-slate-600">{today}</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-right">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Signed In</p>
          <p className="text-sm font-bold text-slate-800">{user?.email ?? 'Unknown user'}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="btn-danger"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
