import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import DataTable from '../../components/shared/DataTable';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import PageHeader from '../../components/shared/PageHeader';
import StatCard from '../../components/shared/StatCard';
import { useMembers, useUpdateMember } from '../../hooks/useMembers';
import { memberService } from '../../services/memberService';
import { useAuthStore } from '../../store/authStore';
import { MEMBERSHIP_STATUS } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';
import { resolvePhotoUrl } from '../../utils/media';

const PAGE_SIZE = 20;

export default function MembersPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState('');
  const { user } = useAuthStore();

  const skip = (page - 1) * PAGE_SIZE;
  const membersQuery = useMembers({ skip, limit: PAGE_SIZE, search: search || undefined, status: status || undefined });
  const updateMutation = useUpdateMember();

  const rows = membersQuery.data?.data ?? [];
  const total = membersQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const activeCount = rows.filter((row) => row.membership_status === 'active').length;
  const lowAttendanceCount = rows.filter((row) => row.low_attendance).length;

  const canEditStatus = ['superadmin', 'secretary'].includes(user?.role);

  async function onStatusChange(memberId, nextStatus) {
    setMessage('');
    await updateMutation.mutateAsync({
      id: memberId,
      payload: { membership_status: nextStatus },
    });
    setMessage('Member status updated successfully.');
  }

  const columns = useMemo(
    () => [
      {
        key: 'name',
        label: 'Member',
        render: (row) => (
          <div className="flex items-center gap-3">
            {row.photo_url ? (
              <img
                src={resolvePhotoUrl(row.photo_url)}
                alt={`${row.first_name} ${row.last_name}`}
                className="h-10 w-10 rounded-full object-cover ring-1 ring-slate-200"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-800">
                {(row.first_name?.[0] || '')}
                {(row.last_name?.[0] || '')}
              </div>
            )}
            <Link to={`/members/${row.id}`} className="font-semibold text-brand-700 hover:text-brand-800">
              {row.first_name} {row.last_name}
            </Link>
          </div>
        ),
      },
      { key: 'phone', label: 'Phone' },
      { key: 'email', label: 'Email' },
      {
        key: 'membership_status',
        label: 'Status',
        render: (row) => (
          canEditStatus ? (
            <select
              value={row.membership_status || 'active'}
              onChange={(e) => onStatusChange(row.id, e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-semibold uppercase text-slate-700"
            >
              {MEMBERSHIP_STATUS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          ) : (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold uppercase text-slate-700">
              {row.membership_status || 'unknown'}
            </span>
          )
        ),
      },
      { key: 'date_of_birth', label: 'Date of Birth', render: (row) => formatDate(row.date_of_birth) },
      { key: 'date_joined', label: 'Date Joined', render: (row) => formatDate(row.date_joined) },
      {
        key: 'low_attendance',
        label: 'Risk',
        render: (row) =>
          row.low_attendance ? (
            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold uppercase text-amber-700">Follow Up</span>
          ) : (
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold uppercase text-emerald-700">Stable</span>
          ),
      },
    ],
    [canEditStatus]
  );

  async function onExport() {
    setMessage('');
    const response = await memberService.exportCsv();
    const blob = new Blob([response.data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `members_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.URL.revokeObjectURL(url);
    setMessage('CSV export downloaded.');
  }

  return (
    <section>
      <PageHeader
        title="Members"
        subtitle="Browse and manage member records."
        action={
          <div className="flex gap-2">
            <Link to="/members/register" className="btn-primary">Register Member</Link>
            <button type="button" onClick={onExport} className="btn-primary">Export CSV</button>
          </div>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Visible Members" value={total} helper="Current filtered list" />
        <StatCard label="Active" value={activeCount} helper="Membership status active" tone="good" />
        <StatCard label="Pastoral Follow-up" value={lowAttendanceCount} helper="Low attendance members" tone="warn" />
        <StatCard label="Page" value={`${page}/${totalPages}`} helper={`${rows.length} records shown`} />
      </div>

      <div className="panel mb-6 p-4">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Filter Members</p>
        <div className="grid gap-3 md:grid-cols-3">
          <input
            placeholder="Search by name, phone, email"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="field"
          />
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="field"
          >
            <option value="">All status</option>
            {MEMBERSHIP_STATUS.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setStatus('');
              setPage(1);
            }}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {message ? <p className="mb-3 text-sm text-emerald-700">{message}</p> : null}

      {membersQuery.isLoading ? (
        <LoadingSpinner label="Loading members..." />
      ) : (
        <>
          <DataTable columns={columns} rows={rows} emptyLabel="No members found" />
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-slate-600">Showing {rows.length} of {total} members</p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
