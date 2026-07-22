import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sun, Moon, User as UserIcon } from 'lucide-react';
import SannyLogo from '../components/SannyLogo';
import LanguageSelector from '../components/LanguageSelector';
import api from '../services/api';
import { useTheme } from '../components/ThemeContext';
import { useAuth } from '../components/AuthContext';
import { initGoogleAuth, handleOAuthLogin } from '../services/socialAuth';

export default function LoginPage() {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { login, continueAsGuest } = useAuth();
  const navigate = useNavigate();

  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(err => console.log("Video oynatılamadı:", err));
    }
  }, []);

  // Giriş Modları: Kullanıcı Girişi mi, Admin Girişi mi?
  const [isAdminMode, setIsAdminMode] = useState(false);

  // Google SDK Init (Isolation Test)
  useEffect(() => {
    if (!isAdminMode) {
      initGoogleAuth('googleBtnDiv', {
        onSuccess: async (credential) => {
          try {
            setSocialLoading(true);
            setSocialError('');
            console.log("Google ID Token Başarıyla Alındı, backend'e gönderiliyor...");
            const data = await handleOAuthLogin('google', credential);
            if (data && data.token) {
              login(data.user, data.token);
            }
            navigate('/chat');
          } catch (err) {
            console.error('Google backend login error:', err);
            setSocialError(err.response?.data?.message || err.message || t('social_login_error', 'Sosyal giriş sırasında bir hata oluştu'));
          } finally {
            setSocialLoading(false);
          }
        },
        onError: (err) => {
          console.error('Google Auth Init error:', err);
          setSocialError(err.message);
        }
      }, { locale: i18n.language });
    }
  }, [isAdminMode, navigate, t, i18n.language]);

  // Genel Form State'leri
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '', admin: '' });

  // Admin Özel Şifre State'i
  const [adminPassword, setAdminPassword] = useState('');

  // Social login state
  const [socialLoading, setSocialLoading] = useState(false);
  const [socialError, setSocialError] = useState('');

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
      login(data.user, data.token);
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

  // ──────────────────────────────────────────────────────────────────
  // Social Login Handlers (Google Only)
  // ──────────────────────────────────────────────────────────────────

  async function handleGoogleLogin() {
    console.log('[OAuth] Google login button clicked. Current origin (window.location.origin):', window.location.origin);
    setSocialError('');
    setSocialLoading(true);
    try {
      const idToken = await signInWithGoogle({ locale: i18n.language });

      // Hata Yönetimi: Token alımı başarısız ise backend'e istek atmayı engelle
      if (!idToken || typeof idToken !== 'string' || idToken.trim() === '') {
        console.error('[OAuth] Token acquisition failed on frontend. Aborting backend request.');
        setSocialError(t('social_token_error', 'Google token alımı başarısız oldu.'));
        return;
      }

      console.log('[OAuth] ID token successfully retrieved on frontend. Calling backend OAuth endpoint...');
      const data = await handleOAuthLogin('google', idToken);
      if (data && data.token) {
        login(data.user, data.token);
      }
      navigate('/chat');
    } catch (err) {
      if (err.message === 'cancelled') {
        setSocialError(t('social_login_cancelled', 'Giriş iptal edildi'));
      } else {
        console.error('Google login error:', err);
        setSocialError(t('social_login_error', 'Sosyal giriş sırasında bir hata oluştu'));
      }
    } finally {
      setSocialLoading(false);
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
    <div className="min-h-screen flex items-center justify-center px-4 relative font-sans bg-transparent">
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
        src="/videos/background.mp4"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="fixed inset-0 w-full h-full object-cover z-0 pointer-events-none"
      />

      {/* Katman 2 (z-10): Overlay Mask */}
      <div className="fixed inset-0 z-10 pointer-events-none bg-slate-900/20 dark:bg-slate-950/70" />

      {/* Katman 3 (z-20): Form Container */}
      <div className="relative z-20 w-full max-w-[550px] bg-white/70 backdrop-blur-md border border-white/40 dark:bg-slate-900/75 dark:border-slate-800/50 rounded-[32px] shadow-2xl p-10 md:p-12 animate-fade-in">

        {/* BAŞLIK */}
        <div className="text-center mb-8">
          <h1 className="text-[34px] md:text-[40px] font-bold tracking-tight text-slate-900 dark:text-white mb-2 font-display transition-all">
            {isAdminMode ? t('admin_login_title', 'Yönetici Girişi') : t('welcome_title')}
          </h1>
          <p className="text-[16px] md:text-[18px] text-slate-600 dark:text-slate-300">
            {isAdminMode
              ? t('admin_login_subtitle', 'Lütfen devam etmek için admin şifresini giriniz.')
              : renderSubtitle(t('welcome_subtitle'))}
          </p>
        </div>

        {/* ADMIN GİRİŞ FORMU */}
        {isAdminMode ? (
          <form onSubmit={handleAdminSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="adminPassword" className="text-[15px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider pl-4">
                {t('admin_password_label', 'Admin Şifresi')}
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-5 text-slate-400 dark:text-slate-500 pointer-events-none">
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
                  className="w-full bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200/80 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-full pl-12 pr-14 py-4 text-[16px] text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-300"
                />
                <button
                  type="button"
                  onClick={() => setShowAdminPassword(!showAdminPassword)}
                  className="absolute right-5 text-slate-400 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors duration-200"
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
                <p className="text-[14px] text-red-500 pl-4 mt-1">{fieldErrors.admin}</p>
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
              className="text-center text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-200 mt-2 hover:underline"
            >
              {t('back_to_user_login', 'Kullanıcı Girişine Geri Dön')}
            </button>
          </form>
        ) : (
          /* NORMAL KULLANICI GİRİŞ FORMU */
          <form onSubmit={handleUserSubmit} className="flex flex-col gap-6">
            {/* Email */}
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
                  type="text"
                  value={email}
                  onChange={(e) => handleInputChange('email', e.target.value, setEmail)}
                  onBlur={(e) => handleBlur('email', e.target.value)}
                  placeholder={t('email_placeholder')}
                  maxLength={100}
                  className="w-full bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200/80 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-full pl-12 pr-6 py-4 text-[16px] text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-300"
                />
              </div>
              {fieldErrors.email && (
                <p className="text-[14px] text-red-500 pl-4 mt-1">{fieldErrors.email}</p>
              )}
            </div>

            {/* Şifre */}
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
                  value={password}
                  onChange={(e) => handleInputChange('password', e.target.value, setPassword)}
                  onBlur={(e) => handleBlur('password', e.target.value)}
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

            {/* Hatırla & Şifremi Unuttum */}
            <div className="flex items-center justify-between px-2">
              <label className="flex items-center text-[15px] text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="mr-2 rounded border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-primary focus:ring-0 focus:ring-offset-0 w-4 h-4 accent-primary"
                />
                {t('remember_me')}
              </label>
              <Link
                to="/forgot-password"
                className="text-[15px] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:underline transition-colors duration-200 font-medium"
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

            {/* ────────────────── SOSYAL GİRİŞ BÖLÜMÜ (SADECE GOOGLE) ────────────────── */}
            <div className="flex flex-col gap-4 mt-2">
              {/* VEYA Ayırıcı */}
              <div className="flex items-center justify-center gap-3 px-4">
                <span className="h-[1px] flex-1 bg-slate-300/60 dark:bg-slate-600/60"></span>
                <span className="text-[12px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-medium">
                  {t('auth.orContinueWith', 'VEYA ŞUNUNLA DEVAM EDİN')}
                </span>
                <span className="h-[1px] flex-1 bg-slate-300/60 dark:bg-slate-600/60"></span>
              </div>

              {/* Social Login Error Toast */}
              {socialError && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 text-red-600 dark:text-red-400 text-[14px] animate-fade-in">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" x2="12" y1="8" y2="12" />
                    <line x1="12" x2="12.01" y1="16" y2="16" />
                  </svg>
                  <span>{socialError}</span>
                  <button
                    type="button"
                    onClick={() => setSocialError('')}
                    className="ml-auto text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" x2="6" y1="6" y2="18" />
                      <line x1="6" x2="18" y1="6" y2="18" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Google Varsayılan Buton (İzolasyon Testi) */}
              <div className="flex flex-col items-center justify-center w-full min-h-[44px]">
                <div id="googleBtnDiv" className="flex justify-center"></div>
              </div>
            </div>
          </form>
        )}

        {/* ALT ALAN (Kayıt ol & Admin olarak giriş yap) */}
        {!isAdminMode && (
          <div className="mt-8 text-center flex flex-col gap-4">
            <p className="text-[16px] text-slate-600 dark:text-slate-300">
              {t('no_account')}{' '}
              <Link
                to="/signup"
                className="text-[#0096c7] dark:text-cyan-400 hover:text-[#023e8a] dark:hover:text-cyan-300 font-semibold hover:underline transition-colors duration-200"
              >
                {t('signup_link')}
              </Link>
            </p>

            <div className="flex items-center justify-center gap-2 px-10">
              <span className="h-[1px] flex-1 bg-slate-200 dark:bg-slate-700"></span>
              <span className="text-[12px] text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                {t('auth.or', 'VEYA')}
              </span>
              <span className="h-[1px] flex-1 bg-slate-200 dark:bg-slate-700"></span>
            </div>

            <button
              type="button"
              onClick={() => {
                continueAsGuest();
                navigate('/chat');
              }}
              className="w-full py-3 px-4 rounded-xl border border-blue-500/40 bg-blue-50/50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-100/60 dark:hover:bg-blue-900/40 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <UserIcon size={18} />
              {t('auth.continueAsGuest', 'Misafir Olarak Devam Et')}
            </button>

            {/* Admin Modunu Aktif Eden Buton */}
            <button
              type="button"
              onClick={() => {
                setIsAdminMode(true);
                setFieldErrors({ email: '', password: '', admin: '' });
              }}
              className="text-[15px] text-[#f07c24] dark:text-amber-400 hover:text-[#f07c24]/80 dark:hover:text-amber-300 font-bold transition-all duration-200 hover:underline tracking-wide self-center"
            >
              {t('admin_login_link', 'Admin olarak giriş yap')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}