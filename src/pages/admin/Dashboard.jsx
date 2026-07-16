import {
    CalendarCheck,
    Users,
    MessageSquare,
    Map,
    CheckCircle2,
    Clock,
    ArrowUpRight,
    ArrowRight,
    TrendingUp,
    TrendingDown,
    Eye,
    Check
} from "lucide-react";

// Üst Özet Kartları - Trend göstergeleri (change, isPositive) eklendi
const cards = [
    {
        title: "Total Reservations",
        value: "248",
        change: "+12.5%",
        isPositive: true,
        icon: CalendarCheck,
        link: "/reservations" // Yönlendirme için link eklendi
    },
    {
        title: "Total Users",
        value: "1,254",
        change: "+8.2%",
        isPositive: true,
        icon: Users,
        link: "/users"
    },
    {
        title: "Chat Conversations",
        value: "873",
        change: "+24.1%",
        isPositive: true,
        icon: MessageSquare,
        link: "/chat-logs"
    },
    {
        title: "Active Tours",
        value: "32",
        change: "-4.8%",
        isPositive: false,
        icon: Map,
        link: "/tours"
    },
];

// Dashboard için örnek ham veriler - Tarih (Date) ve Fiyat (Price) alanları eklendi
const recentReservations = [
    { id: "RES-101", client: "John Doe", tour: "Cappadocia Balloon Tour", date: "Jul 12, 2026", price: "€250", status: "Confirmed" },
    { id: "RES-102", client: "Alice Smith", tour: "Antalya Old Town Walk", date: "Jul 15, 2026", price: "€45", status: "Pending" },
    { id: "RES-103", client: "Bob Johnson", tour: "Istanbul Bosphorus Cruise", date: "Aug 01, 2026", price: "€85", status: "Confirmed" },
    { id: "RES-104", client: "Emma Watson", tour: "Ephesus Ancient City", date: "Jul 10, 2026", price: "€120", status: "Pending" },
];

const recentChatLogs = [
    { id: 1, user: "User #4821", message: "Is hotel transfer included in Antalya tour?", time: "2 mins ago", isLive: true },
    { id: 2, user: "User #3912", message: "Can I cancel my booking up to 24 hours?", time: "12 mins ago", isLive: false },
    { id: 3, user: "User #8824", message: "Looking for a 3-day Cappadocia itinerary.", time: "45 mins ago", isLive: false },
    { id: 4, user: "User #1105", message: "Are there any discounts for children?", time: "1 hour ago", isLive: false },
];

