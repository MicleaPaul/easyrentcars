import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings, Fuel, Users, Gauge, Calendar, Shield, DoorOpen } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useBooking } from '../contexts/BookingContext';
import { supabase } from '../lib/supabase';
import { checkVehicleAvailability } from '../lib/availabilityChecker';
import { SEOHead } from '../components/SEOHead';
import { ProductSchema } from '../components/ProductSchema';

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
}

interface CarDetailsPageProps {
  onBack: () => void;
}

export function CarDetailsPage({ onBack }: CarDetailsPageProps) {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const {
    pickupDate: contextPickupDate,
    returnDate: contextReturnDate,
    setPickupDate: setContextPickupDate,
    setReturnDate: setContextReturnDate
  } = useBooking();
  const [car, setCar] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [pickupDate, setPickupDate] = useState(contextPickupDate || '');
  const [dropoffDate, setDropoffDate] = useState(contextReturnDate || '');
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCarDetails(id);
    }
  }, [id]);

  async function fetchCarDetails(carId: string) {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', carId)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setCar(data);
      }
    } catch (error) {
      // Error fetching car details
    } finally {
      setLoading(false);
    }
  }

  const handleBooking = async () => {
    if (!pickupDate || !dropoffDate) {
      alert(t('carDetails.selectDatesAlert') || 'Please select pickup and return dates');
      return;
    }

    const days = calculateDays();

    if (days <= 0) {
      alert(t('carDetails.invalidDatesAlert') || 'Return date must be after pickup date');
      return;
    }

    if (!id) return;

    setCheckingAvailability(true);

    try {
      const availabilityResult = await checkVehicleAvailability(id, pickupDate, dropoffDate);

      if (!availabilityResult.isAvailable) {
        const message = availabilityResult.conflictType === 'booking'
          ? t('availability.alreadyBooked') || 'This vehicle is already booked for the selected period. Please choose different dates or another vehicle.'
          : t('availability.vehicleBlocked') || 'This vehicle is not available for the selected period. Please choose different dates or another vehicle.';

        alert(message);
        return;
      }

      setContextPickupDate(pickupDate);
      setContextReturnDate(dropoffDate);
      navigate(`/booking/${id}`);
    } catch (error) {
      alert(t('availability.checkError') || 'An error occurred while checking availability. Please try again.');
    } finally {
      setCheckingAvailability(false);
    }
  };

  const calculateDays = () => {
    if (!pickupDate || !dropoffDate) return 0;
    const start = new Date(pickupDate);
    const end = new Date(dropoffDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const totalPrice = car ? calculateDays() * car.price_per_day : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0C0F] pt-20 xs:pt-24 pb-16">
        <div className="container mx-auto px-3 xs:px-4 sm:px-8 lg:px-12 max-w-[1440px]">
          <div className="text-center text-[#9AA0A6] py-12">{t('carDetails.loading')}</div>
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-[#0B0C0F] pt-20 xs:pt-24 pb-16">
        <div className="container mx-auto px-3 xs:px-4 sm:px-8 lg:px-12 max-w-[1440px]">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[#D4AF37] hover:text-[#F4D03F] transition-colors mb-6 xs:mb-8 group min-h-touch touch-manipulation"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-semibold uppercase tracking-wide text-xs xs:text-sm">{t('carDetails.backToFleet')}</span>
          </button>
          <div className="text-center text-[#9AA0A6] py-12">{t('carDetails.notFound')}</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title={`${car.brand} ${car.model} ${car.year} - Car Rental Graz | EasyRentCars`}
        description={`Rent ${car.brand} ${car.model} ${car.year} in Graz. ${car.category} with ${car.seats} seats, ${car.transmission} transmission, ${car.fuel_type}. Starting from EUR${car.price_per_day}/day. Book now!`}
        ogTitle={`${car.brand} ${car.model} ${car.year} - Available for Rent`}
        ogDescription={`${car.category} • ${car.seats} seats • ${car.transmission} • EUR${car.price_per_day}/day`}
        ogImage={car.images[0] || 'https://easyrentcars.rentals/og-image.jpg'}
        canonicalUrl={`https://easyrentcars.rentals/car/${id}`}
      />
      <ProductSchema
        name={`${car.brand} ${car.model} ${car.year}`}
        description={`${car.category} rental car with ${car.seats} seats, ${car.transmission} transmission, and ${car.fuel_type}. Perfect for rent in Graz, Austria.`}
        image={car.images}
        brand={car.brand}
        model={car.model}
        year={car.year}
        price={car.price_per_day}
        availability="InStock"
        url={`https://easyrentcars.rentals/car/${id}`}
      />
      <div className="min-h-screen bg-[#0B0C0F] pt-20 xs:pt-24 pb-24 lg:pb-16">
        <div className="container mx-auto px-3 xs:px-4 sm:px-8 lg:px-12 max-w-[1440px]">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[#D4AF37] hover:text-[#F4D03F] transition-colors mb-5 xs:mb-8 group min-h-touch touch-manipulation active:opacity-70"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-semibold uppercase tracking-wide text-xs xs:text-sm">{t('carDetails.backToFleet')}</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 xs:gap-6 lg:gap-12">
          <div className="lg:col-span-2 space-y-4 xs:space-y-6">
            <div className="card-luxury overflow-hidden">
              <div className="relative aspect-[16/10] xs:aspect-video bg-gradient-to-br from-[#111316] to-[#0B0C0F]">
                <img
                  src={car.images[selectedImage] || 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg'}
                  alt={`${car.brand} ${car.model} ${car.year} - View ${selectedImage + 1} of ${car.images.length}`}
                  className="w-full h-full object-cover"
                  loading="eager"
                  fetchPriority="high"
                  width="1200"
                  height="675"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111316]/50 to-transparent" />
              </div>

              {car.images.length > 1 && (
                <div className="p-3 xs:p-4 flex gap-2 xs:gap-3 overflow-x-auto scrollbar-hide">
                  {car.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`flex-shrink-0 w-20 xs:w-24 h-14 xs:h-16 rounded-lg overflow-hidden border-2 transition-all touch-manipulation active:scale-95 ${
                        selectedImage === idx
                          ? 'border-[#D4AF37] scale-105'
                          : 'border-[#D4AF37]/20 hover:border-[#D4AF37]/50'
                      }`}
                    >
                      <img src={img} alt={`${car.brand} ${car.model} thumbnail ${idx + 1}`} className="w-full h-full object-cover" loading="lazy" width="96" height="64" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="card-luxury p-4 xs:p-5 sm:p-8">
              <div className="mb-4 xs:mb-6">
                <p className="text-[#D4AF37] text-[10px] xs:text-xs font-semibold tracking-widest uppercase mb-1 xs:mb-2">
                  {car.category}
                </p>
                <h1 className="text-3xl xs:text-4xl sm:text-5xl font-bold text-white mb-1 xs:mb-2">
                  {car.brand} {car.model}
                </h1>
                <p className="text-[#9AA0A6] text-base xs:text-lg">{car.year}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 xs:gap-4 mb-6 xs:mb-8">
                <div className="flex items-center gap-2 xs:gap-3 text-[#9AA0A6]">
                  <div className="w-9 xs:w-10 h-9 xs:h-10 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0">
                    <Settings className="w-4 xs:w-5 h-4 xs:h-5 text-[#D4AF37]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] xs:text-xs text-[#9AA0A6]">{t('carDetails.transmission')}</p>
                    <p className="text-white font-semibold text-sm xs:text-base truncate">{car.transmission}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 xs:gap-3 text-[#9AA0A6]">
                  <div className="w-9 xs:w-10 h-9 xs:h-10 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0">
                    <Fuel className="w-4 xs:w-5 h-4 xs:h-5 text-[#D4AF37]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] xs:text-xs text-[#9AA0A6]">{t('carDetails.fuel')}</p>
                    <p className="text-white font-semibold text-sm xs:text-base truncate">{car.fuel_type}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 xs:gap-3 text-[#9AA0A6]">
                  <div className="w-9 xs:w-10 h-9 xs:h-10 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 xs:w-5 h-4 xs:h-5 text-[#D4AF37]" />
                  </div>
                  <div>
                    <p className="text-[10px] xs:text-xs text-[#9AA0A6]">{t('carDetails.seats')}</p>
                    <p className="text-white font-semibold text-sm xs:text-base">{car.seats}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 xs:gap-3 text-[#9AA0A6]">
                  <div className="w-9 xs:w-10 h-9 xs:h-10 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0">
                    <DoorOpen className="w-4 xs:w-5 h-4 xs:h-5 text-[#D4AF37]" />
                  </div>
                  <div>
                    <p className="text-[10px] xs:text-xs text-[#9AA0A6]">{t('carDetails.doors')}</p>
                    <p className="text-white font-semibold text-sm xs:text-base">{car.doors}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 xs:gap-3 text-[#9AA0A6]">
                  <div className="w-9 xs:w-10 h-9 xs:h-10 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0">
                    <Gauge className="w-4 xs:w-5 h-4 xs:h-5 text-[#D4AF37]" />
                  </div>
                  <div>
                    <p className="text-[10px] xs:text-xs text-[#9AA0A6]">{t('carDetails.luggage')}</p>
                    <p className="text-white font-semibold text-sm xs:text-base">{car.luggage} {t('carDetails.bags')}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 xs:gap-3 text-[#9AA0A6]">
                  <div className="w-9 xs:w-10 h-9 xs:h-10 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 xs:w-5 h-4 xs:h-5 text-[#D4AF37]" />
                  </div>
                  <div>
                    <p className="text-[10px] xs:text-xs text-[#9AA0A6]">{t('carDetails.minAge')}</p>
                    <p className="text-white font-semibold text-sm xs:text-base">{car.minimum_age}+</p>
                  </div>
                </div>
              </div>

              <div className="mb-4 xs:mb-6 p-3 xs:p-4 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/20">
                <p className="text-white font-semibold mb-1 xs:mb-2 text-sm xs:text-base">{t('carDetails.airConditioning')}</p>
                <p className="text-[#9AA0A6] text-xs xs:text-sm">{car.air_conditioning}</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 hidden lg:block">
            <div className="card-luxury p-6 sm:p-8 sticky top-24 space-y-6">
              <div className="pb-6 border-b border-[#D4AF37]/20">
                <p className="text-xs text-[#9AA0A6] mb-2 uppercase tracking-wide">{t('carDetails.pricePerDay')}</p>
                <p className="text-5xl font-bold text-gradient">EUR{car.price_per_day}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[#9AA0A6] text-sm font-medium mb-2 uppercase tracking-wider">
                    {t('carDetails.pickupDate')}
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full bg-[#0B0C0F] text-[#F5F7FA] px-4 py-3 rounded-lg border border-[#D4AF37]/20 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all min-h-[50px]"
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#D4AF37] pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-[#9AA0A6] text-sm font-medium mb-2 uppercase tracking-wider">
                    {t('carDetails.dropoffDate')}
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={dropoffDate}
                      onChange={(e) => setDropoffDate(e.target.value)}
                      min={pickupDate || new Date().toISOString().split('T')[0]}
                      className="w-full bg-[#0B0C0F] text-[#F5F7FA] px-4 py-3 rounded-lg border border-[#D4AF37]/20 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all min-h-[50px]"
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#D4AF37] pointer-events-none" />
                  </div>
                </div>
              </div>

              {calculateDays() > 0 && (
                <div className="p-5 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/20">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[#9AA0A6] text-sm">{t('carDetails.rentalDays')}</span>
                      <span className="text-white font-semibold">{calculateDays()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#9AA0A6] text-sm">{t('carDetails.pricePerDay')}</span>
                      <span className="text-white font-semibold">EUR{car.price_per_day}</span>
                    </div>
                    <div className="pt-4 mt-4 border-t border-[#D4AF37]/30 flex justify-between items-center">
                      <span className="text-white font-bold text-lg">{t('carDetails.rentalCost') || 'Rental Cost'}</span>
                      <span className="text-3xl font-bold text-gradient">
                        EUR{totalPrice}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleBooking}
                disabled={!pickupDate || !dropoffDate || checkingAvailability}
                className="w-full btn-primary py-4 text-base font-semibold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.02]"
              >
                {checkingAvailability
                  ? (t('availability.checking') || 'Checking availability...')
                  : t('carDetails.reserveNow')
                }
              </button>
            </div>
          </div>

          <div className="lg:hidden card-luxury p-4 xs:p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] xs:text-xs text-[#9AA0A6] uppercase tracking-wide">{t('carDetails.pricePerDay')}</p>
                <p className="text-3xl xs:text-4xl font-bold text-gradient">EUR{car.price_per_day}</p>
              </div>
              {calculateDays() > 0 && (
                <div className="text-right">
                  <p className="text-[10px] xs:text-xs text-[#9AA0A6]">{calculateDays()} {calculateDays() === 1 ? 'day' : 'days'}</p>
                  <p className="text-xl xs:text-2xl font-bold text-white">EUR{totalPrice}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-[#9AA0A6] text-[10px] xs:text-xs font-medium mb-1.5 uppercase tracking-wider">
                  {t('carDetails.pickupDate')}
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full bg-[#0B0C0F] text-[#F5F7FA] px-3 py-2.5 xs:py-3 rounded-lg border border-[#D4AF37]/20 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all text-sm min-h-[48px] touch-manipulation"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#9AA0A6] text-[10px] xs:text-xs font-medium mb-1.5 uppercase tracking-wider">
                  {t('carDetails.dropoffDate')}
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={dropoffDate}
                    onChange={(e) => setDropoffDate(e.target.value)}
                    min={pickupDate || new Date().toISOString().split('T')[0]}
                    className="w-full bg-[#0B0C0F] text-[#F5F7FA] px-3 py-2.5 xs:py-3 rounded-lg border border-[#D4AF37]/20 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all text-sm min-h-[48px] touch-manipulation"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleBooking}
              disabled={!pickupDate || !dropoffDate || checkingAvailability}
              className="w-full btn-primary py-3.5 xs:py-4 text-sm xs:text-base font-semibold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed transition-all min-h-[52px] touch-manipulation active:scale-[0.98]"
            >
              {checkingAvailability
                ? (t('availability.checking') || 'Checking...')
                : t('carDetails.reserveNow')
              }
            </button>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
