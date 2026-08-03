import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import PhoneInput from "react-phone-number-input";
import trPhoneLabels from "react-phone-number-input/locale/tr";
import enPhoneLabels from "react-phone-number-input/locale/en";
import dePhoneLabels from "react-phone-number-input/locale/de";
import ruPhoneLabels from "react-phone-number-input/locale/ru";
import "react-phone-number-input/style.css";
import { getCountryCallingCode, validatePhoneNumberLength } from "libphonenumber-js";
import {
    Bell,
    Check,
    Eye,
    EyeOff,
    Monitor,
    Moon,
    PanelLeftOpen,
    Save,
    ShieldCheck,
    Sun,
    UserRound,
} from "lucide-react";
import ChatSidebar from "../components/ChatSidebar";
import api from "../services/api";
import { useTheme } from "../components/ThemeContext";

const DEFAULT_SETTINGS = {
    general: {
        fullName: "",
        email: "",
        phone: "",
        phoneCountry: "TR",
        defaultTraveler: "self",
    },
    notifications: {
        bookingConfirmations: true,
        bookingChanges: true,
        flightReminder: true,
        checkInReminder: true,
        hotelReminder: true,
        priceChanges: false,
        campaigns: false,
        inApp: true,
        email: true,
    },
    security: {
        twoFactorEnabled: false,
    },
    appearance: {
        theme: "system",
        fontSize: "medium",
        reduceMotion: false,
        highContrast: false,
    },
};

const STORAGE_KEY = "userSettings";

const PHONE_UI_TRANSLATIONS = {
    tr: {
        phone: "Telefon",
        placeholder: "Telefon numarası",
        help: "Ülke kodunu seçin. Numara uzunluğu seçilen ülkeye göre sınırlandırılır.",
        tooLong: "Bu ülke için izin verilen maksimum telefon uzunluğuna ulaştınız.",
        invalid: "Seçtiğiniz ülkeye uygun, geçerli uzunlukta bir telefon numarası giriniz.",
    },
    en: {
        phone: "Phone",
        placeholder: "Phone number",
        help: "Select a country code. The phone number length is limited according to the selected country.",
        tooLong: "You have reached the maximum phone number length allowed for this country.",
        invalid: "Enter a phone number with a valid length for the selected country.",
    },
    de: {
        phone: "Telefon",
        placeholder: "Telefonnummer",
        help: "Wählen Sie eine Landesvorwahl. Die Länge der Telefonnummer wird entsprechend dem ausgewählten Land begrenzt.",
        tooLong: "Die maximal zulässige Telefonnummernlänge für dieses Land wurde erreicht.",
        invalid: "Geben Sie eine Telefonnummer mit gültiger Länge für das ausgewählte Land ein.",
    },
    ru: {
        phone: "Телефон",
        placeholder: "Номер телефона",
        help: "Выберите код страны. Длина номера ограничивается в соответствии с выбранной страной.",
        tooLong: "Достигнута максимальная длина номера телефона для выбранной страны.",
        invalid: "Введите номер телефона допустимой длины для выбранной страны.",
    },
};

const PHONE_LABELS_BY_LANGUAGE = {
    tr: trPhoneLabels,
    en: enPhoneLabels,
    de: dePhoneLabels,
    ru: ruPhoneLabels,
};


const PHONE_NATIONAL_MAX_LENGTH = {
    TR: 10,
    US: 10,
    CA: 10,
    GB: 10,
    DE: 11,
    FR: 9,
    IT: 10,
    ES: 9,
    NL: 9,
    BE: 9,
    CH: 9,
    AT: 13,
    RU: 10,
    UA: 9,
    AZ: 9,
    AE: 9,
    SA: 9,
    QA: 8,
    KW: 8,
    AU: 9,
    NZ: 10,
    JP: 10,
    KR: 10,
    CN: 11,
    IN: 10,
};

