import { useState, useEffect, useRef } from "react";
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
  const [isListening, setIsListening] = useState(false);

  const videoRef = useRef(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Karşılama ve aktif sohbet ekranları için ayrı ayrı dosya input referansları
  const welcomeFileInputRef = useRef(null);
  const chatFileInputRef = useRef(null);

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

  const handleSend = () => {
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

    setThinkingStep(t("thinking_sop"));

    setTimeout(() => {
      setThinkingStep(t("thinking_res"));
    }, 1000);

    setTimeout(() => {
      setThinkingStep(t("thinking_preparing"));
    }, 2000);

    setTimeout(() => {
      const botMsg = { id: Date.now() + 1, text: t("placeholder_reply", { query }), sender: "bot" };
      setMessages(prev => [...prev, botMsg]);
      setIsThinking(false);
      updateOperationContext(query);
    }, 3000);
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    console.log("Seçilen dosya başarıyla yakalandı:", file.name);
    // Buraya dosya yükleme (upload) servis mantığını ekleyebilirsin
  };

  const recognitionRef = useRef(null);

  const startVoiceRecognition = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Eğer zaten dinliyorsa ve tekrar basıldıysa (veya stop fonksiyonu gibi çalışacaksa) durdur
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        setIsListening(false);
        return;
      } catch (err) {
        console.log("Oturum durdurulamadı:", err);
      }
    }

    console.log("Ses tanıma tetiklendi...");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

      if (!SpeechRecognition) {
        alert("Tarayıcınız ses tanıma özelliğini desteklemiyor.");
        stream.getTracks().forEach(track => track.stop());
        return;
      }

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.lang = "tr-TR";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        console.log("Ses kaydı AKTİF.");
        setIsListening(true); // Arayüzü ses dalgası moduna geçirir
      };

      recognition.onerror = (event) => {
        console.error("Speech API Hatası:", event.error);
        if (event.error !== 'aborted') {
          alert(`Tarayıcı Ses Hatası: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onresult = (event) => {
        const speechToText = event.results[0][0].transcript;
        setSearchQuery(prev => prev ? `${prev} ${speechToText}` : speechToText);

        if (textareaRef.current) {
          setTimeout(() => {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
          }, 0);
        }
      };

      recognition.onend = () => {
        console.log("Ses tanıma bitti.");
        stream.getTracks().forEach(track => track.stop());
        recognitionRef.current = null;
        setIsListening(false); // Arayüzü normal textarea moduna geri döndürür
      };

      recognition.start();

    } catch (err) {
      console.error("Donanım hatası:", err);
      setIsListening(false);
    }
  };
  return (
    <div className="flex h-screen w-full overflow-hidden bg-bg font-sans relative">
      {/* Sol Sidebar */}
      <ChatSidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        onNewChat={() => {
          setIsChatActive(false);
          setMessages([]);
          setSearchQuery("");
        }}
      />

      {/* Ana İçerik Alanı */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden bg-transparent">
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="absolute top-4 left-4 z-30 p-2 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-all duration-200 focus:outline-none cursor-pointer flex items-center justify-center"
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
          className={`fixed top-0 left-0 w-full h-full object-cover z-0 pointer-events-none transition-all duration-500 ${isChatActive ? "opacity-40 blur-md scale-105" : "opacity-100"}`}
        >
          <source src="/videos/chatbot_bg.mp4" type="video/mp4" />
          Tarayıcınız video etiketini desteklemiyor.
        </video>

        <div className="flex-1 flex h-full relative z-10 w-full">
          <div className="flex-1 flex flex-col h-full relative min-w-0">
            <div className="flex-1 overflow-y-auto px-4 py-8 flex flex-col items-center justify-between h-full">

              {!isChatActive ? (
                // ==================== 1. KARŞILAMA EKRANI LAYOUT'U ====================
                <div className="w-full max-w-[850px] my-auto animate-fade-in flex flex-col items-center relative z-20">
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
                    className="w-full rounded-2xl shadow-xl border mb-6 max-w-[700px] transition-all duration-300 relative z-30"
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.08)",
                      borderColor: "rgba(255, 255, 255, 0.15)",
                    }}
                  >
                    <div className="p-3">
                      <div className="relative flex items-center w-full min-h-[40px]">

                        {!isListening ? (
                          // ================= MOD 1: NORMAL TEXTAREA MODU =================
                          <>
                            <textarea
                              ref={textareaRef}
                              rows={1}
                              value={searchQuery}
                              onChange={handleTextareaChange}
                              onKeyDown={handleKeyDown}
                              placeholder={t("input_placeholder_welcome")} // Aktif chat için placeholder_chat yapın
                              className="w-full pl-3 pr-28 py-2.5 bg-transparent text-black placeholder-black/40 focus:outline-none resize-none max-h-32 text-sm leading-relaxed"
                            />
                            <div className="absolute right-2 flex items-center gap-1.5 z-40">
                              <input
                                type="file"
                                ref={welcomeFileInputRef} // Veya chatFileInputRef
                                onChange={handleFileChange}
                                className="hidden"
                              />
                              <button
                                type="button"
                                onClick={() => welcomeFileInputRef.current?.click()}
                                className="p-1.5 text-blue-500 hover:text-blue-600 transition-colors focus:outline-none cursor-pointer relative z-50"
                              >
                                <Paperclip size={16} className="pointer-events-none" />
                              </button>
                              <button
                                type="button"
                                onClick={startVoiceRecognition}
                                className="p-1.5 text-blue-500 hover:text-blue-600 transition-colors focus:outline-none cursor-pointer relative z-50"
                              >
                                <Mic size={16} className="pointer-events-none" />
                              </button>
                              <button
                                onClick={handleSend}
                                disabled={!searchQuery.trim()}
                                className="p-1.5 rounded-lg bg-[#3B82F6] text-white hover:bg-[#3B82F6]/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm relative z-50"
                              >
                                <ArrowUp size={14} className="pointer-events-none" />
                              </button>
                            </div>
                          </>
                        ) : (
                          // ================= MOD 2: SES DALGASI VE DURDURMA MODU =================
                          <div className="flex items-center justify-between w-full px-2 animate-fade-in">
                            {/* Sol taraftaki artı / ataç görsel simgesi */}
                            <span className="text-xl text-slate-400 font-light select-none cursor-not-allowed opacity-50">＋</span>

                            {/* CSS Animasyonlu Ses Dalgaları Yapısı */}
                            <div className="flex items-center gap-[3px] h-6 flex-1 justify-center max-w-[60%]">
                              {[...Array(24)].map((_, i) => (
                                <div
                                  key={i}
                                  className="w-[3px] bg-amber-500 rounded-full animate-pulse"
                                  style={{
                                    height: `${Math.floor(Math.random() * 16) + 6}px`,
                                    animationDelay: `${i * 0.05}s`,
                                    animationDuration: `${Math.random() * 0.4 + 0.4}s`
                                  }}
                                />
                              ))}
                            </div>

                            {/* Sağ taraftaki Kırmızı/Gri Kare Durdurma Butonu */}
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  recognitionRef.current?.stop();
                                  setIsListening(false);
                                }}
                                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-red-100 flex items-center justify-center transition-all cursor-pointer group"
                                title="Durdur"
                              >
                                <div className="w-2.5 h-2.5 bg-slate-800 group-hover:bg-red-500 rounded-sm transition-colors" />
                              </button>

                              {/* Gönder butonu pasif (dinleme esnasında) */}
                              <button disabled className="p-1.5 rounded-lg bg-gray-200 text-gray-400 opacity-50 cursor-not-allowed">
                                <ArrowUp size={14} />
                              </button>
                            </div>
                          </div>
                        )}

                      </div>
                    </div>
                  </div>

                  {/* Hızlı Aksiyonlar */}
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

                  {/* Örnek Soru Çipleri */}
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
                // ==================== 2. AKTİF SOHBET LAYOUT'U ====================
                <div className="w-full max-w-[850px] flex-1 flex flex-col h-full relative justify-between overflow-hidden relative z-20">
                  <div className="flex-1 overflow-y-auto p-2 space-y-4 pb-28 w-full">
                    {messages.map((msg) => (
                      <div key={msg.id} className={`flex items-start gap-3 w-full ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                        {msg.sender === "bot" && (
                          <div className="w-12 h-12 flex items-center justify-center flex-shrink-0 select-none overflow-hidden p-1">
                            <img
                              src="/logo.png"
                              alt="Sanny Logo"
                              className="w-full h-full object-contain"
                            />
                          </div>
                        )}
                        <div className="flex flex-col max-w-[75%]">
                          <div
                            className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed whitespace-pre-wrap ${msg.sender === "user"
                              ? "bg-amber-500 text-white rounded-tr-none"
                              : "bg-white/90 border border-white/30 text-[#0F172A] rounded-tl-none backdrop-blur-md"
                              }`}
                          >
                            {msg.text}
                          </div>
                        </div>
                      </div>
                    ))}

                    {isThinking && (
                      <div className="flex items-start gap-3 justify-start">
                        <div className="w-12 h-12 flex items-center justify-center flex-shrink-0 select-none overflow-hidden p-1">
                          <img
                            src="/logo.png"
                            alt="Sanny Logo"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="space-y-1 max-w-[75%]">
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

                  {/* Alt Sabit Sohbet Giriş Alanı */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-transparent z-30">
                    <div
                      className="rounded-2xl shadow-xl border w-full transition-all duration-300 relative z-30"
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
                          <div className="absolute right-2 flex items-center gap-1.5 z-40">
                            {/* Gizli Dosya Girişi - Sohbet Modu */}
                            <input
                              type="file"
                              ref={chatFileInputRef}
                              onChange={handleFileChange}
                              className="hidden"
                            />

                            <button
                              type="button"
                              onClick={() => chatFileInputRef.current?.click()}
                              className="p-1.5 text-blue-500 hover:text-blue-600 transition-colors focus:outline-none cursor-pointer relative z-50"
                            >
                              <Paperclip size={16} className="pointer-events-none" />
                            </button>
                            <button
                              type="button"
                              onClick={startVoiceRecognition}
                              className="p-1.5 text-blue-500 hover:text-blue-600 transition-colors focus:outline-none cursor-pointer relative z-50"
                            >
                              <Mic size={16} className="pointer-events-none" />
                            </button>
                            <button
                              onClick={handleSend}
                              disabled={!searchQuery.trim()}
                              className="p-1.5 rounded-lg bg-[#3B82F6] text-white hover:bg-[#3B82F6]/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm relative z-50"
                            >
                              <ArrowUp size={14} className="pointer-events-none" />
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

          {/* Dinamik Sağ Context Paneli */}
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
