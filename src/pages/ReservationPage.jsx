import React, { useState } from 'react';
import api from '../services/api';
import {
    ChevronLeft,
    Users,
    Phone,
    Mail,
    MapPin,
    Plus,
    CheckCircle2,
    XCircle,
    Eye,
    Edit2,
    Check,
    Trash2,
    Download
} from 'lucide-react';

const translations = {
    tr: {
        pageTitle: 'Rezervasyon Oluştur',
        selectedProductSummary: 'Seçilen Ürün Özeti',
        productName: 'Antalya Şehir Turu',
        date: 'Tur Tarihi',
        guestCount: 'Kişi Sayısı',
        adults: 'Yetişkin',
        price: 'Fiyat',
        priceValue: '1200 TL (Kişi Başı)',
        totalAmount: 'Toplam Tutar',
        guestInfo: 'Yolcu / Misafir Bilgileri',
        guest: 'Misafir',
        firstName: 'Ad',
        lastName: 'Soyad',
        birthDate: 'Doğum Tarihi',
        identityNumber: 'Kimlik / Pasaport No',
        gender: 'Cinsiyet',
        select: 'Seçiniz',
        female: 'Kadın',
        male: 'Erkek',
        preferNotToSay: 'Belirtmek İstemiyorum',
        addGuest: 'Yeni Misafir Ekle',
        contactInfo: 'İletişim Bilgileri',
        phoneNumber: 'Telefon Numarası',
        emailAddress: 'E-posta Adresi',
        addressNote: 'Adres / Not',
        userConfirmation: 'Kullanıcı Onayı',
        agreementText: 'Rezervasyon bilgilerimin doğru olduğunu ve şartları kabul ettiğimi onaylıyorum.',
        cancel: 'İptal',
        saveChanges: 'Değişiklikleri Kaydet',
        previewTitle: 'Rezervasyon Önizleme',
        previewDesc: 'Lütfen bilgilerinizi onaylamadan önce son kez kontrol edin.',
        createReservationBtn: 'Rezervasyon Oluştur',
        backToEdit: 'Bilgileri Düzenle',
        downloadPdf: 'PDF Olarak İndir',
        successTitle: 'Rezervasyon Başarılı!',
        successMessage: 'Rezervasyonunuz başarıyla oluşturuldu. Bilgiler e-posta adresinize gönderildi.',
        errorTitle: 'Rezervasyon Oluşturulamadı',
        errorMessage: 'İşleminiz sırasında bir hata oluştu. Lütfen bilgilerinizi kontrol edip tekrar deneyiniz.',
        retry: 'Yeniden Dene',
        firstNamePlaceholder: 'Adınız',
        lastNamePlaceholder: 'Soyadınız',
        birthPlaceholder: 'GG.AA.YYYY',
        identityPlaceholder: 'Kimlik veya Pasaport No',
        phonePlaceholder: '555 123 45 67',
        agreementWarning: 'Lütfen onay kutusunu işaretleyiniz.',
        guestWarning: 'Lütfen tüm misafir bilgilerini ve iletişim alanlarını doğru ve eksiksiz doldurunuz.',
        cancelConfirm: 'Yaptığınız değişiklikleri iptal etmek istediğinizden emin misiniz?',
        submitError: 'Rezervasyon veritabanına kaydedilemedi.',
    },
    en: {
        pageTitle: 'Create Reservation',
        selectedProductSummary: 'Selected Product Summary',
        productName: 'Antalya City Tour',
        date: 'Tour Date',
        guestCount: 'Number of Guests',
        adults: 'Adults',
        price: 'Price',
        priceValue: '1200 TRY (Per Person)',
        totalAmount: 'Total Amount',
        guestInfo: 'Passenger / Guest Information',
        guest: 'Guest',
        firstName: 'First Name',
        lastName: 'Last Name',
        birthDate: 'Date of Birth',
        identityNumber: 'ID / Passport Number',
        gender: 'Gender',
        select: 'Select',
        female: 'Female',
        male: 'Male',
        preferNotToSay: 'Prefer not to say',
        addGuest: 'Add New Guest',
        contactInfo: 'Contact Information',
        phoneNumber: 'Phone Number',
        emailAddress: 'Email Address',
        addressNote: 'Address / Note',
        userConfirmation: 'User Confirmation',
        agreementText: 'I confirm that my reservation information is correct and I accept the terms.',
        cancel: 'Cancel',
        saveChanges: 'Save Changes',
        previewTitle: 'Reservation Preview',
        previewDesc: 'Please double-check your information before submitting.',
        createReservationBtn: 'Create Reservation',
        backToEdit: 'Edit Information',
        downloadPdf: 'Download PDF',
        successTitle: 'Reservation Successful!',
        successMessage: 'Your reservation was created successfully. Details were sent to your email address.',
        errorTitle: 'Reservation Failed',
        errorMessage: 'An error occurred during submission. Please check your details and try again.',
        retry: 'Try Again',
        firstNamePlaceholder: 'Your first name',
        lastNamePlaceholder: 'Your last name',
        birthPlaceholder: 'DD.MM.YYYY',
        identityPlaceholder: 'ID or Passport Number (Letters and Digits, Max 11)',
        phonePlaceholder: '555 123 45 67',
        agreementWarning: 'Please accept the confirmation checkbox.',
        guestWarning: 'Please complete all guest information and contact fields correctly.',
        cancelConfirm: 'Are you sure you want to cancel your changes?',
        submitError: 'The reservation could not be saved to the database.',
    }
};

