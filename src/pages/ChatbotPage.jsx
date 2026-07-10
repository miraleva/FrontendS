import { useState, useEffect, useRef } from "react";
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { PanelLeftOpen, Send, Paperclip, Mic, ArrowUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import ChatSidebar from "../components/ChatSidebar";

export default function Index() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isChatActive, setIsChatActive] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingStep, setThinkingStep] = useState("");
  const [context, setContext] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const sessionId = searchParams.get('sessionId') || '';

  const videoRef = useRef(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const email = localStorage.getItem('userId') || "";
  const username = email ? (email.includes('@') ? email.split('@')[0] : email) : "User";

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch(error => {
        console.log("Video autoplay engeline takıldı:", error);
      });
    }
  }, []);

  useEffect(() => {
    if (sessionId) {
      const loadHistory = async () => {
        try {
          setIsThinking(true);
          setThinkingStep("Loading history...");
          const response = await api.get(`/api/chat/sessions/${sessionId}/messages`);
          const history = response.data.map((msg, idx) => ({
            id: idx,
            text: msg.text,
            sender: msg.sender
          }));
          setMessages(history);
          setIsChatActive(history.length > 0);
        } catch (err) {
          console.error("Failed to load message history for session", sessionId, err);
        } finally {
          setIsThinking(false);
        }
      };
      loadHistory();
    } else {
      setMessages([]);
      setIsChatActive(false);
    }
  }, [sessionId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  const handleTextareaChange = (e) => {
    setSearchQuery(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  const getGreetingKey = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return "greeting_morning";
    } else if (hour >= 12 && hour < 18) {
      return "greeting_afternoon";
    } else {
      return "greeting_night";
    }
  };

  const updateOperationContext = (query) => {
    const q = query.toLowerCase();
    let category = "General SOP";
    let refNum = "REF-PENDING";
    let docs = ["SOP_Manual.pdf"];

    if (q.includes("titanic") || q.includes("hotel")) {
      category = t("hotel_sop");
      refNum = "HTL-PENDING";
      docs = ["Titanic_Lara_SOP_v2.pdf"];
    } else if (q.includes("thy") || q.includes("flight")) {
      category = t("flight_sop");
      refNum = "FLT-PENDING";
      docs = ["THY_Baggage_Ops_Guide.pdf"];
    } else if (q.includes("transfer")) {
      category = t("transfer_sop");
      refNum = "TRF-PENDING";
      docs = ["Airport_Transfer_Dispatch.pdf"];
    } else if (q.includes("voucher")) {
      category = t("voucher");
      refNum = "VCH-PENDING";
      docs = ["Voucher_Directives_2026.pdf"];
    }

    setContext({ category, refNum, docs });
  };

  const handleSend = async () => {
    if (!searchQuery.trim()) return;

    const query = searchQuery;
    const userMsg = { id: Date.now(), text: query, sender: "user" };

    setMessages(prev => [...prev, userMsg]);
    setSearchQuery("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    setIsChatActive(true);
    setIsThinking(true);
    setThinkingStep(t("thinking_sop") || "Checking SOP manuals...");

    console.log("[ChatbotPage] handleSend: sending message with sessionId =", sessionId || "null (new session)");

    let userCountry = "Turkey";
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user.country) userCountry = user.country;
      }
    } catch (e) {
      console.error(e);
    }

    try {
      const response = await api.post('/api/chat/message', {
        message: query,
        sessionId: sessionId || null,
        country: userCountry,
        currencySymbol: "TRY",
        currencyName: "Turkish Lira"
      });

      const data = response.data;
      const botMsg = {
        id: Date.now() + 1,
        text: data.reply,
        sender: "bot",
        results: data.results
      };

      setMessages(prev => [...prev, botMsg]);

      if (data.sessionId && data.sessionId !== sessionId) {
        setSearchParams({ sessionId: data.sessionId });
      }

      updateOperationContext(query);
    } catch (err) {
      console.error("Failed to send message", err);
      const errorMsg = {
        id: Date.now() + 1,
        text: "Sorry, I couldn't reach the chat assistant. Please check your connection.",
        sender: "bot"
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickAction = (actionLabel) => {
    setSearchQuery(`Check ${actionLabel} policy`);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-bg font-sans relative">
      {/* Collapsible Chat Sidebar */}
      <ChatSidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden bg-transparent">
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

        {/* Arka Plan Videosu */}
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className={`fixed top-0 left-0 w-full h-full object-cover z-0 pointer-events-none transition-all duration-500 ${isChatActive ? "opacity-40 blur-md scale-105" : "opacity-100"
            }`}
        >
          <source src="/videos/chatbot_bg.mp4" type="video/mp4" />
          Tarayıcınız video etiketini desteklemiyor.
        </video>

        {/* Flex layout holding main chat area + dynamic right side context panel */}
        <div className="flex-1 flex h-full relative z-10 w-full">
          {/* Main Chat Screen Area */}
          <div className="flex-1 flex flex-col h-full relative min-w-0">
            {/* Scrollable messages or Centered Hero */}
            <div className="flex-1 overflow-y-auto px-4 py-8 flex flex-col items-center justify-between h-full">
              {!isChatActive ? (
                // 1. Welcome operations screen (Centered)
                <div className="w-full max-w-[850px] my-auto animate-fade-in flex flex-col items-center">
                  <div className="mb-8 text-center flex flex-col items-center">
                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-2 select-none text-center md:text-left">
                      <img
                        src="/logo.png"
                        alt="Sanny Logo"
                        className="h-16 md:h-20 w-auto object-contain flex-shrink-0"
                      />
                      <h1 className="text-2xl md:text-4xl font-extrabold text-[#1E232C] font-display">
                        {t(getGreetingKey(), { username })}
                      </h1>
                    </div>
                    <p className="text-[#1E232C]/70 text-sm font-semibold">
                      {t("ops_subtitle")}
                    </p>
                  </div>

                  <div
                    className="w-full rounded-2xl shadow-xl border mb-6 max-w-[700px] transition-all duration-300"
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.08)",
                      borderColor: "rgba(255, 255, 255, 0.15)",
                    }}
                  >
                    <div className="p-3">
                      <div className="relative flex items-center">
                        <textarea
                          ref={textareaRef}
                          rows={1}
                          value={searchQuery}
                          onChange={handleTextareaChange}
                          onKeyDown={handleKeyDown}
                          placeholder={t("input_placeholder_welcome")}
                          className="w-full pl-3 pr-28 py-2.5 bg-transparent text-black placeholder-black/40 focus:outline-none resize-none max-h-32 text-sm leading-relaxed"
                        />
                        <div className="absolute right-2 flex items-center gap-1.5">
                          <button type="button" className="p-1.5 text-blue-500 hover:text-blue-600 transition-colors focus:outline-none cursor-pointer">
                            <Paperclip size={16} />
                          </button>
                          <button type="button" className="p-1.5 text-blue-500 hover:text-blue-600 transition-colors focus:outline-none cursor-pointer">
                            <Mic size={16} />
                          </button>
                          <button
                            onClick={handleSend}
                            disabled={!searchQuery.trim()}
                            className="p-1.5 rounded-lg bg-[#3B82F6] text-white hover:bg-[#3B82F6]/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm"
                          >
                            <ArrowUp size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Action Operations Cards */}
                  <div className="w-full max-w-[700px] grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-6">
                    {[
                      { key: "hotel_sop" },
                      { key: "flight_sop" },
                      { key: "transfer_sop" },
                      { key: "reservation" },
                      { key: "cancellation_refund" },
                      { key: "voucher" }
                    ].map((action) => (
                      <button
                        key={action.key}
                        onClick={() => handleQuickAction(t(action.key))}
                        className="flex flex-col items-center justify-center p-3.5 bg-white/40 hover:bg-white/60 border border-white/20 rounded-xl transition-all duration-200 hover:-translate-y-0.5 cursor-pointer hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:border-[#F59E0B]/40 animate-fade-in"
                      >
                        <span className="text-xs font-bold text-slate-800 text-center truncate w-full">{t(action.key)}</span>
                      </button>
                    ))}
                  </div>

                  {/* Try asking Chips */}
                  <div className="w-full max-w-[700px] flex flex-col items-center gap-2">
                    <span className="text-[11px] text-[#1E232C]/60 font-semibold uppercase tracking-wider">
                      {t("try_asking")}
                    </span>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {[
                        "starter_titanic",
                        "starter_thy_baggage",
                        "starter_voucher_refund",
                        "starter_transfer_delay"
                      ].map((queryKey) => (
                        <button
                          key={queryKey}
                          onClick={() => setSearchQuery(t(queryKey))}
                          className="px-3.5 py-1.5 bg-white/40 hover:bg-white/60 border border-white/20 hover:border-amber-500/50 rounded-full text-xs font-semibold text-slate-800 transition-all hover:scale-[1.02] cursor-pointer"
                        >
                          {t(queryKey)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                // 2. Active Chat Screen Layout
                <div className="w-full max-w-[850px] flex-1 flex flex-col h-full relative justify-between overflow-hidden">
                  <div className="flex-1 overflow-y-auto p-2 space-y-4 pb-28 w-full">
                    {messages.map((msg) => (
                      <div key={msg.id} className={`flex items-start gap-3 w-full ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                        {msg.sender === "bot" && (
                          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-slate-200 shadow-sm flex-shrink-0 select-none overflow-hidden p-1">
                            <img
                              src="/logo.png"
                              alt="Sanny Logo"
                              className="w-full h-full object-contain"
                            />
                          </div>
                        )}
                        <div className="flex flex-col max-w-[75%]">
                          {msg.sender === "bot" && (
                            <span className="text-[10px] text-slate-500 font-bold mb-1 ml-1">Sanny</span>
                          )}
                          <div
                            className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed whitespace-pre-wrap ${msg.sender === "user"
                              ? "bg-amber-500 text-white rounded-tr-none"
                              : "bg-white/90 border border-white/30 text-[#0F172A] rounded-tl-none backdrop-blur-md"
                              }`}
                          >
                            {msg.text}
                          </div>
                          {msg.results && msg.results.length > 0 && (
                            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                              {msg.results.map((result, idx) => {
                                const isFlight = result.airline !== undefined;
                                if (isFlight) {
                                  return (
                                    <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col gap-2">
                                      <div className="flex justify-between items-center">
                                        <span className="font-bold text-[#1E232C] text-sm">✈️ {result.airline}</span>
                                        <span className="text-[#3B82F6] font-bold text-sm">{result.price} {result.currency}</span>
                                      </div>
                                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                                        <div><strong>Departure:</strong> {result.departureTime}</div>
                                        <div><strong>Arrival:</strong> {result.arrivalTime}</div>
                                        <div><strong>Transfers:</strong> {result.transfers}</div>
                                        <div><strong>Baggage:</strong> {result.baggage}</div>
                                      </div>
                                    </div>
                                  );
                                } else {
                                  return (
                                    <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col gap-2">
                                      <div className="flex justify-between items-start">
                                        <div className="flex flex-col">
                                          <span className="font-bold text-[#1E232C] text-sm">🏨 {result.name || result.hotelId}</span>
                                          <span className="text-xs text-slate-500">{result.region} • {result.stars}★</span>
                                        </div>
                                        <span className="text-[#3B82F6] font-bold text-sm">{result.price} {result.currency}</span>
                                      </div>
                                      <div className="text-xs text-slate-600">
                                        <strong>Board/Pension:</strong> {result.boardType || result.pensionType || "N/A"}
                                      </div>
                                    </div>
                                  );
                                }
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Sequential Thinking step indicator */}
                    {isThinking && (
                      <div className="flex items-start gap-3 justify-start">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-slate-200 shadow-sm flex-shrink-0 select-none overflow-hidden p-1">
                          <img
                            src="/logo.png"
                            alt="Sanny Logo"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="space-y-1 max-w-[75%]">
                          <span className="text-[10px] text-slate-500 font-bold mb-1 ml-1">Sanny</span>
                          <div className="bg-white/90 border border-white/30 text-[#0F172A] rounded-2xl rounded-tl-none p-4 shadow-sm flex items-center gap-3 backdrop-blur-md">
                            <div className="flex gap-1 flex-shrink-0">
                              <div className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" />
                              <div className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce [animation-delay:0.2s]" />
                              <div className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce [animation-delay:0.4s]" />
                            </div>
                            <span className="text-xs text-slate-500 italic font-medium">{thinkingStep}</span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Chat mode bottom fixed input area (strictly z-20 above video) */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-transparent z-20">
                    <div
                      className="rounded-2xl shadow-xl border w-full transition-all duration-300"
                      style={{
                        backgroundColor: "rgba(255, 255, 255, 0.08)",
                        borderColor: "rgba(255, 255, 255, 0.15)",
                        backdropBlur: "20px"
                      }}
                    >
                      <div className="p-3">
                        <div className="relative flex items-center">
                          <textarea
                            ref={textareaRef}
                            rows={1}
                            value={searchQuery}
                            onChange={handleTextareaChange}
                            onKeyDown={handleKeyDown}
                            placeholder={t("input_placeholder_chat")}
                            className="w-full pl-3 pr-28 py-2.5 bg-transparent text-black placeholder-black/40 focus:outline-none resize-none max-h-32 text-sm leading-relaxed"
                          />
                          <div className="absolute right-2 flex items-center gap-1.5">
                            <button type="button" className="p-1.5 text-blue-500 hover:text-blue-600 transition-colors focus:outline-none cursor-pointer">
                              <Paperclip size={16} />
                            </button>
                            <button type="button" className="p-1.5 text-blue-500 hover:text-blue-600 transition-colors focus:outline-none cursor-pointer">
                              <Mic size={16} />
                            </button>
                            <button
                              onClick={handleSend}
                              disabled={!searchQuery.trim()}
                              className="p-1.5 rounded-lg bg-[#3B82F6] text-white hover:bg-[#3B82F6]/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm"
                            >
                              <ArrowUp size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Dynamic Operation Context Panel */}
          {isChatActive && context && (
            <div className="w-[280px] hidden xl:flex flex-col bg-white/20 border-l border-white/20 backdrop-blur-xl p-5 gap-5 animate-fade-in relative z-20 overflow-y-auto">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-[#0B5FFF] uppercase tracking-wider">
                  {t("ops_panel_title")}
                </span>
                <h3 className="text-base font-bold text-[#0F172A]">
                  Active Context
                </h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-1 bg-white/30 p-3 rounded-lg border border-white/20">
                  <span className="text-[10px] font-bold text-text-secondary uppercase">{t("ops_category")}</span>
                  <span className="text-sm font-semibold text-slate-800 block">{context.category}</span>
                </div>

                <div className="space-y-1 bg-white/30 p-3 rounded-lg border border-white/20">
                  <span className="text-[10px] font-bold text-text-secondary uppercase">{t("ops_ref_num")}</span>
                  <span className="text-sm font-mono font-bold text-[#0F172A] block">{context.refNum}</span>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-text-secondary uppercase block">{t("ops_related_docs")}</span>
                  <div className="space-y-1.5">
                    {context.docs.map((doc, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-white/40 hover:bg-white/50 border border-white/10 rounded-md text-xs font-medium text-slate-700 transition-all">
                        <span>📄</span>
                        <span className="truncate flex-1" title={doc}>{doc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
