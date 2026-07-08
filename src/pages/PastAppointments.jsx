import { useState } from "react";
import { 
  PanelLeftOpen, 
  Hotel, 
  Plane, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  AlertCircle 
} from "lucide-react";
import ChatSidebar from "../components/ChatSidebar";

export default function PastAppointments() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const mockAppointments = [
    { 
      id: 1, 
      title: "Titanic Deluxe Lara Stay", 
      type: "Hotel", 
      date: "June 12 - June 19, 2026", 
      status: "Completed" 
    },
    { 
      id: 2, 
      title: "Istanbul (IST) to Munich (MUC) LH-1620", 
      type: "Flight", 
      date: "May 08, 2026", 
      status: "Completed" 
    },
    { 
      id: 3, 
      title: "Antalya Airport Transfer to Titanic Hotel", 
      type: "Transfer", 
      date: "June 12, 2026", 
      status: "Cancelled" 
    },
    { 
      id: 4, 
      title: "Sheraton Berlin Grand Hotel Esplanade", 
      type: "Hotel", 
      date: "April 02 - April 05, 2026", 
      status: "Confirmed" 
    }
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case "Completed":
        return (
          <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
            <CheckCircle2 size={12} />
            Completed
          </span>
        );
      case "Cancelled":
        return (
          <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold bg-rose-50 text-rose-700 border border-rose-100">
            <XCircle size={12} />
            Cancelled
          </span>
        );
      case "Confirmed":
        return (
          <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold bg-blue-50 text-blue-700 border border-blue-100 animate-pulse">
            <AlertCircle size={12} />
            Confirmed
          </span>
        );
      default:
        return null;
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "Hotel":
        return <Hotel className="text-[#023047]" size={20} />;
      case "Flight":
        return <Plane className="text-[#023047]" size={20} />;
      case "Transfer":
        return <MapPin className="text-[#023047]" size={20} />;
      default:
        return <Calendar className="text-[#023047]" size={20} />;
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-bg font-sans">
      {/* Collapsible Chat Sidebar */}
      <ChatSidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
        currentView="appointments"
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative overflow-y-auto bg-slate-50">
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

        <div className="flex-1 p-6 md:p-10 max-w-4xl mx-auto w-full animate-fade-in">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#0F172A] font-display mb-2">
              Past Appointments
            </h1>
            <p className="text-text-secondary text-sm">
              View status and history of your past flight, hotel, and transfer reservations.
            </p>
          </div>

          <div className="space-y-4">
            {mockAppointments.map((appt) => (
              <div 
                key={appt.id}
                className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 flex-shrink-0">
                    {getIcon(appt.type)}
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-[#0F172A] text-base">
                      {appt.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-secondary font-medium">
                      <span className="bg-slate-100 px-2 py-0.5 rounded-md text-text-primary">
                        {appt.type}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {appt.date}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                  {getStatusBadge(appt.status)}
                  <button className="text-xs font-semibold text-primary hover:text-primary-dark hover:underline transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-50 focus:outline-none">
                    View details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
