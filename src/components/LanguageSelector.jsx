import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

export default function LanguageSelector({ className = "fixed top-4 right-4 z-50" }) {
  const { i18n } = useTranslation();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (langRef.current && !langRef.current.contains(event.target)) {
        setIsLangOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLangLabel = i18n.language ? i18n.language.slice(0, 2).toUpperCase() : 'EN';

  return (
    <div className={className} ref={langRef}>
      <button
        type="button"
        onClick={() => setIsLangOpen(!isLangOpen)}
        className="bg-[#F0F4F8]/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-1.5 text-[#f07c24] text-[16px] font-bold flex items-center gap-2 cursor-pointer transition-all duration-200 hover:bg-[#F0F4F8]/30 focus:outline-none"
      >
        <span>{currentLangLabel}</span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isLangOpen ? 'rotate-180' : ''}`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isLangOpen && (
        <div className="absolute right-0 mt-2 w-28 bg-[#F0F4F8]/95 backdrop-blur-md border border-white/50 rounded-xl shadow-xl overflow-hidden py-1 z-50 animate-fade-in">
          {['en', 'tr', 'ru', 'de'].map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => {
                i18n.changeLanguage(lang);
                // Çift dikiş: Tarayıcı hafızasını manuel olarak da besliyoruz
                localStorage.setItem('i18nextLng', lang);
                setIsLangOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-[15px] transition-colors duration-150 ${i18n.language?.startsWith(lang)
                ? 'bg-[#0096C7] text-white font-bold'
                : 'text-[#023E8A] hover:bg-[#0096C7]/10'
                }`}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}