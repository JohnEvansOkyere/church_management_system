import { CalendarDays, Clock, MapPin, Plus } from 'lucide-react';
import Badge from '../../components/shared/Badge';
import EmptyState from '../../components/shared/EmptyState';
import PageHeader from '../../components/shared/PageHeader';

const PLACEHOLDER_EVENTS = [
  {
    id: 1,
    title: 'Easter Sunday Service',
    date: 'Sun, 20 Apr 2026',
    time: '8:00 AM',
    location: 'Main Auditorium',
    type: 'sunday_service',
    registered: 210,
    capacity: 300,
  },
  {
    id: 2,
    title: 'Youth Retreat 2026',
    date: 'Sat, 26 Apr 2026',
    time: '6:00 AM',
    location: 'Akosombo Conference Centre',
    type: 'special',
    registered: 45,
    capacity: 60,
  },
  {
    id: 3,
    title: 'Midweek Bible Study',
    date: 'Wed, 23 Apr 2026',
    time: '6:30 PM',
    location: 'Fellowship Hall',
    type: 'midweek',
    registered: 88,
    capacity: 120,
  },
];

const TYPE_BADGE_MAP = {
  sunday_service: 'visitor',
  midweek: 'new_convert',
  special: 'followup',
  prayer: 'default',
};

function EventCard({ event }) {
  const pct = event.capacity > 0 ? Math.round((event.registered / event.capacity) * 100) : 0;
  return (
    <article className="panel p-5 transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-brand-50">
          <CalendarDays size={20} className="text-brand-700" />
        </div>
        <Badge variant={TYPE_BADGE_MAP[event.type] ?? 'default'}>{event.type?.replace('_', ' ')}</Badge>
      </div>
      <h3 className="mt-3 text-base font-bold text-slate-900">{event.title}</h3>
      <div className="mt-2 space-y-1">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <CalendarDays size={12} /> {event.date}
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Clock size={12} /> {event.time}
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <MapPin size={12} /> {event.location}
        </div>
      </div>

      {/* Capacity bar */}
      <div className="mt-4">
        <div className="mb-1 flex justify-between text-xs text-slate-500">
          <span>{event.registered} registered</span>
          <span>{event.capacity} capacity</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full ${pct >= 90 ? 'bg-accent-700' : pct >= 70 ? 'bg-church-700' : 'bg-brand-700'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
        <button type="button" className="btn-ghost text-xs px-3 py-1.5">View Details</button>
        <button type="button" className="btn-ghost text-xs px-3 py-1.5">Edit</button>
      </div>
    </article>
  );
}

export default function EventsPage() {
  return (
    <section className="space-y-5">
      <PageHeader
        title="Events & Calendar"
        subtitle="Manage services, special events, and their registrations."
        action={
          <button type="button" className="btn-primary">
            <Plus size={15} />
            Create Event
          </button>
        }
      />

      {/* Coming soon notice */}
      <div className="panel border-l-4 border-church-700 p-5">
        <p className="text-sm font-bold text-church-700">Backend module coming soon</p>
        <p className="mt-1 text-sm text-slate-600">
          The Events API is under development. Below is a preview using sample data.
        </p>
      </div>

      {PLACEHOLDER_EVENTS.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {PLACEHOLDER_EVENTS.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="panel p-8">
          <EmptyState
            icon={CalendarDays}
            label="No events scheduled"
            sublabel="Create your first event to start managing registrations."
            action={
              <button type="button" className="btn-primary">
                <Plus size={14} /> Create Event
              </button>
            }
          />
        </div>
      )}
    </section>
  );
}
