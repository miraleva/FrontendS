import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
    CalendarCheck,
    Users,
    MessageSquare,
    ArrowUpRight,
} from "lucide-react";
import api from "../../services/api.js";

export default function Dashboard() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [stats, setStats] = useState({
        totalReservations: 0,
        totalUsers: 0,
        totalChatMessages: 0,
        recentReservations: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const token = localStorage.getItem('token') || sessionStorage.getItem('token') || localStorage.getItem('adminToken') || "";
        api.get('/api/admin/dashboard/stats', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(res => {
                if (res.data) {
                    setStats({
                        totalReservations: res.data.totalReservations ?? 0,
                        totalUsers: res.data.totalUsers ?? 0,
                        totalChatMessages: res.data.totalChatMessages ?? 0,
                        recentReservations: Array.isArray(res.data.recentReservations) ? res.data.recentReservations : []
                    });
                }
            })
            .catch(err => {
                console.error("Dashboard stats error:", err);
                setStats({
                    totalReservations: 0,
                    totalUsers: 0,
                    totalChatMessages: 0,
                    recentReservations: []
                });
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const cards = [
        {
            key: "total_reservations",
            defaultLabel: "Total Reservations",
            value: stats.totalReservations,
            badge: "+12%",
            badgeColor: "bg-emerald-50 text-emerald-600",
            icon: CalendarCheck,
        },
        {
            key: "total_users",
            defaultLabel: "Total Users",
            value: stats.totalUsers,
            badge: "+8%",
            badgeColor: "bg-emerald-50 text-emerald-600",
            icon: Users,
        },
        {
            key: "chat_messages",
            defaultLabel: "Chat Messages",
            value: stats.totalChatMessages,
            badge: "+18%",
            badgeColor: "bg-emerald-50 text-emerald-600",
            icon: MessageSquare,
        },
    ];

    return (
        <div className="space-y-8">
            <div className="pb-2">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                    {t("dashboard_title", "Dashboard")}
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                    {t(
                        "dashboard_subtitle",
                        "You can monitor system performance and recent transactions here."
                    )}
                </p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {cards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <div
                            key={card.key}
                            className="rounded-2xl border border-gray-150 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                        >
                            <div className="mb-4 flex items-center justify-between">
                                <div className="inline-flex rounded-xl bg-orange-50 p-3 text-orange-500 dark:bg-orange-950/20">
                                    <Icon size={24} />
                                </div>
                                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${card.badgeColor}`}>
                                    {card.badge}
                                </span>
                            </div>

                            <p className="text-sm font-medium text-gray-400 dark:text-slate-400">
                                {t(card.key, card.defaultLabel)}
                            </p>
                            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                                {loading ? (
                                    <span className="h-8 w-16 inline-block animate-pulse rounded bg-gray-200 dark:bg-slate-800" />
                                ) : (
                                    card.value
                                )}
                            </p>
                        </div>
                    );
                })}
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-250 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between border-b border-gray-100 p-6 dark:border-slate-800">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            {t("recent_reservations_title", "Recent Reservations")}
                        </h3>
                        <p className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">
                            {t(
                                "recent_reservations_subtitle",
                                "The latest reservation records added to the system."
                            )}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate("/admin/reservations")}
                        className="relative z-10 flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-sm font-semibold text-orange-500 transition-colors hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-950/20"
                    >
                        {t("view_all", "View All")}
                        <ArrowUpRight size={16} />
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px] border-collapse text-left">
                        <thead>
                            <tr className="border-b border-gray-150 bg-gray-50/70 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                                <th className="px-6 py-4">{t("table_col_reservation", "RESERVATION")}</th>
                                <th className="px-6 py-4">{t("table_col_client", "CLIENT")}</th>
                                <th className="px-6 py-4">{t("table_col_tour", "TOUR")}</th>
                                <th className="px-6 py-4">{t("table_col_date", "DATE")}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm text-gray-700 dark:divide-slate-800 dark:text-slate-300">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-10 text-center text-gray-400">
                                        <span className="inline-block animate-pulse">{t("common.loading", "Loading...")}</span>
                                    </td>
                                </tr>
                            ) : (
                                stats.recentReservations && stats.recentReservations.length > 0 ? (
                                    stats.recentReservations.map((res) => (
                                        <tr
                                            key={res.id}
                                            className="transition-colors hover:bg-gray-50/40 dark:hover:bg-slate-800/40"
                                        >
                                            <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                                                {res.reservationNumber || res.id}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-600 dark:text-slate-300">
                                                {res.clientName || res.userFullName || res.customer || "Guest"}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 dark:text-slate-400">
                                                {res.tourName || res.tour || "-"}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 dark:text-slate-400">
                                                {res.date}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-10 text-center text-gray-500 dark:text-slate-400">
                                            {t("no_reservations", "Henüz rezervasyon bulunmuyor.")}
                                        </td>
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}