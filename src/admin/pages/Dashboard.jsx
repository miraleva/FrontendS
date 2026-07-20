import { useTranslation } from 'react-i18next';
import {
    CalendarCheck,
    Users,
    MessageSquare,
    Map,
    ArrowUpRight
} from "lucide-react";

export default function Dashboard() {
    const { t } = useTranslation();

    // Tablodaki dinamik turlar için çeviri anahtarları
    const recentReservations = [
        {
            id: "RSV-1001",
            client: "Ayşe Yılmaz",
            tourKey: "tour_cappadocia",
            defaultTour: "Cappadocia Tour",
            date: "18.07.2026"
        },
        {
            id: "RSV-1002",
            client: "Mehmet Demir",
            tourKey: "tour_antalya",
            defaultTour: "Antalya Holiday",
            date: "21.07.2026"
        },
        {
            id: "RSV-1003",
            client: "Zeynep Kaya",
            tourKey: "tour_blacksea",
            defaultTour: "Black Sea Tour",
            date: "23.07.2026"
        },
    ];

    // Üst kartlar - Varsayılan İngilizce fallback ile
    const cards = [
        {
            key: 'total_reservations',
            defaultLabel: 'Total Reservations',
            value: "248",
            badge: "+12%",
            badgeColor: "bg-emerald-50 text-emerald-600",
            icon: CalendarCheck,
        },
        {
            key: 'total_users',
            defaultLabel: 'Total Users',
            value: "1.284",
            badge: "+8%",
            badgeColor: "bg-emerald-50 text-emerald-600",
            icon: Users,
        },
        {
            key: 'active_tours',
            defaultLabel: 'Active Tours',
            value: "24",
            badge: "+3",
            badgeColor: "bg-emerald-50 text-emerald-600",
            icon: Map,
        },
        {
            key: 'chat_messages',
            defaultLabel: 'Chat Messages',
            value: "3.642",
            badge: "+18%",
            badgeColor: "bg-emerald-50 text-emerald-600",
            icon: MessageSquare,
        },
    ];

    return (
        <div className="space-y-8">
            {/* BAŞLIK ALANI */}
            <div className="pb-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                    {t('dashboard_title', 'Dashboard')}
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                    {t('dashboard_subtitle', 'You can monitor system performance and recent transactions here.')}
                </p>
            </div>

            {/* ÜST ÖZET KARTLARI */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                {cards.map((card, index) => {
                    const Icon = card.icon;
                    return (
                        <div
                            key={index}
                            className="rounded-2xl border border-gray-150 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md transition-all duration-200"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="inline-flex rounded-xl bg-orange-50 dark:bg-orange-950/20 p-3 text-orange-500">
                                    <Icon size={24} />
                                </div>
                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${card.badgeColor}`}>
                                    {card.badge}
                                </span>
                            </div>

                            <p className="text-sm font-medium text-gray-400 dark:text-slate-400">
                                {t(card.key, card.defaultLabel)}
                            </p>
                            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                                {card.value}
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* SON REZERVASYONLAR TABLOSU */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-250 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            {t('recent_reservations_title', 'Recent Reservations')}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                            {t('recent_reservations_subtitle', 'The latest reservation records added to the system.')}
                        </p>
                    </div>
                    <button className="text-sm font-semibold text-orange-500 hover:text-orange-600 flex items-center gap-1 transition-colors">
                        {t('view_all', 'View All')} <ArrowUpRight size={16} />
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                            <tr className="bg-gray-50/70 dark:bg-slate-950 border-b border-gray-150 dark:border-slate-800 text-xs font-semibold text-gray-400 dark:text-slate-400 uppercase tracking-wider">
                                <th className="px-6 py-4">{t('table_col_reservation', 'RESERVATION')}</th>
                                <th className="px-6 py-4">{t('table_col_client', 'CLIENT')}</th>
                                <th className="px-6 py-4">{t('table_col_tour', 'TOUR')}</th>
                                <th className="px-6 py-4">{t('table_col_date', 'DATE')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-sm text-gray-700 dark:text-slate-300">
                            {recentReservations.map((res) => (
                                <tr key={res.id} className="hover:bg-gray-50/40 dark:hover:bg-slate-800/40 transition-colors">
                                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{res.id}</td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-slate-300 font-medium">{res.client}</td>
                                    <td className="px-6 py-4 text-gray-500 dark:text-slate-400">
                                        {t(res.tourKey, res.defaultTour)}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 dark:text-slate-400">{res.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}