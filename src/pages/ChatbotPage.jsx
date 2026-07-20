import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  PanelLeftOpen,
  PanelRightOpen,
  PanelRightClose,
  Send,
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
import RightSidebar from "../components/RightSidebar";

function cn(...inputs) {
  return inputs.filter(Boolean).join(" ");
}

function formatPrice(price) {
  const num = Number(price);
  if (Number.isNaN(num)) return price;
  return Math.round(num).toLocaleString("tr-TR");
}

// TourVisio aramasında çocuklar yetişkin sayısına eklenerek gönderilir (TourVisio'da
// ayrı bir çocuk kavramı yok), ama kullanıcıya burada gerçek yetişkin/çocuk ayrımı
// gösterilir.
function formatGuestCount(adultCount, childCount, passengerCount, t, infantCount) {
  if (adultCount) {
    const parts = [`${adultCount} ${t("unit_adult")}`];
    if (childCount) {
      parts.push(`${childCount} ${t("unit_child")}`);
    }
    if (infantCount) {
      parts.push(`${infantCount} ${t("unit_infant")}`);
    }
    return parts.join(", ");
  }
  if (passengerCount) {
    return `${passengerCount} ${t("unit_person")}`;
  }
  return null;
}

function formatFlightDateTime(value) {
  if (!value) return value;
  // Sadece tarih ("2026-08-01") ile tarih+saat ("2026-08-01T09:05:00") ayrımı yap
  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...(isDateOnly ? {} : { hour: "2-digit", minute: "2-digit" })
  });
}

// TourVisio GetProductInfo yanıtını HotelDetailPanel'in beklediği düz alanlara çevirir
// (fotoğraf galerisi, açıklama metni, olanaklar/temalar isim listeleri).
function mapProductInfoToHotelDetail(productInfo) {
  const hotel = productInfo?.body?.hotel;
  if (!hotel) return {};

  const photoUrls = new Set();
  if (hotel.mediaFiles) {
    hotel.mediaFiles.forEach(m => photoUrls.add(m.urlFull || m.url));
  }
  (hotel.seasons || []).forEach(season => {
    (season.mediaFiles || []).forEach(m => photoUrls.add(m.urlFull || m.url));
  });

  let description = "";
  const firstSeason = (hotel.seasons || [])[0];
  if (firstSeason?.textCategories) {
    const texts = firstSeason.textCategories
      .flatMap(cat => cat.presentations || [])
      .map(p => p.text)
      .filter(Boolean);
    description = texts.join("\n\n");
  }

  const facilities = new Set();
  if (firstSeason?.facilityCategories) {
    firstSeason.facilityCategories.forEach(cat => {
      (cat.facilities || []).forEach(f => { if (f.name) facilities.add(f.name); });
    });
  }

  return {
    address: hotel.address || null,
    photos: [...photoUrls].filter(Boolean),
    description: description || null,
    facilities: [...facilities],
    themes: (hotel.themes || []).map(t => t.name).filter(Boolean),
  };
}

function formatBaggage(baggage, t) {
  if (!baggage || baggage === "0kg" || baggage === "0 kg") {
    return t ? t("baggage_not_included") : "Baggage not included";
  }
  return baggage;
}

