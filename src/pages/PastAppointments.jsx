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
  Ticket
} from "lucide-react";
import ChatSidebar from "../components/ChatSidebar";

export default function PastAppointments() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch(error => {
        console.log("Video autoplay engeline takıldı:", error);
      });
    }
  }, []);

  const mockAppointments = [
    { 
      id: 1, 
      title: "Titanic Deluxe Lara Stay", 
      type: "Hotel", 
      date: "June 12 - June 19, 2026", 
      status: "Completed",
      hotelName: "Titanic Deluxe Lara",
      checkIn: "June 12, 2026",
      checkOut: "June 19, 2026",
      nights: 7,
      guests: 2,
      resNumber: "HTL-908234",
      paymentStatus: "Paid ($1,420)",
      price: "$1,420"
    },
    { 
      id: 2, 
      title: "Istanbul (IST) to Munich (MUC)", 
      type: "Flight", 
      date: "May 08, 2026", 
      status: "Completed",
      from: "Istanbul (IST)",
      to: "Munich (MUC)",
      flightNumber: "LH-1620",
      seat: "14A (Window)",
      flightClass: "Economy",
      resNumber: "FLT-561029",
      paymentStatus: "Paid ($245)",
      price: "$245"
    },
    { 
      id: 3, 
      title: "Antalya Airport Transfer to Titanic Hotel", 
      type: "Transfer", 
      date: "June 12, 2026", 
      status: "Cancelled",
      transferType: "Airport Transfer",
      driverStatus: "Cancelled by Operator",
      pickupLocation: "Antalya Airport (AYT) Terminal 2",
      resNumber: "TRF-774021",
      paymentStatus: "Refunded ($45)",
      price: "$45",
      cancelReason: "VIP Transfer Vehicle Delay - Driver flight tracking delay exceeded safety limit"
    },
    { 
      id: 4, 
      title: "Sheraton Berlin Grand Hotel Esplanade", 
      type: "Hotel", 
      date: "April 02 - April 05, 2026", 
      status: "Pending",
      hotelName: "Sheraton Berlin Grand Hotel Esplanade",
      checkIn: "April 02, 2026",
      checkOut: "April 05, 2026",
      nights: 3,
      guests: 1,
      resNumber: "HTL-PENDING",
      paymentStatus: "Unpaid",
      price: "$380"
    }
  ];

  const handleOpenDrawer = (appt) => {
    setSelectedAppt(appt);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Completed":
        return (
          <span className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full font-bold bg-teal-50 text-teal-700 border border-teal-100">
            <CheckCircle2 size={12} />
            Completed
          </span>
        );
      case "Cancelled":
        return (
          <span className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full font-bold bg-rose-50 text-rose-700 border border-rose-100">
            <XCircle size={12} />
            Cancelled
          </span>
        );
      case "Pending":
        return (
          <span className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full font-bold bg-amber-50 text-amber-700 border border-amber-100 animate-pulse">
            <AlertCircle size={12} />
            Pending
          </span>
        );
      default:
        return null;
    }
  };

  const getStatusRow = (status) => {
    switch (status) {
      case "Completed":
        return (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#14B8A6]">
            <CheckCircle2 size={14} />
            <span>Completed Stay</span>
          </div>
        );
      case "Cancelled":
        return (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#EF4444]">
            <XCircle size={14} />
            <span>Cancelled Booking</span>
          </div>
        );
      case "Pending":
        return (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#F59E0B]">
            <AlertCircle size={14} className="animate-pulse" />
            <span>Pending Incomplete Booking</span>
          </div>
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
            <span>Hotel</span>
          </span>
        );
      case "Flight":
        return (
          <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium bg-purple-50 text-purple-700 border border-purple-100">
            <span>✈</span>
            <span>Flight</span>
          </span>
        );
      case "Transfer":
        return (
          <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium bg-teal-50 text-teal-700 border border-teal-100">
            <span>🚗</span>
            <span>Transfer</span>
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
            title="Expand Sidebar"
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
          Tarayıcınız video etiketini desteklemiyor.
        </video>

        <div className="flex-1 p-6 md:p-10 max-w-4xl mx-auto w-full animate-fade-in z-10 relative">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#0F172A] font-display mb-2">
              Past Appointments
            </h1>
            <p className="text-text-secondary text-sm">
              View status and history of your past flight, hotel, and transfer reservations.
            </p>
          </div>

          {/* Stepper Timeline list container */}
          <div className="relative border-l-[2px] border-slate-200 ml-6 pl-8 space-y-6 py-2">
            {mockAppointments.map((appt) => (
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
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {getCategoryBadge(appt.type)}
                        <span className="text-[11px] text-text-secondary font-medium flex items-center gap-1">
                          <Calendar size={12} />
                          {appt.date}
                        </span>
                      </div>
                      <h3 className="font-bold text-[#0F172A] text-lg leading-tight">
                        {appt.title}
                      </h3>

                      {/* Content details based on type */}
                      {appt.type === "Hotel" && (
                        <div className="text-xs text-text-secondary grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          <div><strong>Nights:</strong> {appt.nights} nights</div>
                          <div><strong>Guests:</strong> {appt.guests} guests</div>
                          <div><strong>Check-in:</strong> {appt.checkIn}</div>
                          <div><strong>Check-out:</strong> {appt.checkOut}</div>
                        </div>
                      )}

                      {appt.type === "Flight" && (
                        <div className="text-xs text-text-secondary grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          <div><strong>Flight Number:</strong> {appt.flightNumber}</div>
                          <div><strong>Seat:</strong> {appt.seat}</div>
                          <div><strong>Class:</strong> {appt.flightClass}</div>
                          <div><strong>Route:</strong> {appt.from} → {appt.to}</div>
                        </div>
                      )}

                      {appt.type === "Transfer" && (
                        <div className="text-xs text-text-secondary grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          <div><strong>Service:</strong> {appt.transferType}</div>
                          <div><strong>Pickup:</strong> {appt.pickupLocation}</div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:items-end justify-between sm:justify-start gap-3 flex-shrink-0">
                      {getStatusBadge(appt.status)}
                      <span className="text-sm font-bold text-[#0F172A]">{appt.price}</span>
                    </div>
                  </div>

                  {/* Status row + Details button */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
                    {getStatusRow(appt.status)}
                    <button 
                      onClick={() => handleOpenDrawer(appt)}
                      className="text-xs font-semibold px-4 py-1.5 rounded-lg border border-slate-200 text-slate-700 bg-white hover:bg-[#F59E0B]/10 hover:border-[#F59E0B]/30 hover:text-[#F59E0B] transition-all duration-200 focus:outline-none whitespace-nowrap self-end sm:self-auto cursor-pointer"
                    >
                      {appt.status === "Completed" ? "Details →" : "Resume Booking →"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Drawer Overlay */}
      {isDrawerOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 animate-fade-in"
          onClick={handleCloseDrawer}
        />
      )}

      {/* Side Sliding Drawer */}
      <div 
        className={`fixed right-0 top-0 h-screen w-full sm:w-[400px] bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {selectedAppt && (
          <>
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="space-y-1">
                <span className="text-xs font-bold text-[#0B5FFF] uppercase tracking-wider">
                  Reservation Info
                </span>
                <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-1.5">
                  {selectedAppt.type === "Hotel" && "🏨"}
                  {selectedAppt.type === "Flight" && "✈"}
                  {selectedAppt.type === "Transfer" && "🚗"}
                  {selectedAppt.title}
                </h2>
              </div>
              <button 
                onClick={handleCloseDrawer}
                className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-700 transition-colors focus:outline-none cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Status Section */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-text-secondary">Current Status</span>
                  {getStatusBadge(selectedAppt.status)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-text-secondary">Reservation Number</span>
                  <span className="text-xs font-bold text-[#0F172A] font-mono">{selectedAppt.resNumber}</span>
                </div>
              </div>

              {/* Specific Content Details */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider border-b pb-1">
                  Details
                </h3>

                {selectedAppt.type === "Hotel" && (
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Hotel Name:</span>
                      <span className="font-semibold text-slate-800">{selectedAppt.hotelName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Check-In:</span>
                      <span className="font-semibold text-slate-800">{selectedAppt.checkIn}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Check-Out:</span>
                      <span className="font-semibold text-slate-800">{selectedAppt.checkOut}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Total Nights:</span>
                      <span className="font-semibold text-slate-800">{selectedAppt.nights} nights</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Guest Count:</span>
                      <span className="font-semibold text-slate-800">{selectedAppt.guests} guests</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Payment Status:</span>
                      <span className="font-semibold text-slate-800">{selectedAppt.paymentStatus}</span>
                    </div>
                  </div>
                )}

                {selectedAppt.type === "Flight" && (
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Flight Number:</span>
                      <span className="font-semibold text-slate-800">{selectedAppt.flightNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Route:</span>
                      <span className="font-semibold text-slate-800">{selectedAppt.from} → {selectedAppt.to}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Seat Assignment:</span>
                      <span className="font-semibold text-slate-800">{selectedAppt.seat}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Flight Class:</span>
                      <span className="font-semibold text-slate-800">{selectedAppt.flightClass}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Payment Status:</span>
                      <span className="font-semibold text-slate-800">{selectedAppt.paymentStatus}</span>
                    </div>
                  </div>
                )}

                {selectedAppt.type === "Transfer" && (
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Service Type:</span>
                      <span className="font-semibold text-slate-800">{selectedAppt.transferType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Pickup Location:</span>
                      <span className="font-semibold text-slate-800">{selectedAppt.pickupLocation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Driver Status:</span>
                      <span className="font-semibold text-[#EF4444]">{selectedAppt.driverStatus}</span>
                    </div>
                    {selectedAppt.cancelReason && (
                      <div className="bg-rose-50 border border-rose-100 rounded-lg p-3 mt-2">
                        <span className="text-xs font-bold text-rose-700 block mb-1">Cancellation Reason:</span>
                        <span className="text-xs text-rose-700">{selectedAppt.cancelReason}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Context-aware message box */}
              {selectedAppt.status === "Cancelled" && (
                <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 text-sm text-amber-800 space-y-1">
                  <span className="font-bold block">Incomplete Reservation</span>
                  <span>This reservation wasn't completed. Would you like to continue where you left off?</span>
                </div>
              )}

              {selectedAppt.status === "Pending" && (
                <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 text-sm text-amber-800 space-y-1 animate-pulse">
                  <span className="font-bold block">Incomplete Reservation</span>
                  <span>You left before completing your booking.</span>
                </div>
              )}
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-5 border-t border-slate-100 space-y-2 bg-slate-50">
              {selectedAppt.status === "Completed" && (
                <>
                  <button 
                    onClick={() => {}}
                    className="w-full py-2.5 rounded-lg font-semibold bg-[#0B5FFF] text-white hover:bg-[#0B5FFF]/90 transition-all flex items-center justify-center gap-2 text-sm shadow-sm cursor-pointer"
                  >
                    <Download size={16} />
                    Download PDF Receipt
                  </button>
                  <button 
                    onClick={() => navigate("/chat")}
                    className="w-full py-2 rounded-lg font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
                  >
                    <MessageSquare size={14} />
                    View Originating Conversation
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => navigate("/chat")}
                      className="py-2 rounded-lg font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all text-xs cursor-pointer"
                    >
                      Book Again
                    </button>
                    <button 
                      onClick={() => {}}
                      className="py-2 rounded-lg font-semibold bg-white border border-slate-200 text-[#14B8A6] hover:bg-teal-50 hover:border-teal-200 transition-all flex items-center justify-center gap-1 text-xs cursor-pointer"
                    >
                      <PhoneCall size={12} />
                      Support
                    </button>
                  </div>
                </>
              )}

              {selectedAppt.status === "Cancelled" && (
                <>
                  <button 
                    onClick={() => navigate("/chat")}
                    className="w-full py-2.5 rounded-lg font-semibold bg-[#0B5FFF] text-white hover:bg-[#0B5FFF]/90 transition-all flex items-center justify-center gap-2 text-sm shadow-sm cursor-pointer"
                  >
                    <RefreshCw size={16} />
                    Continue Booking
                  </button>
                  <button 
                    onClick={() => navigate("/chat")}
                    className="w-full py-2 rounded-lg font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all text-xs cursor-pointer"
                  >
                    Start New Booking
                  </button>
                </>
              )}

              {selectedAppt.status === "Pending" && (
                <>
                  <button 
                    onClick={() => navigate("/chat")}
                    className="w-full py-2.5 rounded-lg font-semibold bg-[#0B5FFF] text-white hover:bg-[#0B5FFF]/90 transition-all flex items-center justify-center gap-2 text-sm shadow-sm cursor-pointer"
                  >
                    <MessageSquare size={16} />
                    Resume Chat
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
