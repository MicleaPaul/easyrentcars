import { useState, useEffect } from 'react';
import { Cookie, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export function CookieConsent() {
  const { t } = useLanguage();
  const [showBanner, setShowBanner] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Cookie preferences state
  const [functional, setFunctional] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    // Always show banner on page load
    setTimeout(() => {
      setShowBanner(true);
      setTimeout(() => setIsVisible(true), 100);
    }, 1000);
  }, []);

  const handleAcceptAll = () => {
    // Enable all cookie types
    setFunctional(true);
    setAnalytics(true);
    setMarketing(true);

    // Close banner for current session only (no localStorage)
    setTimeout(() => closeBanner(), 100);
  };

  const handleAcceptNecessary = () => {
    // Disable all optional cookies
    setFunctional(false);
    setAnalytics(false);
    setMarketing(false);

    // Close banner for current session only (no localStorage)
    setTimeout(() => closeBanner(), 100);
  };

  const closeBanner = () => {
    setIsVisible(false);
    setTimeout(() => setShowBanner(false), 300);
  };

  const toggleFunctional = () => setFunctional(!functional);
  const toggleAnalytics = () => setAnalytics(!analytics);
  const toggleMarketing = () => setMarketing(!marketing);

  if (!showBanner) return null;

  return (
    <div className={`fixed inset-0 z-[9999] flex items-end justify-center pointer-events-none transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto" onClick={closeBanner} />

      <div className={`relative w-full max-w-4xl mx-4 mb-6 sm:mb-8 pointer-events-auto transform transition-all duration-300 ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="bg-gradient-to-br from-[#111316] to-[#0B0C0F] border-2 border-[#D4AF37]/30 rounded-2xl shadow-2xl overflow-hidden">
          <div className="relative p-6 sm:p-8">
            <button
              onClick={closeBanner}
              className="absolute top-4 right-4 p-2 text-[#9AA0A6] hover:text-white transition-colors rounded-lg hover:bg-[#D4AF37]/10"
              aria-label="Close cookie banner"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-4 sm:gap-6 mb-6">
              <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#F4D03F] flex items-center justify-center">
                <Cookie className="w-6 h-6 sm:w-8 sm:h-8 text-black" />
              </div>

              <div className="flex-1 pr-8">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                  {t('cookies.title') || 'Diese Website verwendet Cookies'}
                </h3>
                <p className="text-[#9AA0A6] text-sm sm:text-base leading-relaxed">
                  {t('cookies.description') || 'Wir verwenden Cookies, um Ihre Erfahrung auf unserer Website zu verbessern. Einige Cookies sind für das Funktionieren der Website erforderlich, während andere uns helfen zu verstehen, wie Sie unsere Website nutzen.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
              {/* Necessary - Always active */}
              <div className="p-4 bg-[#0B0C0F] border border-[#D4AF37]/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-semibold text-sm">{t('cookies.necessary') || 'Necesare'}</h4>
                  <div
                    className="w-10 h-5 bg-[#D4AF37] rounded-full flex items-center justify-end px-1 transition-all duration-200"
                    aria-label="Always active"
                  >
                    <div className="w-3 h-3 bg-white rounded-full shadow-md" />
                  </div>
                </div>
                <p className="text-xs text-[#9AA0A6]">
                  {t('cookies.necessaryDesc') || 'Mereu active'}
                </p>
              </div>

              {/* Functional - Toggleable */}
              <button
                onClick={toggleFunctional}
                className={`p-4 bg-[#0B0C0F] border border-[#D4AF37]/20 rounded-lg transition-all duration-200 hover:border-[#D4AF37]/40 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 text-left ${
                  functional ? 'opacity-100' : 'opacity-75'
                }`}
                aria-pressed={functional}
                aria-label={`Toggle functional cookies: ${functional ? 'enabled' : 'disabled'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-semibold text-sm">{t('cookies.functional') || 'Funcționale'}</h4>
                  <div
                    className={`w-10 h-5 rounded-full flex items-center transition-all duration-200 ${
                      functional ? 'bg-[#D4AF37] justify-end px-1' : 'bg-[#9AA0A6]/30 justify-start px-1'
                    }`}
                  >
                    <div className={`w-3 h-3 bg-white rounded-full shadow-md transition-transform duration-200 ${
                      functional ? 'scale-100' : 'scale-75 opacity-70'
                    }`} />
                  </div>
                </div>
                <p className="text-xs text-[#9AA0A6]">
                  {t('cookies.functionalDesc') || 'Salvează setări'}
                </p>
              </button>

              {/* Analytics - Toggleable */}
              <button
                onClick={toggleAnalytics}
                className={`p-4 bg-[#0B0C0F] border border-[#D4AF37]/20 rounded-lg transition-all duration-200 hover:border-[#D4AF37]/40 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 text-left ${
                  analytics ? 'opacity-100' : 'opacity-75'
                }`}
                aria-pressed={analytics}
                aria-label={`Toggle analytics cookies: ${analytics ? 'enabled' : 'disabled'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-semibold text-sm">{t('cookies.analytics') || 'Analiză'}</h4>
                  <div
                    className={`w-10 h-5 rounded-full flex items-center transition-all duration-200 ${
                      analytics ? 'bg-[#D4AF37] justify-end px-1' : 'bg-[#9AA0A6]/30 justify-start px-1'
                    }`}
                  >
                    <div className={`w-3 h-3 bg-white rounded-full shadow-md transition-transform duration-200 ${
                      analytics ? 'scale-100' : 'scale-75 opacity-70'
                    }`} />
                  </div>
                </div>
                <p className="text-xs text-[#9AA0A6]">
                  {t('cookies.analyticsDesc') || 'Analiză utilizare'}
                </p>
              </button>

              {/* Marketing - Toggleable */}
              <button
                onClick={toggleMarketing}
                className={`p-4 bg-[#0B0C0F] border border-[#D4AF37]/20 rounded-lg transition-all duration-200 hover:border-[#D4AF37]/40 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 text-left ${
                  marketing ? 'opacity-100' : 'opacity-75'
                }`}
                aria-pressed={marketing}
                aria-label={`Toggle marketing cookies: ${marketing ? 'enabled' : 'disabled'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-semibold text-sm">{t('cookies.marketing') || 'Marketing'}</h4>
                  <div
                    className={`w-10 h-5 rounded-full flex items-center transition-all duration-200 ${
                      marketing ? 'bg-[#D4AF37] justify-end px-1' : 'bg-[#9AA0A6]/30 justify-start px-1'
                    }`}
                  >
                    <div className={`w-3 h-3 bg-white rounded-full shadow-md transition-transform duration-200 ${
                      marketing ? 'scale-100' : 'scale-75 opacity-70'
                    }`} />
                  </div>
                </div>
                <p className="text-xs text-[#9AA0A6]">
                  {t('cookies.marketingDesc') || 'Publicitate'}
                </p>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                onClick={handleAcceptAll}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-black font-bold rounded-lg hover:shadow-xl hover:glow-gold transition-all text-sm sm:text-base uppercase tracking-wide"
              >
                {t('cookies.acceptAll') || 'Alle Akzeptieren'}
              </button>
              <button
                onClick={handleAcceptNecessary}
                className="flex-1 px-6 py-4 bg-[#111316] text-white font-semibold rounded-lg border-2 border-[#D4AF37]/30 hover:border-[#D4AF37] transition-all text-sm sm:text-base uppercase tracking-wide"
              >
                {t('cookies.necessaryOnly') || 'Nur Notwendige'}
              </button>
            </div>

            <div className="mt-4 text-center">
              <a
                href="/privacy-policy"
                className="text-xs text-[#D4AF37] hover:text-[#F4D03F] transition-colors underline"
              >
                {t('cookies.privacyPolicy') || 'Datenschutzerklärung'}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
