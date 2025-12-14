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
      <section className="py-16 sm:py-20 lg:py-32 bg-[#0B0C0F]">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12 max-w-[1440px]">
          <div className="text-center text-[#9AA0A6]">{t('fleet.loading')}</div>
        </div>
      </section>
    );
  }

  return (
    <section id="fleet" className="py-16 sm:py-20 lg:py-32 bg-[#0B0C0F]">
      <div className="container mx-auto px-6 sm:px-8 lg:px-12 max-w-[1440px]">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 sm:mb-16 gap-6">
          <div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              {t('fleet.title')} <span className="text-gradient">{t('fleet.titleSecond')}</span>
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-[#D4AF37] via-[#F4D03F] to-[#D4AF37]" />
          </div>

          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-lg font-semibold text-sm uppercase tracking-wide transition-all ${
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
          <div className="text-center py-12">
            <p className="text-[#9AA0A6] text-lg">
              {pickupDate && returnDate
                ? t('fleet.noAvailable') || 'No vehicles available for selected dates'
                : t('fleet.noCars') || 'No vehicles found'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
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
              className="card-luxury group hover:border-[#D4AF37]/40 transition-all duration-500 hover:shadow-2xl hover:glow-gold cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="relative h-56 sm:h-64 overflow-hidden bg-gradient-to-br from-[#111316] to-[#0B0C0F]">
                <img
                  src={car.images[0] || 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg'}
                  alt={`${car.brand} ${car.model} - ${car.category} Car Rental in Graz`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                  decoding="async"
                  width="600"
                  height="400"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111316] via-transparent to-transparent" />

                {car.is_featured && (
                  <div className="absolute top-4 right-4 px-4 py-1.5 bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-black font-bold text-xs rounded-full uppercase tracking-wide">
                    {t('fleet.featured')}
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="mb-4">
                  <p className="text-[#D4AF37] text-xs font-semibold tracking-widest uppercase mb-1">
                    {car.category}
                  </p>
                  <h3 className="text-2xl font-bold text-white">
                    {car.brand} {car.model}
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
                  <div className="flex items-center gap-2 text-[#9AA0A6]">
                    <Settings className="w-4 h-4 text-[#D4AF37]" />
                    <span>{car.transmission}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#9AA0A6]">
                    <Users className="w-4 h-4 text-[#D4AF37]" />
                    <span>Age: {car.minimum_age}+</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#9AA0A6]">
                    <Users className="w-4 h-4 text-[#D4AF37]" />
                    <span>{car.seats} {t('fleet.seats')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#9AA0A6] relative">
                    <Gauge className="w-4 h-4 text-[#D4AF37]" />
                    <span>200 Km/day</span>
                    <button
                      type="button"
                      onMouseEnter={() => setShowKmTooltip(car.id)}
                      onMouseLeave={() => setShowKmTooltip(null)}
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowKmTooltip(showKmTooltip === car.id ? null : car.id);
                      }}
                      className="ml-1 text-[#D4AF37] hover:text-[#F4D03F] transition-colors"
                      aria-label="Kilometer information"
                    >
                      <Info className="w-3 h-3" />
                    </button>
                    {showKmTooltip === car.id && (
                      <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-[#111316] border border-[#D4AF37]/30 rounded-lg shadow-xl z-50 text-xs">
                        <p className="text-white font-semibold mb-1">{t('benefits.mileageValue')}</p>
                        <p className="text-[#9AA0A6]">
                          {t('benefits.mileageDesc')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-6 border-t border-[#D4AF37]/20 gap-4">
                  <div>
                    <p className="text-xs text-[#9AA0A6] mb-1 uppercase tracking-wide">{t('fleet.perDay')}</p>
                    <p className="text-3xl font-bold text-gradient">
                      €{car.price_per_day}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/car/${car.id}`);
                    }}
                    aria-label={`Reserve ${car.brand} ${car.model}`}
                    className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-black font-bold rounded-lg hover:shadow-xl hover:glow-gold transition-all group text-sm uppercase tracking-wide"
                  >
                    {t('fleet.reserve')}
                    <ArrowRight className="inline-block ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
