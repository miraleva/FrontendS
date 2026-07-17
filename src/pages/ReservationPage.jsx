import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ChatSidebar from "../components/ChatSidebar";
import { PanelLeftOpen, ArrowLeft } from "lucide-react";

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

export default function ReservationPage() {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const selectedItem = location.state?.selectedItem;
    const sessionId = location.state?.sessionId;

    // Geldiğimiz sohbete geri dön (sessionId varsa o oturumla, yoksa genel sohbet sayfasına)
    const backToChat = () => navigate(sessionId ? `/chat?sessionId=${sessionId}` : '/chat');

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
                            ) : (
                                <div className="space-y-4">
                                    {selectedItem.airline !== undefined ? (
                                        // Flight view
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
                                        // Hotel view
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

                                    <div className="mt-8 flex justify-end gap-4">
                                        <button
                                            onClick={backToChat}
                                            className="px-6 py-3 border border-slate-700/20 hover:bg-slate-700/10 text-slate-700 font-semibold rounded-[12px] transition-colors duration-200 text-[14px]"
                                        >
                                            {t("reservation_cancel")}
                                        </button>
                                        <button
                                            onClick={() => alert(t("reservation_future_task_alert"))}
                                            className="px-6 py-3 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold rounded-[12px] shadow-md transition-colors duration-200 text-[14px]"
                                        >
                                            {t("reservation_confirm_proceed")}
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