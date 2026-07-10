import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plane, Hotel, Wifi, Dumbbell, Waves, Plus, Eye, EyeOff, PanelLeftOpen } from "lucide-react";
import ChatSidebar from "../components/ChatSidebar";

export default function Settings() {
    const { t } = useTranslation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState("travel");

    const [flightPrefs, setFlightPrefs] = useState(() => {
        try {
            const stored = localStorage.getItem("flightPrefs");
            return stored ? JSON.parse(stored) : { seat: "window", meal: "standard" };
        } catch (e) {
            return { seat: "window", meal: "standard" };
        }
    });

    const [hotelPrefs, setHotelPrefs] = useState(() => {
        try {
            const stored = localStorage.getItem("hotelPrefs");
            return stored ? JSON.parse(stored) : { roomType: ["double"], amenities: ["wifi", "pool"] };
        } catch (e) {
            return { roomType: ["double"], amenities: ["wifi", "pool"] };
        }
    });

    const [chatbotSettings, setChatbotSettings] = useState(() => {
        try {
            const stored = localStorage.getItem("chatbotSettings");
            return stored ? JSON.parse(stored) : { tone: "friendly" };
        } catch (e) {
            return { tone: "friendly" };
        }
    });

    const [aiResponseLang, setAiResponseLang] = useState(() => {
        return localStorage.getItem("aiResponseLanguage") || "en";
    });

    const [localizationSettings, setLocalizationSettings] = useState(() => {
        try {
            const stored = localStorage.getItem("localizationSettings");
            return stored ? JSON.parse(stored) : { currency: "usd", timezone: "europe/london" };
        } catch (e) {
            return { currency: "usd", timezone: "europe/london" };
        }
    });

    const [notificationSettings, setNotificationSettings] = useState(() => {
        try {
            const stored = localStorage.getItem("notificationSettings");
            return stored ? JSON.parse(stored) : { priceAlerts: true, bookingConfirmations: true };
        } catch (e) {
            return { priceAlerts: true, bookingConfirmations: true };
        }
    });

    const [securitySettings, setSecuritySettings] = useState({
        savedCards: [],
        twoFactorEnabled: false,
    });

    const [newPassword, setNewPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newCard, setNewCard] = useState({
        cardType: "",
        lastFour: "",
        formattedNumber: "",
        expiry: ""
    });
    const [cardToDelete, setCardToDelete] = useState(null);

    const tabs = [
        { id: "travel" },
        { id: "chatbot" },
        { id: "localization" },
        { id: "notifications" },
        { id: "security" },
    ];

    const handleSave = () => {
        localStorage.setItem("flightPrefs", JSON.stringify(flightPrefs));
        localStorage.setItem("hotelPrefs", JSON.stringify(hotelPrefs));
        localStorage.setItem("chatbotSettings", JSON.stringify(chatbotSettings));
        localStorage.setItem("aiResponseLanguage", aiResponseLang);
        localStorage.setItem("localizationSettings", JSON.stringify(localizationSettings));
        localStorage.setItem("notificationSettings", JSON.stringify(notificationSettings));
        alert(t("settings_save_changes"));
    };

    const handleCancel = () => {
        const loadDefaults = () => {
            try {
                const stored = localStorage.getItem("flightPrefs");
                setFlightPrefs(stored ? JSON.parse(stored) : { seat: "window", meal: "standard" });
            } catch (e) { }
            try {
                const stored = localStorage.getItem("hotelPrefs");
                setHotelPrefs(stored ? JSON.parse(stored) : { roomType: ["double"], amenities: ["wifi", "pool"] });
            } catch (e) { }
            try {
                const stored = localStorage.getItem("chatbotSettings");
                setChatbotSettings(stored ? JSON.parse(stored) : { tone: "friendly" });
            } catch (e) { }
            setAiResponseLang(localStorage.getItem("aiResponseLanguage") || "en");
            try {
                const stored = localStorage.getItem("localizationSettings");
                setLocalizationSettings(stored ? JSON.parse(stored) : { currency: "usd", timezone: "europe/london" });
            } catch (e) { }
            try {
                const stored = localStorage.getItem("notificationSettings");
                setNotificationSettings(stored ? JSON.parse(stored) : { priceAlerts: true, bookingConfirmations: true });
            } catch (e) { }
        };
        loadDefaults();
        alert(t("settings_cancel"));
    };

    const handleCloseModal = () => {
        setNewCard({
            cardType: "",
            lastFour: "",
            formattedNumber: "",
            expiry: ""
        });
        setIsModalOpen(false);
    };

    return (
        <div className="flex h-screen w-full overflow-hidden bg-bg font-sans relative">
            {/* Collapsible Chat Sidebar */}
            <ChatSidebar
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden bg-transparent">
                {/* Toggle open button when sidebar is collapsed */}
                {!isSidebarOpen && (
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="absolute top-[16px] left-[16px] z-30 p-[8px] bg-white border border-slate-200 rounded-[12px] shadow-sm hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-all duration-200 focus:outline-none cursor-pointer"
                        title="Expand Sidebar"
                    >
                        <PanelLeftOpen size={18} />
                    </button>
                )}

                {/* Background Video */}
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute top-0 left-0 w-full h-full object-cover z-0 pointer-events-none"
                >
                    <source src="/videos/chatbot_bg.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>

                {/* Dark Overlay Layer */}
                <div className="absolute top-0 left-0 w-full h-full bg-black/20 z-10 pointer-events-none" />

                {/* Scrollable Container holding the Glass Card */}
                <div className="flex-1 overflow-y-auto px-[16px] py-[32px] md:py-[48px] flex justify-center items-start z-20">
                    <div className="w-full max-w-[850px] mt-[16px] md:mt-[24px]">
                        {/* Settings Main Glass Card */}
                        <div className="bg-gradient-to-b from-white/[0.22] to-white/[0.10] backdrop-blur-xl rounded-[20px] shadow-xl p-[24px] md:p-[40px] border border-white/20">
                            <h1 className="text-[32px] font-bold text-slate-900 mb-[32px]">
                                {t("settings_title")}
                            </h1>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-[24px] md:gap-[32px]">
                                {/* Desktop/Mobile Left Menu (Vertical Tab Navigation) */}
                                <div className="md:col-span-1 flex flex-col gap-[10px]">
                                    {tabs.map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`w-full px-[16px] py-[12px] text-left text-[14px] font-semibold rounded-[12px] transition-all border cursor-pointer focus:outline-none ${activeTab === tab.id
                                                ? "bg-[#F59E0B] text-white border-[#F59E0B] shadow-md shadow-[#F59E0B]/20"
                                                : "bg-white/20 text-slate-800 border-white/10 hover:bg-white/30 backdrop-blur-sm"
                                                }`}
                                        >
                                            {t(`settings_tab_${tab.id}`)}
                                        </button>
                                    ))}
                                </div>

                                {/* Right Content Panel */}
                                <div className="md:col-span-3 min-h-[400px]">
                                    {/* 1. Travel Preferences Tab */}
                                    {activeTab === "travel" && (
                                        <div className="space-y-[32px]">
                                            <div>
                                                <div className="flex items-center gap-[8px] mb-[24px]">
                                                    <Plane className="w-[24px] h-[24px] text-[#F59E0B]" />
                                                    <h2 className="text-[22px] font-extrabold text-slate-900">
                                                        {t("settings_flight_prefs")}
                                                    </h2>
                                                </div>
                                                <div className="space-y-[20px]">
                                                    <div>
                                                        <label className="block text-[14px] font-semibold text-slate-800 mb-[12px]">
                                                            {t("settings_seat_selection")}
                                                        </label>
                                                        <div className="flex gap-[12px] flex-wrap">
                                                            {["window", "aisle", "legroom"].map((seat) => (
                                                                <button
                                                                    key={seat}
                                                                    onClick={() => setFlightPrefs({ ...flightPrefs, seat })}
                                                                    className={`px-[24px] py-[12px] rounded-[12px] text-[14px] font-semibold transition-all border cursor-pointer ${flightPrefs.seat === seat
                                                                        ? "bg-[#F59E0B] text-white border-[#F59E0B] shadow-md"
                                                                        : "bg-white/50 text-slate-800 border-white/20 hover:bg-white/80"
                                                                        }`}
                                                                >
                                                                    {t(`settings_seat_${seat}`)}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="block text-[14px] font-semibold text-slate-800 mb-[12px]">
                                                            {t("settings_meal_prefs")}
                                                        </label>
                                                        <div className="flex gap-[12px] flex-wrap">
                                                            {["standard", "vegan", "glutenfree"].map((meal) => (
                                                                <button
                                                                    key={meal}
                                                                    onClick={() => setFlightPrefs({ ...flightPrefs, meal })}
                                                                    className={`px-[24px] py-[12px] rounded-[12px] text-[14px] font-semibold transition-all border cursor-pointer ${flightPrefs.meal === meal
                                                                        ? "bg-[#F59E0B] text-white border-[#F59E0B] shadow-md"
                                                                        : "bg-white/50 text-slate-800 border-white/20 hover:bg-white/80"
                                                                        }`}
                                                                >
                                                                    {t(`settings_meal_${meal}`)}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <hr className="border-t-2 border-white/20 my-[32px]" />

                                            <div>
                                                <div className="flex items-center gap-[8px] mb-[24px]">
                                                    <Hotel className="w-[24px] h-[24px] text-[#F59E0B]" />
                                                    <h2 className="text-[22px] font-extrabold text-slate-900">
                                                        {t("settings_hotel_prefs")}
                                                    </h2>
                                                </div>
                                                <div className="space-y-[20px]">
                                                    <div>
                                                        <label className="block text-[14px] font-semibold text-slate-800 mb-[12px]">
                                                            {t("settings_room_type")}
                                                        </label>
                                                        <div className="flex gap-[12px] flex-wrap">
                                                            {["single", "double", "suite"].map((room) => (
                                                                <button
                                                                    key={room}
                                                                    onClick={() => setHotelPrefs({ ...hotelPrefs, roomType: [room] })}
                                                                    className={`px-[24px] py-[12px] rounded-[12px] text-[14px] font-semibold transition-all border cursor-pointer ${hotelPrefs.roomType.includes(room)
                                                                        ? "bg-[#F59E0B] text-white border-[#F59E0B] shadow-md"
                                                                        : "bg-white/50 text-slate-800 border-white/20 hover:bg-white/80"
                                                                        }`}
                                                                >
                                                                    {t(`settings_room_${room}`)}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="block text-[14px] font-semibold text-slate-800 mb-[12px]">
                                                            {t("settings_amenities")}
                                                        </label>
                                                        <div className="flex gap-[16px] flex-wrap">
                                                            {[
                                                                { id: "wifi", label: t("settings_amenity_wifi"), icon: Wifi },
                                                                { id: "pool", label: t("settings_amenity_pool"), icon: Waves },
                                                                { id: "fitness", label: t("settings_amenity_fitness"), icon: Dumbbell },
                                                            ].map(({ id, label, icon: Icon }) => (
                                                                <button
                                                                    key={id}
                                                                    onClick={() => {
                                                                        setHotelPrefs({
                                                                            ...hotelPrefs,
                                                                            amenities: hotelPrefs.amenities.includes(id)
                                                                                ? hotelPrefs.amenities.filter((a) => a !== id)
                                                                                : [...hotelPrefs.amenities, id],
                                                                        });
                                                                    }}
                                                                    className={`flex items-center gap-[8px] px-[20px] py-[12px] rounded-[12px] text-[14px] font-semibold transition-all border cursor-pointer ${hotelPrefs.amenities.includes(id)
                                                                        ? "bg-[#F59E0B] text-white border-[#F59E0B] shadow-md"
                                                                        : "bg-white/50 text-slate-800 border-white/20 hover:bg-white/80"
                                                                        }`}
                                                                >
                                                                    <Icon className="w-[20px] h-[20px]" />
                                                                    {label}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* 2. AI & Chatbot Settings Tab */}
                                    {activeTab === "chatbot" && (
                                        <div className="space-y-[24px]">
                                            <div>
                                                <label className="block text-[14px] font-semibold text-slate-800 mb-[12px]">
                                                    {t("settings_ai_response_language")}
                                                </label>
                                                <select
                                                    value={aiResponseLang}
                                                    onChange={(e) => setAiResponseLang(e.target.value)}
                                                    className="w-full rounded-[12px] bg-white/50 backdrop-blur-md px-[16px] py-[12px] border border-white/30 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/40 cursor-pointer text-[14px]"
                                                >
                                                    <option value="en" className="bg-slate-800 text-white">English</option>
                                                    <option value="tr" className="bg-slate-800 text-white">Türkçe</option>
                                                    <option value="de" className="bg-slate-800 text-white">Deutsch</option>
                                                    <option value="ru" className="bg-slate-800 text-white">Русский</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-[14px] font-semibold text-slate-800 mb-[12px]">
                                                    {t("settings_chatbot_tone")}
                                                </label>
                                                <div className="flex gap-[12px] flex-wrap">
                                                    {["professional", "friendly", "concise"].map((tone) => (
                                                        <button
                                                            key={tone}
                                                            onClick={() => setChatbotSettings({ ...chatbotSettings, tone })}
                                                            className={`px-[24px] py-[12px] rounded-[12px] text-[14px] font-semibold transition-all border cursor-pointer ${chatbotSettings.tone === tone
                                                                ? "bg-[#F59E0B] text-white border-[#F59E0B] shadow-md"
                                                                : "bg-white/50 text-slate-800 border-white/20 hover:bg-white/80"
                                                                }`}
                                                        >
                                                            {t(`settings_tone_${tone}`)}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* 3. Localization Settings Tab */}
                                    {activeTab === "localization" && (
                                        <div className="space-y-[24px]">
                                            <div>
                                                <label className="block text-[14px] font-semibold text-slate-800 mb-[12px]">
                                                    {t("settings_preferred_currency")}
                                                </label>
                                                <select
                                                    value={localizationSettings.currency}
                                                    onChange={(e) => setLocalizationSettings({ ...localizationSettings, currency: e.target.value })}
                                                    className="w-full rounded-[12px] bg-white/50 backdrop-blur-md px-[16px] py-[12px] border border-white/30 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/40 cursor-pointer text-[14px]"
                                                >
                                                    <option value="try" className="bg-slate-800 text-white">Turkish Lira (₺)</option>
                                                    <option value="usd" className="bg-slate-800 text-white">US Dollar ($)</option>
                                                    <option value="eur" className="bg-slate-800 text-white">Euro (€)</option>
                                                    <option value="gbp" className="bg-slate-800 text-white">British Pound (£)</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-[14px] font-semibold text-slate-800 mb-[12px]">
                                                    {t("settings_timezone")}
                                                </label>
                                                <select
                                                    value={localizationSettings.timezone}
                                                    onChange={(e) => setLocalizationSettings({ ...localizationSettings, timezone: e.target.value })}
                                                    className="w-full rounded-[12px] bg-white/50 backdrop-blur-md px-[16px] py-[12px] border border-white/30 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/40 cursor-pointer text-[14px]"
                                                >
                                                    <option value="europe/istanbul" className="bg-slate-800 text-white">Europe/Istanbul (GMT+3)</option>
                                                    <option value="europe/london" className="bg-slate-800 text-white">Europe/London (GMT+0)</option>
                                                    <option value="europe/berlin" className="bg-slate-800 text-white">Europe/Berlin (GMT+1)</option>
                                                    <option value="america/new_york" className="bg-slate-800 text-white">America/New_York (GMT-5)</option>
                                                </select>
                                            </div>
                                        </div>
                                    )}

                                    {/* 4. Notifications Tab */}
                                    {activeTab === "notifications" && (
                                        <div className="space-y-[24px]">
                                            <div className="flex items-center justify-between bg-white/20 backdrop-blur-md p-[16px] rounded-[12px] border border-white/20">
                                                <div>
                                                    <h3 className="font-bold text-slate-900 text-[16px]">
                                                        {t("settings_price_alerts")}
                                                    </h3>
                                                    <p className="text-[12px] text-slate-700 mt-[2px]">
                                                        {t("settings_price_alerts_desc")}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => setNotificationSettings({ ...notificationSettings, priceAlerts: !notificationSettings.priceAlerts })}
                                                    className={`relative inline-flex h-[40px] w-[64px] items-center rounded-full transition-all border border-white/20 cursor-pointer ${notificationSettings.priceAlerts ? "bg-[#F59E0B]" : "bg-white/40"
                                                        }`}
                                                >
                                                    <span className={`inline-block h-[32px] w-[32px] transform rounded-full bg-white shadow-lg transition-transform ${notificationSettings.priceAlerts ? "translate-x-[28px]" : "translate-x-[2px]"
                                                        }`} />
                                                </button>
                                            </div>

                                            <div className="flex items-center justify-between bg-white/20 backdrop-blur-md p-[16px] rounded-[12px] border border-white/20">
                                                <div>
                                                    <h3 className="font-bold text-slate-900 text-[16px]">
                                                        {t("settings_booking_confirmations")}
                                                    </h3>
                                                    <p className="text-[12px] text-slate-700 mt-[2px]">
                                                        {t("settings_booking_confirmations_desc")}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => setNotificationSettings({ ...notificationSettings, bookingConfirmations: !notificationSettings.bookingConfirmations })}
                                                    className={`relative inline-flex h-[40px] w-[64px] items-center rounded-full transition-all border border-white/20 cursor-pointer ${notificationSettings.bookingConfirmations ? "bg-[#F59E0B]" : "bg-white/40"
                                                        }`}
                                                >
                                                    <span className={`inline-block h-[32px] w-[32px] transform rounded-full bg-white shadow-lg transition-transform ${notificationSettings.bookingConfirmations ? "translate-x-[28px]" : "translate-x-[2px]"
                                                        }`} />
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* 5. Security & Billing Tab */}
                                    {activeTab === "security" && (
                                        <div className="space-y-[32px]">
                                            <div>
                                                <h2 className="text-[20px] font-bold text-slate-900 mb-[16px]">
                                                    {t("settings_saved_cards")}
                                                </h2>
                                                <div className="space-y-[12px] mb-[16px]">
                                                    {securitySettings.savedCards.map((card) => (
                                                        <div
                                                            key={card.id}
                                                            className="flex items-center justify-between bg-gradient-to-r from-slate-900/90 to-slate-800/90 backdrop-blur-md text-white px-[24px] py-[16px] rounded-[12px] shadow-lg border border-white/10"
                                                        >
                                                            <div>
                                                                <p className="font-semibold text-[15px]">{card.cardType}</p>
                                                                <p className="text-[13px] text-slate-300 mt-[4px]">**** **** **** {card.lastFour}</p>
                                                            </div>
                                                            <button
                                                                onClick={() => setCardToDelete(card.id)}
                                                                className="text-red-400 hover:text-red-300 font-semibold transition-colors text-[14px] cursor-pointer"
                                                            >
                                                                {t("settings_remove_card")}
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                                <button
                                                    onClick={() => setIsModalOpen(true)}
                                                    className="w-full flex items-center justify-center gap-[8px] bg-[#F59E0B] hover:bg-[#F59E0B]/90 text-white font-semibold py-[12px] rounded-[12px] transition-all shadow-md text-[14px] cursor-pointer"
                                                >
                                                    <Plus className="w-[20px] h-[20px]" /> {t("settings_add_card")}
                                                </button>
                                            </div>

                                            <hr className="border-white/10" />

                                            <div>
                                                <h2 className="text-[20px] font-bold text-slate-900 mb-[24px]">
                                                    {t("settings_account_security")}
                                                </h2>
                                                <div className="space-y-[20px]">
                                                    <div>
                                                        <label className="block text-[14px] font-semibold text-slate-800 mb-[12px]">
                                                            {t("settings_change_password")}
                                                        </label>
                                                        <div className="relative">
                                                            <input
                                                                type={showPassword ? "text" : "password"}
                                                                value={newPassword}
                                                                onChange={(e) => setNewPassword(e.target.value)}
                                                                placeholder={t("settings_change_password_placeholder")}
                                                                className="w-full rounded-[12px] bg-white/50 backdrop-blur-md px-[16px] py-[12px] border border-white/30 text-slate-900 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/40 pr-[48px] font-medium text-[14px]"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowPassword(!showPassword)}
                                                                className="absolute right-[16px] top-1/2 -translate-y-1/2 text-slate-700 cursor-pointer"
                                                            >
                                                                {showPassword ? (
                                                                    <Eye className="w-[20px] h-[20px]" />
                                                                ) : (
                                                                    <EyeOff className="w-[20px] h-[20px]" />
                                                                )}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between bg-white/20 backdrop-blur-md p-[16px] rounded-[12px] border border-white/20">
                                                        <div>
                                                            <h3 className="font-bold text-slate-900 text-[16px]">{t("settings_two_factor")}</h3>
                                                            <p className="text-[12px] text-slate-700 mt-[2px]">{t("settings_two_factor_desc")}</p>
                                                        </div>
                                                        <button
                                                            onClick={() => setSecuritySettings({ ...securitySettings, twoFactorEnabled: !securitySettings.twoFactorEnabled })}
                                                            className={`relative inline-flex h-[40px] w-[64px] items-center rounded-full transition-all border border-white/20 cursor-pointer ${securitySettings.twoFactorEnabled ? "bg-[#F59E0B]" : "bg-white/40"
                                                                }`}
                                                        >
                                                            <span className={`inline-block h-[32px] w-[32px] transform rounded-full bg-white shadow-lg transition-transform ${securitySettings.twoFactorEnabled ? "translate-x-[28px]" : "translate-x-[2px]"
                                                                }`} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Save / Cancel actions */}
                            <div className="mt-[48px] flex justify-end gap-[16px]">
                                <button
                                    onClick={handleCancel}
                                    className="px-[32px] py-[12px] rounded-[12px] text-slate-800 font-bold hover:bg-white/20 transition-all border border-transparent hover:border-white/20 backdrop-blur-sm text-[14px] cursor-pointer"
                                >
                                    {t("settings_cancel")}
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="px-[32px] py-[12px] rounded-[12px] bg-[#219ebc] hover:bg-[#1a7e96] text-white font-bold transition-all shadow-md shadow-[#219ebc]/10 text-[14px] cursor-pointer"
                                >
                                    {t("settings_save_changes")}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal: Add card */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-[16px]">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={handleCloseModal}
                    />

                    <div className="relative w-full max-w-[448px] bg-gradient-to-b from-white/[0.22] to-white/[0.10] backdrop-blur-2xl rounded-[20px] p-[24px] md:p-[32px] shadow-2xl border border-white/20 z-10 animate-in fade-in zoom-in-95 duration-200">
                        <h3 className="text-[20px] font-bold text-slate-900 mb-[24px]">
                            {t("settings_add_card_title")}
                        </h3>

                        <div className="space-y-[16px]">
                            <div>
                                <label className="block text-[14px] font-semibold text-slate-800 mb-[8px]">{t("settings_card_number")}</label>
                                <input
                                    type="text"
                                    maxLength="19"
                                    placeholder="4111 2222 3333 4444"
                                    value={newCard.formattedNumber}
                                    onChange={(e) => {
                                        let rawVal = e.target.value.replace(/\D/g, '');
                                        let formattedVal = rawVal.match(/.{1,4}/g)?.join(' ') || '';

                                        let detectedType = "";
                                        if (rawVal.startsWith("5") || rawVal.startsWith("2")) {
                                            detectedType = "Mastercard";
                                        } else if (rawVal.startsWith("3")) {
                                            detectedType = "American Express";
                                        } else if (rawVal.startsWith("4")) {
                                            detectedType = "Visa";
                                        } else if (rawVal.length > 0) {
                                            detectedType = "Credit Card";
                                        }

                                        setNewCard({
                                            cardType: detectedType,
                                            lastFour: rawVal.length >= 4 ? rawVal.slice(-4) : "",
                                            formattedNumber: formattedVal,
                                            expiry: newCard.expiry
                                        });
                                    }}
                                    className="w-full rounded-[12px] bg-white/60 px-[16px] py-[12px] border border-white/30 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/40 font-medium tracking-wider text-[14px]"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-[16px]">
                                <div>
                                    <label className="block text-[14px] font-semibold text-slate-800 mb-[8px]">{t("settings_expiry_date")}</label>
                                    <input
                                        type="text"
                                        maxLength="5"
                                        placeholder="MM/YY"
                                        value={newCard.expiry}
                                        onChange={(e) => {
                                            let rawVal = e.target.value.replace(/\D/g, '');
                                            let formattedExpiry = "";

                                            if (rawVal.length > 0) {
                                                if (rawVal.length === 1 && parseInt(rawVal) > 1) {
                                                    rawVal = "0" + rawVal;
                                                }
                                                if (rawVal.length >= 2) {
                                                    let month = rawVal.slice(0, 2);
                                                    if (parseInt(month) > 12) month = "12";
                                                    if (parseInt(month) === 0) month = "01";
                                                    formattedExpiry = month + (rawVal.length > 2 ? "/" + rawVal.slice(2, 4) : "");
                                                } else {
                                                    formattedExpiry = rawVal;
                                                }
                                            }

                                            setNewCard({
                                                ...newCard,
                                                expiry: formattedExpiry
                                            });
                                        }}
                                        className="w-full text-center rounded-[12px] bg-white/60 px-[16px] py-[12px] border border-white/30 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/40 font-medium tracking-wider text-[14px]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[14px] font-semibold text-slate-800 mb-[8px]">{t("settings_cvc")}</label>
                                    <input
                                        type="password"
                                        placeholder="***"
                                        maxLength="3"
                                        className="w-full text-center rounded-[12px] bg-white/60 px-[16px] py-[12px] border border-white/30 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/40 font-medium text-[14px]"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-[32px] flex justify-end gap-[12px]">
                            <button
                                onClick={handleCloseModal}
                                className="px-[20px] py-[10px] rounded-[12px] text-slate-800 font-bold hover:bg-white/40 transition-all border border-transparent hover:border-white/20 text-[14px]"
                            >
                                {t("settings_cancel")}
                            </button>
                            <button
                                onClick={() => {
                                    if (!newCard.lastFour || newCard.lastFour.length < 4) {
                                        alert("Please enter a valid card number.");
                                        return;
                                    }
                                    setSecuritySettings({
                                        ...securitySettings,
                                        savedCards: [
                                            ...securitySettings.savedCards,
                                            { id: Date.now().toString(), cardType: newCard.cardType || "Credit Card", lastFour: newCard.lastFour }
                                        ]
                                    });
                                    handleCloseModal();
                                }}
                                className="px-[20px] py-[10px] rounded-[12px] bg-[#F59E0B] hover:bg-[#F59E0B]/90 text-white font-bold transition-all shadow-md text-[14px] cursor-pointer"
                            >
                                {t("settings_add_card_btn")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Delete card */}
            {cardToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-[16px]">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setCardToDelete(null)}
                    />

                    <div className="relative w-full max-w-[384px] bg-gradient-to-b from-white/[0.22] to-white/[0.10] backdrop-blur-2xl rounded-[20px] p-[24px] shadow-2xl border border-white/20 z-10 text-center animate-in fade-in zoom-in-95 duration-150">
                        <h3 className="text-[20px] font-bold text-slate-900 mb-[8px]">
                            {t("settings_remove_card_title")}
                        </h3>
                        <p className="text-[14px] text-slate-700 mb-[24px]">
                            {t("settings_remove_card_desc")}
                        </p>

                        <div className="flex gap-[12px] justify-center">
                            <button
                                onClick={() => setCardToDelete(null)}
                                className="flex-1 px-[20px] py-[10px] rounded-[12px] text-slate-800 font-bold hover:bg-white/40 transition-all border border-transparent hover:border-white/20 text-[14px] cursor-pointer"
                            >
                                {t("settings_cancel")}
                            </button>
                            <button
                                onClick={() => {
                                    const updatedCards = securitySettings.savedCards.filter(c => c.id !== cardToDelete);
                                    setSecuritySettings({
                                        ...securitySettings,
                                        savedCards: updatedCards
                                    });
                                    setCardToDelete(null);
                                }}
                                className="flex-1 px-[20px] py-[10px] rounded-[12px] bg-[#EF4444] hover:bg-[#EF4444]/90 text-white font-bold transition-all shadow-md text-[14px] cursor-pointer"
                            >
                                {t("settings_delete_btn")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}