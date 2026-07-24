import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sun, Moon } from 'lucide-react';
import SannyLogo from '../components/SannyLogo';
import LanguageSelector from '../components/LanguageSelector';
import api from '../services/api';
import { useTheme } from '../components/ThemeContext';

export default function ResetPasswordPage() {
    const { t } = useTranslation();
    const { theme, toggleTheme } = useTheme();

    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.play().catch(err => console.log("Video oynatılamadı:", err));
        }
    }, []);
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token'); // URL'den token'ı alıyoruz
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    // Arka plan videosunun kesintisiz dönebilmesi için zaman güncelleme yöneticisi
    const handleTimeUpdate = (e) => {
        const video = e.target;
        if (video.duration && video.currentTime >= video.duration - 0.15) {
            video.currentTime = 0;
            video.play().catch(() => { });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Karakter uzunluğu kontrolü (Dile duyarlı hata mesajı)
        if (password.length < 6 || password.length > 30) {
            setError(t('reset_password_length_err'));
            return;
        }
        // Eşleşme kontrolü (Dile duyarlı hata mesajı)
        if (password !== confirmPassword) {
            setError(t('reset_password_mismatch_err'));
            return;
        }

        setLoading(true);
        try {
            await api.post('/api/auth/reset-password', { token, password });
            setSuccess(true);
            setTimeout(() => navigate('/login'), 3000); // 3 saniye sonra girişe yönlendir
        } catch (err) {
            setError(err.response?.data?.message || t('reset_password_invalid_token'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 relative font-sans bg-transparent">
            {/* Sol üstteki ortak logo */}
            <SannyLogo />

            {/* Sağ üstteki tema ve dil seçenekleri */}
            <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
                <button
                    type="button"
                    onClick={toggleTheme}
                    className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-amber-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer flex items-center justify-center shadow-lg w-10 h-10"
                    title={theme === 'dark' ? (t('theme_light', 'Aydınlık Mod')) : (t('theme_dark', 'Karanlık Mod'))}
                >
                    {theme === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-slate-700" />}
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

            {/* Katman 2 (z-10): Overlay Mask (No Blur) */}
            <div className="fixed inset-0 z-10 pointer-events-none bg-slate-900/20 dark:bg-slate-950/70" />

            {/* Katman 3 (z-20): Form Panel */}
            <div className="relative z-20 w-full max-w-[550px] bg-white/70 backdrop-blur-md border border-white/40 dark:bg-slate-900/75 dark:border-slate-800/50 rounded-[32px] shadow-2xl p-10 md:p-12 animate-fade-in">
                <div className="text-center mb-8">
                    <h1 className="text-[34px] md:text-[40px] font-bold tracking-tight text-slate-900 dark:text-white mb-2 font-display">
                        {t('reset_password_title')}
                    </h1>
                    <p className="text-[16px] md:text-[18px] text-slate-600 dark:text-slate-300">
                        {t('reset_password_subtitle')}
                    </p>
                </div>

                {success ? (
                    <div className="text-center flex flex-col gap-6">
                        <p className="text-emerald-600 dark:text-emerald-400 font-semibold text-[16px] bg-emerald-500/10 py-3 px-4 rounded-xl border border-emerald-500/20">
                            {t('reset_password_success')}
                        </p>
                        <Link to="/login" className="text-slate-700 dark:text-white hover:underline text-[16px] transition-colors duration-200 font-medium">
                            {t('reset_password_redirect_manual')}
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        {/* Yeni Şifre Giriş Alanı */}
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
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder={t('reset_password_placeholder_new')}
                                    maxLength={30}
                                    className="w-full bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200/80 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-full pl-12 pr-6 py-4 text-[16px] text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-300"
                                />
                            </div>
                        </div>

                        {/* Yeni Şifre Onay Giriş Alanı */}
                        <div className="flex flex-col gap-2">
                            <label htmlFor="confirmPassword" className="text-[15px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider pl-4">
                                {t('reset_password_confirm_label')}
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
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder={t('reset_password_placeholder_confirm')}
                                    maxLength={30}
                                    className="w-full bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200/80 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-full pl-12 pr-6 py-4 text-[16px] text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-300"
                                />
                            </div>
                            {error && (
                                <p className="text-[14px] text-red-500 pl-4 mt-1">{error}</p>
                            )}
                        </div>

                        {/* Şifreyi Kaydet Butonu */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="max-w-[220px] w-full mx-auto block bg-primary hover:bg-primary-dark active:scale-95 text-white font-bold py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-primary/30 font-sans tracking-wide mt-4 text-[18px] disabled:opacity-50"
                        >
                            {loading ? t('forgot_password_sending') : t('reset_password_title')}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}