import { useMemo, useState } from 'react';
import DataTable from '../../components/shared/DataTable';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import PageHeader from '../../components/shared/PageHeader';
import StatCard from '../../components/shared/StatCard';
import { useCreateMember, useMembers } from '../../hooks/useMembers';
import { formatDate } from '../../utils/formatters';

export default function MembersPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [form, setForm] = useState({ first_name: '', last_name: '', phone: '', email: '' });

  const membersQuery = useMembers({ skip: 0, limit: 20, search: search || undefined, status: status || undefined });
  const createMutation = useCreateMember();

  const rows = membersQuery.data?.data ?? [];
  const total = membersQuery.data?.total ?? 0;
  const activeCount = rows.filter((row) => row.membership_status === 'active').length;
  const lowAttendanceCount = rows.filter((row) => row.low_attendance).length;

  const columns = useMemo(
    () => [
      { key: 'name', label: 'Member', render: (row) => `${row.first_name} ${row.last_name}` },
      { key: 'phone', label: 'Phone' },
      { key: 'email', label: 'Email' },
      {
        key: 'membership_status',
        label: 'Status',
        render: (row) => (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold uppercase text-slate-700">{row.membership_status || 'unknown'}</span>
        ),
      },
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
    []
  );

  async function onCreateMember(event) {
    event.preventDefault();
    await createMutation.mutateAsync(form);
    setForm({ first_name: '', last_name: '', phone: '', email: '' });
  }

  return (
    <section>
      <PageHeader title="Members" subtitle="Run intake, maintain profiles, and track attendance risk signals." />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Visible Members" value={total} helper="Current filtered list" />
        <StatCard label="Active" value={activeCount} helper="Membership status active" tone="good" />
        <StatCard label="Pastoral Follow-up" value={lowAttendanceCount} helper="Low attendance members" tone="warn" />
        <StatCard label="Search Scope" value={search ? 'Filtered' : 'All'} helper="Name, phone, email" />
      </div>

      <div className="panel mb-6 p-4">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Filter Members</p>
        <div className="grid gap-3 md:grid-cols-3">
          <input
            placeholder="Search by name, phone, email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="field"
          />
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="field">
            <option value="">All status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="visitor">Visitor</option>
            <option value="new_convert">New convert</option>
          </select>
          <button type="button" onClick={() => { setSearch(''); setStatus(''); }} className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Clear Filters
          </button>
        </div>
      </div>

      <form onSubmit={onCreateMember} className="panel mb-6 p-4">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Quick Add Member</p>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <input
            required
            placeholder="First name"
            value={form.first_name}
            onChange={(e) => setForm((p) => ({ ...p, first_name: e.target.value }))}
            className="field"
          />
          <input
            required
            placeholder="Last name"
            value={form.last_name}
            onChange={(e) => setForm((p) => ({ ...p, last_name: e.target.value }))}
            className="field"
          />
          <input
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
            className="field"
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            className="field"
          />
          <button type="submit" className="btn-primary">
            {createMutation.isPending ? 'Creating...' : 'Create Member'}
          </button>
        </div>
      </form>

      {membersQuery.isLoading ? (
        <LoadingSpinner label="Loading members..." />
      ) : (
        <DataTable columns={columns} rows={rows} emptyLabel="No members found" />
      )}
    </section>
  );
}
