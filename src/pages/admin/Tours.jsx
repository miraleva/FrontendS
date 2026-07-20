import { useState } from 'react';
import {
    Plus,
    MapPin,
    Users,
    Calendar,
    Pencil,
    Trash2,
} from 'lucide-react';

const initialTours = [
    {
        id: 1,
        name: 'Kapadokya Turu',
        location: 'Nevşehir',
        date: '18.07.2026',
        price: '6.250 TL',
        capacity: 30,
        status: 'Aktif',
    },
    {
        id: 2,
        name: 'Antalya Tatili',
        location: 'Antalya',
        date: '21.07.2026',
        price: '7.500 TL',
        capacity: 25,
        status: 'Aktif',
    },
    {
        id: 3,
        name: 'Karadeniz Turu',
        location: 'Trabzon',
        date: '23.07.2026',
        price: '7.600 TL',
        capacity: 20,
        status: 'Aktif',
    },
    {
        id: 4,
        name: 'İstanbul Kültür Turu',
        location: 'İstanbul',
        date: '27.07.2026',
        price: '4.200 TL',
        capacity: 35,
        status: 'Pasif',
    },
];

export default function Tours() {
    const [tours, setTours] = useState(initialTours);

    const deleteTour = (id) => {
        const shouldDelete = window.confirm(
            'Bu turu silmek istediğinize emin misiniz?'
        );

        if (!shouldDelete) {
            return;
        }

        setTours((currentTours) =>
            currentTours.filter((tour) => tour.id !== id)
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Tours
                    </h1>

                    <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
                        Tur paketlerini görüntüleyin ve yönetin.
                    </p>
                </div>

                <button
                    type="button"
                    className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors cursor-pointer"
                >
                    <Plus size={18} />
                    Yeni Tur Ekle
                </button>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {tours.map((tour) => (
                    <div
                        key={tour.id}
                        className="overflow-hidden rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
                    >
                        <div className="flex h-36 items-center justify-center bg-gradient-to-br from-orange-100 to-orange-50 dark:from-slate-800 dark:to-slate-850">
                            <MapPin size={42} className="text-orange-400 dark:text-orange-500" />
                        </div>

                        <div className="p-5">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {tour.name}
                                    </h2>

                                    <p className="mt-1 flex items-center gap-1 text-sm text-gray-500 dark:text-slate-400">
                                        <MapPin size={15} />
                                        {tour.location}
                                    </p>
                                </div>

                                <span
                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${tour.status === 'Aktif'
                                            ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300'
                                            : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400'
                                        }`}
                                >
                                    {tour.status}
                                </span>
                            </div>

                            <div className="mt-5 grid grid-cols-2 gap-3">
                                <div className="rounded-xl bg-gray-50 dark:bg-slate-850/50 p-3 border border-slate-100 dark:border-slate-800/40">
                                    <p className="flex items-center gap-1 text-xs text-gray-400 dark:text-slate-500">
                                        <Calendar size={14} />
                                        Tarih
                                    </p>

                                    <p className="mt-1 text-sm font-semibold text-gray-800 dark:text-slate-200">
                                        {tour.date}
                                    </p>
                                </div>

                                <div className="rounded-xl bg-gray-50 dark:bg-slate-850/50 p-3 border border-slate-100 dark:border-slate-800/40">
                                    <p className="flex items-center gap-1 text-xs text-gray-400 dark:text-slate-500">
                                        <Users size={14} />
                                        Kapasite
                                    </p>

                                    <p className="mt-1 text-sm font-semibold text-gray-800 dark:text-slate-200">
                                        {tour.capacity} kişi
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5 flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-400 dark:text-slate-500">
                                        Kişi başı
                                    </p>

                                    <p className="text-xl font-bold text-orange-500">
                                        {tour.price}
                                    </p>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        className="rounded-xl border border-gray-200 dark:border-slate-800 p-2.5 text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                                        aria-label="Turu düzenle"
                                    >
                                        <Pencil size={17} />
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => deleteTour(tour.id)}
                                        className="rounded-xl border border-red-200 dark:border-red-900/40 p-2.5 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                                        aria-label="Turu sil"
                                    >
                                        <Trash2 size={17} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}