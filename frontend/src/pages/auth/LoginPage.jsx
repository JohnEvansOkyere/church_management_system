import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await authService.login({ email, password });
      const { access_token, user } = response.data.data;
      setAuth(user, access_token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8">
      <section className="grid w-full max-w-6xl overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-slate-200 lg:grid-cols-2">
        <div className="relative overflow-hidden bg-gradient-to-br from-brand-800 via-brand-700 to-cyan-700 p-8 text-white">
          <div className="absolute -left-20 -top-24 h-64 w-64 rounded-full bg-white/10" />
          <div className="absolute -bottom-20 right-8 h-56 w-56 rounded-full bg-white/10" />

          <p className="relative text-xs font-semibold uppercase tracking-[0.18em] text-white/80">Living Spring International Church</p>
          <h1 className="relative mt-4 text-4xl font-extrabold leading-tight">Church operations platform built for speed and clarity.</h1>
          <p className="relative mt-4 max-w-md text-sm text-white/90">
            Manage members, track attendance, and coordinate church workflow from one secure dashboard.
          </p>

          <div className="relative mt-8 grid gap-3 text-sm text-white/90">
            <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3">Realtime member visibility</div>
            <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3">Role-based access for church teams</div>
            <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3">Attendance and growth insights</div>
          </div>
        </div>

        <div className="p-8 lg:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">Secure Sign In</p>
          <h2 className="mt-2 text-3xl font-extrabold text-slate-900">Welcome back</h2>
          <p className="mt-2 text-sm text-slate-600">Use your assigned account to access the church dashboard.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="field"
                placeholder="you@livingspring.org"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="field"
                placeholder="Enter your password"
              />
            </div>

            {error ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200">{error}</p> : null}

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
              {isSubmitting ? 'Signing in...' : 'Sign in to dashboard'}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
