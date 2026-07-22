import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Search,
    Eye,
    CalendarCheck,
    LoaderCircle,
    AlertCircle,
} from "lucide-react";

import { getReservations } from "../../services/adminReservationService.js";

export default function Reservations() {
    const { t, i18n } = useTranslation();

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

                setError(t("reservations.load_error"));
            } finally {
                setLoading(false);
            }
        }

        loadReservations();
    }, [t]);

    const filteredReservations = reservations.filter((reservation) => {
        const searchValue = searchTerm.trim().toLocaleLowerCase('tr-TR');

        return (
            (reservation.reservationNumber || "")
                .toLocaleLowerCase('tr-TR')
                .includes(searchValue) ||
            (reservation.itemName || "")
                .toLocaleLowerCase('tr-TR')
                .includes(searchValue) ||
            (reservation.destination || "")
                .toLocaleLowerCase('tr-TR')
                .includes(searchValue) ||
            (reservation.type || "")
                .toLocaleLowerCase('tr-TR')
                .includes(searchValue)
        );
    });

    function getLocale() {
        const localeMap = {
            tr: "tr-TR",
            en: "en-US",
            de: "de-DE",
            ru: "ru-RU",
        };

        const currentLanguage = i18n.resolvedLanguage || i18n.language || "en";

        return localeMap[currentLanguage] || "en-US";
    }

    function formatDate(date) {
        if (!date) {
            return "-";
        }

        const parsedDate = new Date(`${date}T00:00:00`);

        if (Number.isNaN(parsedDate.getTime())) {
            return "-";
        }

        return new Intl.DateTimeFormat(getLocale()).format(parsedDate);
    }

    function formatPrice(price, currency) {
        if (price === null || price === undefined) {
            return "-";
        }

        try {
            return new Intl.NumberFormat(getLocale(), {
                style: "currency",
                currency: currency || "TRY",
            }).format(price);
        } catch {
            return `${price} ${currency || ""}`.trim();
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="flex items-center gap-3 text-gray-500 dark:text-slate-400">
                    <LoaderCircle
                        size={24}
                        className="animate-spin text-orange-500"
                    />

                    <span>{t("reservations.loading")}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Sayfa başlığı */}
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {t("reservations.title")}
                    </h1>

                    <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
                        {t("reservations.description")}
                    </p>
                </div>

                <div className="flex items-center gap-2 rounded-xl bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-600 dark:bg-orange-950/20 dark:text-orange-400">
                    <CalendarCheck size={18} />

                    <span>
                        {t("reservations.reservation_count", {
                            count: reservations.length,
                        })}
                    </span>
                </div>
            </div>

            {/* Hata mesajı */}
            {error && (
                <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
                    <AlertCircle size={18} />

                    {error}
                </div>
            )}

            {/* Rezervasyon tablosu */}
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                {/* Arama alanı */}
                <div className="border-b border-gray-100 p-5 dark:border-slate-800">
                    <div className="relative max-w-xl">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500"
                        />

                        <input
                            type="text"
                            placeholder={t(
                                "reservations.search_placeholder"
                            )}
                            value={searchTerm}
                            onChange={(event) =>
                                setSearchTerm(event.target.value)
                            }
                            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-orange-950"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1100px] text-left">
                        <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                            <tr>
                                <th className="px-6 py-4">
                                    {t(
                                        "reservations.table.reservation_number"
                                    )}
                                </th>

                                <th className="px-6 py-4">
                                    {t("reservations.table.type")}
                                </th>

                                <th className="px-6 py-4">
                                    {t("reservations.table.product")}
                                </th>

                                <th className="px-6 py-4">
                                    {t("reservations.table.destination")}
                                </th>

                                <th className="px-6 py-4">
                                    {t("reservations.table.start_date")}
                                </th>

                                <th className="px-6 py-4">
                                    {t("reservations.table.end_date")}
                                </th>

                                <th className="px-6 py-4">
                                    {t("reservations.table.passenger")}
                                </th>

                                <th className="px-6 py-4">
                                    {t("reservations.table.total")}
                                </th>

                                <th className="px-6 py-4">
                                    {t("reservations.table.action")}
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredReservations.map((reservation) => (
                                <tr
                                    key={reservation.id}
                                    className="border-t border-gray-100 text-sm text-gray-600 transition-colors hover:bg-gray-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800/40"
                                >
                                    <td className="px-6 py-4 font-semibold text-gray-800 dark:text-slate-200">
                                        {reservation.reservationNumber || "-"}
                                    </td>

                                    <td className="px-6 py-4">
                                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                                            {reservation.type || "-"}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4 font-medium text-gray-800 dark:text-slate-200">
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
                                        {Array.isArray(
                                            reservation.passengers
                                        )
                                            ? reservation.passengers.length
                                            : 0}
                                    </td>

                                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                                        {formatPrice(
                                            reservation.totalPrice,
                                            reservation.currency
                                        )}
                                    </td>

                                    <td className="px-6 py-4">
                                        <button
                                            type="button"
                                            className="rounded-lg border border-gray-200 p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
                                            aria-label={t(
                                                "reservations.view_details"
                                            )}
                                            title={t(
                                                "reservations.view_details"
                                            )}
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
                    <div className="p-10 text-center text-sm text-gray-500 dark:text-slate-400">
                        {t("reservations.not_found")}
                    </div>
                )}
            </div>
        </div>
    );
}