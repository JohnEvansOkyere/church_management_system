import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  return (
    <header className="mb-6 flex items-center justify-between rounded-lg bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200">
      <div>
        <p className="text-xs text-slate-500">Signed in as</p>
        <p className="font-semibold text-slate-800">{user?.email ?? 'Unknown user'}</p>
      </div>
      <button
        type="button"
        onClick={() => {
          logout();
          navigate('/login');
        }}
        className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
      >
        Logout
      </button>
    </header>
  );
}
