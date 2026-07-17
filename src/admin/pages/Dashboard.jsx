import { useTranslation } from 'react-i18next';
// Dosya yapına göre iki klasör yukarı çıkıp components'e ulaşıyoruz (../../)
import LanguageSelector from "../../components/LanguageSelector";
import {
    CalendarCheck,
    Users,
    MessageSquare,
    Map,
    CheckCircle2,
    Clock,
    ArrowUpRight,
    ArrowRight,
    Bell,
    User
} from "lucide-react";

// Örnek ham veriler
const recentReservations = [
    { id: "RES-101", client: "John Doe", tour: "Cappadocia Balloon Tour", date: "Jul 12, 2026", status: "Confirmed" },
    { id: "RES-102", client: "Alice Smith", tour: "Antalya Old Town Walk", date: "Jul 15, 2026", status: "Pending" },
    { id: "RES-103", client: "Bob Johnson", tour: "Istanbul Bosphorus Cruise", date: "Aug 01, 2026", status: "Confirmed" },
    { id: "RES-104", client: "Emma Watson", tour: "Ephesus Ancient City", date: "Jul 10, 2026", status: "Pending" },
];

const recentChatLogs = [
    { id: 1, user: "User #4821", message: "Is hotel transfer included in Antalya tour?", time: "2 mins ago" },
    { id: 2, user: "User #3912", message: "Can I cancel my booking up to 24 hours?", time: "12 mins ago" },
    { id: 3, user: "User #8824", message: "Looking for a 3-day Cappadocia itinerary.", time: "45 mins ago" },
    { id: 4, user: "User #1105", message: "Are there any discounts for children?", time: "1 hour ago" },
];

export default function Dashboard() {
    const { t } = useTranslation();

    const cards = [
        {
            title: t('total_reservations', 'Total Reservations'),
            value: "248",
            icon: CalendarCheck,
        },
        {
            title: t('total_users', 'Total Users'),
            value: "1,254",
            icon: Users,
        },
        {
            title: t('chat_conversations', 'Chat Conversations'),
            value: "873",
            icon: MessageSquare,
        },
        {
            title: t('active_tours', 'Active Tours'),
            value: "32",
            icon: Map,
        },
    ];

    return (
        <div className="space-y-8">
            {/* BAŞLIK ALANI & SAĞ KÖŞE AKSİYONLARI */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                        {t('admin_dashboard_title', 'Admin Dashboard')}
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        {t('admin_dashboard_subtitle', 'Manage reservation, chatbot, users and tour data from here.')}
                    </p>
                </div>

                {/* Sağ Üst Köşe: Dil, Bildirim ve Profil */}
                <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-2xl border border-gray-200 shadow-sm self-start sm:self-auto flex-shrink-0">
                    {/* Dil Seçici */}
                    <div className="relative z-50">
                        <LanguageSelector />
                    </div>

                    <div className="h-4 w-px bg-gray-200"></div>

                    {/* Bildirim */}
                    <button className="text-gray-400 hover:text-gray-600 relative p-1 rounded-lg hover:bg-gray-50 transition-colors">
                        <Bell size={20} />
                        <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-orange-500"></span>
                    </button>

                    {/* Profil */}
                    <button className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                        <User size={18} />
                    </button>
                </div>
            </div>

            {/* ÜST ÖZET KARTLARI */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                {cards.map((card) => {
                    const Icon = card.icon;

                    return (
                        <div
                            key={card.title}
                            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-200"
                        >
                            <div className="mb-4 inline-flex rounded-xl bg-orange-50 p-3 text-orange-500">
                                <Icon size={24} />
                            </div>

                            <p className="text-sm font-medium text-gray-500">{card.title}</p>
                            <p className="mt-2 text-3xl font-bold text-gray-900 tracking-tight">
                                {card.value}
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* ALT ALAN: TABLO VE CANLI SOHBET AKIŞI */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* SON REZERVASYONLAR TABLOSU */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col justify-between">
                    <div>
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">
                                    {t('recent_reservations_title', 'Recent Reservations')}
                                </h3>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {t('recent_reservations_subtitle', 'Latest bookings made by clients')}
                                </p>
                            </div>
                            <button className="text-sm font-semibold text-orange-500 hover:text-orange-600 flex items-center gap-1 transition-colors">
                                {t('view_all', 'View All')} <ArrowUpRight size={16} />
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[500px]">
                                <thead>
                                    <tr className="bg-gray-50/70 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        <th className="px-6 py-4">{t('table_id', 'ID')}</th>
                                        <th className="px-6 py-4">{t('table_client', 'Client')}</th>
                                        <th className="px-6 py-4">{t('table_tour', 'Tour')}</th>
                                        <th className="px-6 py-4 text-right pr-10">{t('table_status', 'Status')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                                    {recentReservations.map((res) => (
                                        <tr key={res.id} className="hover:bg-gray-50/40 transition-colors">
                                            <td className="px-6 py-4 font-semibold text-gray-900">{res.id}</td>
                                            <td className="px-6 py-4 text-gray-600">{res.client}</td>
                                            <td className="px-6 py-4 text-gray-500 max-w-[180px] truncate">{res.tour}</td>
                                            <td className="px-6 py-4 text-right pr-10">
                                                {res.status === "Confirmed" ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                                                        <CheckCircle2 size={12} /> {t('status_confirmed', 'Confirmed')}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                                                        <Clock size={12} /> {t('status_pending', 'Pending')}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* SAĞ KISIM: CANLI SOHBET AKIŞI */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col justify-between">
                    <div>
                        <div className="border-b border-gray-100 pb-4 mb-4">
                            <h3 className="text-lg font-bold text-gray-900">
                                {t('recent_chat_logs_title', 'Recent Chat Logs')}
                            </h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {t('recent_chat_logs_subtitle', 'Live user questions from Sanny AI')}
                            </p>
                        </div>

                        <div className="space-y-4">
                            {recentChatLogs.map((log) => (
                                <div key={log.id} className="group p-3 rounded-xl border border-gray-50 bg-gray-50/30 hover:bg-orange-50/20 hover:border-orange-100 transition-all duration-200">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-bold text-gray-800">{log.user}</span>
                                        <span className="text-[10px] text-gray-400 font-medium">{log.time}</span>
                                    </div>
                                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed italic">
                                        "{log.message}"
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button className="w-full mt-5 py-2.5 border border-gray-100 hover:border-orange-200 rounded-xl text-xs font-bold text-gray-600 hover:text-orange-500 bg-white hover:bg-orange-50/10 transition-all duration-200 flex items-center justify-center gap-1">
                        {t('open_chat_center', 'Open Chat Center')} <ArrowRight size={14} />
                    </button>
                </div>

            </div>
        </div>
    );
}