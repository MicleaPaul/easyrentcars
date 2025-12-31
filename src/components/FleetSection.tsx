import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Fuel, Users, Info, ArrowRight, Gauge } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';
import { useBooking } from '../contexts/BookingContext';

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  transmission: string;
  fuel_type: string;
  seats: number;
  doors: number;
  luggage: number;
  price_per_day: number;
  minimum_age: number;
  air_conditioning: string;
  category: string;
  images: string[];
  is_featured: boolean;
  status: string;
}

export function FleetSection() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { category, pickupDate, returnDate, getTotalLocationFees } = useBooking();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [availableVehicles, setAvailableVehicles] = useState<string[]>([]);
  const [showKmTooltip, setShowKmTooltip] = useState<string | null>(null);

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    if (category) {
      setSelectedCategory(category);
    }
  }, [category]);

  useEffect(() => {
    if (pickupDate && returnDate) {
      checkAvailability(pickupDate, returnDate);
    } else {
      setAvailableVehicles([]);
    }
  }, [pickupDate, returnDate, vehicles]);

  async function fetchVehicles() {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('status', 'available')
        .order('price_per_day', { ascending: true });

      if (error) throw error;
      setVehicles(data || []);
    } catch (error) {
      // Error fetching vehicles - silent fail
    } finally {
      setLoading(false);
    }
  }

  async function checkAvailability(pickupDate: string, dropoffDate: string) {
    try {
      // Convert date strings to ISO format with time for proper comparison
      const pickupISO = `${pickupDate}T00:00:00Z`;
      const dropoffISO = `${dropoffDate}T23:59:59Z`;

      // Check for overlapping bookings
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('vehicle_id, pickup_date, return_date, booking_status')
        .lt('pickup_date', dropoffISO)
        .gt('return_date', pickupISO)
        .in('booking_status', ['confirmed', 'Confirmed', 'active', 'pending', 'PendingPayment']);

      if (bookingsError) {
        throw bookingsError;
      }

      // Check for vehicle blocks
      const { data: blocks, error: blocksError } = await supabase
        .from('vehicle_blocks')
        .select('vehicle_id, blocked_from, blocked_until, reason')
        .lt('blocked_from', dropoffISO)
        .gt('blocked_until', pickupISO);

      if (blocksError) {
        throw blocksError;
      }

      const bookedVehicleIds = bookings?.map(b => b.vehicle_id) || [];
      const blockedVehicleIds = blocks?.map(b => b.vehicle_id) || [];
      const unavailableVehicleIds = [...new Set([...bookedVehicleIds, ...blockedVehicleIds])];

      const available = vehicles
        .filter(v => !unavailableVehicleIds.includes(v.id))
        .map(v => v.id);

      setAvailableVehicles(available);
    } catch (error) {
      // On error, show all vehicles instead of hiding them
      const allVehicleIds = vehicles.map(v => v.id);
      setAvailableVehicles(allVehicleIds);
    }
  }

  const categories = ['all', 'Economy', 'Standard', 'Premium'];

  let filteredVehicles = selectedCategory === 'all'
    ? vehicles
    : vehicles.filter(v => v.category === selectedCategory);

  if (pickupDate && returnDate) {
    filteredVehicles = filteredVehicles.filter(v => availableVehicles.includes(v.id));
  }

  const locationFees = getTotalLocationFees();

  if (loading) {
    return (
      <section className="py-12 xs:py-16 sm:py-20 lg:py-32 bg-[#0B0C0F]">
        <div className="container mx-auto px-3 xs:px-4 sm:px-8 lg:px-12 max-w-[1440px]">
          <div className="text-center text-[#9AA0A6]">{t('fleet.loading')}</div>
        </div>
      </section>
    );
  }

  return (
    <section id="fleet" className="py-12 xs:py-16 sm:py-20 lg:py-32 bg-[#0B0C0F]">
      <div className="container mx-auto px-3 xs:px-4 sm:px-8 lg:px-12 max-w-[1440px]">
        <div className="flex flex-col items-start justify-between mb-8 xs:mb-10 sm:mb-16 gap-5 xs:gap-6">
          <div>
            <h2 className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4 xs:mb-6">
              {t('fleet.title')} <span className="text-gradient">{t('fleet.titleSecond')}</span>
            </h2>
            <div className="w-16 xs:w-20 h-1 bg-gradient-to-r from-[#D4AF37] via-[#F4D03F] to-[#D4AF37]" />
          </div>

          <div className="flex flex-wrap gap-2 xs:gap-3 w-full sm:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 xs:px-5 py-2 xs:py-2.5 rounded-lg font-semibold text-xs xs:text-sm uppercase tracking-wide transition-all min-h-touch touch-manipulation active:scale-95 ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-black shadow-lg'
                    : 'bg-[#111316] text-[#9AA0A6] border border-[#D4AF37]/20 hover:border-[#D4AF37] hover:text-[#D4AF37]'
                }`}
              >
                {cat === 'all' ? t('fleet.allCars') : t(`category.${cat}`)}
              </button>
            ))}
          </div>
        </div>

        {filteredVehicles.length === 0 ? (
          <div className="text-center py-8 xs:py-12">
            <p className="text-[#9AA0A6] text-base xs:text-lg">
              {pickupDate && returnDate
                ? t('fleet.noAvailable') || 'No vehicles available for selected dates'
                : t('fleet.noCars') || 'No vehicles found'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 xs:gap-5 sm:gap-8">
            {filteredVehicles.map((car) => (
            <div
              key={car.id}
              onClick={() => navigate(`/car/${car.id}`)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate(`/car/${car.id}`);
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={`View details for ${car.brand} ${car.model}`}
              className="card-luxury group hover:border-[#D4AF37]/40 transition-all duration-300 hover:shadow-2xl hover:glow-gold cursor-pointer active:scale-[0.98] touch-manipulation"
            >
              <div className="relative h-48 xs:h-52 sm:h-64 overflow-hidden bg-gradient-to-br from-[#111316] to-[#0B0C0F]">
                <img
                  src={car.images[0] || 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg'}
                  alt={`${car.brand} ${car.model} - ${car.category} Car Rental in Graz`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  decoding="async"
                  width="600"
                  height="400"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111316] via-transparent to-transparent" />

                {car.is_featured && (
                  <div className="absolute top-3 xs:top-4 right-3 xs:right-4 px-3 xs:px-4 py-1 xs:py-1.5 bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-black font-bold text-[10px] xs:text-xs rounded-full uppercase tracking-wide">
                    {t('fleet.featured')}
                  </div>
                )}
              </div>

              <div className="p-4 xs:p-5 sm:p-6">
                <div className="mb-3 xs:mb-4">
                  <p className="text-[#D4AF37] text-[10px] xs:text-xs font-semibold tracking-widest uppercase mb-1">
                    {car.category}
                  </p>
                  <h3 className="text-xl xs:text-2xl font-bold text-white">
                    {car.brand} {car.model}
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-2 xs:gap-3 mb-4 xs:mb-6 text-xs xs:text-sm">
                  <div className="flex items-center gap-1.5 xs:gap-2 text-[#9AA0A6]">
                    <Settings className="w-3.5 xs:w-4 h-3.5 xs:h-4 text-[#D4AF37] flex-shrink-0" />
                    <span className="truncate">{car.transmission}</span>
                  </div>
                  <div className="flex items-center gap-1.5 xs:gap-2 text-[#9AA0A6]">
                    <Users className="w-3.5 xs:w-4 h-3.5 xs:h-4 text-[#D4AF37] flex-shrink-0" />
                    <span>Age: {car.minimum_age}+</span>
                  </div>
                  <div className="flex items-center gap-1.5 xs:gap-2 text-[#9AA0A6]">
                    <Users className="w-3.5 xs:w-4 h-3.5 xs:h-4 text-[#D4AF37] flex-shrink-0" />
                    <span>{car.seats} {t('fleet.seats')}</span>
                  </div>
                  <div className="flex items-center gap-1.5 xs:gap-2 text-[#9AA0A6] relative">
                    <Gauge className="w-3.5 xs:w-4 h-3.5 xs:h-4 text-[#D4AF37] flex-shrink-0" />
                    <span>200 Km</span>
                    <button
                      type="button"
                      onMouseEnter={() => setShowKmTooltip(car.id)}
                      onMouseLeave={() => setShowKmTooltip(null)}
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowKmTooltip(showKmTooltip === car.id ? null : car.id);
                      }}
                      className="ml-0.5 text-[#D4AF37] hover:text-[#F4D03F] transition-colors min-w-[20px] min-h-[20px] flex items-center justify-center touch-manipulation"
                      aria-label="Kilometer information"
                    >
                      <Info className="w-3 h-3" />
                    </button>
                    {showKmTooltip === car.id && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 xs:w-64 p-3 bg-[#111316] border border-[#D4AF37]/30 rounded-lg shadow-xl z-50 text-xs">
                        <p className="text-white font-semibold mb-1">{t('benefits.mileageValue')}</p>
                        <p className="text-[#9AA0A6]">
                          {t('benefits.mileageDesc')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-row items-center justify-between pt-4 xs:pt-6 border-t border-[#D4AF37]/20 gap-3 xs:gap-4">
                  <div className="flex-shrink-0">
                    <p className="text-[10px] xs:text-xs text-[#9AA0A6] mb-0.5 xs:mb-1 uppercase tracking-wide">{t('fleet.perDay')}</p>
                    <p className="text-2xl xs:text-3xl font-bold text-gradient">
                      EUR{car.price_per_day}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/car/${car.id}`);
                    }}
                    aria-label={`Reserve ${car.brand} ${car.model}`}
                    className="flex-1 xs:flex-none px-4 xs:px-6 py-2.5 xs:py-3 bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-black font-bold rounded-lg hover:shadow-xl hover:glow-gold transition-all text-xs xs:text-sm uppercase tracking-wide min-h-touch touch-manipulation active:scale-95 flex items-center justify-center gap-1.5 xs:gap-2"
                  >
                    <span className="hidden xs:inline">{t('fleet.reserve')}</span>
                    <span className="xs:hidden">Book</span>
                    <ArrowRight className="w-3.5 xs:w-4 h-3.5 xs:h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          </div>
        )}
      </div>
    </section>
  );
}
