import { Gauge, MapPin, Truck, Clock } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export function BenefitsSection() {
  const { t } = useLanguage();
  const benefits = [
    {
      icon: Gauge,
      title: t('benefits.mileage'),
      subtitle: t('benefits.mileageValue'),
      description: t('benefits.mileageDesc'),
    },
    {
      icon: MapPin,
      title: t('benefits.pickup'),
      subtitle: t('benefits.pickupValue'),
      description: t('benefits.pickupDesc'),
    },
    {
      icon: Truck,
      title: t('benefits.delivery'),
      subtitle: t('benefits.deliveryValue'),
      description: t('benefits.deliveryDesc'),
    },
    {
      icon: Clock,
      title: t('benefits.support'),
      subtitle: t('benefits.supportValue'),
      description: t('benefits.supportDesc'),
    },
  ];

  return (
    <section className="py-16 sm:py-20 lg:py-32 bg-gradient-to-b from-[#0B0C0F] to-[#111316]">
      <div className="container mx-auto px-6 sm:px-8 lg:px-12 max-w-[1440px]">
        <div className="mb-12 sm:mb-16 text-center">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            {t('benefits.title')} <span className="text-gradient">{t('benefits.titleSecond')}</span>
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-[#D4AF37] via-[#F4D03F] to-[#D4AF37] mx-auto mb-8" />

          <div className="max-w-4xl mx-auto text-[#9AA0A6] leading-relaxed space-y-4">
            <p>
              {t('benefits.description1')}
              {' '}{t('benefits.description2')}
            </p>
            <p>
              {t('benefits.description3')}
              {' '}{t('benefits.description4')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="card-luxury p-6 sm:p-8 hover:border-[#D4AF37]/40 transition-all duration-500 hover:glow-gold group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4AF37]/5 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#F4D03F] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <benefit.icon className="w-8 h-8 sm:w-10 sm:h-10 text-black" />
                </div>

                <div className="mb-4">
                  <p className="text-xs text-[#D4AF37] font-semibold tracking-widest mb-2 uppercase">
                    {benefit.title}
                  </p>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white">{benefit.subtitle}</h3>
                </div>

                <p className="text-[#9AA0A6] text-sm leading-relaxed">{benefit.description}</p>

                <div className="mt-6 w-12 h-1 bg-gradient-to-r from-[#D4AF37] to-transparent group-hover:w-20 transition-all" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
