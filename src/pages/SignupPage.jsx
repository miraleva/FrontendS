import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

export default function SignupPage() {
  const { t, i18n } = useTranslation();
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
    // Limit to '+' plus 15 digits (E.164 max digits is 15, so max length is 16 characters including '+')
    let cleaned = val.replace(/[^\d+]/g, '');
    if (cleaned.length > 16) {
      cleaned = cleaned.substring(0, 16);
    }
    setFormData((prev) => ({ ...prev, phone: cleaned }));
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
        const nameRegex = /^[A-Za-zÀ-ÿ\s]+$/;
        if (!nameRegex.test(trimmedVal)) {
          err = t('letters_error');
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

  function handleSubmit(e) {
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

    // TODO: connect to backend register endpoint
    navigate('/login');
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 relative z-10 font-sans">
      {/* Floating Language Switcher */}
      <div className="fixed top-4 right-4 z-50">
        <button
          type="button"
          onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'tr' : 'en')}
          className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1 text-white text-[13px] font-semibold hover:bg-white/20 transition-all duration-200 uppercase"
        >
          {i18n.language.slice(0, 2)}
        </button>
      </div>

      {/* Background Video Container */}
      <div className="fixed inset-0 w-screen h-screen -z-20">
        <video
          src="/videos/background.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        />
      </div>

      {/* Dark Overlay */}
      <div className="fixed inset-0 w-screen h-screen bg-black/40 -z-10" />

      {/* Glassmorphism Login Container */}
      <div className="w-full max-w-[550px] bg-white/5 backdrop-blur-sm border border-white/20 rounded-[32px] shadow-2xl p-6 md:p-8 animate-fade-in my-8">
        <div className="text-center mb-8">
          <h1 className="text-[30px] md:text-[36px] font-bold tracking-tight text-white mb-2 font-display">
            {t('create_account_title')}
          </h1>
          <p className="text-[14px] md:text-[16px] text-white/80">
            {t('signup_subtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* First Name & Last Name Row */}
          <div className="flex gap-3">
            {/* First Name Input */}
            <div className="flex flex-col gap-2 flex-1">
              <label htmlFor="name" className="text-[13px] font-semibold text-white/90 uppercase tracking-wider pl-4">
                {t('first_name_label')}
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-5 text-white/60 pointer-events-none">
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
                  maxLength={40}
                  className="w-full bg-black/30 hover:bg-black/40 border border-white/10 rounded-full pl-12 pr-6 py-4 text-[14px] text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:bg-black/50 transition-all duration-300"
                />
              </div>
              {fieldErrors.name && (
                <p className="text-[12px] text-red-400 pl-4 mt-1">{fieldErrors.name}</p>
              )}
            </div>

            {/* Last Name Input */}
            <div className="flex flex-col gap-2 flex-1">
              <label htmlFor="lastname" className="text-[13px] font-semibold text-white/90 uppercase tracking-wider pl-4">
                {t('last_name_label')}
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-5 text-white/60 pointer-events-none">
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
                  maxLength={40}
                  className="w-full bg-black/30 hover:bg-black/40 border border-white/10 rounded-full pl-12 pr-6 py-4 text-[14px] text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:bg-black/50 transition-all duration-300"
                />
              </div>
              {fieldErrors.lastname && (
                <p className="text-[12px] text-red-400 pl-4 mt-1">{fieldErrors.lastname}</p>
              )}
            </div>
          </div>

          {/* Email Input */}
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-[13px] font-semibold text-white/90 uppercase tracking-wider pl-4">
              {t('email_label')}
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-5 text-white/60 pointer-events-none">
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
                className="w-full bg-black/30 hover:bg-black/40 border border-white/10 rounded-full pl-12 pr-6 py-4 text-[14px] text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:bg-black/50 transition-all duration-300"
              />
            </div>
            {fieldErrors.email && (
              <p className="text-[12px] text-red-400 pl-4 mt-1">{fieldErrors.email}</p>
            )}
          </div>

          {/* Phone Number Input */}
          <div className="flex flex-col gap-2 relative z-50">
            <label htmlFor="phone" className="text-[13px] font-semibold text-white/90 uppercase tracking-wider pl-4">
              {t('phone_label')}
            </label>
            <PhoneInput
              international
              defaultCountry="TR"
              value={formData.phone}
              onChange={handlePhoneChange}
              onBlur={() => handleBlur('phone')}
              className="flex items-center w-full bg-black/30 hover:bg-black/40 border border-white/10 rounded-full px-5 py-3 text-white focus-within:ring-2 focus-within:ring-amber-500/50 focus-within:bg-black/50 transition-all duration-300"
              numberInputProps={{
                className: 'bg-transparent border-0 outline-none w-full text-[14px] text-white placeholder-white/40 focus:ring-0 focus:outline-none ml-3',
                placeholder: t('phone_placeholder'),
                id: 'phone'
              }}
            />
            {fieldErrors.phone && (
              <p className="text-[12px] text-red-400 pl-4 mt-1">{fieldErrors.phone}</p>
            )}
          </div>

          {/* Password Input */}
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-[13px] font-semibold text-white/90 uppercase tracking-wider pl-4">
              {t('password_label')}
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-5 text-white/60 pointer-events-none">
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
                className="w-full bg-black/30 hover:bg-black/40 border border-white/10 rounded-full pl-12 pr-14 py-4 text-[14px] text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:bg-black/50 transition-all duration-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 text-white/60 hover:text-white transition-colors duration-200"
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
              <p className="text-[12px] text-red-400 pl-4 mt-1">{fieldErrors.password}</p>
            )}
          </div>

          {/* Confirm Password Input */}
          <div className="flex flex-col gap-2">
            <label htmlFor="confirmPassword" className="text-[13px] font-semibold text-white/90 uppercase tracking-wider pl-4">
              {t('confirm_password_label')}
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-5 text-white/60 pointer-events-none">
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
                className="w-full bg-black/30 hover:bg-black/40 border border-white/10 rounded-full pl-12 pr-14 py-4 text-[14px] text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:bg-black/50 transition-all duration-300"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-5 text-white/60 hover:text-white transition-colors duration-200"
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
              <p className="text-[12px] text-red-400 pl-4 mt-1">{fieldErrors.confirmPassword}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-[#F59E0B] hover:bg-amber-600 active:scale-[0.98] text-white font-bold py-4 rounded-full transition-all duration-300 shadow-lg hover:shadow-amber-500/30 font-sans tracking-wide mt-2 text-[16px]"
          >
            {t('signup_button')}
          </button>
        </form>

        {/* Bottom Text */}
        <div className="mt-8 text-center">
          <p className="text-[14px] text-white/60">
            {t('have_account')}{' '}
            <Link
              to="/login"
              className="text-[#F59E0B] hover:text-amber-400 font-semibold hover:underline transition-colors duration-200"
            >
              {t('login_link')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
