import { Plus, Users, UsersRound, X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import EmptyState from '../../components/shared/EmptyState';
import PageHeader from '../../components/shared/PageHeader';
import { groupsService } from '../../services/groupsService';

const COLORS = ['bg-brand-700', 'bg-accent-700', 'bg-church-700', 'bg-success-700'];

export default function GroupsPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [message, setMessage] = useState('');

  const groupsQuery = useQuery({
    queryKey: ['groups'],
    queryFn: () => groupsService.getAll().then((response) => response.data.data),
  });

  const createMutation = useMutation({
    mutationFn: (payload) => groupsService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      setForm({ name: '', description: '' });
      setShowCreate(false);
      setMessage('Department created successfully.');
    },
  });

  function submitCreate(event) {
    event.preventDefault();
    setMessage('');
    createMutation.mutate(form);
  }

  const groups = groupsQuery.data || [];

  return (
    <section className="space-y-5">
      <PageHeader
        title="Departments & Ministries"
        subtitle="Manage each ministry as one complete team. A member can belong to more than one department."
        action={
          <button type="button" className="btn-primary" onClick={() => setShowCreate((value) => !value)}>
            {showCreate ? <X size={15} /> : <Plus size={15} />}
            {showCreate ? 'Close' : 'Create Department'}
          </button>
        }
      />

      {message && <p className="rounded-xl bg-success-50 px-4 py-3 text-sm font-medium text-success-700 ring-1 ring-success-100">{message}</p>}

      {showCreate && (
        <form onSubmit={submitCreate} className="panel grid gap-4 p-5 md:grid-cols-[1fr_1.5fr_auto] md:items-end">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Department name *</label>
            <input className="field" required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="e.g. Ushering" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Description</label>
            <input className="field" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="What this ministry does" />
          </div>
          <button className="btn-primary justify-center" type="submit" disabled={createMutation.isPending}>
            <Plus size={15} /> {createMutation.isPending ? 'Creating…' : 'Create'}
          </button>
        </form>
      )}

      {groupsQuery.isLoading ? <div className="panel p-8 text-sm text-slate-500">Loading departments…</div> : null}
      {groupsQuery.isError ? <div className="panel p-8 text-sm text-accent-700">Unable to load departments. Please try again.</div> : null}
      {!groupsQuery.isLoading && !groupsQuery.isError && groups.length === 0 ? (
        <div className="panel p-8"><EmptyState icon={UsersRound} label="No departments yet" sublabel="Create the first department to begin assigning members." /></div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {groups.map((group, index) => (
          <article key={group.id} className="panel p-5 transition hover:shadow-md">
            <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${COLORS[index % COLORS.length]}`}>
              <UsersRound size={22} className="text-white" />
            </div>
            <h3 className="text-base font-bold text-slate-900">{group.name}</h3>
            <p className="mt-2 min-h-10 text-sm text-slate-500">{group.description || 'Complete ministry team'}</p>
            <div className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
              <Users size={14} className="text-slate-400" /> <span>{group.member_count} active members</span>
            </div>
            <div className="mt-4 border-t border-slate-100 pt-4">
              <button type="button" className="btn-ghost px-0" onClick={() => navigate(`/groups/${group.id}/members`)}>
                <Users size={14} /> Manage members
              </button>
            </div>
          </article>
        ))}
      </div>

    </section>
  );
}
