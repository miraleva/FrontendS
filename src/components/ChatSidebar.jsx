import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom'; // 1. React Portal import ediyoruz
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
  ListFilter,
  Trash2
} from 'lucide-react';
import SannyLogo from './SannyLogo';
import api from '../services/api';

export default function ChatSidebar({
  isOpen,
  setIsOpen,
  onNewChat
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const isChatActive = location.pathname.startsWith('/chat');
  const isAppointmentsActive = location.pathname === '/appointments';

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('None');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Pop-up kontrolü için state'ler
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsFilterDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [sessions, setSessions] = useState([]);

  const fetchSessions = async () => {
    try {
      const response = await api.get('/api/chat/sessions');
      setSessions(response.data);
    } catch (err) {
      console.error("Failed to fetch chat sessions", err);
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
  }, [location.key]);

  useEffect(() => {
    const interval = setInterval(fetchSessions, 5000);
    return () => clearInterval(interval);
  }, []);

  const getVisualCategory = (title) => {
    if (!title) return 'General SOP';
    const t = title.toLowerCase();
    if (t.includes('hotel') || t.includes('titanic') || t.includes('stay')) return 'Hotel';
    if (t.includes('flight') || t.includes('ticket') || t.includes('thy')) return 'Flight';
    if (t.includes('transfer') || t.includes('airport')) return 'Transfer';
    return 'General SOP';
  };

  const formatTimestamp = (ts) => {
    if (!ts) return '';
    try {
      const d = new Date(ts);
      return d.toLocaleDateString();
    } catch (e) {
      return '';
    }
  };

  // Filtering logic
  const filteredSessions = sessions
    .filter(session => {
      const title = session.title || 'Chat Session';
      const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase());
      const category = getVisualCategory(title);

      if (activeFilter === 'Hotels') {
        return matchesSearch && category === 'Hotel';
      }
      if (activeFilter === 'Flights') {
        return matchesSearch && category === 'Flight';
      }
      return matchesSearch;
    })
    .sort((a, b) => {
      const tA = a.lastMessageTimestamp ? new Date(a.lastMessageTimestamp) : 0;
      const tB = b.lastMessageTimestamp ? new Date(b.lastMessageTimestamp) : 0;
      return tB - tA; // Newest first
    });

  const getBadgeStyle = (category) => {
    switch (category) {
      case 'General SOP':
        return 'bg-slate-100 text-slate-700 border border-slate-200';
      case 'Hotel':
        return 'bg-blue-50 text-blue-700 border border-blue-100';
      case 'Flight':
        return 'bg-purple-50 text-purple-700 border border-purple-100';
      case 'Transfer':
        return 'bg-teal-50 text-teal-700 border border-teal-100';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  const username = localStorage.getItem('userId') || 'User';
  let storedUser = null;
  try {
    storedUser = JSON.parse(localStorage.getItem('user') || 'null');
  } catch (e) {
    storedUser = null;
  }
  const profileFullName = storedUser && (storedUser.firstName || storedUser.lastName)
    ? `${storedUser.firstName || ''} ${storedUser.lastName || ''}`.trim()
    : null;
  const displayUsername = profileFullName || (username.includes('@') ? username.split('@')[0] : username);

  return (
    <div
      className={`h-screen bg-white border-r border-border flex flex-col flex-shrink-0 transition-all duration-300 overflow-hidden relative z-10 ${isOpen ? 'w-[330px]' : 'w-0 border-r-0'
        }`}
    >
      {/* 1. Top Row (Logo Alanı) */}
      <div className="p-4 flex items-center justify-between border-b border-transparent">
        <button
          onClick={() => {
            navigate('/chat');
            if (onNewChat) onNewChat();
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
          className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 hover:text-slate-800 focus:outline-none cursor-pointer"
          title="Collapse Sidebar"
        >
          <PanelLeftClose size={18} />
        </button>
      </div>

      {/* 2. New Chat Button */}
      <div className="px-5 pt-4 flex justify-start">
        <button
          onClick={() => {
            navigate('/chat');
            if (onNewChat) onNewChat();
          }}
          className="flex items-center gap-1.5 text-[#0B5FFF] hover:text-[#0B5FFF]/80 hover:underline text-sm font-semibold transition-all duration-150 focus:outline-none cursor-pointer"
        >
          <Plus size={16} />
          <span>{t('sidebar_new_chat')}</span>
        </button>
      </div>

      {/* 3. Search Input */}
      <div className="px-5 py-3">
        <div className="relative flex items-center border-b border-transparent focus-within:border-slate-300 transition-all duration-150">
          <span className="absolute left-0 text-slate-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder={t('sidebar_search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => navigate('/chat/search')}
            className="w-full bg-transparent pl-7 pr-2 py-1.5 text-sm text-text-primary placeholder-slate-400 focus:outline-none transition-all cursor-pointer"
          />
        </div>
      </div>

      {/* 4. Main Nav Section */}
      <div className="flex flex-col">
        <div className="bg-transparent text-[#0B5FFF] text-[11px] font-bold uppercase tracking-wider px-5 py-2">
          {t('sidebar_main_navigation')}
        </div>
        <nav className="flex flex-col gap-1 p-2">
          <button
            onClick={() => navigate('/chat')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors focus:outline-none cursor-pointer ${isChatActive
              ? 'bg-slate-100 text-primary'
              : 'text-text-secondary hover:bg-slate-50 hover:text-text-primary'
              }`}
          >
            <MessageSquare size={16} />
            <span>{t('sidebar_chats')}</span>
          </button>

          <button
            onClick={() => navigate('/appointments')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors focus:outline-none cursor-pointer ${isAppointmentsActive
              ? 'bg-slate-100 text-primary'
              : 'text-text-secondary hover:bg-slate-50 hover:text-text-primary'
              }`}
          >
            <Clock size={16} />
            <span>{t('sidebar_appointments')}</span>
          </button>
        </nav>
      </div>

      {/* 5. Recent Chats Section Header */}
      <div className="flex flex-col flex-1 min-h-0">
        <div className="bg-transparent text-[#0B5FFF] text-[11px] font-bold uppercase tracking-wider px-5 py-2 flex items-center justify-between">
          <span>{t('sidebar_recent_chats')}</span>

          {/* Dropdown Filter */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
              className="p-1 hover:bg-slate-100 rounded text-[#0B5FFF] transition-all focus:outline-none cursor-pointer"
              title={`Filter: ${activeFilter}`}
            >
              <ListFilter size={14} />
            </button>

            {isFilterDropdownOpen && (
              <div className="absolute right-0 mt-1 w-32 bg-white text-text-primary border border-border rounded-lg shadow-lg py-1 z-50 animate-fade-in font-normal normal-case text-xs">
                {['None', 'Hotels', 'Flights', 'Date'].map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setActiveFilter(option);
                      setIsFilterDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center justify-between transition-colors focus:outline-none"
                  >
                    <span>{option}</span>
                    {activeFilter === option && <Check size={12} className="text-primary" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 6. Recent Chats Session List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredSessions.length > 0 ? (
            filteredSessions.map((session) => {
              const category = getVisualCategory(session.title);
              return (
                <div
                  key={session.id}
                  onClick={() => navigate(`/chat?sessionId=${session.id}`)}
                  className="p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-all border border-transparent hover:border-slate-100 group relative flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors truncate flex-1" title={session.title}>
                      {session.title || 'Chat Session'}
                    </p>
                    <button
                      onClick={(e) => handleDeleteClick(e, session.id)}
                      className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-all duration-150 cursor-pointer flex-shrink-0"
                      title={t('Delete Chat')}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <div className="flex items-end justify-end">
                    <span className="text-[10px] text-text-secondary font-medium whitespace-nowrap leading-none">
                      {formatTimestamp(session.lastMessageTimestamp)}
                    </span>
                  </div>
                  
                  {/* Hayalet kod - badge iptali */}
                  {/* 
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium self-center ${getBadgeStyle(category)}`}>
                    {category}
                  </span> 
                  */}
                </div>
              );
            })
          ) : (
            <p className="text-xs text-text-secondary text-center py-6">{t('sidebar_no_matches')}</p>
          )}
        </div>
      </div>

      {/* 7. Divider Line */}
      <hr className="border-border mx-4" />

      {/* 8. Bottom Footer */}
      <div className="p-4 flex items-center justify-between">
        <div
          onClick={() => navigate('/profile')}
          className={`flex items-center gap-3 cursor-pointer p-1.5 -m-1.5 rounded-lg transition-colors min-w-0 flex-1 ${location.pathname === '/profile' ? 'bg-slate-100' : 'hover:bg-slate-100/80'
            }`}
          title="View Profile"
        >
          <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-sm shadow-sm select-none">
            {displayUsername.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-text-primary truncate max-w-[120px]" title={username}>
              {displayUsername}
            </span>
          </div>
        </div>

        <button
          onClick={() => navigate('/settings')}
          className={`p-2 rounded-lg transition-colors focus:outline-none ml-2 ${location.pathname === '/settings'
            ? 'bg-slate-100 text-primary'
            : 'text-text-secondary hover:bg-slate-100 hover:text-text-primary'
            }`}
          title="Settings"
        >
          <Settings size={18} />
        </button>
      </div>

      {/* ======================================================== */}
      {/* REACT PORTAL ILE EN ÜSTE TAŞINAN MODAL                    */}
      {/* ======================================================== */}
      {isDeleteModalOpen && createPortal(
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[99999] animate-fade-in p-4"
          onClick={() => {
            setIsDeleteModalOpen(false);
            setSessionToDelete(null);
          }}
        >
          <div 
            className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/20 w-full max-w-[360px] p-6 text-center transform scale-100 transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* İkon */}
            <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-orange-100 mb-4">
              <Trash2 className="h-6 w-6 text-orange-600" />
            </div>
            
            <h3 className="text-lg font-bold text-slate-800 mb-2">
              {t('delete_chat_title', 'Sohbeti Sil')}
            </h3>
            
            <p className="text-sm text-slate-500 mb-6 leading-relaxed px-2">
              {t('delete_chat_confirm_message', 'Bu sohbeti silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')}
            </p>
            
            <div className="flex items-center gap-3 w-full">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSessionToDelete(null);
                }}
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors focus:outline-none cursor-pointer"
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
        document.body // Modal'ı doğrudan body elementinin altına yerleştirir
      )}
    </div>
  );
}