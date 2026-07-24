import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, Calendar, Hotel, Plane, Users, Sparkles, PanelRightClose, DoorClosed } from 'lucide-react';

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

export default function RightSidebar({
  isRightSidebarOpen,
  setIsRightSidebarOpen,
  searchType,
  bookingDetails,
  selectedHotel,
  selectedFlight,
  sessionId,
  onComplete
}) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const renderGuestsText = (details) => {
    if (!details) return t("panel_count_placeholder");
    const adults = details.adultCount || details.adults || 0;
    const children = details.childCount || details.children || 0;
    const ages = details.childrenAges || details.childAges || [];

    if (adults === 0 && children === 0) {
      // Eğer eski string kaldıysa fallback veya varsayılan placeholder göster
      return details.guests && typeof details.guests === 'string' && !details.guests.includes('Yetişkin')
        ? details.guests
        : t("panel_count_placeholder");
    }

    const parts = [];
    if (adults > 0) {
      parts.push(`${adults} ${t(adults > 1 ? "adults" : "adult")}`);
    }
    if (children > 0) {
      const ageInfo = ages.length > 0 ? ` (${t("age")}: ${ages.join(", ")})` : "";
      parts.push(`${children} ${t(children > 1 ? "children" : "child")}${ageInfo}`);
    }

    return parts.join(", ");
  };

  if (!isRightSidebarOpen) return null;

  const formattedGuestText = renderGuestsText(bookingDetails);

  return (
    <div className="hidden lg:flex w-[320px] h-full border-l border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-6 flex-col justify-between animate-slide-in relative z-20">
      <div className="space-y-6">

        {/* Panel Başlığı */}
        <div className="flex flex-col gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex justify-end items-center w-full">
            <button
              onClick={() => setIsRightSidebarOpen(false)}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 focus:outline-none cursor-pointer"
              title="Collapse Panel"
            >
              <PanelRightClose size={18} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-500/20 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex-shrink-0">
              <Sparkles size={18} className="animate-pulse" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{t("panel_title")}</h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                {searchType === "hotel" ? t("panel_subtitle_hotel") : t("panel_subtitle_flight")}
              </p>
            </div>
          </div>
        </div>

        {/* Kart Görünümü */}
        <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 shadow-sm space-y-4">

          {/* ================= OTEL MODU ALANLARI ================= */}
          {searchType === "hotel" && (
            <>
              {/* Nerede */}
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-slate-400 dark:text-slate-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-bold uppercase">{t("panel_where")}</span>
                  <span className={`text-sm font-semibold truncate block ${bookingDetails.city ? "text-slate-800 dark:text-slate-200" : "text-slate-400 dark:text-slate-500 italic"}`}>
                    {bookingDetails.city || t("panel_where_placeholder")}
                  </span>
                </div>
              </div>

              {/* Giriş Tarihi */}
              <div className="flex items-start gap-3 pt-3 border-t border-dashed border-slate-200 dark:border-slate-800">
                <Calendar size={18} className="text-slate-400 dark:text-slate-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-bold uppercase">{t("panel_checkin")}</span>
                  <span className={`text-sm font-semibold truncate block ${bookingDetails.checkIn ? "text-slate-800 dark:text-slate-200" : "text-slate-400 dark:text-slate-500 italic"}`}>
                    {bookingDetails.checkIn ? formatFlightDateTime(bookingDetails.checkIn) : t("panel_checkin_placeholder")}
                  </span>
                </div>
              </div>

              {/* Çıkış Tarihi */}
              <div className="flex items-start gap-3 pt-3 border-t border-dashed border-slate-200 dark:border-slate-800">
                <Calendar size={18} className="text-slate-400 dark:text-slate-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-bold uppercase">{t("panel_checkout")}</span>
                  <span className={`text-sm font-semibold truncate block ${bookingDetails.checkOut ? "text-slate-800 dark:text-slate-200" : "text-slate-400 dark:text-slate-500 italic"}`}>
                    {bookingDetails.checkOut ? formatFlightDateTime(bookingDetails.checkOut) : t("panel_checkout_placeholder")}
                  </span>
                </div>
              </div>

              {/* Oda Sayısı (Ayrı Satır) */}
              <div className="flex items-start gap-3 pt-3 border-t border-dashed border-slate-200 dark:border-slate-800">
                <DoorClosed size={18} className="text-slate-400 dark:text-slate-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-bold uppercase">{t("panel_room_count")}</span>
                  <span className="text-sm font-semibold truncate block text-slate-800 dark:text-slate-200">
                    {`${bookingDetails.roomCount || 1} ${t((bookingDetails.roomCount || 1) > 1 ? "unit_rooms" : "unit_room")}`}
                  </span>
                </div>
              </div>

              {/* Konuk Sayısı */}
              <div className="flex items-start gap-3 pt-3 border-t border-dashed border-slate-200 dark:border-slate-800">
                <Users size={18} className="text-slate-400 dark:text-slate-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-bold uppercase">{t("panel_guest_count")}</span>
                  <span className={`text-sm font-semibold truncate block ${formattedGuestText !== t("panel_count_placeholder") ? "text-slate-800 dark:text-slate-200" : "text-slate-400 dark:text-slate-500 italic"}`}>
                    {formattedGuestText}
                  </span>
                </div>
              </div>

              {/* Seçilen Otel */}
              <div className="flex items-start gap-3 pt-3 border-t border-dashed border-slate-200 dark:border-slate-800">
                <Hotel size={18} className="text-slate-400 dark:text-slate-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-bold uppercase">{t("panel_selected_hotel")}</span>
                  <span className={`text-sm font-semibold block truncate ${bookingDetails.hotelName ? "text-slate-800 dark:text-slate-200" : "text-slate-400 dark:text-slate-500 italic"}`}>
                    {bookingDetails.hotelName || t("panel_selected_hotel_placeholder")}
                  </span>
                </div>
              </div>
            </>
          )}

          {/* ================= UÇAK MODU ALANLARI ================= */}
          {searchType === "flight" && (
            <>
              {/* Kalkış Noktası */}
              <div className="flex items-start gap-3">
                <div className="relative mt-1 flex-shrink-0">
                  <Plane size={18} className="text-slate-400 dark:text-slate-500 rotate-45" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-bold uppercase">{t("panel_departure_location")}</span>
                  <span className={`text-sm font-semibold truncate block ${bookingDetails.departureCity ? "text-slate-800 dark:text-slate-200" : "text-slate-400 dark:text-slate-500 italic"}`}>
                    {bookingDetails.departureCity || t("panel_departure_location_placeholder")}
                  </span>
                </div>
              </div>

              {/* Varış Noktası */}
              <div className="flex items-start gap-3 pt-3 border-t border-dashed border-slate-200 dark:border-slate-800">
                <div className="relative mt-1 flex-shrink-0">
                  <Plane size={18} className="text-[#3B82F6] rotate-90" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-bold uppercase">{t("panel_arrival_location")}</span>
                  <span className={`text-sm font-semibold truncate block ${bookingDetails.arrivalCity ? "text-slate-800 dark:text-slate-200" : "text-slate-400 dark:text-slate-500 italic"}`}>
                    {bookingDetails.arrivalCity || t("panel_arrival_location_placeholder")}
                  </span>
                </div>
              </div>

              {/* Gidiş Tarihi */}
              <div className="flex items-start gap-3 pt-3 border-t border-dashed border-slate-200 dark:border-slate-800">
                <Calendar size={18} className="text-slate-400 dark:text-slate-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-bold uppercase">{t("panel_departure_date")}</span>
                  <span className={`text-sm font-semibold truncate block ${bookingDetails.checkIn ? "text-slate-800 dark:text-slate-200" : "text-slate-400 dark:text-slate-500 italic"}`}>
                    {bookingDetails.checkIn ? formatFlightDateTime(bookingDetails.checkIn) : t("panel_departure_date_placeholder")}
                  </span>
                </div>
              </div>

              {/* Dönüş Tarihi */}
              {bookingDetails.returnDate && (
                <div className="flex items-start gap-3 pt-3 border-t border-dashed border-slate-200 dark:border-slate-800">
                  <Calendar size={18} className="text-[#3B82F6] mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-bold uppercase">{t("panel_return_date")}</span>
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate block">
                      {formatFlightDateTime(bookingDetails.returnDate)}
                    </span>
                  </div>
                </div>
              )}

              {/* Seçilen Havayolu */}
              <div className="flex items-start gap-3 pt-3 border-t border-dashed border-slate-200 dark:border-slate-800">
                <Plane size={18} className="text-slate-400 dark:text-slate-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-bold uppercase">{t("panel_selected_airline")}</span>
                  <span className={`text-sm font-semibold block truncate ${bookingDetails.airline ? "text-slate-800 dark:text-slate-200" : "text-slate-400 dark:text-slate-500 italic"}`}>
                    {bookingDetails.airline || t("panel_selected_airline_placeholder")}
                  </span>
                </div>
              </div>

              {/* Yolcu Sayısı */}
              <div className="flex items-start gap-3 pt-3 border-t border-dashed border-slate-200 dark:border-slate-800">
                <Users size={18} className="text-slate-400 dark:text-slate-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-bold uppercase">{t("panel_passenger_count")}</span>
                  <span className={`text-sm font-semibold truncate block ${formattedGuestText !== t("panel_count_placeholder") ? "text-slate-800 dark:text-slate-200" : "text-slate-400 dark:text-slate-500 italic"}`}>
                    {formattedGuestText}
                  </span>
                </div>
              </div>
            </>
          )}

          {/* Fiyat Bilgisi */}
          {bookingDetails.price && (
            <div className="pt-3 border-t border-dashed border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">{t("panel_total_amount")}</span>
              <span className="text-sm font-extrabold text-amber-600 dark:text-amber-400">{bookingDetails.price}</span>
            </div>
          )}

        </div>
      </div>

      {/* Alt Bilgi & CTA */}
      <div className="space-y-3">
        <div className="bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/20 dark:border-amber-500/10 rounded-xl p-3 text-center">
          <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
            {t("panel_footer_hint")}
          </p>
        </div>
        <button
          disabled={
            searchType === "hotel"
              ? !bookingDetails.city || !bookingDetails.checkIn || !bookingDetails.checkOut || !selectedHotel
              : !bookingDetails.departureCity || !bookingDetails.arrivalCity || !bookingDetails.checkIn || !selectedFlight
          }
          onClick={() => {
            if (onComplete) {
              onComplete();
            } else {
              navigate('/reservation', {
                state: {
                  selectedItem: searchType === "hotel" ? selectedHotel : selectedFlight,
                  bookingDetails: bookingDetails,
                  sessionId: sessionId
                }
              });
            }
          }}
          className="w-full py-3 bg-amber-500 text-white rounded-xl text-xs font-bold shadow-md hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          {searchType === "hotel" ? t("panel_complete_hotel") : t("panel_complete_flight")}
        </button>
      </div>
    </div>
  );
}