import React, { useState, useEffect } from 'react';
import { X, MapPin, Star, Calendar, Users, CheckCircle, BedDouble, ChevronLeft, ChevronRight, Loader2, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const PHOTO_AUTOPLAY_MS = 2000;
const DESCRIPTION_PREVIEW_LENGTH = 220;

function formatDate(value) {
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

export default function HotelDetailPanel({ hotel, bookingDetails, loadingDetail, onClose, onProceed }) {
  const { t } = useTranslation();
  const [photoIndex, setPhotoIndex] = useState(0);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  // Otel değiştiğinde (yeni bir karta tıklanınca) galeriyi ve açıklamayı başa sar
  useEffect(() => {
    setPhotoIndex(0);
    setDescriptionExpanded(false);
  }, [hotel?.hotelId]);

  const photos = Array.isArray(hotel?.photos) && hotel.photos.length > 0
    ? hotel.photos
    : ((hotel?.thumbnailFull || hotel?.thumbnail) ? [hotel.thumbnailFull || hotel.thumbnail] : []);
  const hasMultiplePhotos = photos.length > 1;

  // Fotoğraflar arasında otomatik geçiş — her biri ~2 saniye gösterilir
  useEffect(() => {
    if (!hasMultiplePhotos) return;
    const timer = setInterval(() => {
      setPhotoIndex(i => (i + 1) % photos.length);
    }, PHOTO_AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [hasMultiplePhotos, photos.length]);

  if (!hotel) return null;

  const goToPrevPhoto = (e) => {
    e.stopPropagation();
    setPhotoIndex(i => (i - 1 + photos.length) % photos.length);
  };
  const goToNextPhoto = (e) => {
    e.stopPropagation();
    setPhotoIndex(i => (i + 1) % photos.length);
  };

  // TourVisio açıklama metinleri bazen HTML içerebiliyor — dangerouslySetInnerHTML
  // kullanmadan güvenli şekilde düz metne indirgiyoruz.
  const plainDescription = hotel.description
    ? hotel.description.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    : null;
  const isDescriptionLong = plainDescription && plainDescription.length > DESCRIPTION_PREVIEW_LENGTH;
  const displayedDescription = plainDescription && isDescriptionLong && !descriptionExpanded
    ? plainDescription.slice(0, DESCRIPTION_PREVIEW_LENGTH).trim() + "…"
    : plainDescription;

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
      {/* Header / Fotoğraf Galerisi */}
      <div className="relative h-48 md:h-64 flex-shrink-0 bg-slate-200">
        {photos.length > 0 ? (
          <img
            key={photoIndex}
            src={photos[photoIndex]}
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
        <div className={`absolute inset-0 flex items-center justify-center ${photos.length > 0 ? 'hidden' : ''}`}>
          <span className="text-5xl">🏨</span>
        </div>

        {/* Detay yüklenirken küçük bir gösterge (galeri zaten thumbnail ile açılmış olur) */}
        {loadingDetail && (
          <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-black/50 text-white text-xs px-2.5 py-1.5 rounded-full backdrop-blur-md">
            <Loader2 size={12} className="animate-spin" />
            Fotoğraflar yükleniyor
          </div>
        )}

        {/* Galeri Ok Butonları */}
        {hasMultiplePhotos && (
          <>
            <button
              onClick={goToPrevPhoto}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors backdrop-blur-md"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={goToNextPhoto}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors backdrop-blur-md"
            >
              <ChevronRight size={18} />
            </button>
            {/* Nokta Göstergeleri */}
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-1.5">
              {photos.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${i === photoIndex ? "bg-white w-4" : "bg-white/50 w-1.5"}`}
                />
              ))}
            </div>
          </>
        )}

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
            {(hotel.address || locationText) && (
              <span className="text-white/90 text-sm flex items-center gap-1">
                <span className="text-white/40">•</span>
                <MapPin size={14} className="ml-1 opacity-80" />
                {hotel.address || locationText}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Body / Scrollable Info */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* Açıklama */}
        {plainDescription && (
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Info size={12} />
              Otel Hakkında
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">{displayedDescription}</p>
            {isDescriptionLong && (
              <button
                onClick={() => setDescriptionExpanded(v => !v)}
                className="mt-2 text-xs font-bold text-blue-600 hover:text-blue-700"
              >
                {descriptionExpanded ? "Daha az göster" : "Devamını oku"}
              </button>
            )}
          </div>
        )}

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
                <span className="font-semibold">{formatDate(bookingDetails.checkIn)}</span>
                {bookingDetails.checkOut && (
                  <>
                    <span className="text-slate-400">-</span>
                    <span className="font-semibold">{formatDate(bookingDetails.checkOut)}</span>
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

        {/* Detaylar hâlâ yükleniyorsa (açıklama/olanaklar henüz gelmediyse) küçük bir gösterge */}
        {loadingDetail && !plainDescription && facilitiesList.length === 0 && themesList.length === 0 && (
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Loader2 size={14} className="animate-spin" />
            Otel detayları yükleniyor...
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
