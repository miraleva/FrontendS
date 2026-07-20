import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SannyLogo from '../components/SannyLogo';
import LanguageSelector from '../components/LanguageSelector';
import api from '../services/api';

export default function ResetPasswordPage() {
    const { t } = useTranslation();
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
        <div className="min-h-screen flex items-center justify-center px-4 relative z-10 font-sans">
            {/* Sol üstteki ortak logo */}
            <SannyLogo />

            {/* Sağ üstteki dil değiştirme seçeneği */}
            <LanguageSelector />

            {/* Arka Plan Video Konteyneri */}
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

            {/* Karartma Katmanı */}
            <div className="fixed inset-0 w-screen h-screen bg-black/40 dark:bg-black/70 -z-10" />

            {/* Glassmorphism Panel */}
            <div className="w-full max-w-[550px] bg-white/5 dark:bg-slate-900/90 backdrop-blur-sm dark:backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-[32px] shadow-2xl p-10 md:p-12 animate-fade-in">
                <div className="text-center mb-8">
                    <h1 className="text-[34px] md:text-[40px] font-bold tracking-tight text-white mb-2 font-display">
                        {t('reset_password_title')}
                    </h1>
                    <p className="text-[16px] md:text-[18px] text-white/80">
                        {t('reset_password_subtitle')}
                    </p>
                </div>

                {success ? (
                    <div className="text-center flex flex-col gap-6">
                        <p className="text-emerald-400 font-semibold text-[16px] bg-emerald-500/10 py-3 px-4 rounded-xl border border-emerald-500/20">
                            {t('reset_password_success')}
                        </p>
                        <Link to="/login" className="text-white hover:underline text-[16px] transition-colors duration-200">
                            {t('reset_password_redirect_manual')}
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        {/* Yeni Şifre Giriş Alanı */}
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
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder={t('reset_password_placeholder_new')}
                                    maxLength={30}
                                    className="w-full bg-black/30 hover:bg-black/40 border border-white/10 rounded-full pl-12 pr-6 py-4 text-[16px] text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-black/50 transition-all duration-300"
                                />
                            </div>
                        </div>

                        {/* Yeni Şifre Onay Giriş Alanı */}
                        <div className="flex flex-col gap-2">
                            <label htmlFor="confirmPassword" className="text-[15px] font-semibold text-white/90 uppercase tracking-wider pl-4">
                                {t('reset_password_confirm_label')}
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
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder={t('reset_password_placeholder_confirm')}
                                    maxLength={30}
                                    className="w-full bg-black/30 hover:bg-black/40 border border-white/10 rounded-full pl-12 pr-6 py-4 text-[16px] text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-black/50 transition-all duration-300"
                                />
                            </div>
                            {error && (
                                <p className="text-[14px] text-red-400 pl-4 mt-1">{error}</p>
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