const countryCodes = [
    { code: '+90', label: 'TR (+90)' },
    { code: '+1', label: 'US/CA (+1)' },
    { code: '+44', label: 'UK (+44)' },
    { code: '+49', label: 'DE (+49)' },
    { code: '+33', label: 'FR (+33)' },
    { code: '+31', label: 'NL (+31)' },
    { code: '+7', label: 'RU (+7)' },
    { code: '+971', label: 'AE (+971)' },
];

const formatBirthDate = (value) => {
    let digits = value.replace(/\D/g, '').slice(0, 8);

    if (digits.length >= 2) {
        let day = parseInt(digits.slice(0, 2), 10);
        if (day > 31) digits = '31' + digits.slice(2);
        if (day === 0) digits = '01' + digits.slice(2);
    }

    if (digits.length >= 4) {
        let month = parseInt(digits.slice(2, 4), 10);
        if (month > 12) digits = digits.slice(0, 2) + '12' + digits.slice(4);
        if (month === 0) digits = digits.slice(0, 2) + '01' + digits.slice(4);
    }

    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
    return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4)}`;
};

const formatPhone = (value) => {
    return value.replace(/\D/g, '').slice(0, 15);
};

// Sadece harf ve Türkçe karakter filtresi
const formatOnlyLetters = (value) => {
    return value.replace(/[^a-zA-ZçğışıöüÇĞİŞÖÜ\s]/g, '');
};

// Sadece harf ve sayı filtresi (Alfanümerik)
const formatAlphanumeric = (value) => {
    return value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
};

const formatDateFriendly = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}.${month}.${year}`;
};

