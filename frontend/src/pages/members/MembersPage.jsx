import { useMemo, useState } from 'react';
import DataTable from '../../components/shared/DataTable';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import PageHeader from '../../components/shared/PageHeader';
import { useCreateMember, useMembers } from '../../hooks/useMembers';
import { formatDate } from '../../utils/formatters';

export default function MembersPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [form, setForm] = useState({ first_name: '', last_name: '', phone: '', email: '' });

  const membersQuery = useMembers({ skip: 0, limit: 20, search: search || undefined, status: status || undefined });
  const createMutation = useCreateMember();

  const columns = useMemo(
    () => [
      { key: 'name', label: 'Name', render: (row) => `${row.first_name} ${row.last_name}` },
      { key: 'phone', label: 'Phone' },
      { key: 'email', label: 'Email' },
      { key: 'membership_status', label: 'Status' },
      { key: 'date_joined', label: 'Date Joined', render: (row) => formatDate(row.date_joined) },
      { key: 'low_attendance', label: 'Low Attendance', render: (row) => (row.low_attendance ? 'Yes' : 'No') },
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
      <PageHeader title="Members" subtitle="Manage member profiles and attendance flags." />

      <div className="mb-6 grid gap-4 rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200 md:grid-cols-3">
        <input
          placeholder="Search name, phone, email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2"
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-md border border-slate-300 px-3 py-2">
          <option value="">All status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="visitor">Visitor</option>
          <option value="new_convert">New convert</option>
        </select>
      </div>

      <form onSubmit={onCreateMember} className="mb-6 grid gap-3 rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200 md:grid-cols-5">
        <input
          required
          placeholder="First name"
          value={form.first_name}
          onChange={(e) => setForm((p) => ({ ...p, first_name: e.target.value }))}
          className="rounded-md border border-slate-300 px-3 py-2"
        />
        <input
          required
          placeholder="Last name"
          value={form.last_name}
          onChange={(e) => setForm((p) => ({ ...p, last_name: e.target.value }))}
          className="rounded-md border border-slate-300 px-3 py-2"
        />
        <input
          placeholder="Phone"
          value={form.phone}
          onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
          className="rounded-md border border-slate-300 px-3 py-2"
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
          className="rounded-md border border-slate-300 px-3 py-2"
        />
        <button type="submit" className="rounded-md bg-brand-700 px-4 py-2 font-semibold text-white hover:bg-brand-800">
          {createMutation.isPending ? 'Creating...' : 'Create Member'}
        </button>
      </form>

      {membersQuery.isLoading ? (
        <LoadingSpinner />
      ) : (
        <DataTable columns={columns} rows={membersQuery.data?.data ?? []} emptyLabel="No members found" />
      )}
    </section>
  );
}
