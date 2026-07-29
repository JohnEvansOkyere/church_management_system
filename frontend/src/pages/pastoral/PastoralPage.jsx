import { HeartPulse, Plus, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import EmptyState from '../../components/shared/EmptyState';
import PageHeader from '../../components/shared/PageHeader';
import { useMembers } from '../../hooks/useMembers';
import { pastoralService } from '../../services/pastoralService';

const initialForm = { member_id: '', log_type: 'visit', notes: '', log_date: new Date().toISOString().slice(0, 10), follow_up_date: '' };

export default function PastoralPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(initialForm);
  const [showForm, setShowForm] = useState(false);
  const [feedback, setFeedback] = useState('');
  const logsQuery = useQuery({ queryKey: ['pastoral-logs'], queryFn: () => pastoralService.getAll({ status: 'open' }).then((response) => response.data.data) });
  const membersQuery = useMembers({ limit: 100, status: 'active' });
  const createMutation = useMutation({
    mutationFn: (payload) => pastoralService.create(payload),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['pastoral-logs'] }); setForm(initialForm); setShowForm(false); setFeedback('Follow-up log saved.'); },
    onError: (error) => setFeedback(error?.response?.data?.detail || 'Unable to save follow-up log.'),
  });
  const completeMutation = useMutation({
    mutationFn: (id) => pastoralService.update(id, { status: 'completed' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pastoral-logs'] }),
  });
  const members = membersQuery.data?.data || [];
  const logs = logsQuery.data || [];

  function submit(event) {
    event.preventDefault();
    createMutation.mutate({ ...form, follow_up_date: form.follow_up_date || undefined });
  }

  return (
    <section className="space-y-5">
      <PageHeader title="Pastoral Follow-Up" subtitle="Record visits, calls, counselling, prayer, and member care actions." action={<button type="button" className="btn-primary" onClick={() => setShowForm((value) => !value)}><Plus size={15} /> {showForm ? 'Close' : 'Record Follow-Up'}</button>} />
      {feedback && <p className="rounded-xl bg-success-50 px-4 py-3 text-sm font-medium text-success-700 ring-1 ring-success-100">{feedback}</p>}
      {showForm && <form onSubmit={submit} className="panel grid gap-4 p-6 md:grid-cols-2"><div className="md:col-span-2"><label className="mb-1.5 block text-sm font-semibold text-slate-700">Member *</label><select required className="field" value={form.member_id} onChange={(event) => setForm({ ...form, member_id: event.target.value })}><option value="">Select member</option>{members.map((member) => <option key={member.id} value={member.id}>{member.first_name} {member.last_name}</option>)}</select></div><div><label className="mb-1.5 block text-sm font-semibold text-slate-700">Type</label><select className="field" value={form.log_type} onChange={(event) => setForm({ ...form, log_type: event.target.value })}><option value="visit">Visit</option><option value="call">Call</option><option value="counselling">Counselling</option><option value="prayer">Prayer</option><option value="welfare">Welfare</option></select></div><div><label className="mb-1.5 block text-sm font-semibold text-slate-700">Log date</label><input type="date" className="field" value={form.log_date} onChange={(event) => setForm({ ...form, log_date: event.target.value })} /></div><div><label className="mb-1.5 block text-sm font-semibold text-slate-700">Follow-up date</label><input type="date" className="field" value={form.follow_up_date} onChange={(event) => setForm({ ...form, follow_up_date: event.target.value })} /></div><div className="md:col-span-2"><label className="mb-1.5 block text-sm font-semibold text-slate-700">Notes *</label><textarea required className="field min-h-28" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></div><button type="submit" className="btn-primary justify-center" disabled={createMutation.isPending}>{createMutation.isPending ? 'Saving…' : 'Save Follow-Up'}</button></form>}
      {logsQuery.isLoading && <div className="panel p-8 text-sm text-slate-500">Loading follow-ups…</div>}
      {!logsQuery.isLoading && !logs.length && <div className="panel p-8"><EmptyState icon={HeartPulse} label="No open follow-ups" sublabel="New pastoral care records will appear here." /></div>}
      <div className="space-y-3">{logs.map((log) => <article key={log.id} className="panel flex flex-col gap-4 p-5 md:flex-row md:items-start md:justify-between"><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-bold text-slate-900">{log.member_name}</h3><span className="rounded-full bg-church-50 px-2.5 py-1 text-xs font-semibold capitalize text-church-700">{log.log_type}</span></div><p className="mt-2 text-sm text-slate-600">{log.notes}</p><p className="mt-2 text-xs text-slate-400">Logged {log.log_date}{log.follow_up_date ? ` · Follow up ${log.follow_up_date}` : ''}</p></div><button type="button" className="btn-outline" onClick={() => completeMutation.mutate(log.id)}><CheckCircle2 size={15} /> Mark completed</button></article>)}</div>
    </section>
  );
}
