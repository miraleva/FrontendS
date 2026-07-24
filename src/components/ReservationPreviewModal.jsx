import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    X,
    ArrowLeft,
    CheckCircle2,
    User,
    Baby,
    Mail,
    Phone,
    CalendarDays,
    MapPin,
    CreditCard,
    ShieldCheck,
} from "lucide-react";

function formatPrice(price) {
    const number = Number(price);

    if (Number.isNaN(number)) {
        return price;
    }

    return Math.round(number).toLocaleString("tr-TR");
}

function formatDate(value) {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString("tr-TR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

function getGenderLabel(gender) {
    const labels = {
        MR: "Bay",
        MRS: "Bayan",
        CHD: "Çocuk",
    };

    return labels[gender] || gender || "-";
}

function getNationalityLabel(nationality) {
    const labels = {
        TR: "Türkiye",
        DE: "Almanya",
        GB: "Birleşik Krallık",
        US: "Amerika Birleşik Devletleri",
        FR: "Fransa",
        NL: "Hollanda",
        IT: "İtalya",
        ES: "İspanya",
        AU: "Avustralya",
        CA: "Kanada",
        OTHER: "Diğer",
    };

    return labels[nationality] || nationality || "-";
}

export default function ReservationPreviewModal({
    isOpen,
    onClose,
    onConfirm,
    passengers = [],
    selectedItem,
    bookingDetails = {},
    editData,
    isEditMode = false,
    isFlight = false,
    isSubmitting = false,
}) {
    const { t } = useTranslation();
    const [isApproved, setIsApproved] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsApproved(false);
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === "Escape" && !isSubmitting) {
                onClose();
            }
        };

        if (isOpen) {
            window.addEventListener("keydown", handleEscape);
        }

        return () => {
            window.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen, isSubmitting, onClose]);

    if (!isOpen) {
        return null;
    }

    const itemName = selectedItem
        ? isFlight
            ? selectedItem.airline
            : selectedItem.name || selectedItem.hotelId || "-"
        : editData?.itemName || editData?.title || "-";

    const destination = selectedItem
        ? isFlight
            ? bookingDetails?.arrivalCity || "-"
            : bookingDetails?.city || selectedItem.region || "-"
        : editData?.destination || "-";

    const startDate = selectedItem
        ? isFlight
            ? selectedItem.departureTime
            : bookingDetails?.checkIn
        : editData?.startDate;

    const endDate = selectedItem
        ? isFlight
            ? selectedItem.returnDepartureTime || selectedItem.arrivalTime
            : bookingDetails?.checkOut
        : editData?.endDate;

    const totalPrice = selectedItem?.price ?? editData?.totalPrice ?? 0;
    const currency = selectedItem?.currency || editData?.currency || "TRY";

    const handleConfirm = () => {
        if (!isApproved || isSubmitting) {
            return;
        }

        onConfirm();
    };

    return (
        <div
            className="fixed inset-0 z-[120] flex h-full w-full flex-col overflow-hidden bg-slate-50 font-sans dark:bg-slate-900"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reservation-preview-title"
        >
            <div className="flex h-full w-full flex-col overflow-hidden">
                <div className="flex flex-shrink-0 items-start justify-between border-b border-slate-200 bg-white px-7 py-4 dark:border-slate-800 dark:bg-slate-900 md:px-10">
                    <div>
                        <h2
                            id="reservation-preview-title"
                            className="text-[28px] font-bold leading-tight text-slate-900 dark:text-white md:text-[30px]"
                        >
                            {isEditMode
                                ? t("res_preview_edit_title", "Güncelleme Önizlemesi")
                                : isFlight
                                    ? t("res_preview_flight_title", "Uçuş Önizlemesi")
                                    : t("res_preview_title", "Rezervasyon Önizlemesi")}
                        </h2>

                        <p className="mt-1.5 text-base text-slate-500 dark:text-slate-400">
                            {t("res_preview_desc", "Lütfen bilgileri kontrol ederek işlemi onaylayın.")}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-white"
                        aria-label="Önizlemeyi kapat"
                    >
                        <X size={22} />
                    </button>
                </div>

                <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-7 py-5 md:px-10">
                    <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/40">
                        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                                    {isFlight ? t("res_preview_flight", "Uçuş") : t("res_preview_accom", "Konaklama")}
                                </p>

                                <h3 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                                    {isFlight ? "✈️" : "🏨"} {itemName}
                                </h3>

                                <div className="mt-3 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                    <MapPin size={16} />
                                    <span>{destination}</span>
                                </div>
                            </div>

                            <div className="rounded-xl bg-blue-50 px-4 py-3 text-right dark:bg-blue-950/40">
                                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                    {t("res_preview_total", "Toplam Tutar")}
                                </p>

                                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    {formatPrice(totalPrice)} {currency}
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 grid grid-cols-1 gap-4 border-t border-slate-200 pt-4 text-sm dark:border-slate-800 md:grid-cols-2">
                            <div className="flex items-center gap-3">
                                <CalendarDays
                                    size={17}
                                    className="text-slate-500"
                                />

                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {t("res_preview_start", "Başlangıç")}
                                    </p>
                                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                                        {formatDate(startDate)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <CalendarDays
                                    size={17}
                                    className="text-slate-500"
                                />

                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {t("res_preview_end", "Bitiş")}
                                    </p>
                                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                                        {formatDate(endDate)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section>
                        <div className="mb-3 flex items-center justify-between">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-white">
                                {t("res_preview_passengers", "Yolcu Bilgileri")}
                            </h3>

                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                {passengers.length} {t("res_preview_person", "kişi")}
                            </span>
                        </div>

                        <div className="space-y-3">
                            {passengers.map((passenger, index) => (
                                <div
                                    key={passenger.id || index}
                                    className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="rounded-xl bg-blue-50 p-2 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                                            {passenger.type === "CHILD" ? (
                                                <Baby size={18} />
                                            ) : (
                                                <User size={18} />
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
                                                <p className="font-bold text-slate-900 dark:text-white">
                                                    {passenger.firstName}{" "}
                                                    {passenger.lastName}
                                                </p>

                                                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                                    {passenger.type === "CHILD"
                                                        ? t("res_preview_child", "Çocuk")
                                                        : t("res_preview_adult", "Yetişkin")}
                                                </span>
                                            </div>

                                            <div className="mt-3 grid grid-cols-1 gap-x-5 gap-y-2 text-sm text-slate-600 dark:text-slate-300 sm:grid-cols-2">
                                                <p>
                                                    <span className="font-semibold">
                                                        {t("res_preview_birthdate", "Doğum tarihi:")}
                                                    </span>{" "}
                                                    {formatDate(
                                                        passenger.birthDate
                                                    )}
                                                </p>

                                                <p>
                                                    <span className="font-semibold">
                                                        {t("res_preview_gender", "Cinsiyet:")}
                                                    </span>{" "}
                                                    {getGenderLabel(
                                                        passenger.gender
                                                    )}
                                                </p>

                                                <p>
                                                    <span className="font-semibold">
                                                        {t("res_preview_nationality", "Uyruk:")}
                                                    </span>{" "}
                                                    {getNationalityLabel(
                                                        passenger.nationality
                                                    )}
                                                </p>

                                                <p>
                                                    <span className="font-semibold">
                                                        {passenger.nationality ===
                                                            "TR"
                                                            ? t("res_preview_tc_no", "T.C. Kimlik No:")
                                                            : t("res_preview_passport", "Pasaport No:")}
                                                    </span>{" "}
                                                    {passenger.identityNumber ||
                                                        "-"}
                                                </p>
                                            </div>

                                            <div className="mt-3 grid grid-cols-1 gap-2 border-t border-slate-100 pt-3 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300 sm:grid-cols-2">
                                                <div className="flex items-center gap-2">
                                                    <Mail size={15} />
                                                    <span className="break-all">
                                                        {passenger.email || "-"}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Phone size={15} />
                                                    <span>
                                                        {passenger.phone || "-"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4 dark:border-blue-900 dark:bg-blue-950/20">
                        <label className="flex cursor-pointer items-start gap-3">
                            <input
                                type="checkbox"
                                checked={isApproved}
                                onChange={(event) =>
                                    setIsApproved(event.target.checked)
                                }
                                disabled={isSubmitting}
                                className="mt-1 h-5 w-5 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed"
                            />

                            <span>
                                <span className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                                    <ShieldCheck
                                        size={18}
                                        className="text-blue-600 dark:text-blue-400"
                                    />
                                    {t("res_preview_agree_title", "Bilgilerimin doğru olduğunu onaylıyorum")}
                                </span>

                                <span className="mt-1 block text-sm leading-6 text-slate-600 dark:text-slate-300">
                                    {t("res_preview_agree_desc", "Yolcu, iletişim, tarih ve ücret bilgilerini kontrol ettim. Rezervasyon işleminin bu bilgilerle tamamlanmasını kabul ediyorum.")}
                                </span>
                            </span>
                        </label>
                    </section>
                </div>

                <div className="flex flex-shrink-0 flex-col-reverse gap-3 border-t border-slate-200 bg-white px-7 py-4 shadow-[0_-6px_18px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between md:px-10">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="flex h-10 px-5 items-center justify-center gap-1.5 rounded-lg border-2 border-slate-300 bg-white text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50 hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                        <ArrowLeft size={16} />
                        {t("res_preview_edit", "Bilgileri Düzenle")}
                    </button>

                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={!isApproved || isSubmitting}
                        className="flex h-12 min-w-[320px] items-center justify-center gap-2 rounded-xl bg-orange-500 px-7 text-sm font-semibold text-white shadow-md transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-400 dark:disabled:bg-slate-700"
                    >
                        {isSubmitting ? (
                            t("res_preview_loading", "İşlem yapılıyor...")
                        ) : (
                            <>
                                <CheckCircle2 size={17} />
                                {isEditMode
                                    ? t("res_preview_complete_update", "Güncellemeyi Tamamla")
                                    : isFlight
                                        ? t("res_preview_complete_flight", "Bileti Satın Al")
                                        : t("res_preview_complete", "Rezervasyonu Tamamla")}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}