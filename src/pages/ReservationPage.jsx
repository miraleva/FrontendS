import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ChatSidebar from "../components/ChatSidebar";
import { PanelLeftOpen, ArrowLeft } from "lucide-react";

export default function ReservationPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const selectedItem = location.state?.selectedItem;

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
                        title="Expand Sidebar"
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
                                Reservation Confirmation
                            </h1>

                            {!selectedItem ? (
                                <div className="text-center py-8">
                                    <p className="text-slate-800 font-medium mb-6">No item selected</p>
                                    <button
                                        onClick={() => navigate('/chat')}
                                        className="px-6 py-3 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold rounded-[12px] transition-colors duration-200 text-[14px] flex items-center justify-center gap-2 mx-auto"
                                    >
                                        <ArrowLeft size={16} />
                                        Back to Chat
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {selectedItem.airline !== undefined ? (
                                        // Flight view
                                        <div className="bg-white/50 border border-white/20 rounded-[16px] p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <span className="font-bold text-[#1E232C] text-xl">✈️ {selectedItem.airline}</span>
                                                <span className="text-[#3B82F6] font-bold text-xl">{selectedItem.price} {selectedItem.currency}</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 text-sm text-slate-800 font-medium">
                                                <div><span className="text-slate-500 uppercase text-xs block mb-1">Departure</span> {selectedItem.departureTime}</div>
                                                <div><span className="text-slate-500 uppercase text-xs block mb-1">Arrival</span> {selectedItem.arrivalTime}</div>
                                                <div><span className="text-slate-500 uppercase text-xs block mb-1">Transfers</span> {selectedItem.transfers}</div>
                                                <div><span className="text-slate-500 uppercase text-xs block mb-1">Baggage</span> {selectedItem.baggage}</div>
                                            </div>
                                        </div>
                                    ) : (
                                        // Hotel view
                                        <div className="bg-white/50 border border-white/20 rounded-[16px] p-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-[#1E232C] text-xl">🏨 {selectedItem.name || selectedItem.hotelId}</span>
                                                    <span className="text-sm text-slate-600 mt-1">{selectedItem.region} • {selectedItem.stars}★</span>
                                                </div>
                                                <span className="text-[#3B82F6] font-bold text-xl">{selectedItem.price} {selectedItem.currency}</span>
                                            </div>
                                            <div className="text-sm text-slate-800 font-medium pt-4 border-t border-white/30">
                                                <span className="text-slate-500 uppercase text-xs block mb-1">Board / Pension</span>
                                                {selectedItem.boardType || selectedItem.pensionType || "N/A"}
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-8 flex justify-end gap-4">
                                        <button
                                            onClick={() => navigate('/chat')}
                                            className="px-6 py-3 border border-slate-700/20 hover:bg-slate-700/10 text-slate-700 font-semibold rounded-[12px] transition-colors duration-200 text-[14px]"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => alert("Full reservation form is a future task")}
                                            className="px-6 py-3 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold rounded-[12px] shadow-md transition-colors duration-200 text-[14px]"
                                        >
                                            Confirm & Proceed
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