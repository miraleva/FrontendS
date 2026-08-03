import React, { useState, useEffect } from 'react';
import { Plane } from 'lucide-react';

/**
 * Local PNG Airline Logo Helper
 * Returns local image path based on airline code/name and theme
 */
export const getAirlineLogo = (airlineCode, isDarkMode = false) => {
  if (!airlineCode) return null;
  const str = String(airlineCode).toUpperCase().trim();

  if (str.includes('AJET') || str.includes('ANADOLU') || str === 'VF') {
    return isDarkMode ? '/assets/logos/ajet-dark.png' : '/assets/logos/ajet-light.png';
  }
  if (str.includes('TURKISH') || str.includes('THY') || str.includes('TÜRK') || str === 'TK') {
    return isDarkMode ? '/assets/logos/thy-dark.png' : '/assets/logos/thy-light.png';
  }
  if (str.includes('PEGASUS') || str.includes('PGS') || str === 'PC') {
    return '/assets/logos/pegasus.png';
  }

  return null;
};

/**
 * Standardized AirlineLogo component using local PNG images
 */
export function AirlineLogo({
  airline,
  theme,
  isDarkMode: isDarkProp,
  className = "h-8 sm:h-9 w-auto object-contain",
  style = {},
  showFallbackName = true,
  fallbackClassName = ""
}) {
  const [imgError, setImgError] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  useEffect(() => {
    if (typeof isDarkProp === 'boolean') {
      setIsDarkTheme(isDarkProp);
      return;
    }
    if (theme) {
      setIsDarkTheme(theme === 'dark');
      return;
    }

    const checkDark = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkTheme(isDark);
    };
    checkDark();

    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, [theme, isDarkProp]);

  const activeDark = typeof isDarkProp === 'boolean' ? isDarkProp : (theme ? theme === 'dark' : isDarkTheme);
  const logoUrl = getAirlineLogo(airline, activeDark);

  if (logoUrl && !imgError) {
    return (
      <img
        src={logoUrl}
        alt={airline || "Havayolu"}
        className={`${className} object-contain shrink-0`}
        style={{
          filter: activeDark ? "drop-shadow(0px 2px 8px rgba(255, 255, 255, 0.12))" : "none",
          maxHeight: style.maxHeight || "44px",
          ...style
        }}
        onError={() => setImgError(true)}
      />
    );
  }

  // Fallback: Clean Plane Icon + Airline Name
  return (
    <div className={`flex items-center gap-2 text-slate-800 dark:text-white font-bold text-sm ${fallbackClassName}`}>
      <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
        <Plane size={16} />
      </div>
      {showFallbackName && <span className="truncate">{airline || "Uçuş"}</span>}
    </div>
  );
}

export default AirlineLogo;
