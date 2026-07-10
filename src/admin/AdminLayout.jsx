import { Outlet, NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    CalendarCheck,
    Users,
    MessageSquare,
    Map,
    Bell,
    User
} from "lucide-react";

const menuItems = [
    {
        label: "Dashboard",
        path: "/admin",
        icon: LayoutDashboard,
        end: true,
    },
    {
        label: "Reservations",
        path: "/admin/reservations",
        icon: CalendarCheck,
    },
    {
        label: "Users",
        path: "/admin/users",
        icon: Users,
    },
    {
        label: "Chat Logs",
        path: "/admin/chats",
        icon: MessageSquare,
    },
    {
        label: "Tours",
        path: "/admin/tours",
        icon: Map,
    },
];

export default function AdminLayout() {
    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* SOL MENÜ (SIDEBAR) */}
            <aside className="w-64 border-r border-gray-200 bg-white p-5 flex-shrink-0">
                {/* LOGO VE MARKA ALANI */}
                <div className="mb-8 flex items-center gap-3 border-b border-gray-100 pb-5">
                    <img
                        src="logo.png"
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
                                    `flex items-center gap-3 rounded-xl px-4 py-3 ${isActive
                                        ? "bg-orange-50 font-semibold text-orange-500"
                                        : "text-gray-600 hover:bg-gray-50"
                                    }`
                                }
                            >
                                <Icon size={20} />
                                {item.label}
                            </NavLink>
                        );
                    })}
                </nav>
            </aside>

            {/* SAĞ TARAF: ÜST BAR VE ANA İÇERİK ALANI */}
            <div className="flex-1 flex flex-col min-w-0">

                {/* EN ÜST BAR (HEADER) - İNGİLİZCEYE ÇEVRİLDİ */}
                <header className="h-16 border-b border-gray-200 bg-white px-8 flex items-center justify-between flex-shrink-0">
                    {/* Sol Kısım: Başlık */}
                    <span className="text-sm font-semibold text-gray-600">
                        Operations Assistant
                    </span>

                    {/* Sağ Kısım: Durum, Bildirim ve Profil */}
                    <div className="flex items-center gap-5">
                        {/* Servis Durumu */}
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-xs font-medium text-gray-500">Services active</span>
                        </div>

                        {/* Ayırıcı Çizgi */}
                        <div className="h-4 w-px bg-gray-200"></div>

                        {/* Bildirim İkonu */}
                        <button className="text-gray-400 hover:text-gray-600 relative">
                            <Bell size={20} />
                            <span className="absolute top-0 right-0 h-1.5 w-1.5 rounded-full bg-orange-500"></span>
                        </button>

                        {/* Profil İkonu */}
                        <button className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200">
                            <User size={18} />
                        </button>
                    </div>
                </header>

                {/* ANA İÇERİK ALANI (SAYFALARIN GÖRÜNECEĞİ YER) */}
                <main className="flex-1 p-8 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}