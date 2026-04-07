import { Link } from 'react-router-dom';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import PageHeader from '../../components/shared/PageHeader';
import StatCard from '../../components/shared/StatCard';
import TrendBars from '../../components/shared/TrendBars';
import { useAttendanceMonthlyReport, useDashboardReport, useDonationsMonthlyReport, useExpensesMonthlyReport, useMembersGrowthReport } from '../../hooks/useReports';
import { formatCurrency } from '../../utils/formatters';

const quickActions = [
  {
    title: 'Members Directory',
    detail: 'Review member records and register new people.',
    to: '/members',
    cta: 'Open Members',
  },
  {
    title: 'Attendance Desk',
    detail: 'Run quick service check-in and session tracking.',
    to: '/attendance',
    cta: 'Open Attendance',
  },
  {
    title: 'Finance Center',
    detail: 'Record giving and review fund totals.',
    to: '/donations',
    cta: 'Open Finance',
  },
];

export default function DashboardPage() {
  const dashboardQuery = useDashboardReport();
  const attendanceTrendQuery = useAttendanceMonthlyReport();
  const donationsTrendQuery = useDonationsMonthlyReport();
  const expensesTrendQuery = useExpensesMonthlyReport();
  const membersTrendQuery = useMembersGrowthReport();

  if (dashboardQuery.isLoading) {
    return <LoadingSpinner label="Loading dashboard metrics..." />;
  }

  const metrics = dashboardQuery.data?.data ?? {};
  const attendanceTrend = attendanceTrendQuery.data?.data ?? [];
  const donationsTrend = donationsTrendQuery.data?.data ?? [];
  const expensesTrend = expensesTrendQuery.data?.data ?? [];
  const membersTrend = membersTrendQuery.data?.data ?? [];

  return (
    <section>
      <PageHeader title="Dashboard" subtitle="Live operational performance across members and attendance." />

      <div className="panel mb-6 overflow-hidden p-6">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-700">Live Snapshot</p>
            <h2 className="mt-2 text-3xl font-extrabold text-slate-900">Church operations at a glance</h2>
            <p className="mt-3 max-w-2xl text-sm text-slate-600">
              Metrics update from your backend reports endpoints. Attendance and member growth trends are shown below.
            </p>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-brand-700 to-cyan-700 p-5 text-white">
            <p className="text-xs uppercase tracking-[0.16em] text-white/80">Current Attendance</p>
            <p className="mt-2 text-3xl font-extrabold">{metrics.attendance_percentage ?? 0}%</p>
            <p className="mt-3 text-sm text-white/90">{metrics.attendance_last_sunday ?? 0} present in latest tracked service.</p>
          </div>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total Members" value={metrics.total_members ?? 0} helper="All member records" />
        <StatCard label="New This Month" value={metrics.new_members_this_month ?? 0} helper="Joined this month" tone="good" />
        <StatCard label="Low Attendance" value={metrics.low_attendance_members ?? 0} helper="Needs follow-up" tone="warn" />
        <StatCard label="Income This Month" value={formatCurrency(metrics.donations_this_month ?? 0)} helper="Current month giving" tone="good" />
        <StatCard label="Expenses This Month" value={formatCurrency(metrics.expenses_this_month ?? 0)} helper="Current month spending" tone="warn" />
      </div>

      <div className="mb-6 grid gap-4 xl:grid-cols-4">
        <TrendBars title="Monthly Attendance (Present)" data={attendanceTrend} color="bg-brand-700" />
        <TrendBars title="Monthly Income" data={donationsTrend} color="bg-cyan-700" />
        <TrendBars title="Monthly Expenses" data={expensesTrend} color="bg-red-600" />
        <TrendBars title="Member Growth (Cumulative)" data={membersTrend} color="bg-emerald-600" />
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
