import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check } from 'lucide-react';

export default function LanguageSelector({
  className = "relative",
  direction = "down", // "up" or "down"
  align = "right", // "left", "right", or "center"
  buttonClassName = ""
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
    { code: 'tr', label: 'TR - Türkçe' },
    { code: 'en', label: 'EN - English' },
    { code: 'de', label: 'DE - Deutsch' },
    { code: 'ru', label: 'RU - Русский' },
  ];

  const currentLangCode = i18n.language ? i18n.language.slice(0, 2).toLowerCase() : 'tr';
  const currentLangLabel = currentLangCode.toUpperCase();
  const isDropup = direction === 'up';

  const alignmentClass =
    align === 'left'
      ? 'left-0'
      : align === 'center'
      ? 'left-1/2 -translate-x-1/2'
      : 'right-0';

  return (
    <div className={className} ref={langRef}>
      <button
        type="button"
        onClick={() => setIsLangOpen(!isLangOpen)}
        className={
          buttonClassName ||
          "p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all focus:outline-none cursor-pointer flex items-center gap-2 shadow-md hover:shadow-lg flex-shrink-0"
        }
        title={t('select_language', 'Dil Seçin / Select Language')}
      >
        <Globe size={18} className="text-slate-600 dark:text-slate-300 flex-shrink-0" />
        <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
          {currentLangLabel}
        </span>
      </button>

      {isLangOpen && (
        <div
          className={`absolute ${
            isDropup ? 'bottom-full mb-2' : 'top-full mt-2'
          } ${alignmentClass} min-w-[170px] w-max max-w-[240px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-1.5 z-[100] animate-fade-in`}
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
                className={`w-full text-left px-3.5 py-2.5 text-xs font-semibold flex items-center justify-between gap-3 whitespace-nowrap transition-colors duration-150 cursor-pointer ${
                  isSelected
                    ? 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary font-bold'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/70'
                }`}
              >
                <span>{lang.label}</span>
                {isSelected && (
                  <Check size={15} className="text-primary dark:text-primary flex-shrink-0 ml-1" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
