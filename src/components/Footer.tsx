import { useNavigate } from 'react-router-dom';
import { Mail, Phone, MapPin, Car } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { Logo } from './Logo';

export function Footer() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { settings } = useSiteSettings();

  const contactInfo = settings.contact_info || {};
  const address = contactInfo.address || {};

  const phoneForHref = contactInfo.phone ? contactInfo.phone.replace(/\s/g, '') : '';

  const hasAddress = address.street || address.postalCode || address.city || address.country;
  const hasPhone = !!contactInfo.phone;
  const hasEmail = !!contactInfo.email;

  return (
    <footer
      className="bg-black border-t border-[#F6C90E]/20"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      itemScope
      itemType="https://schema.org/LocalBusiness"
    >
      <meta itemProp="name" content="EasyRentCars" />
      <meta itemProp="description" content="Car Rental in Graz, Austria" />
      <link itemProp="url" href="https://easyrentcars.rentals" />

      <div className="container mx-auto px-3 xs:px-4 sm:px-6 py-6 xs:py-8 sm:py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 xs:gap-8 sm:gap-10 md:gap-12 mb-6 xs:mb-8 sm:mb-12">
          <div>
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <Logo variant="footer" className="px-1 max-w-[140px] xs:max-w-[160px] sm:max-w-none" alt="EasyRentCars - Car Rental Graz" />
            </div>

            <div className="flex items-center gap-2 mb-4 xs:mb-5 sm:mb-6">
              <Car className="w-4 h-4 text-[#F6C90E]" />
              <span className="text-[#F6C90E] font-semibold text-sm">Car Rental in Graz, Austria</span>
            </div>

            <p className="text-[#B8B9BB] mb-5 xs:mb-6 sm:mb-8 leading-relaxed text-xs xs:text-sm sm:text-base">
              {t('footer.tagline')}
            </p>

            <div
              className="space-y-3 xs:space-y-4"
              itemProp="address"
              itemScope
              itemType="https://schema.org/PostalAddress"
            >
              {hasAddress && (
                <div className="flex items-start gap-2.5 xs:gap-3 text-[#B8B9BB]">
                  <MapPin className="w-4 xs:w-5 h-4 xs:h-5 text-[#F6C90E] flex-shrink-0 mt-0.5 xs:mt-1" />
                  <div className="min-w-0">
                    <p className="font-semibold text-white text-sm xs:text-base">{t('footer.address')}</p>
                    <p className="text-xs xs:text-sm">
                      {address.street && <span itemProp="streetAddress">{address.street}</span>}
                      {address.street && (address.postalCode || address.city) && ', '}
                      {address.postalCode && <span itemProp="postalCode">{address.postalCode}</span>}
                      {address.postalCode && address.city && ' '}
                      {address.city && <span itemProp="addressLocality">{address.city}</span>}
                      {(address.street || address.postalCode || address.city) && address.country && ', '}
                      {address.country && <span itemProp="addressCountry">{address.country}</span>}
                    </p>
                  </div>
                </div>
              )}

              {hasPhone && (
                <a
                  href={`tel:${phoneForHref}`}
                  className="flex items-start gap-2.5 xs:gap-3 text-[#B8B9BB] p-1.5 -m-1.5 rounded-lg active:bg-white/5 transition-colors touch-manipulation"
                  itemProp="telephone"
                >
                  <Phone className="w-4 xs:w-5 h-4 xs:h-5 text-[#F6C90E] flex-shrink-0 mt-0.5 xs:mt-1" />
                  <div className="min-w-0">
                    <p className="font-semibold text-white text-sm xs:text-base">{t('footer.phone')}</p>
                    <p className="hover:text-[#F6C90E] transition-colors text-xs xs:text-sm">
                      {contactInfo.phone}
                    </p>
                  </div>
                </a>
              )}

              {hasEmail && (
                <a
                  href={`mailto:${contactInfo.email}`}
                  className="flex items-start gap-2.5 xs:gap-3 text-[#B8B9BB] p-1.5 -m-1.5 rounded-lg active:bg-white/5 transition-colors touch-manipulation"
                  itemProp="email"
                >
                  <Mail className="w-4 xs:w-5 h-4 xs:h-5 text-[#F6C90E] flex-shrink-0 mt-0.5 xs:mt-1" />
                  <div className="min-w-0">
                    <p className="font-semibold text-white text-sm xs:text-base">{t('footer.email')}</p>
                    <p className="hover:text-[#F6C90E] transition-colors text-xs xs:text-sm break-all">
                      {contactInfo.email}
                    </p>
                  </div>
                </a>
              )}
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
                { key: 'rentacar', label: 'Rent a Car Graz', action: () => navigate('/rent-a-car-graz') },
                { key: 'carrental', label: 'Car Rental Graz', action: () => navigate('/car-rental-graz') },
                { key: 'cheap', label: 'Cheap Car Rental', action: () => navigate('/cheap-car-rental-graz') },
                { key: 'premium', label: 'Premium Car Rental', action: () => navigate('/premium-car-rental-graz') },
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
            {t('footer.copyright')} | <span className="text-[#F6C90E]">EasyRentCars</span> - Car Rental Graz, Austria
          </p>
          <div className="flex gap-4 sm:gap-6 text-[10px] xs:text-xs sm:text-sm">
            <button
              onClick={() => navigate('/privacy-policy')}
              className="text-[#B8B9BB] hover:text-[#F6C90E] active:text-[#F6C90E] transition-colors py-1 touch-manipulation"
            >
              {t('footer.privacy')}
            </button>
            <button
              onClick={() => navigate('/agb')}
              className="text-[#B8B9BB] hover:text-[#F6C90E] active:text-[#F6C90E] transition-colors py-1 touch-manipulation"
            >
              {t('footer.terms')}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
