import React, { useState, useEffect } from 'react';
import { X, ArrowLeft, User, Mail, Phone, Baby, ShieldCheck, ChevronDown, ChevronUp, MapPin, Star, Info, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import api from '../services/api';

function toDateOnly(value) {
  if (!value) return null;
  const match = /^\d{4}-\d{2}-\d{2}/.exec(value);
  if (match) return match[0];
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

export default function ReservationFormPanel({ 
  hotel, 
  bookingDetails, 
  onClose, 
  onBack,
  guests,
  setGuests,
  termsAccepted,
  setTermsAccepted
}) {
  const { t } = useTranslation();

  // Expansion state for accordion
  const [expandedGuestId, setExpandedGuestId] = useState('adult-0');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [reservationResult, setReservationResult] = useState(null);

  useEffect(() => {
    if (!guests && hotel) {
      // Fallback to 1 adult if counts are missing
      const adultCount = parseInt(bookingDetails?.adultCount) || 1;
      const childCount = parseInt(bookingDetails?.childCount) || 0;
      const childAges = bookingDetails?.childAges || [];

      const initialGuests = [];
      
      // Add adults
      for (let i = 0; i < adultCount; i++) {
        initialGuests.push({
          id: `adult-${i}`,
          type: 'ADULT',
          firstName: '',
          lastName: '',
          identityNumber: '',
          email: i === 0 ? '' : undefined,
          phone: i === 0 ? '' : undefined,
        });
      }

      // Add children
      for (let i = 0; i < childCount; i++) {
        initialGuests.push({
          id: `child-${i}`,
          type: 'CHILD',
          firstName: '',
          lastName: '',
          identityNumber: '',
          age: childAges[i] !== undefined ? childAges[i].toString() : '',
        });
      }
      setGuests(initialGuests);
    }
  }, [hotel, bookingDetails, guests, setGuests]);

  if (!hotel) return null;

  if (reservationResult) {
    return (
      <div className="flex flex-col h-full bg-slate-50 font-sans w-full relative items-center justify-center p-8 text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-black/10 hover:bg-black/20 text-slate-600 rounded-full transition-colors"
        >
          <X size={20} />
        </button>
        <CheckCircle2 size={48} className="text-emerald-500 mb-4" />
        <p className="text-slate-800 font-medium mb-6 max-w-sm">
          {t('reservation_confirm_success', { number: reservationResult.reservationNumber })}
        </p>
        <button
          onClick={onClose}
          className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl shadow-md transition-all"
        >
          {t('reservation_ok')}
        </button>
      </div>
    );
  }

  const handleGuestChange = (index, field, value) => {
    setGuests(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!termsAccepted) {
      alert("Lütfen şartlar ve koşulları kabul ediniz.");
      return;
    }

    const primaryGuest = guests?.[0];
    const payload = {
      type: 'HOTEL',
      itemName: hotel.name || hotel.hotelId || '-',
      destination: locationText || hotel.city || hotel.region || '-',
      startDate: toDateOnly(bookingDetails?.checkIn),
      endDate: toDateOnly(bookingDetails?.checkOut),
      totalPrice: Number(hotel.price) || 0,
      currency: hotel.currency || 'TRY',
      passengers: (guests || []).map((g) => ({
        firstName: g.firstName,
        lastName: g.lastName,
        email: g.email || primaryGuest?.email || '',
        phoneNumber: g.phone || primaryGuest?.phone || '',
        identityNumber: g.identityNumber,
      })),
    };

    setSubmitError('');
    setIsSubmitting(true);
    try {
      const response = await api.post('/api/reservations', payload);
      setReservationResult(response.data);
    } catch (err) {
      console.error('Reservation creation failed', err);
      setSubmitError(t('reservation_confirm_error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const formattedPrice = hotel.price != null && !isNaN(hotel.price)
    ? new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: hotel.currency || 'TRY',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(hotel.price)
    : `${hotel.price} ${hotel.currency || 'TRY'}`;

  // Fake itemized pricing since API doesn't provide splits yet
  const roomPriceValue = hotel.price != null && !isNaN(hotel.price) ? hotel.price * 0.92 : null;
  const taxValue = hotel.price != null && !isNaN(hotel.price) ? hotel.price * 0.08 : null;

  const formatSubPrice = (val) => {
    if (val === null) return "-";
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: hotel.currency || 'TRY',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val);
  };

  const locationParts = [hotel.city, hotel.town, hotel.village, hotel.region].filter(Boolean);
  const uniqueLocationParts = [...new Set(locationParts)];
  const locationText = uniqueLocationParts.length > 0 ? uniqueLocationParts.join(', ') : '';

  const adultCount = parseInt(bookingDetails?.adultCount) || 1;

  return (
    <div className="flex flex-col h-full bg-slate-50 font-sans w-full relative">
      
      {/* Header / Thumbnail (Matches HotelDetailPanel) */}
      <div className="relative h-48 md:h-64 flex-shrink-0 bg-slate-200">
        {(hotel.thumbnailFull || hotel.thumbnail) ? (
          <img
            src={hotel.thumbnailFull || hotel.thumbnail}
            alt={hotel.name || "Hotel"}
            className="w-full h-full object-cover"
            onError={(e) => { 
              e.currentTarget.style.display = 'none'; 
            }}
          />
        ) : null}
        
        {/* Back Button */}
        {onBack && (
          <button
            onClick={onBack}
            className="absolute top-4 left-4 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors backdrop-blur-md flex items-center gap-1 pr-4 text-sm font-semibold"
          >
            <ArrowLeft size={18} /> Geri
          </button>
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
          <div className="mb-1 text-amber-400 text-xs font-bold uppercase tracking-widest drop-shadow-md">Rezervasyon Detayları</div>
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

      {/* Body: Guest Forms & Summary */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-3xl mx-auto space-y-6">
          <form id="reservation-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Guests Accordion */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">Konuk Bilgileri</h3>
              {guests && guests.map((guest, index) => {
                const isExpanded = expandedGuestId === guest.id;
                const guestTitle = guest.type === 'ADULT' 
                  ? `${index + 1}. Yetişkin` 
                  : `${index - adultCount + 1}. Çocuk`;

                return (
                  <div key={guest.id} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden transition-all duration-200">
                    <button
                      type="button"
                      onClick={() => setExpandedGuestId(isExpanded ? null : guest.id)}
                      className="w-full px-5 py-4 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {guest.type === 'ADULT' ? <User size={18} className="text-blue-500"/> : <Baby size={18} className="text-amber-500"/>}
                        <span className="font-bold text-slate-800 text-sm">{guestTitle}</span>
                        {index === 0 && <span className="ml-2 text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full uppercase tracking-wider">İletişim</span>}
                        
                        {/* Summary when collapsed */}
                        {!isExpanded && (guest.firstName || guest.lastName) && (
                          <span className="text-sm text-slate-500 ml-2 border-l border-slate-200 pl-4">
                            {guest.firstName} {guest.lastName}
                          </span>
                        )}
                      </div>
                      <div className="text-slate-400">
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="p-5 border-t border-slate-100 bg-slate-50/50 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="col-span-1">
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Ad</label>
                            <input
                              required
                              type="text"
                              value={guest.firstName}
                              onChange={(e) => handleGuestChange(index, 'firstName', e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-colors"
                            />
                          </div>
                          <div className="col-span-1">
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Soyad</label>
                            <input
                              required
                              type="text"
                              value={guest.lastName}
                              onChange={(e) => handleGuestChange(index, 'lastName', e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-colors"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className={guest.type === 'CHILD' ? "col-span-1" : "col-span-2"}>
                            <label className="block text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1">
                              <ShieldCheck size={12}/> TC Kimlik No / Pasaport
                            </label>
                            <input
                              required
                              type="text"
                              value={guest.identityNumber}
                              onChange={(e) => handleGuestChange(index, 'identityNumber', e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-colors"
                            />
                          </div>
                          {guest.type === 'CHILD' && (
                            <div className="col-span-1">
                              <label className="block text-xs font-semibold text-slate-500 mb-1">Yaş</label>
                              <input
                                required
                                type="number"
                                min="0"
                                max="17"
                                value={guest.age}
                                onChange={(e) => handleGuestChange(index, 'age', e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-colors"
                              />
                            </div>
                          )}
                        </div>

                        {index === 0 && (
                          <div className="pt-2 border-t border-slate-200/60 mt-4 space-y-4">
                            <div>
                              <label className="block text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1">
                                <Mail size={12}/> E-posta
                              </label>
                              <input
                                required
                                type="email"
                                value={guest.email}
                                onChange={(e) => handleGuestChange(index, 'email', e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-colors"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1">
                                <Phone size={12}/> Telefon
                              </label>
                              <PhoneInput
                                international
                                defaultCountry="TR"
                                value={guest.phone}
                                onChange={(val) => handleGuestChange(index, 'phone', val)}
                                className="flex items-center w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus-within:ring-2 focus-within:ring-amber-500/50 focus-within:border-amber-500 transition-colors"
                                numberInputProps={{
                                  required: true,
                                  className: 'bg-transparent border-0 outline-none w-full text-slate-800 focus:ring-0 ml-2 py-1',
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Cancellation Policy Block */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
              <Info size={20} className="text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-sm text-blue-900">İptal Politikası</h4>
                <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                  {hotel.isRefundable === true 
                    ? "Bu rezervasyon ücretsiz iptal edilebilir." 
                    : hotel.isRefundable === false 
                      ? "Bu rezervasyon iade edilemez." 
                      : "İptal koşulları rezervasyon onayı sonrası bildirilecektir."}
                </p>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Fiyat Özeti</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center text-slate-600">
                  <span>Oda Fiyatı ({bookingDetails?.guests || '1 Oda'})</span>
                  <span className="font-medium">{formatSubPrice(roomPriceValue)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Vergiler ve Harçlar</span>
                  <span className="font-medium">{formatSubPrice(taxValue)}</span>
                </div>
                <div className="pt-3 mt-3 border-t border-slate-100 flex justify-between items-end">
                  <span className="font-bold text-slate-800">Toplam</span>
                  <span className="text-xl font-extrabold text-[#3B82F6]">{formattedPrice}</span>
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start gap-3 p-2">
              <input 
                type="checkbox" 
                id="terms" 
                required
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-1 w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label htmlFor="terms" className="text-xs text-slate-600 leading-relaxed cursor-pointer select-none">
                <span className="text-blue-600 hover:underline">Satış Sözleşmesini</span> ve <span className="text-blue-600 hover:underline">İptal/İade Koşullarını</span> okudum, anladım ve kabul ediyorum.
              </label>
            </div>

          </form>
        </div>
      </div>

      {/* Sticky Footer / Action */}
      <div className="p-4 md:p-6 bg-white border-t border-slate-200 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] sticky bottom-0 z-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col w-full md:w-auto text-center md:text-left">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Toplam Tutar</span>
          <span className="text-2xl font-extrabold text-[#3B82F6] leading-none">{formattedPrice}</span>
          {submitError && <span className="text-xs text-red-600 font-medium mt-1">{submitError}</span>}
        </div>
        <button
          type="submit"
          form="reservation-form"
          disabled={!termsAccepted || isSubmitting}
          className="w-full md:w-auto md:min-w-[240px] py-3.5 px-6 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <ShieldCheck size={18} />
          {isSubmitting ? t('reservation_submitting') : 'Rezervasyonu Onayla'}
        </button>
      </div>
    </div>
  );
}
