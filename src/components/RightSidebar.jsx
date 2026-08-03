import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Users,
  Bed,
  MapPin,
  Hotel,
  Plane,
  Moon,
  PanelLeftOpen,
  PanelRightClose,
  X,
  Plus,
  Minus,
  Smile,
  Baby,
  Star,
  Heart,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { AirlineLogo } from "../utils/airlineLogos";
import { getHotelImage, handleHotelImageError, DEFAULT_HOTEL_IMAGE } from "../utils/hotelImageUtils";
import { useFavorites } from "./FavoritesContext";



function sanitizeBadgeText(boardType) {
  if (!boardType) return null;
  const str = String(boardType).trim();
  if (/low level|yerel dil|debug|unknown/i.test(str)) {
    return "Popüler Seçim";
  }
  if (/all inclusive|her [şs]ey dahil|ai/i.test(str)) return "Her Şey Dahil";
  if (/bed.*breakfast|oda.*kahvalt[ıi]|bb/i.test(str)) return "Oda Kahvaltı";
  if (/half board|yar[ıi]m pansiyon|hb/i.test(str)) return "Yarım Pansiyon";
  if (/full board|tam pansiyon|fb/i.test(str)) return "Tam Pansiyon";
  if (/ultra/i.test(str)) return "Ultra Her Şey Dahil";
  return str;
}

