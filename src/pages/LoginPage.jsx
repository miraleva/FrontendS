import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SannyLogo from '../components/SannyLogo';
import LanguageSelector from '../components/LanguageSelector';
import api from '../services/api';

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Giriş Modları: Kullanıcı Girişi mi, Admin Girişi mi?
  const [isAdminMode, setIsAdminMode] = useState(false);

  // Genel Form State'leri
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '', admin: '' });

  // Admin Özel Şifre State'i
  const [adminPassword, setAdminPassword] = useState('');

  // Validasyonlar
  const validateEmail = (val) => {
    if (!val.trim()) return t('required_error');
    if (val.length > 100) return t('invalid_email');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val)) return t('invalid_email');
    return '';
  };

  const validatePassword = (val) => {
    if (!val.trim()) return t('required_error');
    if (val.length < 6 || val.length > 30) return t('password_min_error');
    return '';
  };

  const handleBlur = (field, value) => {
    let err = '';
    if (field === 'email') err = validateEmail(value);
    else if (field === 'password') err = validatePassword(value);
    setFieldErrors((prev) => ({ ...prev, [field]: err }));
  };

  // Input değişimlerinde hataları anında temizlemek için:
  const handleInputChange = (field, value, setter) => {
    setter(value);
    setFieldErrors((prev) => ({ ...prev, [field]: '' }));
  };

  // KULLANICI GİRİŞI SUBMIT
  async function handleUserSubmit(e) {
    e.preventDefault();
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);
    setFieldErrors({ email: emailErr, password: passwordErr, admin: '' });

    if (emailErr || passwordErr) return;

    try {
      const response = await api.post('/api/auth/login', { email, password });
      const data = response.data;
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('userId', data.user.email);
      navigate('/chat');
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setFieldErrors({
          email: "Invalid email or password",
          password: "Invalid email or password",
          admin: ''
        });
      } else {
        setFieldErrors({
          email: "An error occurred during login. Please try again.",
          password: "",
          admin: ''
        });
      }
    }
  }

  // ADMIN GİRİŞİ SUBMIT
  async function handleAdminSubmit(e) {
    e.preventDefault();
    if (!adminPassword.trim()) {
      setFieldErrors({ email: '', password: '', admin: t('required_error', 'Password is required') });
      return;
    }

    try {
      // Backend'deki admin giriş endpoint'ine istek atıyoruz
      const response = await api.post('/api/auth/admin-login', { password: adminPassword });
      const data = response.data;
      localStorage.setItem('adminToken', data.token);
      navigate('/admin');
    } catch (err) {
      setFieldErrors({
        email: '',
        password: '',
        admin: t('invalid_admin_password', 'Geçersiz Admin Şifresi!')
      });
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
    <div className="min-h-screen flex items-center justify-center px-4 relative z-10 font-sans">
      <SannyLogo />
      <LanguageSelector />

      {/* Background Video */}
      <div className="fixed inset-0 w-screen h-screen -z-20 bg-black">
        <video
          src="/videos/background.mp4"
          autoPlay
          muted
          playsInline
          preload="auto"
          onTimeUpdate={handleTimeUpdate}
          className="w-full h-full object-cover opacity-100 dark:opacity-30 dark:brightness-[0.4] blur-none dark:blur-md"
        />
      </div>

      <div className="fixed inset-0 w-screen h-screen bg-black/40 dark:bg-black/70 -z-10" />

      {/* Glassmorphism Container */}
      <div className="w-full max-w-[550px] bg-white/5 dark:bg-slate-900/90 backdrop-blur-sm dark:backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-[32px] shadow-2xl p-10 md:p-12 animate-fade-in">

        {/* BAŞLIK */}
        <div className="text-center mb-8">
          <h1 className="text-[34px] md:text-[40px] font-bold tracking-tight text-white mb-2 font-display transition-all">
            {isAdminMode ? t('admin_login_title', 'Yönetici Girişi') : t('welcome_title')}
          </h1>
          <p className="text-[16px] md:text-[18px] text-white/80">
            {isAdminMode
              ? t('admin_login_subtitle', 'Lütfen devam etmek için admin şifresini giriniz.')
              : renderSubtitle(t('welcome_subtitle'))}
          </p>
        </div>

        {/* ADMIN GİRİŞ FORMU */}
        {isAdminMode ? (
          <form onSubmit={handleAdminSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="adminPassword" className="text-[15px] font-semibold text-white/90 uppercase tracking-wider pl-4">
                {t('admin_password_label', 'Admin Şifresi')}
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-5 text-white/60 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <input
                  id="adminPassword"
                  type={showAdminPassword ? 'text' : 'password'}
                  value={adminPassword}
                  onChange={(e) => handleInputChange('admin', e.target.value, setAdminPassword)}
                  placeholder="••••••••"
                  className="w-full bg-black/30 hover:bg-black/40 border border-white/10 rounded-full pl-12 pr-14 py-4 text-[16px] text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-black/50 transition-all duration-300"
                />
                <button
                  type="button"
                  onClick={() => setShowAdminPassword(!showAdminPassword)}
                  className="absolute right-5 text-white/60 hover:text-white transition-colors duration-200"
                >
                  {showAdminPassword ? (
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
              {fieldErrors.admin && (
                <p className="text-[14px] text-red-400 pl-4 mt-1">{fieldErrors.admin}</p>
              )}
            </div>

            {/* Admin Giriş Butonu */}
            <button
              type="submit"
              className="max-w-[220px] w-full mx-auto block bg-primary hover:bg-primary-dark active:scale-95 text-white font-bold py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-primary/30 font-sans tracking-wide mt-2 text-[18px]"
            >
              {t('login_button_admin', 'Giriş Yap')}
            </button>

            {/* Kullanıcı Girişine Dönüş Butonu */}
            <button
              type="button"
              onClick={() => {
                setIsAdminMode(false);
                setAdminPassword('');
                setFieldErrors({ email: '', password: '', admin: '' });
              }}
              className="text-center text-sm text-white/60 hover:text-white transition-colors duration-200 mt-2 hover:underline"
            >
              {t('back_to_user_login', 'Kullanıcı Girişine Geri Dön')}
            </button>
          </form>
        ) : (
          /* NORMAL KULLANICI GİRİŞ FORMU */
          <form onSubmit={handleUserSubmit} className="flex flex-col gap-6">
            {/* Email */}
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
                  onChange={(e) => handleInputChange('email', e.target.value, setEmail)}
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

            {/* Şifre */}
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
                  onChange={(e) => handleInputChange('password', e.target.value, setPassword)}
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

            {/* Hatırla & Şifremi Unuttum */}
            <div className="flex items-center justify-between px-2">
              <label className="flex items-center text-[15px] text-white/80 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="mr-2 rounded border-white/20 bg-black/30 text-primary focus:ring-0 focus:ring-offset-0 w-4 h-4 accent-primary"
                />
                {t('remember_me')}
              </label>
              <Link
                to="/forgot-password"
                className="text-[15px] text-white/80 hover:text-white hover:underline transition-colors duration-200"
              >
                {t('forgot_password')}
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="max-w-[220px] w-full mx-auto block bg-primary hover:bg-primary-dark active:scale-95 text-white font-bold py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-primary/30 font-sans tracking-wide mt-4 text-[18px]"
            >
              {t('login_button')}
            </button>
          </form>
        )}

        {/* ALT ALAN (Kayıt ol & Admin olarak giriş yap) */}
        {!isAdminMode && (
          <div className="mt-8 text-center flex flex-col gap-4">
            <p className="text-[16px] text-white/60">
              {t('no_account')}{' '}
              <Link
                to="/signup"
                className="text-[#0096c7] hover:text-[#023e8a] font-semibold hover:underline transition-colors duration-200"
              >
                {t('signup_link')}
              </Link>
            </p>

            <div className="flex items-center justify-center gap-2 px-10">
              <span className="h-[1px] flex-1 bg-white/10"></span>
              <span className="text-[12px] text-white/30 uppercase tracking-wider">
                {t('or', 'or')}
              </span>
              <span className="h-[1px] flex-1 bg-white/10"></span>
            </div>

            {/* Admin Modunu Aktif Eden Buton */}
            <button
              type="button"
              onClick={() => {
                setIsAdminMode(true);
                setFieldErrors({ email: '', password: '', admin: '' });
              }}
              className="text-[15px] text-[#f07c24] hover:text-[#f07c24]/80 font-bold transition-all duration-200 hover:underline tracking-wide self-center"
            >
              {t('admin_login_link', 'Admin olarak giriş yap')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}