export default function Reservation() {
    const [step, setStep] = useState('form');
    const [language, setLanguage] = useState('tr');
    const [selectedTour] = useState('Antalya Şehir Turu');
    const [reservationDate, setReservationDate] = useState('2026-07-15');

    const t = translations[language];

    const [guests, setGuests] = useState([
        {
            id: '1',
            ad: '',
            soyad: '',
            dogumTarihi: '',
            kimlikNo: '',
            cinsiyet: '',
            ulkeKodu: '+90',
            telefon: '',
            eposta: ''
        }
    ]);

    const [address, setAddress] = useState('');
    const [agreed, setAgreed] = useState(false);
    const [lastError, setLastError] = useState('');

    const handleAddGuest = () => {
        setGuests([
            ...guests,
            {
                id: Math.random().toString(36).substr(2, 9),
                ad: '',
                soyad: '',
                dogumTarihi: '',
                kimlikNo: '',
                cinsiyet: '',
                ulkeKodu: '+90',
                telefon: '',
                eposta: ''
            },
        ]);
    };

    const handleRemoveGuest = (id) => {
        if (guests.length > 1) {
            setGuests(guests.filter(guest => guest.id !== id));
        }
    };

    const handleGuestChange = (index, field, value) => {
        const updatedGuests = [...guests];
        let formattedValue = value;

        if (field === 'ad' || field === 'soyad') formattedValue = formatOnlyLetters(value);
        if (field === 'dogumTarihi') formattedValue = formatBirthDate(value);
        if (field === 'telefon') formattedValue = formatPhone(value);
        if (field === 'kimlikNo') formattedValue = formatAlphanumeric(value).slice(0, 11); // Harf ve sayı serbest, sembol yasak, max 11

        updatedGuests[index] = {
            ...updatedGuests[index],
            [field]: formattedValue,
        };
        setGuests(updatedGuests);
    };

    const validateForm = () => {
        const hasIncompleteGuest = guests.some(
            (g) => !g.ad.trim() ||
                !g.soyad.trim() ||
                g.dogumTarihi.length !== 10 ||
                !g.kimlikNo.trim() ||
                g.cinsiyet === '' ||
                g.telefon.trim().length < 6 ||
                !g.eposta.trim()
        );

        if (hasIncompleteGuest) {
            alert(t.guestWarning);
            return false;
        }
        if (!agreed) {
            alert(t.agreementWarning);
            return false;
        }
        return true;
    };

    const handleOpenPreview = () => {
        if (validateForm()) {
            setStep('preview');
        }
    };

    const handleCreateReservation = async () => {
        try {
            const passengers = guests.map(g => ({
                firstName: g.ad,
                lastName: g.soyad,
                email: g.eposta,
                phoneNumber: `${g.ulkeKodu}${g.telefon.replace(/\D/g, '')}`,
                identityNumber: g.kimlikNo
            }));

            const payload = {
                type: "HOTEL",
                itemName: selectedTour,
                destination: "Antalya",
                startDate: reservationDate,
                endDate: reservationDate,
                totalPrice: guests.length * 1200,
                currency: "TRY",
                passengers: passengers,
                notes: address
            };

            await api.post('/api/reservations', payload);
            setStep('success');
        } catch (err) {
            console.error("Failed to create reservation", err);
            setLastError(err.message || t.submitError);
            setStep('error');
        }
    };

    const handleCancelReservation = () => {
        if (!window.confirm(t.cancelConfirm)) return;
        setAgreed(false);
        setReservationDate('2026-07-15');
        setGuests([{ id: Math.random().toString(36).substr(2, 9), ad: '', soyad: '', dogumTarihi: '', kimlikNo: '', cinsiyet: '', ulkeKodu: '+90', telefon: '', eposta: '' }]);
        setAddress('');
        setStep('form');
    };

    const handleDownloadPDF = () => {
        window.print();
    };

    const productImage = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=300&h=200&fit=crop';

    return (
        <div className="min-h-screen bg-gradient-to-tr from-[#e0f2fe] via-[#fdf2e9] to-[#fffbeb] transition-all duration-500 print:bg-white print:p-0">
            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    .print-container, .print-container * { visibility: visible; }
                    .print-container { position: absolute; left: 0; top: 0; width: 100%; }
                    .no-print { display: none !important; }
                }
            `}</style>

            {/* Header */}
            <div className="sticky top-0 z-50 bg-gradient-to-r from-[#0369a1] via-[#0284c7] to-[#f59e0b] text-white shadow-md no-print">
                <div className="flex items-center justify-between px-6 py-4">
                    <button
                        type="button"
                        onClick={() => step === 'preview' ? setStep('form') : null}
                        className="rounded-lg p-2 text-white transition hover:bg-white/10"
                        disabled={step === 'success' || step === 'error'}
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <h1 className="text-xl font-bold tracking-wide">{t.pageTitle}</h1>
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="rounded-full border border-white/40 bg-white/10 px-4 py-2 text-sm font-semibold text-white outline-none focus:ring-2 focus:ring-white/50"
                    >
                        <option value="tr" className="text-gray-900">TR</option>
                        <option value="en" className="text-gray-900">EN</option>
                    </select>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-8">
                {step === 'form' && (
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                        {/* Sol Kolon */}
                        <div className="lg:col-span-2 space-y-8">

                            {/* Misafir Bilgileri */}
                            <div className="rounded-2xl bg-white/95 backdrop-blur-sm p-6 shadow-sm border border-orange-100">
                                <div className="mb-6 flex items-center gap-4">
                                    <div className="bg-[#f59e0b] flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full font-bold text-white shadow-sm shadow-orange-200">1</div>
                                    <h2 className="text-[#d97706] text-lg font-bold">{t.guestInfo}</h2>
                                </div>
                                <div className="space-y-8">
                                    {guests.map((guest, index) => (
                                        <div key={guest.id} className="relative border-b border-orange-100 pb-8 last:border-b-0 last:pb-0">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                                    <span className="h-2 w-2 rounded-full bg-[#f59e0b]"></span>
                                                    {t.guest} {index + 1}
                                                </h3>
                                                {guests.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveGuest(guest.id)}
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition"
                                                        title="Misafiri Sil"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                <div>
                                                    <label className="mb-1.5 block text-xs font-semibold text-gray-500 uppercase">{t.firstName}</label>
                                                    <input
                                                        type="text"
                                                        value={guest.ad}
                                                        onChange={(e) => handleGuestChange(index, 'ad', e.target.value)}
                                                        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:ring-2 focus:ring-[#f59e0b]/50 focus:border-[#f59e0b] transition bg-gray-50/50"
                                                        placeholder={t.firstNamePlaceholder}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="mb-1.5 block text-xs font-semibold text-gray-500 uppercase">{t.lastName}</label>
                                                    <input
                                                        type="text"
                                                        value={guest.soyad}
                                                        onChange={(e) => handleGuestChange(index, 'soyad', e.target.value)}
                                                        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:ring-2 focus:ring-[#f59e0b]/50 focus:border-[#f59e0b] transition bg-gray-50/50"
                                                        placeholder={t.lastNamePlaceholder}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="mb-1.5 block text-xs font-semibold text-gray-500 uppercase">{t.birthDate}</label>
                                                    <input
                                                        type="text"
                                                        inputMode="numeric"
                                                        maxLength={10}
                                                        value={guest.dogumTarihi}
                                                        onChange={(e) => handleGuestChange(index, 'dogumTarihi', e.target.value)}
                                                        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:ring-2 focus:ring-[#f59e0b]/50 focus:border-[#f59e0b] transition bg-gray-50/50"
                                                        placeholder={t.birthPlaceholder}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="mb-1.5 block text-xs font-semibold text-gray-500 uppercase">{t.identityNumber}</label>
                                                    <input
                                                        type="text"
                                                        value={guest.kimlikNo}
                                                        onChange={(e) => handleGuestChange(index, 'kimlikNo', e.target.value)}
                                                        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:ring-2 focus:ring-[#f59e0b]/50 focus:border-[#f59e0b] transition bg-gray-50/50 uppercase"
                                                        placeholder={t.identityPlaceholder}
                                                    />
                                                </div>
                                                <div className="sm:col-span-2">
                                                    <label className="mb-1.5 block text-xs font-semibold text-gray-500 uppercase">{t.gender}</label>
                                                    <select
                                                        value={guest.cinsiyet}
                                                        onChange={(e) => handleGuestChange(index, 'cinsiyet', e.target.value)}
                                                        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:ring-2 focus:ring-[#f59e0b]/50 focus:border-[#f59e0b] transition bg-gray-50/50"
                                                    >
                                                        <option value="">{t.select}</option>
                                                        <option value="Kadın">{t.female}</option>
                                                        <option value="Erkek">{t.male}</option>
                                                        <option value="Belirtmek İstemiyorum">{t.preferNotToSay}</option>
                                                    </select>
                                                </div>

                                                {/* İletişim Bilgileri */}
                                                <div className="sm:col-span-2 mt-2 pt-4 border-t border-dashed border-gray-200 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                    <div>
                                                        <label className="mb-1.5 block text-xs font-semibold text-gray-500 uppercase">{t.phoneNumber} ({t.guest} {index + 1})</label>
                                                        <div className="flex gap-2">
                                                            <select
                                                                value={guest.ulkeKodu}
                                                                onChange={(e) => handleGuestChange(index, 'ulkeKodu', e.target.value)}
                                                                className="rounded-xl border border-gray-200 px-2 py-2.5 text-sm bg-gray-50 font-semibold focus:ring-2 focus:ring-[#f59e0b]/50 focus:border-[#f59e0b] transition outline-none"
                                                            >
                                                                {countryCodes.map((c) => (
                                                                    <option key={c.code} value={c.code}>{c.label}</option>
                                                                ))}
                                                            </select>
                                                            <div className="relative flex-1 flex items-center">
                                                                <Phone size={14} className="absolute left-4 text-gray-400" />
                                                                <input
                                                                    type="tel"
                                                                    inputMode="numeric"
                                                                    value={guest.telefon}
                                                                    onChange={(e) => handleGuestChange(index, 'telefon', e.target.value)}
                                                                    className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#f59e0b]/50 focus:border-[#f59e0b] transition bg-gray-50/50"
                                                                    placeholder={t.phonePlaceholder}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="mb-1.5 block text-xs font-semibold text-gray-500 uppercase">{t.emailAddress} ({t.guest} {index + 1})</label>
                                                        <div className="relative">
                                                            <Mail size={14} className="absolute left-4 top-3.5 text-gray-400" />
                                                            <input
                                                                type="email"
                                                                value={guest.eposta}
                                                                onChange={(e) => handleGuestChange(index, 'eposta', e.target.value)}
                                                                className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#f59e0b]/50 focus:border-[#f59e0b] transition bg-gray-50/50"
                                                                placeholder="ornek@mail.com"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    type="button"
                                    onClick={handleAddGuest}
                                    className="text-[#d97706] border-[#f59e0b] hover:bg-[#f59e0b]/5 mt-6 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed py-3 font-semibold transition"
                                >
                                    <Plus size={18} />
                                    {t.addGuest}
                                </button>
                            </div>

                            {/* Not Bilgisi */}
                            <div className="rounded-2xl bg-white/95 backdrop-blur-sm p-6 shadow-sm border border-orange-100">
                                <div className="mb-6 flex items-center gap-4">
                                    <div className="bg-[#f59e0b] flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full font-bold text-white shadow-sm shadow-orange-200">2</div>
                                    <h2 className="text-[#d97706] text-lg font-bold">{t.addressNote}</h2>
                                </div>
                                <div className="relative">
                                    <MapPin size={16} className="absolute left-4 top-3.5 text-gray-400" />
                                    <textarea
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        className="w-full rounded-xl border border-gray-200 py-2.5 pl-11 pr-4 focus:ring-2 focus:ring-[#f59e0b]/50 focus:border-[#f59e0b] transition bg-gray-50/50"
                                        rows={3}
                                        placeholder="Eklemek istediğiniz özel bir not veya adres varsa belirtiniz."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Sağ Kolon */}
                        <div className="space-y-6">
                            <div className="rounded-2xl bg-white/95 backdrop-blur-sm p-6 shadow-md sticky top-24 border border-orange-100">
                                <h2 className="text-lg font-bold text-gray-950 mb-4 border-b border-orange-50 pb-2">{t.selectedProductSummary}</h2>
                                <div className="mb-4">
                                    <img src={productImage} alt={t.productName} className="w-full h-40 object-cover rounded-xl mb-3 shadow-inner" />
                                    <h3 className="font-bold text-gray-900">{t.productName}</h3>
                                </div>

                                <div className="space-y-3 text-sm border-b border-orange-50 pb-4 mb-4 text-gray-600">
                                    <div className="flex justify-between">
                                        <span>{t.date}:</span>
                                        <span className="font-semibold text-gray-900">{formatDateFriendly(reservationDate)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>{t.guestCount}:</span>
                                        <span className="font-semibold text-gray-900">{guests.length} {t.adults}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>{t.price}:</span>
                                        <span className="font-semibold text-gray-900">{t.priceValue}</span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-base font-bold text-gray-900">{t.totalAmount}:</span>
                                    <span className="text-2xl font-black text-[#d97706]">{guests.length * 1200} TL</span>
                                </div>

                                <div className={`mb-6 rounded-xl p-4 border transition-all duration-300 ${agreed ? 'bg-orange-50/60 border-[#f59e0b]/30' : 'bg-gray-50 border-gray-200'}`}>
                                    <label className="flex items-start gap-3 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={agreed}
                                            onChange={(e) => setAgreed(e.target.checked)}
                                            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#f59e0b] focus:ring-[#f59e0b] transition cursor-pointer"
                                        />
                                        <span className="text-xs text-gray-700 leading-relaxed font-medium">{t.agreementText}</span>
                                    </label>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={handleCancelReservation}
                                        className="w-full py-3 px-4 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition"
                                    >
                                        {t.cancel}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleOpenPreview}
                                        className="w-full py-3 px-4 bg-[#f59e0b] hover:bg-[#d97706] text-white rounded-xl text-sm font-bold shadow-md shadow-orange-200 transition"
                                    >
                                        {t.saveChanges}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Rezervasyon Önizleme Ekranı */}
                {step === 'preview' && (
                    <div className="mx-auto max-w-3xl bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-orange-100 print-container">
                        <div className="flex justify-between items-start mb-6 border-b border-orange-100 pb-4">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <Eye className="text-[#d97706] no-print" size={24} />
                                    <h2 className="text-2xl font-black text-gray-900">{t.previewTitle}</h2>
                                </div>
                                <p className="text-gray-500 text-sm no-print">{t.previewDesc}</p>
                            </div>
                            <button
                                type="button"
                                onClick={handleDownloadPDF}
                                className="no-print bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition"
                            >
                                <Download size={16} />
                                {t.downloadPdf}
                            </button>
                        </div>

                        <div className="space-y-6 my-6">
                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{t.productName}</h3>
                                <p className="font-bold text-gray-950 text-lg">{selectedTour}</p>
                                <p className="text-sm text-gray-600">{formatDateFriendly(reservationDate)} | {guests.length} {t.adults}</p>
                            </div>

                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{t.guestInfo}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {guests.map((g, index) => (
                                        <div key={g.id} className="bg-orange-50/40 p-4 rounded-xl border border-orange-100/50 space-y-2">
                                            <p className="font-bold text-gray-900 text-sm border-b border-orange-100/60 pb-1">{index + 1}. {g.ad} {g.soyad}</p>
                                            <p className="text-xs text-gray-600"><strong>Kimlik/Pasaport:</strong> {g.kimlikNo} | <strong>D.Tarihi:</strong> {g.dogumTarihi}</p>
                                            <p className="text-xs text-gray-600"><strong>Cinsiyet:</strong> {g.cinsiyet}</p>
                                            <div className="text-xs bg-white/70 p-2 rounded border border-gray-100 space-y-0.5">
                                                <p className="text-gray-700"><strong>Tel:</strong> {g.ulkeKodu} {g.telefon}</p>
                                                <p className="text-gray-700"><strong>E-posta:</strong> {g.eposta}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {address && (
                                <div>
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{t.addressNote}</h3>
                                    <div className="text-sm text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <p>{address}</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-between items-center bg-[#f59e0b]/10 p-4 rounded-xl">
                                <span className="font-bold text-gray-900 text-base">{t.totalAmount}:</span>
                                <span className="text-2xl font-black text-[#d97706]">{guests.length * 1200} TL</span>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-end border-t border-orange-100 pt-6 mt-6 no-print">
                            <button
                                type="button"
                                onClick={() => setStep('form')}
                                className="px-6 py-3 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition flex items-center justify-center gap-2"
                            >
                                <Edit2 size={16} />
                                {t.backToEdit}
                            </button>
                            <button
                                type="button"
                                onClick={handleCreateReservation}
                                className="px-8 py-3 bg-[#f59e0b] hover:bg-[#d97706] text-white rounded-xl text-sm font-bold shadow-md shadow-orange-200 transition flex items-center justify-center gap-2"
                            >
                                <Check size={18} />
                                {t.createReservationBtn}
                            </button>
                        </div>
                    </div>
                )}

                {/* Başarılı Ekranı */}
                {step === 'success' && (
                    <div className="mx-auto max-w-md text-center bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-green-100 my-12">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-500 mb-6 border border-green-200">
                            <CheckCircle2 size={36} />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-2">{t.successTitle}</h2>
                        <p className="text-gray-600 mb-8 text-sm leading-relaxed">{t.successMessage}</p>
                        <button
                            type="button"
                            onClick={() => {
                                setAgreed(false);
                                setStep('form');
                            }}
                            className="w-full py-3 bg-[#f59e0b] hover:bg-[#d97706] text-white rounded-xl text-sm font-bold shadow-md transition"
                        >
                            Yeni Rezervasyon Oluştur
                        </button>
                    </div>
                )}

                {/* Başarısız Ekranı */}
                {step === 'error' && (
                    <div className="mx-auto max-w-md text-center bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-red-100 my-12">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500 mb-6 border border-red-200">
                            <XCircle size={36} />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-2">{t.errorTitle}</h2>
                        <p className="text-gray-600 mb-4 text-sm">{t.errorMessage}</p>
                        {lastError && (
                            <p className="text-xs bg-red-50 text-red-700 p-3 rounded-lg font-mono mb-6 text-left break-words border border-red-100">
                                {lastError}
                            </p>
                        )}
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => setStep('form')}
                                className="flex-1 py-3 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition"
                            >
                                {t.backToEdit}
                            </button>
                            <button
                                type="button"
                                onClick={handleCreateReservation}
                                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition"
                            >
                                {t.retry}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}