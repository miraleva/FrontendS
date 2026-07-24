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
  Sparkles,
  LogIn
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

function cn(...inputs) {
  return inputs.filter(Boolean).join(" ");
}

function formatPrice(price) {
  const num = Number(price);
  if (Number.isNaN(num)) return price;
  return Math.round(num).toLocaleString("tr-TR");
}

function getFlightDurationMs(result) {
  if (!result?.departureTime || !result?.arrivalTime) return Number.POSITIVE_INFINITY;
  const dep = new Date(result.departureTime).getTime();
  const arr = new Date(result.arrivalTime).getTime();
  if (Number.isNaN(dep) || Number.isNaN(arr)) return Number.POSITIVE_INFINITY;
  return arr - dep;
}

// Varsayılan sıralama ucuzdan pahalıya (kullanıcı isteği); uçakta süreye, otelde
// yıldıza göre de sıralanabilsin diye seçenekler eklendi.
function sortResults(results, sortKey) {
  if (!Array.isArray(results)) return results;
  const sorted = [...results];

  switch (sortKey) {
    case "price_desc":
      sorted.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
      break;
    case "stars_desc":
      sorted.sort((a, b) => (Number(b.stars) || 0) - (Number(a.stars) || 0));
      break;
    case "stars_asc":
      sorted.sort((a, b) => (Number(a.stars) || 0) - (Number(b.stars) || 0));
      break;
    case "name_asc":
      sorted.sort((a, b) => (a.name || "").localeCompare(b.name || "", 'tr'));
      break;
    case "name_desc":
      sorted.sort((a, b) => (b.name || "").localeCompare(a.name || "", 'tr'));
      break;
    case "duration_asc":
      sorted.sort((a, b) => getFlightDurationMs(a) - getFlightDurationMs(b));
      break;
    case "duration_desc":
      sorted.sort((a, b) => getFlightDurationMs(b) - getFlightDurationMs(a));
      break;
    case "price_asc":
    default:
      sorted.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
      break;
  }

  return sorted;
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

// Bot cevabını karakter karakter "yazılıyormuş" gibi gösterir. Otel/uçak
// kartları (msg.results) buna dahil değil — onlar zaten anında görünüyor,
// sadece metin cevabı yavaşça yazılır.
function TypewriterText({ text, animate }) {
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

  if (!animate) return text;
  return text ? text.slice(0, visibleChars) : text;
}

function HotelSearchResults({
  msg,
  isLatestResultMsg,
  selectedFlight,
  setSelectedFlight,
  selectedHotel,
  setSelectedHotel,
  setActivePanel,
  bookingDetails,
  setBookingDetails,
  hotelDetailLoading,
  setHotelDetailLoading,
  updateBackendCriteria,
  sessionId,
  onUpdateMessagePayload,
  sessionCriteria,
  t
}) {
  const navigate = useNavigate();
  const [sortOrder, setSortOrder] = useState("price_asc");
  const [selectedStar, setSelectedStar] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const handleFilterChange = (newStar, newMaxPrice) => {
    setSelectedStar(newStar);
    setMaxPrice(newMaxPrice);
    
    const raw = msg.originalHotels || msg.results || [];
    const filtered = raw.filter(item => {
      if (item.airline !== undefined) return true;
      if (newMaxPrice !== "" && item.price !== undefined && item.price > parseFloat(newMaxPrice)) {
        return false;
      }
      if (newStar !== "") {
        const minStarsVal = parseInt(newStar);
        if (item.stars !== undefined && item.stars < minStarsVal) {
          return false;
        }
      }
      return true;
    });

    onUpdateMessagePayload(msg.id, filtered);
  };

  useEffect(() => {
    if (isLatestResultMsg) {
      const criteriaMaxPrice = sessionCriteria.maxPrice === 0 || !sessionCriteria.maxPrice ? "" : sessionCriteria.maxPrice.toString();
      const criteriaMinStars = sessionCriteria.minStars === 0 || !sessionCriteria.minStars ? "" : sessionCriteria.minStars.toString();
      
      setSelectedStar(criteriaMinStars);
      setMaxPrice(criteriaMaxPrice);
      
      const raw = msg.originalHotels || msg.results || [];
      const filtered = raw.filter(item => {
        if (item.airline !== undefined) return true;
        if (criteriaMaxPrice !== "" && item.price !== undefined && item.price > parseFloat(criteriaMaxPrice)) {
          return false;
        }
        if (criteriaMinStars !== "") {
          const minStarsVal = parseInt(criteriaMinStars);
          if (item.stars !== undefined && item.stars < minStarsVal) {
            return false;
          }
        }
        return true;
      });
      onUpdateMessagePayload(msg.id, filtered);
    }
  }, [sessionCriteria, isLatestResultMsg]);

  const handleStarChange = (e) => {
    const val = e.target.value;
    handleFilterChange(val, maxPrice);
    if (isLatestResultMsg) {
      updateBackendCriteria({ minStars: val === "" ? null : parseInt(val) });
    }
  };

  const handleMaxPriceChange = (val) => {
    handleFilterChange(selectedStar, val);
    if (isLatestResultMsg) {
      updateBackendCriteria({ maxPrice: val === "" ? null : parseFloat(val) });
    }
  };

  const handleReset = () => {
    setSelectedStar("");
    setMaxPrice("");
    handleFilterChange("", "");
    if (isLatestResultMsg) {
      updateBackendCriteria({ maxPrice: null, minPrice: null, minStars: null });
    }
  };

  const filteredList = msg.filteredHotels || msg.originalHotels || msg.results || [];
  const sortedList = sortResults(filteredList, sortOrder);

  return (
    <div className="mt-3 w-full">
      {isLatestResultMsg && msg.results.length > 1 && (
        <div className="mb-2 flex items-center justify-between gap-2 flex-wrap bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 w-full">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              {t("sort_by_label", "Sırala")}
            </span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
            >
              <option value="price_asc">{t("sort_price_asc", "Fiyat: Ucuzdan Pahalıya")}</option>
              <option value="price_desc">{t("sort_price_desc", "Fiyat: Pahalıdan Ucuza")}</option>
              {msg.results[0]?.airline !== undefined ? (
                <>
                  <option value="duration_asc">{t("sort_duration_asc", "Süre: En Kısa")}</option>
                  <option value="duration_desc">{t("sort_duration_desc", "Süre: En Uzun")}</option>
                </>
              ) : (
                <>
                  <option value="stars_desc">{t("sort_stars_desc", "Yıldız: Yüksekten Düşüğe")}</option>
                  <option value="stars_asc">{t("sort_stars_asc", "Yıldız: Düşükten Yükseğe")}</option>
                  <option value="name_asc">İsim: A'dan Z'ye</option>
                  <option value="name_desc">İsim: Z'den A'ya</option>
                </>
              )}
            </select>
          </div>

          {msg.results[0]?.airline === undefined && (
            <div className="flex items-center gap-3 flex-wrap">
              {/* Yıldız Filtresi */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Yıldız</span>
                <select
                  value={selectedStar}
                  onChange={handleStarChange}
                  className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                >
                  <option value="">Tüm Yıldızlar</option>
                  <option value="5">5 Yıldız</option>
                  <option value="4">4 Yıldız ve Üzeri</option>
                </select>
              </div>

              {/* Maks Fiyat Filtresi */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Maks Fiyat</span>
                <input
                  type="number"
                  placeholder="Tutar"
                  value={maxPrice}
                  onChange={(e) => handleMaxPriceChange(e.target.value)}
                  className="w-20 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs px-2 py-1 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                />
                <input
                  type="range"
                  min="0"
                  max="50000"
                  step="500"
                  value={maxPrice || 50000}
                  onChange={(e) => {
                    const val = e.target.value === "50000" ? "" : e.target.value;
                    handleMaxPriceChange(val);
                  }}
                  className="w-16 accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Sıfırla Butonu */}
              <button
                onClick={handleReset}
                className="text-[11px] font-semibold text-amber-600 hover:text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 rounded-lg px-2 py-1 bg-amber-50/50 dark:bg-amber-950/20 hover:bg-amber-100 transition-colors"
              >
                Sıfırla
              </button>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
        {sortedList.map((result, idx) => {
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
                  setActivePanel('flightDetail');
                  setBookingDetails(prev => ({
                    ...prev,
                    airline: result.airline,
                    departureCity: result.departureCity || prev.departureCity || "Gidiş",
                    arrivalCity: result.arrivalCity || prev.arrivalCity || "Varış",
                    checkIn: result.departureTime || prev.checkIn,
                    returnDate: result.returnDepartureTime || "",
                    price: `${formatPrice(result.price)} ${result.currency || 'TRY'}`
                  }));
                }}
                className={cn(
                  "w-full text-left bg-white dark:bg-slate-900 border rounded-xl p-4 shadow-sm flex flex-col gap-2 transition-all duration-200 cursor-pointer hover:border-amber-500 hover:shadow-md focus:outline-none",
                  isCurrentlySelected ? "border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/50 dark:bg-amber-950/20" : "border-slate-200 dark:border-slate-800"
                )}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#1E232C] dark:text-slate-100 text-sm">✈️ {result.airline}</span>
                  <span className="text-[#3B82F6] dark:text-blue-400 font-bold text-sm">{formatPrice(result.price)} {result.currency}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <div><strong>{t("reservation_departure")}:</strong> {formatFlightDateTime(result.departureTime)}</div>
                  <div><strong>{t("reservation_arrival")}:</strong> {formatFlightDateTime(result.arrivalTime)}</div>
                  <div><strong>{t("reservation_transfers")}:</strong> {result.transfers}</div>
                  <div><strong>{t("reservation_baggage")}:</strong> {formatBaggage(result.baggage, t)}</div>
                </div>
                {result.returnDepartureTime && (
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 pt-2 mt-1 border-t border-dashed border-slate-200 dark:border-slate-800">
                    <div className="col-span-2 font-bold text-[#1E232C] dark:text-slate-100">↩ {result.returnAirline || result.airline}</div>
                    <div><strong>{t("reservation_return_departure_short")}:</strong> {formatFlightDateTime(result.returnDepartureTime)}</div>
                    <div><strong>{t("reservation_return_arrival_short")}:</strong> {formatFlightDateTime(result.returnArrivalTime)}</div>
                    <div><strong>{t("reservation_transfers")}:</strong> {result.returnTransfers}</div>
                    <div><strong>{t("reservation_baggage")}:</strong> {formatBaggage(result.returnBaggage, t)}</div>
                  </div>
                )}
              </button>
            );

          } else {
            const isCurrentlySelected = selectedHotel && (selectedHotel.name === result.name || selectedHotel.hotelId === result.hotelId);
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
                  "w-full text-left bg-white dark:bg-slate-900 border rounded-xl p-3 shadow-sm flex items-start gap-3 transition-all duration-200 cursor-pointer hover:border-amber-500 hover:shadow-md focus:outline-none",
                  isCurrentlySelected ? "border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/50 dark:bg-amber-950/20" : "border-slate-200 dark:border-slate-800"
                )}
              >
                <div className="w-16 h-16 rounded-lg bg-slate-100 dark:bg-slate-800 flex-shrink-0 overflow-hidden flex items-center justify-center relative">
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

                <div className="flex-1 min-w-0 flex flex-col gap-1">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col min-w-0 pr-2">
                      <span className="font-bold text-[#1E232C] dark:text-slate-100 text-sm leading-tight flex items-center gap-1 flex-wrap">
                        {result.name || result.hotelId}
                        {result.stars && (
                          <span className="text-amber-400 text-xs flex items-center flex-shrink-0 bg-amber-50 dark:bg-amber-950/30 px-1 py-0.5 rounded">
                            {result.stars}<Star size={10} className="ml-0.5 fill-amber-400" />
                          </span>
                        )}
                      </span>
                      {locationText && (
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate flex items-center gap-1">
                          <MapPin size={10} /> {locationText}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end items-end mt-1">
                    <span className="text-[#3B82F6] dark:text-blue-400 font-extrabold text-sm flex-shrink-0">
                      {formattedPrice}
                    </span>
                  </div>
                </div>
              </button>
            );
          }
        })}
      </div>
    </div>
  );
}

function formatBaggage(baggage, t) {
  if (!baggage || baggage === "0kg" || baggage === "0 kg") {
    return t ? t("baggage_not_included") : "Baggage not included";
  }
  return baggage;
}

export default function Index() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { isGuest, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isChatActive, setIsChatActive] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingStep, setThinkingStep] = useState("");
  const [sessionCriteria, setSessionCriteria] = useState({ maxPrice: null, minStars: null });
  const isChatTerminated = messages.length > 0 && messages[messages.length - 1].chatStatus === 'TERMINATED';
  const [isChatCompleted, setIsChatCompleted] = useState(false);
  const isChatLocked = isChatTerminated || isChatCompleted;
  const lastResultMsgId = [...messages].reverse().find(m => m.results && m.results.length > 0)?.id;

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
    infantCount: 0,
    infantAges: [],
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

  // Guest users get or reuse a guestSessionId stored in sessionStorage
  const getGuestSessionId = () => {
    let id = sessionStorage.getItem('guestSessionId');
    if (!id) {
      id = 'guest-' + (window.crypto?.randomUUID ? window.crypto.randomUUID() : Math.random().toString(36).substring(2, 11));
      sessionStorage.setItem('guestSessionId', id);
    }
    return id;
  };

  const sessionId = searchParams.get('sessionId') || (isGuest ? getGuestSessionId() : '');
  const [isListening, setIsListening] = useState(false);

  const videoRef = useRef(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const email = user?.email || localStorage.getItem('userId') || sessionStorage.getItem('userId') || "";
  const profileFullNameForGreeting = user && (user.firstName || user.lastName)
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
    : null;
  const username = profileFullNameForGreeting || (email ? (email.includes('@') ? email.split('@')[0] : email) : "User");

  // --- HTML5 Video Autoplay Engeli Çözümü & Tema Değişimi ---
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(err => console.log("Video oynatılamadı:", err));
    }
  }, [theme]);

  // --- Oturum Geçmişini ve bookingMeta Durumunu Yükleme ---
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
                // Backend'den gelen kriter (c) her zaman TAM ve GÜNCEL bir anlık
                // görüntüdür (bkz. ChatCriteriaSummary.from) — hiçbir zaman kısmi
                // değildir. Bu yüzden burada `|| prev.X` gibi bir "eskiyi koru"
                // yedeği KULLANMIYORUZ: aksi hâlde backend bir alanı gerçekten
                // sıfırladığında (ör. reddedilen bir arama geri alındığında) panel
                // hâlâ eski/"hayalet" değeri göstermeye devam ederdi.
                setBookingDetails(prev => ({
                  ...prev,
                  city: c.locationOrHotelName || "",
                  checkIn: c.checkInDate || c.departureDate || "",
                  checkOut: c.checkOutDate || "",
                  guests: formatGuestCount(c.adultCount, c.childCount, c.passengerCount, t, c.infantCount) || "",
                  adultCount: c.adultCount !== undefined && c.adultCount !== null ? c.adultCount : prev.adultCount,
                  childCount: c.childCount !== undefined && c.childCount !== null ? c.childCount : prev.childCount,
                  childAges: c.childAges || [],
                  infantCount: c.infantCount !== undefined && c.infantCount !== null ? c.infantCount : prev.infantCount,
                  infantAges: c.infantAges || [],
                  passengerCount: c.passengerCount !== undefined && c.passengerCount !== null ? c.passengerCount : prev.passengerCount,
                  departureCity: c.departureLocation || "",
                  arrivalCity: c.arrivalLocation || "",
                  returnDate: c.returnDate || ""
                }));
                setSessionCriteria({
                  maxPrice: c.maxPrice || null,
                  minStars: c.minStars || null
                });
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
      setBookingDetails({ city: "", departureCity: "", arrivalCity: "", checkIn: "", checkOut: "", guests: "", adultCount: 1, childCount: 0, childAges: [], infantCount: 0, infantAges: [], passengerCount: 1, hotelName: "", airline: "", price: "", returnDate: "" });
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
      const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user.country) userCountry = user.country;
      }
    } catch (e) {
      console.error(e);
    }

    // Ayarlar sayfasındaki "tercih edilen para birimi" seçimi — önceden burada
    // hep sabit "TRY" gönderiliyordu, kullanıcının seçtiği tercih hiç dikkate
    // alınmıyordu.
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
        animate: true // yeni gelen cevap yazıla yazıla görünsün; geçmiş mesajlar animasyonsuz yüklenir
      };

      if (data.sessionId && !searchParams.get('sessionId')) {
        setSearchParams({ sessionId: data.sessionId }, { replace: true });
      }

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
      const lowerQuery = query.toLocaleLowerCase('tr-TR');

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
        // Aynı gerekçe: c backend'in o anki TAM kriter anlık görüntüsüdür, `|| prev.X`
        // yedeği burada da eski/"hayalet" değerlerin panelde takılı kalmasına yol açardı
        // (ör. reddedilip geri alınan bir arama sonrası eski konuk sayısının görünmesi).
        setBookingDetails(prev => ({
          ...prev,
          city: c.locationOrHotelName || "",
          checkIn: c.checkInDate || c.departureDate || extractedFromQuery.checkIn || "",
          checkOut: c.checkOutDate || extractedFromQuery.checkOut || "",
          guests: formatGuestCount(c.adultCount, c.childCount, c.passengerCount, t, c.infantCount) || extractedFromQuery.guests || "",
          adultCount: c.adultCount !== undefined && c.adultCount !== null ? c.adultCount : prev.adultCount,
          childCount: c.childCount !== undefined && c.childCount !== null ? c.childCount : prev.childCount,
          childAges: c.childAges || [],
          infantCount: c.infantCount !== undefined && c.infantCount !== null ? c.infantCount : prev.infantCount,
          infantAges: c.infantAges || [],
          passengerCount: c.passengerCount !== undefined && c.passengerCount !== null ? c.passengerCount : prev.passengerCount,
          departureCity: c.departureLocation || "",
          arrivalCity: c.arrivalLocation || "",
          returnDate: c.returnDate || ""
        }));
        setSessionCriteria({
          maxPrice: c.maxPrice || null,
          minStars: c.minStars || null
        });
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
        // Misafir oturumlarında sessionId URL'ye yazılmaz (geçmiş kaydedilmez)
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

      {/* Misafir Bannerı (z-50): fixed, her zaman en üstte — layout wrapper mt-[33px] ile telafi ediyor */}
      {isGuest && (
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 px-4 py-2 bg-amber-50/95 dark:bg-amber-950/90 backdrop-blur-sm border-b border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-medium shadow-sm">
          <LogIn size={13} className="flex-shrink-0" />
          <span>
            {t('guest.bannerText', 'Misafir olarak oturum açtınız. Sohbet geçmişinizi kaydetmek için')}{' '}
          </span>
          <button
            onClick={() => navigate('/login')}
            className="underline font-semibold hover:text-amber-900 dark:hover:text-amber-200 transition-colors cursor-pointer"
          >
            {t('guest.loginLink', 'Giriş Yap')}
          </button>
          <span>{t('guest.or', 'veya')}</span>
          <button
            onClick={() => navigate('/signup')}
            className="underline font-semibold hover:text-amber-900 dark:hover:text-amber-200 transition-colors cursor-pointer"
          >
            {t('guest.registerLink', 'Kayıt Ol')}
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
          setBookingDetails({ city: "", departureCity: "", arrivalCity: "", checkIn: "", checkOut: "", guests: "", adultCount: 1, childCount: 0, childAges: [], infantCount: 0, infantAges: [], passengerCount: 1, hotelName: "", airline: "", price: "", returnDate: "" });
          setSelectedHotel(null);
          setSelectedFlight(null);
        }}
      />

      {/* Katman 3 (z-20): Ana İçerik Alanı */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden bg-transparent z-20">
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="absolute top-4 left-4 z-30 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-all duration-200 focus:outline-none cursor-pointer flex items-center justify-center"
            title="Expand Sidebar"
          >
            <PanelLeftOpen size={18} />
          </button>
        )}

        {!isRightSidebarOpen && isChatActive && (
          <button
            onClick={() => setIsRightSidebarOpen(true)}
            className="absolute top-4 right-4 z-30 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-all duration-200 focus:outline-none cursor-pointer flex items-center justify-center"
            title="Expand Details Panel"
          >
            <PanelRightOpen size={18} />
          </button>
        )}

        <div className="flex-1 flex h-full relative z-20 w-full overflow-hidden">

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
                      <h1 className="text-2xl md:text-4xl font-extrabold text-[#1E232C] dark:text-slate-100 font-display">
                        {t(getGreetingKey(), { username })}
                      </h1>
                    </div>
                    <p className="text-[#1E232C]/70 dark:text-slate-350 text-sm font-semibold">
                      {t("ops_subtitle")}
                    </p>
                  </div>

                  {/* Ortadaki Arama Çubuğu */}
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
                              className="w-full pl-3 pr-28 py-2.5 bg-transparent text-black dark:text-white placeholder-black/40 dark:placeholder-white/40 focus:outline-none resize-none max-h-32 text-sm leading-relaxed"
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
                                : "bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 text-[#0F172A] dark:text-slate-100 rounded-tl-none"
                                }`}
                            >
                              <TypewriterText text={msg.text} animate={msg.sender === "bot" && !!msg.animate} />
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

                          {msg.results && msg.results.length > 0 && (
                            <HotelSearchResults
                              msg={msg}
                              isLatestResultMsg={msg.id === lastResultMsgId}
                              selectedFlight={selectedFlight}
                              setSelectedFlight={setSelectedFlight}
                              selectedHotel={selectedHotel}
                              setSelectedHotel={setSelectedHotel}
                              setActivePanel={setActivePanel}
                              bookingDetails={bookingDetails}
                              setBookingDetails={setBookingDetails}
                              hotelDetailLoading={hotelDetailLoading}
                              setHotelDetailLoading={setHotelDetailLoading}
                              updateBackendCriteria={updateBackendCriteria}
                              sessionId={sessionId}
                              onUpdateMessagePayload={handleUpdateMessagePayload}
                              sessionCriteria={sessionCriteria}
                              t={t}
                            />
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

                  {/* Alt Sabit Sohbet Giriş Alanı */}
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
              onComplete={() => setActivePanel(searchType === 'hotel' ? 'hotelDetail' : 'flightDetail')}
            />
          )}

        </div>
      </div>

      {/* Overlay Backdrop & Centered Modal — root seviyesinde (ChatSidebar'ın kardeşi) render
          edilir, çünkü "Ana İçerik Alanı" (z-20) kendi stacking context'ini oluşturuyor;
          modal onun İÇİNDE kalsaydı, içindeki z-[100] hiçbir zaman root'taki ChatSidebar'ın
          z-30'unu geçemezdi (sol sidebar her zaman modalın önünde görünürdü). */}
      {activePanel && (
        <div
          className="fixed inset-0 bg-black/40 z-[100] transition-opacity flex items-center justify-center p-4 sm:p-6"
          onClick={() => setActivePanel(null)}
        >
          <div
            className="w-full max-w-[850px] h-[85vh] max-h-[85vh] bg-white dark:bg-slate-900 rounded-xl shadow-2xl overflow-hidden flex flex-col relative animate-fade-in scale-100 transition-all"
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
                onClose={() => setActivePanel(null)}
                onProceed={() => setActivePanel('flightReservation')}
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
    </div>
  );
}