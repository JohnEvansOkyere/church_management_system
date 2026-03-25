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
      { key: 'title', label: 'Title' },
      { key: 'session_date', label: 'Date', render: (row) => formatDate(row.session_date) },
      { key: 'session_type', label: 'Type' },
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
      <PageHeader title="Attendance" subtitle="Create sessions and monitor attendance statistics." />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total Members" value={summary?.total_members ?? '-'} />
        <StatCard label="Sessions" value={summary?.total_sessions ?? '-'} />
        <StatCard label="Present" value={summary?.present_count ?? '-'} />
        <StatCard label="Absent" value={summary?.absent_count ?? '-'} />
        <StatCard label="Low Attendance" value={summary?.low_attendance_members ?? '-'} />
      </div>

      <form onSubmit={onCreateSession} className="mb-6 grid gap-3 rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200 md:grid-cols-5">
        <input
          required
          placeholder="Session title"
          value={form.title}
          onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
          className="rounded-md border border-slate-300 px-3 py-2"
        />
        <input
          required
          type="date"
          value={form.session_date}
          onChange={(e) => setForm((p) => ({ ...p, session_date: e.target.value }))}
          className="rounded-md border border-slate-300 px-3 py-2"
        />
        <select
          value={form.session_type}
          onChange={(e) => setForm((p) => ({ ...p, session_type: e.target.value }))}
          className="rounded-md border border-slate-300 px-3 py-2"
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
          className="rounded-md border border-slate-300 px-3 py-2"
        />
        <button type="submit" className="rounded-md bg-brand-700 px-4 py-2 font-semibold text-white hover:bg-brand-800">
          {createMutation.isPending ? 'Creating...' : 'Create Session'}
        </button>
      </form>

      {sessionsQuery.isLoading ? (
        <LoadingSpinner />
      ) : (
        <DataTable columns={columns} rows={sessionsQuery.data?.data ?? []} emptyLabel="No sessions found" />
      )}
    </section>
  );
}
