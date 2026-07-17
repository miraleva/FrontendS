import React from 'react';
import { X, MapPin, Star, Calendar, Users, CheckCircle, BedDouble } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function HotelDetailPanel({ hotel, bookingDetails, onClose, onProceed }) {
  const { t } = useTranslation();

  if (!hotel) return null;

  const formattedPrice = hotel.price != null && !isNaN(hotel.price)
    ? new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: hotel.currency || 'TRY',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(hotel.price)
    : `${hotel.price} ${hotel.currency || 'TRY'}`;

  const locationParts = [hotel.city, hotel.town, hotel.village, hotel.region].filter(Boolean);
  const uniqueLocationParts = [...new Set(locationParts)];
  const locationText = uniqueLocationParts.length > 0 ? uniqueLocationParts.join(', ') : '';

  // Facilities formatting if it's an array or string
  let facilitiesList = [];
  if (Array.isArray(hotel.facilities)) {
    facilitiesList = hotel.facilities;
  } else if (typeof hotel.facilities === 'string') {
    facilitiesList = hotel.facilities.split(',').map(f => f.trim()).filter(Boolean);
  }

  // Themes formatting
  let themesList = [];
  if (Array.isArray(hotel.themes)) {
    themesList = hotel.themes;
  } else if (typeof hotel.themes === 'string') {
    themesList = hotel.themes.split(',').map(f => f.trim()).filter(Boolean);
  }

  return (
    <div className="flex flex-col h-full bg-white font-sans w-full relative">
      {/* Header / Thumbnail */}
      <div className="relative h-48 md:h-64 flex-shrink-0 bg-slate-200">
        {(hotel.thumbnailFull || hotel.thumbnail) ? (
          <img
            src={hotel.thumbnailFull || hotel.thumbnail}
            alt={hotel.name || "Hotel"}
            className="w-full h-full object-cover"
            onError={(e) => { 
              e.currentTarget.style.display = 'none'; 
              if (e.currentTarget.nextElementSibling) {
                e.currentTarget.nextElementSibling.classList.remove('hidden');
              }
            }}
          />
        ) : null}
        <div className="absolute inset-0 flex items-center justify-center hidden">
          <span className="text-5xl">🏨</span>
        </div>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors backdrop-blur-md"
        >
          <X size={20} />
        </button>
        
        {/* Gradient Overlay for Text */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 pt-12">
          <h2 className="text-2xl md:text-3xl font-bold text-white drop-shadow-md leading-tight">
            {hotel.name || hotel.hotelId}
          </h2>
          <div className="flex items-center gap-2 mt-2">
            {hotel.stars && (
              <span className="text-amber-400 text-sm flex-shrink-0 flex items-center">
                {hotel.stars} <Star size={14} className="ml-1 fill-amber-400" />
              </span>
            )}
            {locationText && (
              <span className="text-white/90 text-sm flex items-center gap-1">
                <span className="text-white/40">•</span>
                <MapPin size={14} className="ml-1 opacity-80" />
                {locationText}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Body / Scrollable Info */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* Core Info Row */}
        <div className="flex flex-wrap gap-3">
          {(hotel.boardName || hotel.boardType || hotel.pensionType) && (
            <div className="px-3 py-1.5 rounded-lg bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
              {hotel.boardName || hotel.boardType || hotel.pensionType}
            </div>
          )}
          {hotel.roomName && (
            <div className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-sm font-semibold flex items-center gap-1.5 border border-blue-100">
              <BedDouble size={14} />
              {hotel.roomName}
            </div>
          )}
        </div>

        {/* Booking Context (from chat context) */}
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col gap-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Arama Detayları</h3>
          <div className="flex flex-wrap gap-y-3 gap-x-6">
            {bookingDetails?.checkIn && (
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <Calendar size={16} className="text-blue-500" />
                <span className="font-semibold">{bookingDetails.checkIn}</span>
                {bookingDetails.checkOut && (
                  <>
                    <span className="text-slate-400">-</span>
                    <span className="font-semibold">{bookingDetails.checkOut}</span>
                  </>
                )}
              </div>
            )}
            {bookingDetails?.guests && (
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <Users size={16} className="text-blue-500" />
                <span className="font-semibold">{bookingDetails.guests}</span>
              </div>
            )}
          </div>
        </div>

        {/* Themes/Badges */}
        {themesList.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Temalar</h3>
            <div className="flex flex-wrap gap-2">
              {themesList.map((theme, i) => (
                <span key={i} className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-md text-xs font-semibold">
                  {theme}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Facilities */}
        {facilitiesList.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Olanaklar</h3>
            <div className="grid grid-cols-2 gap-2">
              {facilitiesList.map((facility, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-slate-600">
                  <CheckCircle size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="leading-tight">{facility}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Footer / Action */}
      <div className="p-6 bg-white border-t border-slate-100 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
        <div className="flex items-end justify-between mb-4">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Toplam Fiyat</span>
            <span className="text-2xl font-extrabold text-[#3B82F6]">{formattedPrice}</span>
          </div>
        </div>
        <button
          onClick={onProceed}
          className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-md shadow-amber-500/20 transition-all active:scale-[0.98]"
        >
          Rezervasyona Başla
        </button>
      </div>
    </div>
  );
}
