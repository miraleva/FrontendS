import { useEffect, useState } from "react";
import {
    Search,
    Eye,
    CalendarCheck,
    LoaderCircle,
    AlertCircle,
} from "lucide-react";

import { getReservations } from "../../services/adminReservationService.js";

export default function Reservations() {
    const [reservations, setReservations] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadReservations() {
            try {
                setLoading(true);
                setError("");

                const data = await getReservations();

                setReservations(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Rezervasyonlar alınamadı:", err);

                setError(
                    "Rezervasyonlar alınamadı. Backend bağlantısını kontrol edin."
                );
            } finally {
                setLoading(false);
            }
        }

        loadReservations();
    }, []);

    const filteredReservations = reservations.filter((reservation) => {
        const searchValue = searchTerm.trim().toLowerCase();

        return (
            (reservation.reservationNumber || "")
                .toLowerCase()
                .includes(searchValue) ||
            (reservation.itemName || "")
                .toLowerCase()
                .includes(searchValue) ||
            (reservation.destination || "")
                .toLowerCase()
                .includes(searchValue) ||
            (reservation.type || "")
                .toLowerCase()
                .includes(searchValue)
        );
    });

    function formatDate(date) {
        if (!date) {
            return "-";
        }

        return new Intl.DateTimeFormat("tr-TR").format(
            new Date(`${date}T00:00:00`)
        );
    }

    function formatPrice(price, currency) {
        if (price === null || price === undefined) {
            return "-";
        }

        try {
            return new Intl.NumberFormat("tr-TR", {
                style: "currency",
                currency: currency || "TRY",
            }).format(price);
        } catch {
            return `${price} ${currency || ""}`;
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="flex items-center gap-3 text-gray-500">
                    <LoaderCircle
                        size={24}
                        className="animate-spin text-orange-500"
                    />

                    <span>Rezervasyonlar yükleniyor...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Sayfa başlığı */}
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Reservations
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                        Veritabanındaki gerçek rezervasyon kayıtlarını görüntüleyin.
                    </p>
                </div>

                <div className="flex items-center gap-2 rounded-xl bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-600">
                    <CalendarCheck size={18} />

                    {reservations.length} rezervasyon
                </div>
            </div>

            {/* Hata mesajı */}
            {error && (
                <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    <AlertCircle size={18} />

                    {error}
                </div>
            )}

            {/* Rezervasyon tablosu */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                {/* Arama alanı */}
                <div className="border-b border-gray-100 p-5">
                    <div className="relative max-w-xl">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <input
                            type="text"
                            placeholder="Rezervasyon no, ürün veya destinasyon ara..."
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1100px] text-left">
                        <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                            <tr>
                                <th className="px-6 py-4">Rezervasyon No</th>
                                <th className="px-6 py-4">Tip</th>
                                <th className="px-6 py-4">Ürün</th>
                                <th className="px-6 py-4">Destinasyon</th>
                                <th className="px-6 py-4">Başlangıç</th>
                                <th className="px-6 py-4">Bitiş</th>
                                <th className="px-6 py-4">Yolcu</th>
                                <th className="px-6 py-4">Toplam</th>
                                <th className="px-6 py-4">İşlem</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredReservations.map((reservation) => (
                                <tr
                                    key={reservation.id}
                                    className="border-t border-gray-100 text-sm text-gray-600 hover:bg-gray-50"
                                >
                                    <td className="px-6 py-4 font-semibold text-gray-800">
                                        {reservation.reservationNumber || "-"}
                                    </td>

                                    <td className="px-6 py-4">
                                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                                            {reservation.type || "-"}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4 font-medium text-gray-800">
                                        {reservation.itemName || "-"}
                                    </td>

                                    <td className="px-6 py-4">
                                        {reservation.destination || "-"}
                                    </td>

                                    <td className="px-6 py-4">
                                        {formatDate(reservation.startDate)}
                                    </td>

                                    <td className="px-6 py-4">
                                        {formatDate(reservation.endDate)}
                                    </td>

                                    <td className="px-6 py-4">
                                        {Array.isArray(reservation.passengers)
                                            ? reservation.passengers.length
                                            : 0}
                                    </td>

                                    <td className="px-6 py-4 font-semibold text-gray-900">
                                        {formatPrice(
                                            reservation.totalPrice,
                                            reservation.currency
                                        )}
                                    </td>

                                    <td className="px-6 py-4">
                                        <button
                                            type="button"
                                            className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-100"
                                            aria-label="Rezervasyon detayını görüntüle"
                                        >
                                            <Eye size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {!error && filteredReservations.length === 0 && (
                    <div className="p-10 text-center text-sm text-gray-500">
                        Rezervasyon bulunamadı.
                    </div>
                )}
            </div>
        </div>
    );
}