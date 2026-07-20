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
import { useTheme } from "../components/ThemeContext";

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
  const { theme } = useTheme();
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
      videoRef.current.load();
      videoRef.current.play().catch(err => console.log("Video oynatılamadı:", err));
    }
  }, [theme]);

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
          <span className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full font-bold bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-100 dark:border-teal-800/50">
            <CheckCircle2 size={12} />
            {t('past_appointments_status_Completed')}
          </span>
        );
      case "Cancelled":
        return (
          <span className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-100 dark:border-rose-800/50">
            <XCircle size={12} />
            {t('past_appointments_status_Cancelled')}
          </span>
        );
      case "Pending":
        return (
          <span className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-100 dark:border-amber-800/50 animate-pulse">
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
        return <Hotel className="text-[#0B5FFF] dark:text-blue-400" size={20} />;
      case "Flight":
        return <Plane className="text-[#14B8A6] dark:text-teal-400" size={20} />;
      case "Transfer":
        return <MapPin className="text-[#F59E0B] dark:text-amber-400" size={20} />;
      default:
        return <Calendar className="text-slate-600 dark:text-slate-400" size={20} />;
    }
  };

  const getCategoryBadge = (type) => {
    switch (type) {
      case "Hotel":
        return (
          <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800/50">
            <span>🏨</span>
            <span>{t('past_appointments_badge_hotel')}</span>
          </span>
        );
      case "Flight":
        return (
          <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-100 dark:border-purple-800/50">
            <span>✈</span>
            <span>{t('past_appointments_badge_flight')}</span>
          </span>
        );
      case "Transfer":
        return (
          <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-100 dark:border-teal-800/50">
            <span>🚗</span>
            <span>{t('past_appointments_badge_transfer')}</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-transparent text-slate-900 dark:text-slate-100 font-sans relative">
      {/* Katman 1 (z-0): Background Video */}
      <video
        ref={videoRef}
        src={theme === 'dark' ? "/videos/darkmode_bg.mp4" : "/videos/chatbot_bg.mp4"}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="fixed inset-0 w-full h-full object-cover z-0 pointer-events-none"
      />

      {/* Katman 2 (z-10): Overlay Mask (No Blur) */}
      <div className="fixed inset-0 z-10 pointer-events-none bg-white/20 dark:bg-slate-950/60" />

      {/* Katman 3 (z-30): Sidebar */}
      <ChatSidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
      />

      {/* Katman 3 (z-20): Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative overflow-y-auto bg-transparent z-20">
        {/* Toggle open button when sidebar is collapsed */}
        {!isSidebarOpen && (
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="absolute top-4 left-4 z-30 p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 text-text-secondary dark:text-slate-400 hover:text-text-primary dark:hover:text-slate-100 transition-all duration-200 focus:outline-none cursor-pointer"
            title={t('past_appointments_expand_sidebar')}
          >
            <PanelLeftOpen size={18} />
          </button>
        )}

        <div className="flex-1 p-6 md:p-10 max-w-4xl mx-auto w-full animate-fade-in z-20 relative">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#0F172A] dark:text-slate-100 font-display mb-2">
              {t('past_appointments_title')}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              {t('past_appointments_desc')}
            </p>
          </div>

          {/* Stepper Timeline list container */}
          <div className="relative border-l-[2px] border-slate-200 dark:border-slate-800 ml-6 pl-8 space-y-6 py-2">
            {(appointments.length > 0 ? appointments : mockAppointments).map((appt) => (
              <div key={appt.id} className="relative group">
                {/* 44px timeline bullet */}
                <div className="absolute -left-[54px] top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-sm z-10 transition-all duration-200 group-hover:border-[#0B5FFF]/40 dark:group-hover:border-blue-500/50 group-hover:scale-105">
                  {getIcon(appt.type)}
                </div>

                {/* Main Card Component */}
                <div 
                  className="bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col gap-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-3">
                      <h3 className="font-bold text-[#0F172A] dark:text-white text-xl leading-tight">
                        {appt.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2">
                        {getCategoryBadge(appt.type)}
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                          <Calendar size={13} className="text-slate-400 dark:text-slate-500" />
                          {appt.date}
                        </span>
                      </div>

                      {/* Content details based on type */}
                      {appt.type === "Hotel" && (
                        <div className="flex items-center flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                          <span className="flex items-center gap-1"><Moon size={12} className="text-slate-400 dark:text-slate-500" /> {appt.nights} {t('past_appointments_card_nights')}</span>
                          <span className="text-slate-300 dark:text-slate-700">&middot;</span>
                          <span className="flex items-center gap-1"><Users size={12} className="text-slate-400 dark:text-slate-500" /> {appt.guests} {t('past_appointments_card_guests')}</span>
                          <span className="text-slate-300 dark:text-slate-700">&middot;</span>
                          <span className="flex items-center gap-1"><Calendar size={12} className="text-slate-400 dark:text-slate-500" /> {appt.checkIn} <ArrowRight size={10} className="mx-0.5 text-slate-300 dark:text-slate-600" /> {appt.checkOut}</span>
                        </div>
                      )}

                      {appt.type === "Flight" && (
                        <div className="flex items-center flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                          <span className="flex items-center gap-1"><Ticket size={12} className="text-slate-400 dark:text-slate-500" /> {appt.flightNumber}</span>
                          <span className="text-slate-300 dark:text-slate-700">&middot;</span>
                          <span className="flex items-center gap-1"><User size={12} className="text-slate-400 dark:text-slate-500" /> {appt.seat} ({appt.flightClass})</span>
                          <span className="text-slate-300 dark:text-slate-700">&middot;</span>
                          <span className="flex items-center gap-1"><Plane size={12} className="text-slate-400 dark:text-slate-500" /> {appt.from} <ArrowRight size={10} className="mx-0.5 text-slate-300 dark:text-slate-600" /> {appt.to}</span>
                        </div>
                      )}

                      {appt.type === "Transfer" && (
                        <div className="flex items-center flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                          <span className="flex items-center gap-1"><Car size={12} className="text-slate-400 dark:text-slate-500" /> {appt.transferType}</span>
                          <span className="text-slate-300 dark:text-slate-700">&middot;</span>
                          <span className="flex items-center gap-1"><MapPin size={12} className="text-slate-400 dark:text-slate-500" /> {appt.pickupLocation}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:items-end justify-between sm:justify-start gap-3 flex-shrink-0">
                      {getStatusBadge(appt.status)}
                      <span className="text-sm font-bold text-[#0F172A] dark:text-white">{appt.price}</span>
                    </div>
                  </div>

                  {/* Details button */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-end mt-2">
                    <button 
                      onClick={() => handleOpenDrawer(appt)}
                      className="text-xs font-bold px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-500 text-white shadow-sm hover:shadow transition-all duration-200 focus:outline-none whitespace-nowrap self-end sm:self-auto cursor-pointer"
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

