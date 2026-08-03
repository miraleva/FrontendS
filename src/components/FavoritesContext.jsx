import React, { createContext, useContext, useState, useEffect } from "react";
import { Heart, HeartOff } from "lucide-react";

const FavoritesContext = createContext();

const FAVORITES_KEY = "sanny_favorites";

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem(FAVORITES_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [toast, setToast] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch (e) {
      console.error("Failed to save favorites to localStorage", e);
    }
  }, [favorites]);

  const showToast = (message, type = "add") => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const isFavorite = (item) => {
    if (!item) return false;
    const itemId = String(item.id || item.hotelId || item.offerId || item.pnrCode || item.name || "");
    if (!itemId) return false;
    return favorites.some(
      (f) => String(f.id || f.hotelId || f.offerId || f.pnrCode || f.name) === itemId
    );
  };

  const toggleFavorite = (item) => {
    if (!item) return;
    const itemId = String(item.id || item.hotelId || item.offerId || item.pnrCode || item.name || Date.now());
    const exists = isFavorite(item);

    if (exists) {
      setFavorites((prev) =>
        prev.filter((f) => String(f.id || f.hotelId || f.offerId || f.pnrCode || f.name) !== itemId)
      );
      const title = item.name || item.title || item.hotelName || "Öğe";
      showToast(`"${title}" favorilerden çıkarıldı`, "remove");
    } else {
      const itemToSave = {
        id: itemId,
        hotelId: item.hotelId || item.id,
        name: item.name || item.title || item.hotelName || "Otel / Uçuş",
        type: item.type || (item.airline ? "FLIGHT" : "HOTEL"),
        location: item.location || item.city || item.destination || (item.region ? `${item.city || ''}, ${item.region}` : ""),
        price: Number(item.price || item.totalPrice || item.totalAmount || 0),
        currency: item.currency || "TRY",
        stars: Number(item.stars || item.rating || 0),
        boardType: item.boardType || item.boardName || item.pensionType || "",
        imageUrl: item.imageUrl || item.thumbnailFull || item.thumbnail || item.photo || "",
        addedAt: new Date().toISOString(),
        rawItem: item
      };
      setFavorites((prev) => [itemToSave, ...prev]);
      showToast(`"${itemToSave.name}" favorilere eklendi ❤️`, "add");
    }
  };

  const removeFavorite = (id) => {
    if (!id) return;
    setFavorites((prev) =>
      prev.filter((f) => String(f.id || f.hotelId || f.offerId || f.pnrCode || f.name) !== String(id))
    );
    showToast("Favorilerden çıkarıldı", "remove");
  };

  const clearAllFavorites = () => {
    setFavorites([]);
    showToast("Tüm favoriler temizlendi", "remove");
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        favoritesCount: favorites.length,
        isFavorite,
        toggleFavorite,
        removeFavorite,
        clearAllFavorites
      }}
    >
      {children}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[200] flex items-center gap-3 rounded-2xl bg-slate-900/95 px-5 py-3.5 text-white shadow-2xl backdrop-blur-md border border-slate-800 animate-fade-in transition-all">
          {toast.type === "add" ? (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-500/20 text-rose-500">
              <Heart size={18} className="fill-rose-500" />
            </div>
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700 text-slate-300">
              <HeartOff size={18} />
            </div>
          )}
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}
