import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Hotel,
  Plane,
  Search,
  MessageSquare,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  Headphones,
  ArrowRight,
  Sun,
  Moon,
  Ticket,
  Baby,
  Users
} from 'lucide-react';

import SannyLogo from '../components/SannyLogo';
import LanguageSelector from '../components/LanguageSelector';
import SupportModal from '../components/SupportModal';
import { useTheme } from '../components/ThemeContext';
import { useAuth } from '../components/AuthContext';

export default function WelcomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { continueAsGuest } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState(null);
  const [activeSection, setActiveSection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

  const containerRef = useRef(null);
  const activeSectionRef = useRef(activeSection);
  activeSectionRef.current = activeSection;

  const sections = [
    { id: 'hero', label: t('landing.navHero') },
    { id: 'features', label: t('landing.navFeatures') },
    { id: 'how-it-works', label: t('landing.navHowItWorks') },
    { id: 'faq', label: t('landing.navFaq') },
  ];

  // Scroll position observer to update activeDot
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollPosition = container.scrollTop;
      const windowHeight = container.clientHeight;
      if (windowHeight > 0) {
        const index = Math.round(scrollPosition / windowHeight);
        setActiveSection(index);
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth scroll to section
  const scrollToSectionIndex = (index) => {
    const container = containerRef.current;
    if (container) {
      const targetIndex = (index + sections.length) % sections.length;
      container.scrollTo({
        top: targetIndex * container.clientHeight,
        behavior: 'smooth'
      });
      setActiveSection(targetIndex);
    }
  };

  // Auto-scroll Timer (3.5 seconds) with Pause control (DISABLED)
  useEffect(() => {
    // Autoscroll disabled as requested
    /*
    if (isPaused) return;

    const timer = setInterval(() => {
      const nextIndex = (activeSectionRef.current + 1) % sections.length;
      scrollToSectionIndex(nextIndex);
    }, 3500);

    return () => clearInterval(timer);
    */
  }, [isPaused, sections.length]);

  const handleStartSearch = (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;
    continueAsGuest();
    navigate('/chat', { state: { initialPrompt: searchQuery.trim(), autoSend: true } });
  };

  const handleGuestEntry = () => {
    continueAsGuest();
    navigate('/chat');
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="relative w-full min-h-screen md:h-screen overflow-y-auto md:overflow-hidden bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-[#f07c24] selection:text-white transition-colors duration-300">

      {/* 1. FIXED BACKGROUND VIDEO & LIGHT/SOFT OVERLAY (NO BLUR) */}
      <div className="fixed inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/videos/background.mp4" type="video/mp4" />
        </video>
        {/* Soft overlay: clean video quality with subtle gradient for text contrast */}
        <div className="absolute inset-0 bg-slate-900/20 dark:bg-slate-950/60 transition-colors duration-300" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/50 pointer-events-none" />
      </div>

      {/* 2. FIXED FULL-WIDTH HEADER */}
      <header className="sticky md:absolute top-0 left-0 w-full z-50 px-4 sm:px-10 h-16 sm:h-20 flex items-center justify-between backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/50 dark:border-slate-800/50 transition-colors">
        {/* Logo */}
        <div className="cursor-pointer" onClick={() => scrollToSectionIndex(0)}>
          <SannyLogo className="flex items-center gap-2 select-none" imgClassName="w-8 h-8 sm:w-10 sm:h-10 object-contain drop-shadow-md" textClassName="font-display font-black text-[#f07c24] text-xl sm:text-2xl tracking-wider" />
        </div>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-700 dark:text-slate-200">
          <button onClick={() => scrollToSectionIndex(1)} className={`transition-colors cursor-pointer hover:text-[#f07c24] ${activeSection === 1 ? 'text-[#f07c24] font-bold' : ''}`}>
            {t('landing.navFeatures')}
          </button>
          <button onClick={() => scrollToSectionIndex(2)} className={`transition-colors cursor-pointer hover:text-[#f07c24] ${activeSection === 2 ? 'text-[#f07c24] font-bold' : ''}`}>
            {t('landing.navHowItWorks')}
          </button>
          <button onClick={() => scrollToSectionIndex(3)} className={`transition-colors cursor-pointer hover:text-[#f07c24] ${activeSection === 3 ? 'text-[#f07c24] font-bold' : ''}`}>
            {t('landing.navFaq')}
          </button>
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 sm:p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-amber-400 hover:bg-white dark:hover:bg-slate-700 transition-all cursor-pointer shadow-md flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10"
            title={theme === 'dark' ? (t('theme_light', 'Aydınlık Mod')) : (t('theme_dark', 'Karanlık Mod'))}
          >
            {theme === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-slate-700" />}
          </button>

          {/* Language Selector */}
          <LanguageSelector direction="down" align="right" />

          {/* Login Button */}
          <button
            onClick={() => navigate('/login')}
            className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 rounded-2xl font-bold text-sm bg-[#f07c24] hover:bg-[#e06b13] text-white transition-all shadow-lg hover:shadow-orange-500/30 cursor-pointer"
          >
            {t('landing.login')}
          </button>
        </div>
      </header>

      {/* 3. SIDE DOT NAVIGATION (INDICATOR WITH SMOOTH EXPANSION) */}
      <div className="hidden md:flex fixed right-6 top-1/2 -translate-y-1/2 z-50 flex-col gap-4 items-center">
        {sections.map((sec, idx) => (
          <button
            key={sec.id}
            onClick={() => scrollToSectionIndex(idx)}
            title={sec.label}
            className="group relative flex items-center justify-center p-1.5 cursor-pointer focus:outline-none"
          >
            <span className={`block rounded-full transition-all duration-500 ease-in-out ${activeSection === idx
                ? 'w-4 h-4 bg-[#f07c24] shadow-[0_0_14px_rgba(240,124,36,0.9)] scale-110'
                : 'w-2.5 h-2.5 bg-white/50 dark:bg-slate-400/50 group-hover:bg-[#f07c24]/70'
              }`} />
            {/* Tooltip on hover */}
            <span className="absolute right-8 px-3 py-1 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-lg backdrop-blur-md">
              {sec.label}
            </span>
          </button>
        ))}
      </div>

      {/* 4. ULTRA-SMOOTH GPU-ACCELERATED SCROLL SNAP CONTAINER */}
      <div
        ref={containerRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        className="w-full h-full overflow-y-auto md:overflow-y-scroll md:snap-y md:snap-mandatory scroll-smooth z-10 relative"
      >

        {/* SECTION 1: HERO */}
        <section className="min-h-screen md:h-screen w-full md:snap-start md:snap-always flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12 md:py-0 md:pt-20 text-center relative">
          <div className="max-w-4xl mx-auto flex flex-col items-center">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/30 dark:bg-slate-900/40 backdrop-blur-md border border-white/40 dark:border-slate-700/50 text-[#f07c24] text-xs sm:text-sm font-bold mb-6 shadow-md animate-pulse">
              <Sparkles className="w-4 h-4 text-[#f07c24]" />
              <span>{t('landing.heroBadge')}</span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight sm:leading-none text-white drop-shadow-lg">
              {t('landing.heroTitle')}
            </h1>

            {/* Subtitle */}
            <p className="mt-4 sm:mt-6 text-sm sm:text-xl text-slate-100 dark:text-slate-200 max-w-2xl mx-auto font-medium leading-relaxed drop-shadow-md">
              {t('landing.heroSubtitle')}
            </p>

            {/* Interactive Prompt Input Box */}
            <div className="mt-8 sm:mt-10 max-w-2xl w-full mx-auto">
              <form onSubmit={handleStartSearch} className="relative group">
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#f07c24] to-amber-500 opacity-40 group-hover:opacity-75 transition duration-500 blur-md" />
                <div className="relative flex items-center bg-white/80 dark:bg-slate-900/85 backdrop-blur-xl border border-white/40 dark:border-slate-700/60 rounded-2xl p-2 shadow-2xl">
                  <Search className="w-6 h-6 text-slate-400 ml-3 flex-shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('landing.searchPlaceholder')}
                    className="w-full px-4 py-3 bg-transparent border-none text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none text-sm sm:text-base font-medium"
                  />
                  <button
                    type="submit"
                    className="flex items-center gap-2 bg-[#f07c24] hover:bg-[#e06b13] text-white font-bold px-5 py-3 rounded-xl transition-all shadow-md hover:shadow-lg flex-shrink-0 cursor-pointer text-sm sm:text-base"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span className="hidden sm:inline">{t('landing.searchBtn')}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* CTA Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md mx-auto z-20 relative">
              <button
                onClick={handleGuestEntry}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl font-bold text-sm sm:text-base bg-[#f07c24] hover:bg-[#e06b13] text-white transition-all shadow-lg hover:shadow-orange-500/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{t('landing.tryAsGuest')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl font-bold text-sm sm:text-base bg-white/40 dark:bg-slate-800/60 hover:bg-white/60 dark:hover:bg-slate-800/80 text-white border border-white/50 dark:border-slate-700/60 transition-all cursor-pointer backdrop-blur-md shadow-md"
              >
                {t('landing.login')}
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 2: FEATURES */}
        <section className="min-h-screen md:h-screen w-full md:snap-start md:snap-always flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12 md:py-0 md:pt-16 relative">
          <div className="max-w-6xl mx-auto w-full">

            <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-5xl font-bold text-white tracking-tight drop-shadow-md">
                {t('landing.featuresTitle')}
              </h2>
              <p className="mt-3 sm:mt-4 text-slate-200 dark:text-slate-300 text-xs sm:text-base font-medium drop-shadow-sm">
                {t('landing.featuresSubtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1: Hotel */}
              <div className="group relative p-6 sm:p-7 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/50 dark:border-slate-800/60 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-orange-500/10 dark:bg-orange-500/20 text-[#f07c24] flex items-center justify-center mb-4 sm:mb-5 group-hover:scale-110 transition-transform">
                  <Hotel className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2">
                  {t('landing.featureHotelTitle')}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed mb-4">
                  {t('landing.featureHotelDesc')}
                </p>
                <div className="inline-flex items-center gap-1.5 text-xs text-[#f07c24] bg-orange-500/10 px-3 py-1 rounded-xl border border-orange-500/20 font-semibold">
                  <Baby className="w-3.5 h-3.5" />
                  <span>{t('landing.featureHotelBadge')}</span>
                </div>
              </div>

              {/* Feature 2: Flight */}
              <div className="group relative p-6 sm:p-7 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/50 dark:border-slate-800/60 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-500 dark:text-blue-400 flex items-center justify-center mb-4 sm:mb-5 group-hover:scale-110 transition-transform">
                  <Plane className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2">
                  {t('landing.featureFlightTitle')}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed mb-4">
                  {t('landing.featureFlightDesc')}
                </p>
                <div className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 bg-blue-500/10 px-3 py-1 rounded-xl border border-blue-500/20 font-semibold">
                  <Users className="w-3.5 h-3.5" />
                  <span>{t('landing.featureFlightBadge')}</span>
                </div>
              </div>

              {/* Feature 3: PNR */}
              <div className="group relative p-6 sm:p-7 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/50 dark:border-slate-800/60 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 sm:mb-5 group-hover:scale-110 transition-transform">
                  <Ticket className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2">
                  {t('landing.featurePnrTitle')}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed mb-4">
                  {t('landing.featurePnrDesc')}
                </p>
                <div className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{t('landing.featurePnrBadge')}</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* SECTION 3: HOW IT WORKS */}
        <section className="min-h-screen md:h-screen w-full md:snap-start md:snap-always flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12 md:py-0 md:pt-16 relative">
          <div className="max-w-6xl mx-auto w-full">

            <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-14">
              <h2 className="text-2xl sm:text-5xl font-bold text-white tracking-tight drop-shadow-md">
                {t('landing.howTitle')}
              </h2>
              <p className="mt-3 sm:mt-4 text-slate-200 dark:text-slate-300 text-xs sm:text-base font-medium drop-shadow-sm">
                {t('landing.howSubtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {/* Step 1 */}
              <div className="p-6 sm:p-8 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/50 dark:border-slate-800/60 flex flex-col items-center text-center relative overflow-hidden group shadow-xl">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#f07c24] text-white font-black text-xl sm:text-2xl flex items-center justify-center shadow-lg mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                  1
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2 sm:mb-3">
                  {t('landing.step1Title')}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
                  {t('landing.step1Desc')}
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-6 sm:p-8 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/50 dark:border-slate-800/60 flex flex-col items-center text-center relative overflow-hidden group shadow-xl">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-blue-600 text-white font-black text-xl sm:text-2xl flex items-center justify-center shadow-lg mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                  2
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2 sm:mb-3">
                  {t('landing.step2Title')}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
                  {t('landing.step2Desc')}
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-6 sm:p-8 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/50 dark:border-slate-800/60 flex flex-col items-center text-center relative overflow-hidden group shadow-xl">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-600 text-white font-black text-xl sm:text-2xl flex items-center justify-center shadow-lg mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                  3
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2 sm:mb-3">
                  {t('landing.step3Title')}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
                  {t('landing.step3Desc')}
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* SECTION 4: FAQ & SUPPORT & FOOTER */}
        <section className="min-h-screen md:h-screen w-full md:snap-start md:snap-always flex flex-col justify-between items-center px-4 sm:px-6 lg:px-8 py-12 md:pt-24 md:pb-8 relative">
          <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col justify-center">

            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight drop-shadow-md">
                {t('landing.faqTitle')}
              </h2>
              <p className="mt-2 text-slate-200 dark:text-slate-300 text-xs sm:text-sm font-medium drop-shadow-sm">
                {t('landing.faqSubtitle')}
              </p>
            </div>

            {/* Accordions */}
            <div className="space-y-3 max-h-none md:max-h-[40vh] md:overflow-y-auto pr-1">
              {[
                { q: t('landing.faqQ1'), a: t('landing.faqA1') },
                { q: t('landing.faqQ2'), a: t('landing.faqA2') },
                { q: t('landing.faqQ3'), a: t('landing.faqA3') },
                { q: t('landing.faqQ4'), a: t('landing.faqA4') },
              ].map((faq, idx) => (
                <div
                  key={idx}
                  className="bg-white/70 dark:bg-slate-900/70 border border-white/50 dark:border-slate-800/60 rounded-2xl overflow-hidden backdrop-blur-md shadow-md"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-semibold text-slate-900 dark:text-white hover:text-[#f07c24] dark:hover:text-[#f07c24] transition-colors cursor-pointer text-sm sm:text-base"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 flex-shrink-0 text-slate-400 transition-transform duration-300 ${openFaq === idx ? 'rotate-180 text-[#f07c24]' : ''}`} />
                  </button>
                  {openFaq === idx && (
                    <div className="px-5 pb-4 text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed border-t border-slate-200/50 dark:border-slate-800/50 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Support Banner */}
            <div className="mt-6 p-6 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-md">
                  <Headphones className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold">{t('welcome.support.title')}</h4>
                  <p className="text-white/90 text-xs">{t('welcome.support.subtitle')}</p>
                </div>
              </div>
              <button
                onClick={() => setIsSupportModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-white text-[#f07c24] font-bold hover:bg-slate-50 transition-all shadow-md cursor-pointer flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap"
              >
                <span>{t('welcome.support.button')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* Footer at bottom of section 4 */}
          <footer className="w-full max-w-6xl mx-auto mt-8 pt-6 border-t border-white/20 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-200 dark:text-slate-400">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-left">
              <SannyLogo className="flex items-center gap-2 select-none" imgClassName="w-6 h-6 object-contain" textClassName="font-display font-black text-[#f07c24] text-lg tracking-wider" />
              <span className="hidden sm:inline-block border-l border-white/20 dark:border-slate-800/60 pl-3">
                {t('landing.footerTagline')}
              </span>
              <span className="sm:hidden text-white/80 text-[11px]">
                {t('landing.footerTagline')}
              </span>
            </div>

            <p className="text-center sm:text-right font-medium">© {new Date().getFullYear()} SANNY AI. {t('landing.allRightsReserved')}</p>
          </footer>
        </section>

      </div>

      <SupportModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
      />

    </div>
  );
}
