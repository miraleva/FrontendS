import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ChatSidebar from "../components/ChatSidebar";
import { PanelLeftOpen, ArrowLeft, CheckCircle2 } from "lucide-react";
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

// LocalDate (yyyy-MM-dd) bekleyen backend'e göndermek için tarih/tarih-saat
// değerinden sadece tarih kısmını çıkarır.
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

    const [passenger, setPassenger] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        identityNumber: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [reservationResult, setReservationResult] = useState(null);

    // Geldiğimiz sohbete geri dön (sessionId varsa o oturumla, yoksa genel sohbet sayfasına)
    const backToChat = () => navigate(sessionId ? `/chat?sessionId=${sessionId}` : '/chat');

    const handlePassengerChange = (field, value) => {
        setPassenger((prev) => ({ ...prev, [field]: value }));
    };

    const handleConfirm = async () => {
        if (!selectedItem) return;
        setSubmitError("");

        const isFlight = selectedItem.airline !== undefined;
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
            passengers: [
                {
                    firstName: passenger.firstName,
                    lastName: passenger.lastName,
                    email: passenger.email,
                    phoneNumber: passenger.phone,
                    identityNumber: passenger.identityNumber,
                },
            ],
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

    const isPassengerFormValid = passenger.firstName.trim()
        && passenger.lastName.trim()
        && passenger.email.trim()
        && passenger.phone.trim()
        && passenger.identityNumber.trim();

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
                        className="fixed top-4 left-4 z-40 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-md text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-800 dark:hover:text-slate-200 transition-all cursor-pointer"
                        title={t("reservation_expand_sidebar")}
                    >
                        <PanelLeftOpen size={18} />
                    </button>
                )}

                <video autoPlay loop muted playsInline className="absolute top-0 left-0 w-full h-full object-cover z-0 pointer-events-none opacity-100 dark:opacity-30 dark:brightness-[0.4] blur-none dark:blur-lg">
                    <source src="/videos/chatbot_bg.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>

                <div className="absolute top-0 left-0 w-full h-full bg-black/20 dark:bg-black/60 z-10 pointer-events-none" />

                <div className="flex-1 overflow-y-auto px-[16px] py-[32px] md:py-[48px] flex justify-center items-start z-20">
                    <div className="w-full max-w-[672px] mt-[16px] md:mt-[24px]">
                        <div className="bg-gradient-to-b from-white/[0.22] to-white/[0.10] dark:from-slate-900/60 dark:to-slate-900/40 backdrop-blur-xl rounded-[20px] shadow-xl p-[32px] md:p-[40px] border border-white/20 dark:border-slate-800/40">
                            
                            <h1 className="text-[28px] font-bold text-slate-900 dark:text-white leading-tight mb-6">
                                {t("reservation_title")}
                            </h1>

                            {!selectedItem ? (
                                <div className="text-center py-8">
                                    <p className="text-slate-800 dark:text-slate-200 font-medium mb-6">{t("reservation_no_item")}</p>
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
                                    <p className="text-slate-800 dark:text-slate-200 font-medium mb-6">
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
                                        <div className="bg-white/50 dark:bg-slate-900/40 border border-white/20 dark:border-slate-850/40 rounded-[16px] p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <span className="font-bold text-[#1E232C] dark:text-white text-xl">✈️ {selectedItem.airline}</span>
                                                <span className="text-[#3B82F6] dark:text-blue-400 font-bold text-xl">{formatPrice(selectedItem.price)} {selectedItem.currency}</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 text-sm text-slate-800 dark:text-slate-200 font-medium">
                                                <div><span className="text-slate-500 dark:text-slate-400 uppercase text-xs block mb-1">{t("reservation_departure")}</span> {formatFlightDateTime(selectedItem.departureTime)}</div>
                                                <div><span className="text-slate-500 dark:text-slate-400 uppercase text-xs block mb-1">{t("reservation_arrival")}</span> {formatFlightDateTime(selectedItem.arrivalTime)}</div>
                                                <div><span className="text-slate-500 dark:text-slate-400 uppercase text-xs block mb-1">{t("reservation_transfers")}</span> {selectedItem.transfers}</div>
                                                <div><span className="text-slate-500 dark:text-slate-400 uppercase text-xs block mb-1">{t("reservation_baggage")}</span> {formatBaggage(selectedItem.baggage, t)}</div>
                                            </div>
                                            {selectedItem.returnDepartureTime && (
                                                <div className="grid grid-cols-2 gap-4 text-sm text-slate-800 dark:text-slate-200 font-medium pt-4 mt-4 border-t border-dashed border-slate-300 dark:border-slate-800">
                                                    <div className="col-span-2 font-bold">↩ {selectedItem.returnAirline || selectedItem.airline}</div>
                                                    <div><span className="text-slate-500 dark:text-slate-400 uppercase text-xs block mb-1">{t("reservation_return_departure")}</span> {formatFlightDateTime(selectedItem.returnDepartureTime)}</div>
                                                    <div><span className="text-slate-500 dark:text-slate-400 uppercase text-xs block mb-1">{t("reservation_return_arrival")}</span> {formatFlightDateTime(selectedItem.returnArrivalTime)}</div>
                                                    <div><span className="text-slate-500 dark:text-slate-400 uppercase text-xs block mb-1">{t("reservation_transfers")}</span> {selectedItem.returnTransfers}</div>
                                                    <div><span className="text-slate-500 dark:text-slate-400 uppercase text-xs block mb-1">{t("reservation_baggage")}</span> {formatBaggage(selectedItem.returnBaggage, t)}</div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="bg-white/50 dark:bg-slate-900/40 border border-white/20 dark:border-slate-850/40 rounded-[16px] p-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-[#1E232C] dark:text-white text-xl">🏨 {selectedItem.name || selectedItem.hotelId}</span>
                                                    <span className="text-sm text-slate-600 dark:text-slate-400 mt-1">{selectedItem.region} • {selectedItem.stars}★</span>
                                                </div>
                                                <span className="text-[#3B82F6] dark:text-blue-400 font-bold text-xl">{formatPrice(selectedItem.price)} {selectedItem.currency}</span>
                                            </div>
                                            <div className="text-sm text-slate-800 dark:text-slate-200 font-medium pt-4 border-t border-white/30 dark:border-slate-800">
                                                <span className="text-slate-500 dark:text-slate-400 uppercase text-xs block mb-1">{t("reservation_board_pension")}</span>
                                                {selectedItem.boardType || selectedItem.pensionType || t("reservation_na")}
                                            </div>
                                        </div>
                                    )}

                                    <div className="bg-white/50 dark:bg-slate-900/40 border border-white/20 dark:border-slate-850/40 rounded-[16px] p-6 space-y-4">
                                        <h2 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                                            {t("reservation_passenger_info")}
                                        </h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">{t("reservation_first_name")}</label>
                                                <input
                                                    required
                                                    type="text"
                                                    value={passenger.firstName}
                                                    onChange={(e) => handlePassengerChange("firstName", e.target.value)}
                                                    className="w-full bg-white/80 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6]"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">{t("reservation_last_name")}</label>
                                                <input
                                                    required
                                                    type="text"
                                                    value={passenger.lastName}
                                                    onChange={(e) => handlePassengerChange("lastName", e.target.value)}
                                                    className="w-full bg-white/80 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6]"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">{t("reservation_email")}</label>
                                                <input
                                                    required
                                                    type="email"
                                                    value={passenger.email}
                                                    onChange={(e) => handlePassengerChange("email", e.target.value)}
                                                    className="w-full bg-white/80 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6]"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">{t("reservation_phone")}</label>
                                                <input
                                                    required
                                                    type="tel"
                                                    value={passenger.phone}
                                                    onChange={(e) => handlePassengerChange("phone", e.target.value)}
                                                    className="w-full bg-white/80 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6]"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">{t("reservation_identity_number")}</label>
                                                <input
                                                    required
                                                    type="text"
                                                    value={passenger.identityNumber}
                                                    onChange={(e) => handlePassengerChange("identityNumber", e.target.value)}
                                                    className="w-full bg-white/80 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6]"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {submitError && (
                                        <p className="text-red-600 dark:text-red-400 text-sm font-medium text-right">{submitError}</p>
                                    )}

                                    <div className="mt-8 flex justify-end gap-4">
                                        <button
                                            onClick={backToChat}
                                            disabled={isSubmitting}
                                            className="px-6 py-3 border border-slate-700/20 dark:border-slate-750 hover:bg-slate-700/10 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-[12px] transition-colors duration-200 text-[14px] disabled:opacity-50"
                                        >
                                            {t("reservation_cancel")}
                                        </button>
                                        <button
                                            onClick={handleConfirm}
                                            disabled={!isPassengerFormValid || isSubmitting}
                                            className="px-6 py-3 bg-[#3B82F6] hover:bg-[#2563EB] disabled:bg-slate-400 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-[12px] shadow-md transition-colors duration-200 text-[14px]"
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