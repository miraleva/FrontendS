import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // 1. i18n hook'unu import ediyoruz

export default function Sidebar() {
  const { t } = useTranslation(); // 2. Çeviri fonksiyonunu tanımlıyoruz

  // 3. Menü elemanlarını yeni dil anahtarlarıyla bağlıyoruz
  const navItems = [
    { to: '/chat', label: t('sidebar_chat') },
    { to: '/documents', label: t('sidebar_documents') },
    { to: '/history', label: t('sidebar_history') }
  ];

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
