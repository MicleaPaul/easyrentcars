import { useState } from 'react';
import { ArrowLeft, Settings, Fuel, Users, Gauge, Calendar, Shield, MapPin } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface CarDetailsProps {
  carId: string;
  onBack: () => void;
  onBook: (carId: string, dates: { pickup: string; dropoff: string }) => void;
}

export function CarDetails({ carId, onBack, onBook }: CarDetailsProps) {
  const { t } = useLanguage();
  const [selectedImage, setSelectedImage] = useState(0);
  const [pickupDate, setPickupDate] = useState('');
  const [dropoffDate, setDropoffDate] = useState('');

  const car = {
    id: carId,
    brand: 'Audi',
    model: 'Q3',
    year: 2021,
    images: [
      'https://images.pexels.com/photos/3802508/pexels-photo-3802508.jpeg',
      'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg',
      'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg',
    ],
    price_per_day: 98,
    minimum_age: 25,
    transmission: 'Manual',
    fuel_type: 'Diesel',
    seats: 5,
    doors: 5,
    luggage: 3,
    category: 'Premium',
    features: [
      'Air Conditioning',
      'Bluetooth',
      'Navigation System',
      'Parking Sensors',
      'Cruise Control',
      'USB Charging',
    ],
  };

  const handleBooking = () => {
    if (pickupDate && dropoffDate) {
      onBook(carId, { pickup: pickupDate, dropoff: dropoffDate });
    }
  };

  const calculateDays = () => {
    if (!pickupDate || !dropoffDate) return 0;
    const start = new Date(pickupDate);
    const end = new Date(dropoffDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const totalPrice = calculateDays() * car.price_per_day;

  return (
    <div className="min-h-screen bg-[#0B0C0F] pt-24 pb-16">
      <div className="container mx-auto px-6 sm:px-8 lg:px-12 max-w-[1440px]">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[#D4AF37] hover:text-[#F4D03F] transition-colors mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-semibold uppercase tracking-wide text-sm">Back to Fleet</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          <div className="lg:col-span-2 space-y-6">
            <div className="card-luxury overflow-hidden">
              <div className="relative aspect-video bg-gradient-to-br from-[#111316] to-[#0B0C0F]">
                <img
                  src={car.images[selectedImage]}
                  alt={`${car.brand} ${car.model}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111316]/50 to-transparent" />
              </div>

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
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div className="card-luxury p-6 sm:p-8">
              <div className="mb-6">
                <p className="text-[#D4AF37] text-xs font-semibold tracking-widest uppercase mb-2">
                  {car.category}
                </p>
                <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
                  {car.brand} {car.model}
                </h1>
                {car.year && (
                  <p className="text-[#9AA0A6] text-lg">{car.year}</p>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                <div className="flex items-center gap-3 text-[#9AA0A6]">
                  <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center">
                    <Settings className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#9AA0A6]">Transmission</p>
                    <p className="text-white font-semibold">{car.transmission}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[#9AA0A6]">
                  <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center">
                    <Fuel className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#9AA0A6]">Fuel</p>
                    <p className="text-white font-semibold">{car.fuel_type}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[#9AA0A6]">
                  <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#9AA0A6]">Seats</p>
                    <p className="text-white font-semibold">{car.seats}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[#9AA0A6]">
                  <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center">
                    <Gauge className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#9AA0A6]">Luggage</p>
                    <p className="text-white font-semibold">{car.luggage} Bags</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[#9AA0A6]">
                  <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#9AA0A6]">Min Age</p>
                    <p className="text-white font-semibold">{car.minimum_age}+</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-4">Features</h3>
                <div className="grid grid-cols-2 gap-3">
                  {car.features.map((feature, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-[#9AA0A6] text-sm"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="card-luxury p-6 sm:p-8 sticky top-24">
              <div className="mb-6 pb-6 border-b border-[#D4AF37]/20">
                <p className="text-xs text-[#9AA0A6] mb-2 uppercase tracking-wide">Price per Day</p>
                <p className="text-5xl font-bold text-gradient">€{car.price_per_day}</p>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-[#9AA0A6] text-sm font-medium mb-2 uppercase tracking-wider">
                    Pick-up Date
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
                    Drop-off Date
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

                <div>
                  <label className="block text-[#9AA0A6] text-sm font-medium mb-2 uppercase tracking-wider">
                    Pick-up Location
                  </label>
                  <div className="relative">
                    <select className="w-full bg-[#0B0C0F] text-[#F5F7FA] px-4 py-3 rounded-lg border border-[#D4AF37]/20 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all appearance-none cursor-pointer">
                      <option>Graz Center</option>
                      <option>Airport</option>
                      <option>Train Station</option>
                      <option>Custom (+€20)</option>
                    </select>
                    <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#D4AF37] pointer-events-none" />
                  </div>
                </div>
              </div>

              {calculateDays() > 0 && (
                <div className="mb-6 p-4 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/20">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-[#9AA0A6]">Rental Days</span>
                    <span className="text-white font-semibold">{calculateDays()}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-[#9AA0A6]">Price per Day</span>
                    <span className="text-white font-semibold">€{car.price_per_day}</span>
                  </div>
                  <div className="pt-3 mt-3 border-t border-[#D4AF37]/20 flex justify-between">
                    <span className="text-white font-bold">Total</span>
                    <span className="text-2xl font-bold text-gradient">
                      €{totalPrice}
                    </span>
                  </div>
                </div>
              )}

              <button
                onClick={handleBooking}
                disabled={!pickupDate || !dropoffDate}
                className="w-full btn-primary py-4 text-base uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reserve Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
