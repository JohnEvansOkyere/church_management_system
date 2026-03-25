import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/members', label: 'Members' },
  { to: '/attendance', label: 'Attendance' },
  { to: '/donations', label: 'Donations' },
  { to: '/groups', label: 'Groups' },
  { to: '/events', label: 'Events' },
  { to: '/communication', label: 'Communication' },
  { to: '/reports', label: 'Reports' },
];

export default function Sidebar() {
  return (
    <aside className="w-full bg-brand-800 px-4 py-5 text-white md:min-h-screen md:w-64">
      <h2 className="text-lg font-bold">Living Spring CMS</h2>
      <nav className="mt-5 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `block rounded-md px-3 py-2 text-sm ${isActive ? 'bg-white/20 font-semibold' : 'hover:bg-white/10'}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
