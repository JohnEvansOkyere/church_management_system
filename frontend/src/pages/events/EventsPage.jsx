import { CalendarDays, Clock, MapPin, Plus, Send, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import PageHeader from '../../components/shared/PageHeader';
import { eventsService } from '../../services/eventsService';

const initialForm = { title: '', description: '', location: '', start_datetime: '', end_datetime: '', max_capacity: '', is_recurring: false, recurrence_rule: 'WEEKLY' };

function formatDate(value) {
  return value ? new Intl.DateTimeFormat('en-GH', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '—';
}

function errorMessage(error) {
  return error?.response?.data?.detail || 'Something went wrong. Please try again.';
}

export default function EventsPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [feedback, setFeedback] = useState(null);
  const eventsQuery = useQuery({
    queryKey: ['events'],
    queryFn: () => eventsService.getAll({ upcoming_only: false }).then((response) => response.data.data),
  });
  const createMutation = useMutation({
    mutationFn: (payload) => eventsService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setForm(initialForm);
      setShowCreate(false);
      setFeedback({ type: 'success', text: 'Event created successfully.' });
    },
    onError: (error) => setFeedback({ type: 'error', text: errorMessage(error) }),
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => eventsService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
    onError: (error) => setFeedback({ type: 'error', text: errorMessage(error) }),
  });
  const remindMutation = useMutation({
    mutationFn: (id) => eventsService.remind(id),
    onSuccess: (response) => setFeedback({ type: 'success', text: `${response.data.data.successful_count} reminder SMS message(s) sent.` }),
    onError: (error) => setFeedback({ type: 'error', text: errorMessage(error) }),
  });

  function submit(event) {
    event.preventDefault();
    setFeedback(null);
    createMutation.mutate({
      ...form,
      start_datetime: new Date(form.start_datetime).toISOString(),
      end_datetime: form.end_datetime ? new Date(form.end_datetime).toISOString() : undefined,
      max_capacity: form.max_capacity ? Number(form.max_capacity) : undefined,
    });
  }

  const events = eventsQuery.data || [];
  return (
    <section className="space-y-5">
      <PageHeader
        title="Events & Calendar"
        subtitle="Manage services, special events, registrations, and reminders."
        action={<button type="button" className="btn-primary" onClick={() => setShowCreate((value) => !value)}>{showCreate ? <X size={15} /> : <Plus size={15} />} {showCreate ? 'Close' : 'Create Event'}</button>}
      />
      {feedback && <p className={`rounded-xl px-4 py-3 text-sm font-medium ring-1 ${feedback.type === 'error' ? 'bg-accent-50 text-accent-700 ring-accent-100' : 'bg-success-50 text-success-700 ring-success-100'}`}>{feedback.text}</p>}
      {showCreate && <form onSubmit={submit} className="panel grid gap-4 p-6 md:grid-cols-2">
        <div className="md:col-span-2"><label className="mb-1.5 block text-sm font-semibold text-slate-700">Title *</label><input required className="field" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Sunday Service" /></div>
        <div><label className="mb-1.5 block text-sm font-semibold text-slate-700">Start *</label><input required type="datetime-local" className="field" value={form.start_datetime} onChange={(event) => setForm({ ...form, start_datetime: event.target.value })} /></div>
        <div><label className="mb-1.5 block text-sm font-semibold text-slate-700">End</label><input type="datetime-local" className="field" value={form.end_datetime} onChange={(event) => setForm({ ...form, end_datetime: event.target.value })} /></div>
        <div><label className="mb-1.5 block text-sm font-semibold text-slate-700">Location</label><input className="field" value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} placeholder="Main auditorium" /></div>
        <div><label className="mb-1.5 block text-sm font-semibold text-slate-700">Capacity</label><input type="number" min="1" className="field" value={form.max_capacity} onChange={(event) => setForm({ ...form, max_capacity: event.target.value })} placeholder="Optional" /></div>
        <div className="md:col-span-2"><label className="mb-1.5 block text-sm font-semibold text-slate-700">Description</label><textarea className="field min-h-24" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></div>
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700"><input type="checkbox" checked={form.is_recurring} onChange={(event) => setForm({ ...form, is_recurring: event.target.checked })} className="accent-brand-700" /> Recurring event</label>
        <button type="submit" className="btn-primary justify-center" disabled={createMutation.isPending}>{createMutation.isPending ? 'Saving…' : 'Save Event'}</button>
      </form>}
      {eventsQuery.isLoading && <div className="panel p-8 text-sm text-slate-500">Loading events…</div>}
      {eventsQuery.isError && <div className="panel p-8 text-sm text-accent-700">Unable to load events.</div>}
      {!eventsQuery.isLoading && !events.length && <div className="panel p-8 text-center text-sm text-slate-500">No events have been created yet.</div>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{events.map((event) => (
        <article key={event.id} className="panel p-5">
          <div className="flex items-start justify-between gap-3"><div className="rounded-2xl bg-brand-50 p-3 text-brand-700"><CalendarDays size={20} /></div>{event.is_recurring && <span className="rounded-full bg-church-50 px-2.5 py-1 text-xs font-semibold text-church-700">Recurring</span>}</div>
          <h3 className="mt-4 text-base font-bold text-slate-900">{event.title}</h3>
          <div className="mt-3 space-y-2 text-sm text-slate-500"><p className="flex items-center gap-2"><Clock size={14} /> {formatDate(event.start_datetime)}</p><p className="flex items-center gap-2"><MapPin size={14} /> {event.location || 'Location not set'}</p><p>{event.registration_count} registered{event.max_capacity ? ` of ${event.max_capacity}` : ''}</p></div>
          <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4"><button type="button" className="btn-ghost px-0" onClick={() => remindMutation.mutate(event.id)} disabled={!event.registration_count || remindMutation.isPending}><Send size={14} /> Remind</button><button type="button" className="btn-ghost px-0 text-accent-700 hover:bg-accent-50" onClick={() => deleteMutation.mutate(event.id)}><Trash2 size={14} /> Delete</button></div>
        </article>
      ))}</div>
    </section>
  );
}
