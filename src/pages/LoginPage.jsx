import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';

export default function LoginPage() {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' });
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event) {
      if (langRef.current && !langRef.current.contains(event.target)) {
        setIsLangOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLangLabel = i18n.language ? i18n.language.slice(0, 2).toUpperCase() : 'EN';

  const validateEmail = (val) => {
    if (!val.trim()) {
      return t('required_error');
    }
    if (val.length > 100) {
      return t('invalid_email');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val)) {
      return t('invalid_email');
    }
    return '';
  };

  const validatePassword = (val) => {
    if (!val.trim()) {
      return t('required_error');
    }
    if (val.length < 6 || val.length > 30) {
      return t('password_min_error');
    }
    return '';
  };

  const handleBlur = (field, value) => {
    let err = '';
    if (field === 'email') {
      err = validateEmail(value);
    } else if (field === 'password') {
      err = validatePassword(value);
    }
    setFieldErrors((prev) => ({ ...prev, [field]: err }));
  };

  function handleSubmit(e) {
    e.preventDefault();
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);
    setFieldErrors({ email: emailErr, password: passwordErr });

    if (emailErr || passwordErr) {
      return;
    }

    localStorage.setItem('userId', email.trim());
    navigate('/chat');
  }

  const handleTimeUpdate = (e) => {
    const video = e.target;
    if (video.duration && video.currentTime >= video.duration - 0.15) {
      video.currentTime = 0;
      video.play().catch(() => {});
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative z-10 font-sans">
      {/* Floating Language Switcher Dropdown */}
      <div className="fixed top-4 right-4 z-50" ref={langRef}>
        <button
          type="button"
          onClick={() => setIsLangOpen(!isLangOpen)}
          className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-[#F27B13] text-[16px] font-semibold flex items-center gap-2 cursor-pointer transition-all duration-200 hover:bg-white/20 focus:outline-none"
        >
          <span>{currentLangLabel}</span>
          <svg className={`w-4 h-4 transition-transform duration-200 ${isLangOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {isLangOpen && (
          <div className="absolute right-0 mt-2 w-28 bg-[#023047]/95 backdrop-blur-md border border-white/10 rounded-xl shadow-xl overflow-hidden py-1 z-50 animate-fade-in">
            {['en', 'tr', 'ru', 'de'].map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => {
                  i18n.changeLanguage(lang);
                  setIsLangOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-[15px] transition-colors duration-150 ${
                  i18n.language.startsWith(lang)
                    ? 'text-[#F27B13] font-bold bg-white/5'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Background Video Container */}
      <div className="fixed inset-0 w-screen h-screen -z-20 bg-black">
        <video
          src="/videos/background.mp4"
          autoPlay
          muted
          playsInline
          preload="auto"
          onTimeUpdate={handleTimeUpdate}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Dark Overlay */}
      <div className="fixed inset-0 w-screen h-screen bg-black/40 -z-10" />

      {/* Glassmorphism Login Container */}
      <div className="w-full max-w-[550px] bg-white/15 backdrop-blur-sm border border-white/20 rounded-[32px] shadow-2xl p-10 md:p-12 animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-[34px] md:text-[40px] font-bold tracking-tight text-white mb-2 font-display">
            {t('welcome_title')}
          </h1>
          <p className="text-[16px] md:text-[18px] text-white/80">
            <Trans i18nKey="welcome_subtitle">
              Chat with <span className="text-[#F27B13] font-bold" style={{ textShadow: '0 0 12px rgba(242,123,19,0.4)' }}>Sanny</span>
            </Trans>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Email Input */}
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-[15px] font-semibold text-white/90 uppercase tracking-wider pl-4">
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
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={(e) => handleBlur('email', e.target.value)}
                placeholder={t('email_placeholder')}
                maxLength={100}
                className="w-full bg-black/30 hover:bg-black/40 border border-white/10 rounded-full pl-12 pr-6 py-4 text-[16px] text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-black/50 transition-all duration-300"
              />
            </div>
            {fieldErrors.email && (
              <p className="text-[14px] text-red-400 pl-4 mt-1">{fieldErrors.email}</p>
            )}
          </div>

          {/* Password Input */}
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-[15px] font-semibold text-white/90 uppercase tracking-wider pl-4">
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={(e) => handleBlur('password', e.target.value)}
                placeholder={t('password_placeholder')}
                maxLength={30}
                className="w-full bg-black/30 hover:bg-black/40 border border-white/10 rounded-full pl-12 pr-14 py-4 text-[16px] text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-black/50 transition-all duration-300"
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
              <p className="text-[14px] text-red-400 pl-4 mt-1">{fieldErrors.password}</p>
            )}
          </div>

          {/* Options Row */}
          <div className="flex items-center justify-between px-2">
            <label className="flex items-center text-[15px] text-white/80 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="mr-2 rounded border-white/20 bg-black/30 text-[#F27B13] focus:ring-0 focus:ring-offset-0 w-4 h-4 accent-[#F27B13]"
              />
              {t('remember_me')}
            </label>
            <button
              type="button"
              className="text-[15px] text-white/80 hover:text-white hover:underline transition-colors duration-200"
            >
              {t('forgot_password')}
            </button>
          </div>

          {/* Submit Button Centered Redesign */}
          <button
            type="submit"
            className="max-w-[220px] w-full mx-auto block bg-primary hover:bg-primary-dark active:scale-95 text-white font-bold py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-primary/30 font-sans tracking-wide mt-4 text-[18px]"
          >
            {t('login_button')}
          </button>
        </form>

        {/* Bottom Text */}
        <div className="mt-8 text-center">
          <p className="text-[16px] text-white/60">
            {t('no_account')}{' '}
            <Link
              to="/signup"
              className="text-[#F27B13] hover:text-amber-500 font-semibold hover:underline transition-colors duration-200"
            >
              {t('signup_link')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
