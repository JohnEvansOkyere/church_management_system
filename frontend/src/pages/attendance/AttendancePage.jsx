import { useEffect, useMemo, useState } from 'react';
import DataTable from '../../components/shared/DataTable';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import PageHeader from '../../components/shared/PageHeader';
import StatCard from '../../components/shared/StatCard';
import { useAttendanceSession, useAttendanceSessions, useAttendanceSummary, useCreateAttendanceSession, useMarkAttendance } from '../../hooks/useAttendance';
import { useMembers } from '../../hooks/useMembers';
import { formatDate } from '../../utils/formatters';

export default function AttendancePage() {
  const [form, setForm] = useState({ title: '', session_date: '', session_type: 'sunday_service', notes: '' });
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [statusMap, setStatusMap] = useState({});

  const sessionsQuery = useAttendanceSessions({ skip: 0, limit: 20 });
  const summaryQuery = useAttendanceSummary();
  const membersQuery = useMembers({ skip: 0, limit: 50 });
  const selectedSessionQuery = useAttendanceSession(selectedSessionId || null);
  const createMutation = useCreateAttendanceSession();
  const markMutation = useMarkAttendance(selectedSessionId);

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

  useEffect(() => {
    const records = selectedSessionQuery.data?.data?.records ?? [];
    if (!records.length) return;

    const map = {};
    records.forEach((record) => {
      map[record.member_id] = record.status;
    });
    setStatusMap((prev) => ({ ...prev, ...map }));
  }, [selectedSessionQuery.data]);

  async function onCreateSession(event) {
    event.preventDefault();
    await createMutation.mutateAsync(form);
    setForm({ title: '', session_date: '', session_type: 'sunday_service', notes: '' });
  }

  async function onMarkAttendance(event) {
    event.preventDefault();

    const records = Object.entries(statusMap)
      .filter(([, status]) => Boolean(status))
      .map(([member_id, status]) => ({ member_id, status }));

    if (!selectedSessionId || records.length === 0) return;
    await markMutation.mutateAsync({ records });
  }

  const summary = summaryQuery.data?.data;
  const sessions = sessionsQuery.data?.data ?? [];
  const members = membersQuery.data?.data ?? [];

  return (
    <section>
      <PageHeader title="Attendance" subtitle="Create attendance sessions and mark member attendance in bulk." />

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

      <form onSubmit={onMarkAttendance} className="panel mb-6 p-4">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Mark Attendance</p>

        <div className="mb-4 grid gap-3 md:grid-cols-[2fr_1fr]">
          <select value={selectedSessionId} onChange={(e) => setSelectedSessionId(e.target.value)} className="field">
            <option value="">Select attendance session</option>
            {sessions.map((session) => (
              <option key={session.id} value={session.id}>
                {session.title} - {formatDate(session.session_date)}
              </option>
            ))}
          </select>
          <button type="submit" disabled={!selectedSessionId || markMutation.isPending} className="btn-primary">
            {markMutation.isPending ? 'Saving...' : 'Save Attendance'}
          </button>
        </div>

        {!selectedSessionId ? (
          <p className="text-sm text-slate-600">Choose a session to mark attendance for members.</p>
        ) : membersQuery.isLoading || selectedSessionQuery.isLoading ? (
          <LoadingSpinner label="Loading members and session records..." />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full bg-white text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-slate-600">Member</th>
                  <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-slate-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {members.map((member) => (
                  <tr key={member.id}>
                    <td className="px-3 py-2 text-slate-700">{member.first_name} {member.last_name}</td>
                    <td className="px-3 py-2">
                      <select
                        value={statusMap[member.id] || ''}
                        onChange={(e) =>
                          setStatusMap((prev) => ({
                            ...prev,
                            [member.id]: e.target.value,
                          }))
                        }
                        className="field max-w-[180px]"
                      >
                        <option value="">Not set</option>
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                        <option value="excused">Excused</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </form>

      {sessionsQuery.isLoading ? (
        <LoadingSpinner label="Loading sessions..." />
      ) : (
        <DataTable columns={columns} rows={sessions} emptyLabel="No sessions found" />
      )}
    </section>
  );
}
