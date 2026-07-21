import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PanelLeftOpen,
  Hotel,
  Plane,
  MapPin,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MessageSquare,
  Edit3,
  Trash2,
  ArrowRight,
  User,
  Ticket,
  Moon,
  Users,
  Car,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import ChatSidebar from "../components/ChatSidebar";
import api from "../services/api";
import { useTheme } from "../components/ThemeContext";

const formatPrice = (amount, currency = "TRY") => {
  if (amount === undefined || amount === null) return "";

  if (
    typeof amount === "string" &&
    Number.isNaN(Number(amount.replace(/[^0-9.-]+/g, "")))
  ) {
    return amount;
  }

  const numericAmount =
    typeof amount === "string"
      ? Number.parseFloat(amount.replace(/[^0-9.-]+/g, ""))
      : amount;

  if (Number.isNaN(Number(numericAmount))) return String(amount);

  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
  }).format(numericAmount);
};

const formatDate = (dateValue) => {
  if (!dateValue) return "";

  if (/^\d{4}-\d{2}-\d{2}/.test(dateValue)) {
    const [year, month, day] = dateValue
      .split("T")[0]
      .split("-");

    return `${day}.${month}.${year}`;
  }

  return dateValue;
};

const normalizeReservationType = (type) => {
  if (!type) return "";

  const normalized = type.toUpperCase();

  if (normalized === "HOTEL") return "HOTEL";
  if (normalized === "FLIGHT") return "FLIGHT";
  if (normalized === "TRANSFER") return "TRANSFER";

  return normalized;
};

