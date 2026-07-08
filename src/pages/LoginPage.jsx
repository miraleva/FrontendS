import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
<<<<<<< HEAD

export default function LoginPage() {
=======
import { useTranslation } from 'react-i18next';
import SannyLogo from '../components/SannyLogo';
import LanguageSelector from '../components/LanguageSelector';

export default function LoginPage() {
  const { t } = useTranslation();
>>>>>>> origin/main
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
<<<<<<< HEAD
  const [error, setError] = useState('');
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) {
      setError('Kullanici adi bos olamaz.');
      return;
    }
=======
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' });
  const navigate = useNavigate();

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

>>>>>>> origin/main
    localStorage.setItem('userId', email.trim());
    navigate('/chat');
  }

<<<<<<< HEAD
  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative z-10 font-sans">
      {/* Background Video Container */}
      <div className="fixed inset-0 w-screen h-screen -z-20">
        <video
          src="/videos/background.mp4"
          autoPlay
          loop
          muted
          playsInline
=======
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
    <div className="min-h-screen flex items-center justify-center px-4 relative z-10 font-sans">
      {/* Shared Header Bar Logo on Left */}
      <SannyLogo />

      {/* Shared Floating Language Switcher Dropdown */}
      <LanguageSelector />

      {/* Background Video Container */}
      <div className="fixed inset-0 w-screen h-screen -z-20 bg-black">
        <video
          src="/videos/background.mp4"
          autoPlay
          muted
          playsInline
          preload="auto"
          onTimeUpdate={handleTimeUpdate}
>>>>>>> origin/main
          className="w-full h-full object-cover"
        />
      </div>

      {/* Dark Overlay */}
      <div className="fixed inset-0 w-screen h-screen bg-black/40 -z-10" />

      {/* Glassmorphism Login Container */}
<<<<<<< HEAD
      <div className="w-full max-w-[550px] bg-white/15 backdrop-blur-xl border border-white/20 rounded-[32px] shadow-2xl p-10 md:p-12 animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-2 font-display">
            Welcome Back To Sanny
          </h1>
          <p className="text-sm md:text-base text-white/80">
            Sign in to continue your journey.
=======
      <div className="w-full max-w-[550px] bg-white/5 backdrop-blur-sm border border-white/20 rounded-[32px] shadow-2xl p-10 md:p-12 animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-[34px] md:text-[40px] font-bold tracking-tight text-white mb-2 font-display">
            {t('welcome_title')}
          </h1>
          <p className="text-[16px] md:text-[18px] text-white/80">
            {renderSubtitle(t('welcome_subtitle'))}
>>>>>>> origin/main
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Email Input */}
          <div className="flex flex-col gap-2">
<<<<<<< HEAD
            <label htmlFor="email" className="text-s font-semibold text-white/90 uppercase tracking-wider pl-4">
              Emaıl Address
=======
            <label htmlFor="email" className="text-[15px] font-semibold text-white/90 uppercase tracking-wider pl-4">
              {t('email_label')}
>>>>>>> origin/main
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
<<<<<<< HEAD
                placeholder="Enter your email"
                className="w-full bg-black/30 hover:bg-black/40 border border-white/10 rounded-full pl-12 pr-6 py-4 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:bg-black/50 transition-all duration-300"
              />
            </div>
=======
                onBlur={(e) => handleBlur('email', e.target.value)}
                placeholder={t('email_placeholder')}
                maxLength={100}
                className="w-full bg-black/30 hover:bg-black/40 border border-white/10 rounded-full pl-12 pr-6 py-4 text-[16px] text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-black/50 transition-all duration-300"
              />
            </div>
            {fieldErrors.email && (
              <p className="text-[14px] text-red-400 pl-4 mt-1">{fieldErrors.email}</p>
            )}
>>>>>>> origin/main
          </div>

          {/* Password Input */}
          <div className="flex flex-col gap-2">
<<<<<<< HEAD
            <label htmlFor="password" className="text-s font-semibold text-white/90 uppercase tracking-wider pl-4">
              Password
=======
            <label htmlFor="password" className="text-[15px] font-semibold text-white/90 uppercase tracking-wider pl-4">
              {t('password_label')}
>>>>>>> origin/main
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
<<<<<<< HEAD
                placeholder="Enter your password"
                className="w-full bg-black/30 hover:bg-black/40 border border-white/10 rounded-full pl-12 pr-14 py-4 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:bg-black/50 transition-all duration-300"
=======
                onBlur={(e) => handleBlur('password', e.target.value)}
                placeholder={t('password_placeholder')}
                maxLength={30}
                className="w-full bg-black/30 hover:bg-black/40 border border-white/10 rounded-full pl-12 pr-14 py-4 text-[16px] text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-black/50 transition-all duration-300"
>>>>>>> origin/main
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 text-white/60 hover:text-white transition-colors duration-200"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
<<<<<<< HEAD
=======
                    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
>>>>>>> origin/main
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                    <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                    <line x1="2" x2="22" y1="2" y2="22" />
                  </svg>
<<<<<<< HEAD
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
=======
                )}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-[14px] text-red-400 pl-4 mt-1">{fieldErrors.password}</p>
            )}
>>>>>>> origin/main
          </div>

          {/* Options Row */}
          <div className="flex items-center justify-between px-2">
<<<<<<< HEAD
            <label className="flex items-center text-s text-white/80 cursor-pointer select-none">
=======
            <label className="flex items-center text-[15px] text-white/80 cursor-pointer select-none">
>>>>>>> origin/main
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
<<<<<<< HEAD
                className="mr-2 rounded border-white/20 bg-black/30 text-amber-500 focus:ring-0 focus:ring-offset-0 w-4 h-4 accent-amber-500"
              />
              Remember me
            </label>
            <button
              type="button"
              className="text-s text-white/80 hover:text-white hover:underline transition-colors duration-200"
            >
              Forgot Password?
            </button>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3 text-xs text-red-300 text-center">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-[#F59E0B] hover:bg-amber-600 active:scale-[0.98] text-white font-bold py-4 rounded-full transition-all duration-300 shadow-lg hover:shadow-amber-500/30 font-sans tracking-wide mt-2"
          >
            Log In
=======
                className="mr-2 rounded border-white/20 bg-black/30 text-primary focus:ring-0 focus:ring-offset-0 w-4 h-4 accent-primary"
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
>>>>>>> origin/main
          </button>
        </form>

        {/* Bottom Text */}
        <div className="mt-8 text-center">
<<<<<<< HEAD
          <p className="text-sm text-white/60">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="text-[#F59E0B] hover:text-amber-400 font-semibold hover:underline transition-colors duration-200"
            >
              Sign Up
=======
          <p className="text-[16px] text-white/60">
            {t('no_account')}{' '}
            <Link
              to="/signup"
              className="text-[#0096c7] hover:text-[#023e8a] font-semibold hover:underline transition-colors duration-200"
            >
              {t('signup_link')}
>>>>>>> origin/main
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
