import { jsPDF } from "jspdf";
import { getHotelImage, DEFAULT_HOTEL_IMAGE, handleHotelImageError } from "./hotelImageUtils";

/**
 * Localized dictionary mappings for 4 languages (en, tr, de, ru)
 */
export const pdfTranslations = {
  en: {
    flightTitle: "Flight Confirmation Voucher",
    hotelTitle: "Hotel Reservation Voucher",
    pnrCode: "PNR / Booking Code",
    flightDetails: "Flight Details",
    hotelDetails: "Hotel Details",
    airline: "Airline",
    flightNo: "Flight No",
    classBaggage: "Class / Baggage",
    from: "Departure (From)",
    to: "Arrival (To)",
    departureDateTime: "Departure Date & Time",
    arrivalDateTime: "Arrival Date & Time",
    duration: "Duration",
    hotel: "Hotel",
    address: "Address",
    roomBoard: "Room & Board",
    checkIn: "Check-in",
    checkOut: "Check-out",
    totalNights: "Total Nights",
    passengerDetails: "Passenger Details",
    guestDetails: "Guest Details",
    name: "Full Name",
    idPassport: "ID / Passport No",
    type: "Type",
    adult: "Adult",
    child: "Child",
    contactEmail: "Contact Email",
    paymentStatus: "Payment Status",
    completed: "COMPLETED",
    totalAmount: "Total Amount",
    connectingFlight: "Connecting Flight",
    directFlight: "Direct Flight",
    leg: "Leg",
    layover: "Layover / Transfer",
    totalDuration: "Total Duration",
    route: "Route"
  },
  tr: {
    flightTitle: "Uçuş Bileti Onay Belgesi",
    hotelTitle: "Otel Rezervasyonu Onay Belgesi",
    pnrCode: "PNR / Rez. Kodu",
    flightDetails: "Uçuş Bilgileri",
    hotelDetails: "Otel Bilgileri",
    airline: "Hava Yolu",
    flightNo: "Uçuş No",
    classBaggage: "Sınıf / Bagaj",
    from: "Kalkış Noktası",
    to: "Varış Noktası",
    departureDateTime: "Kalkış Tarihi & Saati",
    arrivalDateTime: "Varış Tarihi & Saati",
    duration: "Uçuş Süresi",
    hotel: "Otel",
    address: "Adres",
    roomBoard: "Oda & Konaklama",
    checkIn: "Giriş Tarihi",
    checkOut: "Çıkış Tarihi",
    totalNights: "Toplam Gece",
    passengerDetails: "Yolcu Bilgileri",
    guestDetails: "Misafir Bilgileri",
    name: "Ad Soyad",
    idPassport: "T.C. / Pasaport No",
    type: "Tipi",
    adult: "Yetişkin",
    child: "Çocuk",
    contactEmail: "İletişim E-Posta",
    paymentStatus: "Ödeme Durumu",
    completed: "TAMAMLANDI",
    totalAmount: "Toplam Tutar",
    connectingFlight: "Aktarmalı Uçuş",
    directFlight: "Direkt Uçuş",
    leg: "Leg / Segment",
    layover: "Aktarma / Bekleme Süresi",
    totalDuration: "Toplam Uçuş Süresi",
    route: "Güzergah / Route"
  },
  de: {
    flightTitle: "Flugbestätigungsvoucher",
    hotelTitle: "Hotelreservierungsbestätigung",
    pnrCode: "PNR / Buchungscode",
    flightDetails: "Flugdetails",
    hotelDetails: "Hoteldetails",
    airline: "Fluggesellschaft",
    flightNo: "Flugnummer",
    classBaggage: "Klasse / Gepäck",
    from: "Abflugort",
    to: "Ankunftsort",
    departureDateTime: "Abflugdatum & Zeit",
    arrivalDateTime: "Ankunftsdatum & Zeit",
    duration: "Flugdauer",
    hotel: "Hotel",
    address: "Adresse",
    roomBoard: "Zimmer & Verpflegung",
    checkIn: "Check-in",
    checkOut: "Check-out",
    totalNights: "Gesamtnächte",
    passengerDetails: "Passagierdaten",
    guestDetails: "Gästedaten",
    name: "Name Vorname",
    idPassport: "Ausweis / Reisepass-Nr.",
    type: "Typ",
    adult: "Erwachsener",
    child: "Kind",
    contactEmail: "Kontakt-E-Mail",
    paymentStatus: "Zahlungsstatus",
    completed: "ABGESCHLOSSEN",
    totalAmount: "Gesamtbetrag",
    connectingFlight: "Anschlussflug",
    directFlight: "Direktflug",
    leg: "Flugstrecke",
    layover: "Zwischenstopp",
    totalDuration: "Gesamtdauer",
    route: "Route"
  },
  ru: {
    flightTitle: "Подтверждение бронирования авиабилета",
    hotelTitle: "Подтверждение бронирования отеля",
    pnrCode: "PNR / Код бронирования",
    flightDetails: "Детали перелета",
    hotelDetails: "Информация об отеле",
    airline: "Авиакомпания",
    flightNo: "Номер рейса",
    classBaggage: "Класс / Багаж",
    from: "Пункт вылета",
    to: "Пункт назначения",
    departureDateTime: "Дата и время вылета",
    arrivalDateTime: "Дата и время прибытия",
    duration: "Время в пути",
    hotel: "Отель",
    address: "Адрес",
    roomBoard: "Номер и питание",
    checkIn: "Заезд",
    checkOut: "Выезд",
    totalNights: "Всего ночей",
    passengerDetails: "Информация о пассажирах",
    guestDetails: "Информация о гостях",
    name: "Имя Фамилия",
    idPassport: "Паспорт / Удостоверение",
    type: "Тип",
    adult: "Взрослый",
    child: "Ребенок",
    contactEmail: "Контактный E-Mail",
    paymentStatus: "Статус оплаты",
    completed: "ОПЛАЧЕНО",
    totalAmount: "Итого",
    connectingFlight: "Рейс с пересадкой",
    directFlight: "Прямой рейс",
    leg: "Сегмент",
    layover: "Пересадка",
    totalDuration: "Общее время",
    route: "Маршрут"
  }
};

