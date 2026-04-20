import { CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';

const features = [
  'Real-time member visibility and profiles',
  'Role-based access for all church teams',
  'Attendance tracking and growth insights',
  'Integrated giving and finance management',
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl shadow-2xl ring-1 ring-slate-200 lg:grid-cols-2">

        {/* Left — brand panel */}
        <div className="relative flex flex-col justify-between overflow-hidden bg-brand-900 p-8 text-white lg:p-10">
          {/* Decorative circles */}
          <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-white/5" />
          <div className="pointer-events-none absolute -bottom-20 right-0 h-72 w-72 rounded-full bg-white/5" />
          <div className="pointer-events-none absolute right-10 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-brand-700/30" />

          {/* Church logo + name */}
          <div className="relative">
            <div className="flex items-center gap-3">
              <img src="/logo.jpg" alt="Living Springs Church" className="h-14 w-14 rounded-2xl object-cover ring-2 ring-white/20" />
              <div>
                <p className="text-base font-bold leading-tight">Living Springs</p>
                <p className="text-xs text-white/60">International Church · Accra, Ghana</p>
              </div>
            </div>

            <h1 className="mt-8 text-3xl font-extrabold leading-tight lg:text-4xl">
              Managing God's people with purpose.
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-white/70">
              A secure, all-in-one platform for your church office — members, attendance, finance, and communication in one place.
            </p>
          </div>

          {/* Feature list */}
          <div className="relative mt-8 space-y-3">
            {features.map((feature) => (
              <div key={feature} className="flex items-start gap-3">
                <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0 text-church-500" />
                <span className="text-sm text-white/80">{feature}</span>
              </div>
            ))}
          </div>

          <p className="relative mt-8 text-xs text-white/30">
            Built for Living Spring International Church · 2026
          </p>
        </div>

        {/* Right — login form */}
        <div className="flex flex-col justify-center bg-white px-8 py-10 lg:px-12">
          <div className="mx-auto w-full max-w-sm">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-700">Secure Sign In</p>
            <h2 className="mt-2 text-2xl font-extrabold text-slate-900">Welcome back</h2>
            <p className="mt-1.5 text-sm text-slate-500">
              Use your assigned church account credentials to sign in.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              {/* Email */}
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="field"
                  placeholder="you@livingspring.org"
                />
              </div>

              {/* Password */}
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="field pr-10"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error ? (
                <p className="rounded-xl bg-accent-50 px-4 py-3 text-sm text-accent-700 ring-1 ring-accent-100">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full justify-center py-3 text-base"
              >
                {isSubmitting ? 'Signing in…' : 'Sign in to dashboard'}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-slate-400">
              Contact your church administrator if you need account access.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
