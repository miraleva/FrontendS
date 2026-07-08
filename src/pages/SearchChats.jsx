import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  PanelLeftOpen, 
  Search, 
  ChevronRight 
} from "lucide-react";
import ChatSidebar from "../components/ChatSidebar";

export default function SearchChats() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch(error => {
        console.log("Video autoplay engeline takıldı:", error);
      });
    }
  }, []);

  // Mock sessions
  const mockSessions = [
    { id: 1, title: 'Cancellation & Refund Procedures', category: 'General SOP', date: '2026-07-07' },
    { id: 2, title: 'Titanic Hotel Reservation Cancellation', category: 'Hotel', date: '2026-07-06' },
    { id: 3, title: 'THY Ticket Change Rules', category: 'Flight', date: '2026-07-05' },
    { id: 4, title: 'VIP Transfer Voucher Delay', category: 'Transfer', date: '2026-07-04' }
  ];

  // Filtering
  const filteredSessions = mockSessions.filter(session => 
    session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  return (
    <div className="flex h-screen w-full overflow-hidden bg-bg font-sans">
      {/* Collapsible Chat Sidebar */}
      <ChatSidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
        currentView="chat"
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative overflow-y-auto bg-transparent">
        {/* Toggle open button when sidebar is collapsed */}
        {!isSidebarOpen && (
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="absolute top-4 left-4 z-30 p-2 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 text-text-secondary hover:text-text-primary transition-all duration-200 focus:outline-none"
            title="Expand Sidebar"
          >
            <PanelLeftOpen size={18} />
          </button>
        )}

        {/* Arka Plan Videosu - fixed ve z-0 ile en arkaya çiviliyoruz */}
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="fixed top-0 left-0 w-full h-full object-cover z-0 pointer-events-none"
        >
          <source src="/videos/chatbot_bg.mp4" type="video/mp4" />
          Tarayıcınız video etiketini desteklemiyor.
        </video>

        <div className="flex-1 p-6 md:p-10 max-w-4xl mx-auto w-full animate-fade-in z-10 relative">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#0F172A] font-display mb-2">
              Search Chats
            </h1>
            <p className="text-text-secondary text-sm">
              Search across your active, recent, and archived chat sessions.
            </p>
          </div>

          {/* Search Box */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm mb-6 flex items-center gap-3">
            <Search className="text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by keyword, hotel name, flight code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-text-primary placeholder-slate-400 focus:outline-none text-base font-medium"
              autoFocus
            />
          </div>

          {/* Results List */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden divide-y divide-slate-100">
            {filteredSessions.length > 0 ? (
              filteredSessions.map((session) => (
                <div 
                  key={session.id}
                  onClick={() => navigate('/chat')}
                  className="p-5 hover:bg-slate-50 cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="space-y-1.5 min-w-0">
                    <h3 className="font-bold text-[#0F172A] group-hover:text-primary transition-colors text-base truncate pr-4">
                      {session.title}
                    </h3>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${getBadgeStyle(session.category)}`}>
                        {session.category}
                      </span>
                      <span className="text-xs text-text-secondary">
                        Last active: {session.date}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-slate-400 group-hover:text-primary transition-all pr-1">
                    <ChevronRight size={20} className="transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-text-secondary text-sm font-medium">
                No chat sessions found matching "{searchQuery}"
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