/**
 * Known IATA Airport Code Mappings
 */
const IATA_MAP = {
  "kayseri": "ASR",
  "erkilet": "ASR",
  "antalya": "AYT",
  "istanbul": "IST",
  "ist": "IST",
  "saw": "SAW",
  "sabiha": "SAW",
  "ankara": "ESB",
  "esenboga": "ESB",
  "esenboğa": "ESB",
  "izmir": "ADB",
  "adnan menderes": "ADB",
  "bodrum": "BJV",
  "dalaman": "DLM",
  "adana": "ADA",
  "trabzon": "TZX",
  "gaziantep": "GZT",
  "samsun": "SZF",
  "van": "VAN",
  "erzurum": "ERZ",
  "diyarbakir": "DIY",
  "diyarbakır": "DIY",
  "konya": "KYA",
  "nevsehir": "NAV",
  "nevşehir": "NAV",
  "kapadokya": "NAV",
  "cappadocia": "NAV"
};

/**
 * Clean City Name (removes embedded parenthetical codes or suffixes)
 */
function cleanCityName(cityStr) {
  if (!cityStr) return "İstanbul";
  let s = String(cityStr).trim();
  s = s.replace(/\s*\([A-Z]{3}\)/gi, "").trim();
  s = s.replace(/\s+(Havalimanı|Havalimani|Airport|Aeroport)$/gi, "").trim();
  return s || "İstanbul";
}

/**
 * Clean Airport Name (removes embedded parenthetical codes)
 */
function cleanAirportName(airportStr, defaultCity) {
  if (!airportStr) return `${defaultCity} Havalimanı`;
  let s = String(airportStr).trim();
  s = s.replace(/\s*\([A-Z]{3}\)/gi, "").trim();
  return s;
}

/**
 * Resolves correct 3-letter IATA code for a city or airport name
 */
export function resolveIataCode(city = "", airportName = "", fallback = "") {
  const searchStr = `${city} ${airportName}`.toLowerCase().trim();
  for (const [key, code] of Object.entries(IATA_MAP)) {
    if (searchStr.includes(key)) {
      return code;
    }
  }
  if (fallback && fallback.length === 3 && !fallback.includes(" ") && fallback !== "AYT" && fallback !== "IST") {
    return fallback.toUpperCase();
  }
  const cleanC = cleanCityName(city);
  if (cleanC && cleanC.length >= 3) {
    return cleanC.substring(0, 3).toUpperCase();
  }
  return "IST";
}

/**
 * Formats location string nicely without duplicate city/code text
 */
function formatLocationDisplay(city, code, airport) {
  const c = cleanCityName(city);
  const iata = code || resolveIataCode(c, airport);
  const a = cleanAirportName(airport, c);
  return `${c} (${iata}) - ${a}`;
}

/**
 * Normalizes Turkish & Special characters for standard jsPDF Helvetica fallback rendering
 */
function sanitizeText(str) {
  if (!str) return "";
  const charMap = {
    'ğ': 'g', 'Ğ': 'G',
    'ü': 'u', 'Ü': 'U',
    'ş': 's', 'Ş': 'S',
    'ı': 'i', 'İ': 'I',
    'ö': 'o', 'Ö': 'O',
    'ç': 'c', 'Ç': 'C',
    'ä': 'a', 'Ä': 'A',
    'ß': 'ss'
  };
  return String(str).replace(/[ğĞüÜşŞıİöÖçÇäÄß]/g, (match) => charMap[match] || match);
}

/**
 * Formats date and time string cleanly (e.g., "14.09.2026 - 12:00")
 */