function formatDate(value, language = "tr") {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const localeMap = {
    tr: "tr-TR",
    en: "en-US",
    de: "de-DE",
    ru: "ru-RU",
  };

  const normalizedLanguage = language?.split("-")[0] || "tr";

  return date.toLocaleDateString(
    localeMap[normalizedLanguage] || "tr-TR",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

function calculateNightCount(checkIn, checkOut) {
  if (!checkIn || !checkOut) return null;

  const startDate = new Date(checkIn);
  const endDate = new Date(checkOut);

  if (
    Number.isNaN(startDate.getTime()) ||
    Number.isNaN(endDate.getTime())
  ) {
    return null;
  }

  const difference = endDate.getTime() - startDate.getTime();
  const nightCount = Math.ceil(
    difference / (1000 * 60 * 60 * 24)
  );

  return nightCount > 0 ? nightCount : null;
}

function extractTimeOnly(dateTimeStr) {
  if (!dateTimeStr) return "";
  if (dateTimeStr.includes("T")) {
    const timePart = dateTimeStr.split("T")[1];
    return timePart ? timePart.substring(0, 5) : "";
  }
  return dateTimeStr;
}

function formatPrice(val) {
  if (val === undefined || val === null) return "";
  const num = Number(val);
  if (Number.isNaN(num)) return val;
  return Math.round(num).toLocaleString("tr-TR");
}

function formatPriceValue(price, currency) {
  const num = Number(price);
  if (Number.isNaN(num)) return price;
  return `${Math.round(num).toLocaleString("tr-TR")} ${currency || "TRY"}`;
}

function DetailRow({
  icon: Icon,
  label,
  value,
  placeholder,
}) {
  const hasValue =
    value !== undefined &&
    value !== null &&
    String(value).trim() !== "";

  return (
    <div className="flex items-center gap-3 border-b border-slate-100 py-3 last:border-b-0 dark:border-slate-800">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#FF8A00] dark:bg-orange-500/10 dark:text-orange-400">
        <Icon size={18} strokeWidth={2} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
          {label}
        </p>

        <p
          className={`mt-0.5 truncate text-[13px] font-semibold ${hasValue
            ? "text-slate-900 dark:text-slate-100"
            : "italic text-slate-400 dark:text-slate-500"
            }`}
        >
          {hasValue ? value : placeholder}
        </p>
      </div>
    </div>
  );
}


function GuestSelector({
  adultCount,
  setAdultCount,
  childCount,
  setChildCount,
  childAges,
  setChildAges,
  infantCount = 0,
  t,
}) {
  const increaseAdults = () => {
    setAdultCount((value) => Math.min(value + 1, 10));
  };

  const decreaseAdults = () => {
    setAdultCount((value) => Math.max(value - 1, 1));
  };

  const increaseChildren = () => {
    setChildCount((value) => {
      const nextValue = Math.min(value + 1, 6);

      if (nextValue > value) {
        setChildAges((ages) => [...ages, ""]);
      }

      return nextValue;
    });
  };

  const decreaseChildren = () => {
    setChildCount((value) => {
      const nextValue = Math.max(value - 1, 0);

      if (nextValue < value) {
        setChildAges((ages) => ages.slice(0, nextValue));
      }

      return nextValue;
    });
  };

  const updateChildAge = (index, age) => {
    setChildAges((ages) =>
      ages.map((currentAge, currentIndex) =>
        currentIndex === index ? age : currentAge
      )
    );
  };

  const CounterButton = ({ onClick, disabled, children, label }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-orange-200 bg-white text-[#FF8A00] transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-orange-500/30 dark:bg-slate-800 dark:text-orange-400 dark:hover:bg-orange-500/10"
    >
      {children}
    </button>
  );

  return (
    <div className="mt-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-[#FF8A00] dark:bg-orange-500/10 dark:text-orange-400">
          <Users size={18} strokeWidth={2} />
        </div>

        <div>
          <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
            {t("rightSidebar.guests", {
              defaultValue: "Misafirler",
            })}
          </p>
          <p className="text-[13px] font-semibold text-slate-900 dark:text-slate-100">
            {adultCount}{" "}
            {t("rightSidebar.units.adult", {
              defaultValue: "Yetişkin",
            })}
            {childCount > 0
              ? `, ${childCount} ${t("rightSidebar.units.child", {
                defaultValue: "Çocuk",
              })}`
              : ""}
            {infantCount > 0
              ? `, ${infantCount} ${t("rightSidebar.units.infant", {
                defaultValue: "Bebek",
              })}`
              : ""}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-700">
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {t("rightSidebar.units.adult", {
              defaultValue: "Yetişkin",
            })}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            {t("rightSidebar.adultDescription", {
              defaultValue: "18 yaş ve üzeri",
            })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <CounterButton
            onClick={decreaseAdults}
            disabled={adultCount <= 1}
            label="Yetişkin sayısını azalt"
          >
            <Minus size={15} />
          </CounterButton>

          <span className="w-5 text-center text-sm font-bold text-slate-900 dark:text-white">
            {adultCount}
          </span>

          <CounterButton
            onClick={increaseAdults}
            disabled={adultCount >= 10}
            label="Yetişkin sayısını artır"
          >
            <Plus size={15} />
          </CounterButton>
        </div>
      </div>

      <div className="flex items-center justify-between py-3">
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {t("rightSidebar.units.child", {
              defaultValue: "Çocuk",
            })}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            {t("rightSidebar.childDescription", {
              defaultValue: "0-17 yaş",
            })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <CounterButton
            onClick={decreaseChildren}
            disabled={childCount <= 0}
            label="Çocuk sayısını azalt"
          >
            <Minus size={15} />
          </CounterButton>

          <span className="w-5 text-center text-sm font-bold text-slate-900 dark:text-white">
            {childCount}
          </span>

          <CounterButton
            onClick={increaseChildren}
            disabled={childCount >= 6}
            label="Çocuk sayısını artır"
          >
            <Plus size={15} />
          </CounterButton>
        </div>
      </div>

      {childCount > 0 && (
        <div className="mt-1 border-t border-slate-200 pt-3 dark:border-slate-700">
          <div className="mb-3 flex items-center gap-2">
            <Smile
              size={16}
              className="text-[#FF8A00] dark:text-orange-400"
            />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
              {t("rightSidebar.childAges", {
                defaultValue: "Çocuk yaşları",
              })}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: childCount }).map((_, index) => (
              <label key={index} className="block">
                <span className="mb-1 block text-[10px] font-medium text-slate-400 dark:text-slate-500">
                  {t("rightSidebar.childNumber", {
                    defaultValue: "Çocuk",
                  })}{" "}
                  {index + 1}
                </span>

                <select
                  value={childAges[index] ?? ""}
                  onChange={(event) =>
                    updateChildAge(index, event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 outline-none transition focus:border-[#FF8A00] focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-orange-500 dark:focus:ring-orange-500/10"
                >
                  <option value="">
                    {t("rightSidebar.selectAge", {
                      defaultValue: "Yaş seç",
                    })}
                  </option>

                  {Array.from({ length: 18 }).map((_, age) => (
                    <option key={age} value={age}>
                      {age}{" "}
                      {t("rightSidebar.units.age", {
                        defaultValue: "yaş",
                      })}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Stepper({ currentStep, setCurrentStep, t }) {
  const steps = [
    {
      id: 1,
      label: t("rightSidebar.steps.select", {
        defaultValue: "Seç",
      }),
    },
    {
      id: 2,
      label: t("rightSidebar.steps.review", {
        defaultValue: "İncele",
      }),
    },
  ];

  return (
    <div className="mb-6">
      <div className="flex items-start">
        {steps.map((step, index) => {
          const active = currentStep >= step.id;

          return (
            <div
              key={step.id}
              className={`flex items-start ${index < steps.length - 1 ? "flex-1" : ""
                }`}
            >
              <button
                type="button"
                onClick={() => setCurrentStep(step.id)}
                className="flex flex-col items-center cursor-pointer"
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold transition-all ${active
                    ? "bg-[#FF8A00] text-white shadow-[0_0_0_4px_rgba(255,138,0,0.14)] dark:bg-orange-500"
                    : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                    }`}
                >
                  {step.id}
                </div>

                <span
                  className={`mt-2 text-[11px] font-semibold ${currentStep === step.id
                    ? "text-[#FF8A00] dark:text-orange-400"
                    : "text-slate-400 dark:text-slate-500"
                    }`}
                >
                  {step.label}
                </span>
              </button>

              {index < steps.length - 1 && (
                <div
                  className={`mx-2 mt-[19px] h-[2px] flex-1 transition-colors ${currentStep > step.id
                    ? "bg-[#FF8A00] dark:bg-orange-500"
                    : "bg-slate-200 dark:bg-slate-700"
                    }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function RightSidebar({
  isRightSidebarOpen,
  setIsRightSidebarOpen,
  isSidebarOpen,
  setIsSidebarOpen,
  searchType,
  bookingDetails = {},
  selectedHotel,
  selectedFlight,
  sessionId,
  searchResults = [],
  onSelectHotel,
  onSelectFlight,
}) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [resultSort, setResultSort] = useState("price_asc");
  const { isFavorite, toggleFavorite } = useFavorites();
  const [adultCount, setAdultCount] = useState(
    Number(bookingDetails.adultCount) || 1
  );
  const [childCount, setChildCount] = useState(
    Number(bookingDetails.childCount) || 0
  );
  const [childAges, setChildAges] = useState(
    Array.isArray(bookingDetails.childAges)
      ? bookingDetails.childAges.map(String)
      : []
  );
  const [infantCount, setInfantCount] = useState(
    Number(bookingDetails.infantCount) || 0
  );

  const isCombined = searchType === "combined" || searchType === "HOTEL_FLIGHT" || searchType === "COMBINED_SEARCH";
  const isHotel = !isCombined && searchType === "hotel";
  const isFlight = !isCombined && searchType === "flight";

  const language = i18n.language?.split("-")[0] || "tr";

  useEffect(() => {
    const nextAdultCount = Number(bookingDetails.adultCount) || 1;
    const nextChildCount = Number(bookingDetails.childCount) || 0;
    const nextInfantCount = Number(bookingDetails.infantCount) || 0;
    const nextChildAges = Array.isArray(bookingDetails.childAges)
      ? bookingDetails.childAges.map(String)
      : Array(nextChildCount).fill("");

    setAdultCount(nextAdultCount);
    setChildCount(nextChildCount);
    setInfantCount(nextInfantCount);
    setChildAges(nextChildAges.slice(0, nextChildCount));
  }, [
    bookingDetails.adultCount,
    bookingDetails.childCount,
    bookingDetails.infantCount,
    bookingDetails.childAges,
  ]);

  const nightCount = useMemo(
    () =>
      calculateNightCount(
        bookingDetails.checkIn,
        bookingDetails.checkOut
      ),
    [bookingDetails.checkIn, bookingDetails.checkOut]
  );

  const hotelName =
    selectedHotel?.name ||
    selectedHotel?.hotelName ||
    bookingDetails.hotelName ||
    "";

  const airlineName =
    selectedFlight?.airline ||
    selectedFlight?.airlineName ||
    bookingDetails.airline ||
    "";

  const destination =
    bookingDetails.city ||
    selectedHotel?.city ||
    selectedHotel?.town ||
    "";

  const roomCount =
    bookingDetails.roomCount ||
    bookingDetails.rooms ||
    1;

  const guestText = isHotel || isCombined
    ? `${adultCount} ${t("rightSidebar.units.adult", {
      defaultValue: "Yetişkin",
    })}${childCount > 0
      ? `, ${childCount} ${t("rightSidebar.units.child", {
        defaultValue: "Çocuk",
      })}`
      : ""
    }${infantCount > 0
      ? `, ${infantCount} ${t("rightSidebar.units.infant", {
        defaultValue: "Bebek",
      })}`
      : ""
    }`
    : bookingDetails.guests ||
    `${bookingDetails.passengerCount || 1} ${t(
      "rightSidebar.units.passenger",
      {
        defaultValue: "yolcu",
      }
    )}`;

  const selectedItem = isCombined
    ? { type: "HOTEL_FLIGHT", hotel: selectedHotel, flight: selectedFlight }
    : (isHotel ? selectedHotel : selectedFlight);

  const combinedTotalPrice = useMemo(() => {
    if (!isCombined) return null;
    const hPrice = Number(selectedHotel?.price) || 0;
    const fPrice = Number(selectedFlight?.price) || 0;
    return hPrice + fPrice;
  }, [isCombined, selectedHotel?.price, selectedFlight?.price]);

  const updatedBookingDetails = {
    ...bookingDetails,
    adultCount,
    childCount,
    infantCount,
    childAges: childAges.map((age) =>
      age === "" ? "" : Number(age)
    ),
    guests: guestText,
    price: combinedTotalPrice ? `${combinedTotalPrice} ${selectedHotel?.currency || selectedFlight?.currency || 'TRY'}` : bookingDetails.price,
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((previousStep) => previousStep - 1);
    }
  };

  const handleNext = () => {
    if (currentStep < 2) {
      setCurrentStep((previousStep) => previousStep + 1);
      return;
    }

    if (isCombined && (!selectedHotel || !selectedFlight)) {
      return;
    }

    navigate("/reservation", {
      state: {
        selectedItem,
        selectedHotel,
        selectedFlight,
        bookingDetails: updatedBookingDetails,
        sessionId,
        searchType: isCombined ? "combined" : (isHotel ? "hotel" : "flight"),
      },
    });
  };

  const nightCountForResults = calculateNightCount(bookingDetails.checkIn, bookingDetails.checkOut);

  const sortedSearchResults = [...searchResults].sort((a, b) => {
    if (resultSort === "price_desc") return (b.price || 0) - (a.price || 0);
    if (resultSort === "stars_desc") return (b.stars || 0) - (a.stars || 0);
    return (a.price || 0) - (b.price || 0);
  });

  const HotelResultCard = ({ result, idx }) => {
    const isFav = isFavorite(result);
    const isSelected = selectedHotel && (selectedHotel.name === result.name || selectedHotel.hotelId === result.hotelId);
    const locationParts = [result.city, result.town, result.village, result.region].filter(Boolean);
    const locationText = [...new Set(locationParts)].join(', ');
    const hotelImage = getHotelImage(result, idx);
    const badgeText = sanitizeBadgeText(result.boardType || result.boardName || result.pensionType);

    return (
      <div
        className={`group relative rounded-2xl border bg-white p-4 transition-all duration-200 hover:shadow-lg dark:bg-slate-800 ${isSelected
          ? "border-[#FF8A00] ring-2 ring-[#FF8A00]/20 dark:border-orange-500 dark:ring-orange-500/20"
          : "border-slate-200 dark:border-slate-700"
          }`}
      >
        <div className="relative mb-3.5 h-44 w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-700">
          <img
            src={hotelImage}
            alt={result.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => handleHotelImageError(e, result)}
          />
          {badgeText && (
            <span className="absolute left-3 top-3 rounded-full bg-black/65 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-md shadow-sm">
              {badgeText}
            </span>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(result);
            }}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur-md transition hover:bg-white dark:bg-slate-900/80 dark:hover:bg-slate-900"
          >
            <Heart
              size={16}
              className={isFav ? "fill-rose-500 text-rose-500" : "text-slate-600 dark:text-slate-300"}
            />
          </button>
        </div>

        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">
            {result.name}
          </h3>
          {result.stars > 0 && (
            <div className="flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
              <Star size={12} className="fill-amber-400 text-amber-400" />
              <span>{result.stars}</span>
            </div>
          )}
        </div>

        {locationText && (
          <div className="mb-3 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <MapPin size={14} className="text-slate-400 shrink-0" />
            <span className="truncate">{locationText}</span>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-700/60">
          <div>
            <div className="text-[11px] text-slate-400 dark:text-slate-500">
              {nightCountForResults ? `${nightCountForResults} ${t("rightSidebar.units.night", { defaultValue: "gece" })} ${t("rightSidebar.total", { defaultValue: "toplam" })}` : t("rightSidebar.totalStay", { defaultValue: "Toplam Konaklama" })}
            </div>
            <div className="text-lg font-extrabold text-[#FF8A00] dark:text-orange-400">
              {formatPrice(result.price)} {result.currency || "TRY"}
            </div>
          </div>
          <button
            type="button"
            onClick={() => onSelectHotel && onSelectHotel(result)}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${isSelected
              ? "bg-[#FF8A00] text-white dark:bg-orange-500"
              : "bg-slate-100 text-slate-700 hover:bg-[#FF8A00] hover:text-white dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-orange-500"
              }`}
          >
            {isSelected ? t("rightSidebar.selected", { defaultValue: "Seçildi" }) : t("rightSidebar.selectHotel", { defaultValue: "Otel Seç" })}
          </button>
        </div>
      </div>
    );
  };

  const FlightResultCard = ({ result, idx }) => {
    const isSelected =
      selectedFlight &&
      ((selectedFlight.offerId && result.offerId && selectedFlight.offerId === result.offerId) ||
        (selectedFlight.airline === result.airline && selectedFlight.departureTime === result.departureTime));
    return (
      <div
        className={`group relative rounded-2xl border bg-white p-4 transition-all duration-200 hover:shadow-lg dark:bg-slate-800 ${isSelected
          ? "border-[#FF8A00] ring-2 ring-[#FF8A00]/20 dark:border-orange-500 dark:ring-orange-500/20"
          : "border-slate-200 dark:border-slate-700"
          }`}
      >
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 font-bold text-xs">
              <Plane size={18} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">{result.airline}</h4>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">{result.transfers || t("rightSidebar.directFlight", { defaultValue: "Direkt Uçuş" })}</span>
            </div>
          </div>
          {result.baggage && (
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
              {result.baggage}
            </span>
          )}
        </div>

        <div className="mb-3 flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-900/60">
          <div className="text-center">
            <div className="text-base font-bold text-slate-900 dark:text-white">
              {extractTimeOnly(result.departureTime) || result.departureTime || "--:--"}
            </div>
            <div className="text-[11px] text-slate-400">{bookingDetails.departureCity || t("rightSidebar.departure", { defaultValue: "Kalkış" })}</div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-medium text-slate-400">{t("rightSidebar.oneWay", { defaultValue: "Tek Yön" })}</span>
            <div className="relative flex w-20 items-center justify-center">
              <div className="h-[2px] w-full bg-slate-200 dark:bg-slate-700"></div>
              <Plane size={12} className="absolute text-[#FF8A00] dark:text-orange-400 rotate-90" />
            </div>
          </div>
          <div className="text-center">
            <div className="text-base font-bold text-slate-900 dark:text-white">
              {extractTimeOnly(result.arrivalTime) || result.arrivalTime || "--:--"}
            </div>
            <div className="text-[11px] text-slate-400">{bookingDetails.arrivalCity || t("rightSidebar.arrival", { defaultValue: "Varış" })}</div>
          </div>
        </div>

        {/* Gidiş-Dönüş ise Dönüş Uçuşu Bilgisi */}
        {result.returnAirline && (
          <div className="mb-3 flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800">
            <div className="text-center">
              <div className="text-base font-bold text-slate-900 dark:text-white">
                {extractTimeOnly(result.returnDepartureTime) || result.returnDepartureTime || "--:--"}
              </div>
              <div className="text-[11px] text-slate-400">{bookingDetails.arrivalCity || t("rightSidebar.returnDeparture", { defaultValue: "Dönüş Kalkış" })}</div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-[10px] font-medium text-slate-400">{t("rightSidebar.returnFlight", { defaultValue: "Dönüş Uçuşu" })}</span>
              <div className="relative flex w-20 items-center justify-center">
                <div className="h-[2px] w-full bg-slate-200 dark:bg-slate-700"></div>
                <Plane size={12} className="absolute text-[#FF8A00] dark:text-orange-400 -rotate-90" />
              </div>
            </div>
            <div className="text-center">
              <div className="text-base font-bold text-slate-900 dark:text-white">
                {extractTimeOnly(result.returnArrivalTime) || result.returnArrivalTime || "--:--"}
              </div>
              <div className="text-[11px] text-slate-400">{bookingDetails.departureCity || t("rightSidebar.returnArrival", { defaultValue: "Dönüş Varış" })}</div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-700/60">
          <div>
            <div className="text-[11px] text-slate-400">{t("rightSidebar.totalPrice", { defaultValue: "Toplam Fiyat" })}</div>
            <div className="text-lg font-extrabold text-[#FF8A00] dark:text-orange-400">
              {formatPrice(result.price)} {result.currency || "TRY"}
            </div>
          </div>
          <button
            type="button"
            onClick={() => onSelectFlight && onSelectFlight(result)}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${isSelected
              ? "bg-[#FF8A00] text-white dark:bg-orange-500"
              : "bg-slate-100 text-slate-700 hover:bg-[#FF8A00] hover:text-white dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-orange-500"
              }`}
          >
            {isSelected ? t("rightSidebar.selected", { defaultValue: "Seçildi" }) : t("rightSidebar.selectFlight", { defaultValue: "Uçuş Seç" })}
          </button>
        </div>
      </div>
    );
  };

  const renderSelectionStep = () => {
    const flightResults = sortedSearchResults.filter(r => r.airline != null || r.departureTime != null);
    const hotelResults = sortedSearchResults.filter(r => !r.airline && !r.departureTime && (r.name || r.hotelId));

    return (
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {isCombined
                ? "Otel & Uçuş Seçenekleri"
                : isHotel
                  ? t("rightSidebar.foundHotels", { defaultValue: "Bulunan Oteller" })
                  : t("rightSidebar.foundFlights", { defaultValue: "Bulunan Uçuşlar" })}
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {searchResults.length} {t("rightSidebar.optionsFound", { defaultValue: "seçenek listeleniyor" })}
            </p>
          </div>
          <select
            value={resultSort}
            onChange={(e) => setResultSort(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm focus:border-[#FF8A00] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="price_asc">{t("rightSidebar.sortPriceAsc", { defaultValue: "Fiyat: Düşükten Yükseğe" })}</option>
            <option value="price_desc">{t("rightSidebar.sortPriceDesc", { defaultValue: "Fiyat: Yüksekten Düşüğe" })}</option>
            {(isHotel || isCombined) && <option value="stars_desc">{t("rightSidebar.sortStarsDesc", { defaultValue: "Yıldız: Yüksekten Düşüğe" })}</option>}
          </select>
        </div>

        {searchResults.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 py-12 text-center dark:border-slate-800">
            <Sparkles className="mb-3 h-8 w-8 text-slate-300 dark:text-slate-600 animate-pulse" />
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {t("rightSidebar.noResultsYet", { defaultValue: "Arama sonuçları henüz hazır değil." })}
            </p>
            <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
              {t("rightSidebar.noResultsHint", { defaultValue: "Sohbet ekranında aramanızı belirtebilirsiniz." })}
            </p>
          </div>
        ) : isCombined ? (
          <div className="space-y-6">
            <div>
              <div className="mb-2 flex items-center justify-between rounded-xl bg-orange-50 px-3 py-2 dark:bg-orange-950/40 border border-orange-200/50 dark:border-orange-800/40">
                <span className="text-xs font-bold text-orange-900 dark:text-orange-200 flex items-center gap-1.5">
                  <Hotel size={14} className="text-orange-500" /> 1. Otel Seçimi
                </span>
                <span className="text-[11px] font-medium text-orange-700 dark:text-orange-300">
                  {selectedHotel ? `✓ ${selectedHotel.name || "Seçildi"}` : "1 Otel seçin"}
                </span>
              </div>
              <div className="space-y-3">
                {hotelResults.map((result, idx) => (
                  <HotelResultCard key={result.hotelId || idx} result={result} idx={idx} />
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between rounded-xl bg-blue-50 px-3 py-2 dark:bg-blue-950/40 border border-blue-200/50 dark:border-blue-800/40">
                <span className="text-xs font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                  <Plane size={14} className="text-blue-500" /> 2. Uçuş Seçimi
                </span>
                <span className="text-[11px] font-medium text-blue-700 dark:text-blue-300">
                  {selectedFlight ? `✓ ${selectedFlight.airline || "Seçildi"}` : "1 Uçuş seçin"}
                </span>
              </div>
              <div className="space-y-3">
                {flightResults.length > 0 ? (
                  flightResults.map((result, idx) => (
                    <FlightResultCard key={(result.airline || "flight") + idx} result={result} idx={idx} />
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-blue-200 bg-blue-50/30 p-4 text-center dark:border-blue-900/40 dark:bg-blue-950/20">
                    <p className="text-xs font-semibold text-blue-800 dark:text-blue-300">
                      Uçuş seçeneği bulunamadı
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                      Lütfen sohbet ekranında kalkış noktanızı belirtin veya farklı tarihler ile tekrar deneyin.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedSearchResults.map((result, idx) =>
              isHotel ? (
                <HotelResultCard key={result.hotelId || idx} result={result} idx={idx} />
              ) : (
                <FlightResultCard key={result.airline + idx} result={result} idx={idx} />
              )
            )}
          </div>
        )}
      </div>
    );
  };

  const renderReviewStep = () => (
    <div>
      <h2 className="mb-2 text-sm font-bold text-slate-900 dark:text-slate-100">
        {t("rightSidebar.reservationSummary", {
          defaultValue: "Rezervasyon Özeti",
        })}
      </h2>

      <p className="mb-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
        {isCombined
          ? "Otel & Uçuş Detayları"
          : isHotel
            ? t("rightSidebar.hotelDetails", {
              defaultValue: "Otel detayları",
            })
            : t("rightSidebar.flightDetails", {
              defaultValue: "Uçuş detayları",
            })}
      </p>

      {isCombined ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-900/50">
            <h3 className="mb-2 text-xs font-bold text-orange-600 dark:text-orange-400 flex items-center gap-1.5">
              <Hotel size={14} /> Otel Detayları
            </h3>
            <DetailRow icon={Hotel} label="Seçilen Otel" value={hotelName} placeholder="Otel seçilmedi" />
            <DetailRow icon={MapPin} label="Konum" value={destination} placeholder="Konum belirtilmedi" />
            <DetailRow icon={Calendar} label="Giriş Tarihi" value={formatDate(bookingDetails.checkIn, language)} placeholder="Giriş tarihi yok" />
            <DetailRow icon={Calendar} label="Çıkış Tarihi" value={formatDate(bookingDetails.checkOut, language)} placeholder="Çıkış tarihi yok" />
            <DetailRow icon={Users} label="Konuklar" value={guestText} />
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-900/50">
            <h3 className="mb-2 text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
              <Plane size={14} /> Uçuş Detayları
            </h3>
            <DetailRow icon={Plane} label="Havayolu" value={airlineName} placeholder="Uçuş seçilmedi" />
            <DetailRow icon={MapPin} label="Kalkış Şehri" value={bookingDetails.departureCity} placeholder="Kalkış şehri yok" />
            <DetailRow icon={MapPin} label="Varış Şehri" value={bookingDetails.arrivalCity} placeholder="Varış şehri yok" />
            <DetailRow icon={Calendar} label="Gidiş Tarihi" value={formatDate(bookingDetails.checkIn || bookingDetails.departureDate, language)} placeholder="Tarih yok" />
          </div>
        </div>
      ) : isHotel ? (
        <>
          <DetailRow
            icon={Hotel}
            label={t("rightSidebar.selectedHotel", {
              defaultValue: "Seçilen otel",
            })}
            value={hotelName}
            placeholder={t("rightSidebar.hotelNotSelected", {
              defaultValue: "Otel henüz seçilmedi",
            })}
          />

          <DetailRow
            icon={MapPin}
            label={t("rightSidebar.location", {
              defaultValue: "Konum",
            })}
            value={destination}
            placeholder={t(
              "rightSidebar.locationMissing",
              {
                defaultValue: "Konum bilgisi eksik",
              }
            )}
          />

          <DetailRow
            icon={Calendar}
            label={t("rightSidebar.checkInDate", {
              defaultValue: "Giriş tarihi",
            })}
            value={formatDate(
              bookingDetails.checkIn,
              language
            )}
            placeholder={t(
              "rightSidebar.checkInDateMissing",
              {
                defaultValue: "Giriş tarihi belirtilmedi",
              }
            )}
          />

          <DetailRow
            icon={Calendar}
            label={t("rightSidebar.checkOutDate", {
              defaultValue: "Çıkış tarihi",
            })}
            value={formatDate(
              bookingDetails.checkOut,
              language
            )}
            placeholder={t(
              "rightSidebar.checkOutDateMissing",
              {
                defaultValue: "Çıkış tarihi belirtilmedi",
              }
            )}
          />

          <DetailRow
            icon={Moon}
            label={t("rightSidebar.nightCount", {
              defaultValue: "Gece sayısı",
            })}
            value={
              nightCount
                ? `${nightCount} ${t(
                  "rightSidebar.units.night",
                  {
                    defaultValue: "gece",
                  }
                )}`
                : ""
            }
            placeholder={t(
              "rightSidebar.nightCountMissing",
              {
                defaultValue: "Gece sayısı hesaplanmadı",
              }
            )}
          />

          <DetailRow
            icon={Users}
            label={t("rightSidebar.guests", {
              defaultValue: "Konuklar",
            })}
            value={guestText}
          />

          <DetailRow
            icon={Bed}
            label={t("rightSidebar.roomCount", {
              defaultValue: "Oda sayısı",
            })}
            value={`${roomCount} ${t(
              "rightSidebar.units.room",
              {
                defaultValue: "oda",
              }
            )}`}
          />
        </>
      ) : (
        <>
          <DetailRow
            icon={Plane}
            label={t("rightSidebar.airline", {
              defaultValue: "Havayolu",
            })}
            value={airlineName}
            placeholder={t("rightSidebar.airlineMissing", {
              defaultValue: "Havayolu seçilmedi",
            })}
          />

          <DetailRow
            icon={MapPin}
            label={t("rightSidebar.departureCity", {
              defaultValue: "Kalkış şehri",
            })}
            value={bookingDetails.departureCity}
            placeholder={t(
              "rightSidebar.departureCityMissing",
              {
                defaultValue: "Kalkış şehri belirtilmedi",
              }
            )}
          />

          <DetailRow
            icon={MapPin}
            label={t("rightSidebar.arrivalCity", {
              defaultValue: "Varış şehri",
            })}
            value={bookingDetails.arrivalCity}
            placeholder={t(
              "rightSidebar.arrivalCityMissing",
              {
                defaultValue: "Varış şehri belirtilmedi",
              }
            )}
          />

          <DetailRow
            icon={Calendar}
            label={t("rightSidebar.departureDate", {
              defaultValue: "Gidiş tarihi",
            })}
            value={formatDate(
              bookingDetails.checkIn,
              language
            )}
            placeholder={t(
              "rightSidebar.departureDateMissing",
              {
                defaultValue: "Gidiş tarihi belirtilmedi",
              }
            )}
          />

          {bookingDetails.returnDate && (
            <DetailRow
              icon={Calendar}
              label={t("rightSidebar.returnDate", {
                defaultValue: "Dönüş tarihi",
              })}
              value={formatDate(
                bookingDetails.returnDate,
                language
              )}
            />
          )}

          <DetailRow
            icon={Users}
            label={t("rightSidebar.passengers", {
              defaultValue: "Yolcular",
            })}
            value={guestText}
          />
        </>
      )}

      {(bookingDetails.price || combinedTotalPrice) && (
        <div className="mt-4 flex items-center justify-between rounded-xl bg-orange-50 px-4 py-3 dark:bg-orange-500/10">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            {t("rightSidebar.totalAmount", {
              defaultValue: "Toplam tutar",
            })}
          </span>

          <span className="text-lg font-extrabold text-[#FF8A00] dark:text-orange-400">
            {combinedTotalPrice ? `${formatPrice(combinedTotalPrice)} ${selectedHotel?.currency || 'TRY'}` : bookingDetails.price}
          </span>
        </div>
      )}
    </div>
  );

  const buttonText =
    currentStep === 1
      ? t("rightSidebar.buttons.continue", {
        defaultValue: "Devam Et",
      })
      : t("rightSidebar.buttons.makeReservation", {
        defaultValue: "Rezervasyon Yap",
      });

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isRightSidebarOpen && (
        <div
          onClick={() => setIsRightSidebarOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-40 animate-fade-in"
          aria-hidden="true"
        />
      )}

      <aside className={`fixed lg:relative inset-0 sm:left-auto sm:right-0 z-50 lg:z-30 h-full w-full sm:w-[450px] lg:w-[420px] lg:min-w-[420px] lg:max-w-[420px] flex-none overflow-hidden border-l border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-2xl lg:shadow-none transition-all duration-300 ${isRightSidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0 hidden lg:flex"
        }`}>
        <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-white dark:bg-slate-900">
          {/* Üst bölüm sabit kalır; panel kaydırıldığında kaybolmaz. */}
          <div className="flex-shrink-0 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 sticky top-0 z-20">
            <div className="flex items-center justify-between gap-2">
              {/* Title & Badge */}
              <div className="flex items-center gap-2 min-w-0">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
                  {t("rightSidebar.title", {
                    defaultValue: "Rezervasyon Özeti",
                  })}
                </h2>
                <span className="flex-shrink-0 px-2 py-0.5 text-xs font-semibold bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 rounded-full">
                  {currentStep}/2
                </span>
              </div>

              {/* Single Close Button on Mobile/Drawer */}
              <button
                type="button"
                onClick={() => setIsRightSidebarOpen(false)}
                className="p-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Paneli kapat"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-3 h-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-[#FF8A00] transition-all duration-300 dark:bg-orange-500"
                style={{
                  width: `${(currentStep / 2) * 100}%`,
                }}
              />
            </div>

            <div className="mt-3">
              <Stepper
                currentStep={currentStep}
                setCurrentStep={setCurrentStep}
                t={t}
              />
            </div>
          </div>

          {/* Sadece adım içeriği kaydırılır. */}
          <div className="min-h-0 flex-1 overflow-y-auto px-4 sm:px-6 py-4 pb-20 lg:pb-5">
            {currentStep === 1 &&
              renderSelectionStep()}

            {currentStep === 2 &&
              renderReviewStep()}
          </div>

          <div className="flex-shrink-0 border-t border-slate-100 bg-white px-4 sm:px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
            <button
              type="button"
              onClick={handleNext}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF8A00] px-4 py-3.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(255,138,0,0.28)] transition hover:bg-[#E87900] active:scale-[0.99] dark:bg-orange-500 dark:hover:bg-orange-600 cursor-pointer"
            >
              {buttonText}
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}