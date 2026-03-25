import { useAuthStore } from '../../store/authStore';
import PageHeader from '../../components/shared/PageHeader';
import StatCard from '../../components/shared/StatCard';

export default function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <section>
      <PageHeader
        title="Dashboard"
        subtitle="Operational snapshot while the remaining modules are being completed."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Current Role" value={user?.role ?? '-'} />
        <StatCard label="Members Module" value="Active" helper="List/create/update/export ready" />
        <StatCard label="Attendance Module" value="Active" helper="Session create + summary ready" />
        <StatCard label="Next Module" value="Donations" helper="Pending implementation" />
      </div>
    </section>
  );
}
