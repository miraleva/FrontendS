import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff, PanelLeftOpen } from "lucide-react";
import ChatSidebar from "../components/ChatSidebar";
import api from "../services/api";
import { useTheme } from "../components/ThemeContext";

export default function Settings() {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState("notifications");

    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.load();
            videoRef.current.play().catch(err => console.log("Video oynatılamadı:", err));
        }
    }, [theme]);

    const [notificationSettings, setNotificationSettings] = useState(() => {
        try {
            const stored = localStorage.getItem("notificationSettings");
            return stored ? JSON.parse(stored) : { bookingConfirmations: true };
        } catch (e) {
            return { bookingConfirmations: true };
        }
    });

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const tabs = [
        { id: "notifications" },
        { id: "security" },
    ];

    const handleSave = async () => {
        localStorage.setItem("notificationSettings", JSON.stringify(notificationSettings));

        if (newPassword.trim() !== "") {
            if (newPassword.length < 6) {
                alert(t("Şifre en az 6 karakter olmalıdır."));
                return;
            }

            if (newPassword !== confirmPassword) {
                alert(t("Girdiğiniz şifreler eşleşmiyor. Lütfen kontrol edin."));
                return;
            }

            try {
                await api.post("/api/profile/change-password", {
                    password: newPassword,
                });

                alert(t("Ayarlar ve yeni şifreniz başarıyla kaydedildi!"));
                setNewPassword("");
                setConfirmPassword("");
            } catch (error) {
                console.error("Şifre değiştirme hatası:", error);
                const errorMessage = error.response?.data?.message || "";
                alert(`${t("Şifre güncellenirken bir hata oluştu")}: ${errorMessage}`);
            }
        } else {
            alert(t("settings_save_changes"));
        }
    };

    const handleCancel = () => {
        const loadDefaults = () => {
            try {
                const stored = localStorage.getItem("notificationSettings");
                setNotificationSettings(stored ? JSON.parse(stored) : { bookingConfirmations: true });
            } catch (e) { }
        };
        loadDefaults();
        setNewPassword("");
        setConfirmPassword("");
        alert(t("settings_cancel"));
    };



    return (
        <div className="flex h-screen w-full overflow-hidden bg-transparent font-sans relative">
            {/* Katman 1 (z-0): Background Video */}
            <video
                ref={videoRef}
                src={theme === 'dark' ? "/videos/darkmode_bg.mp4" : "/videos/chatbot_bg.mp4"}
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                className="fixed inset-0 w-full h-full object-cover z-0 pointer-events-none"
            />

            {/* Katman 2 (z-10): Overlay Mask (No Blur) */}
            <div className="fixed inset-0 z-10 pointer-events-none bg-white/20 dark:bg-slate-950/60" />

            {/* Katman 3 (z-30): Sidebar */}
            <ChatSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            {/* Katman 3 (z-20): Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden bg-transparent z-20">
                {/* Toggle open button when sidebar is collapsed */}
                {!isSidebarOpen && (
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="fixed top-4 left-4 z-40 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-md text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200 transition-all cursor-pointer"
                        title="Open Sidebar"
                    >
                        <PanelLeftOpen size={18} />
                    </button>
                )}

                {/* Scrollable Container holding the Form Card */}
                <div className="flex-1 overflow-y-auto px-[16px] py-[32px] md:py-[48px] flex justify-center items-start z-20">
                    <div className="w-full max-w-[850px] mt-[16px] md:mt-[24px]">
                        {/* Settings Main Form Card */}
                        <div className="bg-white/95 dark:bg-slate-900/95 rounded-[20px] shadow-xl p-[24px] md:p-[40px] border border-slate-200 dark:border-slate-800">
                            <h1 className="text-[32px] font-bold text-slate-900 dark:text-white mb-[32px]">
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
                                                : "bg-slate-100 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-800/90"
                                                }`}
                                        >
                                            {t(`settings_tab_${tab.id}`)}
                                        </button>
                                    ))}
                                </div>

                                {/* Right Content Panel */}
                                <div className="md:col-span-3 min-h-[400px]">
                                    {/* 2. Notifications Tab */}
                                    {activeTab === "notifications" && (
                                        <div className="space-y-[24px]">
                                            <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800/50 p-[16px] rounded-[12px] border border-slate-200 dark:border-slate-700/60">
                                                <div>
                                                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-[16px]">
                                                        {t("settings_booking_confirmations")}
                                                    </h3>
                                                    <p className="text-[12px] text-slate-700 dark:text-slate-300 mt-[2px]">
                                                        {t("settings_booking_confirmations_desc")}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => setNotificationSettings({ ...notificationSettings, bookingConfirmations: !notificationSettings.bookingConfirmations })}
                                                    className={`relative inline-flex h-[40px] w-[64px] items-center rounded-full transition-all border border-slate-300 dark:border-slate-700 cursor-pointer ${notificationSettings.bookingConfirmations ? "bg-[#F59E0B]" : "bg-slate-200 dark:bg-slate-700"
                                                        }`}
                                                >
                                                    <span className={`inline-block h-[32px] w-[32px] transform rounded-full bg-white shadow-lg transition-transform ${notificationSettings.bookingConfirmations ? "translate-x-[28px]" : "translate-x-[2px]"
                                                        }`} />
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* 3. Güvenlik Tab */}
                                    {activeTab === "security" && (
                                        <div className="space-y-[24px]">
                                            <h2 className="text-[20px] font-bold text-slate-900 dark:text-slate-100 mb-[8px]">
                                                {t("settings_account_security")}
                                            </h2>
                                            <div className="space-y-[20px]">
                                                <div>
                                                    <label className="block text-[14px] font-semibold text-slate-800 dark:text-slate-200 mb-[12px]">
                                                        {t("settings_change_password")}
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type={showPassword ? "text" : "password"}
                                                            value={newPassword}
                                                            onChange={(e) => setNewPassword(e.target.value)}
                                                            placeholder={t("settings_change_password_placeholder")}
                                                            className="w-full rounded-[12px] bg-slate-100 dark:bg-slate-800 px-[16px] py-[12px] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-500 pr-[48px] font-medium text-[14px]"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            className="absolute right-[16px] top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer"
                                                        >
                                                            {showPassword ? (
                                                                <Eye className="w-[20px] h-[20px]" />
                                                            ) : (
                                                                <EyeOff className="w-[20px] h-[20px]" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-[14px] font-semibold text-slate-800 dark:text-slate-200 mb-[12px]">
                                                        {t("settings_confirm_new_password")}
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type={showPassword ? "text" : "password"}
                                                            value={confirmPassword}
                                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                                            placeholder={t("settings_confirm_new_password_placeholder")}
                                                            className="w-full rounded-[12px] bg-slate-100 dark:bg-slate-800 px-[16px] py-[12px] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-500 pr-[48px] font-medium text-[14px]"
                                                        />
                                                    </div>
                                                    {newPassword && confirmPassword && newPassword !== confirmPassword && (
                                                        <p className="text-red-600 dark:text-red-400 text-[12px] font-semibold mt-[6px]">
                                                            {t("settings_password_mismatch")}
                                                        </p>
                                                    )}
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
                                    className="px-[32px] py-[12px] rounded-[12px] text-slate-800 dark:text-slate-200 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-slate-300 dark:border-slate-700 text-[14px] cursor-pointer"
                                >
                                    {t("settings_cancel")}
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="px-[32px] py-[12px] rounded-[12px] bg-[#0B5FFF] hover:bg-[#0B5FFF]/90 text-white font-bold transition-all shadow-md shadow-[#0B5FFF]/10 text-[14px] cursor-pointer"
                                >
                                    {t("settings_save_changes")}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


        </div>
    );
}