import React, { useState, useEffect } from 'react';
import { X, ArrowLeft, User, Mail, Phone, Baby, ShieldCheck, ChevronDown, ChevronUp, MapPin, Star, Info, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
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

const getPassengerErrors = (p, isValidPhoneNumber) => {
  const errors = {};
  if (!p.firstName?.trim()) errors.firstName = "Ad gereklidir.";
  if (!p.lastName?.trim()) errors.lastName = "Soyad gereklidir.";

  if (p.nationality?.toUpperCase() === 'TR') {
    if (!/^[1-9]\d{10}$/.test(p.identityNumber)) {
      errors.identityNumber = "Geçersiz T.C. Kimlik No (11 hane olmalı ve 0 ile başlamamalı).";
    }
  } else {
    if (!p.identityNumber?.trim() || p.identityNumber.trim().length < 5) {
      errors.identityNumber = "Geçersiz Pasaport No (en az 5 karakter).";
    }
  }

  if (!p.birthDate) {
    errors.birthDate = "Doğum tarihi gereklidir.";
  } else if (new Date(p.birthDate) >= new Date()) {
    errors.birthDate = "Doğum tarihi geçmişte olmalıdır.";
  }

  if (!p.email?.trim()) {
    errors.email = "E-posta gereklidir.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)) {
    errors.email = "Geçersiz e-posta formatı (örn: ad@example.com).";
  }

  if (!p.phone) {
    errors.phone = "Telefon numarası gereklidir.";
  } else if (!isValidPhoneNumber(p.phone)) {
    errors.phone = "Ülke formatına uymuyor (geçersiz uzunluk).";
  }

  return errors;
};

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
      const adultCount = parseInt(bookingDetails?.adultCount) || 1;
      const childCount = parseInt(bookingDetails?.childCount) || 0;
      const childAges = bookingDetails?.childAges || [];

      const initialGuests = [];

      for (let i = 0; i < adultCount; i++) {
        initialGuests.push({
          id: `adult-${i}`,
          type: 'ADULT',
          firstName: '',
          lastName: '',
          identityNumber: '',
          email: '',
          phone: '',
          birthDate: '',
          gender: 'MR',
          nationality: 'TR',
        });
      }

      for (let i = 0; i < childCount; i++) {
        initialGuests.push({
          id: `child-${i}`,
          type: 'CHILD',
          firstName: '',
          lastName: '',
          identityNumber: '',
          email: '',
          phone: '',
          birthDate: '',
          gender: 'CHD',
          nationality: 'TR',
          age: childAges[i] !== undefined ? childAges[i].toString() : '',
        });
      }

      // Önce boş liste ile formu aç, sonra profil verisini getir
      setGuests(initialGuests);

      // Kullanıcının profil bilgilerini çekip ilk yetişkini doldur
      api.get('/api/reservations/prefill')
        .then((res) => {
          const data = res.data;
          if (!data) return;
          setGuests((prev) => {
            if (!prev || prev.length === 0) return prev;
            const updated = [...prev];
            updated[0] = {
              ...updated[0],
              firstName: data.firstName || updated[0].firstName,
              lastName: data.lastName || updated[0].lastName,
              email: data.email || updated[0].email,
              phone: data.phoneNumber || updated[0].phone,
              // identityNumber backend'de yok, boş kalır
            };
            return updated;
          });
        })
        .catch(() => {
          // Giriş yapılmamışsa veya istek başarısız olursa form boş başlar
        });
    }
  }, [hotel, bookingDetails, guests, setGuests]);

  if (!hotel) return null;

  if (reservationResult) {
    return (
      <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 font-sans w-full relative items-center justify-center p-8 text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 text-slate-600 dark:text-slate-300 rounded-full transition-colors"
        >
          <X size={20} />
        </button>
        <CheckCircle2 size={48} className="text-emerald-500 mb-4" />
        <p className="text-slate-800 dark:text-slate-200 font-medium mb-6 max-w-sm">
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

    const isIdentityNumberValid = (idNo, nationality) => {
      if (!idNo) return false;
      if (nationality?.toUpperCase() === 'TR') {
        return /^[1-9]\d{10}$/.test(idNo);
      }
      return idNo.trim().length >= 5;
    };

    for (let i = 0; i < (guests || []).length; i++) {
      const g = guests[i];
      const errors = getPassengerErrors(g, isValidPhoneNumber);
      const errorKeys = Object.keys(errors);
      if (errorKeys.length > 0) {
        const guestName = g.firstName && g.lastName ? `${g.firstName} ${g.lastName}` : `${i + 1}. Yolcu`;
        alert(`${guestName} bilgilerinde hata var: ${errors[errorKeys[0]]}`);
        return;
      }
    }

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
        email: g.email || '',
        phoneNumber: g.phone || '',
        identityNumber: g.identityNumber,
        birthDate: g.birthDate,
        gender: g.gender,
        nationality: g.nationality,
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
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 font-sans w-full relative">

      {/* Header / Thumbnail (Matches HotelDetailPanel) */}
      <div className="relative h-48 md:h-64 flex-shrink-0 bg-slate-200 dark:bg-slate-800">
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
            className="absolute top-4 left-4 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors flex items-center gap-1 pr-4 text-sm font-semibold"
          >
            <ArrowLeft size={18} /> Geri
          </button>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors"
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
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">Konuk Bilgileri</h3>
              {guests && guests.map((guest, index) => {
                const isExpanded = expandedGuestId === guest.id;
                const guestTitle = guest.type === 'ADULT'
                  ? `${index + 1}. Yetişkin`
                  : `${index - adultCount + 1}. Çocuk`;

                return (
                  <div key={guest.id} className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden transition-all duration-200">
                    <button
                      type="button"
                      onClick={() => setExpandedGuestId(isExpanded ? null : guest.id)}
                      className="w-full px-5 py-4 flex items-center justify-between bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {guest.type === 'ADULT' ? <User size={18} className="text-blue-500" /> : <Baby size={18} className="text-amber-500" />}
                        <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{guestTitle}</span>
                        {index === 0 && <span className="ml-2 text-[10px] bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full uppercase tracking-wider">İletişim</span>}

                        {/* Summary when collapsed */}
                        {!isExpanded && (guest.firstName || guest.lastName) && (
                          <span className="text-sm text-slate-500 dark:text-slate-400 ml-2 border-l border-slate-200 dark:border-slate-700 pl-4">
                            {guest.firstName} {guest.lastName}
                          </span>
                        )}
                      </div>
                      <div className="text-slate-400 dark:text-slate-500">
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                    </button>

                    {isExpanded && (() => {
                      const errors = getPassengerErrors(guest, isValidPhoneNumber);
                      return (
                        <div className="p-5 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-1">
                              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Ad</label>
                              <input
                                required
                                type="text"
                                value={guest.firstName}
                                onChange={(e) => handleGuestChange(index, 'firstName', e.target.value)}
                                className={`w-full bg-white dark:bg-slate-900 border ${errors.firstName ? 'border-red-500 ring-1 ring-red-500 focus:ring-red-500/50 focus:border-red-500' : 'border-slate-200 dark:border-slate-700 focus:ring-amber-500/50 focus:border-amber-500'} text-slate-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors`}
                              />
                              {errors.firstName && <span className="text-[10px] text-red-500 mt-1 block font-medium">{errors.firstName}</span>}
                            </div>
                            <div className="col-span-1">
                              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Soyad</label>
                              <input
                                required
                                type="text"
                                value={guest.lastName}
                                onChange={(e) => handleGuestChange(index, 'lastName', e.target.value)}
                                className={`w-full bg-white dark:bg-slate-900 border ${errors.lastName ? 'border-red-500 ring-1 ring-red-500 focus:ring-red-500/50 focus:border-red-500' : 'border-slate-200 dark:border-slate-700 focus:ring-amber-500/50 focus:border-amber-500'} text-slate-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors`}
                              />
                              {errors.lastName && <span className="text-[10px] text-red-500 mt-1 block font-medium">{errors.lastName}</span>}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-1">
                              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Cinsiyet</label>
                              <select
                                required
                                value={guest.gender || 'MR'}
                                onChange={(e) => handleGuestChange(index, 'gender', e.target.value)}
                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-colors"
                              >
                                <option value="MR">Bay (Mr.)</option>
                                <option value="MRS">Bayan (Mrs.)</option>
                                <option value="CHD">Çocuk (Child)</option>
                              </select>
                            </div>
                            <div className="col-span-1">
                              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Doğum Tarihi</label>
                              <input
                                required
                                type="date"
                                max={new Date().toISOString().split('T')[0]}
                                value={guest.birthDate || ''}
                                onChange={(e) => handleGuestChange(index, 'birthDate', e.target.value)}
                                className={`w-full bg-white dark:bg-slate-900 border ${errors.birthDate ? 'border-red-500 ring-1 ring-red-500 focus:ring-red-500/50 focus:border-red-500' : 'border-slate-200 dark:border-slate-700 focus:ring-amber-500/50 focus:border-amber-500'} text-slate-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors`}
                              />
                              {errors.birthDate && <span className="text-[10px] text-red-500 mt-1 block font-medium">{errors.birthDate}</span>}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-1">
                              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Uyruk</label>
                              <input
                                required
                                type="text"
                                value={guest.nationality || 'TR'}
                                onChange={(e) => handleGuestChange(index, 'nationality', e.target.value)}
                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-colors"
                              />
                            </div>
                            <div className="col-span-1">
                              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                                <ShieldCheck size={12} /> TC Kimlik No / Pasaport
                              </label>
                              <input
                                required
                                type="text"
                                value={guest.identityNumber}
                                onChange={(e) => handleGuestChange(index, 'identityNumber', e.target.value)}
                                className={`w-full bg-white dark:bg-slate-900 border ${errors.identityNumber ? 'border-red-500 ring-1 ring-red-500 focus:ring-red-500/50 focus:border-red-500' : 'border-slate-200 dark:border-slate-700 focus:ring-amber-500/50 focus:border-amber-500'} text-slate-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors`}
                              />
                              {errors.identityNumber && <span className="text-[10px] text-red-500 mt-1 block font-medium">{errors.identityNumber}</span>}
                            </div>
                          </div>

                          {guest.type === 'CHILD' && (
                            <div className="grid grid-cols-2 gap-4">
                              <div className="col-span-1">
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Yaş</label>
                                <input
                                  required
                                  type="number"
                                  min="0"
                                  max="17"
                                  value={guest.age}
                                  onChange={(e) => handleGuestChange(index, 'age', e.target.value)}
                                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-colors"
                                />
                              </div>
                            </div>
                          )}

                          {index === 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-200/60 dark:border-slate-700">
                              <div>
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                                  <Mail size={12} /> E-posta
                                </label>
                                <input
                                  required
                                  type="email"
                                  value={guest.email || ''}
                                  onChange={(e) => handleGuestChange(index, 'email', e.target.value)}
                                  className={`w-full bg-white dark:bg-slate-900 border ${errors.email ? 'border-red-500 ring-1 ring-red-500 focus:ring-red-500/50 focus:border-red-500' : 'border-slate-200 dark:border-slate-700 focus:ring-amber-500/50 focus:border-amber-500'} text-slate-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors`}
                                />
                                {errors.email && <span className="text-[10px] text-red-500 mt-1 block font-medium">{errors.email}</span>}
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                                  <Phone size={12} /> Telefon
                                </label>
                                <PhoneInput
                                  international
                                  defaultCountry="TR"
                                  value={guest.phone || ''}
                                  onChange={(val) => handleGuestChange(index, 'phone', val)}
                                  className={`flex items-center w-full bg-white dark:bg-slate-900 border ${errors.phone ? 'border-red-500 ring-1 ring-red-500 focus-within:ring-red-500/50 focus-within:border-red-500' : 'border-slate-200 dark:border-slate-700 focus-within:ring-amber-500/50 focus-within:border-amber-500'} rounded-lg px-3 py-1.5 text-sm transition-colors`}
                                  numberInputProps={{
                                    required: true,
                                    className: 'bg-transparent border-0 outline-none w-full text-slate-800 dark:text-white focus:ring-0 ml-2 py-1',
                                  }}
                                />
                                {errors.phone && <span className="text-[10px] text-red-500 mt-1 block font-medium">{errors.phone}</span>}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                );
              })}
            </div>

            {/* Cancellation Policy Block */}
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 rounded-xl p-4 flex items-start gap-3">
              <Info size={20} className="text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-sm text-blue-900 dark:text-blue-300">İptal Politikası</h4>
                <p className="text-xs text-blue-700 dark:text-slate-350 mt-1 leading-relaxed">
                  {hotel.isRefundable === true
                    ? "Bu rezervasyon ücretsiz iptal edilebilir."
                    : hotel.isRefundable === false
                      ? "Bu rezervasyon iade edilemez."
                      : "İptal koşulları rezervasyon onayı sonrası bildirilecektir."}
                </p>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-700 pb-2">Fiyat Özeti</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                  <span>Oda Fiyatı ({bookingDetails?.guests || '1 Oda'})</span>
                  <span className="font-medium">{formatSubPrice(roomPriceValue)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                  <span>Vergiler ve Harçlar</span>
                  <span className="font-medium">{formatSubPrice(taxValue)}</span>
                </div>
                <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-700 flex justify-between items-end">
                  <span className="font-bold text-slate-800 dark:text-slate-200">Toplam</span>
                  <span className="text-xl font-extrabold text-[#3B82F6] dark:text-blue-400">{formattedPrice}</span>
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
                className="mt-1 w-4 h-4 text-blue-600 bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-700 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label htmlFor="terms" className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed cursor-pointer select-none">
                <span className="text-blue-600 dark:text-blue-400 hover:underline">Satış Sözleşmesini</span> ve <span className="text-blue-600 dark:text-blue-400 hover:underline">İptal/İade Koşullarını</span> okudum, anladım ve kabul ediyorum.
              </label>
            </div>

          </form>
        </div>
      </div>

      {/* Sticky Footer / Action */}
      <div className="p-4 md:p-6 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] sticky bottom-0 z-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col w-full md:w-auto text-center md:text-left">
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">Toplam Tutar</span>
          <span className="text-2xl font-extrabold text-[#3B82F6] dark:text-blue-400 leading-none">{formattedPrice}</span>
          {submitError && <span className="text-xs text-red-600 dark:text-red-400 font-medium mt-1">{submitError}</span>}
        </div>
        <button
          type="submit"
          form="reservation-form"
          disabled={!termsAccepted || isSubmitting}
          className="w-full md:w-auto md:min-w-[240px] py-3.5 px-6 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <ShieldCheck size={18} />
          {isSubmitting ? t('reservation_submitting') : 'Rezervasyonu Onayla'}
        </button>
      </div>
    </div>
  );
}
