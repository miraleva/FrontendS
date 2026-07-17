import { Outlet, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    LayoutDashboard,
    CalendarCheck,
    Users,
    MessageSquare,
    Map
} from "lucide-react";

export default function AdminLayout() {
    const { t } = useTranslation();

    const menuItems = [
        {
            label: t('dashboard_menu', 'Dashboard'),
            path: "/admin",
            icon: LayoutDashboard,
            end: true,
        },
        {
            label: t('reservations_menu', 'Reservations'),
            path: "/admin/reservations",
            icon: CalendarCheck,
        },
        {
            label: t('users_menu', 'Users'),
            path: "/admin/users",
            icon: Users,
        },
        {
            label: t('chat_logs_menu', 'Chat Logs'),
            path: "/admin/chats",
            icon: MessageSquare,
        },
        {
            label: t('tours_menu', 'Tours'),
            path: "/admin/tours",
            icon: Map,
        },
    ];

    return (
        <div className="flex min-h-screen bg-gray-100 font-sans">
            {/* SOL MENÜ (SIDEBAR) */}
            <aside className="w-64 border-r border-gray-200 bg-white p-5 flex-shrink-0">
                {/* LOGO VE MARKA ALANI */}
                <div className="mb-8 flex items-center gap-3 border-b border-gray-100 pb-5">
                    <img
                        src="/logo.png"
                        alt="Sanny Logo"
                        className="h-10 w-10 flex-shrink-0 object-contain rounded-lg"
                    />
                    <div className="flex flex-col min-w-0">
                        <h1 className="text-xl font-bold tracking-wide text-orange-500 leading-none">Sanny</h1>
                        <span className="text-xs font-medium text-gray-400 mt-1">Admin Panel</span>
                    </div>
                </div>

                {/* NAVİGASYON LİNKLERİ */}
                <nav className="space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.end}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 rounded-xl px-4 py-3 transition-colors duration-200 ${isActive
                                        ? "bg-orange-50 font-semibold text-orange-500"
                                        : "text-gray-600 hover:bg-gray-50"
                                    }`
                                }
                            >
                                <Icon size={20} />
                                <span className="text-sm">{item.label}</span>
                            </NavLink>
                        );
                    })}
                </nav>
            </aside>

            {/* SAĞ TARAF: SADECE ANA İÇERİK ALANI */}
            <div className="flex-1 flex flex-col min-w-0">
                <main className="flex-1 p-8 overflow-y-auto bg-gray-50/50">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}