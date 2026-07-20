import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sun, Moon } from 'lucide-react';
import SannyLogo from '../components/SannyLogo';
import LanguageSelector from '../components/LanguageSelector';
import api from '../services/api';
import { useTheme } from '../components/ThemeContext';

export default function ForgotPasswordPage() {
    const { t } = useTranslation();
    const { theme, toggleTheme } = useTheme();

    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.load();
            videoRef.current.play().catch(err => console.log("Video oynatılamadı:", err));
        }
    }, [theme]);
    const [email, setEmail] = useState('');
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
        setSuccess(false);

        if (!email.trim()) {
            setError(t('required_error'));
            return;
        }

        setLoading(true);
        try {
            // Backend POST isteği
            await api.post('/api/auth/forgot-password', { email });
            setSuccess(true);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "An error occurred. Please make sure the email is correct."
            );
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

            {/* Katman 3 (z-20): Form Panel */}
            <div className="relative z-20 w-full max-w-[550px] bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-[32px] shadow-2xl p-10 md:p-12 animate-fade-in">
                <div className="text-center mb-8">
                    <h1 className="text-[34px] md:text-[40px] font-bold tracking-tight text-slate-900 dark:text-white mb-2 font-display">
                        {t('forgot_password_title')}
                    </h1>
                    <p className="text-[16px] md:text-[18px] text-slate-600 dark:text-slate-300">
                        {t('forgot_password_subtitle')}
                    </p>
                </div>

                {success ? (
                    <div className="text-center flex flex-col gap-6">
                        <p className="text-emerald-600 dark:text-emerald-400 font-semibold text-[16px] bg-emerald-500/10 py-3 px-4 rounded-xl border border-emerald-500/20">
                            {t('forgot_password_check_email')}
                        </p>
                        <Link to="/login" className="text-slate-700 dark:text-white hover:underline text-[16px] transition-colors duration-200 font-medium">
                            {t('forgot_password_back_login')}
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        {/* E-posta Giriş Alanı */}
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
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={t('email_placeholder')}
                                    className="w-full bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200/80 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-full pl-12 pr-6 py-4 text-[16px] text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-300"
                                />
                            </div>
                            {error && (
                                <p className="text-[14px] text-red-500 pl-4 mt-1">{error}</p>
                            )}
                        </div>

                        {/* Bağlantı Gönderme Butonu */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="max-w-[220px] w-full mx-auto block bg-primary hover:bg-primary-dark active:scale-95 text-white font-bold py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-primary/30 font-sans tracking-wide mt-4 text-[18px] disabled:opacity-50"
                        >
                            {loading ? t('forgot_password_sending') : t('forgot_password_send_btn')}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}