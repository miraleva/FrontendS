import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  PanelLeftOpen,
  Heart,
  Trash2,
  MapPin,
  Star,
  ArrowRight,
  Hotel,
  Plane,
  Sparkles,
  BedDouble,
} from "lucide-react";

import ChatSidebar from "../components/ChatSidebar";
import { useTheme } from "../components/ThemeContext";
import { useFavorites } from "../components/FavoritesContext";
import { getHotelImage, handleHotelImageError } from "../utils/hotelImageUtils";

export default function FavoritesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const { theme } = useTheme();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("ALL"); // ALL | HOTEL | FLIGHT

  const { favorites, removeFavorite, clearAllFavorites } = useFavorites();

  const filteredFavorites = favorites.filter((item) => {
    if (activeFilter === "HOTEL") return item.type !== "FLIGHT";
    if (activeFilter === "FLIGHT") return item.type === "FLIGHT";
    return true;
  });

  const handleCardClick = (item) => {
    navigate("/reservation", {
      state: {
        selectedItem: item.rawItem || item,
        selectedHotel: item.type !== "FLIGHT" ? (item.rawItem || item) : null,
        selectedFlight: item.type === "FLIGHT" ? (item.rawItem || item) : null,
        searchType: item.type === "FLIGHT" ? "flight" : "hotel",
      },
    });
  };

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-transparent font-sans text-slate-900 dark:text-slate-100">
      {/* Video Background */}
      <video
        ref={videoRef}
        src={theme === "dark" ? "/videos/darkmode_bg.mp4" : "/videos/chatbot_bg.mp4"}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="pointer-events-none fixed inset-0 z-0 h-full w-full object-cover"
      />

      <div className="pointer-events-none fixed inset-0 z-10 bg-white/20 dark:bg-slate-950/60" />

      {/* Sidebar Navigation */}
      <ChatSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Main Page Area */}
      <div className="relative z-20 flex h-full min-w-0 flex-1 flex-col overflow-y-auto bg-transparent">
        {!isSidebarOpen && (
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="absolute left-4 top-4 z-30 cursor-pointer rounded-lg border border-slate-200 bg-white p-2 text-slate-500 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100"
            title="Sidebar'ı Aç"
          >
            <PanelLeftOpen size={18} />
          </button>
        )}

        <div className="relative z-20 mx-auto w-full max-w-5xl flex-1 animate-fade-in p-4 pt-16 sm:p-6 md:p-10">
          {/* Page Header */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 dark:bg-rose-500/20">
                  <Heart size={22} className="fill-rose-500" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                  {t("favorites_title", "Favorilerim")}
                </h1>
                {favorites.length > 0 && (
                  <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-extrabold text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                    {favorites.length}
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {t("favorites_subtitle", "Kaydettiğiniz otel ve uçuş fırsatlarını kolayca inceleyin ve yönetin.")}
              </p>
            </div>

            {favorites.length > 0 && (
              <button
                type="button"
                onClick={clearAllFavorites}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-xs font-semibold text-slate-600 shadow-sm transition-all hover:bg-red-50 hover:text-red-600 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-400 dark:hover:bg-red-950/30 dark:hover:text-red-400"
              >
                <Trash2 size={14} />
                <span>{t("favorites_clear_all", "Tümünü Temizle")}</span>
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          {favorites.length > 0 && (
            <div className="mb-6 flex items-center gap-2 border-b border-slate-200/80 pb-3 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setActiveFilter("ALL")}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                  activeFilter === "ALL"
                    ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                    : "bg-white/70 text-slate-600 hover:bg-white dark:bg-slate-900/60 dark:text-slate-400 dark:hover:bg-slate-800"
                }`}
              >
                {t("favorites_filter_all", "Tümü")} ({favorites.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter("HOTEL")}
                className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                  activeFilter === "HOTEL"
                    ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                    : "bg-white/70 text-slate-600 hover:bg-white dark:bg-slate-900/60 dark:text-slate-400 dark:hover:bg-slate-800"
                }`}
              >
                <Hotel size={14} />
                <span>{t("favorites_filter_hotels", "Oteller")}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter("FLIGHT")}
                className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                  activeFilter === "FLIGHT"
                    ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                    : "bg-white/70 text-slate-600 hover:bg-white dark:bg-slate-900/60 dark:text-slate-400 dark:hover:bg-slate-800"
                }`}
              >
                <Plane size={14} />
                <span>{t("favorites_filter_flights", "Uçuşlar")}</span>
              </button>
            </div>
          )}

          {/* Favorites Content List / Grid */}
          {filteredFavorites.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredFavorites.map((item, idx) => {
                const isFlight = item.type === "FLIGHT";
                const imageSrc = isFlight
                  ? (item.imageUrl || "/ajet.png")
                  : getHotelImage(item.rawItem || item, idx);

                return (
                  <div
                    key={item.id || idx}
                    className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/90 backdrop-blur-md"
                  >
                    {/* Image Header */}
                    <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                      <img
                        src={imageSrc}
                        alt={item.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => handleHotelImageError(e, item.rawItem || item)}
                      />
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />

                      {/* Remove Favorite Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFavorite(item.id);
                        }}
                        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-rose-500 shadow-md backdrop-blur-md transition-all hover:scale-110 hover:bg-rose-500 hover:text-white dark:bg-slate-900/90"
                        title={t("favorites_remove", "Favorilerden Çıkar")}
                      >
                        <Heart size={18} className="fill-current" />
                      </button>

                      {/* Type Badge */}
                      <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-slate-900/75 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-md">
                        {isFlight ? <Plane size={12} className="text-blue-400" /> : <Hotel size={12} className="text-amber-400" />}
                        {isFlight ? "Uçuş" : "Otel"}
                      </span>
                    </div>

                    {/* Card Body */}
                    <div className="flex flex-1 flex-col p-5">
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-rose-500 transition-colors">
                          {item.name}
                        </h3>
                        {item.stars > 0 && (
                          <div className="flex shrink-0 items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                            <Star size={12} className="fill-amber-400 text-amber-400" />
                            <span>{item.stars}</span>
                          </div>
                        )}
                      </div>

                      {item.location && (
                        <div className="mb-3 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                          <MapPin size={14} className="shrink-0 text-slate-400" />
                          <span className="truncate">{item.location}</span>
                        </div>
                      )}

                      {item.boardType && (
                        <div className="mb-4 inline-flex items-center gap-1.5 self-start rounded-lg bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                          <BedDouble size={12} />
                          <span>{item.boardType}</span>
                        </div>
                      )}

                      <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                        <div>
                          <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                            {t("favorites_price", "Fiyat")}
                          </div>
                          <div className="text-lg font-extrabold text-[#FF8A00] dark:text-orange-400">
                            {Math.round(item.price).toLocaleString("tr-TR")} {item.currency}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleCardClick(item)}
                          className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-rose-600 dark:bg-slate-800 dark:hover:bg-rose-600 cursor-pointer"
                        >
                          <span>{t("favorites_inspect", "İncele")}</span>
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Empty State */
            <div className="mt-8 flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300/80 bg-white/70 p-8 text-center shadow-lg backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/60 sm:p-14">
              <div className="relative mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-950/40">
                <Heart size={56} className="text-rose-500 fill-rose-500/20 animate-pulse" />
                <Sparkles size={20} className="absolute top-2 right-2 text-rose-400" />
              </div>

              <h2 className="mb-2 text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
                {t("favorites_empty_title", "Henüz Favoriniz Bulunmuyor")}
              </h2>

              <p className="mb-8 max-w-md text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {t(
                  "favorites_empty_message",
                  "Beğendiğiniz otelleri ve uçuş fırsatlarını kartların üzerindeki kalp ikonuna tıklayarak favorilerinize ekleyebilir, daha sonra kolayca inceleyebilirsiniz."
                )}
              </p>

              <button
                type="button"
                onClick={() => navigate("/chat")}
                className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 px-7 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-rose-500/25 transition-all hover:opacity-95 hover:scale-105 cursor-pointer"
              >
                <Hotel size={18} />
                <span>{t("favorites_explore_button", "Otelleri Keşfet")}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
