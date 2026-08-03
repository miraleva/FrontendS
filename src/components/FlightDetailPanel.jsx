import React from 'react';
import { X, Plane, Calendar, Clock, Briefcase, ArrowRight, ArrowDown, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AirlineLogo } from '../utils/airlineLogos';
import { useFavorites } from './FavoritesContext';

function formatFlightDateTime(value) {
  if (!value) return value;
  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...(isDateOnly ? {} : { hour: "2-digit", minute: "2-digit" })
  });
}

function formatFlightTime(value) {
  if (!value) return "--:--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--:--";
  return date.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
}

function formatDuration(startValue, endValue) {
  if (!startValue || !endValue) return null;
  const start = new Date(startValue);
  const end = new Date(endValue);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
  const minutesTotal = Math.round((end.getTime() - start.getTime()) / 60000);
  if (minutesTotal <= 0) return null;
  const hours = Math.floor(minutesTotal / 60);
  const minutes = minutesTotal % 60;
  return `${hours}s ${minutes}dk`;
}

function getLayoverData(flight, isReturn = false) {
  if (!flight) return { isConnecting: false, label: "Direkt Uçuş" };

  const transfersText = isReturn ? (flight.returnTransfers || flight.transfers) : flight.transfers;
  const segments = isReturn ? (flight.returnSegments || flight.segments) : flight.segments;

  const isConnecting = (segments && Array.isArray(segments) && segments.length > 1) ||
    (transfersText && transfersText.toLowerCase().includes("aktarma")) ||
    flight.isConnecting || flight.stops > 0;

  if (!isConnecting) {
    return { isConnecting: false, label: transfersText || "Direkt Uçuş" };
  }

  let connectingCity = "İstanbul (SAW)";
  let layoverDuration = "1s 45dk";

  if (segments && Array.isArray(segments) && segments.length > 1) {
    const city = segments[0]?.arrivalCity || segments[0]?.arrivalAirport || segments[0]?.arrivalPoint;
    if (city) connectingCity = city;

    if (segments[0]?.arrivalTime && segments[1]?.departureTime) {
      try {
        const t0 = new Date(segments[0].arrivalTime);
        const t1 = new Date(segments[1].departureTime);
        const diffMin = Math.round((t1.getTime() - t0.getTime()) / 60000);
        if (diffMin > 0) {
          const h = Math.floor(diffMin / 60);
          const m = diffMin % 60;
          layoverDuration = h > 0 ? `${h}s ${m}dk` : `${m}dk`;
        }
      } catch (e) {}
    }
  } else if (transfersText && transfersText.includes("(")) {
    const match = transfersText.match(/\((.*?)\)/);
    if (match && match[1]) {
      const parts = match[1].split("-").map(s => s.trim());
      if (parts[0]) connectingCity = parts[0];
      if (parts[1]) layoverDuration = parts[1];
    }
  }

  return {
    isConnecting: true,
    connectingCity,
    layoverDuration,
    label: `1 Aktarmalı (${connectingCity} • ${layoverDuration})`,
    leg1DepartureTime: flight.departureTime,
    leg1ArrivalTime: segments?.[0]?.arrivalTime || "04:25",
    leg2DepartureTime: segments?.[1]?.departureTime || "06:10",
    leg2ArrivalTime: flight.arrivalTime
  };
}

