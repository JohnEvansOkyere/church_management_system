import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import DataTable from '../../components/shared/DataTable';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import PageHeader from '../../components/shared/PageHeader';
import StatCard from '../../components/shared/StatCard';
import { useCreateMember, useMembers } from '../../hooks/useMembers';
import { memberService } from '../../services/memberService';
import { GENDERS, MARITAL_STATUS, MEMBERSHIP_STATUS } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';
import { resolvePhotoUrl } from '../../utils/media';

const PAGE_SIZE = 20;

const initialForm = {
  first_name: '',
  last_name: '',
  other_name: '',
  phone: '',
  email: '',
  gender: '',
  date_of_birth: '',
  address: '',
  occupation: '',
  marital_status: '',
  membership_status: 'active',
  date_joined: '',
  baptism_date: '',
  membership_class_completed: false,
  is_family_head: false,
  family_name: '',
  family_id: '',
};

export default function MembersPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState('');

  const skip = (page - 1) * PAGE_SIZE;
  const membersQuery = useMembers({ skip, limit: PAGE_SIZE, search: search || undefined, status: status || undefined });
  const createMutation = useCreateMember();

  const rows = membersQuery.data?.data ?? [];
  const total = membersQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const activeCount = rows.filter((row) => row.membership_status === 'active').length;
  const lowAttendanceCount = rows.filter((row) => row.low_attendance).length;

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
    setMessage('');

    const payload = {
      ...form,
      other_name: form.other_name || null,
      phone: form.phone || null,
      email: form.email || null,
      gender: form.gender || null,
      date_of_birth: form.date_of_birth || null,
      address: form.address || null,
      occupation: form.occupation || null,
      marital_status: form.marital_status || null,
      date_joined: form.date_joined || null,
      baptism_date: form.baptism_date || null,
      family_name: form.family_name || null,
      family_id: form.family_id || null,
    };

    await createMutation.mutateAsync(payload);
    setForm(initialForm);
    setMessage('Member created successfully.');
  }

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
        subtitle="Run intake, maintain profiles, and track attendance risk signals."
        action={
          <button type="button" onClick={onExport} className="btn-primary">
            Export CSV
          </button>
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

      <form onSubmit={onCreateMember} className="panel mb-6 p-4">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Register Member</p>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <input required placeholder="First name" value={form.first_name} onChange={(e) => setForm((p) => ({ ...p, first_name: e.target.value }))} className="field" />
          <input required placeholder="Last name" value={form.last_name} onChange={(e) => setForm((p) => ({ ...p, last_name: e.target.value }))} className="field" />
          <input placeholder="Other name" value={form.other_name} onChange={(e) => setForm((p) => ({ ...p, other_name: e.target.value }))} className="field" />
          <input placeholder="Phone" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} className="field" />
          <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className="field" />

          <select value={form.gender} onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value }))} className="field">
            <option value="">Gender</option>
            {GENDERS.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>

          <input type="date" value={form.date_of_birth} onChange={(e) => setForm((p) => ({ ...p, date_of_birth: e.target.value }))} className="field" />
          <input placeholder="Occupation" value={form.occupation} onChange={(e) => setForm((p) => ({ ...p, occupation: e.target.value }))} className="field" />

          <select value={form.marital_status} onChange={(e) => setForm((p) => ({ ...p, marital_status: e.target.value }))} className="field">
            <option value="">Marital status</option>
            {MARITAL_STATUS.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>

          <select value={form.membership_status} onChange={(e) => setForm((p) => ({ ...p, membership_status: e.target.value }))} className="field">
            {MEMBERSHIP_STATUS.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>

          <input type="date" value={form.date_joined} onChange={(e) => setForm((p) => ({ ...p, date_joined: e.target.value }))} className="field" />
          <input type="date" value={form.baptism_date} onChange={(e) => setForm((p) => ({ ...p, baptism_date: e.target.value }))} className="field" />

          <input placeholder="Family name (for new family head)" value={form.family_name} onChange={(e) => setForm((p) => ({ ...p, family_name: e.target.value }))} className="field" />
          <input placeholder="Family ID (existing family UUID)" value={form.family_id} onChange={(e) => setForm((p) => ({ ...p, family_id: e.target.value }))} className="field" />

          <input placeholder="Address" value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} className="field md:col-span-2 xl:col-span-4" />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.membership_class_completed}
              onChange={(e) => setForm((p) => ({ ...p, membership_class_completed: e.target.checked }))}
            />
            Membership class completed
          </label>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.is_family_head}
              onChange={(e) => setForm((p) => ({ ...p, is_family_head: e.target.checked }))}
            />
            Is family head
          </label>

          <button type="submit" className="btn-primary">
            {createMutation.isPending ? 'Creating...' : 'Create Member'}
          </button>
        </div>

        {message ? <p className="mt-3 text-sm text-emerald-700">{message}</p> : null}
      </form>

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