export default function PastAppointments() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  const videoRef = useRef(null);

  const mockAppointments = [
    {
      id: 1,
      title: "Antalya Şehir Turu",
      itemName: "Antalya Şehir Turu",
      destination: "Antalya",
      type: "Hotel",
      date: "12.06.2026 - 19.06.2026",
      startDate: "2026-06-12",
      endDate: "2026-06-19",
      status: "Completed",
      hotelName: "Antalya Şehir Turu",
      checkIn: "12.06.2026",
      checkOut: "19.06.2026",
      nights: 7,
      guests: 1,
      resNumber: "RES-163CF0BB",
      reservationNumber: "RES-163CF0BB",
      paymentStatus: "Paid",
      totalPrice: 2400,
      currency: "TRY",
      price: formatPrice(2400, "TRY"),
      passengers: [
        {
          firstName: "Ayşe",
          lastName: "Yılmaz",
          email: "ayse@example.com",
          phoneNumber: "05551234567",
          identityNumber: "12345678901",
          birthDate: "1990-05-12",
          gender: "MRS",
          nationality: "TR",
        },
      ],
    },
    {
      id: 2,
      title: "İstanbul (IST) - Münih (MUC)",
      itemName: "İstanbul (IST) - Münih (MUC)",
      destination: "Münih",
      type: "Flight",
      date: "08.05.2026 (Tek Yön)",
      startDate: "2026-05-08",
      endDate: "2026-05-08",
      status: "Completed",
      from: "İstanbul (IST)",
      to: "Münih (MUC)",
      flightNumber: "LH-1620",
      seat: "14A",
      flightClass: "Ekonomi",
      guests: 1,
      resNumber: "FLT-561029",
      reservationNumber: "FLT-561029",
      paymentStatus: "Paid",
      totalPrice: 8500,
      currency: "TRY",
      price: formatPrice(8500, "TRY"),
      passengers: [
        {
          firstName: "Mehmet",
          lastName: "Yılmaz",
          email: "mehmet@example.com",
          phoneNumber: "05559876543",
          identityNumber: "10987654321",
          birthDate: "1988-03-08",
          gender: "MR",
          nationality: "TR",
        },
      ],
    },
    {
      id: 3,
      title: "Antalya Havalimanı Transferi",
      itemName: "Antalya Havalimanı Transferi",
      destination: "Antalya",
      type: "Transfer",
      date: "12.06.2026",
      startDate: "2026-06-12",
      endDate: "2026-06-12",
      status: "Cancelled",
      transferType: "Havalimanı Transferi",
      driverStatus: "Operatör Tarafından İptal Edildi",
      pickupLocation: "Antalya Havalimanı Terminal 2",
      resNumber: "TRF-774021",
      reservationNumber: "TRF-774021",
      paymentStatus: "Refunded",
      totalPrice: 45,
      currency: "USD",
      price: formatPrice(45, "USD"),
      passengers: [],
    },
  ];

  useEffect(() => {
    if (!videoRef.current) return;

    videoRef.current.load();
    videoRef.current
      .play()
      .catch((error) =>
        console.log("Video oynatılamadı:", error)
      );
  }, [theme]);

  const fetchReservations = async () => {
    try {
      const response = await api.get("/api/reservations");

      const mappedReservations = response.data.map(
        (reservation) => ({
          id: reservation.id,
          title: reservation.itemName,
          itemName: reservation.itemName,
          destination: reservation.destination,
          type:
            reservation.type === "HOTEL"
              ? "Hotel"
              : reservation.type === "FLIGHT"
                ? "Flight"
                : "Transfer",
          date: reservation.endDate
            ? `${formatDate(
              reservation.startDate
            )} - ${formatDate(reservation.endDate)}`
            : `${formatDate(
              reservation.startDate
            )} (Tek Yön)`,
          status: reservation.status || "Completed",
          hotelName:
            reservation.type === "HOTEL"
              ? reservation.itemName
              : undefined,
          checkIn: formatDate(reservation.startDate),
          checkOut: reservation.endDate
            ? formatDate(reservation.endDate)
            : undefined,
          nights: 1,
          guests:
            reservation.passengers?.length || 1,
          resNumber: reservation.reservationNumber,
          reservationNumber:
            reservation.reservationNumber,
          paymentStatus:
            reservation.paymentStatus || "Paid",
          price: formatPrice(
            reservation.totalPrice,
            reservation.currency
          ),
          startDate: reservation.startDate,
          endDate: reservation.endDate,
          totalPrice: reservation.totalPrice,
          currency: reservation.currency,
          passengers: reservation.passengers || [],
          from: reservation.from,
          to: reservation.to,
          flightNumber: reservation.flightNumber,
          seat: reservation.seat,
          flightClass: reservation.flightClass,
          transferType: reservation.transferType,
          pickupLocation: reservation.pickupLocation,
        })
      );

      setAppointments(mappedReservations);
    } catch (error) {
      console.error(
        "Backend verisi yüklenemedi, mock veriler gösteriliyor:",
        error
      );
      setAppointments(mockAppointments);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleOpenModal = (appointment) => {
    setSelectedAppt(appointment);
  };

  const handleCloseModal = () => {
    setSelectedAppt(null);
  };

  const handleEditReservation = () => {
    if (!selectedAppt) return;

    const normalizedReservation = {
      ...selectedAppt,
      type: normalizeReservationType(selectedAppt.type),
    };

    setSelectedAppt(null);

    navigate("/reservation", {
      state: {
        editMode: true,
        reservationData: normalizedReservation,
      },
    });
  };

  const handleCancelReservation = async () => {
    if (!selectedAppt) return;

    const confirmCancel = window.confirm(
      `${selectedAppt.title} rezervasyonunu iptal etmek istediğinize emin misiniz?`
    );

    if (!confirmCancel) return;

    try {
      setLoading(true);

      await api.delete(
        `/api/reservations/${selectedAppt.id}`
      );

      setAppointments((previous) =>
        previous.filter(
          (appointment) =>
            appointment.id !== selectedAppt.id
        )
      );

      setSelectedAppt(null);
    } catch (error) {
      console.error(
        "Rezervasyon iptal edilirken hata oluştu:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Completed":
      case "Tamamlandı":
        return (
          <span className="flex items-center gap-1 rounded-full border border-teal-100 bg-teal-50 px-2.5 py-1 text-[11px] font-bold text-teal-700 dark:border-teal-800/50 dark:bg-teal-950/40 dark:text-teal-300">
            <CheckCircle2 size={12} />
            {t(
              "past_appointments_status_Completed",
              "Tamamlandı"
            )}
          </span>
        );

      case "Cancelled":
      case "İptal Edildi":
        return (
          <span className="flex items-center gap-1 rounded-full border border-rose-100 bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-700 dark:border-rose-800/50 dark:bg-rose-950/40 dark:text-rose-300">
            <XCircle size={12} />
            {t(
              "past_appointments_status_Cancelled",
              "İptal Edildi"
            )}
          </span>
        );

      case "Pending":
      default:
        return (
          <span className="flex items-center gap-1 rounded-full border border-amber-100 bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700 dark:border-amber-800/50 dark:bg-amber-950/40 dark:text-amber-300">
            <AlertCircle size={12} />
            {t(
              "past_appointments_status_Pending",
              "Beklemede"
            )}
          </span>
        );
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "Hotel":
        return (
          <Hotel
            className="text-[#0B5FFF] dark:text-blue-400"
            size={20}
          />
        );
      case "Flight":
        return (
          <Plane
            className="text-[#14B8A6] dark:text-teal-400"
            size={20}
          />
        );
      case "Transfer":
        return (
          <MapPin
            className="text-[#F59E0B] dark:text-amber-400"
            size={20}
          />
        );
      default:
        return (
          <Calendar
            className="text-slate-600 dark:text-slate-400"
            size={20}
          />
        );
    }
  };

  const getCategoryBadge = (type) => {
    const commonClass =
      "flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium";

    switch (type) {
      case "Hotel":
        return (
          <span
            className={`${commonClass} border-blue-100 bg-blue-50 text-blue-700 dark:border-blue-800/50 dark:bg-blue-950/40 dark:text-blue-300`}
          >
            🏨{" "}
            {t(
              "past_appointments_badge_hotel",
              "Otel"
            )}
          </span>
        );
      case "Flight":
        return (
          <span
            className={`${commonClass} border-purple-100 bg-purple-50 text-purple-700 dark:border-purple-800/50 dark:bg-purple-950/40 dark:text-purple-300`}
          >
            ✈{" "}
            {t(
              "past_appointments_badge_flight",
              "Uçuş"
            )}
          </span>
        );
      case "Transfer":
        return (
          <span
            className={`${commonClass} border-teal-100 bg-teal-50 text-teal-700 dark:border-teal-800/50 dark:bg-teal-950/40 dark:text-teal-300`}
          >
            🚗{" "}
            {t(
              "past_appointments_badge_transfer",
              "Transfer"
            )}
          </span>
        );
      default:
        return null;
    }
  };

  const displayedAppointments =
    appointments.length > 0
      ? appointments
      : mockAppointments;

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-transparent font-sans text-slate-900 dark:text-slate-100">
      <video
        ref={videoRef}
        src={
          theme === "dark"
            ? "/videos/darkmode_bg.mp4"
            : "/videos/chatbot_bg.mp4"
        }
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="pointer-events-none fixed inset-0 z-0 h-full w-full object-cover"
      />

      <div className="pointer-events-none fixed inset-0 z-10 bg-white/20 dark:bg-slate-950/60" />

      <ChatSidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      <div className="relative z-20 flex h-full min-w-0 flex-1 flex-col overflow-y-auto bg-transparent">
        {!isSidebarOpen && (
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="absolute left-4 top-4 z-30 cursor-pointer rounded-lg border border-slate-200 bg-white p-2 text-slate-500 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100"
            title={t(
              "past_appointments_expand_sidebar",
              "Sidebar'ı Aç"
            )}
          >
            <PanelLeftOpen size={18} />
          </button>
        )}

        <div className="relative z-20 mx-auto w-full max-w-4xl flex-1 animate-fade-in p-6 md:p-10">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold text-[#0F172A] dark:text-slate-100">
              {t(
                "past_appointments_title",
                "Geçmiş Randevular"
              )}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {t(
                "past_appointments_desc",
                "Geçmiş otel, uçuş ve transfer rezervasyonlarınızı görüntüleyin ve yönetin."
              )}
            </p>
          </div>

          <div className="relative ml-6 space-y-6 border-l-2 border-slate-200 py-2 pl-8 dark:border-slate-800">
            {displayedAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="group relative"
              >
                <div className="absolute -left-[54px] top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border-2 border-slate-200 bg-white shadow-sm transition-all duration-200 group-hover:scale-105 group-hover:border-[#0B5FFF]/40 dark:border-slate-800 dark:bg-slate-900 dark:group-hover:border-blue-500/50">
                  {getIcon(appointment.type)}
                </div>

                <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white/95 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/95">
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div className="space-y-3">
                      <h3 className="text-xl font-bold leading-tight text-[#0F172A] dark:text-white">
                        {appointment.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-2">
                        {getCategoryBadge(
                          appointment.type
                        )}
                        <span className="flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                          <Calendar
                            size={13}
                            className="text-slate-400 dark:text-slate-500"
                          />
                          {appointment.date}
                        </span>
                      </div>

                      {appointment.type === "Hotel" && (
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <Moon size={12} />
                            {appointment.nights}{" "}
                            {t(
                              "past_appointments_card_nights",
                              "gece"
                            )}
                          </span>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <Users size={12} />
                            {appointment.guests}{" "}
                            {t(
                              "past_appointments_card_guests",
                              "misafir"
                            )}
                          </span>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {appointment.checkIn}
                            <ArrowRight size={10} />
                            {appointment.checkOut}
                          </span>
                        </div>
                      )}

                      {appointment.type ===
                        "Flight" && (
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                            {appointment.flightNumber && (
                              <span className="flex items-center gap-1">
                                <Ticket size={12} />
                                {
                                  appointment.flightNumber
                                }
                              </span>
                            )}
                            {appointment.seat && (
                              <>
                                <span>·</span>
                                <span className="flex items-center gap-1">
                                  <User size={12} />
                                  {appointment.seat}{" "}
                                  {appointment.flightClass
                                    ? `(${appointment.flightClass})`
                                    : ""}
                                </span>
                              </>
                            )}
                            {appointment.from &&
                              appointment.to && (
                                <>
                                  <span>·</span>
                                  <span className="flex items-center gap-1">
                                    <Plane size={12} />
                                    {appointment.from}
                                    <ArrowRight
                                      size={10}
                                    />
                                    {appointment.to}
                                  </span>
                                </>
                              )}
                          </div>
                        )}

                      {appointment.type ===
                        "Transfer" && (
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1">
                              <Car size={12} />
                              {appointment.transferType ||
                                "Transfer"}
                            </span>
                            {appointment.pickupLocation && (
                              <>
                                <span>·</span>
                                <span className="flex items-center gap-1">
                                  <MapPin size={12} />
                                  {
                                    appointment.pickupLocation
                                  }
                                </span>
                              </>
                            )}
                          </div>
                        )}
                    </div>

                    <div className="flex flex-shrink-0 flex-col gap-3 sm:items-end">
                      {getStatusBadge(
                        appointment.status
                      )}
                      <span className="text-sm font-bold text-[#0F172A] dark:text-white">
                        {appointment.price}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() =>
                        handleOpenModal(appointment)
                      }
                      className="cursor-pointer whitespace-nowrap rounded-lg bg-amber-500 px-5 py-2 text-xs font-bold text-white shadow-sm transition-all duration-200 hover:bg-amber-600 hover:shadow dark:bg-amber-600 dark:hover:bg-amber-500"
                    >
                      {t(
                        "past_appointments_btn_details",
                        "Detaylar"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedAppt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={handleCloseModal}
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-800 shadow-2xl dark:border-slate-800 dark:bg-[#111827] dark:text-slate-200"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="border-b border-slate-200 p-6 dark:border-slate-800">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="mb-2">
                    {getCategoryBadge(
                      selectedAppt.type
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {selectedAppt.title}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded-full bg-slate-100 px-3 py-1 text-lg text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="max-h-[60vh] space-y-5 overflow-y-auto p-6">
              <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Mevcut Durum
                  </span>
                  {getStatusBadge(
                    selectedAppt.status
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-slate-200 pt-3 dark:border-slate-700">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Rezervasyon Numarası
                  </span>
                  <span className="rounded bg-slate-200 px-2 py-0.5 font-mono text-xs font-bold dark:bg-slate-700">
                    {selectedAppt.resNumber}
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-slate-200 pt-3 dark:border-slate-700">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Tutar
                  </span>
                  <span className="text-lg font-bold text-blue-500 dark:text-blue-400">
                    {selectedAppt.price}
                  </span>
                </div>
              </div>

              <div className="space-y-3 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Ürün:
                  </span>
                  <span className="text-right text-xs font-semibold">
                    {selectedAppt.itemName ||
                      selectedAppt.title}
                  </span>
                </div>

                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Ödeme Durumu:
                  </span>
                  <span className="text-xs font-bold text-emerald-500">
                    {selectedAppt.paymentStatus}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3 border-t border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-[#0D1322]">
              <button
                type="button"
                onClick={() => navigate("/chat")}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2563EB] py-3 text-sm font-bold text-white transition-all hover:bg-[#1D4ED8]"
              >
                <MessageSquare size={16} />
                İlgili Sohbeti Görüntüle
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleEditReservation}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white py-2.5 text-xs font-semibold text-slate-800 transition-all hover:bg-slate-100 dark:border-slate-700 dark:bg-[#1E293B] dark:text-white dark:hover:bg-slate-700"
                >
                  <Edit3 size={15} />
                  Düzenle
                </button>

                <button
                  type="button"
                  onClick={handleCancelReservation}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 rounded-xl border border-rose-300 bg-rose-50 py-2.5 text-xs font-semibold text-rose-700 transition-all hover:bg-rose-100 disabled:opacity-50 dark:border-rose-800/60 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/60"
                >
                  <Trash2 size={15} />
                  {loading
                    ? "İptal Ediliyor..."
                    : "İptal Et"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}