export default function Dashboard() {
    // Sayfa yönlendirmeleri için (eornek: react-router-dom kullanıyorsan aktif edebilirsin)
    const handleCardClick = (link) => {
        if (link) {
            // window.location.href = link; // veya useNavigate() kullanabilirsin
            console.log(`Navigating to: ${link}`);
        }
    };

    return (
        <div className="space-y-8">
            {/* BAŞLIK ALANI */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Admin Dashboard</h1>
                    <p className="mt-1.5 text-sm text-gray-500">
                        Manage reservation, chatbot, users and tour data from here.
                    </p>
                </div>
                {/* Hızlı Tarih Filtresi (Panel kalitesini artırır) */}
                <div className="flex items-center gap-2">
                    <select className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium text-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 cursor-pointer shadow-sm">
                        <option>Today</option>
                        <option>Last 7 Days</option>
                        <option selected>This Month</option>
                        <option>This Year</option>
                    </select>
                </div>
            </div>

            {/* ÜST ÖZET KARTLARI */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                {cards.map((card) => {
                    const Icon = card.icon;

                    return (
                        <div
                            key={card.title}
                            onClick={() => handleCardClick(card.link)}
                            className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-orange-100 transition-all cursor-pointer"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="inline-flex rounded-xl bg-orange-50 p-3 text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
                                    <Icon size={24} />
                                </div>
                                {/* Trend İndikatörü */}
                                <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${card.isPositive
                                        ? "bg-emerald-50 text-emerald-700"
                                        : "bg-rose-50 text-rose-700"
                                    }`}>
                                    {card.isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                    {card.change}
                                </div>
                            </div>

                            <p className="text-sm font-medium text-gray-500">{card.title}</p>
                            <p className="mt-2 text-3xl font-bold text-gray-900 tracking-tight">
                                {card.value}
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* ALT ALAN: TABLO VE CANLI SOHBET AKIŞI (İki Sütunlu Düzen) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* SOL VE ORTA KISIM: SON REZERVASYONLAR TABLOSU */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col justify-between">
                    <div>
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Recent Reservations</h3>
                                <p className="text-xs text-gray-500 mt-0.5">Latest bookings made by clients</p>
                            </div>
                            <button className="text-sm font-semibold text-orange-500 hover:text-orange-600 flex items-center gap-1 group transition-colors">
                                View All <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/70 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        <th className="px-6 py-4">ID</th>
                                        <th className="px-6 py-4">Client</th>
                                        <th className="px-6 py-4">Tour</th>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Price</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                                    {recentReservations.map((res) => (
                                        <tr key={res.id} className="hover:bg-gray-50/40 transition-colors group/row">
                                            <td className="px-6 py-4 font-semibold text-gray-900">{res.id}</td>
                                            <td className="px-6 py-4 text-gray-600">{res.client}</td>
                                            <td className="px-6 py-4 text-gray-500 max-w-[150px] truncate">{res.tour}</td>
                                            {/* Yeni Sütunlar */}
                                            <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{res.date}</td>
                                            <td className="px-6 py-4 font-semibold text-gray-900">{res.price}</td>
                                            <td className="px-6 py-4">
                                                {res.status === "Confirmed" ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                                                        <CheckCircle2 size={12} /> Confirmed
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                                                        <Clock size={12} /> Pending
                                                    </span>
                                                )}
                                            </td>
                                            {/* Yeni Hızlı Aksiyonlar */}
                                            <td className="px-6 py-4 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity duration-200">
                                                    {res.status === "Pending" && (
                                                        <button
                                                            title="Approve"
                                                            className="p-1.5 hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 rounded-lg transition-colors"
                                                            onClick={() => console.log(`Approved ${res.id}`)}
                                                        >
                                                            <Check size={14} />
                                                        </button>
                                                    )}
                                                    <button
                                                        title="View Details"
                                                        className="p-1.5 hover:bg-orange-50 text-gray-400 hover:text-orange-500 rounded-lg transition-colors"
                                                        onClick={() => console.log(`Viewing details of ${res.id}`)}
                                                    >
                                                        <Eye size={14} />
                                                    </button>
                                                </div>
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
                            <h3 className="text-lg font-bold text-gray-900">Recent Chat Logs</h3>
                            <p className="text-xs text-gray-500 mt-0.5">Live user questions from Sanny AI</p>
                        </div>

                        <div className="space-y-4">
                            {recentChatLogs.map((log) => (
                                <div
                                    key={log.id}
                                    onClick={() => console.log(`Opening chat: ${log.user}`)}
                                    className="group p-3 rounded-xl border border-gray-50 bg-gray-50/30 hover:bg-orange-50/20 hover:border-orange-100 transition-all cursor-pointer relative"
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-1.5">
                                            {/* Canlılık Bildiren Yanıp Sönen Yeşil Nokta */}
                                            {log.isLive && (
                                                <span className="relative flex h-2 w-2">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                                </span>
                                            )}
                                            <span className="text-xs font-bold text-gray-800">{log.user}</span>
                                        </div>
                                        <span className="text-[10px] text-gray-400 font-medium">{log.time}</span>
                                    </div>
                                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed italic pr-4">
                                        "{log.message}"
                                    </p>
                                    <div className="absolute right-3 bottom-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200">
                                        <ArrowRight size={12} className="text-orange-500" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button className="w-full mt-5 py-2.5 border border-gray-100 hover:border-orange-200 rounded-xl text-xs font-bold text-gray-600 hover:text-orange-500 bg-white hover:bg-orange-50/10 transition-all flex items-center justify-center gap-1 shadow-sm">
                        Open Chat Center <ArrowRight size={14} />
                    </button>
                </div>

            </div>
        </div>
    );
}