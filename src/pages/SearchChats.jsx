import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { 
  PanelLeftOpen, 
  Search, 
  ChevronRight,
  Loader2,
  MessageSquare
} from "lucide-react";
import ChatSidebar from "../components/ChatSidebar";
import { useTheme } from "../components/ThemeContext";
import api from "../services/api";

export default function SearchChats() {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 768);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(err => console.log("Video playback error:", err));
    }
  }, [theme]);

  // Debounce search query changes
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch chat sessions from API
  const fetchSessions = async (query = "") => {
    const isGuest = localStorage.getItem('isGuest') === 'true' || sessionStorage.getItem('isGuest') === 'true';
    if (isGuest) {
      setSessions([]);
      return;
    }
    setIsLoading(true);
    try {
      const response = await api.get('/api/chat/sessions', {
        params: query ? { query } : {}
      });
      setSessions(response.data || []);
    } catch (err) {
      console.error("Failed to search chat sessions", err);
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions(debouncedQuery);
  }, [debouncedQuery]);

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

  const filteredSessions = sessions.filter(session => {
    if (!debouncedQuery.trim()) return true;
    const cleanQuery = cleanForSearch(debouncedQuery);

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
  });

  const getChatCategory = (session) => {
    const title = (session?.title || '').toLowerCase();
    const snippet = (session?.snippet || '').toLowerCase();
    const combined = `${title} ${snippet}`;

    if (
      combined.includes('uçak') || 
      combined.includes('uçuş') || 
      combined.includes('bilet') || 
      combined.includes('flight') || 
      combined.includes('havayolu') ||
      combined.includes('havalimanı') ||
      combined.includes('gidiş') ||
      combined.includes('dönüş')
    ) {
      return 'Flight';
    }

    if (
      combined.includes('otel') || 
      combined.includes('hotel') || 
      combined.includes('konaklama') || 
      combined.includes('oda') || 
      combined.includes('resort') || 
      combined.includes('pansiyon')
    ) {
      return 'Hotel';
    }

    if (
      combined.includes('transfer') || 
      combined.includes('servis') || 
      combined.includes('taksi') || 
      combined.includes('shuttle')
    ) {
      return 'Transfer';
    }

    if (session?.category && ['Hotel', 'Flight', 'Transfer', 'General SOP'].includes(session.category)) {
      return session.category;
    }

    return 'General SOP';
  };

  const getCategoryLabel = (category) => {
    switch (category) {
      case 'Hotel':
        return t('search_chats.category_hotel', 'Hotel');
      case 'Flight':
        return t('search_chats.category_flight', 'Flight');
      case 'Transfer':
        return t('search_chats.category_transfer', 'Transfer');
      default:
        return t('search_chats.category_sop', 'General SOP');
    }
  };

  const getBadgeStyle = (category) => {
    switch (category) {
      case 'Hotel':
        return 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900/50';
      case 'Flight':
        return 'bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 border border-purple-100 dark:border-purple-900/50';
      case 'Transfer':
        return 'bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-300 border border-teal-100 dark:border-teal-900/50';
      case 'General SOP':
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700';
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    try {
      const d = new Date(timestamp);
      return d.toLocaleDateString(i18n.language || 'tr-TR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return timestamp;
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-transparent font-sans relative">
      {/* Background Video */}
      <video
        ref={videoRef}
        src={theme === 'dark' ? "/videos/darkmode_bg.mp4" : "/videos/chatbot_bg.mp4"}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="fixed inset-0 w-full h-full object-cover z-0 pointer-events-none"
      />

      {/* Overlay Mask */}
      <div className="fixed inset-0 z-10 pointer-events-none bg-white/20 dark:bg-slate-950/60" />

      {/* Sidebar */}
      <ChatSidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
        currentView="chat"
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative overflow-y-auto bg-transparent z-20">
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="fixed top-4 left-4 z-40 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-md text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200 transition-all cursor-pointer"
            title="Open Sidebar"
          >
            <PanelLeftOpen size={18} />
          </button>
        )}

        <div className="flex-1 p-4 pt-16 sm:p-6 md:p-10 max-w-4xl mx-auto w-full animate-fade-in z-20 relative">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#0F172A] dark:text-slate-100 font-display mb-2">
              {t('search_chats.title', 'Search Chats')}
            </h1>
            <p className="text-text-secondary dark:text-slate-400 text-sm">
              {t('search_chats.subtitle', 'Search across your active, recent, and archived chat sessions.')}
            </p>
          </div>

          {/* Search Box */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm mb-6 flex items-center gap-3">
            {isLoading ? (
              <Loader2 className="text-primary animate-spin" size={20} />
            ) : (
              <Search className="text-slate-400 dark:text-slate-500" size={20} />
            )}
            <input 
              type="text" 
              placeholder={t('search_chats.placeholder', 'Search by keyword, hotel name, flight code...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-text-primary dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none text-base font-medium"
              autoFocus
            />
          </div>

          {/* Results List */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
            {filteredSessions.length > 0 ? (
              filteredSessions.map((session) => {
                const category = getChatCategory(session);
                return (
                  <div 
                    key={session.id}
                    onClick={() => navigate(`/chat?sessionId=${session.id}`)}
                    className="p-5 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <MessageSquare size={16} className="text-slate-400 dark:text-slate-500 group-hover:text-primary transition-colors flex-shrink-0" />
                        <h3 className="font-bold text-[#0F172A] dark:text-slate-100 group-hover:text-primary transition-colors text-base truncate pr-4">
                          {session.title || 'Untitled Session'}
                        </h3>
                      </div>
                      
                      {session.snippet && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 pl-6">
                          {session.snippet}
                        </p>
                      )}

                      <div className="flex items-center gap-3 pl-6 pt-0.5">
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${getBadgeStyle(category)}`}>
                          {getCategoryLabel(category)}
                        </span>
                        {session.lastMessageTimestamp && (
                          <span className="text-xs text-text-secondary dark:text-slate-400">
                            {t('search_chats.last_active', 'Last active: {{date}}', { date: formatDate(session.lastMessageTimestamp) })}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center text-slate-400 dark:text-slate-500 group-hover:text-primary transition-all pr-1 ml-4">
                      <ChevronRight size={20} className="transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-12 text-center text-slate-400 dark:text-slate-500">
                <p className="text-sm">
                  {debouncedQuery
                    ? t('search_chats.no_results_query', 'Aranan ifadeye uygun sohbet bulunamadı: "{{query}}"', { query: debouncedQuery })
                    : t('search_chats.no_results', 'No chat sessions found matching your search.')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
