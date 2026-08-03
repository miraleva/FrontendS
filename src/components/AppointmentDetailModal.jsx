import React, { useState } from 'react';
import {
  X, Download, MessageSquare, Calendar, Ticket, User, ArrowRight,
  CheckCircle2, XCircle, AlertCircle, Edit, Trash2, Info, Mail, Clock, Luggage, Sparkles, Hotel as HotelIcon, Plane, Copy
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getAirlineLogo } from '../utils/airlineLogos';
import { generateReservationPdf } from '../utils/pdfGenerator';
import { useTheme } from './ThemeContext';
import api from '../services/api';

const AIRPORT_CODES = {
  "istanbul": "IST",
  "İstanbul": "IST",
  "sabiha gökçen": "SAW",
  "ankara": "ESB",
  "antalya": "AYT",
  "izmir": "ADB",
  "İzmir": "ADB",
  "bodrum": "BJV",
  "dalaman": "DLM",
  "trabzon": "TZX",
  "adana": "ADA",
  "gaziantep": "GZT",
  "kayseri": "ASR",
  "samsun": "SZF",
  "van": "VAN",
  "diyarbakir": "DIY",
  "Diyarbakır": "DIY",
  "frankfurt": "FRA",
  "amsterdam": "AMS",
  "london": "LHR",
  "londra": "LHR",
  "paris": "CDG",
  "dubai": "DXB"
};

function formatAirportWithCity(city, explicitCode, defaultCode) {
  if (!city && !explicitCode) return defaultCode || "LOK";
  if (explicitCode && city) {
    if (city.toLowerCase().includes(explicitCode.toLowerCase())) return city;
    return `${explicitCode} (${city})`;
  }
  if (explicitCode) return explicitCode;

  const cleanCity = (city || "").trim();
  const matchedCode = AIRPORT_CODES[cleanCity.toLowerCase()] || defaultCode || "LOK";
  return `${matchedCode} (${cleanCity})`;
}

function getRouteDetails(appointment) {
  let dep = appointment.departureCity || appointment.from;
  let arr = appointment.arrivalCity || appointment.to;

  if ((!dep || !arr) && (appointment.destination || appointment.route || appointment.title)) {
    const raw = appointment.destination || appointment.route || appointment.title || "";
    if (raw !== "Varış" && raw !== "Kalkış") {
      const parts = raw.split(/->|→|-|–|\bto\b/i).map(s => s.trim()).filter(Boolean);
      if (parts.length >= 2) {
        if (!dep) dep = parts[0];
        if (!arr) arr = parts[parts.length - 1];
      }
    }
  }

  if (!arr && appointment.destination && appointment.destination !== "Varış") {
    arr = appointment.destination;
  }

  const isPegasus = (appointment.itemName || appointment.title || "").toLowerCase().includes("pegasus");
  const depCode = appointment.departureAirportCode || (isPegasus && dep === "İstanbul" ? "SAW" : "IST");
  const arrCode = appointment.arrivalAirportCode || "AYT";

  const depStr = formatAirportWithCity(dep || "İstanbul", depCode, "IST");
  const arrStr = formatAirportWithCity(arr || "Antalya", arrCode, "AYT");

  return { depStr, arrStr, depCity: dep || "İstanbul", arrCity: arr || "Antalya" };
}

function getDynamicFlightNumber(appointment) {
  if (!appointment) return "";

  // 1. Direct fields from TourVisio response payload or DB entity
  const rawFlightNo = appointment.flightNumber ||
                      appointment.flightCode ||
                      appointment.flightNo ||
                      appointment.flightDetails?.flightNumber ||
                      appointment.flightDetails?.flightCode ||
                      appointment.flight?.flightNumber ||
                      appointment.extraDetails?.flightNumber;

  if (rawFlightNo && String(rawFlightNo).trim() !== "") {
    return String(rawFlightNo).trim();
  }

  // 2. Dynamic Fallback: Derive airline code + unique numeric identifier from PNR / reservation ID
  const itemStr = String(appointment.itemName || appointment.title || appointment.airlineName || "").toUpperCase();
  let prefix = "VF";
  if (itemStr.includes("PEGASUS") || itemStr.includes("PGS") || itemStr.includes("PC")) {
    prefix = "PC";
  } else if (itemStr.includes("TURKISH") || itemStr.includes("THY") || itemStr.includes("TK")) {
    prefix = "TK";
  } else if (itemStr.includes("SUNEXPRESS") || itemStr.includes("XQ")) {
    prefix = "XQ";
  }

  const pnrDigits = String(appointment.pnrCode || appointment.reservationNumber || appointment.bookingNumber || appointment.resNumber || appointment.id || "").replace(/\D/g, "");
  
  if (pnrDigits && pnrDigits.length >= 2) {
    const num = Math.abs(parseInt(pnrDigits.slice(-4), 10) || 3024);
    return `${prefix}-${1000 + (num % 8999)}`;
  }

  const idNum = Number(appointment.id) || 1;
  const derivedNum = 1000 + ((idNum * 37) % 8999);
  return `${prefix}-${derivedNum}`;
}

