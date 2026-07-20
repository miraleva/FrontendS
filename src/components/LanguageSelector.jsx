import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check } from 'lucide-react';

export default function LanguageSelector({
  className = "fixed top-4 right-4 z-50",
  direction = "down" // "up" or "down"
}) {
  const { i18n, t } = useTranslation();
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

  const languages = [
    { code: 'tr', label: 'TR - Türkçe', flag: 'TR' },
    { code: 'en', label: 'EN - English', flag: 'EN' },
    { code: 'de', label: 'DE - Deutsch', flag: 'DE' },
    { code: 'ru', label: 'RU - Русский', flag: 'RU' },
  ];

  const currentLangCode = i18n.language ? i18n.language.slice(0, 2).toLowerCase() : 'tr';
  const currentLangLabel = currentLangCode.toUpperCase();
  const isDropup = direction === 'up';

  return (
    <div className={className} ref={langRef}>
      <button
        type="button"
        onClick={() => setIsLangOpen(!isLangOpen)}
        className="p-2 rounded-lg text-text-secondary dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-text-primary dark:hover:text-slate-200 transition-colors focus:outline-none cursor-pointer flex items-center gap-1.5 flex-shrink-0"
        title={t('select_language', 'Dil Seçin / Select Language')}
      >
        <Globe size={18} />
        <span className="text-xs font-bold uppercase tracking-wider">{currentLangLabel}</span>
      </button>

      {isLangOpen && (
        <div
          className={`absolute ${
            isDropup ? 'bottom-full mb-2' : 'top-full mt-2'
          } left-1/2 -translate-x-1/2 min-w-[135px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden py-1 z-50 animate-fade-in`}
        >
          {languages.map((lang) => {
            const isSelected = currentLangCode === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  i18n.changeLanguage(lang.code);
                  localStorage.setItem('i18nextLng', lang.code);
                  setIsLangOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs font-semibold flex items-center justify-between transition-colors duration-150 cursor-pointer ${
                  isSelected
                    ? 'bg-primary/10 dark:bg-blue-500/20 text-primary dark:text-blue-400'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                }`}
              >
                <span>{lang.label}</span>
                {isSelected && <Check size={14} className="text-primary dark:text-blue-400 ml-1.5 flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}