function getNationalDigitCount(value, country) {
    if (!value || !country) return 0;

    const allDigits = value.replace(/\D/g, "");
    const callingCode = getCountryCallingCode(country);

    return allDigits.startsWith(callingCode)
        ? allDigits.slice(callingCode.length).length
        : allDigits.length;
}

function isPhoneWithinCountryLimit(value, country) {
    if (!value) return true;

    const maxLength = PHONE_NATIONAL_MAX_LENGTH[country] ?? 15;
    return getNationalDigitCount(value, country) <= maxLength;
}

function limitPhoneNumberByCountry(value, country) {
    if (!value || !country) return "";

    const callingCode = getCountryCallingCode(country);
    const maxLength = PHONE_NATIONAL_MAX_LENGTH[country] ?? 15;
    const allDigits = value.replace(/\D/g, "");

    let nationalDigits = allDigits;

    if (allDigits.startsWith(callingCode)) {
        nationalDigits = allDigits.slice(callingCode.length);
    }

    const limitedNationalDigits = nationalDigits.slice(0, maxLength);

    if (!limitedNationalDigits) return "";

    return `+${callingCode}${limitedNationalDigits}`;
}

function readStoredSettings() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return DEFAULT_SETTINGS;

        const parsed = JSON.parse(stored);
        const storedGeneral = { ...DEFAULT_SETTINGS.general, ...parsed.general };
        const storedCountry = storedGeneral.phoneCountry || "TR";

        if (storedGeneral.phone) {
            storedGeneral.phone = limitPhoneNumberByCountry(
                storedGeneral.phone,
                storedCountry
            );
        }

        return {
            general: storedGeneral,
            notifications: { ...DEFAULT_SETTINGS.notifications, ...parsed.notifications },
            security: { ...DEFAULT_SETTINGS.security, ...parsed.security },
            appearance: { ...DEFAULT_SETTINGS.appearance, ...parsed.appearance },
        };
    } catch (error) {
        console.error("Ayarlar okunamadı:", error);
        return DEFAULT_SETTINGS;
    }
}

