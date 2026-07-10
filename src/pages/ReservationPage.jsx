
import React, { useState } from 'react';
import api from '../services/api';
import {
    ChevronLeft,
    Calendar,
    Users,
    DollarSign,
    Phone,
    Mail,
    MapPin,
    Plus,
    CheckCircle2,
    AlertCircle,
    Home,
    ArrowRight,
} from 'lucide-react';

export default function Reservation() {
    const [step, setStep] = useState('form');

    const [guests, setGuests] = useState([
        {
            ad: 'Ayşe',
            soyad: 'Yılmaz',
            dogumTarihi: '12.05.1990',
            kimlikNo: '12345678901',
            cinsiyet: 'Kadın',
        },
        {
            ad: 'Mehmet',
            soyad: 'Yılmaz',
            dogumTarihi: '08.03.1988',
            kimlikNo: '98765432109',
            cinsiyet: 'Erkek',
        },
    ]);

    const [phone, setPhone] = useState('+90 555 123 45 67');
    const [email, setEmail] = useState('ornek@mail.com');
    const [address, setAddress] = useState(
        'Otelimiz Kaleiçi bölgesindedir.'
    );
    const [agreed, setAgreed] = useState(true);

    const handleAddGuest = () => {
        setGuests([
            ...guests,
            {
                ad: '',
                soyad: '',
                dogumTarihi: '',
                kimlikNo: '',
                cinsiyet: 'Seçiniz',
            },
        ]);
    };

    const handleGuestChange = (index, field, value) => {
        const updatedGuests = [...guests];

        updatedGuests[index] = {
            ...updatedGuests[index],
            [field]: value,
        };

        setGuests(updatedGuests);
    };

    const handleCreateReservation = async () => {
        try {
            const passengers = guests.map(g => ({
                firstName: g.ad || "Guest",
                lastName: g.soyad || "User",
                email: email || "user@example.com",
                phoneNumber: phone || "+905550000000",
                identityNumber: g.kimlikNo || "11111111111"
            }));

            const payload = {
                type: "HOTEL",
                itemName: "Antalya Şehir Turu",
                destination: "Antalya",
                startDate: "2026-07-15",
                endDate: "2026-07-16",
                totalPrice: 2400.0,
                currency: "TRY",
                passengers: passengers
            };

            await api.post('/api/reservations', payload);
            setStep('success');
        } catch (err) {
            console.error("Failed to create reservation", err);
            alert("Failed to submit reservation to database.");
        }
    };

    const handleRetry = () => {
        setStep('form');
    };

    const handleGoHome = () => {
        setStep('form');
    };

    const productImage =
        'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=300&h=200&fit=crop';

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-gradient-to-r from-[#1a3a52] to-[#2d5a7b] text-white shadow-lg">
                <div className="flex items-center justify-between px-6 py-4">
                    <button
                        type="button"
                        className="rounded-lg p-2 text-white transition hover:bg-white/10"
                    >
                        <ChevronLeft size={24} />
                    </button>

                    <h1 className="text-xl font-semibold">
                        Rezervasyon Oluştur
                    </h1>

                    <div className="w-10" />
                </div>
            </div>

            {/* Main Content */}
            <div className="mx-auto max-w-7xl px-4 py-6">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Left Column */}
                    <div className="lg:col-span-2">
                        {step === 'form' && (
                            <div className="space-y-6">
                                {/* Section 1: Product Summary */}
                                <div className="rounded-xl bg-white p-6 shadow-md">
                                    <div className="mb-6 flex items-start gap-4">
                                        <div className="bg-primary flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full font-bold text-white">
                                            1
                                        </div>

                                        <h2 className="text-primary text-lg font-semibold">
                                            Seçilen Ürün Özeti
                                        </h2>
                                    </div>

                                    <div className="mb-4 flex gap-4">
                                        <img
                                            src={productImage}
                                            alt="Antalya Şehir Turu"
                                            className="h-32 w-32 rounded-lg object-cover"
                                        />

                                        <div className="flex-1">
                                            <h3 className="mb-3 text-lg font-semibold text-gray-900">
                                                Antalya Şehir Turu
                                            </h3>

                                            <div className="space-y-2 text-sm">
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <Calendar size={16} />
                                                    <span>Tarih: 15 Temmuz 2026</span>
                                                </div>

                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <Users size={16} />
                                                    <span>Kişi Sayısı: 2 Yetişkin</span>
                                                </div>

                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <DollarSign size={16} />
                                                    <span>
                                                        Fiyat: 1200 TL (Kişi Başı)
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between border-t pt-4">
                                        <span className="font-medium text-gray-600">
                                            Toplam Tutar:
                                        </span>

                                        <span className="text-primary text-2xl font-bold">
                                            2.400 TL
                                        </span>
                                    </div>
                                </div>

                                {/* Section 2: Guest Information */}
                                <div className="rounded-xl bg-white p-6 shadow-md">
                                    <div className="mb-6 flex items-start gap-4">
                                        <div className="bg-primary flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full font-bold text-white">
                                            2
                                        </div>

                                        <h2 className="text-primary text-lg font-semibold">
                                            Yolcu / Misafir Bilgileri
                                        </h2>
                                    </div>

                                    <div className="space-y-6">
                                        {guests.map((guest, index) => (
                                            <div
                                                key={index}
                                                className="border-b pb-6 last:border-b-0 last:pb-0"
                                            >
                                                <h3 className="mb-4 font-semibold text-gray-900">
                                                    Misafir {index + 1}
                                                </h3>

                                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                    <div>
                                                        <label className="mb-2 block text-sm font-medium text-gray-700">
                                                            Ad
                                                        </label>

                                                        <input
                                                            type="text"
                                                            value={guest.ad}
                                                            onChange={(event) =>
                                                                handleGuestChange(
                                                                    index,
                                                                    'ad',
                                                                    event.target.value
                                                                )
                                                            }
                                                            className="focus:ring-primary w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2"
                                                            placeholder="Adınız"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="mb-2 block text-sm font-medium text-gray-700">
                                                            Soyad
                                                        </label>

                                                        <input
                                                            type="text"
                                                            value={guest.soyad}
                                                            onChange={(event) =>
                                                                handleGuestChange(
                                                                    index,
                                                                    'soyad',
                                                                    event.target.value
                                                                )
                                                            }
                                                            className="focus:ring-primary w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2"
                                                            placeholder="Soyadınız"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="mb-2 block text-sm font-medium text-gray-700">
                                                            Doğum Tarihi
                                                        </label>

                                                        <input
                                                            type="text"
                                                            value={guest.dogumTarihi}
                                                            onChange={(event) =>
                                                                handleGuestChange(
                                                                    index,
                                                                    'dogumTarihi',
                                                                    event.target.value
                                                                )
                                                            }
                                                            className="focus:ring-primary w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2"
                                                            placeholder="GG.AA.YYYY"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="mb-2 block text-sm font-medium text-gray-700">
                                                            Kimlik / Pasaport No
                                                        </label>

                                                        <input
                                                            type="text"
                                                            value={guest.kimlikNo}
                                                            onChange={(event) =>
                                                                handleGuestChange(
                                                                    index,
                                                                    'kimlikNo',
                                                                    event.target.value
                                                                )
                                                            }
                                                            className="focus:ring-primary w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2"
                                                            placeholder="Kimlik No"
                                                        />
                                                    </div>

                                                    <div className="sm:col-span-2">
                                                        <label className="mb-2 block text-sm font-medium text-gray-700">
                                                            Cinsiyet
                                                        </label>

                                                        <select
                                                            value={guest.cinsiyet}
                                                            onChange={(event) =>
                                                                handleGuestChange(
                                                                    index,
                                                                    'cinsiyet',
                                                                    event.target.value
                                                                )
                                                            }
                                                            className="focus:ring-primary w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2"
                                                        >
                                                            <option>Seçiniz</option>
                                                            <option>Kadın</option>
                                                            <option>Erkek</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleAddGuest}
                                        className="border-primary text-primary hover:bg-primary/5 mt-6 flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed py-3 font-medium transition"
                                    >
                                        <Plus size={18} />
                                        Yeni Misafir Ekle
                                    </button>
                                </div>

                                {/* Section 3: Contact Information */}
                                <div className="rounded-xl bg-white p-6 shadow-md">
                                    <div className="mb-6 flex items-start gap-4">
                                        <div className="bg-primary flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full font-bold text-white">
                                            3
                                        </div>

                                        <h2 className="text-primary text-lg font-semibold">
                                            İletişim Bilgileri
                                        </h2>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                                Telefon Numarası
                                            </label>

                                            <div className="relative">
                                                <Phone
                                                    size={16}
                                                    className="absolute left-3 top-3.5 text-gray-400"
                                                />

                                                <input
                                                    type="tel"
                                                    value={phone}
                                                    onChange={(event) =>
                                                        setPhone(event.target.value)
                                                    }
                                                    className="focus:ring-primary w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 focus:outline-none focus:ring-2"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                                E-posta Adresi
                                            </label>

                                            <div className="relative">
                                                <Mail
                                                    size={16}
                                                    className="absolute left-3 top-3.5 text-gray-400"
                                                />

                                                <input
                                                    type="email"
                                                    value={email}
                                                    onChange={(event) =>
                                                        setEmail(event.target.value)
                                                    }
                                                    className="focus:ring-primary w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 focus:outline-none focus:ring-2"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                                Adres / Not
                                            </label>

                                            <div className="relative">
                                                <MapPin
                                                    size={16}
                                                    className="absolute left-3 top-3.5 text-gray-400"
                                                />

                                                <textarea
                                                    value={address}
                                                    onChange={(event) =>
                                                        setAddress(event.target.value)
                                                    }
                                                    className="focus:ring-primary w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 focus:outline-none focus:ring-2"
                                                    rows={3}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 4: Confirmation */}
                                <div className="rounded-xl bg-white p-6 shadow-md">
                                    <div className="mb-6 flex items-start gap-4">
                                        <div className="bg-primary flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full font-bold text-white">
                                            4
                                        </div>

                                        <h2 className="text-primary text-lg font-semibold">
                                            Kullanıcı Onay Kutusu
                                        </h2>
                                    </div>

                                    <label className="flex cursor-pointer items-start gap-3">
                                        <input
                                            type="checkbox"
                                            checked={agreed}
                                            onChange={(event) =>
                                                setAgreed(event.target.checked)
                                            }
                                            className="text-success focus:ring-success mt-0.5 h-5 w-5 rounded border-gray-300 bg-white"
                                        />

                                        <span className="text-gray-700">
                                            Rezervasyon bilgilerimin doğru olduğunu ve
                                            şartları kabul ettiğimi onaylıyorum.{' '}
                                            <a
                                                href="#"
                                                className="text-primary font-medium hover:underline"
                                            >
                                                Şartları Oku
                                            </a>
                                        </span>
                                    </label>
                                </div>

                                {/* Section 5: Submit */}
                                <div className="rounded-xl bg-white p-6 shadow-md">
                                    <div className="mb-6 flex items-start gap-4">
                                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-orange-500 font-bold text-white">
                                            5
                                        </div>

                                        <h2 className="text-lg font-semibold text-gray-900">
                                            Rezervasyon Onayı
                                        </h2>
                                    </div>

                                    <div className="mb-6">
                                        <p className="mb-3 text-sm font-medium text-gray-700">
                                            Tur Seçimi
                                        </p>

                                        <div className="flex flex-wrap gap-3">
                                            <button
                                                type="button"
                                                className="rounded-full bg-orange-500 px-4 py-2 font-medium text-white transition hover:bg-orange-600"
                                            >
                                                Antalya Şehir Turu
                                            </button>

                                            <button
                                                type="button"
                                                className="rounded-full bg-gray-100 px-4 py-2 font-medium text-gray-700 transition hover:bg-gray-200"
                                            >
                                                Diğer Turlar
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <p className="mb-3 text-sm font-medium text-gray-700">
                                            Ödeme Tercihi
                                        </p>

                                        <div className="flex flex-wrap gap-3">
                                            <button
                                                type="button"
                                                className="rounded-full bg-orange-500 px-4 py-2 font-medium text-white transition hover:bg-orange-600"
                                            >
                                                Kredi Kartı
                                            </button>

                                            <button
                                                type="button"
                                                className="rounded-full bg-gray-100 px-4 py-2 font-medium text-gray-700 transition hover:bg-gray-200"
                                            >
                                                Banka Transferi
                                            </button>

                                            <button
                                                type="button"
                                                className="rounded-full bg-gray-100 px-4 py-2 font-medium text-gray-700 transition hover:bg-gray-200"
                                            >
                                                Taksit
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex justify-between gap-3">
                                        <button
                                            type="button"
                                            className="px-6 py-2 font-medium text-gray-700 transition hover:bg-gray-100"
                                        >
                                            İptal
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleCreateReservation}
                                            disabled={!agreed}
                                            className="rounded-lg bg-orange-500 px-8 py-2 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-300"
                                        >
                                            Değişiklikleri Kaydet
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Success State */}
                        {step === 'success' && (
                            <div className="mx-auto max-w-2xl">
                                <div className="border-success rounded-xl border-4 bg-white p-8 shadow-lg">
                                    <div className="mb-6 flex justify-center">
                                        <div className="relative">
                                            <div className="bg-success/20 absolute inset-0 rounded-full blur-xl" />

                                            <CheckCircle2
                                                size={80}
                                                className="text-success relative"
                                            />
                                        </div>
                                    </div>

                                    <h2 className="text-success mb-3 text-center text-3xl font-bold">
                                        Rezervasyon Başarılı!
                                    </h2>

                                    <p className="mb-6 text-center text-gray-600">
                                        Rezervasyonunuz başarıyla oluşturuldu. Bilgiler
                                        e-posta adresinize gönderildi.
                                    </p>

                                    <div className="mb-6 rounded-lg bg-green-50 p-4">
                                        <p className="text-success text-center text-lg font-semibold">
                                            Rezervasyon Numaranız
                                        </p>

                                        <p className="text-success mt-1 text-center text-2xl font-bold">
                                            RSV-20260709-001
                                        </p>
                                    </div>

                                    <div className="mb-6 space-y-3 rounded-lg bg-gray-50 p-4 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">
                                                Ürün:
                                            </span>
                                            <span className="font-medium">
                                                Antalya Şehir Turu
                                            </span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span className="text-gray-600">
                                                Tarih:
                                            </span>
                                            <span className="font-medium">
                                                15 Temmuz 2026
                                            </span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span className="text-gray-600">
                                                Misafir Sayısı:
                                            </span>
                                            <span className="font-medium">
                                                {guests.length} Yetişkin
                                            </span>
                                        </div>

                                        <div className="flex justify-between border-t pt-3 font-semibold">
                                            <span>Toplam Tutar:</span>
                                            <span className="text-success">
                                                2.400 TL
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <button
                                            type="button"
                                            onClick={() => setStep('form')}
                                            className="bg-success hover:bg-success/90 flex w-full items-center justify-center gap-2 rounded-lg py-3 font-semibold text-white transition"
                                        >
                                            <ArrowRight size={18} />
                                            Rezervasyon Detayına Git
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleGoHome}
                                            className="border-success text-success hover:bg-success/5 flex w-full items-center justify-center gap-2 rounded-lg border-2 py-3 font-semibold transition"
                                        >
                                            <Home size={18} />
                                            Ana Sayfaya Dön
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Error State */}
                        {step === 'error' && (
                            <div className="mx-auto max-w-2xl">
                                <div className="border-destructive rounded-xl border-4 bg-white p-8 shadow-lg">
                                    <div className="mb-6 flex justify-center">
                                        <div className="relative">
                                            <div className="bg-destructive/20 absolute inset-0 rounded-full blur-xl" />

                                            <AlertCircle
                                                size={80}
                                                className="text-destructive relative"
                                            />
                                        </div>
                                    </div>

                                    <h2 className="text-destructive mb-3 text-center text-3xl font-bold">
                                        Rezervasyon Oluşturulamadı
                                    </h2>

                                    <p className="mb-6 text-center text-gray-600">
                                        Bir hata oluştu. Lütfen bilgilerinizi kontrol
                                        edip tekrar deneyiniz.
                                    </p>

                                    <div className="border-destructive mb-6 rounded border-l-4 bg-red-50 p-4">
                                        <h3 className="mb-2 font-semibold text-gray-900">
                                            Hata Detayı
                                        </h3>

                                        <p className="text-sm text-gray-700">
                                            Lütfen tüm zorunlu alanları doldurduğunuzdan
                                            emin olun.
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        <button
                                            type="button"
                                            onClick={handleRetry}
                                            className="bg-destructive hover:bg-destructive/90 w-full rounded-lg py-3 font-semibold text-white transition"
                                        >
                                            Tekrar Dene
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleGoHome}
                                            className="border-destructive text-destructive hover:bg-destructive/5 flex w-full items-center justify-center gap-2 rounded-lg border-2 py-3 font-semibold transition"
                                        >
                                            <Home size={18} />
                                            Ana Sayfaya Dön
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Preview */}
                    {step === 'form' && (
                        <div className="lg:col-span-1">
                            <div className="sticky top-24 rounded-xl bg-white p-6 shadow-md">
                                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                                    Rezervasyon Önizleme
                                </h3>

                                <div className="space-y-4 text-sm">
                                    <div>
                                        <p className="mb-1 font-medium text-gray-500">
                                            Ürün
                                        </p>
                                        <p className="font-medium text-gray-900">
                                            Antalya Şehir Turu
                                        </p>
                                    </div>

                                    <div>
                                        <p className="mb-1 font-medium text-gray-500">
                                            Tarih
                                        </p>
                                        <p className="font-medium text-gray-900">
                                            15 Temmuz 2026
                                        </p>
                                    </div>

                                    <div>
                                        <p className="mb-1 font-medium text-gray-500">
                                            Misafir Sayısı
                                        </p>
                                        <p className="font-medium text-gray-900">
                                            {guests.length} Yetişkin
                                        </p>
                                    </div>

                                    <div>
                                        <p className="mb-1 font-medium text-gray-500">
                                            Misafirler
                                        </p>

                                        <ul className="space-y-1 text-gray-900">
                                            {guests.map((guest, index) => (
                                                <li key={index} className="flex gap-1">
                                                    <span>•</span>
                                                    <span>
                                                        {guest.ad || 'İsimsiz'}{' '}
                                                        {guest.soyad}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div>
                                        <p className="mb-1 font-medium text-gray-500">
                                            İletişim
                                        </p>

                                        <p className="break-all font-medium text-gray-900">
                                            {phone}
                                        </p>

                                        <p className="break-all font-medium text-gray-900">
                                            {email}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="mb-1 font-medium text-gray-500">
                                            Not
                                        </p>

                                        <p className="text-xs text-gray-900">
                                            {address}
                                        </p>
                                    </div>

                                    <div className="border-t pt-4">
                                        <div className="flex items-center justify-between">
                                            <p className="font-medium text-gray-500">
                                                Toplam Tutar
                                            </p>

                                            <p className="text-primary text-lg font-bold">
                                                2.400 TL
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

