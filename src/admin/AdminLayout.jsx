import { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    LayoutDashboard,
    CalendarCheck,
    Users,
    MessageSquare,
    Globe,
    ChevronDown
} from "lucide-react";

export default function AdminLayout() {
    const { t, i18n } = useTranslation();
    const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

    // Aktif dil etiketini i18n entegrasyonu ile kullanıcı dostu gösterelim
    const currentLanguageLabel = {
        tr: "Türkçe",
        en: "English",
        de: "Deutsch",
        ru: "Русский"
    }[i18n.language] || "English";

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        setIsLangDropdownOpen(false);
    };

    // Menü anahtarlarını JSON dosyalarındaki key'ler ile eşleştiriyoruz
    const menuItems = [
        {
            key: 'dashboard_menu',
            defaultLabel: 'Dashboard',
            path: "/admin",
            icon: LayoutDashboard,
            end: true,
        },
        {
            key: 'reservations_menu',
            defaultLabel: 'Reservations',
            path: "/admin/reservations",
            icon: CalendarCheck,
        },
        {
            key: 'users_menu',
            defaultLabel: 'Users',
            path: "/admin/users",
            icon: Users,
        },
        {
            key: 'chat_logs_menu',
            defaultLabel: 'Chat Logs',
            path: "/admin/chats",
            icon: MessageSquare,
        },
    ];

    return (
        <div className="flex min-h-screen bg-gray-100 dark:bg-slate-950 font-sans">
            {/* SOL MENÜ (SIDEBAR) */}
            <aside className="w-64 border-r border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex-shrink-0">
                {/* LOGO VE MARKA ALANI */}
                <div className="mb-8 flex items-center gap-3 border-b border-gray-100 dark:border-slate-800 pb-5">
                    <img
                        src="/logo.png"
                        alt="Sanny Logo"
                        className="h-10 w-10 flex-shrink-0 object-contain rounded-lg"
                    />
                    <div className="flex flex-col min-w-0">
                        <h1 className="text-xl font-bold tracking-wide text-orange-500 leading-none">Sanny</h1>
                        <span className="text-xs font-medium text-gray-400 dark:text-slate-500 mt-1">
                            {t('admin_panel_title', 'Admin Panel')}
                        </span>
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
                                        ? "bg-orange-50 dark:bg-orange-950/20 font-semibold text-orange-500"
                                        : "text-gray-600 dark:text-slate-350 hover:bg-gray-50 dark:hover:bg-slate-850/50"
                                    }`
                                }
                            >
                                <Icon size={20} />
                                <span className="text-sm">
                                    {t(item.key, item.defaultLabel)}
                                </span>
                            </NavLink>
                        );
                    })}
                </nav>
            </aside>

            {/* SAĞ TARAF: ÜST BAR VE ANA İÇERİK ALANI */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* ÜST BAR (HEADER) */}
                <header className="h-16 border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-8 flex items-center justify-end flex-shrink-0">

                    {/* ADMİNE ÖZEL ŞIK DİL SEÇİCİ DROPDOWN */}
                    <div className="relative">
                        <button
                            onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                            className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-350 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors duration-200 shadow-sm"
                        >
                            <Globe size={16} className="text-gray-500 dark:text-slate-400" />
                            <span>{currentLanguageLabel}</span>
                            <ChevronDown size={14} className={`text-gray-400 dark:text-slate-500 transition-transform duration-200 ${isLangDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isLangDropdownOpen && (
                            <>
                                {/* Arka planı kapatmak için görünmez tıklama alanı */}
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setIsLangDropdownOpen(false)}
                                />

                                <div className="absolute right-0 mt-2 w-40 origin-top-right rounded-xl border border-gray-100 dark:border-slate-850 bg-white dark:bg-slate-900 p-1 shadow-lg ring-1 ring-black/5 dark:ring-white/5 focus:outline-none z-20">
                                    <button
                                        onClick={() => changeLanguage("tr")}
                                        className={`w-full text-left rounded-lg px-3 py-2 text-sm transition-colors ${i18n.language === 'tr' ? 'bg-orange-50 dark:bg-orange-950/20 text-orange-500 font-medium' : 'text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                                    >
                                        Türkçe
                                    </button>
                                    <button
                                        onClick={() => changeLanguage("en")}
                                        className={`w-full text-left rounded-lg px-3 py-2 text-sm transition-colors ${i18n.language === 'en' ? 'bg-orange-50 dark:bg-orange-950/20 text-orange-500 font-medium' : 'text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                                    >
                                        English
                                    </button>
                                    <button
                                        onClick={() => changeLanguage("de")}
                                        className={`w-full text-left rounded-lg px-3 py-2 text-sm transition-colors ${i18n.language === 'de' ? 'bg-orange-50 dark:bg-orange-950/20 text-orange-500 font-medium' : 'text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                                    >
                                        Deutsch
                                    </button>
                                    <button
                                        onClick={() => changeLanguage("ru")}
                                        className={`w-full text-left rounded-lg px-3 py-2 text-sm transition-colors ${i18n.language === 'ru' ? 'bg-orange-50 dark:bg-orange-950/20 text-orange-500 font-medium' : 'text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                                    >
                                        Русский
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </header>

                {/* ANA İÇERİK ALANI */}
                <main className="flex-1 p-8 overflow-y-auto bg-gray-50/50 dark:bg-slate-950">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}