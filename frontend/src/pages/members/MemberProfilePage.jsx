import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import DataTable from '../../components/shared/DataTable';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import PageHeader from '../../components/shared/PageHeader';
import StatCard from '../../components/shared/StatCard';
import { useMemberAttendanceHistory } from '../../hooks/useAttendance';
import { useDeleteMember, useMember, useUpdateMember, useUploadMemberPhoto } from '../../hooks/useMembers';
import { formatDate } from '../../utils/formatters';
import { resolvePhotoUrl } from '../../utils/media';

export default function MemberProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const memberQuery = useMember(id);
  const attendanceQuery = useMemberAttendanceHistory(id);
  const updateMutation = useUpdateMember();
  const deleteMutation = useDeleteMember();
  const uploadMutation = useUploadMemberPhoto();

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    gender: '',
    marital_status: '',
    occupation: '',
    address: '',
    membership_status: 'active',
  });
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    const member = memberQuery.data?.data;
    if (!member) return;

    setForm({
      first_name: member.first_name || '',
      last_name: member.last_name || '',
      phone: member.phone || '',
      email: member.email || '',
      gender: member.gender || '',
      marital_status: member.marital_status || '',
      occupation: member.occupation || '',
      address: member.address || '',
      membership_status: member.membership_status || 'active',
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

  async function onSave(event) {
    event.preventDefault();
    setMessage('');

    await updateMutation.mutateAsync({
      id,
      payload: {
        ...form,
        gender: form.gender || null,
        marital_status: form.marital_status || null,
        occupation: form.occupation || null,
        address: form.address || null,
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
        subtitle="Manage profile details, photo, and membership status."
        action={
          <Link to="/members" className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Back to members
          </Link>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Membership Status" value={member.membership_status || '-'} />
        <StatCard label="Attendance Rate" value={`${attendancePercentage}%`} tone={attendancePercentage >= 50 ? 'good' : 'warn'} />
        <StatCard label="Phone" value={member.phone || '-'} />
        <StatCard label="Email" value={member.email || '-'} />
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
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <input className="field" value={form.first_name} onChange={(e) => setForm((p) => ({ ...p, first_name: e.target.value }))} placeholder="First name" required />
          <input className="field" value={form.last_name} onChange={(e) => setForm((p) => ({ ...p, last_name: e.target.value }))} placeholder="Last name" required />
          <input className="field" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} placeholder="Phone" />
          <input className="field" type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="Email" />
          <select className="field" value={form.gender} onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value }))}>
            <option value="">Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          <select className="field" value={form.marital_status} onChange={(e) => setForm((p) => ({ ...p, marital_status: e.target.value }))}>
            <option value="">Marital status</option>
            <option value="single">Single</option>
            <option value="married">Married</option>
            <option value="divorced">Divorced</option>
            <option value="widowed">Widowed</option>
          </select>
          <input className="field" value={form.occupation} onChange={(e) => setForm((p) => ({ ...p, occupation: e.target.value }))} placeholder="Occupation" />
          <select className="field" value={form.membership_status} onChange={(e) => setForm((p) => ({ ...p, membership_status: e.target.value }))}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="visitor">Visitor</option>
            <option value="new_convert">New convert</option>
          </select>
          <input className="field md:col-span-2 xl:col-span-1" value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} placeholder="Address" />
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
        <DataTable columns={columns} rows={history} emptyLabel="No attendance records yet" />
      )}
    </section>
  );
}
