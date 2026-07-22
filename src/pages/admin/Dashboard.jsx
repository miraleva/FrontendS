import {
    CalendarCheck,
    Users,
    Map,
    MessageSquare,
    ArrowUpRight,
    Clock,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const statisticsData = [
    {
        key: 'dashboard.stats.totalReservations',
        value: '248',
        change: '+12%',
        icon: CalendarCheck,
    },
    {
        key: 'dashboard.stats.totalUsers',
        value: '1.284',
        change: '+8%',
        icon: Users,
    },
    {
        key: 'dashboard.stats.activeTour',
        value: '24',
        change: '+3',
        icon: Map,
    },
    {
        key: 'dashboard.stats.chatMessage',
        value: '3.642',
        change: '+18%',
        icon: MessageSquare,
    },
];

const recentReservationsData = [
    {
        id: 'RSV-1001',
        customer: 'Ayşe Yılmaz',
        tour: 'Kapadokya Turu',
        date: '18.07.2026',
        total: '12.500 TL',
        statusKey: 'dashboard.status.approved',
    },
    {
        id: 'RSV-1002',
        customer: 'Mehmet Demir',
        tour: 'Antalya Tatili',
        date: '21.07.2026',
        total: '18.750 TL',
        statusKey: 'dashboard.status.pending',
    },
    {
        id: 'RSV-1003',
        customer: 'Zeynep Kaya',
        tour: 'Karadeniz Turu',
        date: '23.07.2026',
        total: '15.200 TL',
        statusKey: 'dashboard.status.approved',
    },
    {
        id: 'RSV-1004',
        customer: 'Emre Arslan',
        tour: 'İstanbul Kültür Turu',
        date: '27.07.2026',
        total: '8.400 TL',
        statusKey: 'dashboard.status.cancelled',
    },
];

export default function Dashboard() {
    const { t } = useTranslation();

    function getStatusClass(statusKey) {
        if (statusKey === 'dashboard.status.approved') {
            return 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300';
        }
        if (statusKey === 'dashboard.status.pending') {
            return 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300';
        }
        return 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400';
    }

    return (
        <div className="space-y-8">
            {/* BAŞLIK ALANI */}
            <div className="pb-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                    {t('dashboard.title', 'Kontrol Paneli')}
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                    {t('dashboard.subtitle', 'Sistem performansını ve son işlemleri buradan takip edebilirsiniz.')}
                </p>
            </div>

            {/* İstatistik kartları */}
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {statisticsData.map((item) => {
                    const Icon = item.icon;

                    return (
                        <div
                            key={item.key}
                            className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-950/20 text-orange-500">
                                    <Icon size={21} />
                                </div>

                                <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                    {item.change}
                                </span>
                            </div>

                            <p className="mt-5 text-sm text-gray-500 dark:text-slate-400">
                                {t(item.key)}
                            </p>

                            <h2 className="mt-1 text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                                {item.value}
                            </h2>
                        </div>
                    );
                })}
            </div>

            <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
                {/* Son rezervasyonlar */}
                <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                    <div className="relative z-20 flex items-center justify-between border-b border-gray-100 dark:border-slate-800 px-6 py-5">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {t('dashboard.recentReservations.title', 'Son Rezervasyonlar')}
                            </h2>

                            <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                                {t('dashboard.recentReservations.subtitle', 'Sisteme eklenen son rezervasyon kayıtları.')}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                window.location.href = "/admin/reservations";
                            }}
                            className="relative z-30 flex cursor-pointer items-center gap-2 text-sm font-semibold text-orange-500 transition-colors hover:text-orange-600 pointer-events-auto"
                        >
                            {t('dashboard.recentReservations.viewAll', 'Tümünü Görüntüle')}
                            <ArrowUpRight size={17} />
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[760px] text-left">
                            <thead className="bg-gray-50 dark:bg-slate-950 text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">
                                <tr>
                                    <th className="px-6 py-4">{t('dashboard.recentReservations.columns.reservation', 'Rezervasyon')}</th>
                                    <th className="px-6 py-4">{t('dashboard.recentReservations.columns.customer', 'Müşteri')}</th>
                                    <th className="px-6 py-4">{t('dashboard.recentReservations.columns.tour', 'Tur')}</th>
                                    <th className="px-6 py-4">{t('dashboard.recentReservations.columns.date', 'Tarih')}</th>
                                    <th className="px-6 py-4">{t('dashboard.recentReservations.columns.total', 'Tutar')}</th>
                                    <th className="px-6 py-4">{t('dashboard.recentReservations.columns.status', 'Durum')}</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-sm text-gray-600 dark:text-slate-300">
                                {recentReservationsData.map((reservation) => (
                                    <tr
                                        key={reservation.id}
                                        className="hover:bg-gray-50/40 dark:hover:bg-slate-800/40 transition-colors"
                                    >
                                        <td className="px-6 py-4 font-semibold text-gray-800 dark:text-slate-200">
                                            {reservation.id}
                                        </td>

                                        <td className="px-6 py-4 font-medium text-gray-800 dark:text-slate-200">
                                            {reservation.customer}
                                        </td>

                                        <td className="px-6 py-4 text-gray-500 dark:text-slate-400">
                                            {reservation.tour}
                                        </td>

                                        <td className="px-6 py-4 text-gray-500 dark:text-slate-400">
                                            {reservation.date}
                                        </td>

                                        <td className="px-6 py-4 font-medium text-gray-800 dark:text-slate-200">
                                            {reservation.total}
                                        </td>

                                        <td className="px-6 py-4">
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                                                    reservation.statusKey
                                                )}`}
                                            >
                                                {t(reservation.statusKey)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Hızlı işlemler */}
                <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {t('dashboard.quickActions.title', 'Hızlı İşlemler')}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                        {t('dashboard.quickActions.subtitle', 'Sık kullanılan yönetim işlemleri.')}
                    </p>

                    <div className="mt-6 space-y-3">
                        <button
                            type="button"
                            className="flex w-full items-center gap-3 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-slate-200 hover:border-orange-200 dark:hover:border-orange-500/40 hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-colors"
                        >
                            <CalendarCheck size={19} className="text-orange-500" />
                            {t('dashboard.quickActions.viewNewReservation', 'Yeni rezervasyon görüntüle')}
                        </button>

                        <button
                            type="button"
                            className="flex w-full items-center gap-3 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-955 px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-slate-200 hover:border-orange-200 dark:hover:border-orange-500/40 hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-colors"
                        >
                            <Users size={19} className="text-orange-500" />
                            {t('dashboard.quickActions.manageUsers', 'Kullanıcıları yönet')}
                        </button>

                        <button
                            type="button"
                            className="flex w-full items-center gap-3 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-955 px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-slate-200 hover:border-orange-200 dark:hover:border-orange-500/40 hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-colors"
                        >
                            <Map size={19} className="text-orange-500" />
                            {t('dashboard.quickActions.addNewTour', 'Yeni tur ekle')}
                        </button>
                    </div>

                    <div className="mt-6 rounded-xl bg-gray-50 dark:bg-slate-850/50 p-4 border border-slate-100 dark:border-slate-800/40">
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-slate-200">
                            <Clock size={17} className="text-orange-500" />
                            {t('dashboard.quickActions.lastUpdate', 'Son güncelleme')}
                        </div>

                        <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
                            16 Temmuz 2026, 11:25
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}