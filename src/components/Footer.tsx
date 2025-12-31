import { useNavigate } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Logo } from './Logo';

export function Footer() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <footer className="bg-black border-t border-[#F6C90E]/20" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="container mx-auto px-3 xs:px-4 sm:px-6 py-6 xs:py-8 sm:py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 xs:gap-8 sm:gap-10 md:gap-12 mb-6 xs:mb-8 sm:mb-12">
          <div>
            <div className="flex items-center gap-2 sm:gap-3 mb-3 xs:mb-4 sm:mb-6">
              <Logo variant="footer" className="px-1 max-w-[140px] xs:max-w-[160px] sm:max-w-none" alt="EasyRentCars Logo" />
            </div>

            <p className="text-[#B8B9BB] mb-5 xs:mb-6 sm:mb-8 leading-relaxed text-xs xs:text-sm sm:text-base">
              {t('footer.tagline')}
            </p>

            <div className="space-y-3 xs:space-y-4">
              <div className="flex items-start gap-2.5 xs:gap-3 text-[#B8B9BB]">
                <MapPin className="w-4 xs:w-5 h-4 xs:h-5 text-[#F6C90E] flex-shrink-0 mt-0.5 xs:mt-1" />
                <div className="min-w-0">
                  <p className="font-semibold text-white text-sm xs:text-base">{t('footer.address')}</p>
                  <p className="text-xs xs:text-sm">{t('footer.addressValue')}</p>
                </div>
              </div>

              <a href="tel:+436641584950" className="flex items-start gap-2.5 xs:gap-3 text-[#B8B9BB] p-1.5 -m-1.5 rounded-lg active:bg-white/5 transition-colors touch-manipulation">
                <Phone className="w-4 xs:w-5 h-4 xs:h-5 text-[#F6C90E] flex-shrink-0 mt-0.5 xs:mt-1" />
                <div className="min-w-0">
                  <p className="font-semibold text-white text-sm xs:text-base">{t('footer.phone')}</p>
                  <p className="hover:text-[#F6C90E] transition-colors text-xs xs:text-sm">
                    +43 664 1584950
                  </p>
                </div>
              </a>

              <a href="mailto:info@easyrentcars.rentals" className="flex items-start gap-2.5 xs:gap-3 text-[#B8B9BB] p-1.5 -m-1.5 rounded-lg active:bg-white/5 transition-colors touch-manipulation">
                <Mail className="w-4 xs:w-5 h-4 xs:h-5 text-[#F6C90E] flex-shrink-0 mt-0.5 xs:mt-1" />
                <div className="min-w-0">
                  <p className="font-semibold text-white text-sm xs:text-base">{t('footer.email')}</p>
                  <p className="hover:text-[#F6C90E] transition-colors text-xs xs:text-sm break-all">
                    info@easyrentcars.rentals
                  </p>
                </div>
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-base xs:text-lg sm:text-xl font-bold text-white mb-3 xs:mb-4 sm:mb-6 uppercase tracking-wide">
              {t('footer.quickLinks')}
            </h3>
            <ul className="space-y-1 xs:space-y-2 sm:space-y-3">
              {[
                { key: 'home', label: t('footer.home'), action: () => navigate('/') },
                { key: 'fleet', label: t('footer.fleet'), action: () => navigate('/') },
                { key: 'faq', label: t('footer.faq'), action: () => navigate('/') },
                { key: 'terms', label: t('footer.terms'), action: () => navigate('/agb') },
                { key: 'contact', label: t('footer.contact'), action: () => navigate('/') },
              ].map((link) => (
                  <li key={link.key}>
                    <button
                      onClick={link.action}
                      className="text-[#B8B9BB] hover:text-[#F6C90E] active:text-[#F6C90E] transition-colors flex items-center gap-2 group text-xs xs:text-sm sm:text-base py-1.5 xs:py-2 min-h-touch touch-manipulation"
                    >
                      <span className="w-1.5 xs:w-2 h-1.5 xs:h-2 bg-[#F6C90E] rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                      {link.label}
                    </button>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>

        <div className="pt-5 xs:pt-6 sm:pt-8 border-t border-[#F6C90E]/20 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
          <p className="text-[#B8B9BB] text-[10px] xs:text-xs sm:text-sm text-center sm:text-left">
            {t('footer.copyright')}
          </p>
          <div className="flex gap-4 sm:gap-6 text-[10px] xs:text-xs sm:text-sm">
            <a href="#" className="text-[#B8B9BB] hover:text-[#F6C90E] active:text-[#F6C90E] transition-colors py-1 touch-manipulation">
              {t('footer.privacy')}
            </a>
            <a href="#" className="text-[#B8B9BB] hover:text-[#F6C90E] active:text-[#F6C90E] transition-colors py-1 touch-manipulation">
              {t('footer.terms')}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
