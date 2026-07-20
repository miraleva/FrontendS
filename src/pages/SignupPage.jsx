import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sun, Moon } from 'lucide-react';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import SannyLogo from '../components/SannyLogo';
import LanguageSelector from '../components/LanguageSelector';
import 'react-phone-number-input/style.css';
import api from '../services/api';
import { isPhoneNumberTooLong, getPhoneInputMaxLength } from '../utils/phoneLimits';
import { useTheme } from '../components/ThemeContext';

export default function SignupPage() {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(err => console.log("Video oynatılamadı:", err));
    }
  }, [theme]);
  const [formData, setFormData] = useState({
    name: '',
    lastname: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    name: '',
    lastname: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value
    }));
  };

  const handlePhoneChange = (val) => {
    if (!val) {
      setFormData((prev) => ({ ...prev, phone: '' }));
      setFieldErrors((prev) => ({ ...prev, phone: '' }));
      return;
    }
    // Ulke, numaranin basindaki uluslararasi koddan (+90, +1, +44 vb.)
    // PhoneInput tarafindan otomatik belirlenir. Biz sadece o ulke icin
    // olmasi gerekenden uzun bir numara yazilmasini engelliyoruz.
    if (isPhoneNumberTooLong(val)) {
      return;
    }
    setFormData((prev) => ({ ...prev, phone: val }));
    setFieldErrors((prev) => ({ ...prev, phone: '' }));
  };

  const validateField = (field, value) => {
    let err = '';
    const trimmedVal = typeof value === 'string' ? value.trim() : '';

    if (field !== 'phone' && !trimmedVal) {
      return t('required_error');
    } else if (field === 'phone' && !value) {
      return t('required_error');
    } else {
      if (field === 'name' || field === 'lastname') {
        if (trimmedVal.length > 25) {
          err = t('name_max_error');
        } else {
          const nameRegex = /^[A-Za-zÀ-ÿ\s]+$/;
          if (!nameRegex.test(trimmedVal)) {
            err = t('letters_error');
          }
        }
      } else if (field === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedVal)) {
          err = t('invalid_email');
        }
      } else if (field === 'phone') {
        if (!isValidPhoneNumber(value)) {
          err = t('invalid_phone');
        }
      } else if (field === 'password') {
        if (value.length < 6 || value.length > 30) {
          err = t('password_min_error');
        }
      } else if (field === 'confirmPassword') {
        if (value !== formData.password) {
          err = t('mismatch_error');
        }
      }
    }
    return err;
  };

  const handleBlur = (field) => {
    const err = validateField(field, formData[field]);
    setFieldErrors((prev) => ({ ...prev, [field]: err }));
  };

  async function handleSubmit(e) {
    e.preventDefault();

    const errors = {};
    let isValid = true;
    Object.keys(formData).forEach((key) => {
      const err = validateField(key, formData[key]);
      errors[key] = err;
      if (err) {
        isValid = false;
      }
    });

    setFieldErrors(errors);

    if (!isValid) {
      return;
    }

    try {
      await api.post('/api/auth/signup', {
        name: formData.name,
        lastname: formData.lastname,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      });
      navigate('/login');
    } catch (err) {
      if (err.response) {
        if (err.response.status === 409) {
          const fields = err.response.data?.fields || [];
          const message = err.response.data?.message || '';
          const hasEmail = fields.includes('email') || message.toLowerCase().includes('email');
          const hasPhone = fields.includes('phone') || message.toLowerCase().includes('phone');
          setFieldErrors((prev) => ({
            ...prev,
            ...(hasEmail && { email: "Email already exists" }),
            ...(hasPhone && { phone: "Phone number already exists" })
          }));
        } else if (err.response.status === 400) {
          setFieldErrors((prev) => ({
            ...prev,
            confirmPassword: "Passwords do not match or invalid request parameters."
          }));
        } else {
          setFieldErrors((prev) => ({
            ...prev,
            confirmPassword: "An unexpected error occurred. Please try again."
          }));
        }
      } else {
        setFieldErrors((prev) => ({
          ...prev,
          confirmPassword: "Network error. Please try again later."
        }));
      }
    }
  }

  const handleTimeUpdate = (e) => {
    const video = e.target;
    if (video.duration && video.currentTime >= video.duration - 0.15) {
      video.currentTime = 0;
      video.play().catch(() => { });
    }
  };

  const renderSubtitle = (text) => {
    if (!text) return '';
    const parts = text.split(/(Sanny)/i);
    return parts.map((part, index) => {
      if (part.toLowerCase() === 'sanny') {
        return (
          <span
            key={index}
            className="text-[#f07c24] font-bold"
            style={{ textShadow: '0 0 12px rgba(240,124,36,0.4)' }}
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 relative font-sans bg-transparent">
      {/* Shared Header Bar Logo on Left */}
      <SannyLogo />

      {/* Top Right Controls (Theme Toggle + Language Selector) */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-amber-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer flex items-center gap-2 shadow-lg"
          title={theme === 'dark' ? (t('theme_light', 'Aydınlık Mod')) : (t('theme_dark', 'Karanlık Mod'))}
        >
          {theme === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-slate-700" />}
          <span className="text-xs font-semibold hidden sm:inline text-slate-700 dark:text-slate-200">
            {theme === 'dark' ? (t('theme_light', 'Aydınlık')) : (t('theme_dark', 'Karanlık'))}
          </span>
        </button>
        <LanguageSelector className="relative" />
      </div>

      {/* Katman 1 (z-0): Background Video */}
      <video
        ref={videoRef}
        src={theme === 'dark' ? "/videos/darkmode_bg.mp4" : "/videos/chatbot_bg.mp4"}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="fixed inset-0 w-full h-full object-cover z-0 pointer-events-none opacity-80 dark:opacity-40"
      />

      {/* Katman 2 (z-10): Overlay Mask */}
      <div className="fixed inset-0 z-10 pointer-events-none bg-white/10 dark:bg-black/30" />

      {/* Katman 3 (z-20): Form Container */}
      <div className="relative z-20 w-full max-w-[550px] bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-[32px] shadow-2xl p-6 md:p-8 animate-fade-in my-8">
        <div className="text-center mb-8">
          <h1 className="text-[34px] md:text-[40px] font-bold tracking-tight text-slate-900 dark:text-white mb-2 font-display">
            {t('create_account_title')}
          </h1>
          <p className="text-[16px] md:text-[18px] text-slate-600 dark:text-slate-300">
            {renderSubtitle(t('signup_subtitle'))}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* First Name & Last Name Row */}
          <div className="flex gap-3">
            {/* First Name Input */}
            <div className="flex flex-col gap-2 flex-1">
              <label htmlFor="name" className="text-[15px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider pl-4">
                {t('first_name_label')}
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-5 text-slate-400 dark:text-slate-500 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={() => handleBlur('name')}
                  placeholder={t('first_name_placeholder')}
                  maxLength={25}
                  className="w-full bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200/80 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-full pl-12 pr-6 py-4 text-[16px] text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-300"
                />
              </div>
              {fieldErrors.name && (
                <p className="text-[14px] text-red-500 pl-4 mt-1">{fieldErrors.name}</p>
              )}
            </div>

            {/* Last Name Input */}
            <div className="flex flex-col gap-2 flex-1">
              <label htmlFor="lastname" className="text-[15px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider pl-4">
                {t('last_name_label')}
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-5 text-slate-400 dark:text-slate-500 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <input
                  id="lastname"
                  type="text"
                  value={formData.lastname}
                  onChange={handleChange}
                  onBlur={() => handleBlur('lastname')}
                  placeholder={t('last_name_placeholder')}
                  maxLength={25}
                  className="w-full bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200/80 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-full pl-12 pr-6 py-4 text-[16px] text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-300"
                />
              </div>
              {fieldErrors.lastname && (
                <p className="text-[14px] text-red-500 pl-4 mt-1">{fieldErrors.lastname}</p>
              )}
            </div>
          </div>

          {/* Email Input */}
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-[15px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider pl-4">
              {t('email_label')}
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-5 text-slate-400 dark:text-slate-500 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </div>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={() => handleBlur('email')}
                placeholder={t('email_placeholder')}
                maxLength={100}
                className="w-full bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200/80 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-full pl-12 pr-6 py-4 text-[16px] text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-300"
              />
            </div>
            {fieldErrors.email && (
              <p className="text-[14px] text-red-500 pl-4 mt-1">{fieldErrors.email}</p>
            )}
          </div>

          {/* Phone Number Input */}
          <div className="flex flex-col gap-2 relative z-50">
            <label htmlFor="phone" className="text-[15px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider pl-4">
              {t('phone_label')}
            </label>
            <PhoneInput
              international
              defaultCountry="TR"
              value={formData.phone}
              onChange={handlePhoneChange}
              onBlur={() => handleBlur('phone')}
              className="flex items-center w-full bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200/80 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-full px-5 py-3 text-slate-900 dark:text-slate-100 focus-within:ring-2 focus-within:ring-primary/50 transition-all duration-300"
              numberInputProps={{
                className: 'bg-transparent border-0 outline-none w-full text-[16px] text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400 focus:ring-0 focus:outline-none ml-3',
                placeholder: t('phone_placeholder'),
                id: 'phone',
                maxLength: getPhoneInputMaxLength(formData.phone)
              }}
            />
            {fieldErrors.phone && (
              <p className="text-[14px] text-red-500 pl-4 mt-1">{fieldErrors.phone}</p>
            )}
          </div>

          {/* Password Input */}
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-[15px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider pl-4">
              {t('password_label')}
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-5 text-slate-400 dark:text-slate-500 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                onBlur={() => handleBlur('password')}
                placeholder={t('password_placeholder')}
                maxLength={30}
                className="w-full bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200/80 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-full pl-12 pr-14 py-4 text-[16px] text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 text-slate-400 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors duration-200"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                    <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                    <line x1="2" x2="22" y1="2" y2="22" />
                  </svg>
                )}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-[14px] text-red-500 pl-4 mt-1">{fieldErrors.password}</p>
            )}
          </div>

          {/* Confirm Password Input */}
          <div className="flex flex-col gap-2">
            <label htmlFor="confirmPassword" className="text-[15px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider pl-4">
              {t('confirm_password_label')}
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-5 text-slate-400 dark:text-slate-500 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={() => handleBlur('confirmPassword')}
                placeholder={t('confirm_password_placeholder')}
                maxLength={30}
                className="w-full bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200/80 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-full pl-12 pr-14 py-4 text-[16px] text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-300"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-5 text-slate-400 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors duration-200"
              >
                {showConfirmPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                    <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                    <line x1="2" x2="22" y1="2" y2="22" />
                  </svg>
                )}
              </button>
            </div>
            {fieldErrors.confirmPassword && (
              <p className="text-[14px] text-red-500 pl-4 mt-1">{fieldErrors.confirmPassword}</p>
            )}
          </div>

          {/* Submit Button Centered Redesign */}
          <button
            type="submit"
            className="max-w-[220px] w-full mx-auto block bg-primary hover:bg-primary-dark active:scale-95 text-white font-bold py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-primary/30 font-sans tracking-wide mt-4 text-[18px]"
          >
            {t('signup_button')}
          </button>
        </form>

        {/* Bottom Text */}
        <div className="mt-8 text-center">
          <p className="text-[16px] text-slate-600 dark:text-slate-300">
            {t('have_account')}{' '}
            <Link
              to="/login"
              className="text-[#0096c7] dark:text-cyan-400 hover:text-[#023e8a] dark:hover:text-cyan-300 font-semibold hover:underline transition-colors duration-200"
            >
              {t('login_link')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
