import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import DataTable from '../../components/shared/DataTable';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import PageHeader from '../../components/shared/PageHeader';
import StatCard from '../../components/shared/StatCard';
import { useMemberAttendanceHistory } from '../../hooks/useAttendance';
import { useDeleteMember, useMember, useMemberActivity, useUpdateMember, useUploadMemberPhoto } from '../../hooks/useMembers';
import { GENDERS, MARITAL_STATUS, MEMBERSHIP_STATUS } from '../../utils/constants';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { resolvePhotoUrl } from '../../utils/media';

export default function MemberProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const memberQuery = useMember(id);
  const activityQuery = useMemberActivity(id);
  const attendanceQuery = useMemberAttendanceHistory(id);
  const updateMutation = useUpdateMember();
  const deleteMutation = useDeleteMember();
  const uploadMutation = useUploadMemberPhoto();

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    other_name: '',
    phone: '',
    email: '',
    gender: '',
    date_of_birth: '',
    marital_status: '',
    occupation: '',
    address: '',
    membership_status: 'active',
    date_joined: '',
    baptism_date: '',
    membership_class_completed: false,
    is_family_head: false,
    family_id: '',
  });
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    const member = memberQuery.data?.data;
    if (!member) return;

    setForm({
      first_name: member.first_name || '',
      last_name: member.last_name || '',
      other_name: member.other_name || '',
      phone: member.phone || '',
      email: member.email || '',
      gender: member.gender || '',
      date_of_birth: member.date_of_birth || '',
      marital_status: member.marital_status || '',
      occupation: member.occupation || '',
      address: member.address || '',
      membership_status: member.membership_status || 'active',
      date_joined: member.date_joined || '',
      baptism_date: member.baptism_date || '',
      membership_class_completed: Boolean(member.membership_class_completed),
      is_family_head: Boolean(member.is_family_head),
      family_id: member.family_id || '',
    });
  }, [memberQuery.data]);

  if (memberQuery.isLoading) {
    return <LoadingSpinner label="Loading member profile..." />;
  }

  const member = memberQuery.data?.data;
  if (!member) {
    return (
      <section className="panel p-6">
        <p className="text-sm text-red-600">Member not found.</p>
        <Link to="/members" className="mt-3 inline-flex text-sm font-semibold text-brand-700">
          Back to members
        </Link>
      </section>
    );
  }

  const history = attendanceQuery.data?.data?.history ?? [];
  const attendancePercentage = attendanceQuery.data?.data?.attendance_percentage ?? 0;
  const activity = activityQuery.data?.data;
  const overview = activity?.overview;
  const giving = activity?.giving;
  const attendance = activity?.attendance;

  const columns = [
    { key: 'session_title', label: 'Session' },
    { key: 'session_date', label: 'Date', render: (row) => formatDate(row.session_date) },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold uppercase text-slate-700">{row.status}</span>
      ),
    },
    { key: 'notes', label: 'Notes' },
  ];

  const givingColumns = [
    { key: 'donation_date', label: 'Date', render: (row) => formatDate(row.donation_date) },
    { key: 'fund_name', label: 'Fund' },
    { key: 'batch_title', label: 'Batch', render: (row) => row.batch_title || 'Direct entry' },
    { key: 'amount', label: 'Amount', render: (row) => formatCurrency(row.amount, row.currency || 'GHS') },
    { key: 'payment_method', label: 'Method' },
  ];

  async function onSave(event) {
    event.preventDefault();
    setMessage('');

    await updateMutation.mutateAsync({
      id,
      payload: {
        ...form,
        other_name: form.other_name || null,
        phone: form.phone || null,
        email: form.email || null,
        gender: form.gender || null,
        date_of_birth: form.date_of_birth || null,
        marital_status: form.marital_status || null,
        occupation: form.occupation || null,
        address: form.address || null,
        date_joined: form.date_joined || null,
        baptism_date: form.baptism_date || null,
        family_id: form.family_id || null,
      },
    });
    setMessage('Member profile updated successfully.');
  }

  async function onUploadPhoto() {
    if (!selectedFile) return;
    setMessage('');
    await uploadMutation.mutateAsync({ id, file: selectedFile });
    setSelectedFile(null);
    setMessage('Member photo uploaded successfully.');
  }

  async function onDeactivate() {
    const confirmed = window.confirm('Deactivate this member? This will set membership status to inactive.');
    if (!confirmed) return;

    await deleteMutation.mutateAsync(id);
    navigate('/members');
  }

  return (
    <section>
      <PageHeader
        title={`${member.first_name} ${member.last_name}`}
        subtitle="Manage profile details, family linkage, photo, and membership status."
        action={
          <Link to="/members" className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Back to members
          </Link>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Membership Status" value={member.membership_status || '-'} />
        <StatCard label="Attendance Rate" value={`${attendancePercentage}%`} tone={attendancePercentage >= 50 ? 'good' : 'warn'} />
        <StatCard label="Total Giving" value={formatCurrency(overview?.total_giving ?? 0)} />
        <StatCard label="Tithe Given" value={formatCurrency(overview?.tithe_total ?? 0)} />
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Last Attendance" value={overview?.last_present_date ? formatDate(overview.last_present_date) : 'No present record'} />
        <StatCard label="Giving Entries" value={overview?.giving_entries ?? 0} />
        <StatCard label="Punctuality" value={attendance?.punctuality_tracked ? `${attendance?.punctuality_rate ?? 0}%` : 'Not tracked'} tone={attendance?.punctuality_tracked && (attendance?.punctuality_rate ?? 0) >= 70 ? 'good' : 'warn'} />
        <StatCard label="Family" value={member.family_id ? 'Linked' : 'Not linked'} />
        <StatCard label="Membership Class" value={member.membership_class_completed ? 'Completed' : 'Pending'} />
      </div>

      <div className="panel mb-6 p-5">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Activity Overview</p>
            <h3 className="mt-1 text-lg font-semibold text-slate-900">Attendance and finance snapshot</h3>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            {overview?.low_attendance ? 'Marked as low attendance risk' : 'Attendance currently healthy'}
          </div>
        </div>

        {activityQuery.isLoading ? (
          <LoadingSpinner label="Loading member activity..." />
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Attendance</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-slate-500">Present</p>
                  <p className="text-xl font-bold text-slate-900">{attendance?.present_count ?? 0}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Absent</p>
                  <p className="text-xl font-bold text-slate-900">{attendance?.absent_count ?? 0}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Excused</p>
                  <p className="text-xl font-bold text-slate-900">{attendance?.excused_count ?? 0}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Sessions Marked</p>
                  <p className="text-xl font-bold text-slate-900">{attendance?.total_sessions_marked ?? 0}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">On Time</p>
                  <p className="text-xl font-bold text-slate-900">{attendance?.on_time_count ?? 0}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Late</p>
                  <p className="text-xl font-bold text-slate-900">{attendance?.late_count ?? 0}</p>
                </div>
              </div>
              <div className="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">
                {attendance?.punctuality_note || 'Punctuality is not yet tracked.'}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Giving</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-slate-500">Total Giving</p>
                  <p className="text-xl font-bold text-slate-900">{formatCurrency(giving?.total_giving ?? 0)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Tithe Total</p>
                  <p className="text-xl font-bold text-slate-900">{formatCurrency(giving?.tithe_total ?? 0)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Entries</p>
                  <p className="text-xl font-bold text-slate-900">{giving?.giving_entries ?? 0}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Last Giving</p>
                  <p className="text-base font-semibold text-slate-900">{giving?.last_giving_date ? formatDate(giving.last_giving_date) : 'No giving yet'}</p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {(giving?.fund_breakdown ?? []).slice(0, 4).map((item) => (
                  <div key={item.fund} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                    <span className="font-medium text-slate-700">{item.fund}</span>
                    <span className="font-bold text-slate-900">{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="panel mb-6 p-5">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Member Photo</p>
        <div className="mb-3 flex items-center gap-3">
          {member.photo_url ? (
            <img
              src={resolvePhotoUrl(member.photo_url)}
              alt={`${member.first_name} ${member.last_name}`}
              className="h-20 w-20 rounded-2xl object-cover ring-1 ring-slate-200"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-100 text-xl font-bold text-brand-800">
              {(member.first_name?.[0] || '')}
              {(member.last_name?.[0] || '')}
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-slate-700">Profile photo</p>
            <p className="text-xs text-slate-500">Upload a clear headshot for quick identification.</p>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <input type="file" accept="image/*" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} className="field" />
          <button type="button" onClick={onUploadPhoto} disabled={!selectedFile || uploadMutation.isPending} className="btn-primary">
            {uploadMutation.isPending ? 'Uploading...' : 'Upload Photo'}
          </button>
        </div>
      </div>

      <form onSubmit={onSave} className="panel mb-6 p-5">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Edit Profile</p>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <input className="field" value={form.first_name} onChange={(e) => setForm((p) => ({ ...p, first_name: e.target.value }))} placeholder="First name" required />
          <input className="field" value={form.last_name} onChange={(e) => setForm((p) => ({ ...p, last_name: e.target.value }))} placeholder="Last name" required />
          <input className="field" value={form.other_name} onChange={(e) => setForm((p) => ({ ...p, other_name: e.target.value }))} placeholder="Other name" />
          <input className="field" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} placeholder="Phone" />
          <input className="field" type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="Email" />

          <select className="field" value={form.gender} onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value }))}>
            <option value="">Gender</option>
            {GENDERS.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Date of Birth</label>
            <input className="field" type="date" value={form.date_of_birth} onChange={(e) => setForm((p) => ({ ...p, date_of_birth: e.target.value }))} />
          </div>

          <select className="field" value={form.marital_status} onChange={(e) => setForm((p) => ({ ...p, marital_status: e.target.value }))}>
            <option value="">Marital status</option>
            {MARITAL_STATUS.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>

          <input className="field" value={form.occupation} onChange={(e) => setForm((p) => ({ ...p, occupation: e.target.value }))} placeholder="Occupation" />

          <select className="field" value={form.membership_status} onChange={(e) => setForm((p) => ({ ...p, membership_status: e.target.value }))}>
            {MEMBERSHIP_STATUS.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Date Joined</label>
            <input className="field" type="date" value={form.date_joined} onChange={(e) => setForm((p) => ({ ...p, date_joined: e.target.value }))} />
          </div>
          <input className="field" type="date" value={form.baptism_date} onChange={(e) => setForm((p) => ({ ...p, baptism_date: e.target.value }))} />
          <input className="field" value={form.family_id} onChange={(e) => setForm((p) => ({ ...p, family_id: e.target.value }))} placeholder="Family ID (UUID)" />
          <input className="field md:col-span-2 xl:col-span-4" value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} placeholder="Address" />
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
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button type="submit" className="btn-primary" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
          <button type="button" onClick={onDeactivate} className="btn-danger" disabled={deleteMutation.isPending}>
            {deleteMutation.isPending ? 'Deactivating...' : 'Deactivate Member'}
          </button>
        </div>

        {message ? <p className="mt-3 text-sm text-emerald-700">{message}</p> : null}
      </form>

      {attendanceQuery.isLoading ? (
        <LoadingSpinner label="Loading attendance history..." />
      ) : (
        <div className="mb-6">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Attendance History</p>
          <DataTable columns={columns} rows={history} emptyLabel="No attendance records yet" />
        </div>
      )}

      <div className="panel p-5">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Giving History</p>
        {activityQuery.isLoading ? (
          <LoadingSpinner label="Loading giving history..." />
        ) : (
          <DataTable columns={givingColumns} rows={giving?.recent_entries ?? []} emptyLabel="No member-linked giving records yet" />
        )}
      </div>
    </section>
  );
}
