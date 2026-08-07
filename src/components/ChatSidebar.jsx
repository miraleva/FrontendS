import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  PanelLeftClose,
  Plus,
  Search,
  MessageSquare,
  Clock,
  Settings,
  ChevronDown,
  Check,
  Trash2,
  Sun,
  Moon,
  LogIn,
  Heart
} from 'lucide-react';
import SannyLogo from './SannyLogo';
import LanguageSelector from './LanguageSelector';
import api from '../services/api';
import { useTheme } from './ThemeContext.jsx';
import { useAuth } from './AuthContext';
import { useFavorites } from './FavoritesContext';


export default function ChatSidebar({
  isOpen,
  setIsOpen,
  onNewChat
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { isGuest, user } = useAuth();
  const { favoritesCount } = useFavorites();

  const isChatActive = location.pathname.startsWith('/chat');
  const isFavoritesActive = location.pathname === '/favorites';
  const isAppointmentsActive = location.pathname === '/past-reservations';

  const [searchQuery, setSearchQuery] = useState('');

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState(null);

  const [sessions, setSessions] = useState([]);

  const fetchSessions = async () => {
    // Misafirlik bilgisini localStorage/sessionStorage yerine AuthContext'ten al.
    // Login sonrasında storage'da eski `isGuest=true` değeri kalırsa
    // Son Sohbetler listesinin yanlışlıkla boşaltılmasını önler.
    if (isGuest) {
      setSessions([]);
      return;
    }

    try {
      const response = await api.get('/api/chat/sessions');
      const sessionList = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.sessions)
          ? response.data.sessions
          : [];

      setSessions(sessionList);
    } catch (err) {
      console.error("Failed to fetch chat sessions", err);
      setSessions([]);
    }
  };

  const handleDeleteClick = (e, sessionId) => {
    e.stopPropagation();
    setSessionToDelete(sessionId);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteSession = async () => {
    if (!sessionToDelete) return;

    try {
      await api.delete(`/api/chat/sessions/${sessionToDelete}`);
      fetchSessions();

      const params = new URLSearchParams(location.search);
      if (params.get('sessionId') === sessionToDelete) {
        navigate('/chat');
      }
    } catch (err) {
      console.error("Failed to delete chat session", err);
    } finally {
      setIsDeleteModalOpen(false);
      setSessionToDelete(null);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [location.key, isGuest, user?.id, user?.email]);

  useEffect(() => {
    const refreshSessions = () => {
      fetchSessions();
    };

    window.addEventListener("chatSessionsUpdated", refreshSessions);

    return () => {
      window.removeEventListener(
        "chatSessionsUpdated",
        refreshSessions
      );
    };
  }, [isGuest, user?.id, user?.email]);

  const formatTimestamp = (ts) => {
    if (!ts) return '';
    try {
      const d = new Date(ts);
      return d.toLocaleDateString();
    } catch (e) {
      return '';
    }
  };

  const cleanForSearch = (str) => {
    if (!str) return '';
    return String(str).toLowerCase().replace(/[^a-z0-9]/g, '');
  };

  const getDerivedFlightNo = (session) => {
    const directNo = session.flightNumber || session.flightNo || session.flightCode;
    if (directNo) return directNo;

    const title = String(session.title || '').toLowerCase();
    const isFlight = title.includes('ajet') || title.includes('vf') || title.includes('ucak') || title.includes('uçuş') || title.includes('flight') || title.includes('ist') || title.includes('ayt');
    if (!isFlight) return '';

    let prefix = 'VF';
    if (title.includes('pegasus')) prefix = 'PC';
    else if (title.includes('thy') || title.includes('turkish')) prefix = 'TK';

    const pnrDigits = String(session.reservationNumber || session.pnrCode || session.id || '').replace(/\D/g, '');
    const num = pnrDigits.length >= 2 ? (Math.abs(parseInt(pnrDigits.slice(-4), 10)) % 8999) : 2024;
    return `${prefix}-${1000 + num}`;
  };

  const filteredSessions = sessions
    .filter(session => {
      if (!searchQuery.trim()) return true;
      const cleanQuery = cleanForSearch(searchQuery);

      const cleanTitle = cleanForSearch(session.title || '');
      if (cleanTitle.includes(cleanQuery)) return true;

      const cleanSnippet = cleanForSearch(session.snippet || session.lastMessage || '');
      if (cleanSnippet.includes(cleanQuery)) return true;

      const resNo = session.reservationNumber || session.pnrCode || session.pnr;
      if (resNo && cleanForSearch(resNo).includes(cleanQuery)) return true;

      const flightNo = getDerivedFlightNo(session);
      const cleanFlightNo = cleanForSearch(flightNo);
      if (cleanFlightNo && (cleanFlightNo.includes(cleanQuery) || cleanQuery.includes(cleanFlightNo))) return true;

      return false;
    })
    .sort((a, b) => {
      const tA = a.lastMessageTimestamp ? new Date(a.lastMessageTimestamp) : 0;
      const tB = b.lastMessageTimestamp ? new Date(b.lastMessageTimestamp) : 0;
      return tB - tA;
    });

  const username = user?.email || localStorage.getItem('userId') || sessionStorage.getItem('userId') || 'User';
  const profileFullName = user && (user.firstName || user.lastName)
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
    : null;
  const displayUsername = profileFullName || (username.includes('@') ? username.split('@')[0] : username);

  const closeMobileSidebar = () => {
    setIsOpen(false);
  };

  const handleNav = (path, callback) => {
    if (path) navigate(path);
    if (callback) callback();
    closeMobileSidebar();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-40 animate-fade-in"
          aria-hidden="true"
        />
      )}

      <div
        className={`h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col flex-shrink-0 transition-all duration-300 overflow-hidden 
          fixed md:relative left-0 top-0 z-50 md:z-30 shadow-2xl md:shadow-none
          ${isOpen ? 'w-[85%] sm:w-[320px] md:w-[340px] translate-x-0' : 'w-0 -translate-x-full md:translate-x-0 border-r-0'}
        `}
      >
        {/* 1. Top Row (Logo Alanı) */}
        <div className="p-4 flex items-center justify-between border-b border-transparent">
          <button
            onClick={() => {
              handleNav('/chat', onNewChat);
            }}
            className="flex items-center gap-1.5 select-none focus:outline-none cursor-pointer text-left hover:opacity-90 active:scale-95 transition-all"
            title={t('sidebar_new_chat')}
          >
            <SannyLogo
              className="flex items-center gap-1.5"
              imgClassName="w-8 h-8 object-contain"
              textClassName="font-display font-black text-[#f07c24] text-[22px] tracking-widest drop-shadow-[0_1.5px_6px_rgba(240,124,36,0.25)]"
            />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 focus:outline-none cursor-pointer"
            title="Collapse Sidebar"
          >
            <PanelLeftClose size={18} />
          </button>
        </div>

        {/* 2. New Chat Button */}
        <div className="px-5 pt-4 flex justify-start">
          <button
            onClick={() => {
              sessionStorage.removeItem('guestSessionId');
              handleNav('/chat', onNewChat);
            }}
            className="flex items-center gap-1.5 text-[#0B5FFF] dark:text-[#3b82f6] hover:text-[#0B5FFF]/80 dark:hover:text-[#3b82f6]/80 hover:underline text-sm font-semibold transition-all duration-150 focus:outline-none cursor-pointer"
          >
            <Plus size={16} />
            <span>{t('sidebar_new_chat')}</span>
          </button>
        </div>

        {/* 3. Search Input — Misafirlere gösterilmez */}
        {!isGuest && (
          <div className="px-5 py-3">
            <div className="relative flex items-center border-b border-transparent focus-within:border-slate-300 dark:focus-within:border-slate-600 transition-all duration-150">
              <span className="absolute left-0 text-slate-400 dark:text-slate-500">
                <Search size={16} />
              </span>
              <input
                type="text"
                placeholder={t('sidebar_search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => handleNav('/chat/search')}
                className="w-full bg-transparent pl-7 pr-2 py-1.5 text-sm text-text-primary dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none transition-all cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* 4. Main Nav Section */}
        <div className="flex flex-col">
          <div className="bg-transparent text-[#0B5FFF] dark:text-[#3b82f6] text-[11px] font-bold uppercase tracking-wider px-5 py-2">
            {t('sidebar_main_navigation')}
          </div>
          <nav className="flex flex-col gap-1 p-2">
            <button
              onClick={() => handleNav('/chat')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors focus:outline-none cursor-pointer ${isChatActive
                ? 'bg-slate-100 dark:bg-slate-800 text-primary dark:text-blue-400'
                : 'text-text-secondary dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-text-primary dark:hover:text-slate-200'
                }`}
            >
              <MessageSquare size={16} />
              <span>{t('sidebar_chats')}</span>
            </button>

            <button
              onClick={() => handleNav('/favorites')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors focus:outline-none cursor-pointer ${isFavoritesActive
                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold border border-rose-200 dark:border-rose-800/60'
                : 'text-text-secondary dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-text-primary dark:hover:text-slate-200'
                }`}
            >
              <div className="flex items-center gap-3">
                <Heart size={16} className={favoritesCount > 0 ? "fill-rose-500 text-rose-500" : ""} />
                <span>{t('sidebar_favorites', 'Favorilerim')}</span>
              </div>
              {favoritesCount > 0 && (
                <span className="flex items-center justify-center bg-rose-500 text-white font-extrabold text-xs rounded-full px-2 py-0.5 min-w-[20px] shadow-xs">
                  {favoritesCount}
                </span>
              )}
            </button>

            {/* Misafirler için Randevular gizli */}
            {!isGuest && (
              <button
                onClick={() => handleNav('/past-reservations')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors focus:outline-none cursor-pointer ${isAppointmentsActive
                  ? 'bg-slate-100 dark:bg-slate-800 text-primary dark:text-blue-400'
                  : 'text-text-secondary dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-text-primary dark:hover:text-slate-200'
                  }`}
              >
                <Clock size={16} />
                <span>{t('sidebar_appointments')}</span>
              </button>
            )}
          </nav>
        </div>

        {/* 5. Recent Chats Section — Misafirlere gösterilmez */}
        {!isGuest && (
          <div className="flex flex-col flex-1 min-h-0">
            <div className="bg-transparent text-[#0B5FFF] dark:text-[#3b82f6] text-[11px] font-bold uppercase tracking-wider px-5 py-2 flex items-center justify-between">
              <span>{t('sidebar_recent_chats')}</span>
            </div>

            {/* 6. Recent Chats Session List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredSessions.length > 0 ? (
                filteredSessions.map((session) => {
                  return (
                    <div
                      key={session.id}
                      onClick={() => handleNav(`/chat?sessionId=${session.id}`)}
                      className="p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-800 group relative flex flex-col gap-1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-text-primary dark:text-slate-200 group-hover:text-primary dark:group-hover:text-blue-400 transition-colors truncate flex-1" title={session.title}>
                          {session.title || 'Chat Session'}
                        </p>
                        <button
                          onClick={(e) => handleDeleteClick(e, session.id)}
                          className="p-1 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded transition-all duration-150 cursor-pointer flex-shrink-0"
                          title={t('Delete Chat')}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      <div className="flex items-end justify-end">
                        <span className="text-[10px] text-text-secondary dark:text-slate-400 font-medium whitespace-nowrap leading-none">
                          {formatTimestamp(session.lastMessageTimestamp)}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-text-secondary dark:text-slate-500 text-center py-6">{t('sidebar_no_matches')}</p>
              )}
            </div>
          </div>
        )}

        {/* Misafir için esneme alanı (recent chats olmadığında boşluğu doldur) */}
        {isGuest && <div className="flex-1" />}

        {/* 7. Divider Line */}
        <hr className="border-border dark:border-slate-800 mx-4" />

        {/* 8. Bottom Footer */}
        <div className="p-3 flex items-center justify-between gap-1">
          {/* Profil alanı: misafirler için /login yönlendirmesi */}
          <div
            onClick={() => handleNav(isGuest ? '/login' : '/profile')}
            className={`flex items-center gap-2.5 cursor-pointer p-1.5 rounded-lg transition-colors min-w-0 flex-1 ${!isGuest && location.pathname === '/profile'
              ? 'bg-slate-100 dark:bg-slate-800'
              : 'hover:bg-slate-100/80 dark:hover:bg-slate-800/80'
              }`}
            title={isGuest ? t('guest.loginTitle', 'Giriş Yap / Kayıt Ol') : t('profile_settings', 'View Profile')}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-sm flex-shrink-0 select-none ${isGuest
              ? 'bg-amber-100 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400'
              : 'bg-primary/10 dark:bg-blue-500/10 border border-primary/20 dark:border-blue-500/20 text-primary dark:text-blue-400'
              }`}>
              {isGuest ? '?' : displayUsername.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0">
              <span className={`text-xs font-semibold truncate max-w-[80px] ${isGuest
                ? 'text-amber-700 dark:text-amber-400'
                : 'text-text-primary dark:text-slate-200'
                }`} title={isGuest ? t('guest.guestUserTitle', 'Misafir') : displayUsername}>
                {isGuest ? t('guest.guestUserTitle', 'Misafir') : displayUsername}
              </span>
              {isGuest && (
                <span className="text-[10px] text-amber-600 dark:text-amber-500 font-medium">
                  {t('guest.loginAction', 'Giriş Yap →')}
                </span>
              )}
            </div>
          </div>

          {/* Dil Seçimi (LanguageSelector - Dropup) */}
          <LanguageSelector direction="up" className="relative" align="left" />

          {/* Tema Değiştirme Butonu */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-text-secondary dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary dark:hover:text-orange-400 transition-colors focus:outline-none cursor-pointer flex-shrink-0"
            title={theme === 'light' ? t('theme_dark') : t('theme_light')}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {/* Ayarlar Butonu — Misafirlere gösterilmez */}
          {!isGuest && (
            <button
              onClick={() => handleNav('/settings')}
              className={`p-2 rounded-lg transition-colors focus:outline-none flex-shrink-0 ${location.pathname === '/settings'
                ? 'bg-slate-100 dark:bg-slate-800 text-primary dark:text-orange-400'
                : 'text-text-secondary dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary dark:hover:text-orange-400'
                }`}
              title="Settings"
            >
              <Settings size={18} />
            </button>
          )}
        </div>

        {/* Modal Kısmı */}
        {isDeleteModalOpen && createPortal(
          <div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-[99999] animate-fade-in p-4"
            onClick={() => {
              setIsDeleteModalOpen(false);
              setSessionToDelete(null);
            }}
          >
            <div
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-200 dark:border-slate-800 w-full max-w-[360px] p-6 text-center transform scale-100 transition-all"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-orange-100 dark:bg-orange-950/50 mb-4">
                <Trash2 className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>

              {/* YENİ: text-slate-800 dark:text-slate-200 */}
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">
                {t('delete_chat_title', 'Sohbeti Sil')}
              </h3>

              {/* YENİ: text-slate-500 dark:text-slate-400 */}
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed px-2">
                {t('delete_chat_confirm_message', 'Bu sohbeti silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')}
              </p>

              <div className="flex items-center gap-3 w-full">
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setSessionToDelete(null);
                  }}
                  // YENİ: bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300
                  className="flex-1 py-3 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors focus:outline-none cursor-pointer"
                >
                  {t('cancel', 'İptal')}
                </button>
                <button
                  onClick={confirmDeleteSession}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold bg-orange-600 hover:bg-orange-700 text-white shadow-md hover:shadow-lg transition-all focus:outline-none cursor-pointer"
                >
                  {t('delete', 'Sil')}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    </>
  );
}