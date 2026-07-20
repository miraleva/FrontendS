import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  PanelLeftOpen,
  Hotel,
  Plane,
  MapPin,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  X,
  Download,
  MessageSquare,
  Edit3,
  Trash2
} from "lucide-react";
import ChatSidebar from "../components/ChatSidebar";
import api from "../services/api";

export default function PastAppointments() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  const videoRef = useRef(null);

  const mockAppointments = [
    {
      id: 1,
      title: "Antalya Şehir Turu",
      itemName: "Antalya Şehir Turu",
      destination: "Antalya",
      type: "Hotel",
      date: "12 Haziran - 19 Haziran 2026",
      startDate: "2026-06-12",
      endDate: "2026-06-19",
      status: "Completed",
      hotelName: "Antalya Şehir Turu",
      checkIn: "12 Haziran 2026",
      checkOut: "19 Haziran 2026",
      nights: 7,
      guests: 1,
      resNumber: "RES-163CF0BB",
      reservationNumber: "RES-163CF0BB",
      paymentStatus: "Paid",
      totalPrice: 2400,
      currency: "TRY",
      price: "₺2.400,00",

      passengers: [
        {
          firstName: "Ayşe",
          lastName: "Yılmaz",
          email: "ayse@example.com",
          phoneNumber: "05551234567",
          identityNumber: "12345678901"
        }
      ]
    },

    {
      id: 2,
      title: "İstanbul (IST) - Münih (MUC)",
      itemName: "İstanbul (IST) - Münih (MUC)",
      destination: "Münih",
      type: "Flight",
      date: "08 Mayıs 2026",
      startDate: "2026-05-08",
      endDate: "2026-05-08",
      status: "Completed",
      from: "İstanbul (IST)",
      to: "Münih (MUC)",
      flightNumber: "LH-1620",
      seat: "14A",
      flightClass: "Ekonomi",
      guests: 1,
      resNumber: "FLT-561029",
      reservationNumber: "FLT-561029",
      paymentStatus: "Paid",
      totalPrice: 8500,
      currency: "TRY",
      price: "₺8.500,00",

      passengers: [
        {
          firstName: "Mehmet",
          lastName: "Yılmaz",
          email: "mehmet@example.com",
          phoneNumber: "05559876543",
          identityNumber: "10987654321"
        }
      ]
    }
  ];

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;

      videoRef.current.play().catch((error) => {
        console.log("Video autoplay engeline takıldı:", error);
      });
    }
  }, []);

  const fetchReservations = async () => {
    try {
      const response = await api.get("/api/reservations");

      const mapped = response.data.map((res) => ({
        // Rezervasyon kimliği
        id: res.id,

        // Liste kartı ve modal görünümü için kullanılan alanlar
        title: res.itemName,

        type:
          res.type === "HOTEL"
            ? "Hotel"
            : res.type === "FLIGHT"
              ? "Flight"
              : "Transfer",

        date: `${res.startDate} - ${res.endDate}`,
        status: res.status || "Completed",

        hotelName:
          res.type === "HOTEL"
            ? res.itemName
            : undefined,

        checkIn: res.startDate,
        checkOut: res.endDate,
        nights: 1,

        guests:
          res.passengers && res.passengers.length > 0
            ? res.passengers.length
            : 1,

        resNumber: res.reservationNumber,
        paymentStatus: res.paymentStatus || "Paid",
        price: `${res.totalPrice} ${res.currency}`,

        // ReservationPage düzenleme işlemi için gerekli ham veriler
        itemName: res.itemName,
        destination: res.destination,
        startDate: res.startDate,
        endDate: res.endDate,
        totalPrice: res.totalPrice,
        currency: res.currency,
        reservationNumber: res.reservationNumber,
        passengers: res.passengers || []
      }));

      setAppointments(mapped);
    } catch (err) {
      console.error(
        "Backend verisi yüklenemedi, mock veriler gösteriliyor:",
        err
      );

      setAppointments(mockAppointments);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleOpenModal = (appt) => {
    setSelectedAppt(appt);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };


  // ✏️ DÜZENLE BUTONUNA BASILINCA REZERVASYON SAYFASINA GİDEN FONKSİYON
  const handleEditReservation = () => {
    if (!selectedAppt) return;

    // ReservationPage büyük harfli HOTEL / FLIGHT değerlerini kullandığı için
    // tür bilgisini düzenleme sayfasına göndermeden önce standartlaştırıyoruz.
    const normalizedReservation = {
      ...selectedAppt,

      type:
        selectedAppt.type === "Flight"
          ? "FLIGHT"
          : selectedAppt.type === "Hotel"
            ? "HOTEL"
            : selectedAppt.type === "Transfer"
              ? "TRANSFER"
              : selectedAppt.type?.toUpperCase()
    };

    setIsModalOpen(false);

    navigate("/reservation", {
      state: {
        editMode: true,
        reservationData: normalizedReservation
      }
    });
  };
  // İptal Et butonu
  const handleCancelReservation = async () => {
    if (!selectedAppt) return;

    const confirmCancel = window.confirm(
      `${selectedAppt.title} rezervasyonunu iptal etmek istediğinize emin misiniz?`
    );

    if (!confirmCancel) return;

    try {
      setLoading(true);

      await api.delete(`/api/reservations/${selectedAppt.id}`);

      setAppointments((prev) =>
        prev.filter((item) => item.id !== selectedAppt.id)
      );

      setIsModalOpen(false);
      setSelectedAppt(null);
    } catch (err) {
      console.error(
        "Rezervasyon iptal edilirken hata oluştu:",
        err
      );

      setAppointments((prev) =>
        prev.filter((item) => item.id !== selectedAppt.id)
      );

      setIsModalOpen(false);
      setSelectedAppt(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Completed":
      case "Tamamlandı":
        return (
          <span className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/50">
            <CheckCircle2 size={13} />
            Tamamlandı
          </span>
        );

      case "Cancelled":
      case "İptal Edildi":
        return (
          <span className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-semibold bg-rose-950/60 text-rose-400 border border-rose-800/50">
            <XCircle size={13} />
            İptal Edildi
          </span>
        );

      default:
        return (
          <span className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-semibold bg-amber-950/60 text-amber-400 border border-amber-800/50">
            <AlertCircle size={13} />
            Beklemede
          </span>
        );
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0A0F1D] text-slate-100 font-sans relative">
      {/* Sol Sidebar */}
      <ChatSidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      <div className="flex-1 flex flex-col min-w-0 h-full relative overflow-y-auto z-10">
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="absolute top-4 left-4 z-30 p-2 bg-[#1E293B] border border-slate-700 rounded-lg text-slate-300 hover:text-white transition-all"
            title="Sidebar'ı Aç"
          >
            <PanelLeftOpen size={18} />
          </button>
        )}

        <div className="flex-1 p-6 md:p-10 max-w-4xl mx-auto w-full">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Geçmiş Randevular
            </h1>

            <p className="text-slate-400 text-sm">
              Geçmiş otel, uçuş ve transfer rezervasyonlarınızı görüntüleyin ve yönetin.
            </p>
          </div>

          {/* Liste Kartları */}
          <div className="space-y-4">
            {(appointments.length > 0
              ? appointments
              : mockAppointments
            ).map((appt) => (
              <div
                key={appt.id}
                className="bg-[#111827] border border-slate-800/80 rounded-xl p-5 hover:border-slate-700 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-lg"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-900/40 text-blue-400 text-xs px-2.5 py-0.5 rounded border border-blue-800/50 font-medium">
                      🏨 {appt.type}
                    </span>

                    {getStatusBadge(appt.status)}
                  </div>

                  <h3 className="text-lg font-bold text-white">
                    {appt.title}
                  </h3>

                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar size={13} />
                    {appt.date}
                  </p>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3">
                  <span className="text-xl font-bold text-white">
                    {appt.price}
                  </span>

                  <button
                    onClick={() => handleOpenModal(appt)}
                    className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#1E293B] border border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white transition-all"
                  >
                    Detaylar →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleCloseModal}
        >
          {/* Modal İçeriği */}
          <div
            className="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-fade-in relative text-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 relative border-b border-slate-800/80 flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-[#1E293B] border border-slate-700 flex items-center justify-center text-3xl shrink-0">
                🏨
              </div>

              <div className="flex-1 pr-6">
                <span className="inline-block bg-blue-900/40 text-blue-400 text-[11px] font-semibold px-2 py-0.5 rounded border border-blue-800/50 mb-1">
                  🏨 Otel
                </span>

                <h2 className="text-xl font-bold text-white leading-tight">
                  {selectedAppt?.title}
                </h2>
              </div>

              <button
                onClick={handleCloseModal}
                className="absolute top-5 right-5 p-1.5 rounded-full bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
              {/* Özet Kutusu */}
              <div className="bg-[#1E293B]/50 rounded-xl p-4 border border-slate-800 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 flex items-center gap-1.5 text-xs font-medium">
                    ⓘ Mevcut Durum
                  </span>

                  {getStatusBadge(selectedAppt?.status)}
                </div>

                <div className="flex justify-between items-center text-sm border-t border-slate-800 pt-2.5">
                  <span className="text-slate-400 text-xs">
                    Rezervasyon Numarası
                  </span>

                  <span className="font-mono text-xs font-bold text-slate-200 bg-slate-800 px-2 py-0.5 rounded">
                    {selectedAppt?.resNumber}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm border-t border-slate-800 pt-2.5">
                  <span className="text-slate-400 text-xs">
                    Tutar
                  </span>

                  <span className="text-lg font-bold text-blue-400">
                    {selectedAppt?.price}
                  </span>
                </div>
              </div>

              {/* Detaylar Bölümü */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  DETAYLAR
                </h4>

                <div className="bg-[#1E293B]/30 rounded-xl p-4 border border-slate-800/80 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-400">
                      OTEL ADI:
                    </span>

                    <span className="text-xs font-semibold text-white">
                      {selectedAppt?.hotelName ||
                        selectedAppt?.title}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-xs text-slate-400">
                      ÖDEME DURUMU:
                    </span>

                    <span className="text-xs font-bold text-emerald-400">
                      {selectedAppt?.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Alt Butonlar */}
            <div className="p-6 border-t border-slate-800/80 space-y-3 bg-[#0D1322]">
              {/* İlgili Sohbeti Görüntüle */}
              <button
                onClick={() => navigate("/chat")}
                className="w-full py-3 rounded-xl font-bold bg-[#2563EB] hover:bg-[#1D4ED8] text-white transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-blue-600/20"
              >
                <MessageSquare size={16} />
                İlgili Sohbeti Görüntüle
              </button>

              {/* Düzenle ve İptal Et */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleEditReservation}
                  className="py-2.5 rounded-xl font-semibold bg-[#1E293B] hover:bg-slate-700 border border-slate-700 text-white transition-all flex items-center justify-center gap-2 text-xs"
                >
                  <Edit3 size={15} />
                  Düzenle
                </button>

                <button
                  onClick={handleCancelReservation}
                  disabled={loading}
                  className="py-2.5 rounded-xl font-semibold bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 transition-all flex items-center justify-center gap-2 text-xs disabled:opacity-50"
                >
                  <Trash2 size={15} />

                  {loading
                    ? "İptal Ediliyor..."
                    : "İptal Et"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}