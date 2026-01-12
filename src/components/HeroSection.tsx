import { useLanguage } from '../contexts/LanguageContext';

export function HeroSection() {
  const { t } = useLanguage();

  const handleBookNow = () => {
    const searchSection = document.getElementById('search');
    if (searchSection) {
      searchSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden pt-16 xs:pt-20" aria-label="Hero banner">
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.pexels.com/photos/3764984/pexels-photo-3764984.jpeg?auto=compress&cs=tinysrgb&w=1920&dpr=1"
          srcSet="https://images.pexels.com/photos/3764984/pexels-photo-3764984.jpeg?auto=compress&cs=tinysrgb&w=600&dpr=1 600w,
                  https://images.pexels.com/photos/3764984/pexels-photo-3764984.jpeg?auto=compress&cs=tinysrgb&w=800&dpr=1 800w,
                  https://images.pexels.com/photos/3764984/pexels-photo-3764984.jpeg?auto=compress&cs=tinysrgb&w=1200&dpr=1 1200w,
                  https://images.pexels.com/photos/3764984/pexels-photo-3764984.jpeg?auto=compress&cs=tinysrgb&w=1920&dpr=1 1920w"
          sizes="100vw"
          alt="Luxury Car Interior - Premium Car Rental in Graz, Austria"
          className="w-full h-full object-cover"
          loading="eager"
          fetchPriority="high"
          width="1920"
          height="1080"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B0C0F]/85 via-[#0B0C0F]/65 to-[#0B0C0F]" />
      </div>

      <div className="container mx-auto px-4 xs:px-5 sm:px-8 lg:px-12 relative z-10 max-w-[1440px]">
        <div className="text-center mb-8 xs:mb-10 sm:mb-16 animate-fadeIn">
          <h1 className="font-bold text-white mb-3 xs:mb-4 sm:mb-6 tracking-tight leading-[1.1]">
            {t('hero.title')}<br />
            <span className="text-gradient">{t('hero.titleHighlight')}</span>
          </h1>

          <p className="text-white/90 text-base xs:text-lg sm:text-xl max-w-2xl mx-auto mb-6 xs:mb-8 sm:mb-12 leading-relaxed drop-shadow-lg px-2">
            {t('hero.subtitle')}
          </p>

          <button
            onClick={handleBookNow}
            className="btn-primary w-full xs:w-auto px-6 xs:px-8 py-4 sm:px-12 sm:py-5 text-base sm:text-lg font-bold uppercase tracking-wide touch-manipulation active:scale-[0.98] transition-transform min-h-[52px]"
          >
            {t('hero.cta')}
          </button>
        </div>
      </div>
    </section>
  );
}