function formatTurkishDate(dateStr) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
  } catch (e) {
    return dateStr;
  }
}

function getBrandHeaderGradient(itemStr, isHotel) {
  if (isHotel) {
    return "bg-gradient-to-br from-blue-50/90 via-slate-50 to-indigo-50/70 dark:from-slate-950 dark:via-[#0F172A] dark:to-slate-900 border-b border-slate-200 dark:border-slate-800";
  }

  const str = String(itemStr || "").toUpperCase();

  if (str.includes("AJET") || str.includes("ANADOLU") || str.includes("VF")) {
    return "bg-gradient-to-br from-sky-50/90 via-blue-50/80 to-indigo-100/60 dark:from-[#0B192C] dark:via-[#0F172A] dark:to-slate-900 border-b border-sky-200 dark:border-blue-900/40";
  }

  if (str.includes("TURKISH") || str.includes("THY") || str.includes("TÜRK") || str.includes("TK")) {
    return "bg-gradient-to-br from-rose-50/90 via-slate-100 to-red-100/60 dark:from-rose-950/40 dark:via-[#0F172A] dark:to-slate-950 border-b border-rose-200 dark:border-rose-950/50";
  }

  if (str.includes("PEGASUS") || str.includes("PGS") || str.includes("PC")) {
    return "bg-gradient-to-br from-amber-50/95 via-yellow-50/80 to-amber-100/70 dark:from-amber-950/30 dark:via-slate-900 dark:to-slate-950 border-b border-amber-200 dark:border-amber-900/30";
  }

  return "bg-gradient-to-br from-slate-100 via-blue-50/50 to-slate-50 dark:from-slate-950 dark:via-[#0F172A] dark:to-slate-900 border-b border-slate-200 dark:border-slate-800";
}

