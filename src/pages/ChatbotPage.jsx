import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
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
  Sparkles,
  LogIn,
  AlertTriangle
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../components/ThemeContext";
import { useAuth } from "../components/AuthContext";
import ChatSidebar from "../components/ChatSidebar";
import HotelDetailPanel from "../components/HotelDetailPanel";
import ReservationFormPanel from "../components/ReservationFormPanel";
import FlightDetailPanel from "../components/FlightDetailPanel";
import FlightReservationFormPanel from "../components/FlightReservationFormPanel";
import RightSidebar from "../components/RightSidebar";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function cn(...inputs) {
  return inputs.filter(Boolean).join(" ");
}

function formatPrice(price) {
  const num = Number(price);
  if (Number.isNaN(num)) return price;
  return Math.round(num).toLocaleString("tr-TR");
}


function formatLocalDate(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseFlexibleDate(value) {
  if (!value) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : new Date(value);
  }

  const raw = String(value).trim();

  const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const numericMatch = raw.match(/^(\d{1,2})[./-](\d{1,2})(?:[./-](\d{2,4}))?$/);
  if (numericMatch) {
    let [, day, month, year] = numericMatch;
    const currentYear = new Date().getFullYear();

    if (!year) {
      year = String(currentYear);
    } else if (year.length === 2) {
      year = `20${year}`;
    }

    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const monthMap = {
    ocak: 0,
    şubat: 1,
    subat: 1,
    mart: 2,
    nisan: 3,
    mayıs: 4,
    mayis: 4,
    haziran: 5,
    temmuz: 6,
    ağustos: 7,
    agustos: 7,
    eylül: 8,
    eylul: 8,
    ekim: 9,
    kasım: 10,
    kasim: 10,
    aralık: 11,
    aralik: 11,
    january: 0,
    february: 1,
    march: 2,
    april: 3,
    may: 4,
    june: 5,
    july: 6,
    august: 7,
    september: 8,
    october: 9,
    november: 10,
    december: 11,
  };

  const textualMatch = raw
    .toLocaleLowerCase("tr-TR")
    .match(/^(\d{1,2})\s+([a-zçğıöşü]+)(?:\s+(\d{4}))?$/i);

  if (textualMatch) {
    const [, dayText, monthText, yearText] = textualMatch;
    const month = monthMap[monthText];

    if (month === undefined) return null;

    const now = new Date();
    let year = yearText ? Number(yearText) : now.getFullYear();
    let date = new Date(year, month, Number(dayText));

    if (!yearText) {
      const todayOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      if (date < todayOnly) {
        year += 1;
        date = new Date(year, month, Number(dayText));
      }
    }

    return Number.isNaN(date.getTime()) ? null : date;
  }

  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function extractNightCount(value) {
  if (value === null || value === undefined || value === "") return null;

  if (typeof value === "number" && Number.isFinite(value)) {
    const normalized = Math.trunc(value);
    return normalized > 0 ? normalized : null;
  }

  const text = String(value).toLocaleLowerCase("tr-TR");
  const match = text.match(
    /(?:^|\s)(\d{1,3})\s*(?:gece|gecelik|night|nights|nacht|nächte)(?:\s|$)/i
  );

  if (!match) return null;

  const count = Number.parseInt(match[1], 10);
  return count > 0 ? count : null;
}

function calculateCheckoutDate(checkInValue, nightCountValue) {
  const checkInDate = parseFlexibleDate(checkInValue);
  const nightCount = extractNightCount(nightCountValue);

  if (!checkInDate || !nightCount) return "";

  const checkOutDate = new Date(checkInDate);
  checkOutDate.setDate(checkOutDate.getDate() + nightCount);

  return formatLocalDate(checkOutDate);
}

// TourVisio aramasÄ±nda Ã§ocuklar yetiÅŸkin sayÄ±sÄ±na eklenerek gÃ¶nderilir (TourVisio'da
// ayrÄ± bir Ã§ocuk kavramÄ± yok), ama kullanÄ±cÄ±ya burada gerÃ§ek yetiÅŸkin/Ã§ocuk ayrÄ±mÄ±
// gÃ¶sterilir.
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

// TourVisio GetProductInfo yanÄ±tÄ±nÄ± HotelDetailPanel'in beklediÄŸi dÃ¼z alanlara Ã§evirir
// (fotoÄŸraf galerisi, aÃ§Ä±klama metni, olanaklar/temalar isim listeleri).
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

  // TourVisio her olanaÄŸÄ± "highlighted" (otelin Ã¶ne Ã§Ä±kardÄ±ÄŸÄ±) olarak
  // iÅŸaretleyebiliyor â€” Ã¶nceden bu bilgi atÄ±lÄ±p dÃ¼z bir isim listesine
  // indirgeniyordu. ArtÄ±k obje olarak taÅŸÄ±nÄ±yor ki panelde Ã¶ne Ã§Ä±kanlar
  // ayrÄ± gÃ¶sterilebilsin.
  const facilitiesByName = new Map();
  if (firstSeason?.facilityCategories) {
    firstSeason.facilityCategories.forEach(cat => {
      (cat.facilities || []).forEach(f => {
        if (f.name && !facilitiesByName.has(f.name)) {
          facilitiesByName.set(f.name, { name: f.name, highlighted: Boolean(f.highlighted) });
        }
      });
    });
  }

  return {
    address: hotel.address || null,
    photos: [...photoUrls].filter(Boolean),
    description: description || null,
    facilities: [...facilitiesByName.values()],
    themes: (hotel.themes || []).map(t => t.name).filter(Boolean),
  };
}

// Bot cevabÄ±nÄ± karakter karakter "yazÄ±lÄ±yormuÅŸ" gibi gÃ¶sterir. Otel/uÃ§ak
// kartlarÄ± (msg.results) buna dahil deÄŸil â€” onlar zaten anÄ±nda gÃ¶rÃ¼nÃ¼yor,
// sadece metin cevabÄ± yavaÅŸÃ§a yazÄ±lÄ±r.
const markdownComponents = {
  table: ({ node, ...props }) => (
    <div className="my-3 overflow-x-auto rounded-xl border border-slate-200 shadow-sm dark:border-slate-800">
      <table className="w-full text-xs border-collapse text-left" {...props} />
    </div>
  ),
  thead: ({ node, ...props }) => <thead className="bg-orange-50/80 dark:bg-orange-500/10 border-b border-orange-100 dark:border-orange-500/20" {...props} />,
  th: ({ node, ...props }) => (
    <th className="px-3.5 py-2.5 font-bold text-slate-800 dark:text-slate-100 whitespace-nowrap" {...props} />
  ),
  td: ({ node, ...props }) => (
    <td className="px-3.5 py-2.5 border-b border-slate-100 dark:border-slate-800/60 text-slate-700 dark:text-slate-300" {...props} />
  ),
  tr: ({ node, ...props }) => (
    <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors last:children:border-b-0" {...props} />
  ),
  p: ({ node, ...props }) => <p className="mb-1 last:mb-0" {...props} />,
  ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-1" {...props} />,
  ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-1" {...props} />,
  strong: ({ node, ...props }) => <strong className="font-bold text-slate-900 dark:text-white" {...props} />,
};

function TypewriterText({ text, animate, markdown }) {
  const [visibleChars, setVisibleChars] = useState(animate ? 0 : (text || "").length);

  useEffect(() => {
    if (!animate || !text) return;
    setVisibleChars(0);
    let i = 0;
    const CHARS_PER_TICK = 2;
    const TICK_MS = 15;
    const timer = setInterval(() => {
      i += CHARS_PER_TICK;
      setVisibleChars(Math.min(i, text.length));
      if (i >= text.length) clearInterval(timer);
    }, TICK_MS);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visibleText = !animate ? text : (text ? text.slice(0, visibleChars) : text);

  if (!markdown) return visibleText;
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
      {visibleText || ""}
    </ReactMarkdown>
  );
}

export default function Index() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { isGuest, user } = useAuth();

  const [accountRestricted, setAccountRestricted] = useState(() => localStorage.getItem('accountRestricted') === 'true');

  useEffect(() => {
    const handler = () => {
      setAccountRestricted(true);
    };
    window.addEventListener('accountRestricted', handler);
    return () => window.removeEventListener('accountRestricted', handler);
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 768);
  const [isChatActive, setIsChatActive] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingStep, setThinkingStep] = useState("");
  const [sessionCriteria, setSessionCriteria] = useState({ maxPrice: null, minStars: null });
  const isChatTerminated = messages.length > 0 && messages[messages.length - 1].chatStatus === 'TERMINATED';
  const [isChatCompleted, setIsChatCompleted] = useState(false);
  const isChatLocked = isChatTerminated || isChatCompleted;
  const lastResultMsgId = [...messages].reverse().find(m => m.results && m.results.length > 0)?.id;
  const lastResultMsg = messages.find(m => m.id === lastResultMsgId);
  const latestSearchResults = lastResultMsg
    ? (lastResultMsg.filteredHotels || lastResultMsg.originalHotels || lastResultMsg.results || [])
    : [];

  const updateBackendCriteria = async (filters) => {
    if (!sessionId) return;
    try {
      await api.post(`/api/chat/sessions/${sessionId}/criteria`, filters);
    } catch (err) {
      console.error("Failed to update criteria", err);
    }
  };

  // --- Seçilen Otel / Uçuş Objesi ---
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [hotelDetailLoading, setHotelDetailLoading] = useState(false);

  // Sağa paneldeki ("Sizin için bulundu") otel kartlarından seçim yapıldığında
  // çağrılır
  const handleSelectHotelFromPanel = async (result) => {
    const formattedPrice = `${formatPrice(result.price)} ${result.currency || 'TRY'}`;
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
  };

  const handleSelectFlightFromPanel = (result) => {
    const formattedPrice = `${formatPrice(result.price)} ${result.currency || 'TRY'}`;
    setSelectedFlight(result);
    setActivePanel('flightDetail');
    setBookingDetails(prev => ({
      ...prev,
      airline: result.airline,
      price: formattedPrice
    }));
  };

  // --- Arama Tipi ("hotel" | "flight") ---
  const [searchType, setSearchType] = useState("hotel");

  // --- Slide-in Panel State ---
  const [activePanel, setActivePanel] = useState(null); // 'hotelDetail' | 'reservation' | null
  const [hasValidSearch, setHasValidSearch] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);

  // --- Reservation Form Preserved State ---
  const [reservationGuests, setReservationGuests] = useState(null);
  const [reservationTermsAccepted, setReservationTermsAccepted] = useState(false);

  // --- Rezervasyon Ã–nizleme State'leri ---
  const [bookingDetails, setBookingDetails] = useState({
    city: "",           // Otel iÃ§in: Nerede (Konum)
    checkIn: "",        // Otel iÃ§in GiriÅŸ / UÃ§ak iÃ§in GidiÅŸ Tarihi
    checkOut: "",       // Sadece Otel iÃ§in Ã‡Ä±kÄ±ÅŸ Tarihi
    nightCount: null,
    guests: "",
    adultCount: 1,
    childCount: 0,
    childAges: [],
    infantCount: 0,
    infantAges: [],
    passengerCount: 1,
    hotelName: "",
    price: "",
    departureCity: "",  // UÃ§ak iÃ§in: KalkÄ±ÅŸ NoktasÄ±
    arrivalCity: "",    // UÃ§ak iÃ§in: VarÄ±ÅŸ NoktasÄ±
    airline: "",        // UÃ§ak iÃ§in: Havayolu
    returnDate: ""       // UÃ§ak iÃ§in: DÃ¶nÃ¼ÅŸ Tarihi (sadece gidiÅŸ-dÃ¶nÃ¼ÅŸte dolu)
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Guest users get or reuse a guestSessionId stored in sessionStorage
  const createGuestSessionId = () =>
    'guest-' + (window.crypto?.randomUUID
      ? window.crypto.randomUUID()
      : Math.random().toString(36).substring(2, 11));

  const getGuestSessionId = () => {
    let id = sessionStorage.getItem('guestSessionId');
    if (!id) {
      id = createGuestSessionId();
      sessionStorage.setItem('guestSessionId', id);
    }
    return id;
  };

  const urlSessionId = searchParams.get('sessionId');
  const sessionId = urlSessionId || (isGuest ? getGuestSessionId() : '');
  const [isListening, setIsListening] = useState(false);

  const videoRef = useRef(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const autoSendHandledRef = useRef(false);

  const email = user?.email || localStorage.getItem('userId') || sessionStorage.getItem('userId') || "";
  const profileFullNameForGreeting = user && (user.firstName || user.lastName)
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
    : null;
  const username = profileFullNameForGreeting || (email ? (email.includes('@') ? email.split('@')[0] : email) : "User");


  // Misafir sohbetini kayıt/giriş sonrasında kullanıcı hesabına bağla ve devam ettir.
  useEffect(() => {
    // URL'de sessionId olsa bile claim işlemini atlama.
    // Giriş sonrası misafir sohbeti ekranda açılabilir; fakat claim edilmezse
    // /api/chat/sessions listesine girmez ve "Son Sohbetler" bölümünde görünmez.
    if (isGuest || !user) return;

    const pendingGuestSessionId =
      sessionStorage.getItem('pendingGuestSessionId');

    if (!pendingGuestSessionId) return;

    let isCancelled = false;

    const restoreGuestSession = async () => {
      try {
        await api.post(
          `/api/chat/sessions/${pendingGuestSessionId}/claim`
        );

        if (isCancelled) return;

        // Zaten doğru sohbet açıksa gereksiz URL güncellemesi yapma.
        if (urlSessionId !== pendingGuestSessionId) {
          setSearchParams(
            { sessionId: pendingGuestSessionId },
            { replace: true }
          );
        }

        // Claim başarıyla tamamlandıktan sonra guest/pending değerlerini temizle.
        sessionStorage.removeItem('pendingGuestSessionId');
        sessionStorage.removeItem('guestSessionId');

        // ChatSidebar /api/chat/sessions listesini yeniden çeksin.
        window.dispatchEvent(
          new Event('chatSessionsUpdated')
        );
      } catch (error) {
        console.error(
          'Misafir sohbeti kullanıcı hesabına bağlanamadı:',
          error
        );

        if (isCancelled) return;

        // Claim başarısız olsa bile mevcut sohbetin ekranda kalmasını sağla.
        if (urlSessionId !== pendingGuestSessionId) {
          setSearchParams(
            { sessionId: pendingGuestSessionId },
            { replace: true }
          );
        }
      }
    };

    restoreGuestSession();

    return () => {
      isCancelled = true;
    };
  }, [
    isGuest,
    user,
    urlSessionId,
    setSearchParams,
  ]);

  const continueAfterAuthentication = (path) => {
    const guestChatSessionId = getGuestSessionId();
    sessionStorage.setItem('pendingGuestSessionId', guestChatSessionId);

    navigate(path, {
      state: {
        returnTo: `${location.pathname}${location.search}`,
        guestSessionId: guestChatSessionId,
      },
    });
  };

  // --- HTML5 Video Autoplay Engeli Ã‡Ã¶zÃ¼mÃ¼ & Tema DeÄŸiÅŸimi ---
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(err => console.log("Video oynatÄ±lamadÄ±:", err));
    }
  }, [theme]);

  // --- Oturum GeÃ§miÅŸini ve bookingMeta Durumunu YÃ¼kleme ---
  useEffect(() => {
    setIsChatCompleted(false);
    if (sessionId) {
      const loadHistory = async () => {
        try {
          setIsThinking(true);
          setThinkingStep("Loading history...");

          try {
            const sessionResponse = await api.get(`/api/chat/sessions/${sessionId}`);
            if (sessionResponse.data?.chatStatus === 'COMPLETED') {
              setIsChatCompleted(true);
            }
          } catch (sessionErr) {
            console.error("Failed to load session details", sessionId, sessionErr);
          }

          const response = await api.get(`/api/chat/sessions/${sessionId}/messages`);

          const history = response.data.map((msg, idx) => ({
            id: idx,
            text: msg.text,
            sender: msg.sender,
            results: msg.results || null,
            originalHotels: msg.results || [],
            filteredHotels: msg.results || [],
            chatStatus: msg.chatStatus || null,
            selectedItem: msg.selectedItem || null,
            bookingMeta: msg.bookingMeta || null
          }));

          setMessages(history);
          setIsChatActive(history.length > 0);

          // Arama tipini, en gÃ¼ncel sonuÃ§ iÃ§eren mesajdaki verinin ÅŸekline gÃ¶re belirle
          // (bookingMeta hiÃ§ yazÄ±lmamÄ±ÅŸ eski sohbetlerde bile doÄŸru Ã§alÄ±ÅŸÄ±r)
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

          try {
            const criteriaResponse = await api.get(`/api/chat/sessions/${sessionId}/criteria`);
            const c = criteriaResponse.data;
            if (c) {
              setBookingDetails(prev => {
                const resolvedCheckIn =
                  c.checkInDate ||
                  c.departureDate ||
                  prev.checkIn ||
                  "";

                const resolvedNightCount =
                  extractNightCount(
                    c.nightCount ??
                    c.nights ??
                    c.numberOfNights ??
                    c.duration
                  ) ??
                  prev.nightCount ??
                  null;

                const resolvedCheckOut =
                  c.checkOutDate ||
                  calculateCheckoutDate(
                    resolvedCheckIn,
                    resolvedNightCount
                  ) ||
                  prev.checkOut ||
                  "";

                return {
                  ...prev,
                  city: c.locationOrHotelName || prev.city || "",
                  checkIn: resolvedCheckIn,
                  checkOut: resolvedCheckOut,
                  nightCount: resolvedNightCount,
                  guests: formatGuestCount(c.adultCount, c.childCount, c.passengerCount, t, c.infantCount) || prev.guests || "",
                  adultCount: c.adultCount !== undefined && c.adultCount !== null ? c.adultCount : prev.adultCount,
                  childCount: c.childCount !== undefined && c.childCount !== null ? c.childCount : prev.childCount,
                  childAges: c.childAges || prev.childAges || [],
                  infantCount: c.infantCount !== undefined && c.infantCount !== null ? c.infantCount : prev.infantCount,
                  infantAges: c.infantAges || prev.infantAges || [],
                  passengerCount: c.passengerCount !== undefined && c.passengerCount !== null ? c.passengerCount : prev.passengerCount,
                  departureCity: c.departureLocation || prev.departureCity || "",
                  arrivalCity: c.arrivalLocation || prev.arrivalCity || "",
                  returnDate: c.returnDate || prev.returnDate || ""
                };
              });
              setSessionCriteria({
                maxPrice: c.maxPrice || null,
                minStars: c.minStars || null
              });

              const hasLocation = Boolean(c.locationOrHotelName || (c.departureLocation && c.arrivalLocation));
              const hasCheckIn = Boolean(c.checkInDate || c.departureDate);
              const hasResultsInHistory = Boolean(lastResultMessage && lastResultMessage.results && lastResultMessage.results.length > 0);
              if (hasResultsInHistory || (hasLocation && hasCheckIn)) {
                setHasValidSearch(true);
                setIsRightSidebarOpen(true);
              } else {
                setHasValidSearch(false);
                setIsRightSidebarOpen(false);
              }

              // Rezervasyon sayfasından (ReservationPage) geri dönüldüğünde seçili öte/uçuş ve detay panelini koru
              if (location.state?.selectedHotel) {
                setSelectedHotel(location.state.selectedHotel);
                if (location.state.restorePanel) {
                  setActivePanel('hotelDetail');
                }
              }
              if (location.state?.selectedFlight) {
                setSelectedFlight(location.state.selectedFlight);
                if (location.state.restorePanel) {
                  setActivePanel('flightDetail');
                }
              }
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
      if (!location.state?.initialPrompt) {
        setMessages([]);
        setIsChatActive(false);
        setHasValidSearch(false);
        setIsRightSidebarOpen(false);
        setSearchType("hotel");
        setSelectedHotel(null);
        setSelectedFlight(null);
      }
    }
  }, [sessionId]);

  // Welcome veya Favorites sayfasından aktarılan prompt ve selectedItem/inspectItem mantığı
  useEffect(() => {
    const prompt = location.state?.autoPrompt || location.state?.initialPrompt;
    if (prompt && !autoSendHandledRef.current) {
      const shouldAutoSend = location.state.autoSend !== false;
      autoSendHandledRef.current = true;
      setSearchQuery(prompt);
      navigate(location.pathname + location.search, { replace: true, state: {} });

      if (shouldAutoSend) {
        handleSend(prompt);
      }
    }

    const itemToInspect = location.state?.inspectItem || location.state?.selectedItem;
    if (itemToInspect) {
      const itemType = location.state.searchType || (itemToInspect.airline ? "flight" : "hotel");
      if (itemType === "flight") {
        setSelectedFlight(itemToInspect);
        setActivePanel("flightDetail");
      } else {
        setSelectedHotel(itemToInspect);
        setActivePanel("hotelDetail");
      }
      navigate(location.pathname + location.search, { replace: true, state: {} });
    }
  }, [location.state]);

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
  const handleSend = async (overridePrompt) => {
    const query = typeof overridePrompt === "string" ? overridePrompt.trim() : searchQuery.trim();
    if (!query) return;

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
      const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user.country) userCountry = user.country;
      }
    } catch (e) {
      console.error(e);
    }

    // Ayarlar sayfasÄ±ndaki "tercih edilen para birimi" seÃ§imi â€” Ã¶nceden burada
    // hep sabit "TRY" gÃ¶nderiliyordu, kullanÄ±cÄ±nÄ±n seÃ§tiÄŸi tercih hiÃ§ dikkate
    // alÄ±nmÄ±yordu.
    const CURRENCY_MAP = {
      try: { symbol: "TRY", name: "Turkish Lira" },
      usd: { symbol: "USD", name: "US Dollar" },
      eur: { symbol: "EUR", name: "Euro" },
      gbp: { symbol: "GBP", name: "British Pound" },
    };
    let preferredCurrency = CURRENCY_MAP.try;
    try {
      const storedLocalization = localStorage.getItem("localizationSettings");
      const parsed = storedLocalization ? JSON.parse(storedLocalization) : null;
      const key = parsed?.currency?.toLowerCase();
      if (key && CURRENCY_MAP[key]) {
        preferredCurrency = CURRENCY_MAP[key];
      }
    } catch (e) {
      console.error(e);
    }

    try {
      const response = await api.post('/api/chat/message', {
        message: query,
        sessionId: sessionId || null,
        country: userCountry,
        currencySymbol: preferredCurrency.symbol,
        currencyName: preferredCurrency.name,
        maxPrice: null,
        minStars: null
      });

      const data = response.data;
      const botMsg = {
        id: Date.now() + 1,
        text: data.reply,
        sender: "bot",
        results: data.results,
        originalHotels: data.results || [],
        filteredHotels: data.results || [],
        chatStatus: data.chatStatus,
        selectedItem: data.selectedItem,
        bookingMeta: data.bookingMeta || null,
        animate: true // yeni gelen cevap yazÄ±la yazÄ±la gÃ¶rÃ¼nsÃ¼n; geÃ§miÅŸ mesajlar animasyonsuz yÃ¼klenir
      };

      if (data.sessionId && !searchParams.get('sessionId')) {
        setSearchParams({ sessionId: data.sessionId }, { replace: true });
      }

      setMessages(prev => [...prev, botMsg]);

      // 1. Arama Tipini Güncelle ve YALNIZCA GERÇEK SONUÇLAR (results) GELDİĞİNDE Sağ Paneli Aç
      const isSearchIntent = Boolean(data.searchType && (data.searchType.includes("HOTEL") || data.searchType.includes("FLIGHT")));
      const hasResults = Boolean(data.results && data.results.length > 0);
      if (hasResults) {
        setHasValidSearch(true);
        setIsRightSidebarOpen(true);
      }

      if (data.searchType) {
        if (data.searchType.includes("HOTEL")) {
          setSearchType("hotel");
        } else if (data.searchType.includes("FLIGHT")) {
          setSearchType("flight");
        }
      }

      // 2. Kullanıcının Kendi Yazdığı Mesajdan (Sorgudan) Tarih ve Konuk Bilgilerini Ayıkla (Yedek Plan)
      let extractedFromQuery = {};
      const lowerQuery = query.toLocaleLowerCase('tr-TR');

      const extractedNightCount = extractNightCount(lowerQuery);
      if (extractedNightCount) {
        extractedFromQuery.nightCount = extractedNightCount;
      }

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

      // 3. Sağ paneli güncelle ve seyahat aramalarında otomatik olarak aç.
      if (data.criteria) {
        const c = data.criteria;
        if (c.searchType) {
          if (c.searchType.includes("HOTEL")) {
            setSearchType("hotel");
          } else if (c.searchType.includes("FLIGHT")) {
            setSearchType("flight");
          }
        }

        setBookingDetails(prev => {
          const resolvedCheckIn =
            c.checkInDate ||
            c.departureDate ||
            extractedFromQuery.checkIn ||
            prev.checkIn ||
            "";

          const resolvedNightCount =
            extractNightCount(
              c.nightCount ??
              c.nights ??
              c.numberOfNights ??
              c.duration
            ) ??
            extractedFromQuery.nightCount ??
            prev.nightCount ??
            null;

          const resolvedCheckOut =
            c.checkOutDate ||
            extractedFromQuery.checkOut ||
            calculateCheckoutDate(
              resolvedCheckIn,
              resolvedNightCount
            ) ||
            prev.checkOut ||
            "";

          return {
            ...prev,
            city: c.locationOrHotelName || prev.city || "",
            checkIn: resolvedCheckIn,
            checkOut: resolvedCheckOut,
            nightCount: resolvedNightCount,
            guests:
              formatGuestCount(
                c.adultCount,
                c.childCount,
                c.passengerCount,
                t,
                c.infantCount
              ) ||
              extractedFromQuery.guests ||
              prev.guests ||
              "",
            adultCount:
              c.adultCount !== undefined && c.adultCount !== null
                ? c.adultCount
                : prev.adultCount,
            childCount:
              c.childCount !== undefined && c.childCount !== null
                ? c.childCount
                : prev.childCount,
            childAges: c.childAges || prev.childAges || [],
            infantCount:
              c.infantCount !== undefined && c.infantCount !== null
                ? c.infantCount
                : prev.infantCount,
            infantAges: c.infantAges || prev.infantAges || [],
            passengerCount:
              c.passengerCount !== undefined && c.passengerCount !== null
                ? c.passengerCount
                : prev.passengerCount,
            departureCity:
              c.departureLocation || prev.departureCity || "",
            arrivalCity:
              c.arrivalLocation || prev.arrivalCity || "",
            returnDate:
              c.returnDate || prev.returnDate || "",
          };
        });
        setSessionCriteria({
          maxPrice: c.maxPrice || null,
          minStars: c.minStars || null
        });

        // Konum/Kalkış ve Giriş/Gidiş tarihi tanımlıysa, sağ paneli otomatik göster
        const hasLocation = Boolean(c.locationOrHotelName || (c.departureLocation && c.arrivalLocation));
        const hasCheckIn = Boolean(c.checkInDate || c.departureDate);
        if (hasLocation && hasCheckIn) {
          setHasValidSearch(true);
          setIsRightSidebarOpen(true);
        }
      }

      // 4. SonuÃ§ listesindeki ilk (en iyi) Ã¶ÄŸeden otel adÄ± / uÃ§uÅŸ fiyatÄ± iÃ§in bir
      // varsayÄ±lan doldur â€” kullanÄ±cÄ± bir kart seÃ§tiÄŸinde bu deÄŸerler o kartla deÄŸiÅŸir.
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
        // Misafir oturumlarÄ±nda sessionId URL'ye yazÄ±lmaz (geÃ§miÅŸ kaydedilmez)
        if (!isGuest) {
          setSearchParams({ sessionId: data.sessionId });
        }
      }

    } catch (err) {
      console.error("Failed to send message", err);
      const errorMsg = {
        id: Date.now() + 1,
        text: "Sorry, I couldn't reach the chat assistant. Please check your connection.",
        sender: "bot",
        animate: true
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
        console.log("Oturum durdurulamadÄ±:", err);
      }
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

      if (!SpeechRecognition) {
        alert("TarayÄ±cÄ±nÄ±z ses tanÄ±ma Ã¶zelliÄŸini desteklemiyor.");
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
        console.error("Speech API HatasÄ±:", event.error);
        if (event.error !== 'aborted') {
          alert(`TarayÄ±cÄ± Ses HatasÄ±: ${event.error}`);
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
      console.error("DonanÄ±m hatasÄ±:", err);
      setIsListening(false);
    }
  };
  const handleUpdateMessagePayload = (msgId, filteredList) => {
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, filteredHotels: filteredList } : m));
  };

  return (
    <div className={`flex w-full overflow-hidden bg-transparent font-sans relative ${isGuest ? 'h-[calc(100vh-33px)] mt-[33px]' : 'h-screen'}`}>
      {/* Katman 1 (z-0): Background Video */}
      <video
        ref={videoRef}
        src={theme === 'dark' ? "/videos/darkmode_bg.mp4" : "/videos/chatbot_bg.mp4"}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="fixed inset-0 w-full h-full object-cover z-0 pointer-events-none opacity-80 dark:opacity-40"
      />

      {/* Katman 2 (z-10): Overlay Mask */}
      <div className="fixed inset-0 z-10 pointer-events-none bg-white/10 dark:bg-black/30" />

      {/* Misafir BannerÄ± (z-50): fixed, her zaman en Ã¼stte â€” layout wrapper mt-[33px] ile telafi ediyor */}
      {isGuest && (
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 px-4 py-2 bg-amber-50/95 dark:bg-amber-950/90 backdrop-blur-sm border-b border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-medium shadow-sm">
          <LogIn size={13} className="flex-shrink-0" />
          <span>
            {t('guest.bannerText', 'Misafir olarak oturum aÃ§tÄ±nÄ±z. Sohbet geÃ§miÅŸinizi kaydetmek iÃ§in')}{' '}
          </span>
          <button
            onClick={() => continueAfterAuthentication('/login')}
            className="underline font-semibold hover:text-amber-900 dark:hover:text-amber-200 transition-colors cursor-pointer"
          >
            {t('guest.loginLink', 'GiriÅŸ Yap')}
          </button>
          <span>{t('guest.or', 'veya')}</span>
          <button
            onClick={() => continueAfterAuthentication('/signup')}
            className="underline font-semibold hover:text-amber-900 dark:hover:text-amber-200 transition-colors cursor-pointer"
          >
            {t('guest.registerLink', 'KayÄ±t Ol')}
          </button>
        </div>
      )}

      {/* Katman 3 (z-30): Sol Sidebar */}
      <ChatSidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        onNewChat={() => {
          setIsChatActive(false);
          setMessages([]);
          setSearchQuery("");
          setSearchType("hotel");
          setActivePanel(null);
          setHasValidSearch(false);
          setIsRightSidebarOpen(false);
          setIsChatCompleted(false);
          setBookingDetails({ city: "", departureCity: "", arrivalCity: "", checkIn: "", checkOut: "", nightCount: null, guests: "", adultCount: 1, childCount: 0, childAges: [], infantCount: 0, infantAges: [], passengerCount: 1, hotelName: "", airline: "", price: "", returnDate: "" });
          setSelectedHotel(null);
          setSelectedFlight(null);

          setSearchParams({}, { replace: true });
          sessionStorage.removeItem('pendingGuestSessionId');
          if (isGuest) {
            sessionStorage.setItem('guestSessionId', createGuestSessionId());
          } else {
            sessionStorage.removeItem('guestSessionId');
          }
        }}
      />

      {/* Katman 3 (z-20): Ana Ä°Ã§erik AlanÄ± */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden bg-transparent z-20">
        {!isSidebarOpen && (!isRightSidebarOpen || window.innerWidth >= 768) && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="absolute top-4 left-4 z-30 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-all duration-200 focus:outline-none cursor-pointer flex items-center justify-center"
            title="Expand Sidebar"
          >
            <PanelLeftOpen size={18} />
          </button>
        )}

        {(!isRightSidebarOpen || window.innerWidth < 1024) && (hasValidSearch || selectedHotel || selectedFlight) && (
          <button
            onClick={() => setIsRightSidebarOpen(prev => !prev)}
            className="absolute top-4 right-3 z-30 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-md hover:bg-slate-50 dark:hover:bg-slate-800 text-[#FF8A00] dark:text-orange-400 transition-all duration-200 focus:outline-none cursor-pointer flex items-center justify-center gap-1.5 text-xs font-bold"
            title="Rezervasyon Paneli"
          >
            <PanelRightOpen size={18} />
            <span className="hidden sm:inline">Rezervasyon Detayı</span>
          </button>
        )}

        <div
          className="relative z-20 flex lg:grid h-full w-full min-w-0 flex-1 gap-0 overflow-hidden"
          style={{
            gridTemplateColumns:
              isChatActive && hasValidSearch && isRightSidebarOpen
                ? "minmax(0, calc(100% - 420px)) 420px"
                : "minmax(0, 1fr)",
          }}
        >

          {/* CHAT ALANI */}
          <div className="h-full min-h-0 min-w-0 overflow-hidden transition-all duration-300 ease-in-out">
            <div className="relative flex h-full min-w-0 flex-col items-center overflow-y-auto px-4 py-8">

              {!isChatActive ? (
                // ==================== 1. KARÅžILAMA EKRANI VE ORTAKDAKÄ° INPUT ====================
                <div className="w-full max-w-[850px] my-auto animate-fade-in flex flex-col items-center relative z-20">
                  <div className="mb-8 text-center flex flex-col items-center">
                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-2 select-none text-center md:text-left">
                      <img
                        src="/logo.png"
                        alt="Sanny Logo"
                        className="h-16 md:h-20 w-auto object-contain flex-shrink-0"
                      />
                      <h1 className="text-2xl md:text-4xl font-extrabold text-[#1E232C] dark:text-slate-100 font-display">
                        {t(getGreetingKey(), { username })}
                      </h1>
                    </div>
                    <p className="text-[#1E232C]/70 dark:text-slate-300 text-sm font-semibold">
                      {t("ops_subtitle")}
                    </p>
                  </div>

                  {/* Ortadaki Arama Ã‡ubuÄŸu */}
                  <div
                    className="w-full rounded-2xl shadow-xl border mb-6 max-w-[700px] transition-all duration-300 relative z-30"
                    style={{
                      backgroundColor: theme === 'dark' ? "rgba(15, 23, 42, 0.6)" : "rgba(255, 255, 255, 0.08)",
                      borderColor: theme === 'dark' ? "rgba(255, 255, 255, 0.08)" : "rgba(255, 255, 255, 0.15)",
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
                              className="w-full pl-3 pr-28 py-2.5 bg-transparent text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none resize-none max-h-32 text-sm leading-relaxed"
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
                            <span className="text-xl text-slate-400 font-light select-none cursor-not-allowed opacity-50">ï¼‹</span>
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

                  {/* Ã–rnek Soru Ã‡ipleri */}
                  <div className="w-full max-w-[700px] flex flex-col items-center gap-2">
                    <span className="text-[11px] text-[#1E232C]/60 dark:text-slate-400 font-semibold uppercase tracking-wider">
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
                          className="px-3.5 py-1.5 bg-white/80 dark:bg-slate-900 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 hover:border-amber-500 rounded-full text-xs font-semibold text-slate-800 dark:text-slate-200 transition-all hover:scale-[1.02] cursor-pointer"
                        >
                          {t(queryKey)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                // ==================== 2. AKTÄ°F SOHBET LAYOUT'U ====================
                <div className="relative mx-auto flex h-full w-full max-w-[980px] min-w-0 flex-1 flex-col justify-between overflow-hidden">
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
                        <div className="flex min-w-0 max-w-[75%] flex-col">
                          {(msg.text || (msg.chatStatus === "BOOKING" && msg.selectedItem)) && (
                            <div
                              className={`max-w-full break-words p-4 rounded-2xl shadow-sm text-sm leading-relaxed whitespace-pre-wrap ${msg.sender === "user"
                                ? "bg-amber-500 text-white rounded-tr-none"
                                : "bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 text-[#0F172A] dark:text-slate-100 rounded-tl-none"
                                }`}
                            >
                              <TypewriterText text={msg.text} animate={msg.sender === "bot" && !!msg.animate} markdown={msg.sender === "bot"} />
                              {msg.chatStatus === "BOOKING" && msg.selectedItem && (
                                <div className="mt-3 text-right">
                                  <button
                                    onClick={() => navigate('/reservation', { state: { selectedItem: msg.selectedItem, bookingDetails: bookingDetails, sessionId: sessionId } })}
                                    className="px-4 py-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-semibold rounded-xl shadow-sm transition-colors cursor-pointer"
                                  >
                                    {t("proceed_to_reservation", "Proceed to Reservation")}
                                  </button>
                                </div>
                              )}
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
                          <div className="bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 text-[#0F172A] dark:text-slate-100 rounded-2xl rounded-tl-none p-4 shadow-sm flex items-center gap-3">
                            <div className="flex gap-1 flex-shrink-0">
                              <div className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" />
                              <div className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce [animation-delay:0.2s]" />
                              <div className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce [animation-delay:0.4s]" />
                            </div>
                            <span className="text-xs text-slate-500 dark:text-slate-400 italic font-medium">{thinkingStep}</span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Alt Sabit Sohbet GiriÅŸ AlanÄ± */}
                  <div className="w-full p-4 bg-transparent z-30 mt-auto">
                    <div
                      className="rounded-2xl shadow-xl border w-full transition-all duration-300 relative z-30"
                      style={{
                        backgroundColor: theme === 'dark' ? "rgba(15, 23, 42, 0.75)" : "rgba(255, 255, 255, 0.75)",
                        borderColor: theme === 'dark' ? "rgba(30, 41, 59, 0.8)" : "rgba(226, 232, 240, 0.8)"
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
                            disabled={isChatLocked}
                            placeholder={
                              isChatCompleted
                                ? t("chat_completed")
                                : isChatTerminated
                                  ? t("chat_terminated")
                                  : t("input_placeholder_chat")
                            }
                            className="w-full pl-3 pr-28 py-2.5 bg-transparent text-black dark:text-white placeholder-black/40 dark:placeholder-white/40 focus:outline-none resize-none max-h-32 text-sm leading-relaxed disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                          <div className="absolute right-2 flex items-center gap-1.5 z-40">
                            <button
                              type="button"
                              onClick={startVoiceRecognition}
                              disabled={isChatLocked}
                              className="p-1.5 text-blue-500 hover:text-blue-600 transition-colors focus:outline-none cursor-pointer relative z-50 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              <Mic size={16} className="pointer-events-none" />
                            </button>
                            <button
                              onClick={handleSend}
                              disabled={!searchQuery.trim() || isChatLocked}
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
          {isChatActive && hasValidSearch && isRightSidebarOpen && (
            <RightSidebar
              isRightSidebarOpen={isRightSidebarOpen}
              setIsRightSidebarOpen={setIsRightSidebarOpen}
              isSidebarOpen={isSidebarOpen}
              setIsSidebarOpen={setIsSidebarOpen}
              searchType={searchType}
              bookingDetails={bookingDetails}
              selectedHotel={selectedHotel}
              selectedFlight={selectedFlight}
              sessionId={sessionId}
              searchResults={latestSearchResults}
              onSelectHotel={handleSelectHotelFromPanel}
              onSelectFlight={handleSelectFlightFromPanel}
              onComplete={() => setActivePanel(searchType === 'hotel' ? 'hotelDetail' : 'flightDetail')}
            />
          )}

        </div>
      </div>

      {/* Overlay Backdrop & Centered Modal â€” root seviyesinde (ChatSidebar'Ä±n kardeÅŸi) render
          edilir, Ã§Ã¼nkÃ¼ "Ana Ä°Ã§erik AlanÄ±" (z-20) kendi stacking context'ini oluÅŸturuyor;
          modal onun Ä°Ã‡Ä°NDE kalsaydÄ±, iÃ§indeki z-[100] hiÃ§bir zaman root'taki ChatSidebar'Ä±n
          z-30'unu geÃ§emezdi (sol sidebar her zaman modalÄ±n Ã¶nÃ¼nde gÃ¶rÃ¼nÃ¼rdÃ¼). */}
      {activePanel && (
        <div
          className="fixed inset-0 bg-black/40 z-[100] transition-opacity flex items-center justify-center p-4 sm:p-6"
          onClick={() => setActivePanel(null)}
        >
          <div
            className={cn(
              "w-full h-[92vh] max-h-[92vh] bg-white dark:bg-slate-900 rounded-xl shadow-2xl overflow-hidden flex flex-col relative animate-fade-in scale-100 transition-all",
              (activePanel === 'hotelDetail' || activePanel === 'flightDetail') ? "w-[92vw] max-w-7xl" : "max-w-[850px]"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {activePanel === 'hotelDetail' && (
              <HotelDetailPanel
                hotel={selectedHotel}
                bookingDetails={bookingDetails}
                loadingDetail={hotelDetailLoading}
                sessionId={sessionId}
                onClose={() => setActivePanel(null)}
                onProceed={() => {
                  setActivePanel(null);
                  navigate("/reservation", {
                    state: {
                      selectedItem: selectedHotel,
                      selectedHotel,
                      bookingDetails,
                      sessionId,
                    },
                  });
                }}
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
                chatSessionId={sessionId}
                onReservationComplete={async () => {
                  setIsChatCompleted(true);
                  if (sessionId) {
                    try {
                      await api.patch(`/api/chat/sessions/${sessionId}/status`, { chatStatus: 'COMPLETED' });
                    } catch (e) {
                      console.error('Failed to mark chat session as COMPLETED', e);
                    }
                  }
                }}
              />
            )}
            {activePanel === 'flightDetail' && (
              <FlightDetailPanel
                flight={selectedFlight}
                bookingDetails={bookingDetails}
                sessionId={sessionId}
                onClose={() => setActivePanel(null)}
                onProceed={() => {
                  setActivePanel(null);
                  navigate("/reservation", {
                    state: {
                      selectedItem: selectedFlight,
                      selectedFlight,
                      bookingDetails,
                      sessionId,
                    },
                  });
                }}
              />
            )}
            {activePanel === 'flightReservation' && (
              <FlightReservationFormPanel
                flight={selectedFlight}
                bookingDetails={bookingDetails}
                onClose={() => setActivePanel(null)}
                onBack={() => setActivePanel('flightDetail')}
                guests={reservationGuests}
                setGuests={setReservationGuests}
                termsAccepted={reservationTermsAccepted}
                setTermsAccepted={setReservationTermsAccepted}
                chatSessionId={sessionId}
                onReservationComplete={async () => {
                  setIsChatCompleted(true);
                  if (sessionId) {
                    try {
                      await api.patch(`/api/chat/sessions/${sessionId}/status`, { chatStatus: 'COMPLETED' });
                    } catch (e) {
                      console.error('Failed to mark chat session as COMPLETED', e);
                    }
                  }
                }}
              />
            )}
          </div>
        </div>
      )}

      {/* Hesabınız Kısıtlanmıştır Ekranı */}
      {accountRestricted && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-3xl border border-rose-500/20 bg-white p-8 text-center shadow-2xl dark:bg-slate-900 animate-scale-up">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500">
              <AlertTriangle size={32} className="animate-bounce" />
            </div>
            <h3 className="mt-6 text-xl font-bold text-gray-900 dark:text-white">
              Hesabınız Kısıtlanmıştır
            </h3>
            <p className="mt-3 text-sm text-gray-500 dark:text-slate-400 leading-relaxed">
              Hesabınız yönetici tarafından kısıtlanmıştır. İşlemlerinize devam edebilmek için lütfen destek ekibiyle iletişime geçin.
            </p>
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem('accountRestricted');
                localStorage.removeItem('token');
                sessionStorage.removeItem('token');
                localStorage.removeItem('user');
                sessionStorage.removeItem('user');
                window.location.href = '/login';
              }}
              className="mt-8 w-full rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-500/20 transition-all hover:scale-[1.02] hover:shadow-rose-500/30"
            >
              Çıkış Yap
            </button>
          </div>
        </div>
      )}
    </div>
  );
}