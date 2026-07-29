import { BarChart3, Download, TrendingDown, TrendingUp, Users } from 'lucide-react';
import { useState } from 'react';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import IncomeExpenseLineChart from '../../components/shared/IncomeExpenseLineChart';
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
import { reportsService } from '../../services/reportsService';

function SummaryList({ title, items, formatter = (v) => v, emptyLabel }) {
  return (
    <div className="panel p-5">
      <p className="label-caps mb-3">{title}</p>
      {items.length === 0 ? (
        <p className="text-sm text-slate-500">{emptyLabel}</p>
      ) : (
        <div className="space-y-1.5">
          {items.map((item) => (
            <div key={item.month || item.name} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm">
              <span className="text-slate-600">{item.name || item.month}</span>
              <span className="font-bold text-slate-900">{formatter(item.value)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ReportsPage() {
  const dashboardQuery = useDashboardReport();
  const attendanceTrendQuery = useAttendanceMonthlyReport();
  const incomeTrendQuery = useDonationsMonthlyReport();
  const expenseTrendQuery = useExpensesMonthlyReport();
  const membersTrendQuery = useMembersGrowthReport();
  const [exporting, setExporting] = useState('');

  const isLoading =
    dashboardQuery.isLoading ||
    attendanceTrendQuery.isLoading ||
    incomeTrendQuery.isLoading ||
    expenseTrendQuery.isLoading ||
    membersTrendQuery.isLoading;

  if (isLoading) {
    return <LoadingSpinner label="Loading reports…" />;
  }

  const metrics = dashboardQuery.data?.data ?? {};
  const attendanceTrend = attendanceTrendQuery.data?.data ?? [];
  const incomeTrend = incomeTrendQuery.data?.data ?? [];
  const expenseTrend = expenseTrendQuery.data?.data ?? [];
  const membersTrend = membersTrendQuery.data?.data ?? [];

  const netFlow = metrics.net_flow_this_month ?? 0;

  async function downloadReport(type) {
    setExporting(type);
    try {
      const response = await (type === 'members' ? reportsService.exportMembers() : reportsService.exportDonations());
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = type === 'members' ? 'members-report.csv' : 'finance-report.csv';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
    } finally {
      setExporting('');
    }
  }

  return (
    <section className="space-y-5">
      <PageHeader
        title="Reports & Analytics"
        subtitle="Review church performance across membership, attendance, income, and expenses."
        action={
          <div className="flex gap-2">
            <button type="button" className="btn-outline" onClick={() => downloadReport('members')} disabled={Boolean(exporting)}>
              <Download size={14} />
              {exporting === 'members' ? 'Exporting…' : 'Members CSV'}
            </button>
            <button type="button" className="btn-outline" onClick={() => downloadReport('finance')} disabled={Boolean(exporting)}>
              <Download size={14} />
              {exporting === 'finance' ? 'Exporting…' : 'Finance CSV'}
            </button>
          </div>
        }
      />

      {/* Key metrics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Members" value={metrics.total_members ?? 0} helper="All registered records" icon={Users} />
        <StatCard label="Attendance Rate" value={`${metrics.attendance_percentage ?? 0}%`} helper="Latest tracked service" tone={(metrics.attendance_percentage ?? 0) >= 60 ? 'good' : 'warn'} icon={BarChart3} />
        <StatCard label="Income This Month" value={formatCurrency(metrics.donations_this_month ?? 0)} tone="good" icon={TrendingUp} />
        <StatCard label="Expenses This Month" value={formatCurrency(metrics.expenses_this_month ?? 0)} tone="warn" icon={TrendingDown} />
      </div>

      {/* Finance position + watchlist */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className={`panel p-6 ${netFlow >= 0 ? 'bg-brand-900' : 'bg-accent-800'}`}>
          <p className="label-caps text-white/60">Finance Position</p>
          <p className="mt-3 text-5xl font-extrabold text-white">{formatCurrency(netFlow)}</p>
          <p className="mt-3 text-sm text-white/70">
            Net monthly flow — income minus expenses for the current month.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-white/10 p-3">
              <p className="text-xs text-white/60">Income MTD</p>
              <p className="mt-1 text-lg font-bold text-white">{formatCurrency(metrics.donations_this_month ?? 0)}</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-3">
              <p className="text-xs text-white/60">Expenses MTD</p>
              <p className="mt-1 text-lg font-bold text-white">{formatCurrency(metrics.expenses_this_month ?? 0)}</p>
            </div>
          </div>
        </div>

        <div className="panel p-6">
          <p className="label-caps mb-4">Operational Watchlist</p>
          <div className="grid grid-cols-2 gap-5">
            {[
              { label: 'Low Attendance Members', value: metrics.low_attendance_members ?? 0 },
              { label: 'New Members This Month', value: metrics.new_members_this_month ?? 0 },
              { label: 'Last Service Attendance', value: metrics.attendance_last_sunday ?? 0 },
              { label: 'Upcoming Events', value: metrics.upcoming_events ?? 0 },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-slate-500">{label}</p>
                <p className="mt-1 text-3xl font-extrabold text-slate-900">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <TrendBars title="Monthly Attendance" data={attendanceTrend} color="bg-brand-700" />
        <TrendBars title="Member Growth" data={membersTrend} color="bg-success-700" />
      </div>
      <IncomeExpenseLineChart incomeData={incomeTrend} expenseData={expenseTrend} />

      {/* Trend tables */}
      <div className="grid gap-4 xl:grid-cols-3">
        <SummaryList title="Attendance Trend" items={attendanceTrend} formatter={(v) => `${v} present`} emptyLabel="No attendance trend data yet." />
        <SummaryList title="Income Trend" items={incomeTrend} formatter={(v) => formatCurrency(v)} emptyLabel="No income trend data yet." />
        <SummaryList title="Expense Trend" items={expenseTrend} formatter={(v) => formatCurrency(v)} emptyLabel="No expense trend data yet." />
      </div>
    </section>
  );
}
