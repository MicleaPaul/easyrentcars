import { useState } from 'react';
import { Calendar, MapPin, Car } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface SearchFormProps {
  onSearch?: (params: SearchParams) => void;
}

export interface SearchParams {
  category: string;
  pickupDate: string;
  dropoffDate: string;
  location: string;
  locationFee: number;
}

export function SearchForm({ onSearch }: SearchFormProps) {
  const { t } = useLanguage();
  const [category, setCategory] = useState('all');
  const [pickupDate, setPickupDate] = useState('');
  const [dropoffDate, setDropoffDate] = useState('');
  const [location, setLocation] = useState('Firmensitz');

  const minDate = new Date().toISOString().split('T')[0];

  const calculateLocationFee = (selectedLocation: string): number => {
    if (selectedLocation === t('search.trainStation') || selectedLocation === t('search.custom')) {
      return 20;
    }
    return 0;
  };

  const handleSearch = () => {
    if (!pickupDate || !dropoffDate) {
      return;
    }

    const fleetSection = document.getElementById('fleet');
    if (fleetSection) {
      fleetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    if (onSearch) {
      const locationFee = calculateLocationFee(location);
      onSearch({ category, pickupDate, dropoffDate, location, locationFee });
    }
  };

  const isSearchDisabled = !pickupDate || !dropoffDate;

  return (
    <section id="search" className="relative -mt-24 z-20">
      <div className="container mx-auto px-6 sm:px-8 lg:px-12 max-w-[1440px]">
        <div className="card-luxury p-6 sm:p-8 lg:p-10 backdrop-blur-xl bg-[#111316]/95">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="relative">
              <label className="block text-[#9AA0A6] text-sm font-medium mb-3 uppercase tracking-wider">
                {t('search.selectCar')}
              </label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#0B0C0F] text-[#F5F7FA] px-4 py-4 rounded-lg border border-[#D4AF37]/20 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all appearance-none cursor-pointer"
                >
                  <option value="all">{t('search.allCars')}</option>
                  <option value="Economy">{t('search.economy')}</option>
                  <option value="Standard">{t('search.standard')}</option>
                  <option value="Premium">{t('search.premium')}</option>
                </select>
                <Car className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#D4AF37] pointer-events-none" />
              </div>
            </div>

            <div className="relative">
              <label className="block text-[#9AA0A6] text-sm font-medium mb-3 uppercase tracking-wider">
                {t('search.pickupDate')}
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  min={minDate}
                  className="w-full bg-[#0B0C0F] text-[#F5F7FA] px-4 py-4 rounded-lg border border-[#D4AF37]/20 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all"
                />
                <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#D4AF37] pointer-events-none" />
              </div>
            </div>

            <div className="relative">
              <label className="block text-[#9AA0A6] text-sm font-medium mb-3 uppercase tracking-wider">
                {t('search.dropoffDate')}
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={dropoffDate}
                  onChange={(e) => setDropoffDate(e.target.value)}
                  min={pickupDate || minDate}
                  className="w-full bg-[#0B0C0F] text-[#F5F7FA] px-4 py-4 rounded-lg border border-[#D4AF37]/20 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all"
                />
                <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#D4AF37] pointer-events-none" />
              </div>
            </div>

            <div className="relative">
              <label className="block text-[#9AA0A6] text-sm font-medium mb-3 uppercase tracking-wider">
                {t('search.location')}
              </label>
              <div className="relative">
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-[#0B0C0F] text-[#F5F7FA] px-4 py-4 rounded-lg border border-[#D4AF37]/20 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all appearance-none cursor-pointer"
                >
                  <option>{t('search.headquarters')}</option>
                  <option>{t('search.airport')}</option>
                  <option>{t('search.trainStation')}</option>
                  <option>{t('search.custom')}</option>
                </select>
                <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#D4AF37] pointer-events-none" />
              </div>
            </div>
          </div>

          {(location === t('search.trainStation') || location === t('search.custom')) && (
            <div className="mt-6 px-4 py-3 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-lg">
              <p className="text-[#D4AF37] text-sm font-medium">
                ℹ️ {t('search.locationFeeNotice') || 'A 20€ custom location delivery fee will be added to your rental price.'}
              </p>
            </div>
          )}

          <div className="mt-6 sm:mt-8 flex justify-center">
            <button
              onClick={handleSearch}
              disabled={isSearchDisabled}
              className="btn-primary px-12 py-4 sm:px-16 sm:py-5 text-base sm:text-lg font-bold uppercase tracking-wide w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('search.searchCars')}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
