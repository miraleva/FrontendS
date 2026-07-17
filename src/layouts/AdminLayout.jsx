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
        <div className="flex min-h-screen bg-gray-100 font-sans antialiased">
            {/* SOL MENÜ (SIDEBAR) */}
            <aside className="w-64 border-r border-gray-200 bg-white p-5 flex-shrink-0 flex flex-col justify-between">
                <div>
                    {/* LOGO VE MARKA ALANI */}
                    <div className="mb-8 flex items-center gap-3 border-b border-gray-100 pb-5">
                        <img
                            src="logo.png"
                            alt="Sanny Logo"
                            className="h-10 w-10 flex-shrink-0 object-contain rounded-lg"
                        />
                        <div className="flex flex-col min-w-0">
                            <h1 className="text-xl font-bold tracking-wide text-orange-500 leading-none">Sanny</h1>
                            <span className="text-xs font-medium text-gray-400 mt-1.5">Admin Panel</span>
                        </div>
                    </div>

                    {/* NAVİGASYON LİNKLERİ */}
                    <nav className="space-y-1.5">
                        {menuItems.map((item) => {
                            const Icon = item.icon;

                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    end={item.end}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all duration-200 ${isActive
                                            ? "bg-orange-50 font-semibold text-orange-500 shadow-sm shadow-orange-500/5"
                                            : "text-gray-600 hover:bg-gray-50/80 hover:text-gray-900"
                                        }`
                                    }
                                >
                                    <Icon size={18} />
                                    {item.label}
                                </NavLink>
                            );
                        })}
                    </nav>
                </div>
            </aside>

            {/* SAĞ TARAF: ÜST BAR VE ANA İÇERİK ALANI */}
            <div className="flex-1 flex flex-col min-w-0">

                {/* EN ÜST BAR (HEADER) */}
                <header className="h-16 border-b border-gray-200 bg-white px-8 flex items-center justify-between flex-shrink-0 shadow-sm shadow-gray-500/[0.01]">
                    {/* Sol Kısım: Başlık */}
                    <div className="flex items-center">
                        <span className="text-sm font-semibold text-gray-700 tracking-wide">
                            Operations Assistant
                        </span>
                    </div>

                    {/* Sağ Kısım: Durum, Bildirim ve Profil */}
                    <div className="flex items-center gap-4">
                        {/* Servis Durumu */}
                        <div className="flex items-center gap-2 bg-emerald-50/60 px-3 py-1.5 rounded-xl border border-emerald-100/50">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-xs font-semibold text-emerald-700">Services active</span>
                        </div>

                        {/* Ayırıcı Çizgi */}
                        <div className="h-5 w-px bg-gray-200 mx-1"></div>

                        {/* Bildirim İkonu */}
                        <button className="text-gray-400 hover:text-gray-600 hover:bg-gray-50 p-2 rounded-xl transition-colors relative flex items-center justify-center">
                            <Bell size={18} />
                            <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-orange-500 ring-2 ring-white"></span>
                        </button>

                        {/* Profil İkonu */}
                        <button className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-50 border border-gray-100 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all shadow-sm">
                            <User size={16} />
                        </button>
                    </div>
                </header>

                {/* ANA İÇERİK ALANI */}
                <main className="flex-1 p-8 overflow-y-auto bg-gray-50/50">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}