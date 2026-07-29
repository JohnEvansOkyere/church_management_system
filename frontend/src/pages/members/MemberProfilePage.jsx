import {
  ArrowLeft,
  AtSign,
  Cake,
  CheckCircle2,
  Home,
  MapPin,
  Pencil,
  Phone,
  TrendingUp,
  Upload,
  UserCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Badge from '../../components/shared/Badge';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import DataTable from '../../components/shared/DataTable';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import StatCard from '../../components/shared/StatCard';
import { useMemberAttendanceHistory } from '../../hooks/useAttendance';
import { useDeleteMember, useMember, useMemberActivity, useUpdateMember, useUploadMemberPhoto } from '../../hooks/useMembers';
import { familyService } from '../../services/familyService';
import { GENDERS, MARITAL_STATUS, MEMBERSHIP_STATUS } from '../../utils/constants';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { resolvePhotoUrl } from '../../utils/media';

const TABS = ['Overview', 'Attendance', 'Giving', 'Edit Profile'];

const STATUS_BADGE_MAP = {
  active: 'active',
  inactive: 'inactive',
  visitor: 'visitor',
  new_convert: 'new_convert',
};

function TabButton({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative px-4 py-3 text-sm font-semibold transition ${
        active
          ? 'text-brand-700 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:bg-brand-700'
          : 'text-slate-500 hover:text-slate-800'
      }`}
    >
      {label}
    </button>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <Icon size={15} className="mt-0.5 flex-shrink-0 text-slate-400" />
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm font-medium text-slate-800">{value}</p>
      </div>
    </div>
  );
}

export default function MemberProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const memberQuery = useMember(id);
  const activityQuery = useMemberActivity(id);
  const attendanceQuery = useMemberAttendanceHistory(id);
  const updateMutation = useUpdateMember();
  const deleteMutation = useDeleteMember();
  const uploadMutation = useUploadMemberPhoto();
  const familiesQuery = useQuery({
    queryKey: ['families', 'member-profile'],
    queryFn: () => familyService.getAll({ limit: 200 }).then((response) => response.data.data),
  });

  const [activeTab, setActiveTab] = useState('Overview');
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [showDeactivate, setShowDeactivate] = useState(false);

  const [form, setForm] = useState({
    first_name: '', last_name: '', other_name: '', phone: '', email: '',
    gender: '', date_of_birth: '', marital_status: '', occupation: '',
    address: '', membership_status: 'active', date_joined: '',
    baptism_date: '', membership_class_completed: false,
    introduced_by: '', family_mode: 'none', is_family_head: false, family_id: '',
  });

  useEffect(() => {
    const member = memberQuery.data?.data;
    if (!member) return;
    setForm({
      first_name: member.first_name || '', last_name: member.last_name || '',
      other_name: member.other_name || '', phone: member.phone || '',
      email: member.email || '', gender: member.gender || '',
      date_of_birth: member.date_of_birth || '', marital_status: member.marital_status || '',
      occupation: member.occupation || '', address: member.address || '',
      membership_status: member.membership_status || 'active', date_joined: member.date_joined || '',
      baptism_date: member.baptism_date || '',
      membership_class_completed: Boolean(member.membership_class_completed),
      introduced_by: member.introduced_by || '',
      family_mode: member.family_id ? 'existing' : 'none',
      is_family_head: Boolean(member.is_family_head), family_id: member.family_id || '',
    });
  }, [memberQuery.data]);

  if (memberQuery.isLoading) return <LoadingSpinner label="Loading member profile..." />;

  const member = memberQuery.data?.data;
  if (!member) {
    return (
      <div className="panel p-8 text-center">
        <UserCircle size={40} className="mx-auto text-slate-300" />
        <p className="mt-3 text-sm font-semibold text-slate-600">Member not found.</p>
        <Link to="/members" className="btn-ghost mt-4">
          <ArrowLeft size={14} /> Back to Members
        </Link>
      </div>
    );
  }

  const history = attendanceQuery.data?.data?.history ?? [];
  const attendancePercentage = attendanceQuery.data?.data?.attendance_percentage ?? 0;
  const activity = activityQuery.data?.data;
  const overview = activity?.overview;
  const giving = activity?.giving;
  const attendance = activity?.attendance;
  const initials = `${member.first_name?.[0] ?? ''}${member.last_name?.[0] ?? ''}`.toUpperCase();

  async function onSave(event) {
    event.preventDefault();
    setMessage('');
    await updateMutation.mutateAsync({
      id,
      payload: {
        ...form,
        other_name: form.other_name || null, phone: form.phone || null,
        email: form.email || null, gender: form.gender || null,
        date_of_birth: form.date_of_birth || null, marital_status: form.marital_status || null,
        occupation: form.occupation || null, address: form.address || null,
        date_joined: form.date_joined || null, baptism_date: form.baptism_date || null,
        introduced_by: form.introduced_by || null,
        family_id: form.family_mode === 'existing' ? form.family_id || null : null,
      },
    });
    setMessage('Profile updated successfully.');
  }

  async function onUploadPhoto() {
    if (!selectedFile) return;
    setMessage('');
    await uploadMutation.mutateAsync({ id, file: selectedFile });
    setSelectedFile(null);
    setMessage('Photo uploaded successfully.');
  }

  async function onDeactivate() {
    await deleteMutation.mutateAsync(id);
    setShowDeactivate(false);
    navigate('/members');
  }

  const attendanceCols = [
    { key: 'session_title', label: 'Session' },
    { key: 'session_date', label: 'Date', render: (row) => formatDate(row.session_date) },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <Badge variant={row.status === 'present' ? 'present' : row.status === 'excused' ? 'excused' : 'absent'}>
          {row.status}
        </Badge>
      ),
    },
    { key: 'notes', label: 'Notes', render: (row) => row.notes ?? <span className="text-slate-300">—</span> },
  ];

  const givingCols = [
    { key: 'donation_date', label: 'Date', render: (row) => formatDate(row.donation_date) },
    { key: 'fund_name', label: 'Fund' },
    { key: 'batch_title', label: 'Batch', render: (row) => row.batch_title || 'Direct entry' },
    { key: 'amount', label: 'Amount', render: (row) => formatCurrency(row.amount, row.currency || 'GHS') },
    { key: 'payment_method', label: 'Method' },
  ];

  return (
    <section className="space-y-5">

      {/* Back link */}
      <Link to="/members" className="btn-ghost inline-flex">
        <ArrowLeft size={15} /> Back to Members
      </Link>

      {/* Hero header card */}
      <div className="panel overflow-hidden">
        <div className="bg-brand-900 px-6 py-6 text-white">
          <div className="flex flex-wrap items-start gap-5">
            {/* Avatar */}
            <div className="relative">
              {member.photo_url ? (
                <img
                  src={resolvePhotoUrl(member.photo_url)}
                  alt={`${member.first_name} ${member.last_name}`}
                  className="h-20 w-20 rounded-2xl object-cover ring-2 ring-white/20"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 text-2xl font-bold text-white ring-2 ring-white/20">
                  {initials}
                </div>
              )}
            </div>

            {/* Name + details */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-extrabold">
                  {member.first_name} {member.last_name}
                  {member.other_name ? ` ${member.other_name}` : ''}
                </h1>
                <Badge variant={STATUS_BADGE_MAP[member.membership_status] ?? 'default'}>
                  {member.membership_status}
                </Badge>
              </div>
              <div className="mt-3 flex flex-wrap gap-4 text-sm text-white/70">
                {member.phone && <InfoRow icon={Phone} label="Phone" value={member.phone} />}
                {member.email && <InfoRow icon={AtSign} label="Email" value={member.email} />}
                {member.date_of_birth && <InfoRow icon={Cake} label="Birthday" value={formatDate(member.date_of_birth)} />}
                {member.address && <InfoRow icon={MapPin} label="Address" value={member.address} />}
                {member.family_name && <InfoRow icon={Home} label="Family" value={member.family_name} />}
                {member.introduced_by && <InfoRow icon={UserCircle} label="Introduced by" value={member.introduced_by} />}
                {member.date_joined && <InfoRow icon={Home} label="Joined" value={formatDate(member.date_joined)} />}
              </div>
            </div>

            {/* Edit tab shortcut */}
            <button
              type="button"
              onClick={() => setActiveTab('Edit Profile')}
              className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              <Pencil size={14} /> Edit
            </button>
          </div>
        </div>

        {/* Quick stats strip */}
        <div className="grid grid-cols-2 divide-x divide-slate-100 border-t border-slate-100 md:grid-cols-4">
          {[
            { label: 'Attendance', value: `${attendancePercentage}%`, tone: attendancePercentage >= 50 ? 'text-success-700' : 'text-church-700' },
            { label: 'Total Giving', value: formatCurrency(overview?.total_giving ?? 0), tone: 'text-slate-900' },
            { label: 'Tithe (All time)', value: formatCurrency(overview?.tithe_total ?? 0), tone: 'text-brand-700' },
            { label: 'Membership Class', value: member.membership_class_completed ? 'Completed' : 'Pending', tone: member.membership_class_completed ? 'text-success-700' : 'text-church-700' },
          ].map((stat) => (
            <div key={stat.label} className="px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{stat.label}</p>
              <p className={`mt-1 text-lg font-extrabold ${stat.tone}`}>{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tab bar */}
      <div className="panel overflow-hidden">
        <div className="flex border-b border-slate-100 px-2">
          {TABS.map((tab) => (
            <TabButton key={tab} label={tab} active={activeTab === tab} onClick={() => setActiveTab(tab)} />
          ))}
        </div>

        <div className="p-5">

          {/* ── Overview tab ── */}
          {activeTab === 'Overview' && (
            <div className="space-y-5">
              <div className="grid gap-5 lg:grid-cols-2">
                {/* Attendance overview */}
                <div className="rounded-2xl border border-slate-100 p-5">
                  <p className="label-caps mb-4">Attendance Overview</p>
                  {activityQuery.isLoading ? <LoadingSpinner label="Loading activity..." /> : (
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: 'Present', value: attendance?.present_count ?? 0, color: 'text-success-700' },
                        { label: 'Absent', value: attendance?.absent_count ?? 0, color: 'text-slate-900' },
                        { label: 'Excused', value: attendance?.excused_count ?? 0, color: 'text-church-700' },
                        { label: 'Sessions Marked', value: attendance?.total_sessions_marked ?? 0, color: 'text-slate-900' },
                        { label: 'On Time', value: attendance?.on_time_count ?? 0, color: 'text-success-700' },
                        { label: 'Late', value: attendance?.late_count ?? 0, color: 'text-church-700' },
                      ].map(({ label, value, color }) => (
                        <div key={label}>
                          <p className="text-xs text-slate-500">{label}</p>
                          <p className={`text-xl font-bold ${color}`}>{value}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {attendance?.punctuality_note && (
                    <p className="mt-4 rounded-xl bg-church-50 px-3 py-2 text-xs text-church-700">
                      {attendance.punctuality_note}
                    </p>
                  )}
                </div>

                {/* Giving overview */}
                <div className="rounded-2xl border border-slate-100 p-5">
                  <p className="label-caps mb-4">Giving Overview</p>
                  {activityQuery.isLoading ? <LoadingSpinner label="Loading giving..." /> : (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-slate-500">Total Giving</p>
                          <p className="text-xl font-bold text-brand-700">{formatCurrency(giving?.total_giving ?? 0)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Tithe Total</p>
                          <p className="text-xl font-bold text-slate-900">{formatCurrency(giving?.tithe_total ?? 0)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Entries</p>
                          <p className="text-xl font-bold text-slate-900">{giving?.giving_entries ?? 0}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Last Giving</p>
                          <p className="text-sm font-semibold text-slate-900">
                            {giving?.last_giving_date ? formatDate(giving.last_giving_date) : 'No records'}
                          </p>
                        </div>
                      </div>
                      {(giving?.fund_breakdown ?? []).length > 0 && (
                        <div className="mt-4 space-y-1.5">
                          {(giving.fund_breakdown ?? []).slice(0, 4).map((item) => (
                            <div key={item.fund} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                              <span className="text-slate-600">{item.fund}</span>
                              <span className="font-semibold text-slate-900">{formatCurrency(item.value)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Photo upload */}
              <div className="rounded-2xl border border-slate-100 p-5">
                <p className="label-caps mb-4">Profile Photo</p>
                <div className="flex flex-wrap items-center gap-4">
                  {member.photo_url ? (
                    <img src={resolvePhotoUrl(member.photo_url)} alt="" className="h-16 w-16 rounded-2xl object-cover ring-1 ring-slate-200" />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100 text-lg font-bold text-brand-800">{initials}</div>
                  )}
                  <div className="flex flex-1 flex-wrap gap-3">
                    <input type="file" accept="image/*" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} className="field flex-1" />
                    <button
                      type="button"
                      onClick={onUploadPhoto}
                      disabled={!selectedFile || uploadMutation.isPending}
                      className="btn-primary"
                    >
                      <Upload size={14} />
                      {uploadMutation.isPending ? 'Uploading…' : 'Upload Photo'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Attendance tab ── */}
          {activeTab === 'Attendance' && (
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-3">
                <StatCard label="Attendance Rate" value={`${attendancePercentage}%`} tone={attendancePercentage >= 50 ? 'good' : 'warn'} icon={TrendingUp} />
                <StatCard label="Present" value={attendance?.present_count ?? 0} tone="good" />
                <StatCard label="Absent" value={attendance?.absent_count ?? 0} />
              </div>
              {attendanceQuery.isLoading ? (
                <LoadingSpinner label="Loading attendance history..." />
              ) : (
                <DataTable columns={attendanceCols} rows={history} emptyLabel="No attendance records yet" />
              )}
            </div>
          )}

          {/* ── Giving tab ── */}
          {activeTab === 'Giving' && (
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-3">
                <StatCard label="Total Giving" value={formatCurrency(giving?.total_giving ?? 0)} tone="good" icon={TrendingUp} />
                <StatCard label="Tithe (All time)" value={formatCurrency(giving?.tithe_total ?? 0)} tone="default" />
                <StatCard label="Giving Entries" value={giving?.giving_entries ?? 0} />
              </div>
              {activityQuery.isLoading ? (
                <LoadingSpinner label="Loading giving history..." />
              ) : (
                <DataTable columns={givingCols} rows={giving?.recent_entries ?? []} emptyLabel="No giving records yet" />
              )}
            </div>
          )}

          {/* ── Edit Profile tab ── */}
          {activeTab === 'Edit Profile' && (
            <form onSubmit={onSave} className="space-y-6">
              {/* Personal */}
              <div>
                <p className="label-caps mb-3">Personal Information</p>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">First Name *</label>
                    <input className="field" value={form.first_name} onChange={(e) => setForm((p) => ({ ...p, first_name: e.target.value }))} required />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Last Name *</label>
                    <input className="field" value={form.last_name} onChange={(e) => setForm((p) => ({ ...p, last_name: e.target.value }))} required />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Other Name</label>
                    <input className="field" value={form.other_name} onChange={(e) => setForm((p) => ({ ...p, other_name: e.target.value }))} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Gender</label>
                    <select className="field" value={form.gender} onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value }))}>
                      <option value="">Select gender</option>
                      {GENDERS.map((item) => <option key={item} value={item}>{item}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Phone</label>
                    <input className="field" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Email</label>
                    <input className="field" type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Date of Birth</label>
                    <input className="field" type="date" value={form.date_of_birth} onChange={(e) => setForm((p) => ({ ...p, date_of_birth: e.target.value }))} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Marital Status</label>
                    <select className="field" value={form.marital_status} onChange={(e) => setForm((p) => ({ ...p, marital_status: e.target.value }))}>
                      <option value="">Select</option>
                      {MARITAL_STATUS.map((item) => <option key={item} value={item}>{item}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Occupation</label>
                    <input className="field" value={form.occupation} onChange={(e) => setForm((p) => ({ ...p, occupation: e.target.value }))} />
                  </div>
                  <div className="md:col-span-2 xl:col-span-3">
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Address</label>
                    <input className="field" value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} />
                  </div>
                </div>
              </div>

              {/* Church details */}
              <div>
                <p className="label-caps mb-3">Church Details</p>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Membership Status</label>
                    <select className="field" value={form.membership_status} onChange={(e) => setForm((p) => ({ ...p, membership_status: e.target.value }))}>
                      {MEMBERSHIP_STATUS.map((item) => <option key={item} value={item}>{item}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Date Joined</label>
                    <input className="field" type="date" value={form.date_joined} onChange={(e) => setForm((p) => ({ ...p, date_joined: e.target.value }))} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Who brought/referred you</label>
                    <input className="field" value={form.introduced_by} onChange={(e) => setForm((p) => ({ ...p, introduced_by: e.target.value }))} placeholder="Optional" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Baptism Date</label>
                    <input className="field" type="date" value={form.baptism_date} onChange={(e) => setForm((p) => ({ ...p, baptism_date: e.target.value }))} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Family household (optional)</label>
                    <select className="field" value={form.family_mode} onChange={(e) => setForm((p) => ({ ...p, family_mode: e.target.value, family_id: e.target.value === 'none' ? '' : p.family_id, is_family_head: e.target.value === 'none' ? false : p.is_family_head }))}>
                      <option value="none">No family / came alone</option>
                      <option value="existing">Join an existing family</option>
                    </select>
                  </div>
                  {form.family_mode === 'existing' && <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Select family</label>
                    <select className="field" value={form.family_id} onChange={(e) => setForm((p) => ({ ...p, family_id: e.target.value }))}>
                      <option value="">Choose an existing household</option>
                      {(familiesQuery.data || []).map((family) => <option key={family.id} value={family.id}>{family.family_name} ({family.member_count} members)</option>)}
                    </select>
                  </div>}
                </div>
                <div className="mt-3 flex flex-wrap gap-5">
                  <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700">
                    <input type="checkbox" checked={form.membership_class_completed} onChange={(e) => setForm((p) => ({ ...p, membership_class_completed: e.target.checked }))} className="h-4 w-4 rounded border-slate-300 text-brand-700" />
                    <CheckCircle2 size={14} className="text-slate-400" />
                    Membership class completed
                  </label>
                  {form.family_mode !== 'none' && <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700">
                    <input type="checkbox" checked={form.is_family_head} onChange={(e) => setForm((p) => ({ ...p, is_family_head: e.target.checked }))} className="h-4 w-4 rounded border-slate-300 text-brand-700" />
                    <Home size={14} className="text-slate-400" />
                    Is family head
                  </label>}
                </div>
              </div>

              {message && (
                <p className="rounded-xl bg-success-50 px-4 py-2.5 text-sm font-medium text-success-700 ring-1 ring-success-100">
                  {message}
                </p>
              )}

              <div className="flex flex-wrap gap-3">
                <button type="submit" className="btn-primary" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Saving…' : 'Save Changes'}
                </button>
                <button type="button" onClick={() => setShowDeactivate(true)} className="btn-danger" disabled={deleteMutation.isPending}>
                  Deactivate Member
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={showDeactivate}
        title="Deactivate Member?"
        description={`This will set ${member.first_name} ${member.last_name}'s membership status to inactive.`}
        confirmLabel="Deactivate"
        onConfirm={onDeactivate}
        onCancel={() => setShowDeactivate(false)}
        danger
      />
    </section>
  );
}
