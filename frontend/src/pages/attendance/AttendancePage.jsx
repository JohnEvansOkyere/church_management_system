import { useMemo, useState } from 'react';
import DataTable from '../../components/shared/DataTable';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import PageHeader from '../../components/shared/PageHeader';
import StatCard from '../../components/shared/StatCard';
import { useAttendanceSessions, useAttendanceSummary, useCreateAttendanceSession } from '../../hooks/useAttendance';
import { formatDate } from '../../utils/formatters';

export default function AttendancePage() {
  const [form, setForm] = useState({ title: '', session_date: '', session_type: 'sunday_service', notes: '' });

  const sessionsQuery = useAttendanceSessions({ skip: 0, limit: 20 });
  const summaryQuery = useAttendanceSummary();
  const createMutation = useCreateAttendanceSession();

  const columns = useMemo(
    () => [
      { key: 'title', label: 'Session' },
      { key: 'session_date', label: 'Date', render: (row) => formatDate(row.session_date) },
      {
        key: 'session_type',
        label: 'Type',
        render: (row) => <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold uppercase text-slate-700">{row.session_type || '-'}</span>,
      },
      { key: 'notes', label: 'Notes' },
    ],
    []
  );

  async function onCreateSession(event) {
    event.preventDefault();
    await createMutation.mutateAsync(form);
    setForm({ title: '', session_date: '', session_type: 'sunday_service', notes: '' });
  }

  const summary = summaryQuery.data?.data;

  return (
    <section>
      <PageHeader title="Attendance" subtitle="Create attendance sessions and monitor service participation trends." />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total Members" value={summary?.total_members ?? '-'} helper="Current membership size" />
        <StatCard label="Total Sessions" value={summary?.total_sessions ?? '-'} helper="Tracked services" />
        <StatCard label="Present" value={summary?.present_count ?? '-'} helper="Recorded as present" tone="good" />
        <StatCard label="Absent" value={summary?.absent_count ?? '-'} helper="Needs review" tone="warn" />
        <StatCard label="Low Attendance" value={summary?.low_attendance_members ?? '-'} helper="Pastoral follow-up" tone="warn" />
      </div>

      <form onSubmit={onCreateSession} className="panel mb-6 p-4">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Create Session</p>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <input
            required
            placeholder="Session title"
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            className="field"
          />
          <input
            required
            type="date"
            value={form.session_date}
            onChange={(e) => setForm((p) => ({ ...p, session_date: e.target.value }))}
            className="field"
          />
          <select
            value={form.session_type}
            onChange={(e) => setForm((p) => ({ ...p, session_type: e.target.value }))}
            className="field"
          >
            <option value="sunday_service">Sunday Service</option>
            <option value="midweek">Midweek</option>
            <option value="prayer">Prayer</option>
            <option value="special">Special</option>
          </select>
          <input
            placeholder="Notes"
            value={form.notes}
            onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
            className="field"
          />
          <button type="submit" className="btn-primary">
            {createMutation.isPending ? 'Creating...' : 'Create Session'}
          </button>
        </div>
      </form>

      {sessionsQuery.isLoading ? (
        <LoadingSpinner label="Loading sessions..." />
      ) : (
        <DataTable columns={columns} rows={sessionsQuery.data?.data ?? []} emptyLabel="No sessions found" />
      )}
    </section>
  );
}
