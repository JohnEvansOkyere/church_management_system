import { NavLink } from 'react-router-dom';

const primaryItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/members', label: 'Members' },
  { to: '/attendance', label: 'Attendance' },
];

const growthItems = [
  { to: '/donations', label: 'Donations' },
  { to: '/groups', label: 'Groups' },
  { to: '/events', label: 'Events' },
  { to: '/communication', label: 'Communication' },
  { to: '/reports', label: 'Reports' },
];

function NavSection({ title, items }) {
  return (
    <div className="mt-6">
      <p className="px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">{title}</p>
      <div className="mt-2 space-y-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `block rounded-xl px-3 py-2.5 text-sm transition ${
                isActive
                  ? 'bg-brand-700 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>
    </div>
  );
}

export default function Sidebar() {
  return (
    <aside className="panel w-full p-4 md:sticky md:top-4 md:h-[calc(100vh-2rem)] md:w-72 md:self-start">
      <div className="rounded-xl bg-gradient-to-r from-brand-700 to-cyan-700 px-4 py-4 text-white">
        <p className="text-xs uppercase tracking-[0.14em] text-white/80">Living Spring</p>
        <h2 className="mt-1 text-lg font-extrabold">Church Management</h2>
        <p className="mt-1 text-xs text-white/80">Operations Console</p>
      </div>

      <NavSection title="Core" items={primaryItems} />
      <NavSection title="Growth" items={growthItems} />
    </aside>
  );
}
