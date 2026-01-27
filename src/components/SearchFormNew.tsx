import { Calendar, Car } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useBooking } from '../contexts/BookingContext';

interface SearchFormNewProps {
  onSearch?: () => void;
}

export function SearchFormNew({ onSearch }: SearchFormNewProps) {
  const { t } = useLanguage();
  const {
    category,
    setCategory,
    pickupDate,
    setPickupDate,
    returnDate,
    setReturnDate,
  } = useBooking();

  const minDate = new Date().toISOString().split('T')[0];

  const handleSearch = () => {
    if (!pickupDate || !returnDate) {
      return;
    }

    const fleetSection = document.getElementById('fleet');
    if (fleetSection) {
      fleetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    if (onSearch) {
      onSearch();
    }
  };

  const isSearchDisabled = !pickupDate || !returnDate;

  return (
    <section id="search" className="relative -mt-16 xs:-mt-20 sm:-mt-24 z-20">
      <div className="container mx-auto px-3 xs:px-4 sm:px-8 lg:px-12 max-w-[1440px]">
        <div className="card-luxury p-4 xs:p-5 sm:p-8 lg:p-10 backdrop-blur-xl bg-[#111316]/95">
          <div className="grid grid-cols-1 gap-4 xs:gap-5 sm:gap-6 md:grid-cols-3 md:gap-8">
            <div className="relative">
              <label className="block text-[#9AA0A6] text-xs xs:text-sm font-medium mb-2 xs:mb-3 uppercase tracking-wider">
                {t('search.selectCar')}
              </label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#0B0C0F] text-[#F5F7FA] px-3 xs:px-4 py-3.5 xs:py-4 rounded-lg border border-[#D4AF37]/20 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all appearance-none cursor-pointer min-h-[50px] touch-manipulation"
                >
                  <option value="all">{t('search.allCars')}</option>
                  <option value="Economy">{t('search.economy')}</option>
                  <option value="Standard">{t('search.standard')}</option>
                  <option value="Premium">{t('search.premium')}</option>
                </select>
                <Car className="absolute right-3 xs:right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#D4AF37] pointer-events-none" />
              </div>
            </div>

            <div className="relative">
              <label className="block text-[#9AA0A6] text-xs xs:text-sm font-medium mb-2 xs:mb-3 uppercase tracking-wider">
                {t('search.pickupDate')}
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  min={minDate}
                  className="w-full bg-[#0B0C0F] text-[#F5F7FA] px-3 xs:px-4 py-3.5 xs:py-4 rounded-lg border border-[#D4AF37]/20 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all min-h-[50px] touch-manipulation"
                />
                <Calendar className="absolute right-3 xs:right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#D4AF37] pointer-events-none" />
              </div>
            </div>

            <div className="relative">
              <label className="block text-[#9AA0A6] text-xs xs:text-sm font-medium mb-2 xs:mb-3 uppercase tracking-wider">
                {t('search.dropoffDate')}
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  min={pickupDate || minDate}
                  className="w-full bg-[#0B0C0F] text-[#F5F7FA] px-3 xs:px-4 py-3.5 xs:py-4 rounded-lg border border-[#D4AF37]/20 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all min-h-[50px] touch-manipulation"
                />
                <Calendar className="absolute right-3 xs:right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#D4AF37] pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="mt-5 xs:mt-6 sm:mt-8">
            <div className="flex justify-center mb-3">
              <button
                onClick={handleSearch}
                disabled={isSearchDisabled}
                className="btn-primary px-8 xs:px-12 py-4 sm:px-16 sm:py-5 text-base sm:text-lg font-bold uppercase tracking-wide w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed min-h-[52px] touch-manipulation active:scale-[0.98] transition-transform"
              >
                {t('search.searchCars')}
              </button>
            </div>
            <p className="text-center text-[#9AA0A6] text-xs sm:text-sm">
              {t('booking.sameDayAllowed')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