function FlightSegment({ title, departureCity, arrivalCity, departureTime, arrivalTime, baggage, icon: Icon, isReturn = false, flight }) {
  const duration = formatDuration(departureTime, arrivalTime);
  const layoverInfo = getLayoverData(flight, isReturn);

  const pathId = isReturn ? "flight-path-return" : "flight-path-outbound";
  const gradientId = isReturn ? "flight-grad-return" : "flight-grad-outbound";
  const glowId = isReturn ? "flight-glow-return" : "flight-glow-outbound";

  const pathD = isReturn ? "M 12 12 Q 100 42 188 12" : "M 12 38 Q 100 8 188 38";
  const startY = isReturn ? 12 : 38;
  const endY = isReturn ? 12 : 38;
  const midY = isReturn ? 27 : 23;

  const mainColor = isReturn ? "#6366f1" : "#3b82f6";
  const lightColor = isReturn ? "#818cf8" : "#60a5fa";

  return (
    <div className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <Icon size={16} className={isReturn ? "text-indigo-500" : "text-blue-500"} />
          {title}
        </h3>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${
          layoverInfo.isConnecting 
            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 font-bold" 
            : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-transparent"
        }`}>
          {layoverInfo.label}
        </span>
      </div>

      {/* Zaman Çizelgesi: Kalkış — Süre/Kavis — Varış */}
      <div className="flex items-center gap-3">
        <div className="flex-1 text-center">
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
            {formatFlightTime(departureTime)}
          </div>
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5 truncate">
            {departureCity || "-"}
          </div>
        </div>

        {/* Kavisli SVG Yolu & Uçak Animasyonu */}
        <div className="flex-1 flex flex-col items-center justify-center relative min-w-[140px] px-1">
          {duration && (
            <div className="z-10 mb-[-4px]">
              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-xs bg-white dark:bg-slate-900 border ${
                isReturn 
                  ? "text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/80" 
                  : "text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/80"
              }`}>
                {duration}
              </span>
            </div>
          )}

          <div className="w-full relative h-12 flex items-center justify-center overflow-visible">
            <svg viewBox="0 0 200 48" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={mainColor} stopOpacity="0.2" />
                  <stop offset="50%" stopColor={lightColor} stopOpacity="1" />
                  <stop offset="100%" stopColor={mainColor} stopOpacity="0.2" />
                </linearGradient>
                <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor={lightColor} floodOpacity="0.9" />
                </filter>
              </defs>

              <path
                id={pathId}
                d={pathD}
                fill="none"
                stroke={`url(#${gradientId})`}
                strokeWidth="2.5"
                strokeDasharray="4 4"
                strokeLinecap="round"
              />

              {/* Kalkış ve Varış Noktaları */}
              <circle cx="12" cy={startY} r="3.5" className={isReturn ? "fill-indigo-500" : "fill-blue-500"} />
              <circle cx="12" cy={startY} r="6" className={isReturn ? "fill-indigo-500/20" : "fill-blue-500/20"} />

              {/* Durak / Aktarma Noktası (Layover Node) */}
              {layoverInfo.isConnecting && (
                <g>
                  <circle cx="100" cy={midY} r="4" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="1.5" />
                  <circle cx="100" cy={midY} r="8" fill="#F59E0B" fillOpacity="0.25" />
                </g>
              )}

              <circle cx="188" cy={endY} r="3.5" className={isReturn ? "fill-indigo-500" : "fill-blue-500"} />
              <circle cx="188" cy={endY} r="6" className={isReturn ? "fill-indigo-500/20" : "fill-blue-500/20"} />

              {/* Sağa Bakan Uçak İkonu */}
              <g filter={`url(#${glowId})`}>
                <path
                  d="M 10 0 L 3 -2.5 L -2 -9 L -4.5 -9 L -2 -2.5 L -7 -2.5 L -9 -6 L -11 -6 L -9.5 0 L -11 6 L -9 6 L -7 2.5 L -2 2.5 L -4.5 9 L -2 9 L 3 2.5 Z"
                  fill={mainColor}
                />
                <animateMotion
                  rotate="auto"
                  dur="2.8s"
                  repeatCount="indefinite"
                  calcMode="spline"
                  keyTimes="0; 1"
                  keySplines="0.4 0 0.2 1"
                >
                  <mpath href={`#${pathId}`} />
                </animateMotion>
              </g>
            </svg>
          </div>
        </div>

        <div className="flex-1 text-center">
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
            {formatFlightTime(arrivalTime)}
          </div>
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5 truncate">
            {arrivalCity || "-"}
          </div>
        </div>
      </div>

      <div className="mt-2 flex justify-between text-[11px] text-slate-400 dark:text-slate-500">
        <span>{formatFlightDateTime(departureTime)}</span>
        <span>{formatFlightDateTime(arrivalTime)}</span>
      </div>

      {/* Detaylı Uçuş Bacakları Breakdown (2 Leg Details) */}
      {layoverInfo.isConnecting && (
        <div className="mt-4 pt-4 border-t border-slate-200/80 dark:border-slate-700/80 space-y-2.5">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Uçuş Adımları (2 Bacak)</span>
            <span className="text-[11px] text-amber-500 font-semibold">1 Durak / Aktarma</span>
          </div>

          {/* Leg 1 */}
          <div className="flex items-center justify-between bg-white dark:bg-slate-900/60 p-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-500 font-bold flex items-center justify-center text-[10px]">1</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{departureCity || "Kalkış"}</span>
              <ArrowRight size={12} className="text-slate-400" />
              <span className="font-bold text-slate-800 dark:text-slate-200">{layoverInfo.connectingCity}</span>
            </div>
            <span className="font-mono text-slate-500 dark:text-slate-400">{formatFlightTime(departureTime)} - {formatFlightTime(layoverInfo.leg1ArrivalTime)}</span>
          </div>

          {/* Layover Badge */}
          <div className="flex items-center justify-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 py-1.5 px-3 rounded-lg text-xs font-bold shadow-xs">
            <Clock size={13} />
            <span>⏱ {layoverInfo.connectingCity} • {layoverInfo.layoverDuration} Bekleme Süresi</span>
          </div>

          {/* Leg 2 */}
          <div className="flex items-center justify-between bg-white dark:bg-slate-900/60 p-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-500 font-bold flex items-center justify-center text-[10px]">2</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{layoverInfo.connectingCity}</span>
              <ArrowRight size={12} className="text-slate-400" />
              <span className="font-bold text-slate-800 dark:text-slate-200">{arrivalCity || "Varış"}</span>
            </div>
            <span className="font-mono text-slate-500 dark:text-slate-400">{formatFlightTime(layoverInfo.leg2DepartureTime)} - {formatFlightTime(arrivalTime)}</span>
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50 flex items-center gap-2">
        <Briefcase size={14} className="text-amber-500" />
        <span className="text-sm text-slate-600 dark:text-slate-300">
          <strong className="font-semibold">Bagaj:</strong> {baggage || "15kg"}
        </span>
      </div>
    </div>
  );
}

