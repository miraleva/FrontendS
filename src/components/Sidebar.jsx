import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/chat', label: 'Chat' },
  { to: '/documents', label: 'Dokuman Yonetimi' },
  { to: '/history', label: 'Gecmis Operasyonlar' }
];

export default function Sidebar() {
  return (
    <aside className="w-[240px] bg-secondary text-white flex-shrink-0 hidden lg:flex lg:flex-col">
      <div className="px-6 py-5 font-display font-semibold text-lg border-b border-white/10">
        Turizm AI
      </div>
      <nav className="flex flex-col gap-1 p-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `px-3 py-2 rounded-btn text-sm font-medium transition-colors ${isActive ? 'bg-primary text-white' : 'text-white/70 hover:bg-white/10'}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
