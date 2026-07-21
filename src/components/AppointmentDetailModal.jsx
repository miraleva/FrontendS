import React, { useState } from 'react';
import { 
  X, Download, MessageSquare, PhoneCall, RefreshCw, Calendar, Users, 
  Ticket, User, Plane, Car, MapPin, CheckCircle2, XCircle, AlertCircle, Moon, Edit, Trash2, Info
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function AppointmentDetailModal({ appointment, onClose }) {
  const { t } = useTranslation();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  if (!appointment) return null;

  const getStatusBadge = (status) => {
    switch (status) {
      case "Completed":
        return (
          <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md font-bold bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-100 dark:border-teal-800/50 shadow-sm">
            <CheckCircle2 size={14} />
            {t('past_appointments_status_Completed')}
          </span>
        );
      case "Cancelled":
        return (
          <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-100 dark:border-rose-800/50 shadow-sm">
            <XCircle size={14} />
            {t('past_appointments_status_Cancelled')}
          </span>
        );
      case "Pending":
        return (
          <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-100 dark:border-amber-800/50 animate-pulse shadow-sm">
            <AlertCircle size={14} />
            {t('past_appointments_status_Pending')}
          </span>
        );
      default:
        return null;
    }
  };

  const getCategoryBadge = (type) => {
    switch (type) {
      case "Hotel":
        return (
          <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800/50 shadow-sm">
            <span>🏨</span>
            <span>{t('past_appointments_badge_hotel')}</span>
          </span>
        );
      case "Flight":
        return (
          <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md font-semibold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-100 dark:border-purple-800/50 shadow-sm">
            <span>✈</span>
            <span>{t('past_appointments_badge_flight')}</span>
          </span>
        );
      case "Transfer":
        return (
          <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md font-semibold bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-100 dark:border-teal-800/50 shadow-sm">
            <span>🚗</span>
            <span>{t('past_appointments_badge_transfer')}</span>
          </span>
        );
      default:
        return null;
    }
  };

  const handleCancelClick = () => {
    setShowCancelConfirm(true);
  };

  const confirmCancel = () => {
    // TODO: Call backend to cancel the reservation
    console.log(`Cancelling reservation: ${appointment.resNumber}`);
    setShowCancelConfirm(false);
    // Ideally update local state or trigger a re-fetch, then close
  };

  return (
    <div 
      className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 z-[100] transition-opacity flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[550px] min-h-[500px] max-h-[85vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col relative animate-fade-in scale-100 transition-all border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col gap-4 bg-slate-50/80 dark:bg-slate-800/50 relative">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="absolute top-5 right-5 p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-[#EA580C] hover:text-white hover:border-[#EA580C] text-slate-500 dark:text-slate-400 rounded-full transition-all duration-200 z-10 cursor-pointer shadow-sm"
            title="Kapat"
          >
            <X size={18} />
          </button>
          
          <div className="flex items-start gap-5 pr-10 mt-2">
            {/* Thumbnail for Hotel, Icon for others/fallback */}
            {appointment.type === "Hotel" && (appointment.thumbnailFull || appointment.thumbnail) ? (
              <img 
                src={appointment.thumbnailFull || appointment.thumbnail} 
                alt="Thumbnail" 
                className="w-20 h-20 rounded-xl object-cover flex-shrink-0 shadow-md border border-slate-200 dark:border-slate-700"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  if (e.currentTarget.nextElementSibling) {
                    e.currentTarget.nextElementSibling.classList.remove('hidden');
                  }
                }}
              />
            ) : null}
            
            <div className={`w-20 h-20 rounded-xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center flex-shrink-0 shadow-sm ${appointment.type === "Hotel" && (appointment.thumbnailFull || appointment.thumbnail) ? 'hidden' : ''}`}>
               <span className="text-4xl drop-shadow-sm">
                 {appointment.type === "Hotel" ? "🏨" : appointment.type === "Flight" ? "✈" : "🚗"}
               </span>
            </div>

            <div className="flex flex-col gap-2.5 justify-center py-1">
              <div className="flex items-center gap-2">
                {getCategoryBadge(appointment.type)}
              </div>
              <h2 className="text-xl font-extrabold text-[#0F172A] dark:text-white leading-tight font-display tracking-tight">
                {appointment.title}
              </h2>
            </div>
          </div>
        </div>

        {/* Body / Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white dark:bg-slate-900 relative">
          
          {/* Status Section */}
          <div className="bg-white dark:bg-slate-800/80 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-slate-200 dark:bg-slate-700"></div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5"><Info size={14}/> {t('past_appointments_drawer_status')}</span>
              {getStatusBadge(appointment.status)}
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-50 dark:border-slate-700/50">
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">{t('past_appointments_drawer_res_no')}</span>
              <span className="text-sm font-bold text-[#0F172A] dark:text-slate-200 font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{appointment.resNumber}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-50 dark:border-slate-700/50">
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Tutar</span>
              <span className="text-base font-black text-[#0B5FFF] dark:text-blue-400">{appointment.price}</span>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">
              {t('past_appointments_drawer_details')}
            </h3>

            {appointment.type === "Hotel" && (
              <div className="grid grid-cols-2 gap-x-6 gap-y-5 text-sm bg-slate-50/50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="flex flex-col">
                  <span className="text-slate-400 dark:text-slate-500 font-semibold mb-1 text-xs uppercase tracking-wide">{t('past_appointments_drawer_hotel_name')}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{appointment.hotelName}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-400 dark:text-slate-500 font-semibold mb-1 text-xs uppercase tracking-wide">{t('past_appointments_drawer_payment')}</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded w-fit">{appointment.paymentStatus}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-400 dark:text-slate-500 font-semibold mb-1 text-xs uppercase tracking-wide flex items-center gap-1"><Calendar size={12}/> {t('past_appointments_drawer_checkin')}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{appointment.checkIn}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-400 dark:text-slate-500 font-semibold mb-1 text-xs uppercase tracking-wide flex items-center gap-1"><Calendar size={12}/> {t('past_appointments_drawer_checkout')}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{appointment.checkOut}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-400 dark:text-slate-500 font-semibold mb-1 text-xs uppercase tracking-wide flex items-center gap-1"><Moon size={12}/> {t('past_appointments_drawer_total_nights')}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{appointment.nights} Gece</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-400 dark:text-slate-500 font-semibold mb-1 text-xs uppercase tracking-wide flex items-center gap-1"><Users size={12}/> {t('past_appointments_drawer_guest_count')}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{appointment.guests} Kişi</span>
                </div>
              </div>
            )}

            {appointment.type === "Flight" && (
              <div className="grid grid-cols-2 gap-x-6 gap-y-5 text-sm bg-slate-50/50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="flex flex-col">
                  <span className="text-slate-400 dark:text-slate-500 font-semibold mb-1 text-xs uppercase tracking-wide">{t('past_appointments_drawer_flight_no')}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded w-fit">{appointment.flightNumber}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-400 dark:text-slate-500 font-semibold mb-1 text-xs uppercase tracking-wide">{t('past_appointments_drawer_payment')}</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded w-fit">{appointment.paymentStatus}</span>
                </div>
                <div className="flex flex-col col-span-2 bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                  <span className="text-slate-400 dark:text-slate-500 font-semibold mb-2 text-xs uppercase tracking-wide">{t('past_appointments_drawer_route')}</span>
                  <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200 text-base">
                    <span>{appointment.from}</span>
                    <Plane className="text-slate-300 dark:text-slate-600 mx-2" size={16} />
                    <span>{appointment.to}</span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-400 dark:text-slate-500 font-semibold mb-1 text-xs uppercase tracking-wide">{t('past_appointments_drawer_seat_assignment')}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{appointment.seat}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-400 dark:text-slate-500 font-semibold mb-1 text-xs uppercase tracking-wide">{t('past_appointments_drawer_flight_class')}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{appointment.flightClass}</span>
                </div>
              </div>
            )}

            {appointment.type === "Transfer" && (
              <div className="grid grid-cols-2 gap-x-6 gap-y-5 text-sm bg-slate-50/50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="flex flex-col">
                  <span className="text-slate-400 dark:text-slate-500 font-semibold mb-1 text-xs uppercase tracking-wide">{t('past_appointments_drawer_service_type')}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{appointment.transferType}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-400 dark:text-slate-500 font-semibold mb-1 text-xs uppercase tracking-wide">{t('past_appointments_drawer_driver_status')}</span>
                  <span className="font-bold text-[#EF4444] dark:text-rose-400">{appointment.driverStatus}</span>
                </div>
                <div className="flex flex-col col-span-2">
                  <span className="text-slate-400 dark:text-slate-500 font-semibold mb-1 text-xs uppercase tracking-wide flex items-center gap-1"><MapPin size={12}/> {t('past_appointments_drawer_pickup_location')}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700 mt-1">{appointment.pickupLocation}</span>
                </div>
                {appointment.cancelReason && (
                  <div className="col-span-2 bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/50 rounded-xl p-4 mt-2">
                    <span className="text-xs font-bold text-rose-700 dark:text-rose-400 block mb-1 flex items-center gap-1"><AlertCircle size={14}/> {t('past_appointments_drawer_cancel_reason')}</span>
                    <span className="text-sm text-rose-800 dark:text-rose-300 font-medium leading-relaxed">{appointment.cancelReason}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer / Actions */}
        <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 relative z-20">
          
          <button 
            onClick={() => {}}
            className="w-full py-3 rounded-xl font-bold bg-[#0B5FFF] text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
          >
            <MessageSquare size={18} />
            İlgili Sohbeti Görüntüle
          </button>
          
          <div className="grid grid-cols-2 gap-3 mt-3">
            <button 
              onClick={() => { /* TODO: edit logic */ }}
              className="py-3 rounded-xl font-bold bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              <Edit size={16} />
              Düzenle
            </button>
            <button 
              onClick={handleCancelClick}
              className="py-3 rounded-xl font-bold bg-white dark:bg-slate-800 border-2 border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:border-rose-300 dark:hover:border-rose-800 transition-all flex items-center justify-center gap-2 text-sm group cursor-pointer"
            >
              <Trash2 size={16} className="group-hover:scale-110 transition-transform" />
              İptal Et
            </button>
          </div>
          
        </div>

        {/* Confirmation Overlay */}
        {showCancelConfirm && (
          <div className="absolute inset-0 z-50 bg-slate-800/40 dark:bg-slate-950/70 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-2xl w-full max-w-[340px] flex flex-col items-center text-center border border-slate-100 dark:border-slate-800 transform scale-100 animate-in zoom-in-95 duration-200">
              <div className="w-14 h-14 bg-rose-50 dark:bg-rose-950/50 rounded-full flex items-center justify-center mb-4 border-4 border-white dark:border-slate-800 shadow-sm">
                <AlertCircle size={28} className="text-rose-600 dark:text-rose-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Rezervasyonu İptal Et</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed">
                <strong className="text-slate-800 dark:text-slate-200">{appointment.resNumber}</strong> numaralı rezervasyonu iptal etmek istediğinize emin misiniz? Bu işlem geri alınamaz.
              </p>
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setShowCancelConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm cursor-pointer"
                >
                  Vazgeç
                </button>
                <button 
                  onClick={confirmCancel}
                  className="flex-1 py-2.5 rounded-xl font-bold bg-rose-600 text-white hover:bg-rose-700 shadow-md shadow-rose-600/20 transition-all text-sm cursor-pointer"
                >
                  İptal Et
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}


