import React from "react";
import { useTranslation } from "react-i18next";
import { X, CheckCircle2, MailCheck, Download, Plane, Hotel } from "lucide-react";
import { generateReservationPdf } from "../utils/pdfGenerator";

export default function ConfirmationModal({
  isOpen = true,
  onClose,
  isFlight = false,
  reservationResult = {},
  selectedItem = null,
  bookingDetails = {},
  passengers = [],
  userEmail = ""
}) {
  const { t } = useTranslation();

  if (!isOpen && !reservationResult) return null;

  const pnr =
    reservationResult?.pnrCode ||
    reservationResult?.reservationNumber ||
    reservationResult?.id ||
    "PNR12345";

  const email =
    userEmail ||
    passengers?.[0]?.email ||
    reservationResult?.passengers?.[0]?.email ||
    reservationResult?.userEmail ||
    "e-posta";

  const itemTitle =
    selectedItem?.airline ||
    selectedItem?.name ||
    bookingDetails?.hotelName ||
    bookingDetails?.title ||
    (isFlight ? "Uçuş Bileti" : "Otel Rezervasyonu");

  const destination = isFlight
    ? bookingDetails?.arrivalCity || selectedItem?.arrivalCity || selectedItem?.destination || "-"
    : bookingDetails?.city || selectedItem?.city || selectedItem?.region || "-";

  const startDate = isFlight
    ? selectedItem?.departureTime || bookingDetails?.startDate
    : bookingDetails?.checkIn || bookingDetails?.startDate;

  const endDate = isFlight
    ? selectedItem?.returnDepartureTime || selectedItem?.arrivalTime || bookingDetails?.endDate
    : bookingDetails?.checkOut || bookingDetails?.endDate;

  const totalPrice = selectedItem?.price ?? bookingDetails?.totalPrice ?? reservationResult?.totalAmount ?? 0;
  const currency = selectedItem?.currency || bookingDetails?.currency || "TRY";

  const handleDownloadPdf = () => {
    generateReservationPdf({
      isFlight,
      pnrCode: pnr,
      itemTitle,
      destination,
      startDate,
      endDate,
      passengers,
      totalPrice,
      currency,
      userEmail: email,
      extraDetails: reservationResult
    });
  };

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col items-center justify-center overflow-y-auto rounded-3xl bg-white p-6 md:p-8 text-center font-sans shadow-2xl dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full bg-slate-100 p-2 text-slate-500 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
          aria-label="Kapat"
        >
          <X size={20} />
        </button>

        {/* Header Icon */}
        <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shadow-inner">
          <CheckCircle2 size={36} />
        </div>

        <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          {isFlight ? "Uçuş Rezervasyonu Başarılı!" : "Otel Rezervasyonu Başarılı!"}
        </h3>

        <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
          PNR / Rezervasyon Kodu: <span className="font-bold text-blue-600 dark:text-blue-400">{pnr}</span>
        </p>

        {/* 1. E-posta Gönderildi Bildirimi (UI Warning/Alert) */}
        <div className="my-5 flex w-full items-center gap-3 rounded-2xl border border-emerald-300/80 bg-emerald-50/90 p-4 text-left shadow-sm dark:border-emerald-800/80 dark:bg-emerald-950/40">
          <div className="flex-shrink-0 rounded-xl bg-emerald-200/60 p-2 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">
            <MailCheck size={22} />
          </div>
          <div className="min-w-0 flex-1 text-xs md:text-sm text-emerald-900 dark:text-emerald-200">
            <p className="font-semibold leading-relaxed">
              E-postanız başarıyla gönderildi! Bilet ve rezervasyon detaylarınız{" "}
              <strong className="underline decoration-emerald-400 font-bold">{email}</strong>{" "}
              adresine iletilmiştir.
            </p>
          </div>
        </div>

        {/* Brief Item Summary Card */}
        <div className="mb-6 w-full rounded-2xl bg-slate-50 p-4 text-left dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            {isFlight ? <Plane size={14} /> : <Hotel size={14} />}
            <span>{isFlight ? "Uçuş Bilgisi" : "Otel Bilgisi"}</span>
          </div>
          <p className="mt-1 text-base font-bold text-slate-800 dark:text-slate-100 truncate">
            {itemTitle}
          </p>
          <div className="mt-2 flex justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>{destination}</span>
            <span className="font-bold text-slate-700 dark:text-slate-300">
              {Math.round(totalPrice).toLocaleString("tr-TR")} {currency}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex w-full flex-col sm:flex-row gap-3">
          {/* 2. PDF Olarak İndir Butonu */}
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-750 dark:hover:text-white"
          >
            <Download size={18} className="text-blue-600 dark:text-blue-400" />
            PDF Olarak İndir
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-blue-700"
          >
            {t("reservation_ok", "Tamam")}
          </button>
        </div>
      </div>
    </div>
  );
}

export function FlightConfirmationModal(props) {
  return <ConfirmationModal {...props} isFlight={true} />;
}

export function HotelConfirmationModal(props) {
  return <ConfirmationModal {...props} isFlight={false} />;
}