function Toggle({ checked, onChange, label }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={label}
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full border transition-all ${checked
                ? "border-amber-500 bg-amber-500"
                : "border-slate-300 bg-slate-200 dark:border-slate-600 dark:bg-slate-700"
                }`}
        >
            <span
                className={`inline-block h-6 w-6 rounded-full bg-white shadow-md transition-transform ${checked ? "translate-x-7" : "translate-x-1"
                    }`}
            />
        </button>
    );
}

function SettingRow({ title, description, children }) {
    return (
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-slate-700 dark:bg-slate-800/60 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{title}</h3>
                {description && (
                    <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-400">
                        {description}
                    </p>
                )}
            </div>
            <div className="shrink-0">{children}</div>
        </div>
    );
}

function SectionHeader({ title, description }) {
    return (
        <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
            {description && (
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{description}</p>
            )}
        </div>
    );
}

const inputClass =
    "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100";

export default function Settings() {
    const { t, i18n } = useTranslation();
    const themeContext = useTheme();
    const theme = themeContext?.theme || "light";

    const [isSidebarOpen, setIsSidebarOpen] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 768);
    const [activeTab, setActiveTab] = useState("general");
    const [settings, setSettings] = useState(readStoredSettings);
    const [savedSettings, setSavedSettings] = useState(readStoredSettings);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState("");
    const [saveMessageType, setSaveMessageType] = useState("success");
    const [showSessions, setShowSessions] = useState(false);

    useEffect(() => {
        async function fetchProfile() {
            try {
                const response = await api.get("/api/profile");
                if (response.data) {
                    const is2fa = response.data.isTwoFactorEnabled === true;
                    updateSection("security", "twoFactorEnabled", is2fa);
                    setSavedSettings(prev => ({
                        ...prev,
                        security: {
                            ...prev.security,
                            twoFactorEnabled: is2fa
                        }
                    }));
                }
            } catch (err) {
                console.error("Failed to fetch profile in Settings:", err);
            }
        }
        fetchProfile();
    }, []);

    const videoRef = useRef(null);

    const tr = (key, fallback) => t(key, { defaultValue: fallback });

    const currentLanguage = (i18n.resolvedLanguage || i18n.language || "tr")
        .split("-")[0];

    const phoneTexts =
        PHONE_UI_TRANSLATIONS[currentLanguage] || PHONE_UI_TRANSLATIONS.en;

    const phoneLabels =
        PHONE_LABELS_BY_LANGUAGE[currentLanguage] || enPhoneLabels;

    const tabs = useMemo(
        () => [
            { id: "general", label: tr("settings_tab_general", "Genel"), icon: UserRound },
            { id: "notifications", label: tr("settings_tab_notifications", "Bildirimler"), icon: Bell },
            { id: "security", label: tr("settings_tab_security", "Güvenlik"), icon: ShieldCheck },
            { id: "appearance", label: tr("settings_tab_appearance", "Görünüm"), icon: Monitor },
        ],
        [t]
    );

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.load();
            videoRef.current.play().catch(() => { });
        }
    }, [theme]);

    useEffect(() => {
        const root = document.documentElement;
        const fontSizes = { small: "14px", medium: "16px", large: "18px" };

        root.style.fontSize = fontSizes[settings.appearance.fontSize] || "16px";
        root.classList.toggle("reduce-motion", settings.appearance.reduceMotion);
        root.classList.toggle("high-contrast", settings.appearance.highContrast);

        return () => {
            root.style.fontSize = "";
        };
    }, [
        settings.appearance.fontSize,
        settings.appearance.reduceMotion,
        settings.appearance.highContrast,
    ]);

    const updateSection = (section, field, value) => {
        setSettings((current) => ({
            ...current,
            [section]: {
                ...current[section],
                [field]: value,
            },
        }));
    };

    const showFeedback = (message, type = "success", duration = 3000) => {
        setSaveMessageType(type);
        setSaveMessage(message);
        window.clearTimeout(showFeedback.timeoutId);
        showFeedback.timeoutId = window.setTimeout(() => {
            setSaveMessage("");
        }, duration);
    };

    const applyTheme = (nextTheme) => {
        updateSection("appearance", "theme", nextTheme);

        if (typeof themeContext?.setTheme === "function") {
            themeContext.setTheme(nextTheme);
            return;
        }

        if (typeof themeContext?.changeTheme === "function") {
            themeContext.changeTheme(nextTheme);
            return;
        }

        if (nextTheme === "system") {
            const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            document.documentElement.classList.toggle("dark", systemDark);
        } else {
            document.documentElement.classList.toggle("dark", nextTheme === "dark");
        }
    };

    const handleSave = async (event) => {
        event?.preventDefault();
        event?.stopPropagation();

        if (isSaving) return;

        if (settings.general.phone) {
            const phoneLengthError = validatePhoneNumberLength(
                settings.general.phone,
                settings.general.phoneCountry || "TR"
            );

            if (phoneLengthError) {
                showFeedback(
                    tr(
                        "settings_invalid_phone",
                        phoneTexts.invalid
                    ),
                    "error",
                    4500
                );
                return;
            }
        }

        if (newPassword && newPassword.length < 6) {
            showFeedback(
                tr("settings_password_min", "Şifre en az 6 karakter olmalıdır."),
                "error",
                4500
            );
            return;
        }

        if (newPassword !== confirmPassword) {
            showFeedback(
                tr("settings_password_mismatch", "Girdiğiniz şifreler eşleşmiyor."),
                "error",
                4500
            );
            return;
        }

        setIsSaving(true);
        showFeedback(tr("settings_saving", "Kaydediliyor..."), "info", 15000);

        try {
            if (newPassword.trim()) {
                await api.post("/api/profile/change-password", { password: newPassword });
            }

            if (settings.security.twoFactorEnabled !== savedSettings.security.twoFactorEnabled) {
                await api.put("/api/profile/two-factor", { enabled: settings.security.twoFactorEnabled });
            }

            const settingsToSave = JSON.parse(JSON.stringify(settings));
            localStorage.setItem(STORAGE_KEY, JSON.stringify(settingsToSave));
            localStorage.setItem(
                "notificationSettings",
                JSON.stringify(settingsToSave.notifications)
            );

            setSavedSettings(settingsToSave);
            setNewPassword("");
            setConfirmPassword("");
            showFeedback(
                tr("settings_saved_success", "Değişiklikler başarıyla kaydedildi."),
                "success",
                3500
            );
        } catch (error) {
            console.error("Ayarlar kaydedilemedi:", error);
            const message =
                error.response?.data?.message ||
                tr("settings_save_error", "Ayarlar kaydedilirken bir hata oluştu.");
            showFeedback(message, "error", 5000);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = (event) => {
        event?.preventDefault();
        event?.stopPropagation();

        const restoredSettings = JSON.parse(JSON.stringify(savedSettings));
        setSettings(restoredSettings);
        setNewPassword("");
        setConfirmPassword("");
        applyTheme(restoredSettings.appearance.theme);
        showFeedback(
            tr("settings_cancelled", "Kaydedilmemiş değişiklikler geri alındı."),
            "info",
            3000
        );
    };

    const handleTwoFactor = () => {
        const nextValue = !settings.security.twoFactorEnabled;
        updateSection("security", "twoFactorEnabled", nextValue);
        showFeedback(
            nextValue
                ? "İki adımlı doğrulama etkinleştirildi. Kaydetmeyi unutmayın."
                : "İki adımlı doğrulama kapatıldı. Kaydetmeyi unutmayın.",
            "info",
            3000
        );
    };

    const handleLogoutOtherSessions = () => {
        setShowSessions(false);
        showFeedback("Diğer cihazlardaki oturumlar kapatıldı.", "success", 3000);
    };

    return (
        <div className="relative flex h-screen w-full overflow-hidden bg-transparent font-sans">
            {saveMessage && (
                <div
                    role="status"
                    aria-live="polite"
                    className={`fixed right-5 top-5 z-[200] max-w-sm rounded-xl border px-4 py-3 text-sm font-semibold shadow-xl ${saveMessageType === "error"
                        ? "border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
                        : saveMessageType === "info"
                            ? "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300"
                            : "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        }`}
                >
                    {saveMessage}
                </div>
            )}

            <style>{`
                .reduce-motion *,
                .reduce-motion *::before,
                .reduce-motion *::after {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    scroll-behavior: auto !important;
                    transition-duration: 0.01ms !important;
                }
                .high-contrast body {
                    filter: contrast(1.15);
                }
            `}</style>

            {showSessions && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Aktif Oturumlar</h2>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Hesabınızın açık olduğu cihazları yönetin.</p>

                        <div className="mt-5 space-y-3">
                            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-white">Windows · Chrome</p>
                                        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">Mevcut cihaz · Şu an aktif</p>
                                    </div>
                                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">Aktif</span>
                                </div>
                            </div>

                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
                                <p className="font-bold text-slate-900 dark:text-white">Diğer cihazlar</p>
                                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">Kayıtlı başka aktif oturum bulunmuyor.</p>
                            </div>
                        </div>

                        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button type="button" onClick={() => setShowSessions(false)} className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Kapat</button>
                            <button type="button" onClick={handleLogoutOtherSessions} className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-700">Diğer Oturumları Kapat</button>
                        </div>
                    </div>
                </div>
            )}
            <video
                ref={videoRef}
                src={theme === "dark" ? "/videos/darkmode_bg.mp4" : "/videos/chatbot_bg.mp4"}
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                className="pointer-events-none fixed inset-0 z-0 h-full w-full object-cover"
            />

            <div className="pointer-events-none fixed inset-0 z-10 bg-white/20 dark:bg-slate-950/60" />

            <ChatSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            <div className="relative z-20 flex h-full min-w-0 flex-1 flex-col overflow-hidden bg-transparent">
                {!isSidebarOpen && (
                    <button
                        type="button"
                        onClick={() => setIsSidebarOpen(true)}
                        className="fixed left-4 top-4 z-40 rounded-xl border border-slate-200 bg-white p-2 text-slate-500 shadow-md transition hover:bg-slate-50 hover:text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                        title={tr("settings_open_sidebar", "Menüyü aç")}
                    >
                        <PanelLeftOpen size={18} />
                    </button>
                )}

                <div className="flex-1 overflow-y-auto px-4 pt-16 pb-8 md:px-8 md:py-12">
                    <div className="mx-auto w-full max-w-6xl">
                        <div className="rounded-3xl border border-slate-200 bg-white/95 p-5 shadow-2xl backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/95 md:p-8">
                            <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                                        {tr("settings_title", "Ayarlar")}
                                    </h1>
                                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                        {tr(
                                            "settings_subtitle",
                                            "Hesap, bildirim, güvenlik ve görünüm ayarlarınızı yönetin."
                                        )}
                                    </p>
                                </div>

                            </div>

                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">
                                <aside className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
                                    {tabs.map(({ id, label, icon: Icon }) => (
                                        <button
                                            key={id}
                                            type="button"
                                            onClick={() => setActiveTab(id)}
                                            className={`flex min-w-max items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-semibold transition lg:w-full ${activeTab === id
                                                ? "border-amber-500 bg-amber-500 text-white shadow-md shadow-amber-500/20"
                                                : "border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-200 dark:hover:bg-slate-800"
                                                }`}
                                        >
                                            <Icon size={18} />
                                            {label}
                                        </button>
                                    ))}
                                </aside>

                                <main className="min-h-[520px] rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 md:p-6">
                                    {activeTab === "general" && (
                                        <div>
                                            <SectionHeader
                                                title={tr("settings_general_title", "Genel Bilgiler")}
                                                description={tr(
                                                    "settings_general_desc",
                                                    "Hesabınızda kullanılacak temel iletişim bilgilerini düzenleyin."
                                                )}
                                            />
                                            <div className="grid gap-5 md:grid-cols-2">
                                                <label className="space-y-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                    {tr("settings_full_name", "Ad Soyad")}
                                                    <input
                                                        className={inputClass}
                                                        value={settings.general.fullName}
                                                        onChange={(e) => updateSection("general", "fullName", e.target.value)}
                                                        placeholder="Ad Soyad"
                                                    />
                                                </label>
                                                <label className="space-y-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                    {tr("settings_email", "E-posta")}
                                                    <input
                                                        type="email"
                                                        className={inputClass}
                                                        value={settings.general.email}
                                                        onChange={(e) => updateSection("general", "email", e.target.value)}
                                                        placeholder="ornek@email.com"
                                                    />
                                                </label>
                                                <label className="space-y-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                    {tr("settings_phone", phoneTexts.phone)}
                                                    <PhoneInput
                                                        international
                                                        limitMaxLength
                                                        defaultCountry="TR"
                                                        country={settings.general.phoneCountry || undefined}
                                                        countryCallingCodeEditable={false}
                                                        labels={phoneLabels}
                                                        value={settings.general.phone || undefined}
                                                        onCountryChange={(country) => {
                                                            updateSection("general", "phoneCountry", country || "TR");
                                                            updateSection("general", "phone", "");
                                                        }}
                                                        onChange={(nextValue) => {
                                                            const country =
                                                                settings.general.phoneCountry || "TR";
                                                            const rawValue = nextValue || "";

                                                            if (!rawValue) {
                                                                updateSection("general", "phone", "");
                                                                return;
                                                            }

                                                            const limitedValue =
                                                                limitPhoneNumberByCountry(rawValue, country);

                                                            if (limitedValue !== rawValue) {
                                                                showFeedback(
                                                                    tr(
                                                                        "settings_phone_too_long",
                                                                        phoneTexts.tooLong
                                                                    ),
                                                                    "error",
                                                                    2500
                                                                );
                                                            }

                                                            updateSection(
                                                                "general",
                                                                "phone",
                                                                limitedValue
                                                            );
                                                        }}
                                                        placeholder={tr("settings_phone_placeholder", phoneTexts.placeholder)}
                                                        className="flex min-h-[48px] w-full items-center gap-3 rounded-xl border border-slate-300 bg-white px-4 transition focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20 dark:border-slate-700 dark:bg-slate-800"
                                                        numberInputProps={{
                                                            className:
                                                                "min-w-0 flex-1 border-0 bg-transparent py-3 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500",
                                                            autoComplete: "tel",
                                                        }}
                                                    />
                                                    <p className="text-xs font-normal text-slate-500 dark:text-slate-400">
                                                        {tr(
                                                            "settings_phone_help",
                                                            phoneTexts.help
                                                        )}
                                                    </p>
                                                </label>
                                                <label className="space-y-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                    {tr("settings_default_traveler", "Varsayılan Yolcu")}
                                                    <select
                                                        className={inputClass}
                                                        value={settings.general.defaultTraveler}
                                                        onChange={(e) => updateSection("general", "defaultTraveler", e.target.value)}
                                                    >
                                                        <option value="self">Kendim</option>
                                                        <option value="saved">Kayıtlı yolcu</option>
                                                    </select>
                                                </label>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === "notifications" && (
                                        <div>
                                            <SectionHeader title="Bildirimler" description="Hangi gelişmeler için bildirim almak istediğinizi seçin." />
                                            <div className="space-y-3">
                                                {[
                                                    ["bookingConfirmations", "Rezervasyon onayları", "Otel veya uçak rezervasyonu oluşturulduğunda bildir."],
                                                    ["bookingChanges", "Rezervasyon değişiklikleri", "Saat, terminal, oda veya rezervasyon durumu değiştiğinde bildir."],
                                                    ["flightReminder", "Uçuş hatırlatması", "Uçuş saatiniz yaklaşırken hatırlatma gönder."],
                                                    ["checkInReminder", "Online check-in", "Online check-in açıldığında bildir."],
                                                    ["hotelReminder", "Otel giriş hatırlatması", "Otel giriş tarihinden önce hatırlatma gönder."],
                                                    ["priceChanges", "Fiyat değişiklikleri", "Takip edilen uçuş veya otelin fiyatı değiştiğinde bildir."],
                                                    ["campaigns", "Kampanyalar", "İndirim ve seyahat fırsatlarından haberdar ol."],
                                                ].map(([field, title, description]) => (
                                                    <SettingRow key={field} title={title} description={description}>
                                                        <Toggle checked={settings.notifications[field]} onChange={(value) => updateSection("notifications", field, value)} label={title} />
                                                    </SettingRow>
                                                ))}
                                            </div>

                                            <h3 className="mb-3 mt-7 text-base font-bold text-slate-900 dark:text-white">Bildirim kanalları</h3>
                                            <div className="grid gap-3 sm:grid-cols-3">
                                                {[["inApp", "Uygulama içi"], ["email", "E-posta"]].map(([field, label]) => (
                                                    <label key={field} className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200">
                                                        <input type="checkbox" className="h-4 w-4 accent-amber-500" checked={settings.notifications[field]} onChange={(e) => updateSection("notifications", field, e.target.checked)} />
                                                        {label}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === "security" && (
                                        <div>
                                            <SectionHeader title="Hesap Güvenliği" description="Şifrenizi ve hesap güvenliğinizi yönetin." />
                                            <div className="grid gap-5 md:grid-cols-2">
                                                <label className="space-y-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                    Yeni şifre
                                                    <div className="relative">
                                                        <input type={showPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="En az 6 karakter" className={`${inputClass} pr-12`} />
                                                        <button type="button" onClick={() => setShowPassword((current) => !current)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900 dark:hover:text-white">
                                                            {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                                                        </button>
                                                    </div>
                                                </label>
                                                <label className="space-y-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                    Yeni şifreyi doğrula
                                                    <input type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Şifreyi tekrar yazın" className={inputClass} />
                                                    {newPassword && confirmPassword && newPassword !== confirmPassword && <span className="text-xs font-semibold text-red-500">Şifreler eşleşmiyor.</span>}
                                                </label>
                                            </div>
                                            <div className="mt-6 space-y-3">
                                                <SettingRow
                                                    title="İki adımlı doğrulama"
                                                    description={settings.security.twoFactorEnabled ? "İki adımlı doğrulama şu anda açık." : "Hesabınıza giriş yaparken ek doğrulama kodu ister."}
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={handleTwoFactor}
                                                        className={`rounded-xl px-4 py-2 text-sm font-bold transition ${settings.security.twoFactorEnabled ? "border border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30" : "border border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"}`}
                                                    >
                                                        {settings.security.twoFactorEnabled ? "Devre Dışı Bırak" : "Etkinleştir"}
                                                    </button>
                                                </SettingRow>
                                                <SettingRow title="Aktif oturumlar" description="Hesabınızın açık olduğu cihazları görüntüleyin.">
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowSessions(true)}
                                                        className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                                                    >
                                                        Görüntüle
                                                    </button>
                                                </SettingRow>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === "appearance" && (
                                        <div>
                                            <SectionHeader title="Görünüm" description="Tema ve erişilebilirlik seçeneklerini yönetin." />
                                            <div className="mb-6 grid gap-3 sm:grid-cols-3">
                                                {[
                                                    ["light", "Açık", Sun],
                                                    ["dark", "Koyu", Moon],
                                                    ["system", "Sistem", Monitor],
                                                ].map(([value, label, Icon]) => (
                                                    <button key={value} type="button" onClick={() => applyTheme(value)} className={`flex items-center justify-center gap-2 rounded-2xl border p-4 text-sm font-bold transition ${settings.appearance.theme === value ? "border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300" : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200"}`}>
                                                        <Icon size={19} /> {label}
                                                    </button>
                                                ))}
                                            </div>
                                            <label className="mb-5 block space-y-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                Yazı boyutu
                                                <select className={inputClass} value={settings.appearance.fontSize} onChange={(e) => updateSection("appearance", "fontSize", e.target.value)}>
                                                    <option value="small">Küçük</option>
                                                    <option value="medium">Orta</option>
                                                    <option value="large">Büyük</option>
                                                </select>
                                            </label>
                                            <div className="space-y-3">
                                                <SettingRow title="Animasyonları azalt" description="Hareketli geçişleri ve efektleri azaltır.">
                                                    <Toggle checked={settings.appearance.reduceMotion} onChange={(value) => updateSection("appearance", "reduceMotion", value)} label="Animasyonları azalt" />
                                                </SettingRow>
                                                <SettingRow title="Yüksek kontrast" description="Metin ve arka plan arasındaki renk farkını artırır.">
                                                    <Toggle checked={settings.appearance.highContrast} onChange={(value) => updateSection("appearance", "highContrast", value)} label="Yüksek kontrast" />
                                                </SettingRow>
                                            </div>
                                        </div>
                                    )}
                                </main>
                            </div>

                            <div className="relative z-50 mt-8 flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 dark:border-slate-800 sm:flex-row sm:justify-end">
                                <button type="button" onClick={handleCancel} className="relative z-50 cursor-pointer rounded-xl border border-slate-300 px-7 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 active:scale-[0.98] dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
                                    {tr("settings_cancel", "İptal")}
                                </button>
                                <button type="button" onClick={handleSave} disabled={isSaving} className="relative z-50 flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3 text-sm font-bold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60">
                                    <Save size={17} />
                                    {isSaving ? tr("settings_saving", "Kaydediliyor...") : tr("settings_save_changes", "Değişiklikleri Kaydet")}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}