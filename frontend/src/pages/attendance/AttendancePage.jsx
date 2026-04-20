import { CheckSquare, Clock, Search, Users, Zap } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import Badge from '../../components/shared/Badge';
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

const SESSION_TYPES = [
  { value: 'sunday_service', label: 'Sunday Service', defaultTime: '08:00' },
  { value: 'midweek', label: 'Midweek Service', defaultTime: '18:00' },
  { value: 'prayer', label: 'Prayer Meeting', defaultTime: '18:00' },
  { value: 'special', label: 'Special Service', defaultTime: '09:00' },
];

function inferTitle(type) {
  return SESSION_TYPES.find((t) => t.value === type)?.label ?? 'Service';
}

function defaultTime(type) {
  return SESSION_TYPES.find((t) => t.value === type)?.defaultTime ?? '08:00';
}

const STATUS_COLORS = {
  present: { row: 'bg-success-50/60 ring-1 ring-success-100', badge: 'present' },
  absent: { row: 'bg-slate-50', badge: 'absent' },
  excused: { row: 'bg-church-50/40 ring-1 ring-church-100', badge: 'excused' },
  unmarked: { row: 'bg-white', badge: 'default' },
};

export default function AttendancePage() {
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [statusMap, setStatusMap] = useState({});
  const [search, setSearch] = useState('');
  const [quickType, setQuickType] = useState('sunday_service');
  const [quickStartTime, setQuickStartTime] = useState(defaultTime('sunday_service'));
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
      return fullName.includes(keyword) || (m.phone || '').includes(keyword);
    });
  }, [members, search]);

  const localCounts = useMemo(() => {
    const counts = { present: 0, absent: 0, excused: 0, unmarked: 0 };
    members.forEach((member) => {
      const val = statusMap[member.id];
      if (val === 'present') counts.present++;
      else if (val === 'absent') counts.absent++;
      else if (val === 'excused') counts.excused++;
      else counts.unmarked++;
    });
    return counts;
  }, [members, statusMap]);

  const sessionColumns = useMemo(() => [
    { key: 'title', label: 'Session' },
    { key: 'session_date', label: 'Date', render: (row) => formatDate(row.session_date) },
    {
      key: 'session_type',
      label: 'Type',
      render: (row) => <Badge variant="visitor">{row.session_type || '-'}</Badge>,
    },
    {
      key: 'session_start_time',
      label: 'Start Time',
      render: (row) => row.session_start_time ? String(row.session_start_time).slice(0, 5) : '-',
    },
    { key: 'notes', label: 'Notes', render: (row) => row.notes ?? <span className="text-slate-300">—</span> },
  ], []);

  useEffect(() => {
    const records = selectedSessionQuery.data?.data?.records ?? [];
    const map = {};
    records.forEach((record) => { map[record.member_id] = record.status; });
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

  useEffect(() => {
    setQuickStartTime(defaultTime(quickType));
  }, [quickType]);

  async function onQuickStart() {
    const response = await createMutation.mutateAsync({
      title: inferTitle(quickType),
      session_date: todayISO(),
      session_type: quickType,
      session_start_time: quickStartTime || null,
      notes: 'Started from quick attendance flow',
    });
    const created = response.data?.data;
    if (created?.id) {
      setSelectedSessionId(created.id);
      setSaveMessage('Service started. Begin check-in below.');
    }
  }

  function updateStatus(memberId, nextStatus) {
    setStatusMap((prev) => ({ ...prev, [memberId]: nextStatus || undefined }));
    setDirty(true);
    setSaveMessage('Saving…');
  }

  function applyBulk(status) {
    const next = { ...statusMap };
    filteredMembers.forEach((m) => { next[m.id] = status; });
    setStatusMap(next);
    setDirty(true);
    setSaveMessage('Saving…');
  }

  const summary = summaryQuery.data?.data;

  return (
    <section className="space-y-5">
      <PageHeader
        title="Attendance"
        subtitle="Start a service and check in members with one-tap controls. Changes save automatically."
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total Members" value={summary?.total_members ?? '-'} icon={Users} />
        <StatCard label="Present" value={localCounts.present} helper="Live count" tone="good" icon={CheckSquare} />
        <StatCard label="Absent" value={localCounts.absent} helper="Marked absent" tone="warn" />
        <StatCard label="Excused" value={localCounts.excused} />
        <StatCard label="Unmarked" value={localCounts.unmarked} helper="Needs status" tone="warn" />
      </div>

      {/* Quick start */}
      <div className="panel p-5">
        <div className="flex items-center gap-2 mb-4">
          <Zap size={16} className="text-church-700" />
          <p className="text-sm font-bold text-slate-900">Quick Start Service</p>
          <p className="text-xs text-slate-500 ml-1">— Opens a session for today instantly</p>
        </div>
        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <select value={quickType} onChange={(e) => setQuickType(e.target.value)} className="field">
            {SESSION_TYPES.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <div>
            <div className="flex items-center gap-2 field w-fit">
              <Clock size={14} className="text-slate-400" />
              <input type="time" value={quickStartTime} onChange={(e) => setQuickStartTime(e.target.value)} className="border-0 p-0 text-sm outline-none focus:ring-0 bg-transparent" />
            </div>
          </div>
          <button type="button" onClick={onQuickStart} className="btn-primary" disabled={createMutation.isPending}>
            <Zap size={14} />
            {createMutation.isPending ? 'Starting…' : "Start Today's Service"}
          </button>
        </div>
      </div>

      {/* Check-in board */}
      <div className="panel p-5">
        <p className="mb-4 text-sm font-bold text-slate-900">Fast Check-In Board</p>

        {/* Session selector + search */}
        <div className="mb-4 grid gap-3 md:grid-cols-2">
          <select value={selectedSessionId} onChange={(e) => setSelectedSessionId(e.target.value)} className="field">
            <option value="">Select attendance session</option>
            {sessions.map((session) => (
              <option key={session.id} value={session.id}>
                {session.title} — {formatDate(session.session_date)}
                {session.session_start_time ? ` · ${String(session.session_start_time).slice(0, 5)}` : ''}
              </option>
            ))}
          </select>
          <div className="relative">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search member by name or phone"
              className="field pl-9"
            />
          </div>
        </div>

        {/* Bulk action bar */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Mark all visible:</span>
          <button type="button" onClick={() => applyBulk('present')} className="rounded-lg bg-success-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-success-800 transition">
            Present
          </button>
          <button type="button" onClick={() => applyBulk('absent')} className="rounded-lg bg-slate-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700 transition">
            Absent
          </button>
          <button type="button" onClick={() => applyBulk('excused')} className="rounded-lg bg-church-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-church-800 transition">
            Excused
          </button>
          {saveMessage && (
            <span className="ml-2 text-xs text-slate-500">{saveMessage}</span>
          )}
        </div>

        {/* Check-in grid */}
        {!selectedSessionId ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center">
            <CheckSquare size={32} className="mx-auto text-slate-300" strokeWidth={1.5} />
            <p className="mt-3 text-sm font-semibold text-slate-500">Select a session above to begin check-in</p>
            <p className="mt-1 text-xs text-slate-400">Or use Quick Start to open today's service first</p>
          </div>
        ) : membersQuery.isLoading || selectedSessionQuery.isLoading ? (
          <LoadingSpinner label="Loading check-in board…" />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Member</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Mark</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMembers.map((member) => {
                  const statusValue = statusMap[member.id] || 'unmarked';
                  const colorConfig = STATUS_COLORS[statusValue] ?? STATUS_COLORS.unmarked;
                  return (
                    <tr key={member.id} className={`transition-colors ${colorConfig.row}`}>
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold text-slate-900">
                          {member.first_name} {member.last_name}
                        </p>
                        {member.phone && <p className="text-xs text-slate-400">{member.phone}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            type="button"
                            onClick={() => updateStatus(member.id, 'present')}
                            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${statusValue === 'present' ? 'bg-success-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-success-50 hover:text-success-700'}`}
                          >
                            Present
                          </button>
                          <button
                            type="button"
                            onClick={() => updateStatus(member.id, 'absent')}
                            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${statusValue === 'absent' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                          >
                            Absent
                          </button>
                          <button
                            type="button"
                            onClick={() => updateStatus(member.id, 'excused')}
                            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${statusValue === 'excused' ? 'bg-church-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-church-50 hover:text-church-700'}`}
                          >
                            Excused
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={colorConfig.badge}>{statusValue}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sessions history */}
      <div className="space-y-3">
        <p className="label-caps">Recent Sessions</p>
        {sessionsQuery.isLoading ? (
          <LoadingSpinner label="Loading sessions…" />
        ) : (
          <DataTable columns={sessionColumns} rows={sessions} emptyLabel="No sessions found" />
        )}
      </div>
    </section>
  );
}
