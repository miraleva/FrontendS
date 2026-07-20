import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ChatSidebar from "../components/ChatSidebar";
import { PanelLeftOpen, ArrowLeft, CheckCircle2, User, Baby, Mail, Phone, ShieldCheck, ChevronDown, ChevronUp } from "lucide-react";
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import api from "../services/api";

function formatPrice(price) {
    const num = Number(price);
    if (Number.isNaN(num)) return price;
    return Math.round(num).toLocaleString("tr-TR");
}

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

function formatBaggage(baggage, t) {
    if (!baggage || baggage === "0kg" || baggage === "0 kg") {
        return t ? t("baggage_not_included") : "Baggage not included";
    }
    return baggage;
}

function toDateOnly(value) {
    if (!value) return null;
    const match = /^\d{4}-\d{2}-\d{2}/.exec(value);
    if (match) return match[0];
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString().slice(0, 10);
}

export default function ReservationPage() {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const selectedItem = location.state?.selectedItem;
    const bookingDetails = location.state?.bookingDetails;
    const sessionId = location.state?.sessionId;

    const isFlight = selectedItem?.airline !== undefined;
    const adultCount = isFlight
        ? (parseInt(bookingDetails?.passengerCount) || 1)
        : (parseInt(bookingDetails?.adultCount) || 1);
    const childCount = isFlight
        ? 0
        : (parseInt(bookingDetails?.childCount) || 0);
    const childAges = isFlight
        ? []
        : (bookingDetails?.childAges || []);

    const [passengers, setPassengers] = useState([]);
    const [expandedGuestId, setExpandedGuestId] = useState('adult-0');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [reservationResult, setReservationResult] = useState(null);

    // Sayfa yüklendiğinde backend'den profil bilgilerini alarak formu önceden doldur
    useEffect(() => {
        const fetchPrefill = async () => {
            try {
                const response = await api.get("/api/reservations/prefill");
                const data = response.data;
                setPassenger((prev) => ({
                    firstName: data.firstName || prev.firstName,
                    lastName: data.lastName || prev.lastName,
                    email: data.email || prev.email,
                    phone: data.phoneNumber || prev.phone,
                    identityNumber: prev.identityNumber, // backend'de yok, boş kalır
                }));
            } catch {
                // Kullanıcı giriş yapmamışsa veya istek başarısız olursa form boş başlar
            }
        };
        fetchPrefill();
    }, []);

    // Geldiğimiz sohbete geri dön (sessionId varsa o oturumla, yoksa genel sohbet sayfasına)
    const backToChat = () => navigate(sessionId ? `/chat?sessionId=${sessionId}` : '/chat');

    useEffect(() => {
        if (selectedItem) {
            const initialPassengers = [];
            for (let i = 0; i < adultCount; i++) {
                initialPassengers.push({
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
                initialPassengers.push({
                    id: `child-${i}`,
                    type: 'CHILD',
                    firstName: '',
                    lastName: '',
                    identityNumber: '',
                    email: '',
                    phone: '',
                    birthDate: '',
                    gender: 'MR',
                    nationality: 'TR',
                    age: childAges[i] !== undefined ? childAges[i].toString() : '',
                });
            }
            setPassengers(initialPassengers);
        }
    }, [selectedItem, bookingDetails, adultCount, childCount, childAges]);

    const handlePassengerChange = (index, field, value) => {
        setPassengers((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const handleConfirm = async () => {
        if (!selectedItem) return;
        setSubmitError("");

        const startDate = isFlight
            ? toDateOnly(selectedItem.departureTime)
            : toDateOnly(bookingDetails?.checkIn);
        const endDate = isFlight
            ? toDateOnly(selectedItem.returnDepartureTime) || startDate
            : toDateOnly(bookingDetails?.checkOut);

        const payload = {
            type: isFlight ? "FLIGHT" : "HOTEL",
            itemName: isFlight ? selectedItem.airline : (selectedItem.name || selectedItem.hotelId || "-"),
            destination: isFlight
                ? (bookingDetails?.arrivalCity || "-")
                : (bookingDetails?.city || selectedItem.region || "-"),
            startDate,
            endDate,
            totalPrice: Number(selectedItem.price) || 0,
            currency: selectedItem.currency || "TRY",
            passengers: passengers.map((p) => ({
                firstName: p.firstName,
                lastName: p.lastName,
                email: p.email || '',
                phoneNumber: p.phone || '',
                identityNumber: p.identityNumber,
                birthDate: p.birthDate,
                gender: p.gender,
                nationality: p.nationality,
            })),
        };

        setIsSubmitting(true);
        try {
            const response = await api.post("/api/reservations", payload);
            setReservationResult(response.data);
        } catch (err) {
            console.error("Reservation creation failed", err);
            setSubmitError(t("reservation_confirm_error"));
        } finally {
            setIsSubmitting(false);
        }
    };

    const isIdentityNumberValid = (idNo, nationality) => {
        if (!idNo) return false;
        if (nationality?.toUpperCase() === 'TR') {
            return /^[1-9]\d{10}$/.test(idNo);
        }
        return idNo.trim().length >= 5;
    };

    const isPassengerFormValid = passengers.length > 0 && passengers.every((p) => {
        const isPhoneValid = p.phone && isValidPhoneNumber(p.phone);
        const isIdValid = isIdentityNumberValid(p.identityNumber, p.nationality);
        const isBirthDateValid = p.birthDate && new Date(p.birthDate) < new Date();

        return p.firstName?.trim() &&
            p.lastName?.trim() &&
            isIdValid &&
            isBirthDateValid &&
            p.gender?.trim() &&
            p.nationality?.trim() &&
            p.email?.trim() &&
            isPhoneValid;
    });

    return (
        <div className="flex h-screen w-full overflow-hidden bg-bg font-sans relative">
            <ChatSidebar
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
            />

            <div className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden bg-transparent">
                {!isSidebarOpen && (
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="absolute top-[16px] left-[16px] z-30 p-[8px] bg-white border border-slate-200 rounded-[12px] shadow-sm hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-all duration-200 focus:outline-none cursor-pointer"
                        title={t("reservation_expand_sidebar")}
                    >
                        <PanelLeftOpen size={18} />
                    </button>
                )}

                <video autoPlay loop muted playsInline className="absolute top-0 left-0 w-full h-full object-cover z-0 pointer-events-none">
                    <source src="/videos/chatbot_bg.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>

                <div className="absolute top-0 left-0 w-full h-full bg-black/20 z-10 pointer-events-none" />

                <div className="flex-1 overflow-y-auto px-[16px] py-[32px] md:py-[48px] flex justify-center items-start z-20">
                    <div className="w-full max-w-[672px] mt-[16px] md:mt-[24px]">
                        <div className="bg-gradient-to-b from-white/[0.22] to-white/[0.10] backdrop-blur-xl rounded-[20px] shadow-xl p-[32px] md:p-[40px] border border-white/20">

                            <h1 className="text-[28px] font-bold text-slate-900 leading-tight mb-6">
                                {t("reservation_title")}
                            </h1>

                            {!selectedItem ? (
                                <div className="text-center py-8">
                                    <p className="text-slate-800 font-medium mb-6">{t("reservation_no_item")}</p>
                                    <button
                                        onClick={backToChat}
                                        className="px-6 py-3 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold rounded-[12px] transition-colors duration-200 text-[14px] flex items-center justify-center gap-2 mx-auto"
                                    >
                                        <ArrowLeft size={16} />
                                        {t("reservation_back_to_chat")}
                                    </button>
                                </div>
                            ) : reservationResult ? (
                                <div className="text-center py-8">
                                    <CheckCircle2 size={48} className="text-emerald-500 mx-auto mb-4" />
                                    <p className="text-slate-800 font-medium mb-6">
                                        {t("reservation_confirm_success", { number: reservationResult.reservationNumber })}
                                    </p>
                                    <button
                                        onClick={backToChat}
                                        className="px-6 py-3 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold rounded-[12px] transition-colors duration-200 text-[14px] flex items-center justify-center gap-2 mx-auto"
                                    >
                                        <ArrowLeft size={16} />
                                        {t("reservation_back_to_chat")}
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {selectedItem.airline !== undefined ? (
                                        <div className="bg-white/50 border border-white/20 rounded-[16px] p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <span className="font-bold text-[#1E232C] text-xl">✈️ {selectedItem.airline}</span>
                                                <span className="text-[#3B82F6] font-bold text-xl">{formatPrice(selectedItem.price)} {selectedItem.currency}</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 text-sm text-slate-800 font-medium">
                                                <div><span className="text-slate-500 uppercase text-xs block mb-1">{t("reservation_departure")}</span> {formatFlightDateTime(selectedItem.departureTime)}</div>
                                                <div><span className="text-slate-500 uppercase text-xs block mb-1">{t("reservation_arrival")}</span> {formatFlightDateTime(selectedItem.arrivalTime)}</div>
                                                <div><span className="text-slate-500 uppercase text-xs block mb-1">{t("reservation_transfers")}</span> {selectedItem.transfers}</div>
                                                <div><span className="text-slate-500 uppercase text-xs block mb-1">{t("reservation_baggage")}</span> {formatBaggage(selectedItem.baggage, t)}</div>
                                            </div>
                                            {selectedItem.returnDepartureTime && (
                                                <div className="grid grid-cols-2 gap-4 text-sm text-slate-800 font-medium pt-4 mt-4 border-t border-dashed border-slate-300">
                                                    <div className="col-span-2 font-bold">↩ {selectedItem.returnAirline || selectedItem.airline}</div>
                                                    <div><span className="text-slate-500 uppercase text-xs block mb-1">{t("reservation_return_departure")}</span> {formatFlightDateTime(selectedItem.returnDepartureTime)}</div>
                                                    <div><span className="text-slate-500 uppercase text-xs block mb-1">{t("reservation_return_arrival")}</span> {formatFlightDateTime(selectedItem.returnArrivalTime)}</div>
                                                    <div><span className="text-slate-500 uppercase text-xs block mb-1">{t("reservation_transfers")}</span> {selectedItem.returnTransfers}</div>
                                                    <div><span className="text-slate-500 uppercase text-xs block mb-1">{t("reservation_baggage")}</span> {formatBaggage(selectedItem.returnBaggage, t)}</div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="bg-white/50 border border-white/20 rounded-[16px] p-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-[#1E232C] text-xl">🏨 {selectedItem.name || selectedItem.hotelId}</span>
                                                    <span className="text-sm text-slate-600 mt-1">{selectedItem.region} • {selectedItem.stars}★</span>
                                                </div>
                                                <span className="text-[#3B82F6] font-bold text-xl">{formatPrice(selectedItem.price)} {selectedItem.currency}</span>
                                            </div>
                                            <div className="text-sm text-slate-800 font-medium pt-4 border-t border-white/30">
                                                <span className="text-slate-500 uppercase text-xs block mb-1">{t("reservation_board_pension")}</span>
                                                {selectedItem.boardType || selectedItem.pensionType || t("reservation_na")}
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">
                                            {t("reservation_passenger_info")}
                                        </h2>
                                        {passengers.map((p, index) => {
                                            const isExpanded = expandedGuestId === p.id;
                                            const guestTitle = p.type === 'ADULT'
                                                ? `${index + 1}. ${t("unit_adult")}`
                                                : `${index - adultCount + 1}. ${t("unit_child")}`;

                                            return (
                                                <div key={p.id} className="bg-white/50 border border-white/20 rounded-[16px] shadow-sm overflow-hidden transition-all duration-200">
                                                    <button
                                                        type="button"
                                                        onClick={() => setExpandedGuestId(isExpanded ? null : p.id)}
                                                        className="w-full px-5 py-4 flex items-center justify-between hover:bg-white/10 transition-colors"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            {p.type === 'ADULT' ? <User size={18} className="text-[#3B82F6]" /> : <Baby size={18} className="text-amber-500" />}
                                                            <span className="font-bold text-slate-800 text-sm">{guestTitle}</span>

                                                            {!isExpanded && (p.firstName || p.lastName) && (
                                                                <span className="text-sm text-slate-600 ml-2 border-l border-slate-300 pl-4 font-medium">
                                                                    {p.firstName} {p.lastName}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-slate-500">
                                                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                                        </div>
                                                    </button>

                                                    {isExpanded && (
                                                        <div className="p-5 border-t border-white/20 bg-white/20 space-y-4">
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="col-span-1">
                                                                    <label className="block text-xs font-semibold text-slate-600 mb-1">{t("reservation_first_name")}</label>
                                                                    <input
                                                                        required
                                                                        type="text"
                                                                        value={p.firstName}
                                                                        onChange={(e) => handlePassengerChange(index, 'firstName', e.target.value)}
                                                                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6]"
                                                                    />
                                                                </div>
                                                                <div className="col-span-1">
                                                                    <label className="block text-xs font-semibold text-slate-600 mb-1">{t("reservation_last_name")}</label>
                                                                    <input
                                                                        required
                                                                        type="text"
                                                                        value={p.lastName}
                                                                        onChange={(e) => handlePassengerChange(index, 'lastName', e.target.value)}
                                                                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6]"
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="col-span-1">
                                                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Cinsiyet</label>
                                                                    <select
                                                                        required
                                                                        value={p.gender || 'MR'}
                                                                        onChange={(e) => handlePassengerChange(index, 'gender', e.target.value)}
                                                                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6]"
                                                                    >
                                                                        <option value="MR">Bay (Mr.)</option>
                                                                        <option value="MRS">Bayan (Mrs.)</option>
                                                                    </select>
                                                                </div>
                                                                <div className="col-span-1">
                                                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Doğum Tarihi</label>
                                                                    <input
                                                                        required
                                                                        type="date"
                                                                        max={new Date().toISOString().split('T')[0]}
                                                                        value={p.birthDate || ''}
                                                                        onChange={(e) => handlePassengerChange(index, 'birthDate', e.target.value)}
                                                                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6]"
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="col-span-1">
                                                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Uyruk</label>
                                                                    <input
                                                                        required
                                                                        type="text"
                                                                        value={p.nationality || 'TR'}
                                                                        onChange={(e) => handlePassengerChange(index, 'nationality', e.target.value)}
                                                                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6]"
                                                                    />
                                                                </div>
                                                                <div className="col-span-1">
                                                                    <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                                                                        <ShieldCheck size={12} /> {t("reservation_identity_number")}
                                                                    </label>
                                                                    <input
                                                                        required
                                                                        type="text"
                                                                        value={p.identityNumber}
                                                                        onChange={(e) => handlePassengerChange(index, 'identityNumber', e.target.value)}
                                                                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6]"
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="col-span-1">
                                                                    <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                                                                        <Mail size={12} /> {t("reservation_email")}
                                                                    </label>
                                                                    <input
                                                                        required
                                                                        type="email"
                                                                        value={p.email || ''}
                                                                        onChange={(e) => handlePassengerChange(index, 'email', e.target.value)}
                                                                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6]"
                                                                    />
                                                                </div>
                                                                <div className="col-span-1">
                                                                    <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                                                                        <Phone size={12} /> {t("reservation_phone")}
                                                                    </label>
                                                                    <PhoneInput
                                                                        international
                                                                        defaultCountry="TR"
                                                                        value={p.phone || ''}
                                                                        onChange={(val) => handlePassengerChange(index, 'phone', val)}
                                                                        className="flex items-center w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus-within:ring-2 focus-within:ring-[#3B82F6]/50 focus-within:border-[#3B82F6] transition-colors"
                                                                        numberInputProps={{
                                                                            required: true,
                                                                            className: 'bg-transparent border-0 outline-none w-full text-slate-800 focus:ring-0 ml-2 py-1',
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>

                                                            {p.type === 'CHILD' && (
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div className="col-span-1">
                                                                        <label className="block text-xs font-semibold text-slate-600 mb-1">Yaş</label>
                                                                        <input
                                                                            required
                                                                            type="number"
                                                                            min="0"
                                                                            max="17"
                                                                            value={p.age}
                                                                            onChange={(e) => handlePassengerChange(index, 'age', e.target.value)}
                                                                            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6]"
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

                                    {submitError && (
                                        <p className="text-red-600 text-sm font-medium text-right">{submitError}</p>
                                    )}

                                    <div className="mt-8 flex justify-end gap-4">
                                        <button
                                            onClick={backToChat}
                                            disabled={isSubmitting}
                                            className="px-6 py-3 border border-slate-700/20 hover:bg-slate-700/10 text-slate-700 font-semibold rounded-[12px] transition-colors duration-200 text-[14px] disabled:opacity-50"
                                        >
                                            {t("reservation_cancel")}
                                        </button>
                                        <button
                                            onClick={handleConfirm}
                                            disabled={!isPassengerFormValid || isSubmitting}
                                            className="px-6 py-3 bg-[#3B82F6] hover:bg-[#2563EB] disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-semibold rounded-[12px] shadow-md transition-colors duration-200 text-[14px]"
                                        >
                                            {isSubmitting ? t("reservation_submitting") : t("reservation_confirm_proceed")}
                                        </button>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}