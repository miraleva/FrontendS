import {
    CalendarCheck,
    Users,
    Map,
    MessageSquare,
    ArrowUpRight,
    Clock,
} from 'lucide-react';

const statistics = [
    {
        title: 'Toplam Rezervasyon',
        value: '248',
        change: '+12%',
        icon: CalendarCheck,
    },
    {
        title: 'Toplam Kullanıcı',
        value: '1.284',
        change: '+8%',
        icon: Users,
    },
    {
        title: 'Aktif Tur',
        value: '24',
        change: '+3',
        icon: Map,
    },
    {
        title: 'Chat Mesajı',
        value: '3.642',
        change: '+18%',
        icon: MessageSquare,
    },
];

const recentReservations = [
    {
        id: 'RSV-1001',
        customer: 'Ayşe Yılmaz',
        tour: 'Kapadokya Turu',
        date: '18.07.2026',
        total: '12.500 TL',
        status: 'Onaylandı',
    },
    {
        id: 'RSV-1002',
        customer: 'Mehmet Demir',
        tour: 'Antalya Tatili',
        date: '21.07.2026',
        total: '18.750 TL',
        status: 'Bekliyor',
    },
    {
        id: 'RSV-1003',
        customer: 'Zeynep Kaya',
        tour: 'Karadeniz Turu',
        date: '23.07.2026',
        total: '15.200 TL',
        status: 'Onaylandı',
    },
    {
        id: 'RSV-1004',
        customer: 'Emre Arslan',
        tour: 'İstanbul Kültür Turu',
        date: '27.07.2026',
        total: '8.400 TL',
        status: 'İptal',
    },
];

function getStatusClass(status) {
    if (status === 'Onaylandı') {
        return 'bg-emerald-50 text-emerald-700';
    }

    if (status === 'Bekliyor') {
        return 'bg-amber-50 text-amber-700';
    }

    return 'bg-red-50 text-red-600';
}

export default function Dashboard() {
    return (
        <div className="space-y-8">
            {/* Başlık */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">
                    Dashboard
                </h1>

                <p className="mt-2 text-sm text-gray-500">
                    Sistem performansını ve son işlemleri buradan takip edebilirsiniz.
                </p>
            </div>

            {/* İstatistik kartları */}
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {statistics.map((item) => {
                    const Icon = item.icon;

                    return (
                        <div
                            key={item.title}
                            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                                    <Icon size={21} />
                                </div>

                                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                                    {item.change}
                                </span>
                            </div>

                            <p className="mt-5 text-sm text-gray-500">
                                {item.title}
                            </p>

                            <h2 className="mt-1 text-3xl font-bold text-gray-900">
                                {item.value}
                            </h2>
                        </div>
                    );
                })}
            </div>

            <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
                {/* Son rezervasyonlar */}
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">
                                Son Rezervasyonlar
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Sisteme eklenen son rezervasyon kayıtları.
                            </p>
                        </div>

                        <button
                            type="button"
                            className="flex items-center gap-2 text-sm font-semibold text-orange-500 hover:text-orange-600"
                        >
                            Tümünü Gör
                            <ArrowUpRight size={17} />
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[760px] text-left">
                            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                                <tr>
                                    <th className="px-6 py-4">Rezervasyon</th>
                                    <th className="px-6 py-4">Müşteri</th>
                                    <th className="px-6 py-4">Tur</th>
                                    <th className="px-6 py-4">Tarih</th>
                                    <th className="px-6 py-4">Tutar</th>
                                    <th className="px-6 py-4">Durum</th>
                                </tr>
                            </thead>

                            <tbody>
                                {recentReservations.map((reservation) => (
                                    <tr
                                        key={reservation.id}
                                        className="border-t border-gray-100 text-sm text-gray-600 hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4 font-semibold text-gray-800">
                                            {reservation.id}
                                        </td>

                                        <td className="px-6 py-4">
                                            {reservation.customer}
                                        </td>

                                        <td className="px-6 py-4">
                                            {reservation.tour}
                                        </td>

                                        <td className="px-6 py-4">
                                            {reservation.date}
                                        </td>

                                        <td className="px-6 py-4 font-medium text-gray-800">
                                            {reservation.total}
                                        </td>

                                        <td className="px-6 py-4">
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                                                    reservation.status
                                                )}`}
                                            >
                                                {reservation.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Hızlı işlemler */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Hızlı İşlemler
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Sık kullanılan yönetim işlemleri.
                    </p>

                    <div className="mt-6 space-y-3">
                        <button
                            type="button"
                            className="flex w-full items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700 hover:border-orange-200 hover:bg-orange-50"
                        >
                            <CalendarCheck size={19} className="text-orange-500" />
                            Yeni rezervasyon görüntüle
                        </button>

                        <button
                            type="button"
                            className="flex w-full items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700 hover:border-orange-200 hover:bg-orange-50"
                        >
                            <Users size={19} className="text-orange-500" />
                            Kullanıcıları yönet
                        </button>

                        <button
                            type="button"
                            className="flex w-full items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700 hover:border-orange-200 hover:bg-orange-50"
                        >
                            <Map size={19} className="text-orange-500" />
                            Yeni tur ekle
                        </button>
                    </div>

                    <div className="mt-6 rounded-xl bg-gray-50 p-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <Clock size={17} className="text-orange-500" />
                            Son güncelleme
                        </div>

                        <p className="mt-2 text-sm text-gray-500">
                            16 Temmuz 2026, 11:25
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}