import { useState } from "react";
import { ChevronDown, Wifi, Dumbbell, Waves, Lock, Plus, Eye, EyeOff } from "lucide-react";

export default function Settings() {
    const [activeTab, setActiveTab] = useState("travel");
    const [flightPrefs, setFlightPrefs] = useState({
        seat: "window",
        meal: "standard",
    });
    const [hotelPrefs, setHotelPrefs] = useState({
        roomType: ["double"],
        amenities: ["wifi", "pool"],
    });
    const [chatbotSettings, setChatbotSettings] = useState({
        language: "turkish",
        tone: "friendly",
        tts: true,
    });
    const [localizationSettings, setLocalizationSettings] = useState({
        currency: "try",
        timezone: "europe/istanbul",
    });
    const [notificationSettings, setNotificationSettings] = useState({
        priceAlerts: true,
        bookingConfirmations: true,
    });
    const [securitySettings, setSecuritySettings] = useState({
        savedCards: [
            { id: "1", lastFour: "4321", cardType: "Visa" },
            { id: "2", lastFour: "8765", cardType: "Mastercard" },
        ],
        twoFactorEnabled: false,
    });
    const [showPassword, setShowPassword] = useState(false);

    const tabs = [
        { id: "travel", label: "Travel Preferences", labelTr: "Seyahat Tercihleri" },
        { id: "chatbot", label: "AI & Chatbot", labelTr: "Yapay Zekâ Ayarları" },
        { id: "localization", label: "Localization", labelTr: "Bölge ve Para Birimi" },
        { id: "notifications", label: "Notifications", labelTr: "Bildirimler" },
        { id: "security", label: "Security & Billing", labelTr: "Güvenlik ve Ödeme" },
    ];

    const handleSave = () => {
        console.log("Saving settings...");
    };

    return (
        <div className="relative min-h-screen overflow-hidden flex items-center justify-center p-4 md:p-6">

            {/* 1. ARKA PLAN VİDEOSU */}
            <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute top-0 left-0 w-full h-full object-cover z-0"
            >
                <source src="/videos/chatbot_bg.mp4" type="video/mp4" />
                Your browser does not support the video tag.
            </video>

            {/* Yumuşak bir Karartma/Aydınlatma Katmanı (Videonun form elementlerini boğmaması için) */}
            <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px] z-10" />

            <div className="w-full max-w-6xl z-20 my-8">
                {/* 2. ANA AYARLAR KARTI (Görseldeki gibi blurlu buzlu cam efekti) */}
                <div className="bg-white/40 backdrop-blur-xl rounded-3xl shadow-2xl p-6 md:p-10 border border-white/30">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">Settings</h1>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-8">
                        {/* Masaüstü Sol Menü Butonları */}
                        <div className="hidden md:flex flex-col space-y-2">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-4 py-3 text-left rounded-xl transition-all font-semibold text-sm ${activeTab === tab.id
                                        ? "bg-[#f07c24] text-white shadow-md shadow-orange-500/20"
                                        : "text-gray-800 hover:bg-white/30 backdrop-blur-sm"
                                        }`}
                                    Mention
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Mobil Üst Menü Butonları */}
                        <div className="md:hidden flex overflow-x-auto gap-2 pb-2 -mx-6 px-6 mb-6">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-4 py-2 text-sm font-semibold rounded-full whitespace-nowrap transition-all ${activeTab === tab.id
                                        ? "bg-[#f07c24] text-white shadow-md"
                                        : "bg-white/30 text-gray-800 backdrop-blur-sm"
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Sağ İçerik Alanı */}
                        <div className="md:col-span-4">
                            {/* Travel Preferences */}
                            {activeTab === "travel" && (
                                <div className="space-y-8">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 mb-6">Flight Preferences</h2>
                                        <div className="space-y-5">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-800 mb-3">
                                                    Seat Selection
                                                </label>
                                                <div className="flex gap-3 flex-wrap">
                                                    {["window", "aisle", "legroom"].map((seat) => (
                                                        <button
                                                            key={seat}
                                                            onClick={() => setFlightPrefs({ ...flightPrefs, seat })}
                                                            className={`px-6 py-3 rounded-full font-semibold transition-all backdrop-blur-md ${flightPrefs.seat === seat
                                                                ? "bg-[#f07c24] text-white shadow-md"
                                                                : "bg-white/50 text-gray-800 hover:bg-white/80 border border-white/20"
                                                                }`}
                                                        >
                                                            {seat === "window" ? "Window" : seat === "aisle" ? "Aisle" : "Extra Legroom"}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-800 mb-3">
                                                    Meal Preferences
                                                </label>
                                                <div className="flex gap-3 flex-wrap">
                                                    {["standard", "vegan", "glutenfree"].map((meal) => (
                                                        <button
                                                            key={meal}
                                                            onClick={() => setFlightPrefs({ ...flightPrefs, meal })}
                                                            className={`px-6 py-3 rounded-full font-semibold transition-all backdrop-blur-md ${flightPrefs.meal === meal
                                                                ? "bg-[#f07c24] text-white shadow-md"
                                                                : "bg-white/50 text-gray-800 hover:bg-white/80 border border-white/20"
                                                                }`}
                                                        >
                                                            {meal === "standard" ? "Standard" : meal === "vegan" ? "Vegan" : "Gluten-Free"}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <hr className="border-white/30" />

                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 mb-6">Hotel Preferences</h2>
                                        <div className="space-y-5">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-800 mb-3">
                                                    Room Type
                                                </label>
                                                <div className="flex gap-3 flex-wrap">
                                                    {["single", "double", "suite"].map((room) => (
                                                        <button
                                                            key={room}
                                                            onClick={() => setHotelPrefs({ ...hotelPrefs, roomType: [room] })}
                                                            className={`px-6 py-3 rounded-full font-semibold transition-all backdrop-blur-md ${hotelPrefs.roomType.includes(room)
                                                                ? "bg-[#f07c24] text-white shadow-md"
                                                                : "bg-white/50 text-gray-800 hover:bg-white/80 border border-white/20"
                                                                }`}
                                                        >
                                                            {room === "single" ? "Single" : room === "double" ? "Double" : "Suite"}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-800 mb-3">
                                                    Amenities
                                                </label>
                                                <div className="flex gap-4 flex-wrap">
                                                    {[
                                                        { id: "wifi", label: "Free Wi-Fi", icon: Wifi },
                                                        { id: "pool", label: "Pool", icon: Waves },
                                                        { id: "fitness", label: "Fitness Center", icon: Dumbbell },
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
                                                            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all backdrop-blur-md ${hotelPrefs.amenities.includes(id)
                                                                ? "bg-[#f07c24] text-white shadow-md"
                                                                : "bg-white/50 text-gray-800 hover:bg-white/80 border border-white/20"
                                                                }`}
                                                        >
                                                            <Icon className="w-5 h-5" />
                                                            {label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* AI & Chatbot Settings */}
                            {activeTab === "chatbot" && (
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-800 mb-3">
                                            Assistant Language
                                        </label>
                                        <select
                                            value={chatbotSettings.language}
                                            onChange={(e) => setChatbotSettings({ ...chatbotSettings, language: e.target.value })}
                                            className="w-full rounded-full bg-white/50 backdrop-blur-md px-5 py-3 border border-white/30 text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-orange-400 appearance-none cursor-pointer"
                                        >
                                            <option value="turkish">Turkish</option>
                                            <option value="english">English</option>
                                            <option value="german">German</option>
                                            <option value="french">French</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-800 mb-3">
                                            Chatbot Tone
                                        </label>
                                        <div className="flex gap-3 flex-wrap">
                                            {["professional", "friendly", "concise"].map((tone) => (
                                                <button
                                                    key={tone}
                                                    onClick={() => setChatbotSettings({ ...chatbotSettings, tone })}
                                                    className={`px-6 py-3 rounded-full font-semibold transition-all backdrop-blur-md ${chatbotSettings.tone === tone
                                                        ? "bg-[#f07c24] text-white shadow-md"
                                                        : "bg-white/50 text-gray-800 hover:bg-white/80 border border-white/20"
                                                        }`}
                                                >
                                                    {tone === "professional" ? "Professional" : tone === "friendly" ? "Friendly" : "Concise"}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-800 mb-4">
                                            Text-to-Speech
                                        </label>
                                        <button
                                            onClick={() => setChatbotSettings({ ...chatbotSettings, tts: !chatbotSettings.tts })}
                                            className={`relative inline-flex h-10 w-16 items-center rounded-full transition-all border border-white/20 backdrop-blur-md ${chatbotSettings.tts ? "bg-[#f07c24]" : "bg-white/40"
                                                }`}
                                        >
                                            <span
                                                className={`inline-block h-8 w-8 transform rounded-full bg-white shadow-lg transition-transform ${chatbotSettings.tts ? "translate-x-7" : "translate-x-1"
                                                    }`}
                                            />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Localization & Currency */}
                            {activeTab === "localization" && (
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-800 mb-3">
                                            Preferred Currency
                                        </label>
                                        <select
                                            value={localizationSettings.currency}
                                            onChange={(e) => setLocalizationSettings({ ...localizationSettings, currency: e.target.value })}
                                            className="w-full rounded-full bg-white/50 backdrop-blur-md px-5 py-3 border border-white/30 text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-orange-400 cursor-pointer"
                                        >
                                            <option value="try">Turkish Lira (₺)</option>
                                            <option value="usd">US Dollar ($)</option>
                                            <option value="eur">Euro (€)</option>
                                            <option value="gbp">British Pound (£)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-800 mb-3">
                                            Time Zone & Region
                                        </label>
                                        <select
                                            value={localizationSettings.timezone}
                                            onChange={(e) => setLocalizationSettings({ ...localizationSettings, timezone: e.target.value })}
                                            className="w-full rounded-full bg-white/50 backdrop-blur-md px-5 py-3 border border-white/30 text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-orange-400 cursor-pointer"
                                        >
                                            <option value="europe/istanbul">Europe/Istanbul (GMT+3)</option>
                                            <option value="europe/london">Europe/London (GMT+0)</option>
                                            <option value="europe/berlin">Europe/Berlin (GMT+1)</option>
                                            <option value="america/new_york">America/New_York (GMT-5)</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            {/* Notifications */}
                            {activeTab === "notifications" && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between bg-white/20 backdrop-blur-md p-4 rounded-2xl border border-white/20">
                                        <div>
                                            <h3 className="font-bold text-gray-900">Smart Price Alerts</h3>
                                            <p className="text-sm text-gray-700 mt-0.5">Receive notifications when watched prices drop</p>
                                        </div>
                                        <button
                                            onClick={() => setNotificationSettings({ ...notificationSettings, priceAlerts: !notificationSettings.priceAlerts })}
                                            className={`relative inline-flex h-10 w-16 items-center rounded-full transition-all border border-white/20 ${notificationSettings.priceAlerts ? "bg-[#f07c24]" : "bg-white/40"
                                                }`}
                                        >
                                            <span className={`inline-block h-8 w-8 transform rounded-full bg-white shadow-lg transition-transform ${notificationSettings.priceAlerts ? "translate-x-7" : "translate-x-1"}`} />
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between bg-white/20 backdrop-blur-md p-4 rounded-2xl border border-white/20">
                                        <div>
                                            <h3 className="font-bold text-gray-900">Booking Confirmations</h3>
                                            <p className="text-sm text-gray-700 mt-0.5">Email and SMS alerts for your bookings</p>
                                        </div>
                                        <button
                                            onClick={() => setNotificationSettings({ ...notificationSettings, bookingConfirmations: !notificationSettings.bookingConfirmations })}
                                            className={`relative inline-flex h-10 w-16 items-center rounded-full transition-all border border-white/20 ${notificationSettings.bookingConfirmations ? "bg-[#f07c24]" : "bg-white/40"
                                                }`}
                                        >
                                            <span className={`inline-block h-8 w-8 transform rounded-full bg-white shadow-lg transition-transform ${notificationSettings.bookingConfirmations ? "translate-x-7" : "translate-x-1"}`} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Security & Billing */}
                            {activeTab === "security" && (
                                <div className="space-y-8">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 mb-4">Saved Payment Methods</h2>
                                        <div className="space-y-3 mb-4">
                                            {securitySettings.savedCards.map((card) => (
                                                <div
                                                    key={card.id}
                                                    className="flex items-center justify-between bg-gradient-to-r from-gray-900/90 to-gray-800/90 backdrop-blur-md text-white px-6 py-4 rounded-xl shadow-lg border border-white/10"
                                                >
                                                    <div>
                                                        <p className="font-semibold">{card.cardType}</p>
                                                        <p className="text-sm text-gray-300 mt-1">**** **** **** {card.lastFour}</p>
                                                    </div>
                                                    <button className="text-orange-400 hover:text-orange-300 font-semibold">Remove</button>
                                                </div>
                                            ))}
                                        </div>
                                        <button className="w-full flex items-center justify-center gap-2 bg-[#f07c24] hover:bg-[#e06d19] text-white font-semibold py-3 rounded-full transition-all shadow-md">
                                            <Plus className="w-5 h-5" /> Add New Card
                                        </button>
                                    </div>

                                    <hr className="border-white/30" />

                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 mb-6">Account Security</h2>
                                        <div className="space-y-5">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-800 mb-3">Change Password</label>
                                                <div className="relative">
                                                    <input
                                                        type={showPassword ? "text" : "password"}
                                                        placeholder="Enter new password"
                                                        className="w-full rounded-full bg-white/50 backdrop-blur-md px-5 py-3 border border-white/30 text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-400 pr-12 font-medium"
                                                    />
                                                    <button
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-700"
                                                    >
                                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between bg-white/20 backdrop-blur-md p-4 rounded-2xl border border-white/20">
                                                <div>
                                                    <h3 className="font-bold text-gray-900">Two-Factor Authentication (2FA)</h3>
                                                    <p className="text-sm text-gray-700 mt-0.5">Secure your account with an additional verification step</p>
                                                </div>
                                                <button
                                                    onClick={() => setSecuritySettings({ ...securitySettings, twoFactorEnabled: !securitySettings.twoFactorEnabled })}
                                                    className={`relative inline-flex h-10 w-16 items-center rounded-full transition-all border border-white/20 ${securitySettings.twoFactorEnabled ? "bg-[#f07c24]" : "bg-white/40"
                                                        }`}
                                                >
                                                    <span className={`inline-block h-8 w-8 transform rounded-full bg-white shadow-lg transition-transform ${securitySettings.twoFactorEnabled ? "translate-x-7" : "translate-x-1"}`} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Alt Kaydet/İptal Butonları */}
                    <div className="mt-12 flex justify-end gap-4">
                        <button className="px-8 py-3 rounded-xl text-gray-800 font-bold hover:bg-white/20 transition-all border border-transparent hover:border-white/20 backdrop-blur-sm">
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-8 py-3 rounded-xl bg-[#f07c24] hover:bg-[#e06d19] text-white font-bold transition-all shadow-md shadow-orange-500/10"
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}