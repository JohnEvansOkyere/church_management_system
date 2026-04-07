import LoadingSpinner from '../../components/shared/LoadingSpinner';
import PageHeader from '../../components/shared/PageHeader';
import StatCard from '../../components/shared/StatCard';
import TrendBars from '../../components/shared/TrendBars';
import {
  useAttendanceMonthlyReport,
  useDashboardReport,
  useDonationsMonthlyReport,
  useExpensesMonthlyReport,
  useMembersGrowthReport,
} from '../../hooks/useReports';
import { formatCurrency } from '../../utils/formatters';

function SummaryList({ title, items, formatter = (value) => value, emptyLabel }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <div className="mt-4 space-y-2">
        {items.length === 0 ? (
          <p className="text-sm text-slate-600">{emptyLabel}</p>
        ) : (
          items.map((item) => (
            <div key={item.month || item.name} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
              <span className="font-medium text-slate-700">{item.name || item.month}</span>
              <span className="font-bold text-slate-900">{formatter(item.value)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const dashboardQuery = useDashboardReport();
  const attendanceTrendQuery = useAttendanceMonthlyReport();
  const incomeTrendQuery = useDonationsMonthlyReport();
  const expenseTrendQuery = useExpensesMonthlyReport();
  const membersTrendQuery = useMembersGrowthReport();

  if (
    dashboardQuery.isLoading ||
    attendanceTrendQuery.isLoading ||
    incomeTrendQuery.isLoading ||
    expenseTrendQuery.isLoading ||
    membersTrendQuery.isLoading
  ) {
    return <LoadingSpinner label="Loading reports..." />;
  }

  const metrics = dashboardQuery.data?.data ?? {};
  const attendanceTrend = attendanceTrendQuery.data?.data ?? [];
  const incomeTrend = incomeTrendQuery.data?.data ?? [];
  const expenseTrend = expenseTrendQuery.data?.data ?? [];
  const membersTrend = membersTrendQuery.data?.data ?? [];

  return (
    <section>
      <PageHeader
        title="Reports"
        subtitle="Review church performance across membership, attendance, income, and expenses from one reporting workspace."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Members" value={metrics.total_members ?? 0} helper="Current member records" />
        <StatCard label="Attendance Rate" value={`${metrics.attendance_percentage ?? 0}%`} helper="Latest tracked service" tone={(metrics.attendance_percentage ?? 0) >= 60 ? 'good' : 'warn'} />
        <StatCard label="Income This Month" value={formatCurrency(metrics.donations_this_month ?? 0)} helper="Filtered from reports API" tone="good" />
        <StatCard label="Expenses This Month" value={formatCurrency(metrics.expenses_this_month ?? 0)} helper="Current month spending" tone="warn" />
      </div>

      <div className="mb-6 grid gap-4 xl:grid-cols-2">
        <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 p-6 text-white shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/70">Finance Position</p>
          <p className="mt-3 text-4xl font-extrabold">{formatCurrency(metrics.net_flow_this_month ?? 0)}</p>
          <p className="mt-3 max-w-xl text-sm text-white/80">
            Net flow for the month after subtracting expenses from total income.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Operational Watchlist</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-slate-500">Low Attendance Members</p>
              <p className="mt-1 text-3xl font-extrabold text-slate-900">{metrics.low_attendance_members ?? 0}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">New Members This Month</p>
              <p className="mt-1 text-3xl font-extrabold text-slate-900">{metrics.new_members_this_month ?? 0}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Latest Attendance Count</p>
              <p className="mt-1 text-3xl font-extrabold text-slate-900">{metrics.attendance_last_sunday ?? 0}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Upcoming Events</p>
              <p className="mt-1 text-3xl font-extrabold text-slate-900">{metrics.upcoming_events ?? 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 grid gap-4 xl:grid-cols-2">
        <TrendBars title="Monthly Attendance" data={attendanceTrend} color="bg-brand-700" />
        <TrendBars title="Member Growth" data={membersTrend} color="bg-emerald-600" />
      </div>

      <div className="mb-6 grid gap-4 xl:grid-cols-2">
        <TrendBars title="Monthly Income" data={incomeTrend} color="bg-cyan-700" />
        <TrendBars title="Monthly Expenses" data={expenseTrend} color="bg-red-600" />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <SummaryList
          title="Attendance Trend"
          items={attendanceTrend}
          formatter={(value) => `${value} present`}
          emptyLabel="No attendance trend data yet."
        />
        <SummaryList
          title="Income Trend"
          items={incomeTrend}
          formatter={(value) => formatCurrency(value)}
          emptyLabel="No income trend data yet."
        />
        <SummaryList
          title="Expense Trend"
          items={expenseTrend}
          formatter={(value) => formatCurrency(value)}
          emptyLabel="No expense trend data yet."
        />
      </div>
    </section>
  );
}
