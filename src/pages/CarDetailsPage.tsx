import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings, Fuel, Users, Gauge, Calendar, Shield, DoorOpen } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useBooking } from '../contexts/BookingContext';
import { supabase } from '../lib/supabase';
import { checkVehicleAvailability } from '../lib/availabilityChecker';

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
      <div className="min-h-screen bg-[#0B0C0F] pt-24 pb-16">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12 max-w-[1440px]">
          <div className="text-center text-[#9AA0A6] py-12">{t('carDetails.loading')}</div>
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-[#0B0C0F] pt-24 pb-16">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12 max-w-[1440px]">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[#D4AF37] hover:text-[#F4D03F] transition-colors mb-8 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-semibold uppercase tracking-wide text-sm">{t('carDetails.backToFleet')}</span>
          </button>
          <div className="text-center text-[#9AA0A6] py-12">{t('carDetails.notFound')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0C0F] pt-24 pb-16">
      <div className="container mx-auto px-6 sm:px-8 lg:px-12 max-w-[1440px]">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[#D4AF37] hover:text-[#F4D03F] transition-colors mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-semibold uppercase tracking-wide text-sm">{t('carDetails.backToFleet')}</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          <div className="lg:col-span-2 space-y-6">
            <div className="card-luxury overflow-hidden">
              <div className="relative aspect-video bg-gradient-to-br from-[#111316] to-[#0B0C0F]">
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
                <div className="p-4 flex gap-3 overflow-x-auto">
                  {car.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden border-2 transition-all ${
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

            <div className="card-luxury p-6 sm:p-8">
              <div className="mb-6">
                <p className="text-[#D4AF37] text-xs font-semibold tracking-widest uppercase mb-2">
                  {car.category}
                </p>
                <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
                  {car.brand} {car.model}
                </h1>
                <p className="text-[#9AA0A6] text-lg">{car.year}</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                <div className="flex items-center gap-3 text-[#9AA0A6]">
                  <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center">
                    <Settings className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#9AA0A6]">{t('carDetails.transmission')}</p>
                    <p className="text-white font-semibold">{car.transmission}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[#9AA0A6]">
                  <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center">
                    <Fuel className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#9AA0A6]">{t('carDetails.fuel')}</p>
                    <p className="text-white font-semibold">{car.fuel_type}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[#9AA0A6]">
                  <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#9AA0A6]">{t('carDetails.seats')}</p>
                    <p className="text-white font-semibold">{car.seats}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[#9AA0A6]">
                  <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center">
                    <DoorOpen className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#9AA0A6]">{t('carDetails.doors')}</p>
                    <p className="text-white font-semibold">{car.doors}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[#9AA0A6]">
                  <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center">
                    <Gauge className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#9AA0A6]">{t('carDetails.luggage')}</p>
                    <p className="text-white font-semibold">{car.luggage} {t('carDetails.bags')}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[#9AA0A6]">
                  <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#9AA0A6]">{t('carDetails.minAge')}</p>
                    <p className="text-white font-semibold">{car.minimum_age}+</p>
                  </div>
                </div>
              </div>

              <div className="mb-6 p-4 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/20">
                <p className="text-white font-semibold mb-2">{t('carDetails.airConditioning')}</p>
                <p className="text-[#9AA0A6] text-sm">{car.air_conditioning}</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="card-luxury p-6 sm:p-8 sticky top-24 space-y-6">
              <div className="pb-6 border-b border-[#D4AF37]/20">
                <p className="text-xs text-[#9AA0A6] mb-2 uppercase tracking-wide">{t('carDetails.pricePerDay')}</p>
                <p className="text-5xl font-bold text-gradient">€{car.price_per_day}</p>
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
                      className="w-full bg-[#0B0C0F] text-[#F5F7FA] px-4 py-3 rounded-lg border border-[#D4AF37]/20 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all"
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
                      className="w-full bg-[#0B0C0F] text-[#F5F7FA] px-4 py-3 rounded-lg border border-[#D4AF37]/20 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all"
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
                      <span className="text-white font-semibold">€{car.price_per_day}</span>
                    </div>
                    <div className="pt-4 mt-4 border-t border-[#D4AF37]/30 flex justify-between items-center">
                      <span className="text-white font-bold text-lg">{t('carDetails.rentalCost') || 'Rental Cost'}</span>
                      <span className="text-3xl font-bold text-gradient">
                        €{totalPrice}
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
        </div>
      </div>
    </div>
  );
}
