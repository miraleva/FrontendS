import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  PanelLeftOpen,
  PanelRightOpen,
  PanelRightClose,
  Send,
  Paperclip,
  Mic,
  ArrowUp,
  Star,
  X,
  Calendar,
  MapPin,
  Users,
  Hotel,
  Plane,
  Sparkles
} from "lucide-react";
import { useTranslation } from "react-i18next";
import ChatSidebar from "../components/ChatSidebar";
import HotelDetailPanel from "../components/HotelDetailPanel";
import ReservationFormPanel from "../components/ReservationFormPanel";

function cn(...inputs) {
  return inputs.filter(Boolean).join(" ");
}

export default function Index() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isChatActive, setIsChatActive] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingStep, setThinkingStep] = useState("");

  // --- Seçilen Otel Objesi ---
  const [selectedHotel, setSelectedHotel] = useState(null);

  // --- Arama Tipi ("hotel" | "flight") ---
  const [searchType, setSearchType] = useState("hotel");

  // --- Slide-in Panel State ---
  const [activePanel, setActivePanel] = useState(null); // 'hotelDetail' | 'reservation' | null
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);

  // --- Reservation Form Preserved State ---
  const [reservationGuests, setReservationGuests] = useState(null);
  const [reservationTermsAccepted, setReservationTermsAccepted] = useState(false);

  // --- Rezervasyon Önizleme State'leri ---
  const [bookingDetails, setBookingDetails] = useState({
    city: "",           // Otel için: Nerede (Konum)
    checkIn: "",        // Otel için Giriş / Uçak için Uçuş Tarihi
    checkOut: "",       // Sadece Otel için Çıkış Tarihi
    guests: "",
    hotelName: "",
    price: "",
    departureCity: "",  // Uçak için: Kalkış Noktası
    arrivalCity: "",    // Uçak için: Varış Noktası
    airline: ""         // Uçak için: Havayolu
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('sessionId') || '';
  const [isListening, setIsListening] = useState(false);

  const videoRef = useRef(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const welcomeFileInputRef = useRef(null);
  const chatFileInputRef = useRef(null);

  const email = localStorage.getItem('userId') || "";
  let storedUserForGreeting = null;
  try {
    storedUserForGreeting = JSON.parse(localStorage.getItem('user') || 'null');
  } catch (e) {
    storedUserForGreeting = null;
  }
  const profileFullNameForGreeting = storedUserForGreeting && (storedUserForGreeting.firstName || storedUserForGreeting.lastName)
    ? `${storedUserForGreeting.firstName || ''} ${storedUserForGreeting.lastName || ''}`.trim()
    : null;
  const username = profileFullNameForGreeting || (email ? (email.includes('@') ? email.split('@')[0] : email) : "User");

  // --- HTML5 Video Autoplay Engeli Çözümü ---
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch(error => {
        console.log("Video autoplay engeline takıldı:", error);
      });
    }
  }, []);

  // --- Oturum Geçmişini ve bookingMeta Durumunu Yükleme ---
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
            sender: msg.sender,
            results: msg.results || null,
            chatStatus: msg.chatStatus || null,
            selectedItem: msg.selectedItem || null,
            bookingMeta: msg.bookingMeta || null
          }));

          setMessages(history);
          setIsChatActive(history.length > 0);

          // Geçmiş mesajlar içinde en güncel bookingMeta'yı bulup sağ tarafa doldur
          const lastMetaMessage = [...response.data].reverse().find(msg => msg.bookingMeta);
          if (lastMetaMessage && lastMetaMessage.bookingMeta) {
            setBookingDetails(prev => ({ ...prev, ...lastMetaMessage.bookingMeta }));
            if (lastMetaMessage.bookingMeta.type) {
              setSearchType(lastMetaMessage.bookingMeta.type);
            }
          }
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
      setSearchType("hotel");
      setBookingDetails({ city: "", departureCity: "", arrivalCity: "", checkIn: "", checkOut: "", guests: "", hotelName: "", airline: "", price: "" });
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
    if (hour >= 5 && hour < 12) return "greeting_morning";
    if (hour >= 12 && hour < 18) return "greeting_afternoon";
    return "greeting_night";
  };

  // --- Yeni Mesaj Gönderme ve bookingMeta Güncelleme ---
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
    setThinkingStep(t("thinking_sop") || "Checking manuals...");

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
        results: data.results,
        chatStatus: data.chatStatus,
        selectedItem: data.selectedItem,
        bookingMeta: data.bookingMeta || null
      };

      setMessages(prev => [...prev, botMsg]);

      // 1. Arama Tipini Gelen "searchType" Değerine Göre Güncelle
      if (data.searchType) {
        if (data.searchType.includes("HOTEL")) {
          setSearchType("hotel");
        } else if (data.searchType.includes("FLIGHT")) {
          setSearchType("flight");
        }
      }

      // 2. Kullanıcının Kendi Yazdığı Mesajdan (Sorgudan) Tarih ve Konuk Bilgilerini Ayıkla (Yedek Plan)
      let extractedFromQuery = {};
      const lowerQuery = query.toLowerCase();

      // Konuk Sayısı Ayıklama
      const guestMatch = lowerQuery.match(/(\d+)\s*(kişi|kisi|yetişkin|yetiskin|guest|adult)/i);
      if (guestMatch) {
        extractedFromQuery.guests = `${guestMatch[1]} Kişi`;
      }

      // Sayısal Tarih Formatı Ayıklama (Örn: 17.07.2026-19.07.2026 veya 17.07-19.07)
      const numericRangeRegex = /(\d{1,2})[\./-](\d{1,2})(?:[\./-](\d{2,4}))?\s*[-–—]\s*(\d{1,2})[\./-](\d{1,2})(?:[\./-](\d{2,4}))/;
      const rangeMatch = lowerQuery.match(numericRangeRegex);
      if (rangeMatch) {
        const currentYear = new Date().getFullYear();
        extractedFromQuery.checkIn = `${rangeMatch[1].padStart(2, '0')}.${rangeMatch[2].padStart(2, '0')}.${rangeMatch[3] || currentYear}`;
        extractedFromQuery.checkOut = `${rangeMatch[4].padStart(2, '0')}.${rangeMatch[5].padStart(2, '0')}.${rangeMatch[6] || rangeMatch[3] || currentYear}`;
      } else {
        // Metinsel Tarih Ayıklama (Örn: 17 temmuz - 19 temmuz)
        const ayIsimleri = "ocak|şubat|mart|nisan|mayıs|haziran|temmuz|ağustos|eylül|ekim|kasım|aralık|january|february|march|april|may|june|july|august|september|october|november|december";
        const singleDateRegex = new RegExp(`(\\d{1,2})\\s*(${ayIsimleri})`, "gi");
        let matches = [];
        let m;
        while ((m = singleDateRegex.exec(lowerQuery)) !== null) {
          matches.push(`${m[1]} ${m[2].charAt(0).toUpperCase() + m[2].slice(1)}`);
        }
        if (matches.length >= 2) {
          extractedFromQuery.checkIn = matches[0];
          extractedFromQuery.checkOut = matches[1];
        } else if (matches.length === 1) {
          extractedFromQuery.checkIn = matches[0];
        }
      }

      // 3. Backend'den Dönen Sonuç Listesindeki (`results`) İlk Elemana Göre Sağ Barı Besle
      if (data.results && data.results.length > 0) {
        const firstItem = data.results[0];
        const isFlight = firstItem.airline !== undefined;

        setBookingDetails(prev => {
          if (isFlight) {
            return {
              ...prev,
              departureCity: firstItem.departureCity || prev.departureCity || "İstanbul", // Varsayılan kalkış
              arrivalCity: firstItem.arrivalCity || firstItem.region || prev.arrivalCity,
              checkIn: extractedFromQuery.checkIn || prev.checkIn,
              airline: firstItem.airline || prev.airline,
              price: `${firstItem.price} ${firstItem.currency || 'TRY'}`,
              guests: extractedFromQuery.guests || prev.guests
            };
          } else {
            return {
              ...prev,
              city: firstItem.region || prev.city || "Antalya",
              checkIn: extractedFromQuery.checkIn || prev.checkIn,
              checkOut: extractedFromQuery.checkOut || prev.checkOut,
              hotelName: firstItem.name || firstItem.hotelId || prev.hotelName,
              price: `${firstItem.price} ${firstItem.currency || 'TRY'}`,
              guests: extractedFromQuery.guests || prev.guests
            };
          }
        });
      } else {
        // Eğer arama sonucu henüz dönmediyse sadece kullanıcının sorgusundaki verileri güncelle
        setBookingDetails(prev => ({
          ...prev,
          checkIn: extractedFromQuery.checkIn || prev.checkIn,
          checkOut: extractedFromQuery.checkOut || prev.checkOut,
          guests: extractedFromQuery.guests || prev.guests
        }));
      }

      if (data.sessionId && data.sessionId !== sessionId) {
        setSearchParams({ sessionId: data.sessionId });
      }

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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    console.log("Seçilen dosya başarıyla yakalandı:", file.name);
  };

  const recognitionRef = useRef(null);

  const startVoiceRecognition = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        setIsListening(false);
        return;
      } catch (err) {
        console.log("Oturum durdurulamadı:", err);
      }
    }

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
        setIsListening(true);
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
        stream.getTracks().forEach(track => track.stop());
        recognitionRef.current = null;
        setIsListening(false);
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
          setSearchType("hotel");
          setActivePanel(null);
          setBookingDetails({ city: "", departureCity: "", arrivalCity: "", checkIn: "", checkOut: "", guests: "", hotelName: "", airline: "", price: "" });
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
        {!isRightSidebarOpen && isChatActive && (
          <button
            onClick={() => setIsRightSidebarOpen(true)}
            className="absolute top-4 right-4 z-30 p-2 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-all duration-200 focus:outline-none cursor-pointer flex items-center justify-center"
            title="Expand Details Panel"
          >
            <PanelRightOpen size={18} />
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
        </video>

        <div className="flex-1 flex h-full relative z-10 w-full overflow-hidden">

          {/* CHAT ALANI */}
          <div className="flex flex-col h-full relative min-w-0 flex-1 transition-all duration-300 ease-in-out w-full">
            <div className="flex-1 overflow-y-auto px-4 py-8 flex flex-col items-center justify-center h-full relative">

              {!isChatActive ? (
                // ==================== 1. KARŞILAMA EKRANI VE ORTAKDAKİ INPUT ====================
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

                  {/* Ortadaki Arama Çubuğu */}
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
                          <>
                            <textarea
                              ref={textareaRef}
                              rows={1}
                              value={searchQuery}
                              onChange={handleTextareaChange}
                              onKeyDown={handleKeyDown}
                              placeholder={t("input_placeholder_welcome")}
                              className="w-full pl-3 pr-28 py-2.5 bg-transparent text-black placeholder-black/40 focus:outline-none resize-none max-h-32 text-sm leading-relaxed"
                            />
                            <div className="absolute right-2 flex items-center gap-1.5 z-40">
                              <input
                                type="file"
                                ref={welcomeFileInputRef}
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
                          <div className="flex items-center justify-between w-full px-2 animate-fade-in">
                            <span className="text-xl text-slate-400 font-light select-none cursor-not-allowed opacity-50">＋</span>
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
                <div className="w-full max-w-[850px] flex-1 flex flex-col h-full relative justify-between overflow-hidden">
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
                            {msg.chatStatus === "BOOKING" && msg.selectedItem && (
                              <div className="mt-3 text-right">
                                <button
                                  onClick={() => navigate('/reservation', { state: { selectedItem: msg.selectedItem } })}
                                  className="px-4 py-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-semibold rounded-xl shadow-sm transition-colors cursor-pointer"
                                >
                                  {t("proceed_to_reservation", "Proceed to Reservation")}
                                </button>
                              </div>
                            )}
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
                                  // Otel kartını tıklanabilir bir butona dönüştürüyoruz
                                  const isCurrentlySelected = selectedHotel && (selectedHotel.name === result.name || selectedHotel.hotelId === result.hotelId);
                                  
                                  const formattedPrice = result.price != null && !isNaN(result.price)
                                    ? new Intl.NumberFormat('tr-TR', {
                                        style: 'currency',
                                        currency: result.currency || 'TRY',
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                      }).format(result.price)
                                    : `${result.price} ${result.currency || 'TRY'}`;
                                    
                                  const locationParts = [result.city, result.town, result.village, result.region].filter(Boolean);
                                  const uniqueLocationParts = [...new Set(locationParts)];
                                  const locationText = uniqueLocationParts.length > 0 ? uniqueLocationParts.join(', ') : '';

                                  return (
                                    <button
                                      key={idx}
                                      onClick={() => {
                                        setSelectedHotel(result);
                                        setActivePanel('hotelDetail');
                                        setBookingDetails(prev => ({
                                          ...prev,
                                          hotelName: result.name || result.hotelId,
                                          price: formattedPrice
                                        }));
                                      }}
                                      className={cn(
                                        "w-full text-left bg-white border rounded-xl p-3 shadow-sm flex items-start gap-3 transition-all duration-200 cursor-pointer hover:border-amber-500 hover:shadow-md focus:outline-none",
                                        isCurrentlySelected ? "border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/50" : "border-slate-200"
                                      )}
                                    >
                                      {/* Thumbnail */}
                                      <div className="w-16 h-16 rounded-lg bg-slate-100 flex-shrink-0 overflow-hidden flex items-center justify-center relative">
                                        {(result.thumbnailFull || result.thumbnail) ? (
                                          <img
                                            src={result.thumbnailFull || result.thumbnail}
                                            alt={result.name || "Hotel"}
                                            className="w-full h-full object-cover"
                                            onError={(e) => { 
                                              e.currentTarget.style.display = 'none'; 
                                              if (e.currentTarget.nextElementSibling) {
                                                e.currentTarget.nextElementSibling.classList.remove('hidden');
                                              }
                                            }}
                                          />
                                        ) : null}
                                        <div className={`absolute inset-0 flex items-center justify-center ${(result.thumbnailFull || result.thumbnail) ? 'hidden' : ''}`}>
                                          <span className="text-xl">🏨</span>
                                        </div>
                                      </div>

                                      {/* Content */}
                                      <div className="flex-1 min-w-0 flex flex-col gap-1">
                                        <div className="flex justify-between items-start">
                                          <div className="flex flex-col min-w-0 pr-2">
                                            <span className="font-bold text-[#1E232C] text-sm leading-tight flex items-center gap-1 flex-wrap">
                                              {result.name || result.hotelId}
                                              {result.stars && (
                                                <span className="text-amber-400 text-xs flex items-center flex-shrink-0 bg-amber-50 px-1 py-0.5 rounded">
                                                  {result.stars}<Star size={10} className="ml-0.5 fill-amber-400" />
                                                </span>
                                              )}
                                            </span>
                                            {locationText && (
                                              <span className="text-[11px] text-slate-500 mt-0.5 truncate flex items-center gap-1">
                                                <MapPin size={10} /> {locationText}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                        
                                        <div className="flex justify-between items-end mt-1">
                                          <div className="flex flex-wrap gap-1">
                                            {(result.boardName || result.boardType || result.pensionType) && (
                                              <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wide inline-flex items-center">
                                                {result.boardName || result.boardType || result.pensionType}
                                              </span>
                                            )}
                                          </div>
                                          <span className="text-[#3B82F6] font-extrabold text-sm flex-shrink-0">
                                            {formattedPrice}
                                          </span>
                                        </div>
                                      </div>
                                    </button>
                                  );
                                }
                              })}
                            </div>
                          )}
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
                  <div className="w-full p-4 bg-transparent z-30 mt-auto">
                    <div
                      className="rounded-2xl shadow-xl border w-full transition-all duration-300 relative z-30"
                      style={{
                        backgroundColor: "rgba(255, 255, 255, 0.08)",
                        borderColor: "rgba(255, 255, 255, 0.15)",
                        backdropFilter: "blur(20px)"
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

          {/* ==================== 3. AKTİF REZERVASYON ÖNİZLEME PANELİ ==================== */}
          {isChatActive && isRightSidebarOpen && (
            <div className="hidden lg:flex w-[320px] h-full border-l border-white/20 bg-white/10 backdrop-blur-xl p-6 flex-col justify-between animate-slide-in relative z-20">
              <div className="space-y-6">

                {/* Panel Başlığı */}
                <div className="flex items-center gap-2 pb-4 border-b border-white/10">
                  <div className="p-2 rounded-lg bg-amber-500/20 text-amber-600">
                    <Sparkles size={18} className="animate-pulse" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800 text-sm">Canlı Rezervasyon</h3>
                    <p className="text-[10px] text-slate-500">
                      {searchType === "hotel" ? "Otel aramanız güncelleniyor" : "Uçuş detaylarınız güncelleniyor"}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsRightSidebarOpen(false)}
                    className="p-1.5 bg-white/10 border border-slate-200/20 rounded-lg hover:bg-white/20 text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
                    title="Collapse Panel"
                  >
                    <PanelRightClose size={18} />
                  </button>
                </div>

                {/* Kart Görünümü */}
                <div className="bg-white/70 border border-white/40 rounded-2xl p-5 shadow-sm space-y-4">

                  {/* ================= OTEL MODU ALANLARI ================= */}
                  {searchType === "hotel" && (
                    <>
                      {/* Nerede */}
                      <div className="flex items-start gap-3">
                        <MapPin size={18} className="text-slate-400 mt-0.5" />
                        <div className="flex-1">
                          <span className="text-[10px] text-slate-400 block font-bold uppercase">Nerede</span>
                          <span className={`text-sm font-semibold ${bookingDetails.city ? "text-slate-800" : "text-slate-400 italic"}`}>
                            {bookingDetails.city || "Konum belirtilmedi..."}
                          </span>
                        </div>
                      </div>

                      {/* Giriş Tarihi */}
                      <div className="flex items-start gap-3 pt-3 border-t border-dashed border-slate-200">
                        <Calendar size={18} className="text-slate-400 mt-0.5" />
                        <div className="flex-1">
                          <span className="text-[10px] text-slate-400 block font-bold uppercase">Giriş Tarihi</span>
                          <span className={`text-sm font-semibold ${bookingDetails.checkIn ? "text-slate-800" : "text-slate-400 italic"}`}>
                            {bookingDetails.checkIn || "Giriş tarihi belirtilmedi..."}
                          </span>
                        </div>
                      </div>

                      {/* Çıkış Tarihi */}
                      <div className="flex items-start gap-3 pt-3 border-t border-dashed border-slate-200">
                        <Calendar size={18} className="text-slate-400 mt-0.5" />
                        <div className="flex-1">
                          <span className="text-[10px] text-slate-400 block font-bold uppercase">Çıkış Tarihi</span>
                          <span className={`text-sm font-semibold ${bookingDetails.checkOut ? "text-slate-800" : "text-slate-400 italic"}`}>
                            {bookingDetails.checkOut || "Çıkış tarihi belirtilmedi..."}
                          </span>
                        </div>
                      </div>

                      {/* Seçilen Otel */}
                      <div className="flex items-start gap-3 pt-3 border-t border-dashed border-slate-200">
                        <Hotel size={18} className="text-slate-400 mt-0.5" />
                        <div className="flex-1">
                          <span className="text-[10px] text-slate-400 block font-bold uppercase">Seçilen Otel</span>
                          <span className={`text-sm font-semibold block truncate ${bookingDetails.hotelName ? "text-slate-800" : "text-slate-400 italic"}`}>
                            {bookingDetails.hotelName || "Sohbetten seçin..."}
                          </span>
                        </div>
                      </div>
                    </>
                  )}

                  {/* ================= UÇAK MODU ALANLARI ================= */}
                  {searchType === "flight" && (
                    <>
                      {/* Kalkış Noktası */}
                      <div className="flex items-start gap-3">
                        <div className="relative mt-1">
                          <Plane size={18} className="text-slate-400 rotate-45" />
                        </div>
                        <div className="flex-1">
                          <span className="text-[10px] text-slate-400 block font-bold uppercase">Kalkış Noktası</span>
                          <span className={`text-sm font-semibold ${bookingDetails.departureCity ? "text-slate-800" : "text-slate-400 italic"}`}>
                            {bookingDetails.departureCity || "Kalkış noktası belirtilmedi..."}
                          </span>
                        </div>
                      </div>

                      {/* Varış Noktası */}
                      <div className="flex items-start gap-3 pt-3 border-t border-dashed border-slate-200">
                        <div className="relative mt-1">
                          <Plane size={18} className="text-[#3B82F6] rotate-90" />
                        </div>
                        <div className="flex-1">
                          <span className="text-[10px] text-slate-400 block font-bold uppercase">Varış Noktası</span>
                          <span className={`text-sm font-semibold ${bookingDetails.arrivalCity ? "text-slate-800" : "text-slate-400 italic"}`}>
                            {bookingDetails.arrivalCity || "Varış noktası belirtilmedi..."}
                          </span>
                        </div>
                      </div>

                      {/* Uçuş Tarihi */}
                      <div className="flex items-start gap-3 pt-3 border-t border-dashed border-slate-200">
                        <Calendar size={18} className="text-slate-400 mt-0.5" />
                        <div className="flex-1">
                          <span className="text-[10px] text-slate-400 block font-bold uppercase">Uçuş Tarihi</span>
                          <span className={`text-sm font-semibold ${bookingDetails.checkIn ? "text-slate-800" : "text-slate-400 italic"}`}>
                            {bookingDetails.checkIn || "Uçuş tarihi belirtilmedi..."}
                          </span>
                        </div>
                      </div>

                      {/* Seçilen Havayolu */}
                      <div className="flex items-start gap-3 pt-3 border-t border-dashed border-slate-200">
                        <Plane size={18} className="text-slate-400 mt-0.5" />
                        <div className="flex-1">
                          <span className="text-[10px] text-slate-400 block font-bold uppercase">Seçilen Havayolu</span>
                          <span className={`text-sm font-semibold block truncate ${bookingDetails.airline ? "text-slate-800" : "text-slate-400 italic"}`}>
                            {bookingDetails.airline || "Sohbetten uçuş seçin..."}
                          </span>
                        </div>
                      </div>
                    </>
                  )}

                  {/* ================= ORTAK ALAN: YOLCU / KONUK SAYISI ================= */}
                  <div className="flex items-start gap-3 pt-3 border-t border-slate-200">
                    <Users size={18} className="text-slate-400 mt-0.5" />
                    <div className="flex-1">
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">
                        {searchType === "hotel" ? "Konuk Sayısı" : "Yolcu Sayısı"}
                      </span>
                      <span className={`text-sm font-semibold ${bookingDetails.guests ? "text-slate-800" : "text-slate-400 italic"}`}>
                        {bookingDetails.guests || "Belirtilmedi..."}
                      </span>
                    </div>
                  </div>

                  {/* Fiyat Bilgisi */}
                  {bookingDetails.price && (
                    <div className="pt-3 border-t border-dashed border-slate-200 flex justify-between items-center">
                      <span className="text-xs text-slate-500 font-bold">Toplam Tutar:</span>
                      <span className="text-sm font-extrabold text-amber-600">{bookingDetails.price}</span>
                    </div>
                  )}

                </div>
              </div>

              {/* Alt Bilgi & CTA */}
              <div className="space-y-3">
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-center">
                  <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                    Tüm alanlar tamamlandığında hızlıca ödeme ve onay sayfasına geçebilirsin.
                  </p>
                </div>
                <button
                  disabled={
                    searchType === "hotel"
                      ? !bookingDetails.city || !bookingDetails.checkIn || !bookingDetails.checkOut || !selectedHotel
                      : !bookingDetails.departureCity || !bookingDetails.arrivalCity || !bookingDetails.checkIn
                  }
                  onClick={() => {
                    // Seçilen oteli state olarak rezervasyon sayfasına paslıyoruz
                    navigate('/reservation', {
                      state: {
                        selectedItem: selectedHotel,
                        bookingDetails: bookingDetails
                      }
                    });
                  }}
                  className="w-full py-3 bg-amber-500 text-white rounded-xl text-xs font-bold shadow-md hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  {searchType === "hotel" ? "Otel Rezervasyonunu Tamamla" : "Uçuş Biletini Satın Al"}
                </button>
              </div>
            </div>
          )}

          {/* Overlay Backdrop & Centered Modal */}
          {activePanel && (
            <div 
              className="fixed inset-0 bg-black/40 z-[100] transition-opacity backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
              onClick={() => setActivePanel(null)}
            >
              <div 
                className="w-full max-w-[850px] max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col relative animate-fade-in scale-100 transition-all"
                onClick={(e) => e.stopPropagation()}
              >
                {activePanel === 'hotelDetail' && (
                  <HotelDetailPanel 
                    hotel={selectedHotel} 
                    bookingDetails={bookingDetails} 
                    onClose={() => setActivePanel(null)} 
                    onProceed={() => setActivePanel('reservation')} 
                  />
                )}
                {activePanel === 'reservation' && (
                  <ReservationFormPanel 
                    hotel={selectedHotel} 
                    bookingDetails={bookingDetails} 
                    onClose={() => setActivePanel(null)}
                    onBack={() => setActivePanel('hotelDetail')}
                    guests={reservationGuests}
                    setGuests={setReservationGuests}
                    termsAccepted={reservationTermsAccepted}
                    setTermsAccepted={setReservationTermsAccepted}
                  />
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}