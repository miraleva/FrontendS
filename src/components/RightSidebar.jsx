import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Hotel, Plane, Users, Sparkles, PanelRightClose } from 'lucide-react';
import LanguageSelector from './LanguageSelector';

export default function RightSidebar({
  isRightSidebarOpen,
  setIsRightSidebarOpen,
  searchType,
  bookingDetails,
  selectedHotel
}) {
  const navigate = useNavigate();

  if (!isRightSidebarOpen) return null;

  return (
    <div className="hidden lg:flex w-[320px] h-full border-l border-white/20 bg-white/10 backdrop-blur-xl p-6 flex-col justify-between animate-slide-in relative z-20">
      <div className="space-y-6">

        {/* Panel Başlığı */}
        <div className="flex flex-col gap-3 pb-4 border-b border-white/10">
          <div className="flex justify-between items-center w-full">
            <button
              onClick={() => setIsRightSidebarOpen(false)}
              className="p-1.5 hover:bg-slate-100/50 rounded-lg transition-colors text-slate-500 hover:text-slate-800 focus:outline-none cursor-pointer"
              title="Collapse Panel"
            >
              <PanelRightClose size={18} />
            </button>
            <LanguageSelector className="relative z-50 scale-90 origin-right" />
          </div>
          
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-600 flex-shrink-0">
              <Sparkles size={18} className="animate-pulse" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-800 text-sm">Canlı Rezervasyon</h3>
              <p className="text-[10px] text-slate-500">
                {searchType === "hotel" ? "Otel aramanız güncelleniyor" : "Uçuş detaylarınız güncelleniyor"}
              </p>
            </div>
          </div>
        </div>

        {/* Kart Görünümü */}
        <div className="bg-white/70 border border-white/40 rounded-2xl p-5 shadow-sm space-y-4">

          {/* ================= OTEL MODU ALANLARI ================= */}
          {searchType === "hotel" && (
            <>
              {/* Nerede */}
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-slate-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Nerede</span>
                  <span className={`text-sm font-semibold truncate block ${bookingDetails.city ? "text-slate-800" : "text-slate-400 italic"}`}>
                    {bookingDetails.city || "Konum belirtilmedi..."}
                  </span>
                </div>
              </div>

              {/* Giriş Tarihi */}
              <div className="flex items-start gap-3 pt-3 border-t border-dashed border-slate-200">
                <Calendar size={18} className="text-slate-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Giriş Tarihi</span>
                  <span className={`text-sm font-semibold truncate block ${bookingDetails.checkIn ? "text-slate-800" : "text-slate-400 italic"}`}>
                    {bookingDetails.checkIn || "Giriş tarihi belirtilmedi..."}
                  </span>
                </div>
              </div>

              {/* Çıkış Tarihi */}
              <div className="flex items-start gap-3 pt-3 border-t border-dashed border-slate-200">
                <Calendar size={18} className="text-slate-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Çıkış Tarihi</span>
                  <span className={`text-sm font-semibold truncate block ${bookingDetails.checkOut ? "text-slate-800" : "text-slate-400 italic"}`}>
                    {bookingDetails.checkOut || "Çıkış tarihi belirtilmedi..."}
                  </span>
                </div>
              </div>

              {/* Seçilen Otel */}
              <div className="flex items-start gap-3 pt-3 border-t border-dashed border-slate-200">
                <Hotel size={18} className="text-slate-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Seçilen Otel</span>
                  <span className={`text-sm font-semibold block truncate ${bookingDetails.hotelName ? "text-slate-800" : "text-slate-400 italic"}`}>
                    {bookingDetails.hotelName || "Sohbetten seçin..."}
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
                  <Plane size={18} className="text-slate-400 rotate-45" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Kalkış Noktası</span>
                  <span className={`text-sm font-semibold truncate block ${bookingDetails.departureCity ? "text-slate-800" : "text-slate-400 italic"}`}>
                    {bookingDetails.departureCity || "Kalkış noktası belirtilmedi..."}
                  </span>
                </div>
              </div>

              {/* Varış Noktası */}
              <div className="flex items-start gap-3 pt-3 border-t border-dashed border-slate-200">
                <div className="relative mt-1 flex-shrink-0">
                  <Plane size={18} className="text-[#3B82F6] rotate-90" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Varış Noktası</span>
                  <span className={`text-sm font-semibold truncate block ${bookingDetails.arrivalCity ? "text-slate-800" : "text-slate-400 italic"}`}>
                    {bookingDetails.arrivalCity || "Varış noktası belirtilmedi..."}
                  </span>
                </div>
              </div>

              {/* Uçuş Tarihi */}
              <div className="flex items-start gap-3 pt-3 border-t border-dashed border-slate-200">
                <Calendar size={18} className="text-slate-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Uçuş Tarihi</span>
                  <span className={`text-sm font-semibold truncate block ${bookingDetails.checkIn ? "text-slate-800" : "text-slate-400 italic"}`}>
                    {bookingDetails.checkIn || "Uçuş tarihi belirtilmedi..."}
                  </span>
                </div>
              </div>

              {/* Seçilen Havayolu */}
              <div className="flex items-start gap-3 pt-3 border-t border-dashed border-slate-200">
                <Plane size={18} className="text-slate-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Seçilen Havayolu</span>
                  <span className={`text-sm font-semibold block truncate ${bookingDetails.airline ? "text-slate-800" : "text-slate-400 italic"}`}>
                    {bookingDetails.airline || "Sohbetten uçuş seçin..."}
                  </span>
                </div>
              </div>
            </>
          )}

          {/* ================= ORTAK ALAN: YOLCU / KONUK SAYISI ================= */}
          <div className="flex items-start gap-3 pt-3 border-t border-slate-200">
            <Users size={18} className="text-slate-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">
                {searchType === "hotel" ? "Konuk Sayısı" : "Yolcu Sayısı"}
              </span>
              <span className={`text-sm font-semibold truncate block ${bookingDetails.guests ? "text-slate-800" : "text-slate-400 italic"}`}>
                {bookingDetails.guests || "Belirtilmedi..."}
              </span>
            </div>
          </div>

          {/* Fiyat Bilgisi */}
          {bookingDetails.price && (
            <div className="pt-3 border-t border-dashed border-slate-200 flex justify-between items-center">
              <span className="text-xs text-slate-500 font-bold">Toplam Tutar:</span>
              <span className="text-sm font-extrabold text-amber-600">{bookingDetails.price}</span>
            </div>
          )}

        </div>
      </div>

      {/* Alt Bilgi & CTA */}
      <div className="space-y-3">
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-center">
          <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
            Tüm alanlar tamamlandığında hızlıca ödeme ve onay sayfasına geçebilirsin.
          </p>
        </div>
        <button
          disabled={
            searchType === "hotel"
              ? !bookingDetails.city || !bookingDetails.checkIn || !bookingDetails.checkOut || !selectedHotel
              : !bookingDetails.departureCity || !bookingDetails.arrivalCity || !bookingDetails.checkIn
          }
          onClick={() => {
            navigate('/reservation', {
              state: {
                selectedItem: selectedHotel,
                bookingDetails: bookingDetails
              }
            });
          }}
          className="w-full py-3 bg-amber-500 text-white rounded-xl text-xs font-bold shadow-md hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          {searchType === "hotel" ? "Otel Rezervasyonunu Tamamla" : "Uçuş Biletini Satın Al"}
        </button>
      </div>
    </div>
  );
}
