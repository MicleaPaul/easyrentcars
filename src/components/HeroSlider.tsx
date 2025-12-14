import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface Slide {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  car: string;
  price: number;
}

export function HeroSlider() {
  const { t } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: Slide[] = [
    {
      id: 1,
      image: 'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg',
      title: t('slider.reliableCar'),
      subtitle: t('slider.rentalsInGraz'),
      car: 'Hyundai i30 Automatic',
      price: 59,
    },
    {
      id: 2,
      image: 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg',
      title: t('slider.affordable'),
      subtitle: t('slider.mobility'),
      car: t('slider.startingFrom'),
      price: 49,
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div className="relative h-screen overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('${slide.image}')`,
              filter: 'brightness(0.7)',
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />

          <div className="relative h-full container mx-auto px-6 flex items-center">
            <div className="max-w-2xl">
              <div className="mb-6 flex items-center gap-2">
                <div className="w-12 h-0.5 bg-gradient-to-r from-[#F6C90E] to-transparent" />
                <span className="text-[#F6C90E] text-sm font-semibold tracking-widest">
                  GRAZ, AUSTRIA
                </span>
              </div>

              <h1 className="mb-4">
                <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white leading-none tracking-tight mb-2">
                  {slide.title}
                </div>
                <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-gradient leading-none tracking-tight">
                  {slide.subtitle}
                </div>
              </h1>

              <div className="mb-6">
                <p className="text-[#B8B9BB] text-base sm:text-lg md:text-xl mb-2">{slide.car}</p>
                <p className="text-[#F6C90E] text-2xl sm:text-3xl font-bold">
                  € {slide.price} <span className="text-sm sm:text-base md:text-lg text-[#B8B9BB] font-normal">{t('slider.perDay')}</span>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
                <button className="px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-[#F6C90E] to-[#C9A227] text-black font-bold rounded hover:shadow-2xl hover:shadow-[#F6C90E]/40 transition-all text-sm sm:text-base">
                  {t('slider.rentNow')}
                </button>
                <button className="px-6 py-3 sm:px-8 sm:py-4 bg-transparent border-2 border-[#C9A227] text-[#C9A227] font-bold rounded hover:bg-[#C9A227]/10 transition-all text-sm sm:text-base">
                  {t('slider.viewAllCars')}
                </button>
              </div>

              <div className="mt-12 flex gap-2">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-1 rounded-full transition-all ${
                      index === currentSlide
                        ? 'w-12 bg-[#F6C90E]'
                        : 'w-8 bg-white/30 hover:bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={prevSlide}
        className="absolute left-2 sm:left-4 md:left-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-[#F6C90E] hover:border-[#F6C90E] transition-all group"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:text-black" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-2 sm:right-4 md:right-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-[#F6C90E] hover:border-[#F6C90E] transition-all group"
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:text-black" />
      </button>
    </div>
  );
}
