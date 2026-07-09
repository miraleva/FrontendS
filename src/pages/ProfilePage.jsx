import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import ChatSidebar from "../components/ChatSidebar";
import { PanelLeftOpen } from "lucide-react";

export default function Profile() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [isEditing, setIsEditing] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    
    // Load initial user details from localStorage 'user' object or defaults
    const [formData, setFormData] = useState(() => {
        const email = localStorage.getItem('userId') || '';
        try {
            const storedUserStr = localStorage.getItem('user');
            if (storedUserStr) {
                const user = JSON.parse(storedUserStr);
                return {
                    firstName: user.firstName || '',
                    lastName: user.lastName || '',
                    email: user.email || email,
                    phone: user.phone || '',
                    country: user.country || '',
                    gender: user.gender || '',
                    dateOfBirth: user.dateOfBirth || '',
                };
            }
        } catch (e) {
            console.error("Error reading initial user from localStorage", e);
        }
        return {
            firstName: '',
            lastName: '',
            email: email,
            phone: '',
            country: '',
            gender: '',
            dateOfBirth: '',
        };
    });

    const [backupData, setBackupData] = useState({});
    
    const [errors, setErrors] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        country: "",
        gender: "",
        dateOfBirth: "",
    });

    const userId = localStorage.getItem('userId') || 'user';
    const displayHandle = userId.includes('@') ? userId.split('@')[0] : userId;

    const avatarLetter = formData.firstName 
        ? formData.firstName[0].toUpperCase() 
        : (formData.email ? formData.email[0].toUpperCase() : "U");

    const fullName = (formData.firstName || formData.lastName) 
        ? `${formData.firstName} ${formData.lastName}`.trim() 
        : displayHandle;

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === "dateOfBirth") {
            const cleaned = value.replace(/\D/g, "");
            const limited = cleaned.slice(0, 8);
            let formatted = limited;
            if (limited.length > 2 && limited.length <= 4) {
                formatted = `${limited.slice(0, 2)}.${limited.slice(2)}`;
            } else if (limited.length > 4) {
                formatted = `${limited.slice(0, 2)}.${limited.slice(2, 4)}.${limited.slice(4)}`;
            }

            setFormData((prev) => ({
                ...prev,
                [name]: formatted,
            }));
            setErrors((prev) => ({ ...prev, dateOfBirth: "" }));
            return;
        }

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handlePhoneChange = (value) => {
        setFormData((prev) => ({
            ...prev,
            phone: value || "",
        }));
    };

    const validateDateOfBirth = (dob) => {
        if (!dob) return "";
        const regex = /^(\d{2})\.(\d{2})\.(\d{4})$/;
        const match = dob.match(regex);
        if (!match) return t("profile_dob_invalid_format");
        
        const day = parseInt(match[1], 10);
        const month = parseInt(match[2], 10) - 1;
        const year = parseInt(match[3], 10);
        
        const date = new Date(year, month, day);
        const now = new Date();
        
        if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
            return t("profile_dob_invalid_date");
        }
        if (date > now) {
            return t("profile_dob_future");
        }
        return "";
    };

    const validateField = (field, value) => {
        let err = "";
        const trimmedVal = typeof value === "string" ? value.trim() : "";

        if (field === "firstName" || field === "lastName") {
            if (!trimmedVal) {
                err = t("required_error");
            } else {
                const nameRegex = /^[A-Za-zÀ-ÿ\s]+$/;
                if (!nameRegex.test(trimmedVal)) {
                    err = t("letters_error");
                }
            }
        } else if (field === "email") {
            if (!trimmedVal) {
                err = t("required_error");
            } else {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(trimmedVal)) {
                    err = t("invalid_email");
                }
            }
        } else if (field === "phone") {
            if (!value) {
                err = t("required_error");
            } else if (!isValidPhoneNumber(value)) {
                err = t("invalid_phone");
            }
        } else if (field === "dateOfBirth") {
            if (trimmedVal) {
                err = validateDateOfBirth(trimmedVal);
            }
        }
        return err;
    };

    const handleBlur = (field) => {
        const err = validateField(field, formData[field]);
        setErrors((prev) => ({ ...prev, [field]: err }));
    };

    const handleEditStart = () => {
        setBackupData(formData);
        setIsEditing(false);
        setErrors({
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            country: "",
            gender: "",
            dateOfBirth: "",
        });
        setIsEditing(true);
    };

    const handleCancel = () => {
        setFormData(backupData);
        setIsEditing(false);
    };

    const handleSave = () => {
        const newErrors = {};
        let hasErrors = false;

        const fieldsToValidate = ["firstName", "lastName", "email", "phone", "dateOfBirth"];
        fieldsToValidate.forEach((field) => {
            const err = validateField(field, formData[field]);
            newErrors[field] = err;
            if (err) {
                hasErrors = true;
            }
        });

        setErrors(newErrors);

        if (hasErrors) {
            return;
        }

        // Save updated data back to localStorage
        localStorage.setItem("user", JSON.stringify(formData));
        setIsEditing(false);
        console.log("Veriler başarıyla kaydedildi:", formData);
        // TODO: connect to backend update endpoint
    };

    const handleLogOut = () => {
        console.log("Logging out...");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("userId");
        navigate("/login");
    };

    const handleDeleteAccount = () => {
        if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
            console.log("Deleting account...");
            localStorage.clear();
            navigate("/login");
        }
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
                <video autoPlay loop muted playsInline className="absolute top-0 left-0 w-full h-full object-cover z-0 pointer-events-none">
                    <source src="/videos/chatbot_bg.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>

                <div className="absolute top-0 left-0 w-full h-full bg-black/20 z-10 pointer-events-none" />

                {/* Scrollable Container holding the Glass Card */}
                <div className="flex-1 overflow-y-auto px-[16px] py-[32px] md:py-[48px] flex justify-center items-start z-20">
                    <div className="w-full max-w-[672px] mt-[16px] md:mt-[24px]">
                        {/* Main Profile Info Card */}
                        <div className="bg-gradient-to-b from-white/[0.22] to-white/[0.10] backdrop-blur-xl rounded-[20px] shadow-xl p-[32px] md:p-[40px] border border-white/20">
                            {/* Header Section */}
                            <div className="flex items-center justify-between mb-[32px]">
                                <div className="flex items-center gap-[16px]">
                                    {/* Gradient Avatar with Inner Shadow */}
                                    <div className="w-[56px] h-[56px] rounded-full bg-gradient-to-br from-[#FFB703] to-[#0B5FFF] flex items-center justify-center text-white text-[20px] font-bold shadow-[inner_0_2px_4px_rgba(0,0,0,0.15)] select-none">
                                        {avatarLetter}
                                    </div>
                                    <div className="flex flex-col">
                                        <h1 className="text-[24px] font-bold text-slate-900 leading-tight">
                                            {fullName}
                                        </h1>
                                        <div className="flex flex-col mt-[2px]">
                                            <p className="text-slate-500 text-[14px] font-medium leading-none">@displayHandle</p>
                                            <p className="text-slate-600 text-[11px] font-medium mt-[6px] leading-none">
                                                {t("profile_member_since")}: May 2024
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Edit / Actions Buttons */}
                                {!isEditing ? (
                                    <button
                                        onClick={handleEditStart}
                                        className="px-[20px] py-[8px] border border-slate-700 hover:bg-slate-700/10 text-slate-700 font-semibold rounded-[12px] transition-all duration-200 text-[14px] focus:outline-none cursor-pointer"
                                    >
                                        {t("profile_edit")}
                                    </button>
                                ) : (
                                    <div className="flex gap-[8px]">
                                        <button
                                            onClick={handleCancel}
                                            className="px-[16px] py-[8px] border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-[12px] transition-all duration-200 text-[14px] focus:outline-none cursor-pointer"
                                        >
                                            {t("profile_cancel")}
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            className="px-[16px] py-[8px] bg-[#0B5FFF] hover:bg-[#0B5FFF]/90 text-white font-semibold rounded-[12px] transition-all duration-200 text-[14px] focus:outline-none cursor-pointer"
                                        >
                                            {t("profile_save_changes")}
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Form Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
                                {/* First Name */}
                                <div className="flex flex-col">
                                    <span className="text-[12px] font-bold uppercase tracking-wider text-slate-500 mb-[4px]">
                                        {t("first_name_label")}
                                    </span>
                                    {isEditing ? (
                                        <div>
                                            <input
                                                type="text"
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleInputChange}
                                                onBlur={() => handleBlur("firstName")}
                                                className="w-full px-[16px] py-[12px] rounded-[12px] bg-white/50 border border-white/20 text-slate-900 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#0B5FFF]/40 focus:bg-white/70 transition-all duration-200"
                                            />
                                            {errors.firstName && (
                                                <p className="text-[14px] text-red-400 pl-[16px] mt-[4px]">
                                                    {errors.firstName}
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-[15px] font-medium text-slate-900">
                                            {formData.firstName || "—"}
                                        </span>
                                    )}
                                </div>

                                {/* Last Name */}
                                <div className="flex flex-col">
                                    <span className="text-[12px] font-bold uppercase tracking-wider text-slate-500 mb-[4px]">
                                        {t("last_name_label")}
                                    </span>
                                    {isEditing ? (
                                        <div>
                                            <input
                                                type="text"
                                                name="lastName"
                                                value={formData.lastName}
                                                onChange={handleInputChange}
                                                onBlur={() => handleBlur("lastName")}
                                                className="w-full px-[16px] py-[12px] rounded-[12px] bg-white/50 border border-white/20 text-slate-900 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#0B5FFF]/40 focus:bg-white/70 transition-all duration-200"
                                            />
                                            {errors.lastName && (
                                                <p className="text-[14px] text-red-400 pl-[16px] mt-[4px]">
                                                    {errors.lastName}
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-[15px] font-medium text-slate-900">
                                            {formData.lastName || "—"}
                                        </span>
                                    )}
                                </div>

                                {/* Email */}
                                <div className="flex flex-col">
                                    <span className="text-[12px] font-bold uppercase tracking-wider text-slate-500 mb-[4px]">
                                        {t("email_label")}
                                    </span>
                                    {isEditing ? (
                                        <div>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                onBlur={() => handleBlur("email")}
                                                className="w-full px-[16px] py-[12px] rounded-[12px] bg-white/50 border border-white/20 text-slate-900 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#0B5FFF]/40 focus:bg-white/70 transition-all duration-200"
                                            />
                                            {errors.email && (
                                                <p className="text-[14px] text-red-400 pl-[16px] mt-[4px]">
                                                    {errors.email}
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-[15px] font-medium text-slate-900">
                                            {formData.email || "—"}
                                        </span>
                                    )}
                                </div>

                                {/* Phone Number */}
                                <div className="flex flex-col">
                                    <span className="text-[12px] font-bold uppercase tracking-wider text-slate-500 mb-[4px]">
                                        {t("phone_label")}
                                    </span>
                                    {isEditing ? (
                                        <div>
                                            <PhoneInput
                                                international
                                                defaultCountry="TR"
                                                value={formData.phone}
                                                onChange={handlePhoneChange}
                                                onBlur={() => handleBlur("phone")}
                                                className="flex items-center w-full bg-white/50 border border-white/20 rounded-[12px] px-[16px] py-[12px] text-slate-900 text-[15px] focus-within:ring-2 focus-within:ring-[#0B5FFF]/40 focus-within:bg-white/70 transition-all duration-200"
                                                numberInputProps={{
                                                    className: 'bg-transparent border-0 outline-none w-full text-[15px] text-slate-900 placeholder-slate-400 focus:ring-0 focus:outline-none ml-[12px]',
                                                    placeholder: t("phone_placeholder"),
                                                }}
                                            />
                                            {errors.phone && (
                                                <p className="text-[14px] text-red-400 pl-[16px] mt-[4px]">
                                                    {errors.phone}
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-[15px] font-medium text-slate-900">
                                            {formData.phone || "—"}
                                        </span>
                                    )}
                                </div>

                                {/* Country */}
                                <div className="flex flex-col">
                                    <span className="text-[12px] font-bold uppercase tracking-wider text-slate-500 mb-[4px]">
                                        {t("profile_country_label")}
                                    </span>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="country"
                                            value={formData.country}
                                            onChange={handleInputChange}
                                            onBlur={() => handleBlur("country")}
                                            className="w-full px-[16px] py-[12px] rounded-[12px] bg-white/50 border border-white/20 text-slate-900 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#0B5FFF]/40 focus:bg-white/70 transition-all duration-200"
                                        />
                                    ) : (
                                        <span className="text-[15px] font-medium text-slate-900">
                                            {formData.country || "—"}
                                        </span>
                                    )}
                                </div>

                                {/* Gender */}
                                <div className="flex flex-col">
                                    <span className="text-[12px] font-bold uppercase tracking-wider text-slate-500 mb-[4px]">
                                        {t("profile_gender")}
                                    </span>
                                    {isEditing ? (
                                        <select
                                            name="gender"
                                            value={formData.gender}
                                            onChange={handleInputChange}
                                            onBlur={() => handleBlur("gender")}
                                            className="w-full px-[16px] py-[12px] rounded-[12px] bg-white/50 border border-white/20 text-slate-900 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#0B5FFF]/40 focus:bg-white/70 transition-all duration-200 cursor-pointer"
                                        >
                                            <option value="" disabled className="text-slate-400 bg-slate-800 text-white">
                                                {t("profile_gender")}
                                            </option>
                                            <option value="Male" className="bg-slate-800 text-white">
                                                {t("profile_gender_male")}
                                            </option>
                                            <option value="Female" className="bg-slate-800 text-white">
                                                {t("profile_gender_female")}
                                            </option>
                                            <option value="Other" className="bg-slate-800 text-white">
                                                {t("profile_gender_other")}
                                            </option>
                                            <option value="Private" className="bg-slate-800 text-white">
                                                {t("profile_gender_private")}
                                            </option>
                                        </select>
                                    ) : (
                                        <span className="text-[15px] font-medium text-slate-900">
                                            {formData.gender ? t(`profile_gender_${formData.gender.toLowerCase()}`) : "—"}
                                        </span>
                                    )}
                                </div>

                                {/* Date of Birth */}
                                <div className="flex flex-col">
                                    <span className="text-[12px] font-bold uppercase tracking-wider text-slate-500 mb-[4px]">
                                        {t("profile_dob")}
                                    </span>
                                    {isEditing ? (
                                        <div>
                                            <input
                                                type="text"
                                                name="dateOfBirth"
                                                placeholder="DD.MM.YYYY"
                                                value={formData.dateOfBirth}
                                                onChange={handleInputChange}
                                                onBlur={() => handleBlur("dateOfBirth")}
                                                className="w-full px-[16px] py-[12px] rounded-[12px] bg-white/50 border border-white/20 text-slate-900 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#0B5FFF]/40 focus:bg-white/70 transition-all duration-200"
                                            />
                                            {errors.dateOfBirth && (
                                                <p className="text-[14px] text-red-400 pl-[16px] mt-[4px]">
                                                    {errors.dateOfBirth}
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-[15px] font-medium text-slate-900">
                                            {formData.dateOfBirth || "—"}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Account Actions Card */}
                        <div className="bg-gradient-to-b from-white/[0.22] to-white/[0.10] backdrop-blur-xl rounded-[20px] shadow-xl p-[24px] md:p-[32px] border border-white/20 mt-[24px]">
                            <h2 className="text-[18px] font-bold text-slate-900 mb-[16px] flex items-center gap-[8px]">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#0B5FFF]">
                                    <circle cx="12" cy="12" r="3" />
                                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                                </svg>
                                {t("profile_account_actions")}
                            </h2>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-[16px] py-[8px]">
                                <div>
                                    <p className="text-[14px] font-semibold text-slate-800">{t("profile_account_management")}</p>
                                    <p className="text-[12px] text-slate-500">Manage your session status or permanently delete your account.</p>
                                </div>
                                <div className="flex items-center gap-[12px] shrink-0">
                                    <button
                                        onClick={handleLogOut}
                                        className="px-[16px] py-[8px] border border-slate-700 hover:bg-slate-700/10 text-slate-700 font-semibold rounded-[12px] transition-colors duration-200 text-[12px] focus:outline-none cursor-pointer"
                                    >
                                        {t("profile_logout")}
                                    </button>
                                    <button
                                        onClick={handleDeleteAccount}
                                        className="px-[16px] py-[8px] bg-[#EF4444] hover:bg-[#EF4444]/90 text-white font-semibold rounded-[12px] transition-colors duration-200 text-[12px] focus:outline-none cursor-pointer"
                                    >
                                        {t("profile_delete_account")}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}