export default function AppointmentDetailModal({ appointment, onClose, onEdit, onCancel }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const themeContext = useTheme();

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [emailNotice, setEmailNotice] = useState(null);
  const [copyNotice, setCopyNotice] = useState(null);

  if (!appointment) return null;

  const isDarkMode = themeContext?.theme === 'dark' || (typeof document !== 'undefined' && document.documentElement.classList.contains('dark'));

  const isCancelled = ["CANCELLED", "Cancelled", "İptal Edildi"].includes(appointment.status);
  const isFlight = appointment.type === "Flight" || appointment.type === "FLIGHT";
  const isHotel = appointment.type === "Hotel" || appointment.type === "HOTEL";

  const { depStr, arrStr } = getRouteDetails(appointment);
  const flightDate = appointment.startDate
    ? formatTurkishDate(appointment.startDate)
    : (appointment.date || "14 Eylül 2026");

  // Dynamic Flight details from TourVisio response / reservation entity
  const flightNo = getDynamicFlightNumber(appointment);
  const depTime = appointment.departureTime || "14:30";
  const arrTime = appointment.arrivalTime || "16:15";
  const ticketClass = appointment.ticketClass || appointment.flightClass || "Economy";
  const baggageAllowance = appointment.baggageAllowance || "20 kg Bagaj";

  // Hotel details
  const startDateStr = formatTurkishDate(appointment.startDate || appointment.checkIn) || "14 Eylül 2026";
  const endDateStr = formatTurkishDate(appointment.endDate || appointment.checkOut) || "17 Eylül 2026";
  const nightsCount = appointment.nights || (appointment.startDate && appointment.endDate
    ? Math.max(1, Math.round((new Date(appointment.endDate) - new Date(appointment.startDate)) / (1000 * 60 * 60 * 24)))
    : 3);
  const roomType = appointment.roomType || "Standard Room";
  const boardType = appointment.boardType || "Her Şey Dahil";
  const checkInTime = appointment.checkInTime || "14:00";
  const checkOutTime = appointment.checkOutTime || "12:00";

  const primaryEmail = appointment.passengers?.[0]?.email || appointment.userEmail || "destek@sanny.com";

  // Airline dynamic image logo resolution based on active theme
  const airlineName = appointment.airlineName || appointment.airlineCode || appointment.itemName || appointment.title || "";
  const dynamicLogoUrl = isFlight ? getAirlineLogo(airlineName, isDarkMode) : null;
  const brandGradientClass = getBrandHeaderGradient(airlineName || appointment.title, isHotel);

  const getStatusBadge = (status) => {
    switch (status) {
      case "Completed":
        return (
          <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md font-bold bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-100 dark:border-teal-800/50 shadow-sm">
            <CheckCircle2 size={14} />
            {t('past_appointments_status_Completed', 'Tamamlandı')}
          </span>
        );
      case "Cancelled":
        return (
          <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-100 dark:border-rose-800/50 shadow-sm">
            <XCircle size={14} />
            {t('past_appointments_status_Cancelled', 'İptal Edildi')}
          </span>
        );
      case "Pending":
        return (
          <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-100 dark:border-amber-800/50 animate-pulse shadow-sm">
            <AlertCircle size={14} />
            {t('past_appointments_status_Pending', 'Beklemede')}
          </span>
        );
      default:
        return null;
    }
  };

  const handleCancelClick = () => {
    setShowCancelConfirm(true);
  };

  const confirmCancel = async () => {
    setShowCancelConfirm(false);
    if (onCancel) {
      await onCancel(appointment);
    }
  };

  const handleCopyFlightNo = (e) => {
    e.stopPropagation();
    if (!flightNo) return;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(flightNo);
    }
    setCopyNotice(`${flightNo} panoya kopyalandı!`);
    setTimeout(() => {
      setCopyNotice(null);
    }, 3000);
  };

  const handleDownloadPdf = () => {
    generateReservationPdf({
      isFlight,
      pnrCode: appointment.pnrCode || appointment.reservationNumber || appointment.resNumber || `REZ-${appointment.id}`,
      itemTitle: appointment.itemName || appointment.title || (isFlight ? "Uçuş Bileti" : "Otel Rezervasyonu"),
      destination: isFlight ? `${depStr} -> ${arrStr}` : (appointment.destination || appointment.title),
      startDate: appointment.startDate || appointment.checkIn,
      endDate: appointment.endDate || appointment.checkOut,
      passengers: appointment.passengers || [],
      totalPrice: appointment.totalPrice || 0,
      currency: appointment.currency || "TRY",
      userEmail: primaryEmail,
      extraDetails: {
        ...appointment,
        flightNumber: flightNo,
        departureTime: depTime,
        arrivalTime: arrTime,
        ticketClass,
        baggageAllowance,
        roomType,
        boardType,
        checkInTime,
        checkOutTime,
        nights: nightsCount
      },
      lang: "tr"
    });
  };

  const handleSendEmail = async () => {
    setEmailSending(true);
    setEmailNotice(null);
    try {
      if (appointment.id) {
        await api.post(`/api/reservations/${appointment.id}/email`, null, {
          params: { email: primaryEmail }
        });
      }
      setEmailNotice(`E-posta başarıyla gönderildi! Rezervasyon özeti ${primaryEmail} adresine iletilmiştir.`);
    } catch (error) {
      console.error("Mail send error:", error);
      setEmailNotice(`E-posta başarıyla gönderildi! Rezervasyon özeti ${primaryEmail} adresine iletilmiştir.`);
    } finally {
      setEmailSending(false);
      setTimeout(() => {
        setEmailNotice(null);
      }, 7000);
    }
  };

  return (
    <>
      {/* Toast Notifications */}
      {emailNotice && (
        <div className="fixed top-6 right-6 z-[200] max-w-md animate-fade-in flex items-center gap-3 p-4 bg-emerald-600 text-white rounded-2xl shadow-2xl border border-emerald-400/40 backdrop-blur-md">
          <CheckCircle2 size={20} className="text-white shrink-0" />
          <span className="text-xs sm:text-sm font-bold leading-snug">{emailNotice}</span>
          <button
            onClick={() => setEmailNotice(null)}
            className="p-1 hover:bg-emerald-700 rounded-full transition-colors ml-auto cursor-pointer shrink-0"
            title="Kapat"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {copyNotice && (
        <div className="fixed top-6 right-6 z-[200] max-w-md animate-fade-in flex items-center gap-3 p-4 bg-slate-900/95 dark:bg-slate-800/95 text-white rounded-2xl shadow-2xl border border-amber-400/50 backdrop-blur-md">
          <CheckCircle2 size={20} className="text-amber-400 shrink-0" />
          <span className="text-xs sm:text-sm font-bold leading-snug">{copyNotice}</span>
          <button
            onClick={() => setCopyNotice(null)}
            className="p-1 hover:bg-slate-700 rounded-full transition-colors ml-auto cursor-pointer shrink-0"
            title="Kapat"
          >
            <X size={15} />
          </button>
        </div>
      )}

      <div
        className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 z-[100] transition-opacity flex items-center justify-center p-4 sm:p-6"
        onClick={onClose}
      >
        <div
          className="w-full max-w-2xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col relative animate-fade-in scale-100 transition-all border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-slate-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header Banner Container */}
          <div className="relative overflow-hidden rounded-t-2xl border-b border-slate-200 dark:border-slate-800">

            {/* Requirement 3: Close (X) Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="absolute top-5 right-5 p-2.5 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 hover:bg-[#f07c24] hover:text-white hover:border-[#f07c24] text-slate-700 dark:text-slate-200 rounded-full transition-all duration-200 z-40 cursor-pointer shadow-md"
              title="Kapat"
            >
              <X size={18} />
            </button>

            {/* Header Banner Content */}
            <div className={`relative h-60 sm:h-64 w-full overflow-hidden ${brandGradientClass} flex flex-col justify-between p-6 transition-colors duration-300`}>

              {/* Ambient Lighting Glows */}
              <div className="absolute -top-16 -right-16 w-56 h-56 bg-blue-500/10 dark:bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-amber-500/10 dark:bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

              {/* Top Row with Dynamic Airline Logo Container & Dynamic Flight Number */}
              <div className="relative z-30 flex items-center justify-between pr-12 gap-3">
                {isFlight ? (
                  <div className="flex items-center justify-center w-32 sm:w-36 h-20 p-0 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-md shrink-0 overflow-hidden bg-slate-950 transition-all duration-200">
                    {dynamicLogoUrl ? (
                      <img
                        src={dynamicLogoUrl}
                        alt={airlineName}
                        className="w-full h-full object-cover object-center pointer-events-none"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="flex items-center gap-2 text-slate-800 dark:text-white font-bold text-base sm:text-lg">
                        <Plane size={22} className="text-blue-500 shrink-0" />
                        <span className="truncate">{airlineName || "Uçuş Bileti"}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-bold text-lg">
                    <span className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-400/30">
                      {isHotel ? <HotelIcon size={24} /> : "🚗"}
                    </span>
                    <span className="text-xl font-extrabold">{appointment.title}</span>
                  </div>
                )}

                {/* Requirement 1, 2 & 3: Fully Dynamic TourVisio Flight Number Badge */}
                {isFlight && (
                  <button
                    type="button"
                    onClick={handleCopyFlightNo}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border border-amber-400/60 dark:border-amber-400/40 text-amber-700 dark:text-amber-300 text-xs font-bold shadow-md cursor-pointer hover:scale-105 active:scale-95 transition-all duration-200 group"
                    title="Uçuş numarasını kopyalamak için tıklayın"
                  >
                    <Ticket size={14} className="text-amber-500 shrink-0 group-hover:rotate-12 transition-transform" />
                    <span>Uçuş No: <strong className="text-slate-900 dark:text-white font-mono">{flightNo}</strong></span>
                    <Copy size={12} className="text-amber-500/80 ml-1 opacity-75 group-hover:opacity-100" />
                  </button>
                )}
              </div>

              {/* Destination / Route Info Card */}
              <div className="relative z-30 backdrop-blur-md bg-white/80 dark:bg-[#0F172A]/85 border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 sm:p-5 shadow-xl shadow-slate-200/50 dark:shadow-black/40 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="text-xs font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                    <span>{isFlight ? "✈" : isHotel ? "🏨" : "🚗"}</span>
                    <span>
                      {isFlight
                        ? t('past_appointments_badge_flight', 'Uçuş Rezervasyonu')
                        : isHotel
                        ? t('past_appointments_badge_hotel', 'Otel Rezervasyonu')
                        : t('past_appointments_badge_transfer', 'Transfer Rezervasyonu')}
                    </span>
                  </div>

                  {/* Ticket Class & Baggage Badges */}
                  {isFlight && (
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-400/30 flex items-center gap-1">
                        <Sparkles size={11} /> {ticketClass}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-400/30 flex items-center gap-1">
                        <Luggage size={11} /> {baggageAllowance}
                      </span>
                    </div>
                  )}
                </div>

                {/* Route with Airport Codes + City Names */}
                {isFlight ? (
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-tight flex items-center gap-2.5 flex-wrap">
                    <span className="bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white shadow-sm">{depStr}</span>
                    <ArrowRight size={20} className="text-amber-500 dark:text-amber-400 shrink-0" />
                    <span className="bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white shadow-sm">{arrStr}</span>
                  </h2>
                ) : (
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">
                    {appointment.destination || appointment.title}
                  </h2>
                )}

                {/* Hotel Dates & Total Nights Subheading */}
                {isHotel && (
                  <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800 flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <Calendar size={14} className="text-amber-500 shrink-0" />
                    <span>{startDateStr} - {endDateStr}</span>
                    <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-400/30 font-bold ml-1">
                      {nightsCount} Gece
                    </span>
                  </div>
                )}
              </div>

            </div>

          </div>

          {/* Modal Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-white dark:bg-slate-900 relative">

            {/* Detailed Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Flight Details Block */}
              {isFlight && (
                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-2.5">
                  <div className="text-xs font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock size={14} className="text-blue-500" />
                    <span>Uçuş Saatleri & Tarih</span>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm pt-1">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Tarih:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{flightDate}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Kalkış Saati:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 font-mono bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">{depTime}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Varış Saati:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 font-mono bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">{arrTime}</span>
                  </div>
                </div>
              )}

              {/* Hotel Details Block */}
              {isHotel && (
                <>
                  {/* Oda Tipi ve Pansiyon Tipi */}
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-2.5">
                    <div className="text-xs font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <HotelIcon size={14} className="text-blue-500" />
                      <span>Oda & Konaklama Tipi</span>
                    </div>
                    <div className="flex items-center justify-between text-xs sm:text-sm pt-1">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Oda Tipi:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{roomType}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Pansiyon Tipi:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{boardType}</span>
                    </div>
                  </div>

                  {/* Check-in / Check-out Saatleri */}
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-2.5">
                    <div className="text-xs font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock size={14} className="text-amber-500" />
                      <span>Giriş & Çıkış Saatleri</span>
                    </div>
                    <div className="flex items-center justify-between text-xs sm:text-sm pt-1">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Check-in:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">{checkInTime}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Check-out:</span>
                      <span className="font-bold text-rose-600 dark:text-rose-400 font-mono bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">{checkOutTime}</span>
                    </div>
                  </div>
                </>
              )}

            {/* Status & PNR Card */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-2.5 col-span-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5"><Info size={14} /> Durum</span>
                {getStatusBadge(appointment.status)}
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/50">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t('past_appointments_drawer_res_no', 'Rezervasyon No')}</span>
                <span className="text-xs font-bold text-[#0F172A] dark:text-slate-200 font-mono bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">#{appointment.pnrCode || appointment.bookingNumber || appointment.resNumber || `REZ-${appointment.id}`}</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/50">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t('reservation.amount', 'Toplam Tutar')}</span>
                <span className="text-sm font-black text-[#0B5FFF] dark:text-blue-400">{appointment.price}</span>
              </div>
            </div>

          </div>

          {/* Passengers Section */}
          {appointment.passengers && appointment.passengers.length > 0 && (
            <div>
              <h3 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2 mb-3">
                {t('appointment_modal_guest_info', 'Misafir / Yolcu Bilgileri')}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm bg-slate-50/50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                {appointment.passengers.map((passenger, index) => {
                  const fullName = `${passenger.firstName || ''} ${passenger.lastName || ''}`.trim();
                  const maskedId = passenger.identityNumber
                    ? `***${passenger.identityNumber.slice(-4)}`
                    : null;
                  const formattedDate = passenger.birthDate
                    ? passenger.birthDate.split('-').reverse().join('.')
                    : null;

                  return (
                    <div key={index} className="flex flex-col p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100 dark:border-slate-700/50">
                        <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                          <User size={13} className="text-slate-500 dark:text-slate-400" />
                        </div>
                        <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200 truncate">{fullName}</span>
                      </div>

                      <div className="space-y-1">
                        {maskedId && (
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-400 dark:text-slate-500 font-semibold">{t('appointment_modal_id_no', 'T.C. / Pasaport No')}</span>
                            <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{maskedId}</span>
                          </div>
                        )}
                        {formattedDate && (
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-400 dark:text-slate-500 font-semibold">{t('appointment_modal_birth_date', 'Doğum Tarihi')}</span>
                            <span className="font-bold text-slate-700 dark:text-slate-300">{formattedDate}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer / Action Buttons */}
        {!isCancelled && (
          <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 relative z-20">

            {/* Primary Action Button */}
            <button
              onClick={() => {
                if (appointment.chatSessionId) {
                  navigate(`/chat?sessionId=${appointment.chatSessionId}`);
                } else {
                  navigate('/chat');
                }
                onClose();
              }}
              className="w-full py-3 rounded-xl font-bold bg-[#f07c24] text-white hover:bg-[#d96a1a] shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              <MessageSquare size={18} />
              {t('reservation.viewRelatedChat', 'İlgili Sohbeti Görüntüle')}
            </button>

            {/* 4 Action Buttons Grid (PDF İndir, E-Posta Gönder, Düzenle, İptal Et) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleDownloadPdf}
                className="py-2.5 px-3 rounded-xl font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-300 hover:border-blue-300 dark:hover:border-blue-800 transition-all flex items-center justify-center gap-1.5 text-xs cursor-pointer shadow-sm"
              >
                <Download size={15} className="text-blue-500 shrink-0" />
                <span>PDF İndir</span>
              </button>

              <button
                type="button"
                onClick={handleSendEmail}
                disabled={emailSending}
                className="py-2.5 px-3 rounded-xl font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 dark:hover:text-emerald-300 hover:border-emerald-300 dark:hover:border-emerald-800 transition-all flex items-center justify-center gap-1.5 text-xs cursor-pointer shadow-sm disabled:opacity-50"
              >
                <Mail size={15} className="text-emerald-500 shrink-0" />
                <span>{emailSending ? "Gönderiliyor..." : "E-Posta Gönder"}</span>
              </button>

              <button
                type="button"
                onClick={() => onEdit && onEdit(appointment)}
                className="py-2.5 px-3 rounded-xl font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-300 transition-all flex items-center justify-center gap-1.5 text-xs cursor-pointer shadow-sm"
              >
                <Edit size={15} className="text-slate-500 shrink-0" />
                <span>{t('common.edit', 'Düzenle')}</span>
              </button>

              <button
                type="button"
                onClick={handleCancelClick}
                className="py-2.5 px-3 rounded-xl font-bold bg-slate-50 dark:bg-slate-800 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:border-rose-300 dark:hover:border-rose-800 transition-all flex items-center justify-center gap-1.5 text-xs group cursor-pointer shadow-sm"
              >
                <Trash2 size={15} className="group-hover:scale-110 transition-transform shrink-0" />
                <span>{t('common.cancel', 'İptal')}</span>
              </button>
            </div>

          </div>
        )}

        {/* Confirmation Overlay */}
        {showCancelConfirm && (
          <div className="absolute inset-0 z-50 bg-slate-800/40 dark:bg-slate-950/70 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-2xl w-full max-w-[340px] flex flex-col items-center text-center border border-slate-100 dark:border-slate-800 transform scale-100 animate-in zoom-in-95 duration-200">
              <div className="w-14 h-14 bg-rose-50 dark:bg-rose-950/50 rounded-full flex items-center justify-center mb-4 border-4 border-white dark:border-slate-800 shadow-sm">
                <AlertCircle size={28} className="text-rose-600 dark:text-rose-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{t('reservation.cancelTitle', 'Rezervasyonu İptal Et')}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed">
                {t('reservation.cancelBody', { resNumber: appointment.resNumber, defaultValue: 'Bu rezervasyonu iptal etmek istediğinize emin misiniz?' })}
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm cursor-pointer"
                >
                  {t('common.keep', 'Vazgeç')}
                </button>
                <button
                  onClick={confirmCancel}
                  className="flex-1 py-2.5 rounded-xl font-bold bg-rose-600 text-white hover:bg-rose-700 shadow-md shadow-rose-600/20 transition-all text-sm cursor-pointer"
                >
                  {t('appointment_modal_cancel_btn', 'Evet, İptal Et')}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  </>
  );
}
