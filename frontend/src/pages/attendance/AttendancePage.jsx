import { useEffect, useMemo, useState } from 'react';
import DataTable from '../../components/shared/DataTable';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import PageHeader from '../../components/shared/PageHeader';
import StatCard from '../../components/shared/StatCard';
import {
  useAttendanceSession,
  useAttendanceSessions,
  useAttendanceSummary,
  useCreateAttendanceSession,
  useMarkAttendance,
} from '../../hooks/useAttendance';
import { useMembers } from '../../hooks/useMembers';
import { formatDate } from '../../utils/formatters';

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function defaultStartTime(type) {
  if (type === 'midweek') return '18:00';
  if (type === 'prayer') return '18:00';
  if (type === 'special') return '09:00';
  return '08:00';
}

function inferDefaultTitle(type) {
  if (type === 'midweek') return 'Midweek Service';
  if (type === 'prayer') return 'Prayer Meeting';
  if (type === 'special') return 'Special Service';
  return 'Sunday Service';
}

export default function AttendancePage() {
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [statusMap, setStatusMap] = useState({});
  const [search, setSearch] = useState('');
  const [quickType, setQuickType] = useState('sunday_service');
  const [quickStartTime, setQuickStartTime] = useState(defaultStartTime('sunday_service'));
  const [dirty, setDirty] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const sessionsQuery = useAttendanceSessions({ skip: 0, limit: 20 });
  const summaryQuery = useAttendanceSummary();
  const membersQuery = useMembers({ skip: 0, limit: 100 });
  const selectedSessionQuery = useAttendanceSession(selectedSessionId || null);
  const createMutation = useCreateAttendanceSession();
  const markMutation = useMarkAttendance(selectedSessionId);

  const sessions = sessionsQuery.data?.data ?? [];
  const members = membersQuery.data?.data ?? [];

  const filteredMembers = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return members;
    return members.filter((m) => {
      const fullName = `${m.first_name || ''} ${m.last_name || ''}`.toLowerCase();
      return fullName.includes(keyword) || (m.phone || '').toLowerCase().includes(keyword);
    });
  }, [members, search]);

  const localCounts = useMemo(() => {
    const counts = { present: 0, absent: 0, excused: 0, unmarked: 0 };
    members.forEach((member) => {
      const value = statusMap[member.id];
      if (value === 'present') counts.present += 1;
      else if (value === 'absent') counts.absent += 1;
      else if (value === 'excused') counts.excused += 1;
      else counts.unmarked += 1;
    });
    return counts;
  }, [members, statusMap]);

  const columns = useMemo(
    () => [
      { key: 'title', label: 'Session' },
      { key: 'session_date', label: 'Date', render: (row) => formatDate(row.session_date) },
      {
        key: 'session_type',
        label: 'Type',
        render: (row) => (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold uppercase text-slate-700">
            {row.session_type || '-'}
          </span>
        ),
      },
      {
        key: 'session_start_time',
        label: 'Start Time',
        render: (row) => row.session_start_time ? String(row.session_start_time).slice(0, 5) : '-',
      },
      { key: 'notes', label: 'Notes' },
    ],
    []
  );

  useEffect(() => {
    const records = selectedSessionQuery.data?.data?.records ?? [];
    const map = {};
    records.forEach((record) => {
      map[record.member_id] = record.status;
    });
    setStatusMap(map);
    setDirty(false);
  }, [selectedSessionQuery.data?.data?.id, selectedSessionQuery.data?.data?.records]);

  useEffect(() => {
    if (!selectedSessionId || !dirty) return;

    const timer = setTimeout(async () => {
      const records = Object.entries(statusMap)
        .filter(([, status]) => Boolean(status))
        .map(([member_id, status]) => ({ member_id, status }));

      if (!records.length) return;

      try {
        await markMutation.mutateAsync({ records });
        setDirty(false);
        setSaveMessage(`Saved at ${new Date().toLocaleTimeString()}`);
      } catch {
        setSaveMessage('Auto-save failed. Try again.');
      }
    }, 900);

    return () => clearTimeout(timer);
  }, [dirty, selectedSessionId, statusMap]);

  async function onQuickStart() {
    const payload = {
      title: inferDefaultTitle(quickType),
      session_date: todayISO(),
      session_type: quickType,
      session_start_time: quickStartTime || null,
      notes: 'Started from quick attendance flow',
    };

    const response = await createMutation.mutateAsync(payload);
    const created = response.data?.data;
    if (created?.id) {
      setSelectedSessionId(created.id);
      setSaveMessage('Service started. You can begin check-in now.');
    }
  }

  function updateMemberStatus(memberId, nextStatus) {
    setStatusMap((prev) => ({ ...prev, [memberId]: nextStatus || undefined }));
    setDirty(true);
    setSaveMessage('Saving changes...');
  }

  function applyBulk(status) {
    const next = { ...statusMap };
    filteredMembers.forEach((member) => {
      next[member.id] = status;
    });
    setStatusMap(next);
    setDirty(true);
    setSaveMessage('Saving changes...');
  }

  const summary = summaryQuery.data?.data;

  useEffect(() => {
    setQuickStartTime(defaultStartTime(quickType));
  }, [quickType]);

  return (
    <section>
      <PageHeader title="Attendance" subtitle="Start a service quickly and check in members with one-tap controls." />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total Members" value={summary?.total_members ?? '-'} helper="Current membership size" />
        <StatCard label="Present" value={localCounts.present} helper="Live check-in count" tone="good" />
        <StatCard label="Absent" value={localCounts.absent} helper="Marked absent" tone="warn" />
        <StatCard label="Excused" value={localCounts.excused} helper="Marked excused" />
        <StatCard label="Unmarked" value={localCounts.unmarked} helper="Needs status" tone="warn" />
      </div>

      <div className="panel mb-6 p-4">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Quick Start Service</p>
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <div className="grid gap-3 md:grid-cols-2">
            <select value={quickType} onChange={(e) => setQuickType(e.target.value)} className="field">
              <option value="sunday_service">Sunday Service</option>
              <option value="midweek">Midweek</option>
              <option value="prayer">Prayer</option>
              <option value="special">Special</option>
            </select>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Service Start Time</label>
              <input type="time" value={quickStartTime} onChange={(e) => setQuickStartTime(e.target.value)} className="field" />
            </div>
          </div>
          <button type="button" onClick={onQuickStart} className="btn-primary">
            {createMutation.isPending ? 'Starting...' : 'Start Today\'s Service'}
          </button>
        </div>
      </div>

      <div className="panel mb-6 p-4">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Fast Check-in Board</p>

        <div className="mb-4 grid gap-3 md:grid-cols-[2fr_1fr]">
          <select value={selectedSessionId} onChange={(e) => setSelectedSessionId(e.target.value)} className="field">
            <option value="">Select attendance session</option>
            {sessions.map((session) => (
              <option key={session.id} value={session.id}>
                {session.title} - {formatDate(session.session_date)}{session.session_start_time ? ` · ${String(session.session_start_time).slice(0, 5)}` : ''}
              </option>
            ))}
          </select>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search member by name or phone"
            className="field"
          />
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <button type="button" onClick={() => applyBulk('present')} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700">
            Mark Visible Present
          </button>
          <button type="button" onClick={() => applyBulk('absent')} className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700">
            Mark Visible Absent
          </button>
          <button type="button" onClick={() => applyBulk('excused')} className="rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-700">
            Mark Visible Excused
          </button>
          {saveMessage ? <p className="ml-2 self-center text-xs text-slate-600">{saveMessage}</p> : null}
        </div>

        {!selectedSessionId ? (
          <p className="text-sm text-slate-600">Select a session to start marking attendance.</p>
        ) : membersQuery.isLoading || selectedSessionQuery.isLoading ? (
          <LoadingSpinner label="Loading member check-in board..." />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full bg-white text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-slate-600">Member</th>
                  <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-slate-600">Quick Actions</th>
                  <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-slate-600">Current</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMembers.map((member) => {
                  const statusValue = statusMap[member.id] || 'unmarked';
                  return (
                    <tr key={member.id}>
                      <td className="px-3 py-2 text-slate-700">
                        {member.first_name} {member.last_name}
                        <span className="ml-2 text-xs text-slate-500">{member.phone || ''}</span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => updateMemberStatus(member.id, 'present')}
                            className="rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
                          >
                            Present
                          </button>
                          <button
                            type="button"
                            onClick={() => updateMemberStatus(member.id, 'absent')}
                            className="rounded-md bg-red-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-red-700"
                          >
                            Absent
                          </button>
                          <button
                            type="button"
                            onClick={() => updateMemberStatus(member.id, 'excused')}
                            className="rounded-md bg-amber-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-amber-700"
                          >
                            Excused
                          </button>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold uppercase text-slate-700">
                          {statusValue}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {sessionsQuery.isLoading ? (
        <LoadingSpinner label="Loading sessions..." />
      ) : (
        <DataTable columns={columns} rows={sessions} emptyLabel="No sessions found" />
      )}
    </section>
  );
}
