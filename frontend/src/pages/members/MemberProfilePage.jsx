import { Link, useParams } from 'react-router-dom';
import DataTable from '../../components/shared/DataTable';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import PageHeader from '../../components/shared/PageHeader';
import StatCard from '../../components/shared/StatCard';
import { useMemberAttendanceHistory } from '../../hooks/useAttendance';
import { useMember } from '../../hooks/useMembers';
import { formatDate } from '../../utils/formatters';

export default function MemberProfilePage() {
  const { id } = useParams();
  const memberQuery = useMember(id);
  const attendanceQuery = useMemberAttendanceHistory(id);

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

  return (
    <section>
      <PageHeader
        title={`${member.first_name} ${member.last_name}`}
        subtitle="Member profile and attendance performance overview."
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
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Profile Details</p>
        <div className="mt-3 grid gap-3 text-sm md:grid-cols-2 xl:grid-cols-3">
          <p><span className="font-semibold text-slate-700">Gender:</span> {member.gender || '-'}</p>
          <p><span className="font-semibold text-slate-700">Date of birth:</span> {formatDate(member.date_of_birth)}</p>
          <p><span className="font-semibold text-slate-700">Date joined:</span> {formatDate(member.date_joined)}</p>
          <p><span className="font-semibold text-slate-700">Occupation:</span> {member.occupation || '-'}</p>
          <p><span className="font-semibold text-slate-700">Marital status:</span> {member.marital_status || '-'}</p>
          <p><span className="font-semibold text-slate-700">Address:</span> {member.address || '-'}</p>
        </div>
      </div>

      {attendanceQuery.isLoading ? (
        <LoadingSpinner label="Loading attendance history..." />
      ) : (
        <DataTable columns={columns} rows={history} emptyLabel="No attendance records yet" />
      )}
    </section>
  );
}
