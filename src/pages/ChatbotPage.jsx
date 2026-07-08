import { useState, useEffect, useRef } from "react";
import { PanelLeftOpen } from "lucide-react";
import ChatSidebar from "../components/ChatSidebar";

export default function Index() {
    const [searchQuery, setSearchQuery] = useState("");
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const email = localStorage.getItem('userId') || "";
    const username = email ? email.split('@')[0] : "Guest";

    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.muted = true;
            videoRef.current.play().catch(error => {
                console.log("Video autoplay engeline takıldı:", error);
            });
        }
    }, []);

    return (
        <div className="flex h-screen w-full overflow-hidden bg-bg font-sans">
            {/* Collapsible Chat Sidebar */}
            <ChatSidebar
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 h-full relative overflow-y-auto bg-transparent">
                {/* Toggle open button when sidebar is collapsed */}
                {!isSidebarOpen && (
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="absolute top-4 left-4 z-30 p-2 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 text-text-secondary hover:text-text-primary transition-all duration-200 focus:outline-none"
                        title="Expand Sidebar"
                    >
                        <PanelLeftOpen size={18} />
                    </button>
                )}

                {/* Arka Plan Videosu - fixed ve z-0 ile en arkaya çiviliyoruz */}
                <video
                    ref={videoRef}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                    className="fixed top-0 left-0 w-full h-full object-cover z-0 pointer-events-none"
                >
                    <source src="/videos/chatbot_bg.mp4" type="video/mp4" />
                    Tarayıcınız video etiketini desteklemiyor.
                </video>

                {/* CHAT VIEW - z-10 ve relative ile videonun üstünde kalmasını sağlıyoruz */}
                <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 z-10 relative">
                    <div className="w-full max-w-2xl animate-fade-in">
                        {/* Welcome Section */}
                        <div className="mb-12 text-center md:mb-16">
                            <h1 className="text-4xl md:text-5xl font-bold text-[#1E232C] mb-2 flex items-center justify-center gap-3 md:gap-4 flex-wrap">
                                <img
                                    src="/logo.png"
                                    alt="Sanny Logo"
                                    className="h-20 w-auto xl:h-25 object-contain"
                                />
                                <span>Good Morning, {username}</span>
                            </h1>
                            <p className="text-[#1E232C]/70 text-base md:text-lg">
                                How can we help you today?
                            </p>
                        </div>

                        {/* Action Badges */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 md:mb-16">
                            <button
                                className="px-6 py-3 rounded-full font-bold text-white transition-all transform hover:scale-105 shadow-lg cursor-pointer"
                                style={{
                                    backgroundColor: "#ffb8038c",
                                }}
                                onMouseEnter={(e) =>
                                    (e.currentTarget.style.backgroundColor = "#ffb80354")
                                }
                                onMouseLeave={(e) =>
                                    (e.currentTarget.style.backgroundColor = "#ffb8038c")
                                }
                            >
                                Plane ticket
                            </button>
                            <button
                                className="px-6 py-3 rounded-full font-bold text-white transition-all transform hover:scale-105 shadow-lg cursor-pointer"
                                style={{
                                    backgroundColor: "#ffb8038c",
                                }}
                                onMouseEnter={(e) =>
                                    (e.currentTarget.style.backgroundColor = "#ffb80354")
                                }
                                onMouseLeave={(e) =>
                                    (e.currentTarget.style.backgroundColor = "#ffb8038c")
                                }
                            >
                                Hotel reservation
                            </button>
                        </div>

                        {/* Glassmorphic Chat Container */}
                        <div
                            className="relative rounded-3xl shadow-2xl backdrop-blur-xl border"
                            style={{
                                backgroundColor: "rgba(255, 255, 255, 0.1)",
                                borderColor: "rgba(255, 255, 255, 0.2)",
                            }}
                        >
                            {/* Input Section */}
                            <div className="p-6 md:p-8">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="How can I help?"
                                    className="w-full px-6 py-4 rounded-full text-center text-black placeholder-black/40 focus:outline-none transition-colors border"
                                    style={{
                                        backgroundColor: "rgba(255, 255, 255, 0.4)",
                                        borderColor: "rgba(255, 255, 255, 0.15)",
                                    }}
                                    onFocus={(e) => {
                                        e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.6)";
                                    }}
                                    onBlur={(e) => {
                                        e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.4)";
                                    }}
                                />
                            </div>

                            {/* Quick Actions Grid */}
                            <div className="border-t px-6 md:px-8 py-6 md:py-8" style={{
                                borderColor: "rgba(255, 255, 255, 0.1)",
                            }}>
                                <p className="text-[#1E232C]/60 text-sm font-medium mb-4">
                                    Popular queries
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {[
                                        "Book a flight to Bali",
                                        "Find luxury hotels",
                                        "Travel itinerary",
                                        "Visa information",
                                    ].map((query, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSearchQuery(query)}
                                            className="p-3 rounded-lg text-left text-[#1E232C]/75 hover:text-white text-sm transition-all hover:bg-white/15 cursor-pointer"
                                            style={{
                                                backgroundColor: "rgba(255, 255, 255, 0.05)",
                                            }}
                                        >
                                            <span className="font-medium">{query}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Footer Info */}
                        <div className="mt-12 text-center text-[#1E232C]/50 text-sm">
                            <p>Powered by SAN TSG</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
