import { Plus, Users, UsersRound } from 'lucide-react';
import EmptyState from '../../components/shared/EmptyState';
import PageHeader from '../../components/shared/PageHeader';

const PLACEHOLDER_GROUPS = [
  { id: 1, name: "Men's Fellowship", members: 34, leader: 'Elder Kwame Asante', color: 'bg-brand-700' },
  { id: 2, name: "Women's Ministry", members: 58, leader: 'Deaconess Grace Mensah', color: 'bg-accent-700' },
  { id: 3, name: 'Youth Ministry', members: 41, leader: 'Bro. Emmanuel Osei', color: 'bg-church-700' },
  { id: 4, name: 'Choir Ministry', members: 22, leader: 'Sis. Abena Darko', color: 'bg-success-700' },
  { id: 5, name: 'Ushering Department', members: 15, leader: 'Bro. Daniel Boateng', color: 'bg-brand-600' },
  { id: 6, name: 'Children Ministry', members: 29, leader: 'Sis. Priscilla Adu', color: 'bg-church-600' },
];

function GroupCard({ group }) {
  return (
    <article className="panel p-5 transition hover:shadow-md">
      <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${group.color}`}>
        <UsersRound size={22} className="text-white" />
      </div>
      <h3 className="text-base font-bold text-slate-900">{group.name}</h3>
      <div className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
        <Users size={14} className="text-slate-400" />
        <span>{group.members} members</span>
      </div>
      <p className="mt-1 text-xs text-slate-400">Leader: {group.leader}</p>
      <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
        <button type="button" className="btn-ghost text-xs px-3 py-1.5">View Members</button>
        <button type="button" className="btn-ghost text-xs px-3 py-1.5">Edit</button>
      </div>
    </article>
  );
}

export default function GroupsPage() {
  return (
    <section className="space-y-5">
      <PageHeader
        title="Groups & Ministries"
        subtitle="Manage your church departments, ministries, cells, and fellowship groups."
        action={
          <button type="button" className="btn-primary">
            <Plus size={15} />
            Create Group
          </button>
        }
      />

      {/* Coming soon notice */}
      <div className="panel border-l-4 border-church-700 p-5">
        <p className="text-sm font-bold text-church-700">Backend module coming soon</p>
        <p className="mt-1 text-sm text-slate-600">
          The Groups API is under development. Below is a preview of the design using sample data.
        </p>
      </div>

      {PLACEHOLDER_GROUPS.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {PLACEHOLDER_GROUPS.map((group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>
      ) : (
        <div className="panel p-8">
          <EmptyState
            icon={UsersRound}
            label="No groups yet"
            sublabel="Create your first ministry or fellowship group to get started."
            action={
              <button type="button" className="btn-primary">
                <Plus size={14} /> Create Group
              </button>
            }
          />
        </div>
      )}
    </section>
  );
}