export default function FlightDetailPanel({ flight, bookingDetails, sessionId, onClose, onProceed }) {
  const { t } = useTranslation();
  const { isFavorite, toggleFavorite } = useFavorites();

  if (!flight) return null;

  const formattedPrice = flight.price != null && !isNaN(flight.price)
    ? new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: flight.currency || 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(flight.price)
    : `${flight.price} ${flight.currency || 'TRY'}`;

  const layoverInfo = getLayoverData(flight, false);
  const isFav = isFavorite(flight);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 font-sans w-full relative">
      {/* Header Banner */}
      <div className="relative min-h-[220px] p-6 shrink-0 overflow-hidden bg-slate-50 dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
        {/* Subtle Ambient Light Glows */}
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-blue-500/10 dark:bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="absolute right-4 top-4 z-20 flex items-center gap-2">
          <button
            type="button"
            onClick={() => toggleFavorite(flight, { sessionId })}
            className="rounded-full bg-white dark:bg-slate-800 p-2 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer border border-slate-200/80 dark:border-slate-700 shadow-xs"
            title={isFav ? t("favorites_remove", "Favorilerden Çıkar") : t("favorites_add", "Favorilere Ekle")}
          >
            <Heart size={20} className={isFav ? "fill-rose-500 text-rose-500" : ""} />
          </button>
          <button
            onClick={onClose}
            className="rounded-full bg-white dark:bg-slate-800 p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer border border-slate-200/80 dark:border-slate-700 shadow-xs"
          >
            <X size={20} />
          </button>
        </div>

        {/* Airline Brand / Logo Header */}
        <div className="relative z-10 flex items-center justify-between pt-1">
          <AirlineLogo
            airline={flight.airline}
            className="h-9 sm:h-10 w-auto object-contain max-w-[200px] rounded-lg"
          />
        </div>

        {/* Glassmorphism Title Area */}
        <div className="relative z-10 mt-6 backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-lg shadow-slate-200/40 dark:shadow-black/30">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            <span>{bookingDetails?.departureCity || t("reservation_departure", "Gidiş")}</span>
            <ArrowRight size={26} className="text-blue-600 dark:text-blue-400 shrink-0" />
            <span>{bookingDetails?.arrivalCity || t("reservation_arrival", "Varış")}</span>
          </h2>
          <div className="mt-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide flex items-center gap-2">
            <span>{layoverInfo.label}</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        <FlightSegment
          title={t("reservation_departure")}
          departureCity={bookingDetails?.departureCity}
          arrivalCity={bookingDetails?.arrivalCity}
          departureTime={flight.departureTime}
          arrivalTime={flight.arrivalTime}
          baggage={flight.baggage}
          icon={Plane}
          isReturn={false}
          flight={flight}
        />

        {flight.returnDepartureTime && (
          <FlightSegment
            title={t("reservation_return_departure", "Dönüş")}
            departureCity={bookingDetails?.arrivalCity}
            arrivalCity={bookingDetails?.departureCity}
            departureTime={flight.returnDepartureTime}
            arrivalTime={flight.returnArrivalTime}
            baggage={flight.returnBaggage || flight.baggage}
            icon={ArrowDown}
            isReturn={true}
            flight={flight}
          />
        )}

        {(bookingDetails?.checkIn || bookingDetails?.guests) && (
          <div className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl p-4 flex flex-wrap gap-y-3 gap-x-6">
            {bookingDetails?.checkIn && (
              <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <Calendar size={16} className="text-blue-500" />
                <span className="font-semibold">{formatFlightDateTime(bookingDetails.checkIn)}</span>
              </div>
            )}
            {bookingDetails?.guests && (
              <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <Clock size={16} className="text-blue-500" />
                <span className="font-semibold">{bookingDetails.guests}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer / Action */}
      <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shadow-[0_-10px_20px_rgba(0,0,0,0.02)] flex items-center justify-between gap-4">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            {t("hoteldetail_total_price")}
          </span>
          <span className="text-2xl font-extrabold text-[#3B82F6] dark:text-blue-400">{formattedPrice}</span>
        </div>
        <button
          onClick={onProceed}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-lg shadow-md shadow-amber-500/20 transition-all active:scale-[0.98] flex-shrink-0"
        >
          {t("flightdetail_start_reservation", "Uçak Bileti Al")}
        </button>
      </div>
    </div>
  );
}
