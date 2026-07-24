import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useTheme } from "../components/ThemeContext.jsx";
import {
    LayoutDashboard,
    CalendarCheck,
    Users,
    MessageSquare,
    Globe,
    ChevronDown,
    Sun,
    Moon,
    LogOut
} from "lucide-react";

export default function AdminLayout() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();

    const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

    const isDarkMode = theme === "dark";

    const currentLanguageLabel = {
        tr: "TR",
        en: "EN",
        de: "DE",
        ru: "RU"
    }[i18n.language?.split("-")[0]] || "EN";

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        setIsLangDropdownOpen(false);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");

        sessionStorage.clear();

        navigate("/login", { replace: true });
    };

    const menuItems = [
        {
            key: "dashboard_menu",
            defaultLabel: "Dashboard",
            path: "/admin",
            icon: LayoutDashboard,
            end: true,
        },
        {
            key: "reservations_menu",
            defaultLabel: "Reservations",
            path: "/admin/reservations",
            icon: CalendarCheck,
        },
        {
            key: "users_menu",
            defaultLabel: "Users",
            path: "/admin/users",
            icon: Users,
        },
        {
            key: "chat_logs_menu",
            defaultLabel: "Chat Logs",
            path: "/admin/chats",
            icon: MessageSquare,
        },
    ];

    const languages = [
        { code: "tr", label: "Türkçe" },
        { code: "en", label: "English" },
        { code: "de", label: "Deutsch" },
        { code: "ru", label: "Русский" },
    ];

    return (
        <div className="min-h-screen bg-gray-100 font-sans dark:bg-slate-950">
            {/* SOL MENÜ */}
            <aside className="fixed inset-y-0 left-0 z-50 flex h-screen w-64 flex-col overflow-hidden border-r border-gray-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                {/* LOGO VE MARKA */}
                <div className="mb-8 flex items-center gap-3 border-b border-gray-100 pb-5 dark:border-slate-800">
                    <img
                        src="/logo.png"
                        alt="Sanny Logo"
                        className="h-10 w-10 flex-shrink-0 rounded-lg object-contain"
                    />

                    <div className="flex min-w-0 flex-col">
                        <h1 className="text-xl font-bold leading-none tracking-wide text-orange-500">
                            Sanny
                        </h1>

                        <span className="mt-1 text-xs font-medium text-gray-400 dark:text-slate-500">
                            {t("admin_panel_title", "Admin Panel")}
                        </span>
                    </div>
                </div>

                {/* NAVİGASYON */}
                <nav className="flex-1 space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.end}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 rounded-xl px-4 py-3 transition-colors duration-200 ${isActive
                                        ? "bg-orange-50 font-semibold text-orange-500 dark:bg-orange-950/20"
                                        : "text-gray-600 hover:bg-gray-50 dark:text-slate-400 dark:hover:bg-slate-800/60"
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

                {/* SOL ALT BUTONLAR */}
                <div className="relative mt-auto border-t border-gray-100 pt-4 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                        {/* DİL */}
                        <div className="relative min-w-0 flex-1">
                            <button
                                type="button"
                                onClick={() =>
                                    setIsLangDropdownOpen((previousState) => !previousState)
                                }
                                title={t("change_language", "Dil değiştir")}
                                className="flex h-11 w-full items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-2 text-sm font-medium text-gray-600 transition-colors hover:border-orange-400 hover:text-orange-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-orange-500 dark:hover:text-orange-500"
                            >
                                <Globe size={17} />

                                <span>{currentLanguageLabel}</span>

                                <ChevronDown
                                    size={14}
                                    className={`transition-transform duration-200 ${isLangDropdownOpen ? "rotate-180" : ""
                                        }`}
                                />
                            </button>

                            {isLangDropdownOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-30"
                                        onClick={() => setIsLangDropdownOpen(false)}
                                    />

                                    <div className="absolute bottom-full left-0 z-40 mb-2 w-40 overflow-hidden rounded-xl border border-gray-200 bg-white p-1 shadow-xl dark:border-slate-700 dark:bg-slate-800">
                                        {languages.map((language) => {
                                            const isActive =
                                                i18n.language?.split("-")[0] === language.code;

                                            return (
                                                <button
                                                    key={language.code}
                                                    type="button"
                                                    onClick={() => changeLanguage(language.code)}
                                                    className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${isActive
                                                        ? "bg-orange-50 font-medium text-orange-500 dark:bg-orange-950/30"
                                                        : "text-gray-700 hover:bg-gray-50 dark:text-slate-300 dark:hover:bg-slate-700"
                                                        }`}
                                                >
                                                    {language.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* DARK / LIGHT MODE */}
                        <button
                            type="button"
                            onClick={toggleTheme}
                            title={
                                isDarkMode
                                    ? t("light_mode", "Açık moda geç")
                                    : t("dark_mode", "Karanlık moda geç")
                            }
                            aria-label={
                                isDarkMode
                                    ? t("light_mode", "Açık moda geç")
                                    : t("dark_mode", "Karanlık moda geç")
                            }
                            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition-colors hover:border-orange-400 hover:text-orange-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-orange-500 dark:hover:text-orange-500"
                        >
                            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                        </button>

                        {/* ÇIKIŞ */}
                        <button
                            type="button"
                            onClick={handleLogout}
                            title={t("logout", "Çıkış yap")}
                            aria-label={t("logout", "Çıkış yap")}
                            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition-colors hover:border-red-400 hover:bg-red-50 hover:text-red-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-red-500 dark:hover:bg-red-950/20 dark:hover:text-red-400"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* SAĞ TARAF */}
            <div className="ml-64 flex h-screen min-w-0 flex-col overflow-hidden">
                {/* ÜST BAR */}
                <header className="h-16 flex-shrink-0 border-b border-gray-200 bg-white px-8 dark:border-slate-800 dark:bg-slate-900" />

                {/* ANA İÇERİK */}
                <main className="min-h-0 flex-1 overflow-y-auto bg-gray-50/50 p-8 dark:bg-slate-950">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}