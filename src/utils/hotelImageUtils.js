/**
 * Generic high-quality hotel placeholder images & fallback utilities
 */
export const DEFAULT_HOTEL_IMAGE = "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80";
export const RESORT_HOTEL_IMAGE = "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80";
export const CITY_HOTEL_IMAGE = "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80";

export const HOTEL_FALLBACK_IMAGES = [
  DEFAULT_HOTEL_IMAGE,
  CITY_HOTEL_IMAGE,
  "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80",
  RESORT_HOTEL_IMAGE,
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80",
];

/**
 * Returns a valid hotel image URL or appropriate fallback based on hotel features
 */
export function getHotelImage(hotel = {}, idx = 0) {
  if (!hotel) return DEFAULT_HOTEL_IMAGE;
  
  if (Array.isArray(hotel.photos) && hotel.photos.length > 0 && hotel.photos[0]) return hotel.photos[0];
  if (Array.isArray(hotel.images) && hotel.images.length > 0 && hotel.images[0]) return hotel.images[0];
  if (hotel.imageUrl && typeof hotel.imageUrl === "string" && hotel.imageUrl.trim()) return hotel.imageUrl.trim();
  if (hotel.thumbnailFull && typeof hotel.thumbnailFull === "string" && hotel.thumbnailFull.trim()) return hotel.thumbnailFull.trim();
  if (hotel.heroImage && typeof hotel.heroImage === "string" && hotel.heroImage.trim()) return hotel.heroImage.trim();
  if (hotel.thumbnailUrl && typeof hotel.thumbnailUrl === "string" && !hotel.thumbnailUrl.includes("placeholder")) return hotel.thumbnailUrl.trim();
  if (hotel.thumbnail && typeof hotel.thumbnail === "string" && hotel.thumbnail.trim()) return hotel.thumbnail.trim();
  if (hotel.photo && typeof hotel.photo === "string" && hotel.photo.trim()) return hotel.photo.trim();

  // Smart fallback based on category / stars / location keywords
  const stars = Number(hotel.stars || hotel.rating || hotel.category || 0);
  const nameLoc = `${hotel.name || ''} ${hotel.hotelName || ''} ${hotel.location || ''} ${hotel.city || ''}`.toLowerCase();

  if (nameLoc.includes("resort") || nameLoc.includes("beach") || nameLoc.includes("spa") || stars >= 5) {
    return RESORT_HOTEL_IMAGE;
  }
  if (nameLoc.includes("city") || nameLoc.includes("plaza") || nameLoc.includes("business") || nameLoc.includes("palace")) {
    return CITY_HOTEL_IMAGE;
  }

  const charCode = String(hotel.hotelId || hotel.id || hotel.name || idx).split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const fallbackIdx = (charCode + idx) % HOTEL_FALLBACK_IMAGES.length;
  return HOTEL_FALLBACK_IMAGES[fallbackIdx] || DEFAULT_HOTEL_IMAGE;
}

/**
 * Image onError handler to gracefully fall back on broken links or 404s
 */
export function handleHotelImageError(e, hotel = {}) {
  if (e && e.currentTarget) {
    e.currentTarget.onerror = null;
    e.currentTarget.src = DEFAULT_HOTEL_IMAGE;
  }
}