function formatDateTimeDisplay(dateStr, timeStr) {
  if (!dateStr) return "14.09.2026 - 12:00";
  if (typeof dateStr === "string" && dateStr.includes(" ")) {
    const parts = dateStr.split(" ");
    const dPart = parts[0];
    const tPart = timeStr || parts[1] || "12:00";
    return `${dPart} - ${tPart}`;
  }
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      const t = timeStr || `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      return `${day}.${month}.${year} - ${t}`;
    }
  } catch (e) {}
  return `${dateStr} - ${timeStr || "12:00"}`;
}

/**
 * Helper to dynamically format flight number with airline code prefix if missing
 */
function formatFlightNumber(flightNo, airlineName) {
  if (!flightNo) return "VF-2412";
  const str = String(flightNo).trim();
  if (/^[A-Za-z0-9]{2,3}[-\s]?\d+$/.test(str)) {
    return str.replace(/\s+/g, '-').toUpperCase();
  }
  const airlinePrefixes = {
    "AJet": "VF",
    "AnadoluJet": "VF",
    "Turkish Airlines": "TK",
    "THY": "TK",
    "Pegasus": "PC",
    "SunExpress": "XQ",
    "Lufthansa": "LH",
    "Emirates": "EK"
  };
  let prefix = "VF";
  if (airlineName) {
    for (const [key, code] of Object.entries(airlinePrefixes)) {
      if (airlineName.toLowerCase().includes(key.toLowerCase())) {
        prefix = code;
        break;
      }
    }
  }
  return `${prefix}-${str}`;
}

/**
 * Helper to estimate duration if missing
 */
function calculateDuration(depDateTimeStr, arrDateTimeStr) {
  try {
    const d1 = new Date(depDateTimeStr);
    const d2 = new Date(arrDateTimeStr);
    const diffMs = d2 - d1;
    if (isNaN(diffMs) || diffMs <= 0) return "1h 15m";
    const totalMin = Math.floor(diffMs / (1000 * 60));
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    return `${h}h ${m}m`;
  } catch (e) {
    return "1h 15m";
  }
}

/**
 * Normalizes input object to standard FlightConfirmationData structure with multi-segment & layover support
 */
export function normalizeFlightConfirmationData(input = {}) {
  const extra = input.extraDetails || {};
  
  const pnr = input.pnr || input.pnrCode || extra.pnrCode || extra.reservationNumber || extra.id || "PNR-DA5FDB";
  const defaultAirline = input.airlineName || extra.airlineName || extra.airline || input.itemTitle || "AJet";
  const defaultCabin = input.cabinClass || extra.cabinClass || extra.ticketClass || extra.flightClass || "Economy";
  const defaultBaggage = input.baggageAllowance || extra.baggageAllowance || extra.baggage || "20 kg";

  const rawSegments = input.segments || extra.segments || extra.legs || [];
  
  let segments = [];
  if (Array.isArray(rawSegments) && rawSegments.length > 0) {
    segments = rawSegments.map((seg, idx) => {
      const segAirline = seg.airlineName || seg.airline || defaultAirline;
      
      const depCity = cleanCityName(seg.departure?.city || seg.departureCity || seg.fromCity || (idx === 0 ? "Antalya" : "İstanbul"));
      const depCode = seg.departure?.code || seg.departureCode || resolveIataCode(depCity, seg.departure?.airportName || seg.departureAirport || seg.departure?.airport);
      const depAirport = cleanAirportName(seg.departure?.airportName || seg.departure?.airport || seg.departureAirport, depCity);

      const arrCity = cleanCityName(seg.arrival?.city || seg.arrivalCity || seg.toCity || (idx === 0 ? "İstanbul" : "Kayseri"));
      const arrCode = seg.arrival?.code || seg.arrivalCode || resolveIataCode(arrCity, seg.arrival?.airportName || seg.arrivalAirport || seg.arrival?.airport);
      const arrAirport = cleanAirportName(seg.arrival?.airportName || seg.arrival?.airport || seg.arrivalAirport, arrCity);

      const depDT = formatDateTimeDisplay(seg.departureTime || seg.departureDateTime || seg.startDate || "2026-09-14 12:00", seg.departureTimeOnly);
      const arrDT = formatDateTimeDisplay(seg.arrivalTime || seg.arrivalDateTime || seg.endDate || "2026-09-14 13:15", seg.arrivalTimeOnly);

      return {
        legNumber: seg.legNumber || seg.leg || idx + 1,
        airline: segAirline,
        flightNo: formatFlightNumber(seg.flightNumber || seg.flightNo || (idx === 0 ? "VF-2412" : "VF-2890"), segAirline),
        cabinClass: seg.cabinClass || seg.ticketClass || defaultCabin,
        baggage: seg.baggageAllowance || seg.baggage || defaultBaggage,
        duration: seg.duration || calculateDuration(seg.departureTime, seg.arrivalTime),
        departureCity: depCity,
        departureCode: depCode,
        departureAirport: depAirport,
        departureDateTime: depDT,
        arrivalCity: arrCity,
        arrivalCode: arrCode,
        arrivalAirport: arrAirport,
        arrivalDateTime: arrDT
      };
    });
  } else {
    let depCity = "Antalya";
    let arrCity = "Kayseri";

    if (typeof input.destination === "string" && input.destination.includes("->")) {
      const parts = input.destination.split("->").map(s => s.trim());
      depCity = cleanCityName(parts[0] || depCity);
      arrCity = cleanCityName(parts[parts.length - 1] || arrCity);
    } else {
      depCity = cleanCityName(input.departureLocation?.city || extra.departureCity || input.departureCity || depCity);
      arrCity = cleanCityName(input.arrivalLocation?.city || extra.arrivalCity || input.arrivalCity || input.destination || arrCity);
    }

    const depCode = input.departureLocation?.code || resolveIataCode(depCity, input.departureLocation?.airportName || extra.departureAirport);
    const depAirport = cleanAirportName(input.departureLocation?.airportName || extra.departureAirport, depCity);

    const arrCode = input.arrivalLocation?.code || resolveIataCode(arrCity, input.arrivalLocation?.airportName || extra.arrivalAirport);
    const arrAirport = cleanAirportName(input.arrivalLocation?.airportName || extra.arrivalAirport, arrCity);

    const depDT = formatDateTimeDisplay(input.departureDate || input.startDate || "2026-09-14 12:00", input.departureTime);
    const arrDT = formatDateTimeDisplay(input.arrivalDate || input.endDate || "2026-09-14 13:15", input.arrivalTime);

    segments = [
      {
        legNumber: 1,
        airline: defaultAirline,
        flightNo: formatFlightNumber(input.flightNumber || extra.flightNumber || extra.flightNo || "VF-2412", defaultAirline),
        cabinClass: defaultCabin,
        baggage: defaultBaggage,
        duration: input.duration || extra.duration || calculateDuration(input.startDate, input.endDate),
        departureCity: depCity,
        departureCode: depCode,
        departureAirport: depAirport,
        departureDateTime: depDT,
        arrivalCity: arrCity,
        arrivalCode: arrCode,
        arrivalAirport: arrAirport,
        arrivalDateTime: arrDT
      }
    ];
  }

  const isConnecting = Boolean(input.isConnecting || extra.isConnecting || segments.length > 1);

  const origin = {
    city: segments[0].departureCity,
    code: segments[0].departureCode
  };

  const destination = {
    city: segments[segments.length - 1].arrivalCity,
    code: segments[segments.length - 1].arrivalCode
  };

  let layovers = input.layovers || extra.layovers || [];
  if ((!layovers || layovers.length === 0) && segments.length > 1) {
    layovers = [];
    for (let i = 0; i < segments.length - 1; i++) {
      const arrCity = segments[i].arrivalCity;
      const arrCode = segments[i].arrivalCode;
      const layoverDur = calculateDuration(segments[i].arrivalDateTime, segments[i + 1].departureDateTime) || "1h 45m";
      layovers.push({
        airportCode: arrCode,
        cityName: arrCity,
        duration: layoverDur
      });
    }
  }

  const totalDuration = input.totalDuration || extra.totalDuration || (
    isConnecting ? "4h 30m" : segments[0].duration
  );

  const rawPassengers = input.passengers || extra.passengers || [];
  const passengers = rawPassengers.length > 0 ? rawPassengers.map(p => ({
    fullName: p.fullName || `${p.firstName || ''} ${p.lastName || ''}`.trim() || "Passenger",
    identityNumber: p.identityNumber || p.tcNo || p.passportNumber || "-",
    passengerType: (p.passengerType || p.type || "Adult").toUpperCase()
  })) : [
    {
      fullName: `${extra.firstName || 'John'} ${extra.lastName || 'Doe'}`.trim(),
      identityNumber: extra.tcNo || extra.identityNumber || "11111111111",
      passengerType: "ADULT"
    }
  ];

  const contactEmail = input.contactEmail || input.userEmail || extra.contactEmail || extra.email || "test@test2.com";
  const paymentStatus = (input.paymentStatus || extra.paymentStatus || "PAID").toUpperCase();
  const totalAmount = Number(input.totalAmount ?? input.totalPrice ?? extra.totalAmount ?? 0);
  const currency = input.currency || extra.currency || "TRY";

  return {
    pnr,
    isConnecting,
    totalDuration,
    origin,
    destination,
    segments,
    layovers,
    passengers,
    contactEmail,
    paymentStatus,
    totalAmount,
    currency
  };
}

/**
 * Normalizes input object to standard HotelConfirmationData structure with image fallback
 */
export function normalizeHotelConfirmationData(input = {}) {
  const extra = input.extraDetails || {};

  const pnr = input.pnr || input.pnrCode || extra.pnrCode || extra.reservationNumber || extra.id || "PNR-789012";
  const hotelName = input.hotelName || input.itemTitle || extra.hotelName || extra.name || "Sanny Resort & Spa";
  const hotelAddress = input.hotelAddress || extra.hotelAddress || extra.address || "Atatürk Cad. No: 100, Antalya / Turkey";
  const roomType = input.roomType || extra.roomType || "Standard Deluxe Room";
  const boardType = input.boardType || extra.boardType || "All Inclusive";
  const location = input.location || input.destination || extra.location || extra.city || "Antalya, Turkey";

  const hotelImage = getHotelImage(input) || getHotelImage(extra) || DEFAULT_HOTEL_IMAGE;

  const checkInDate = input.checkInDate || input.startDate || extra.checkInDate || extra.startDate || "2026-08-15";
  const checkInTime = input.checkInTime || extra.checkInTime || "14:00";
  const checkOutDate = input.checkOutDate || input.endDate || extra.checkOutDate || extra.endDate || "2026-08-20";
  const checkOutTime = input.checkOutTime || extra.checkOutTime || "12:00";

  let totalNights = input.totalNights || extra.nights || extra.totalNights;
  if (!totalNights) {
    try {
      const d1 = new Date(checkInDate);
      const d2 = new Date(checkOutDate);
      const diff = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
      totalNights = diff > 0 ? diff : 1;
    } catch (e) {
      totalNights = 1;
    }
  }

  const rawGuests = input.guests || input.passengers || extra.guests || extra.passengers || [];
  const guests = rawGuests.length > 0 ? rawGuests.map(g => ({
    fullName: g.fullName || `${g.firstName || ''} ${g.lastName || ''}`.trim() || "Guest",
    identityNumber: g.identityNumber || g.tcNo || g.passportNumber || "-",
    guestType: (g.guestType || g.passengerType || g.type || "ADULT").toUpperCase()
  })) : [
    {
      fullName: `${extra.firstName || 'John'} ${extra.lastName || 'Doe'}`.trim(),
      identityNumber: extra.tcNo || extra.identityNumber || "-",
      guestType: "ADULT"
    }
  ];

  const contactEmail = input.contactEmail || input.userEmail || extra.contactEmail || extra.email || "-";
  const paymentStatus = (input.paymentStatus || extra.paymentStatus || "PAID").toUpperCase();
  const totalAmount = Number(input.totalAmount ?? input.totalPrice ?? extra.totalAmount ?? 0);
  const currency = input.currency || extra.currency || "TRY";

  return {
    pnr,
    hotelName,
    hotelAddress,
    roomType,
    boardType,
    location,
    hotelImage,
    checkInDate,
    checkInTime,
    checkOutDate,
    checkOutTime,
    totalNights,
    guests,
    contactEmail,
    paymentStatus,
    totalAmount,
    currency
  };
}

/**
 * Generates standalone, modern HTML string compatible with HTML-to-PDF engines (WeasyPrint, Puppeteer, Chrome)
 */
export function generateReservationHtml(data = {}, lang = "tr", isFlightInput = false) {
  const language = (lang || "tr").toLowerCase();
  const t = pdfTranslations[language] || pdfTranslations.tr;

  const isFlight = isFlightInput || Boolean(data.segments || data.airlineName || data.flightNumber || data.departureLocation || data.origin);
  
  const pdfData = isFlight ? normalizeFlightConfirmationData(data) : null;
  const hotelData = !isFlight ? normalizeHotelConfirmationData(data) : null;

  const title = isFlight ? t.flightTitle : t.hotelTitle;
  const pnr = isFlight ? pdfData.pnr : hotelData.pnr;
  const email = isFlight ? pdfData.contactEmail : hotelData.contactEmail;
  const totalAmount = isFlight ? pdfData.totalAmount : hotelData.totalAmount;
  const currency = isFlight ? pdfData.currency : hotelData.currency;
  const paymentStatus = isFlight ? pdfData.paymentStatus : hotelData.paymentStatus;
  const people = isFlight ? pdfData.passengers : hotelData.guests;
  const peopleTitle = isFlight ? t.passengerDetails : t.guestDetails;

  const peopleRowsHtml = people.map((p, idx) => {
    const typeKey = (p.passengerType || p.guestType || "").toUpperCase() === "CHILD" ? t.child : t.adult;
    return `
      <tr>
        <td>${idx + 1}</td>
        <td><strong>${p.fullName}</strong></td>
        <td>${p.identityNumber || "-"}</td>
        <td><span class="badge badge-subtle">${typeKey}</span></td>
      </tr>
    `;
  }).join("");

  let detailsBlockHtml = "";
  if (isFlight) {
    const routeNodes = [
      `${pdfData.segments[0].departureCity} (${pdfData.segments[0].departureCode})`,
      ...pdfData.segments.map(s => `${s.arrivalCity} (${s.arrivalCode})`)
    ];
    const flightRouteDisplay = routeNodes.join(" ➔ ");

    const layoverCount = pdfData.layovers.length || (pdfData.segments.length - 1);
    const layoverDetailsStr = pdfData.layovers.length > 0
      ? pdfData.layovers.map(l => `${l.cityName} / ${l.airportCode}`).join(", ")
      : `${pdfData.segments[0].arrivalCity} / ${pdfData.segments[0].arrivalCode}`;

    const badgeLabel = language === "tr" ? "Aktarma" : (language === "de" ? "Zwischenstopp" : (language === "ru" ? "Пересадка" : "Layover"));
    const transferBadgeText = `${layoverCount} ${badgeLabel} (${layoverDetailsStr})`;

    const routeHeaderHtml = `
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 14px;">
        <div>
          <span style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold;">${t.route}</span>
          <div style="font-size: 16px; font-weight: bold; color: #1e293b; margin-top: 2px;">
            ${flightRouteDisplay}
          </div>
        </div>
        
        ${pdfData.isConnecting ? `
        <span style="background-color: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; font-size: 12px; font-weight: bold; padding: 4px 10px; border-radius: 12px;">
          ${transferBadgeText}
        </span>
        ` : ''}
      </div>
    `;

    const segmentsHtml = pdfData.segments.map((seg, idx) => {
      const layover = pdfData.layovers[idx];
      const layoverHtml = layover ? `
        <div class="layover-banner">
          ⏱ <strong>${t.layover}:</strong> ${layover.cityName} (${layover.airportCode}) — <span>${layover.duration}</span>
        </div>
      ` : "";

      const depLocDisplay = formatLocationDisplay(seg.departureCity, seg.departureCode, seg.departureAirport);
      const arrLocDisplay = formatLocationDisplay(seg.arrivalCity, seg.arrivalCode, seg.arrivalAirport);

      return `
        <div class="card" style="background: #f8f9fa; border-radius: 8px; padding: 16px; margin-bottom: 14px;">
          ${idx === 0 ? routeHeaderHtml : ''}
          <div class="card-header flex-between">
            <span>${t.leg} ${seg.legNumber}: ${seg.departureCity} (${seg.departureCode}) ➔ ${seg.arrivalCity} (${seg.arrivalCode})</span>
            <span class="badge badge-outline">${seg.airline} ${seg.flightNo}</span>
          </div>
          <div class="grid-2">
            <div class="field">
              <span class="label">${t.airline}:</span>
              <span class="value">${seg.airline}</span>
            </div>
            <div class="field">
              <span class="label">${t.flightNo}:</span>
              <span class="value highlight">${seg.flightNo}</span>
            </div>
            <div class="field">
              <span class="label">${t.classBaggage}:</span>
              <span class="value">${seg.cabinClass} / ${seg.baggage}</span>
            </div>
            <div class="field">
              <span class="label">${t.duration}:</span>
              <span class="value">${seg.duration}</span>
            </div>
            <div class="field">
              <span class="label">${t.from}:</span>
              <span class="value">${depLocDisplay}</span>
            </div>
            <div class="field">
              <span class="label">${t.to}:</span>
              <span class="value">${arrLocDisplay}</span>
            </div>
            <div class="field">
              <span class="label">${t.departureDateTime}:</span>
              <span class="value">${seg.departureDateTime}</span>
            </div>
            <div class="field">
              <span class="label">${t.arrivalDateTime}:</span>
              <span class="value">${seg.arrivalDateTime}</span>
            </div>
          </div>
        </div>
        ${layoverHtml}
      `;
    }).join("");

    detailsBlockHtml = segmentsHtml;
  } else {
    detailsBlockHtml = `
      <div class="card">
        <div style="width: 100%; height: 180px; overflow: hidden; border-radius: 8px; margin-bottom: 14px;">
          <img src="${hotelData.hotelImage}" alt="${hotelData.hotelName}" style="width: 100%; height: 100%; object-fit: cover;" onError="this.onerror=null;this.src='${DEFAULT_HOTEL_IMAGE}';" />
        </div>
        <div class="card-header">${t.hotelDetails}</div>
        <div class="grid-2">
          <div class="field">
            <span class="label">${t.hotel}:</span>
            <span class="value highlight">${hotelData.hotelName}</span>
          </div>
          <div class="field">
            <span class="label">${t.address}:</span>
            <span class="value">${hotelData.hotelAddress} (${hotelData.location})</span>
          </div>
          <div class="field">
            <span class="label">${t.roomBoard}:</span>
            <span class="value">${hotelData.roomType} / ${hotelData.boardType}</span>
          </div>
          <div class="field">
            <span class="label">${t.totalNights}:</span>
            <span class="value">${hotelData.totalNights}</span>
          </div>
          <div class="field">
            <span class="label">${t.checkIn}:</span>
            <span class="value">${hotelData.checkInDate} (${hotelData.checkInTime})</span>
          </div>
          <div class="field">
            <span class="label">${t.checkOut}:</span>
            <span class="value">${hotelData.checkOutDate} (${hotelData.checkOutTime})</span>
          </div>
          <div class="field">
            <span class="label">${t.contactEmail}:</span>
            <span class="value">${email}</span>
          </div>
        </div>
      </div>
    `;
  }

  return `<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="utf-8">
  <title>${title} - ${pnr}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 15mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background-color: #ffffff;
      padding: 20px;
      font-size: 13px;
      line-height: 1.5;
    }
    .header {
      background-color: #0f172a;
      color: #ffffff;
      padding: 24px 30px;
      border-radius: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .brand-title {
      font-size: 22px;
      font-weight: 800;
      letter-spacing: 0.5px;
      color: #ffffff;
      margin-bottom: 4px;
    }
    .brand-subtitle {
      font-size: 12px;
      color: #94a3b8;
    }
    .pnr-badge {
      background-color: #2563eb;
      color: #ffffff;
      padding: 10px 18px;
      border-radius: 8px;
      text-align: right;
    }
    .pnr-label {
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      opacity: 0.9;
    }
    .pnr-code {
      font-size: 16px;
      font-weight: 700;
      margin-top: 2px;
    }
    .layover-banner {
      background-color: #fffbe6;
      border: 1px solid #ffe58f;
      border-radius: 8px;
      padding: 10px 16px;
      margin-bottom: 14px;
      font-size: 12px;
      color: #d48806;
      text-align: center;
    }
    .card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 18px 20px;
      margin-bottom: 14px;
    }
    .card-header {
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 8px;
      margin-bottom: 14px;
    }
    .flex-between {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px 20px;
    }
    .field {
      display: flex;
      flex-direction: column;
    }
    .label {
      font-size: 11px;
      color: #64748b;
      font-weight: 600;
      margin-bottom: 2px;
    }
    .value {
      font-size: 12.5px;
      color: #1e293b;
      font-weight: 500;
    }
    .value.highlight {
      font-weight: 700;
      color: #2563eb;
    }
    .table-section {
      margin-bottom: 20px;
    }
    .section-title {
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 10px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      overflow: hidden;
    }
    th {
      background-color: #f1f5f9;
      color: #334155;
      font-size: 11px;
      font-weight: 700;
      text-align: left;
      padding: 9px 12px;
      border-bottom: 1px solid #e2e8f0;
    }
    td {
      padding: 10px 12px;
      border-bottom: 1px solid #f1f5f9;
      color: #1e293b;
      font-size: 12px;
    }
    tr:last-child td {
      border-bottom: none;
    }
    .badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
    }
    .badge-subtle {
      background-color: #e0f2fe;
      color: #0369a1;
    }
    .badge-outline {
      border: 1px solid #cbd5e1;
      color: #475569;
    }
    .payment-banner {
      background-color: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 10px;
      padding: 14px 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .payment-status {
      font-size: 13.5px;
      font-weight: 700;
      color: #166534;
    }
    .payment-amount {
      font-size: 15px;
      font-weight: 800;
      color: #15803d;
    }
    .footer {
      text-align: center;
      font-size: 10.5px;
      color: #94a3b8;
      margin-top: 20px;
      padding-top: 12px;
      border-top: 1px dashed #e2e8f0;
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand-title">SANNY TRAVEL</div>
      <div class="brand-subtitle">${title}</div>
    </div>
    <div class="pnr-badge">
      <div class="pnr-label">${t.pnrCode}</div>
      <div class="pnr-code">${pnr}</div>
    </div>
  </div>

  ${detailsBlockHtml}

  <div class="table-section">
    <div class="section-title">${peopleTitle}</div>
    <table>
      <thead>
        <tr>
          <th style="width: 40px;">#</th>
          <th>${t.name}</th>
          <th>${t.idPassport}</th>
          <th>${t.type}</th>
        </tr>
      </thead>
      <tbody>
        ${peopleRowsHtml}
      </tbody>
    </table>
  </div>

  <div class="payment-banner">
    <div class="payment-status">${t.paymentStatus}: ${paymentStatus === "PAID" || paymentStatus === "COMPLETED" ? t.completed : paymentStatus}</div>
    <div class="payment-amount">${t.totalAmount}: ${Math.round(totalAmount).toLocaleString(language === "tr" ? "tr-TR" : "en-US")} ${currency}</div>
  </div>

  <div class="footer">
    This document was automatically generated by Sanny Travel.
  </div>
</body>
</html>`;
}

/**
 * Main export for client-side PDF document generation.
 */
export function generateReservationPdf(options = {}) {
  const isFlight = options.isFlight !== undefined
    ? Boolean(options.isFlight)
    : Boolean(options.segments || options.airlineName || options.flightNumber || options.departureLocation || options.origin);

  const lang = (options.lang || "tr").toLowerCase();
  const t = pdfTranslations[lang] || pdfTranslations.tr;

  const pdfData = isFlight ? normalizeFlightConfirmationData(options) : null;
  const hotelData = !isFlight ? normalizeHotelConfirmationData(options) : null;

  const pnr = isFlight ? pdfData.pnr : hotelData.pnr;
  const docType = isFlight ? t.flightTitle : t.hotelTitle;
  const fileName = isFlight ? `Bilet_${pnr}.pdf` : `Otel_Rezervasyon_${pnr}.pdf`;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  // Header Banner
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 35, "F");

  // Title inside Banner
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("SANNY TRAVEL", 15, 18);

  doc.setFontSize(10.5);
  doc.setFont("helvetica", "normal");
  doc.text(sanitizeText(docType), 15, 26);

  // PNR Badge Box
  doc.setFillColor(37, 99, 235);
  doc.roundedRect(138, 7, 57, 21, 3, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.text(sanitizeText(t.pnrCode), 143, 13);
  doc.setFontSize(13.5);
  doc.setFont("helvetica", "bold");
  doc.text(sanitizeText(pnr), 143, 22);

  let currentY = 43;

  if (isFlight) {
    const routeNodes = [
      `${pdfData.segments[0].departureCity} (${pdfData.segments[0].departureCode})`,
      ...pdfData.segments.map(s => `${s.arrivalCity} (${s.arrivalCode})`)
    ];
    const flightRouteDisplay = routeNodes.join(" -> ");

    const layoverCount = pdfData.layovers.length || (pdfData.segments.length - 1);
    const layoverDetailsStr = pdfData.layovers.length > 0
      ? pdfData.layovers.map(l => `${l.cityName} / ${l.airportCode}`).join(", ")
      : `${pdfData.segments[0].arrivalCity} / ${pdfData.segments[0].arrivalCode}`;

    const badgeLabel = lang === "tr" ? "Aktarma" : (lang === "de" ? "Zwischenstopp" : (lang === "ru" ? "Пересадка" : "Layover"));
    const transferBadgeText = `${layoverCount} ${badgeLabel} (${layoverDetailsStr})`;

    // Route & Connection Header Card
    doc.setFillColor(239, 246, 255);
    doc.setDrawColor(191, 219, 254);
    doc.roundedRect(15, currentY, 180, 18, 3, 3, "FD");

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(sanitizeText(t.route.toUpperCase()), 20, currentY + 6);

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(sanitizeText(flightRouteDisplay), 20, currentY + 13);

    if (pdfData.isConnecting) {
      doc.setFillColor(239, 246, 255);
      doc.setDrawColor(191, 219, 254);
      doc.roundedRect(125, currentY + 4, 65, 10, 4, 4, "FD");

      doc.setTextColor(29, 78, 216);
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "bold");
      doc.text(sanitizeText(transferBadgeText), 128, currentY + 10.5);
    }

    currentY += 23;

    pdfData.segments.forEach((seg, idx) => {
      const segBoxHeight = 44;
      doc.setDrawColor(226, 232, 240);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(15, currentY, 180, segBoxHeight, 3, 3, "FD");

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(10.5);
      doc.setFont("helvetica", "bold");
      const legHeader = pdfData.segments.length > 1
        ? `Leg ${seg.legNumber}: ${seg.departureCity} (${seg.departureCode}) -> ${seg.arrivalCity} (${seg.arrivalCode})`
        : t.flightDetails;
      doc.text(sanitizeText(legHeader), 20, currentY + 8);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105);

      doc.text(sanitizeText(`${t.airline}: ${seg.airline}`), 20, currentY + 16);
      doc.text(sanitizeText(`${t.flightNo}: ${seg.flightNo}`), 110, currentY + 16);
      doc.text(sanitizeText(`${t.classBaggage}: ${seg.cabinClass} / ${seg.baggage}`), 20, currentY + 23);
      doc.text(sanitizeText(`${t.duration}: ${seg.duration}`), 110, currentY + 23);

      const depLocStr = formatLocationDisplay(seg.departureCity, seg.departureCode, seg.departureAirport);
      const arrLocStr = formatLocationDisplay(seg.arrivalCity, seg.arrivalCode, seg.arrivalAirport);

      doc.text(sanitizeText(`${t.from}: ${depLocStr}`), 20, currentY + 30);
      doc.text(sanitizeText(`${t.to}: ${arrLocStr}`), 20, currentY + 37);

      currentY += segBoxHeight + 5;

      const layover = pdfData.layovers[idx];
      if (layover) {
        doc.setFillColor(254, 243, 199);
        doc.setDrawColor(253, 230, 138);
        doc.roundedRect(15, currentY, 180, 10, 2, 2, "FD");

        doc.setTextColor(146, 64, 14);
        doc.setFontSize(8.5);
        doc.setFont("helvetica", "bold");
        const layoverText = `BEKLEME / LAYOVER: ${layover.cityName} (${layover.airportCode}) - ${layover.duration}`;
        doc.text(sanitizeText(layoverText), 20, currentY + 6.5);

        currentY += 14;
      }
    });

  } else {
    // Hotel Details Card
    const boxHeight = 56;
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(15, currentY, 180, boxHeight, 3, 3, "FD");

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(sanitizeText(t.hotelDetails), 20, currentY + 9);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);

    doc.text(sanitizeText(`${t.hotel}: ${hotelData.hotelName}`), 20, currentY + 17);
    doc.text(sanitizeText(`${t.totalNights}: ${hotelData.totalNights}`), 125, currentY + 17);

    doc.text(sanitizeText(`${t.address}: ${hotelData.hotelAddress}`), 20, currentY + 25);
    doc.text(sanitizeText(`${t.roomBoard}: ${hotelData.roomType} / ${hotelData.boardType}`), 20, currentY + 33);

    doc.text(sanitizeText(`${t.checkIn}: ${hotelData.checkInDate} (${hotelData.checkInTime})`), 20, currentY + 41);
    doc.text(sanitizeText(`${t.checkOut}: ${hotelData.checkOutDate} (${hotelData.checkOutTime})`), 110, currentY + 41);

    doc.text(sanitizeText(`${t.contactEmail}: ${hotelData.contactEmail}`), 20, currentY + 49);

    currentY += boxHeight + 8;
  }

  // Passenger / Guest Details Section
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(sanitizeText(isFlight ? t.passengerDetails : t.guestDetails), 15, currentY);

  currentY += 4;

  // Table Header
  doc.setFillColor(241, 245, 249);
  doc.rect(15, currentY, 180, 7.5, "F");
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(51, 65, 85);
  doc.text("#", 18, currentY + 5);
  doc.text(sanitizeText(t.name), 30, currentY + 5);
  doc.text(sanitizeText(t.idPassport), 105, currentY + 5);
  doc.text(sanitizeText(t.type), 160, currentY + 5);

  currentY += 7.5;

  const people = isFlight ? pdfData.passengers : hotelData.guests;
  people.forEach((p, idx) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);

    const typeLabel = (p.passengerType || p.guestType) === "CHILD" ? t.child : t.adult;

    doc.text(String(idx + 1), 18, currentY + 5.5);
    doc.text(sanitizeText(p.fullName), 30, currentY + 5.5);
    doc.text(sanitizeText(p.identityNumber || "-"), 105, currentY + 5.5);
    doc.text(sanitizeText(typeLabel), 160, currentY + 5.5);

    doc.setDrawColor(241, 245, 249);
    doc.line(15, currentY + 8, 195, currentY + 8);

    currentY += 9;
  });

  currentY += 8;

  // Payment Summary Box
  const totalAmount = isFlight ? pdfData.totalAmount : hotelData.totalAmount;
  const currency = isFlight ? pdfData.currency : hotelData.currency;
  const paymentStatus = isFlight ? pdfData.paymentStatus : hotelData.paymentStatus;

  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(15, currentY, 180, 20, 3, 3, "FD");

  doc.setTextColor(22, 101, 52);
  doc.setFontSize(10.5);
  doc.setFont("helvetica", "bold");
  const statusStr = paymentStatus === "PAID" || paymentStatus === "COMPLETED" ? t.completed : paymentStatus;
  doc.text(sanitizeText(`${t.paymentStatus}: ${statusStr}`), 22, currentY + 12);

  doc.setFontSize(12);
  doc.text(sanitizeText(`${t.totalAmount}: ${Math.round(totalAmount).toLocaleString("tr-TR")} ${currency}`), 110, currentY + 12);

  // Footer Note
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(148, 163, 184);
  doc.text("This document was automatically generated by Sanny Travel.", 105, 285, { align: "center" });

  doc.save(fileName);
}
