import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  PanelLeftClose,
  Plus,
  Search,
  MessageSquare,
  Clock,
  Settings,
  ChevronDown,
  Check,
  ListFilter
} from 'lucide-react';
import SannyLogo from './SannyLogo';

export default function ChatSidebar({
  isOpen,
  setIsOpen,
  onNewChat
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const isChatActive = location.pathname.startsWith('/chat');
  const isAppointmentsActive = location.pathname === '/appointments';

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('None');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

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

  // Mock sessions
  const initialSessions = [
    { id: 1, title: 'Cancellation & Refund Procedures', category: 'General SOP', date: '2026-07-07' },
    { id: 2, title: 'Titanic Hotel Reservation Cancellation', category: 'Hotel', date: '2026-07-06' },
    { id: 3, title: 'THY Ticket Change Rules', category: 'Flight', date: '2026-07-05' },
    { id: 4, title: 'VIP Transfer Voucher Delay', category: 'Transfer', date: '2026-07-04' }
  ];

  // Filtering logic
  const filteredSessions = initialSessions
    .filter(session => {
      // Search text query
      const matchesSearch = session.title.toLowerCase().includes(searchQuery.toLowerCase());

      // Category dropdown filter
      if (activeFilter === 'Hotels') {
        return matchesSearch && session.category === 'Hotel';
      }
      if (activeFilter === 'Flights') {
        return matchesSearch && session.category === 'Flight';
      }
      // None/Date shows all, we handle sorting/filtering below
      return matchesSearch;
    })
    .sort((a, b) => {
      if (activeFilter === 'Date') {
        return new Date(b.date) - new Date(a.date);
      }
      return 0;
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
  const displayUsername = username.includes('@') ? username.split('@')[0] : username;

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
            if (onNewChat) onNewChat(); // Eğer fonksiyon varsa tetikle
          }}
          className="flex items-center gap-1.5 select-none focus:outline-none cursor-pointer text-left hover:opacity-90 active:scale-95 transition-all"
          title="Start New Chat"
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
            if (onNewChat) onNewChat(); // Eğer fonksiyon varsa tetikle
          }}
          className="flex items-center gap-1.5 text-[#0B5FFF] hover:text-[#0B5FFF]/80 hover:underline text-sm font-semibold transition-all duration-150 focus:outline-none cursor-pointer"
        >
          <Plus size={16} />
          <span>New Chat</span>
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
            placeholder="Search chats"
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
          Maın Navıgatıon
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
            <span>Chats</span>
          </button>

          <button
            onClick={() => navigate('/appointments')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors focus:outline-none cursor-pointer ${isAppointmentsActive
              ? 'bg-slate-100 text-primary'
              : 'text-text-secondary hover:bg-slate-50 hover:text-text-primary'
              }`}
          >
            <Clock size={16} />
            <span>Past Appointments</span>
          </button>
        </nav>
      </div>

      {/* 5. Recent Chats Section Header */}
      <div className="flex flex-col flex-1 min-h-0">
        <div className="bg-transparent text-[#0B5FFF] text-[11px] font-bold uppercase tracking-wider px-5 py-2 flex items-center justify-between">
          <span>Recent Chats</span>

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
            filteredSessions.map((session) => (
              <div
                key={session.id}
                onClick={() => navigate('/chat')}
                className="p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-all border border-transparent hover:border-slate-100 group"
              >
                <p className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors truncate" title={session.title}>
                  {session.title}
                </p>
                <div className="mt-1.5 flex items-center justify-between">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getBadgeStyle(session.category)}`}>
                    {session.category}
                  </span>
                  <span className="text-[10px] text-text-secondary font-medium">
                    {session.date}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-text-secondary text-center py-6">No recent chats match</p>
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
            <span className="text-[10px] text-text-secondary uppercase tracking-wider font-bold">
              Agent
            </span>
          </div>
        </div>

        {/* Ayarlar Butonu Güncellemesi */}
        <button
          onClick={() => navigate('/settings')} // Tıklanınca /settings rotasına gider
          className={`p-2 rounded-lg transition-colors focus:outline-none ml-2 ${location.pathname === '/settings'
            ? 'bg-slate-100 text-primary' // Eğer ayarlar sayfasındaysak aktif stili uygula
            : 'text-text-secondary hover:bg-slate-100 hover:text-text-primary'
            }`}
          title="Settings"
        >
          <Settings size={18} />
        </button>
      </div>
    </div>
  );
}
