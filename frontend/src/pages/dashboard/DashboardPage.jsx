import { Link } from 'react-router-dom';
import PageHeader from '../../components/shared/PageHeader';
import StatCard from '../../components/shared/StatCard';
import { useAuthStore } from '../../store/authStore';

const quickActions = [
  {
    title: 'Members Directory',
    detail: 'Review member records and register new people.',
    to: '/members',
    cta: 'Open Members',
  },
  {
    title: 'Attendance Desk',
    detail: 'Create service sessions and monitor turnout.',
    to: '/attendance',
    cta: 'Open Attendance',
  },
  {
    title: 'Financial Center',
    detail: 'Prepare for donation and reporting workflows.',
    to: '/donations',
    cta: 'Open Donations',
  },
];

export default function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <section>
      <PageHeader title="Dashboard" subtitle="Operational command center for church admin and ministry teams." />

      <div className="panel mb-6 overflow-hidden p-6">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-700">Welcome</p>
            <h2 className="mt-2 text-3xl font-extrabold text-slate-900">{user?.role ? `${user.role} workspace ready.` : 'Workspace ready.'}</h2>
            <p className="mt-3 max-w-2xl text-sm text-slate-600">
              Members and attendance modules are production-ready. Use this area to drive daily operational execution while other modules are being rolled out.
            </p>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-brand-700 to-cyan-700 p-5 text-white">
            <p className="text-xs uppercase tracking-[0.16em] text-white/80">Current Focus</p>
            <p className="mt-2 text-2xl font-extrabold">Member Growth + Attendance Discipline</p>
            <p className="mt-3 text-sm text-white/90">Keep data updated weekly to maintain accurate follow-up and planning.</p>
          </div>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Current Role" value={user?.role ?? '-'} helper="Role-based permissions active" />
        <StatCard label="Members Module" value="Live" helper="Create, list, update, export" tone="good" />
        <StatCard label="Attendance Module" value="Live" helper="Sessions, summary, tracking" tone="good" />
        <StatCard label="Next Priority" value="Donations" helper="Implementation queued" tone="warn" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {quickActions.map((action) => (
          <article key={action.title} className="panel p-5">
            <h3 className="text-lg font-bold text-slate-900">{action.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{action.detail}</p>
            <Link to={action.to} className="mt-4 inline-flex text-sm font-semibold text-brand-700 hover:text-brand-800">
              {action.cta} {'->'}
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
