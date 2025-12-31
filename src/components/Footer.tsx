import { useNavigate } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Logo } from './Logo';

export function Footer() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <footer className="bg-black border-t border-[#F6C90E]/20">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 md:gap-12 mb-8 sm:mb-12">
          <div>
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <Logo variant="footer" className="px-1" alt="EasyRentCars Logo" />
            </div>

            <p className="text-[#B8B9BB] mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base">
              {t('footer.tagline')}
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3 text-[#B8B9BB]">
                <MapPin className="w-5 h-5 text-[#F6C90E] flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-white">{t('footer.address')}</p>
                  <p>{t('footer.addressValue')}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-[#B8B9BB]">
                <Phone className="w-5 h-5 text-[#F6C90E] flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-white">{t('footer.phone')}</p>
                  <a href="tel:+436641584950" className="hover:text-[#F6C90E] transition-colors">
                    +43 664 1584950
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 text-[#B8B9BB]">
                <Mail className="w-5 h-5 text-[#F6C90E] flex-shrink-0 mt-[#F6C90E] flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-white">{t('footer.email')}</p>
                  <a
                    href="mailto:info@easyrentcars.rentals"
                    className="hover:text-[#F6C90E] transition-colors"
                  >
                    info@easyrentcars.rentals
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 uppercase tracking-wide">
              {t('footer.quickLinks')}
            </h3>
            <ul className="space-y-2 sm:space-y-3">
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
                      className="text-[#B8B9BB] hover:text-[#F6C90E] transition-colors flex items-center gap-2 group text-sm sm:text-base"
                    >
                      <span className="w-2 h-2 bg-[#F6C90E] rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                      {link.label}
                    </button>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>

        <div className="pt-6 sm:pt-8 border-t border-[#F6C90E]/20 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
          <p className="text-[#B8B9BB] text-xs sm:text-sm text-center sm:text-left">
            {t('footer.copyright')}
          </p>
          <div className="flex gap-4 sm:gap-6 text-xs sm:text-sm">
            <a href="#" className="text-[#B8B9BB] hover:text-[#F6C90E] transition-colors">
              {t('footer.privacy')}
            </a>
            <a href="#" className="text-[#B8B9BB] hover:text-[#F6C90E] transition-colors">
              {t('footer.terms')}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
