import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  Filter,
  Search,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { AirlineLogo, getAirlineLogo } from "../utils/airlineLogos";
import { getHotelImage, handleHotelImageError, DEFAULT_HOTEL_IMAGE } from "../utils/hotelImageUtils";


import ChatSidebar from "../components/ChatSidebar";
import AppointmentDetailModal from "../components/AppointmentDetailModal";
import CancelSuccessModal from "../components/CancelSuccessModal";
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
  const location = useLocation();

  const [isSidebarOpen, setIsSidebarOpen] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 768);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState("All");
  const [sortType, setSortType] = useState("Newest");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [successModalData, setSuccessModalData] = useState(null);

  const videoRef = useRef(null);

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
    if (localStorage.getItem('isGuest') === 'true' || sessionStorage.getItem('isGuest') === 'true') {
      setAppointments([]);
      return;
    }
    try {
      const response = await api.get("/api/reservations");

      const mappedReservations = response.data.map(
        (reservation) => {
          const passengers = reservation.passengers || [];
          const primaryPassenger = passengers[0];
          const primaryGuestName = primaryPassenger
            ? `${primaryPassenger.firstName || ''} ${primaryPassenger.lastName || ''}`.trim()
            : (reservation.guestName || reservation.passengerName || "");
          const guestNames = passengers
            .map(p => `${p.firstName || ''} ${p.lastName || ''}`.trim())
            .filter(Boolean);
          const pnr = reservation.pnrCode || reservation.bookingNumber || reservation.reservationNumber || `REZ-${reservation.id}`;

          let finalImageUrl = reservation.imageUrl;
          if (!finalImageUrl) {
            if (reservation.type === "FLIGHT") {
              const itemNameLower = (reservation.itemName || "").toLowerCase();
              if (itemNameLower.includes("pegasus")) {
                finalImageUrl = "/pegasus.png";
              } else if (itemNameLower.includes("ajet")) {
                finalImageUrl = "/ajet.png";
              }
            } else {
              finalImageUrl = getHotelImage(reservation);
            }
          }

          return {
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
              ? `${formatDate(reservation.startDate)} - ${formatDate(reservation.endDate)}`
              : `${formatDate(reservation.startDate)} (Tek Yön)`,
            status: reservation.status || "Completed",
            hotelName: reservation.type === "HOTEL" ? reservation.itemName : undefined,
            checkIn: formatDate(reservation.startDate),
            checkOut: reservation.endDate ? formatDate(reservation.endDate) : undefined,
            nights: reservation.startDate && reservation.endDate
              ? Math.max(1, Math.round((new Date(reservation.endDate) - new Date(reservation.startDate)) / (1000 * 60 * 60 * 24)))
              : 1,
            guests: passengers.length || 1,
            resNumber: pnr,
            reservationNumber: pnr,
            pnrCode: pnr,
            bookingNumber: pnr,
            primaryGuestName,
            guestNames,
            paymentStatus: reservation.paymentStatus || "Paid",
            price: formatPrice(reservation.totalPrice, reservation.currency),
            startDate: reservation.startDate,
            endDate: reservation.endDate,
            totalPrice: reservation.totalPrice,
            currency: reservation.currency,
            passengers,
            from: reservation.from || reservation.departureCity,
            to: reservation.to || reservation.arrivalCity,
            departureAirportCode: reservation.departureAirportCode,
            arrivalAirportCode: reservation.arrivalAirportCode,
            departureCity: reservation.departureCity,
            arrivalCity: reservation.arrivalCity,
            departureTime: reservation.departureTime,
            arrivalTime: reservation.arrivalTime,
            ticketClass: reservation.ticketClass,
            baggageAllowance: reservation.baggageAllowance,
            roomType: reservation.roomType,
            boardType: reservation.boardType,
            checkInTime: reservation.checkInTime,
            checkOutTime: reservation.checkOutTime,
            flightNumber: reservation.flightNumber,
            seat: reservation.seat,
            flightClass: reservation.flightClass || reservation.ticketClass,
            transferType: reservation.transferType,
            pickupLocation: reservation.pickupLocation,
            imageUrl: finalImageUrl,
            chatSessionId: reservation.chatSessionId,
            createdAt: reservation.createdAt,
            updatedAt: reservation.updatedAt,
          };
        }
      );

      setAppointments(mappedReservations);

      const targetPnr = location.state?.highlightPnr;
      if (targetPnr) {
        const found = mappedReservations.find(
          (a) =>
            String(a.resNumber).toLowerCase() === String(targetPnr).toLowerCase() ||
            String(a.pnrCode).toLowerCase() === String(targetPnr).toLowerCase() ||
            String(a.id).toLowerCase() === String(targetPnr).toLowerCase()
        );
        if (found) {
          setSelectedAppt(found);
        }
      }
    } catch (error) {
      console.error("Rezervasyonlar yüklenirken hata oluştu:", error);
      setAppointments([]);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const getFilteredAndSortedAppointments = () => {
    let result = [...appointments];

    if (filterType === "Hotel") {
      result = result.filter(a => a.type === "Hotel");
    } else if (filterType === "Flight") {
      result = result.filter(a => a.type === "Flight");
    }

    result.sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt || a.startDate || 0);
      const dateB = new Date(b.updatedAt || b.createdAt || b.startDate || 0);
      if (sortType === "Newest") {
        return dateB - dateA;
      } else {
        return dateA - dateB;
      }
    });

    return result;
  };

  const displayAppointments = getFilteredAndSortedAppointments();

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

  const handleCancelReservation = async (appointmentToCancel = selectedAppt) => {
    if (!appointmentToCancel) return;

    try {
      setLoading(true);
      await api.delete(`/api/reservations/${appointmentToCancel.id}`);

      const pnr =
        appointmentToCancel.pnrCode ||
        appointmentToCancel.bookingNumber ||
        appointmentToCancel.resNumber ||
        appointmentToCancel.reservationNumber ||
        `REZ-${appointmentToCancel.id}`;
      const type = appointmentToCancel.type;

      setAppointments((previous) =>
        previous.map((appointment) =>
          appointment.id === appointmentToCancel.id
            ? { ...appointment, status: "CANCELLED" }
            : appointment
        )
      );

      setSelectedAppt(null);

      setSuccessModalData({
        pnr,
        type,
      });
    } catch (error) {
      console.error("Rezervasyon iptal edilirken hata oluştu:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Completed":
      case "Tamamlandı":
        return (
          <span className="flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-3.5 py-1.5 text-[13px] sm:text-sm font-bold text-teal-700 shadow-sm dark:border-teal-800/50 dark:bg-teal-950/40 dark:text-teal-300">
            <CheckCircle2 size={16} />
            {t("past_appointments_status_Completed", "Tamamlandı")}
          </span>
        );

      case "CANCELLED":
      case "Cancelled":
      case "İptal Edildi":
        return (
          <span className="flex items-center gap-1.5 rounded-full border-2 border-red-500 bg-red-100 px-3 py-1.5 text-xs font-black text-red-700 shadow-md uppercase tracking-wider dark:border-red-700 dark:bg-red-950/80 dark:text-red-400">
            <XCircle size={14} className="stroke-[3px]" />
            {t("past_appointments_status_Cancelled", "İPTAL EDİLDİ")}
          </span>
        );

      case "Pending":
      default:
        return (
          <span className="flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3.5 py-1.5 text-[13px] sm:text-sm font-bold text-amber-700 shadow-sm dark:border-amber-800/50 dark:bg-amber-950/40 dark:text-amber-300">
            <AlertCircle size={16} />
            {t("past_appointments_status_Pending", "Beklemede")}
          </span>
        );
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "Hotel":
        return <Hotel className="text-[#0B5FFF] dark:text-blue-400" size={20} />;
      case "Flight":
        return <Plane className="text-[#14B8A6] dark:text-teal-400" size={20} />;
      case "Transfer":
        return <MapPin className="text-[#F59E0B] dark:text-amber-400" size={20} />;
      default:
        return <Calendar className="text-slate-600 dark:text-slate-400" size={20} />;
    }
  };

  const getCategoryBadge = (type) => {
    const commonClass = "flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium";

    switch (type) {
      case "Hotel":
        return (
          <span className={`${commonClass} border-blue-100 bg-blue-50 text-blue-700 dark:border-blue-800/50 dark:bg-blue-950/40 dark:text-blue-300`}>
            🏨 {t("past_appointments_badge_hotel", "Otel")}
          </span>
        );
      case "Flight":
        return (
          <span className={`${commonClass} border-purple-100 bg-purple-50 text-purple-700 dark:border-purple-800/50 dark:bg-purple-950/40 dark:text-purple-300`}>
            ✈ {t("past_appointments_badge_flight", "Uçuş")}
          </span>
        );
      case "Transfer":
        return (
          <span className={`${commonClass} border-teal-100 bg-teal-50 text-teal-700 dark:border-teal-800/50 dark:bg-teal-950/40 dark:text-teal-300`}>
            🚗 {t("past_appointments_badge_transfer", "Transfer")}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-transparent font-sans text-slate-900 dark:text-slate-100">
      <video
        ref={videoRef}
        src={theme === "dark" ? "/videos/darkmode_bg.mp4" : "/videos/chatbot_bg.mp4"}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="pointer-events-none fixed inset-0 z-0 h-full w-full object-cover"
      />

      <div className="pointer-events-none fixed inset-0 z-10 bg-white/20 dark:bg-slate-950/60" />

      <ChatSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className="relative z-20 flex h-full min-w-0 flex-1 flex-col overflow-y-auto bg-transparent">
        {!isSidebarOpen && (
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="absolute left-4 top-4 z-30 cursor-pointer rounded-lg border border-slate-200 bg-white p-2 text-slate-500 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100"
            title={t("past_appointments_expand_sidebar", "Sidebar'ı Aç")}
          >
            <PanelLeftOpen size={18} />
          </button>
        )}

        <div className="relative z-20 mx-auto w-full max-w-4xl flex-1 animate-fade-in p-3 pt-16 sm:p-6 md:p-10">
          <div className="mb-6 sm:mb-8">
            <h1 className="mb-2 text-2xl sm:text-3xl font-bold text-[#0F172A] dark:text-slate-100">
              {t("past_appointments_title", "Geçmiş Randevular")}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              {t("past_appointments_desc", "Geçmiş otel, uçuş ve transfer rezervasyonlarınızı görüntüleyin ve yönetin.")}
            </p>
          </div>

          <div className="relative ml-2 sm:ml-6 space-y-6 border-l-2 border-slate-200 py-2 pl-4 sm:pl-8 dark:border-slate-800">
            {/* Filter Dropdown */}
            <div className="absolute -left-[20px] top-0 z-30">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-white shadow-lg shadow-orange-500/50 transition-all hover:scale-105 hover:bg-orange-600 hover:shadow-orange-500/70 border-none dark:bg-orange-500 dark:text-white"
                title="Filtrele ve Sırala"
              >
                <Search size={18} />
              </button>

              {isFilterOpen && (
                <div className="absolute left-12 top-0 mt-0 w-48 rounded-xl border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                  <div className="mb-2">
                    <div className="px-2 py-1 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Filtrele</div>
                    <button onClick={() => { setFilterType('All'); setIsFilterOpen(false); }} className={`w-full text-left px-3 py-2 rounded-lg text-sm ${filterType === 'All' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-medium' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}>{t('filter_all', 'Tümü')}</button>
                    <button onClick={() => { setFilterType('Hotel'); setIsFilterOpen(false); }} className={`w-full text-left px-3 py-2 rounded-lg text-sm ${filterType === 'Hotel' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-medium' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}>{t('filter_hotel', 'Sadece Otel')}</button>
                    <button onClick={() => { setFilterType('Flight'); setIsFilterOpen(false); }} className={`w-full text-left px-3 py-2 rounded-lg text-sm ${filterType === 'Flight' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-medium' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}>{t('filter_flight', 'Sadece Uçuş')}</button>
                  </div>
                  <div className="border-t border-slate-100 dark:border-slate-700 pt-2">
                    <div className="px-2 py-1 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Sırala</div>
                    <button onClick={() => { setSortType('Newest'); setIsFilterOpen(false); }} className={`w-full text-left px-3 py-2 rounded-lg text-sm ${sortType === 'Newest' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-medium' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}>{t('sort_newest', 'En Yeni')}</button>
                    <button onClick={() => { setSortType('Oldest'); setIsFilterOpen(false); }} className={`w-full text-left px-3 py-2 rounded-lg text-sm ${sortType === 'Oldest' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-medium' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}>{t('sort_oldest', 'En Eski')}</button>
                  </div>
                </div>
              )}
            </div>

            {displayAppointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <Calendar className="mb-4 text-slate-300 dark:text-slate-600" size={48} />
                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-1">
                  {t("past_appointments_empty_title", "Geçmiş Randevu Bulunamadı")}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                  {t("past_appointments_empty_desc", "Henüz bir otel, uçuş veya transfer rezervasyonu yapmamışsınız.")}
                </p>
              </div>
            ) : (
              displayAppointments.map((appointment) => (
                <div key={appointment.id} className="group relative">
                  <div className="absolute -left-[54px] top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border-2 border-slate-200 bg-white shadow-sm transition-all duration-200 group-hover:scale-105 group-hover:border-[#0B5FFF]/40 dark:border-slate-800 dark:bg-slate-900 dark:group-hover:border-blue-500/50">
                    {getIcon(appointment.type)}
                  </div>

                  <div className="flex items-stretch rounded-2xl bg-white/95 dark:bg-[#0b1227] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-lg h-auto flex-col sm:flex-row gap-0 transition-all duration-200 hover:-translate-y-0.5">
                    {appointment.type === "Flight" ? (
                      <div className="flex items-center justify-center w-full sm:w-56 shrink-0 h-40 sm:h-auto sm:self-stretch bg-slate-100 dark:bg-[#18191b] border-b sm:border-b-0 sm:border-r border-slate-200/80 dark:border-slate-800/50 p-2 sm:p-3 overflow-hidden">
                        <AirlineLogo
                          airline={appointment.title || appointment.itemName}
                          className="h-full w-full object-contain filter drop-shadow-md transition-transform duration-300 scale-125 sm:scale-135 group-hover:scale-140"
                          style={{ maxHeight: '100%', maxWidth: '100%' }}
                        />
                      </div>
                    ) : (appointment.imageUrl || appointment.type === "Hotel") ? (
                      <div className="w-full sm:w-56 shrink-0 h-40 sm:h-auto sm:self-stretch border-b sm:border-b-0 sm:border-r border-slate-200 dark:border-slate-800 overflow-hidden">
                        <img
                          src={appointment.imageUrl || getHotelImage(appointment)}
                          alt={appointment.title}
                          className="h-full w-full object-cover"
                          onError={(e) => handleHotelImageError(e, appointment)}
                        />
                      </div>
                    ) : null}

                    <div className="flex flex-col flex-1 p-4 gap-3">
                      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-xs">
                              #{appointment.pnrCode || appointment.reservationNumber || `REZ-${appointment.id}`}
                            </span>
                          </div>

                          <h3 className="text-xl font-bold leading-tight text-[#0F172A] dark:text-white">
                            {appointment.title}
                          </h3>

                          <div className="flex flex-wrap items-center gap-2">
                            {getCategoryBadge(appointment.type)}
                            <span className="flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                              <Calendar size={13} className="text-slate-400 dark:text-slate-500" />
                              {appointment.date}
                            </span>
                          </div>

                          {appointment.type === "Hotel" && (
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                              <span className="flex items-center gap-1"><Moon size={12} />{appointment.nights} {t("past_appointments_card_nights", "gece")}</span>
                              <span>·</span>
                              <span className="flex items-center gap-1"><User size={12} />{appointment.primaryGuestName || "Irmak Özbay"}{appointment.guests > 1 ? ` (+${appointment.guests - 1})` : ''}</span>
                              <span>·</span>
                              <span className="flex items-center gap-1"><Users size={12} />{appointment.guests} {t("past_appointments_card_guests", "misafir")}</span>
                              <span>·</span>
                              <span className="flex items-center gap-1"><Calendar size={12} />{appointment.checkIn} <ArrowRight size={10} /> {appointment.checkOut}</span>
                            </div>
                          )}

                          {appointment.type === "Flight" && (
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                              <span className="flex items-center gap-1"><User size={12} />{appointment.primaryGuestName || "Irmak Özbay"}{appointment.guests > 1 ? ` (+${appointment.guests - 1})` : ''}</span>
                              {appointment.flightNumber && (<><span>·</span><span className="flex items-center gap-1"><Ticket size={12} />{appointment.flightNumber}</span></>)}
                              {appointment.seat && (<><span>·</span><span className="flex items-center gap-1">{appointment.seat} {appointment.flightClass ? `(${appointment.flightClass})` : ""}</span></>)}
                              {appointment.from && appointment.to && (<><span>·</span><span className="flex items-center gap-1"><Plane size={12} />{appointment.from} <ArrowRight size={10} /> {appointment.to}</span></>)}
                            </div>
                          )}

                          {appointment.type === "Transfer" && (
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                              <span className="flex items-center gap-1"><User size={12} />{appointment.primaryGuestName || "Irmak Özbay"}{appointment.guests > 1 ? ` (+${appointment.guests - 1})` : ''}</span>
                              <span>·</span>
                              <span className="flex items-center gap-1"><Car size={12} />{appointment.transferType || "Transfer"}</span>
                              {appointment.pickupLocation && (<><span>·</span><span className="flex items-center gap-1"><MapPin size={12} />{appointment.pickupLocation}</span></>)}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-shrink-0 flex-col gap-3 sm:items-end">
                          {getStatusBadge(appointment.status)}
                          <span className="text-sm font-bold text-[#0F172A] dark:text-white">
                            {appointment.price}
                          </span>
                        </div>
                      </div>

                      <div className="mt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleOpenModal(appointment)}
                          className="cursor-pointer whitespace-nowrap rounded-lg bg-amber-500 px-5 py-2 text-xs font-bold text-white shadow-sm transition-all duration-200 hover:bg-amber-600 hover:shadow dark:bg-amber-600 dark:hover:bg-amber-500"
                        >
                          {t("past_appointments_btn_details", "Detaylar")}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {selectedAppt && (
        <AppointmentDetailModal
          appointment={selectedAppt}
          onClose={handleCloseModal}
          onEdit={handleEditReservation}
          onCancel={handleCancelReservation}
        />
      )}

      {successModalData && (
        <CancelSuccessModal
          pnr={successModalData.pnr}
          type={successModalData.type}
          onClose={() => setSuccessModalData(null)}
        />
      )}
    </div>
  );
}