export default function Index() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isChatActive, setIsChatActive] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingStep, setThinkingStep] = useState("");

  // --- Seçilen Otel / Uçuş Objesi ---
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [hotelDetailLoading, setHotelDetailLoading] = useState(false);

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
    checkIn: "",        // Otel için Giriş / Uçak için Gidiş Tarihi
    checkOut: "",       // Sadece Otel için Çıkış Tarihi
    guests: "",
    adultCount: 1,
    childCount: 0,
    childAges: [],
    passengerCount: 1,
    hotelName: "",
    price: "",
    departureCity: "",  // Uçak için: Kalkış Noktası
    arrivalCity: "",    // Uçak için: Varış Noktası
    airline: "",        // Uçak için: Havayolu
    returnDate: ""       // Uçak için: Dönüş Tarihi (sadece gidiş-dönüşte dolu)
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('sessionId') || '';
  const [isListening, setIsListening] = useState(false);

  const videoRef = useRef(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

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

          // Arama tipini, en güncel sonuç içeren mesajdaki verinin şekline göre belirle
          // (bookingMeta hiç yazılmamış eski sohbetlerde bile doğru çalışır)
          const lastResultMessage = [...response.data].reverse().find(msg => msg.results && msg.results.length > 0);
          if (lastResultMessage) {
            const isFlight = lastResultMessage.results[0].airline !== undefined;
            setSearchType(isFlight ? "flight" : "hotel");
          }

          // Geçmiş mesajlar içinde en güncel bookingMeta'yı bulup sağ tarafa doldur
          const lastMetaMessage = [...response.data].reverse().find(msg => msg.bookingMeta);
          if (lastMetaMessage && lastMetaMessage.bookingMeta) {
            setBookingDetails(prev => ({ ...prev, ...lastMetaMessage.bookingMeta }));
            if (!lastResultMessage && lastMetaMessage.bookingMeta.type) {
              setSearchType(lastMetaMessage.bookingMeta.type);
            }
          }

            // Bu oturum için backend'de toplanmış kriterleri (kalkış/varış/yolcu/tarih)
            // ayrıca çek — mesaj geçmişinde bu bilgiler saklanmıyor, oturumun kendi
            // kriter kaydından (search_criteria_json) geliyor.
            try {
              const criteriaResponse = await api.get(`/api/chat/sessions/${sessionId}/criteria`);
              const c = criteriaResponse.data;
              if (c) {
                setBookingDetails(prev => ({
                  ...prev,
                  city: c.locationOrHotelName || prev.city,
                  checkIn: c.checkInDate || c.departureDate || prev.checkIn,
                  checkOut: c.checkOutDate || prev.checkOut,
                  guests: formatGuestCount(c.adultCount, c.childCount, c.passengerCount, t, c.infantCount) || prev.guests,
                  adultCount: c.adultCount !== undefined && c.adultCount !== null ? c.adultCount : prev.adultCount,
                  childCount: c.childCount !== undefined && c.childCount !== null ? c.childCount : prev.childCount,
                  childAges: c.childAges || prev.childAges,
                  passengerCount: c.passengerCount !== undefined && c.passengerCount !== null ? c.passengerCount : prev.passengerCount,
                  departureCity: c.departureLocation || prev.departureCity,
                  arrivalCity: c.arrivalLocation || prev.arrivalCity,
                  returnDate: c.returnDate || prev.returnDate
                }));
              }
            } catch (criteriaErr) {
            console.error("Failed to load session criteria", sessionId, criteriaErr);
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
      setBookingDetails({ city: "", departureCity: "", arrivalCity: "", checkIn: "", checkOut: "", guests: "", adultCount: 1, childCount: 0, childAges: [], passengerCount: 1, hotelName: "", airline: "", price: "", returnDate: "" });
      setSelectedHotel(null);
      setSelectedFlight(null);
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
        extractedFromQuery.guests = `${guestMatch[1]} ${t("unit_person")}`;
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

      // 3. Backend'in çözdüğü arama kriterlerinden (varsa) sağ paneli doldur.
      // Metinden regex ile tahmin etmek kırılgan; backend zaten SearchCriteria'yı
      // çözüyor, onu doğrudan kullanmak çok daha güvenilir (kalkış/varış/yolcu
      // sayısı gibi alanlar artık kullanıcı bunları söyler söylemez dolar).
      if (data.criteria) {
        const c = data.criteria;
        setBookingDetails(prev => ({
          ...prev,
          city: c.locationOrHotelName || prev.city,
          checkIn: c.checkInDate || c.departureDate || extractedFromQuery.checkIn || prev.checkIn,
          checkOut: c.checkOutDate || extractedFromQuery.checkOut || prev.checkOut,
          guests: formatGuestCount(c.adultCount, c.childCount, c.passengerCount, t, c.infantCount) || extractedFromQuery.guests || prev.guests,
          adultCount: c.adultCount !== undefined && c.adultCount !== null ? c.adultCount : prev.adultCount,
          childCount: c.childCount !== undefined && c.childCount !== null ? c.childCount : prev.childCount,
          childAges: c.childAges || prev.childAges,
          passengerCount: c.passengerCount !== undefined && c.passengerCount !== null ? c.passengerCount : prev.passengerCount,
          departureCity: c.departureLocation || prev.departureCity,
          arrivalCity: c.arrivalLocation || prev.arrivalCity,
          returnDate: c.returnDate || prev.returnDate
        }));
      } else {
        // Backend kriteri dönmediyse (ör. kapsam dışı mesaj) en azından kullanıcının
        // sorgusundaki verileri güncelle
        setBookingDetails(prev => ({
          ...prev,
          checkIn: extractedFromQuery.checkIn || prev.checkIn,
          checkOut: extractedFromQuery.checkOut || prev.checkOut,
          guests: extractedFromQuery.guests || prev.guests
        }));
      }

      // 4. Sonuç listesindeki ilk (en iyi) öğeden otel adı / uçuş fiyatı için bir
      // varsayılan doldur — kullanıcı bir kart seçtiğinde bu değerler o kartla değişir.
      if (data.results && data.results.length > 0) {
        const firstItem = data.results[0];
        const isFlight = firstItem.airline !== undefined;

        setBookingDetails(prev => {
          if (isFlight) {
            return {
              ...prev,
              airline: firstItem.airline || prev.airline,
              price: `${formatPrice(firstItem.price)} ${firstItem.currency || 'TRY'}`
            };
          } else {
            return {
              ...prev,
              hotelName: firstItem.name || firstItem.hotelId || prev.hotelName,
              price: `${formatPrice(firstItem.price)} ${firstItem.currency || 'TRY'}`
            };
          }
        });
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
          setBookingDetails({ city: "", departureCity: "", arrivalCity: "", checkIn: "", checkOut: "", guests: "", adultCount: 1, childCount: 0, childAges: [], passengerCount: 1, hotelName: "", airline: "", price: "", returnDate: "" });
          setSelectedHotel(null);
          setSelectedFlight(null);
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

                  {/* Örnek Soru Çipleri */}
                  <div className="w-full max-w-[700px] flex flex-col items-center gap-2">
                    <span className="text-[11px] text-[#1E232C]/60 font-semibold uppercase tracking-wider">
                      {t("try_asking")}
                    </span>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {[
                        "starter_hotel_antalya",
                        "starter_flight_ist_ayt",
                        "starter_best_hotels_antalya"
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
                          {(msg.text || (msg.chatStatus === "BOOKING" && msg.selectedItem)) && (
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
                                    onClick={() => navigate('/reservation', { state: { selectedItem: msg.selectedItem, sessionId: sessionId } })}
                                    className="px-4 py-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-semibold rounded-xl shadow-sm transition-colors cursor-pointer"
                                  >
                                    {t("proceed_to_reservation", "Proceed to Reservation")}
                                  </button>
                                </div>
                              )}
                            </div>
                          )}

                          {msg.results && msg.results.length > 0 && (
                            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                              {msg.results.map((result, idx) => {
                                const isFlight = result.airline !== undefined;
                                if (isFlight) {
                                  const isCurrentlySelected = selectedFlight
                                    && selectedFlight.airline === result.airline
                                    && selectedFlight.departureTime === result.departureTime;

                                  return (
                                    <button
                                      key={idx}
                                      onClick={() => {
                                        setSelectedFlight(result);
                                        // Tıklanan uçuş bilgisini sağdaki bar state'ine anında aktarıyoruz
                                        setBookingDetails(prev => ({
                                          ...prev,
                                          airline: result.airline,
                                          checkIn: result.departureTime || prev.checkIn,
                                          // returnDepartureTime sadece gidiş-dönüş uçuşlarında dolu gelir
                                          returnDate: result.returnDepartureTime || "",
                                          price: `${formatPrice(result.price)} ${result.currency || 'TRY'}`
                                        }));
                                      }}
                                      className={cn(
                                        "w-full text-left bg-white border rounded-xl p-4 shadow-sm flex flex-col gap-2 transition-all duration-200 cursor-pointer hover:border-amber-500 hover:shadow-md focus:outline-none",
                                        isCurrentlySelected ? "border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/50" : "border-slate-200"
                                      )}
                                    >
                                      <div className="flex justify-between items-center">
                                        <span className="font-bold text-[#1E232C] text-sm">✈️ {result.airline}</span>
                                        <span className="text-[#3B82F6] font-bold text-sm">{formatPrice(result.price)} {result.currency}</span>
                                      </div>
                                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                                        <div><strong>{t("reservation_departure")}:</strong> {formatFlightDateTime(result.departureTime)}</div>
                                        <div><strong>{t("reservation_arrival")}:</strong> {formatFlightDateTime(result.arrivalTime)}</div>
                                        <div><strong>{t("reservation_transfers")}:</strong> {result.transfers}</div>
                                        <div><strong>{t("reservation_baggage")}:</strong> {formatBaggage(result.baggage, t)}</div>
                                      </div>
                                      {result.returnDepartureTime && (
                                        <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-2 mt-1 border-t border-dashed border-slate-200">
                                          <div className="col-span-2 font-bold text-[#1E232C]">↩ {result.returnAirline || result.airline}</div>
                                          <div><strong>{t("reservation_return_departure_short")}:</strong> {formatFlightDateTime(result.returnDepartureTime)}</div>
                                          <div><strong>{t("reservation_return_arrival_short")}:</strong> {formatFlightDateTime(result.returnArrivalTime)}</div>
                                          <div><strong>{t("reservation_transfers")}:</strong> {result.returnTransfers}</div>
                                          <div><strong>{t("reservation_baggage")}:</strong> {formatBaggage(result.returnBaggage, t)}</div>
                                        </div>
                                      )}
                                    </button>
                                  );

                                } else {
                                  // Otel kartını tıklanabilir bir butona dönüştürüyoruz
                                  const isCurrentlySelected = selectedHotel && (selectedHotel.name === result.name || selectedHotel.hotelId === result.hotelId);
                                  
                                  // Küsüratsız, yuvarlanmış fiyat (kullanıcı isteği: "13463.87" değil "13.463")
                                  const formattedPrice = `${formatPrice(result.price)} ${result.currency || 'TRY'}`;
                                    
                                  const locationParts = [result.city, result.town, result.village, result.region].filter(Boolean);
                                  const uniqueLocationParts = [...new Set(locationParts)];
                                  const locationText = uniqueLocationParts.length > 0 ? uniqueLocationParts.join(', ') : '';

                                  return (
                                    <button
                                      key={idx}
                                      onClick={async () => {
                                        setSelectedHotel(result);
                                        setActivePanel('hotelDetail');
                                        setBookingDetails(prev => ({
                                          ...prev,
                                          hotelName: result.name || result.hotelId,
                                          price: formattedPrice
                                        }));

                                        if (result.hotelId) {
                                          setHotelDetailLoading(true);
                                          try {
                                            const detailResponse = await api.post('/api/hotels/productinfo', {
                                              productType: 2,
                                              ownerProvider: result.provider || 2,
                                              product: result.hotelId,
                                              culture: 'tr-TR'
                                            });
                                            const mappedDetail = mapProductInfoToHotelDetail(detailResponse.data);
                                            setSelectedHotel(prev =>
                                              prev && prev.hotelId === result.hotelId ? { ...prev, ...mappedDetail } : prev
                                            );
                                          } catch (err) {
                                            console.log("Otel detayları yüklenemedi:", err);
                                          } finally {
                                            setHotelDetailLoading(false);
                                          }
                                        }
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
          {/* Kullanıcı bir otel/uçuş seçene kadar bu panel boş detaylarla gösterilebilir; ayrıca elle kapatılabilir */}
          {isChatActive && isRightSidebarOpen && (
            <RightSidebar 
              isRightSidebarOpen={isRightSidebarOpen}
              setIsRightSidebarOpen={setIsRightSidebarOpen}
              searchType={searchType}
              bookingDetails={bookingDetails}
              selectedHotel={selectedHotel}
              selectedFlight={selectedFlight}
              sessionId={sessionId}
            />
          )}

          {/* Overlay Backdrop & Centered Modal */}
          {activePanel && (
            <div 
              className="fixed inset-0 bg-black/40 z-[100] transition-opacity backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
              onClick={() => setActivePanel(null)}
            >
              <div
                className="w-full max-w-[850px] h-[85vh] max-h-[85vh] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col relative animate-fade-in scale-100 transition-all"
                onClick={(e) => e.stopPropagation()}
              >
                {activePanel === 'hotelDetail' && (
                  <HotelDetailPanel
                    hotel={selectedHotel}
                    bookingDetails={bookingDetails}
                    loadingDetail={hotelDetailLoading}
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