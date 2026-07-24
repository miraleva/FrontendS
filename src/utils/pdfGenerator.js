import { jsPDF } from "jspdf";

/**
 * Normalizes Turkish characters for standard jsPDF fonts to avoid encoding rendering glitches.
 */
function sanitizeText(str) {
  if (!str) return "";
  const charMap = {
    'ğ': 'g', 'Ğ': 'G',
    'ü': 'u', 'Ü': 'U',
    'ş': 's', 'Ş': 'S',
    'ı': 'i', 'İ': 'I',
    'ö': 'o', 'Ö': 'O',
    'ç': 'c', 'Ç': 'C'
  };
  return String(str).replace(/[ğĞüÜşŞıİöÖçÇ]/g, (match) => charMap[match] || match);
}

/**
 * Formats date for display in PDF
 */
function formatDate(dateStr) {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
  } catch (e) {
    return dateStr;
  }
}

/**
 * Generates and downloads a PDF document for Flight or Hotel Reservation.
 */
export function generateReservationPdf({
  isFlight = false,
  pnrCode = "PNR-123456",
  itemTitle = "",
  destination = "",
  startDate = "",
  endDate = "",
  passengers = [],
  totalPrice = 0,
  currency = "TRY",
  userEmail = "",
  extraDetails = {}
}) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const pnr = pnrCode || extraDetails.reservationNumber || extraDetails.id || "PNR12345";
  const docType = isFlight ? "Ucus Bileti" : "Otel Rezervasyonu";
  const fileName = isFlight ? `Bilet_${pnr}.pdf` : `Otel_Rezervasyon_${pnr}.pdf`;

  // Header Banner
  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(0, 0, 210, 35, "F");

  // Title inside Banner
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("SANNY TRAVEL", 15, 18);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(sanitizeText(`${docType} Onay Belgesi`), 15, 26);

  // PNR Badge Box
  doc.setFillColor(59, 130, 246); // blue-500
  doc.roundedRect(140, 8, 55, 20, 3, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("PNR / REZ. KODU", 145, 14);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(sanitizeText(pnr), 145, 23);

  let currentY = 45;

  // Reservation Details Card Box
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setFillColor(248, 250, 252); // slate-50
  doc.roundedRect(15, currentY, 180, 42, 3, 3, "FD");

  doc.setTextColor(15, 23, 42); // slate-900
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(sanitizeText(isFlight ? `Ucus: ${itemTitle}` : `Otel: ${itemTitle}`), 20, currentY + 10);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105); // slate-600

  if (isFlight) {
    doc.text(sanitizeText(`Gidis / Varıs Lokasyonu: ${destination || '-'}`), 20, currentY + 18);
    doc.text(sanitizeText(`Kalkıs Tarihi: ${formatDate(startDate)}`), 20, currentY + 26);
    if (endDate) {
      doc.text(sanitizeText(`Donus Tarihi: ${formatDate(endDate)}`), 110, currentY + 26);
    }
  } else {
    doc.text(sanitizeText(`Lokasyon: ${destination || '-'}`), 20, currentY + 18);
    doc.text(sanitizeText(`Giris Tarihi: ${formatDate(startDate)}`), 20, currentY + 26);
    doc.text(sanitizeText(`Cıkıs Tarihi: ${formatDate(endDate)}`), 110, currentY + 26);
  }

  doc.text(sanitizeText(`İletisim E-Posta: ${userEmail || '-'}`), 20, currentY + 34);

  currentY += 50;

  // Passenger / Guest Details Section
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(sanitizeText(isFlight ? "Yolcu Bilgileri" : "Misafir Bilgileri"), 15, currentY);

  currentY += 5;

  // Table Header
  doc.setFillColor(241, 245, 249);
  doc.rect(15, currentY, 180, 8, "F");
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(51, 65, 85);
  doc.text("#", 18, currentY + 5.5);
  doc.text(sanitizeText("Ad Soyad"), 30, currentY + 5.5);
  doc.text(sanitizeText("T.C. / Pasaport No"), 95, currentY + 5.5);
  doc.text(sanitizeText("Tipti"), 155, currentY + 5.5);

  currentY += 8;

  const passList = passengers && passengers.length > 0 ? passengers : [
    {
      firstName: extraDetails.firstName || "Misafir",
      lastName: extraDetails.lastName || "",
      identityNumber: extraDetails.tcNo || extraDetails.identityNumber || "-",
      type: "ADULT"
    }
  ];

  passList.forEach((p, idx) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);

    const name = `${p.firstName || ''} ${p.lastName || ''}`.trim() || "-";
    const tcNo = p.identityNumber || p.tcNo || p.passportNumber || "-";
    const typeLabel = p.type === "CHILD" ? "Cocuk" : "Yetiskin";

    doc.text(String(idx + 1), 18, currentY + 6);
    doc.text(sanitizeText(name), 30, currentY + 6);
    doc.text(sanitizeText(tcNo), 95, currentY + 6);
    doc.text(sanitizeText(typeLabel), 155, currentY + 6);

    doc.setDrawColor(241, 245, 249);
    doc.line(15, currentY + 9, 195, currentY + 9);

    currentY += 10;
  });

  currentY += 10;

  // Payment Summary Box
  doc.setFillColor(240, 253, 244); // emerald-50
  doc.setDrawColor(187, 247, 208); // emerald-200
  doc.roundedRect(15, currentY, 180, 22, 3, 3, "FD");

  doc.setTextColor(22, 101, 52); // emerald-800
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(sanitizeText("Odeme Durumu: ONALANDI"), 22, currentY + 9);

  doc.setFontSize(13);
  doc.text(sanitizeText(`Toplam Tutar: ${Math.round(totalPrice || 0).toLocaleString("tr-TR")} ${currency}`), 110, currentY + 14);

  // Footer Note
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(sanitizeText("Bu belge Sanny Travel tarafindan otomatik olarak olusturulmustur."), 105, 285, { align: "center" });

  doc.save(fileName);
}
