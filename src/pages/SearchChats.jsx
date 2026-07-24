import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  PanelLeftOpen, 
  Search, 
  ChevronRight 
} from "lucide-react";
import ChatSidebar from "../components/ChatSidebar";
import { useTheme } from "../components/ThemeContext";

export default function SearchChats() {
  const { theme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(err => console.log("Video oynatılamadı:", err));
    }
  }, [theme]);

  // State for chat sessions (currently empty, can be fetched from API later)
  const [sessions, setSessions] = useState([]);

  // Filtering
  const filteredSessions = sessions.filter(session => 
    session.title.toLocaleLowerCase('tr-TR').includes(searchQuery.toLocaleLowerCase('tr-TR')) ||
    session.category.toLocaleLowerCase('tr-TR').includes(searchQuery.toLocaleLowerCase('tr-TR'))
  );

  const getBadgeStyle = (category) => {
    switch (category) {
      case 'General SOP':
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700';
      case 'Hotel':
        return 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900/50';
      case 'Flight':
        return 'bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 border border-purple-100 dark:border-purple-900/50';
      case 'Transfer':
        return 'bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-300 border border-teal-100 dark:border-teal-900/50';
      default:
        return 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700';
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-transparent font-sans relative">
      {/* Katman 1 (z-0): Background Video */}
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

      {/* Katman 2 (z-10): Overlay Mask (No Blur) */}
      <div className="fixed inset-0 z-10 pointer-events-none bg-white/20 dark:bg-slate-950/60" />

      {/* Katman 3 (z-30): Sidebar */}
      <ChatSidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
        currentView="chat"
      />

      {/* Katman 3 (z-20): Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative overflow-y-auto bg-transparent z-20">

        <div className="flex-1 p-6 md:p-10 max-w-4xl mx-auto w-full animate-fade-in z-20 relative">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#0F172A] dark:text-slate-100 font-display mb-2">
              Search Chats
            </h1>
            <p className="text-text-secondary dark:text-slate-400 text-sm">
              Search across your active, recent, and archived chat sessions.
            </p>
          </div>

          {/* Search Box */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm mb-6 flex items-center gap-3">
            <Search className="text-slate-400 dark:text-slate-500" size={20} />
            <input 
              type="text" 
              placeholder="Search by keyword, hotel name, flight code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-text-primary dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none text-base font-medium"
              autoFocus
            />
          </div>

          {/* Results List */}
          {(filteredSessions.length > 0 || searchQuery) && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
              {filteredSessions.length > 0 ? (
                filteredSessions.map((session) => (
                  <div 
                    key={session.id}
                    onClick={() => navigate('/chat')}
                    className="p-5 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div className="space-y-1.5 min-w-0">
                      <h3 className="font-bold text-[#0F172A] dark:text-slate-100 group-hover:text-primary transition-colors text-base truncate pr-4">
                        {session.title}
                      </h3>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${getBadgeStyle(session.category)}`}>
                          {session.category}
                        </span>
                        <span className="text-xs text-text-secondary dark:text-slate-400">
                          Last active: {session.date}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-slate-400 dark:text-slate-500 group-hover:text-primary transition-all pr-1">
                      <ChevronRight size={20} className="transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-text-secondary dark:text-slate-400 text-sm font-medium">
                  No chat sessions found matching "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
