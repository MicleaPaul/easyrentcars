import { useNavigate } from 'react-router-dom';
import { Car, Shield, Clock, MapPin, Phone, Calendar, CheckCircle } from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { useLanguage } from '../contexts/LanguageContext';

export function RentACarGrazPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleScrollToSection = (sectionId: string) => {
    navigate('/');
    setTimeout(() => {
      const section = document.getElementById(sectionId);
      if (section) {
        const headerOffset = 100;
        const elementPosition = section.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }, 100);
  };

  return (
    <>
      <SEOHead
        title={t('rentACar.seo.title')}
        description={t('rentACar.seo.description')}
        ogTitle={t('rentACar.seo.ogTitle')}
        ogDescription={t('rentACar.seo.ogDescription')}
        canonicalUrl="https://easyrentcars.rentals/rent-a-car-graz"
      />

      <div className="min-h-screen bg-[#0B0C0F] pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-[1200px]">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              {t('rentACar.title')}
              <span className="block text-[#D4AF37] mt-2">{t('rentACar.subtitle')}</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              {t('rentACar.hero.description')}
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            <button
              onClick={() => handleScrollToSection('search')}
              className="btn-primary px-8 py-4 text-lg"
            >
              <Calendar className="w-5 h-5 mr-2 inline" />
              {t('rentACar.cta.bookNow')}
            </button>
            <button
              onClick={() => handleScrollToSection('fleet')}
              className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-lg text-lg transition-all"
            >
              <Car className="w-5 h-5 mr-2 inline" />
              {t('rentACar.cta.viewFleet')}
            </button>
            <a
              href="tel:+436643408887"
              className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-lg text-lg transition-all inline-block"
            >
              <Phone className="w-5 h-5 mr-2 inline" />
              {t('rentACar.cta.callNow')}
            </a>
          </div>

          {/* Main Content */}
          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-white">
                {t('rentACar.why.title')}
              </h2>
              <p className="text-gray-300 leading-relaxed">
                {t('rentACar.why.para1')}
              </p>
              <p className="text-gray-300 leading-relaxed">
                {t('rentACar.why.para2')}
              </p>
              <p className="text-gray-300 leading-relaxed">
                {t('rentACar.why.para3')}
              </p>
            </div>

            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-white">
                {t('rentACar.locations.title')}
              </h2>
              <p className="text-gray-300 leading-relaxed">
                {t('rentACar.locations.para1')}
              </p>
              <p className="text-gray-300 leading-relaxed">
                {t('rentACar.locations.para2')}
              </p>
              <p className="text-gray-300 leading-relaxed">
                {t('rentACar.locations.para3')}
              </p>
            </div>
          </div>

          {/* Benefits Grid */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              {t('rentACar.benefits.title')}
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white/5 p-6 rounded-lg border border-[#D4AF37]/20">
                <Shield className="w-12 h-12 text-[#D4AF37] mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">{t('rentACar.benefit1.title')}</h3>
                <p className="text-gray-300">
                  {t('rentACar.benefit1.desc')}
                </p>
              </div>
              <div className="bg-white/5 p-6 rounded-lg border border-[#D4AF37]/20">
                <Clock className="w-12 h-12 text-[#D4AF37] mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">{t('rentACar.benefit2.title')}</h3>
                <p className="text-gray-300">
                  {t('rentACar.benefit2.desc')}
                </p>
              </div>
              <div className="bg-white/5 p-6 rounded-lg border border-[#D4AF37]/20">
                <MapPin className="w-12 h-12 text-[#D4AF37] mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">{t('rentACar.benefit3.title')}</h3>
                <p className="text-gray-300">
                  {t('rentACar.benefit3.desc')}
                </p>
              </div>
              <div className="bg-white/5 p-6 rounded-lg border border-[#D4AF37]/20">
                <Car className="w-12 h-12 text-[#D4AF37] mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">{t('rentACar.benefit4.title')}</h3>
                <p className="text-gray-300">
                  {t('rentACar.benefit4.desc')}
                </p>
              </div>
              <div className="bg-white/5 p-6 rounded-lg border border-[#D4AF37]/20">
                <CheckCircle className="w-12 h-12 text-[#D4AF37] mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">{t('rentACar.benefit5.title')}</h3>
                <p className="text-gray-300">
                  {t('rentACar.benefit5.desc')}
                </p>
              </div>
              <div className="bg-white/5 p-6 rounded-lg border border-[#D4AF37]/20">
                <Phone className="w-12 h-12 text-[#D4AF37] mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">{t('rentACar.benefit6.title')}</h3>
                <p className="text-gray-300">
                  {t('rentACar.benefit6.desc')}
                </p>
              </div>
            </div>
          </div>

          {/* Internal Links Section */}
          <div className="bg-white/5 p-8 rounded-lg border border-[#D4AF37]/20 mb-16">
            <h2 className="text-2xl font-bold text-white mb-6">{t('rentACar.explore.title')}</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={() => navigate('/car-rental-graz')}
                className="text-left p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
              >
                <h3 className="text-lg font-semibold text-[#D4AF37] mb-2">{t('rentACar.link1.title')}</h3>
                <p className="text-gray-300 text-sm">{t('rentACar.link1.desc')}</p>
              </button>
              <button
                onClick={() => navigate('/cheap-car-rental-graz')}
                className="text-left p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
              >
                <h3 className="text-lg font-semibold text-[#D4AF37] mb-2">{t('rentACar.link2.title')}</h3>
                <p className="text-gray-300 text-sm">{t('rentACar.link2.desc')}</p>
              </button>
              <button
                onClick={() => navigate('/premium-car-rental-graz')}
                className="text-left p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
              >
                <h3 className="text-lg font-semibold text-[#D4AF37] mb-2">{t('rentACar.link3.title')}</h3>
                <p className="text-gray-300 text-sm">{t('rentACar.link3.desc')}</p>
              </button>
              <button
                onClick={() => handleScrollToSection('contact')}
                className="text-left p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
              >
                <h3 className="text-lg font-semibold text-[#D4AF37] mb-2">{t('rentACar.link4.title')}</h3>
                <p className="text-gray-300 text-sm">{t('rentACar.link4.desc')}</p>
              </button>
            </div>
          </div>

          {/* Final CTA */}
          <div className="text-center bg-gradient-to-r from-[#D4AF37]/20 to-[#D4AF37]/10 p-12 rounded-lg">
            <h2 className="text-3xl font-bold text-white mb-4">
              {t('rentACar.finalCta.title')}
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              {t('rentACar.finalCta.desc')}
            </p>
            <button
              onClick={() => handleScrollToSection('search')}
              className="btn-primary px-10 py-4 text-lg"
            >
              {t('rentACar.finalCta.button')}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
