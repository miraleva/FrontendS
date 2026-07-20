// TODO: dark mode desteği eklenecek — bkz. diğer sayfalardaki dark: class kullanımı
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
  PhoneCall,
  RefreshCw,
  ArrowRight,
  User,
  Ticket,
  Moon,
  Users,
  Car
} from "lucide-react";
import ChatSidebar from "../components/ChatSidebar";
import api from "../services/api";
import { useTranslation } from "react-i18next";
import AppointmentDetailModal from "../components/AppointmentDetailModal";

const formatPrice = (amount, currency = 'TRY') => {
  if (amount === undefined || amount === null) return '';
  // if amount is a string like "$1,420", just return it
  if (typeof amount === 'string' && isNaN(Number(amount.replace(/[^0-9.-]+/g,"")))) return amount;
  
  const num = typeof amount === 'string' ? parseFloat(amount.replace(/[^0-9.-]+/g,"")) : amount;
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: currency }).format(num);
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  // Check if it's YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    const [y, m, d] = dateStr.split('T')[0].split('-');
    return `${d}.${m}.${y}`;
  }
  return dateStr;
};

export default function PastAppointments() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);

  const videoRef = useRef(null);

  const mockAppointments = [
    { 
      id: 1, 
      title: "Titanic Deluxe Lara Stay", 
      type: "Hotel", 
      date: "12.06.2026 - 19.06.2026", 
      status: "Completed",
      hotelName: "Titanic Deluxe Lara",
      checkIn: "12.06.2026",
      checkOut: "19.06.2026",
      nights: 7,
      guests: 2,
      resNumber: "HTL-908234",
      paymentStatus: "Paid",
      price: formatPrice(1420, "USD")
    },
    { 
      id: 2, 
      title: "Istanbul (IST) to Munich (MUC)", 
      type: "Flight", 
      date: "08.05.2026 (Tek Yön)", 
      status: "Completed",
      from: "Istanbul (IST)",
      to: "Munich (MUC)",
      flightNumber: "LH-1620",
      seat: "14A (Window)",
      flightClass: "Economy",
      resNumber: "FLT-561029",
      paymentStatus: "Paid",
      price: formatPrice(245, "USD")
    },
    { 
      id: 3, 
      title: "Antalya Airport Transfer to Titanic Hotel", 
      type: "Transfer", 
      date: "12.06.2026", 
      status: "Cancelled",
      transferType: "Airport Transfer",
      driverStatus: "Cancelled by Operator",
      pickupLocation: "Antalya Airport (AYT) Terminal 2",
      resNumber: "TRF-774021",
      paymentStatus: "Refunded",
      price: formatPrice(45, "USD"),
      cancelReason: "VIP Transfer Vehicle Delay - Driver flight tracking delay exceeded safety limit"
    },
    { 
      id: 4, 
      title: "Sheraton Berlin Grand Hotel Esplanade", 
      type: "Hotel", 
      date: "02.04.2026 - 05.04.2026", 
      status: "Pending",
      hotelName: "Sheraton Berlin Grand Hotel Esplanade",
      checkIn: "02.04.2026",
      checkOut: "05.04.2026",
      nights: 3,
      guests: 1,
      resNumber: "HTL-PENDING",
      paymentStatus: "Unpaid",
      price: formatPrice(380, "USD")
    }
  ];

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch(error => {
        console.log("Video autoplay engeline takıldı:", error);
      });
    }
  }, []);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await api.get('/api/reservations');
        const mapped = response.data.map(res => ({
          id: res.id,
          title: res.itemName,
          type: res.type === 'HOTEL' ? 'Hotel' : (res.type === 'FLIGHT' ? 'Flight' : 'Transfer'),
          date: res.endDate ? `${formatDate(res.startDate)} - ${formatDate(res.endDate)}` : `${formatDate(res.startDate)} (Tek Yön)`,
          status: 'Completed',
          hotelName: res.type === 'HOTEL' ? res.itemName : undefined,
          checkIn: formatDate(res.startDate),
          checkOut: res.endDate ? formatDate(res.endDate) : undefined,
          nights: 1,
          guests: res.passengers ? res.passengers.length : 1,
          resNumber: res.reservationNumber,
          paymentStatus: `Paid`,
          price: formatPrice(res.totalPrice, res.currency),
          passengers: res.passengers
        }));
        setAppointments(mapped);
      } catch (err) {
        console.error("Failed to load appointments from backend, showing mocks", err);
        setAppointments(mockAppointments);
      }
    };
    fetchReservations();
  }, []);

  const handleOpenDrawer = (appt) => {
    setSelectedAppt(appt);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedAppt(null);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Completed":
        return (
          <span className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full font-bold bg-teal-50 text-teal-700 border border-teal-100">
            <CheckCircle2 size={12} />
            {t('past_appointments_status_Completed')}
          </span>
        );
      case "Cancelled":
        return (
          <span className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full font-bold bg-rose-50 text-rose-700 border border-rose-100">
            <XCircle size={12} />
            {t('past_appointments_status_Cancelled')}
          </span>
        );
      case "Pending":
        return (
          <span className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full font-bold bg-amber-50 text-amber-700 border border-amber-100 animate-pulse">
            <AlertCircle size={12} />
            {t('past_appointments_status_Pending')}
          </span>
        );
      default:
        return null;
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "Hotel":
        return <Hotel className="text-[#0B5FFF]" size={20} />;
      case "Flight":
        return <Plane className="text-[#14B8A6]" size={20} />;
      case "Transfer":
        return <MapPin className="text-[#F59E0B]" size={20} />;
      default:
        return <Calendar className="text-slate-600" size={20} />;
    }
  };

  const getCategoryBadge = (type) => {
    switch (type) {
      case "Hotel":
        return (
          <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium bg-blue-50 text-blue-700 border border-blue-100">
            <span>🏨</span>
            <span>{t('past_appointments_badge_hotel')}</span>
          </span>
        );
      case "Flight":
        return (
          <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium bg-purple-50 text-purple-700 border border-purple-100">
            <span>✈</span>
            <span>{t('past_appointments_badge_flight')}</span>
          </span>
        );
      case "Transfer":
        return (
          <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium bg-teal-50 text-teal-700 border border-teal-100">
            <span>🚗</span>
            <span>{t('past_appointments_badge_transfer')}</span>
          </span>
        );
      default:
        return null;
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
      <div className="flex-1 flex flex-col min-w-0 h-full relative overflow-y-auto bg-transparent">
        {/* Toggle open button when sidebar is collapsed */}
        {!isSidebarOpen && (
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="absolute top-4 left-4 z-30 p-2 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 text-text-secondary hover:text-text-primary transition-all duration-200 focus:outline-none"
            title={t('past_appointments_expand_sidebar')}
          >
            <PanelLeftOpen size={18} />
          </button>
        )}

        {/* Arka Plan Videosu - fixed ve z-0 ile en arkaya çiviliyoruz */}
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="fixed top-0 left-0 w-full h-full object-cover z-0 pointer-events-none"
        >
          <source src="/videos/chatbot_bg.mp4" type="video/mp4" />
          {t('past_appointments_video_unsupported')}
        </video>

        <div className="flex-1 p-6 md:p-10 max-w-4xl mx-auto w-full animate-fade-in z-10 relative">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#0F172A] font-display mb-2">
              {t('past_appointments_title')}
            </h1>
            <p className="text-text-secondary text-sm">
              {t('past_appointments_desc')}
            </p>
          </div>

          {/* Stepper Timeline list container */}
          <div className="relative border-l-[2px] border-slate-200 ml-6 pl-8 space-y-6 py-2">
            {(appointments.length > 0 ? appointments : mockAppointments).map((appt) => (
              <div key={appt.id} className="relative group">
                {/* 44px timeline bullet */}
                <div className="absolute -left-[54px] top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center shadow-sm z-10 transition-all duration-200 group-hover:border-[#0B5FFF]/40 group-hover:scale-105">
                  {getIcon(appt.type)}
                </div>

                {/* Main Card Component */}
                <div 
                  className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col gap-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-3">
                      <h3 className="font-bold text-[#0F172A] text-xl leading-tight">
                        {appt.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2">
                        {getCategoryBadge(appt.type)}
                        <span className="text-xs text-text-secondary font-medium flex items-center gap-1">
                          <Calendar size={13} className="text-slate-400" />
                          {appt.date}
                        </span>
                      </div>

                      {/* Content details based on type */}
                      {appt.type === "Hotel" && (
                        <div className="flex items-center flex-wrap gap-2 text-xs text-slate-500 font-medium mt-1">
                          <span className="flex items-center gap-1"><Moon size={12} className="text-slate-400" /> {appt.nights} {t('past_appointments_card_nights')}</span>
                          <span className="text-slate-300">&middot;</span>
                          <span className="flex items-center gap-1"><Users size={12} className="text-slate-400" /> {appt.guests} {t('past_appointments_card_guests')}</span>
                          <span className="text-slate-300">&middot;</span>
                          <span className="flex items-center gap-1"><Calendar size={12} className="text-slate-400" /> {appt.checkIn} <ArrowRight size={10} className="mx-0.5 text-slate-300" /> {appt.checkOut}</span>
                        </div>
                      )}

                      {appt.type === "Flight" && (
                        <div className="flex items-center flex-wrap gap-2 text-xs text-slate-500 font-medium mt-1">
                          <span className="flex items-center gap-1"><Ticket size={12} className="text-slate-400" /> {appt.flightNumber}</span>
                          <span className="text-slate-300">&middot;</span>
                          <span className="flex items-center gap-1"><User size={12} className="text-slate-400" /> {appt.seat} ({appt.flightClass})</span>
                          <span className="text-slate-300">&middot;</span>
                          <span className="flex items-center gap-1"><Plane size={12} className="text-slate-400" /> {appt.from} <ArrowRight size={10} className="mx-0.5 text-slate-300" /> {appt.to}</span>
                        </div>
                      )}

                      {appt.type === "Transfer" && (
                        <div className="flex items-center flex-wrap gap-2 text-xs text-slate-500 font-medium mt-1">
                          <span className="flex items-center gap-1"><Car size={12} className="text-slate-400" /> {appt.transferType}</span>
                          <span className="text-slate-300">&middot;</span>
                          <span className="flex items-center gap-1"><MapPin size={12} className="text-slate-400" /> {appt.pickupLocation}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:items-end justify-between sm:justify-start gap-3 flex-shrink-0">
                      {getStatusBadge(appt.status)}
                      <span className="text-sm font-bold text-[#0F172A]">{appt.price}</span>
                    </div>
                  </div>

                  {/* Details button */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-end mt-2">
                    <button 
                      onClick={() => handleOpenDrawer(appt)}
                      className="text-xs font-bold px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white shadow-sm hover:shadow transition-all duration-200 focus:outline-none whitespace-nowrap self-end sm:self-auto cursor-pointer"
                    >
                      {appt.status === "Completed" ? t('past_appointments_btn_details') : t('past_appointments_btn_resume')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Appointment Detail Modal */}
      {selectedAppt && (
        <AppointmentDetailModal 
          appointment={selectedAppt} 
          onClose={handleCloseDrawer} 
        />
      )}
    </div>
  );
}
