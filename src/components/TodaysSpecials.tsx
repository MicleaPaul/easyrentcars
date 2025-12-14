import { useEffect, useState } from 'react';
import { Settings, Fuel, Users, DoorOpen, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  transmission: string;
  fuel_type: string;
  seats: number;
  doors: number;
  price_per_day: number;
  images: string[];
}

export function TodaysSpecials() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSpecials();
  }, []);

  async function fetchSpecials() {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('status', 'available')
        .order('price_per_day', { ascending: true })
        .limit(3);

      if (error) throw error;
      setVehicles(data || []);
    } catch (error) {
      console.error('Error fetching specials:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <section className="py-24 bg-[#0A0A0A]">
        <div className="container mx-auto px-6 text-center">
          <div className="inline-block w-12 h-12 border-4 border-[#F6C90E]/20 border-t-[#F6C90E] rounded-full animate-spin" />
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 sm:py-16 md:py-24 bg-[#0A0A0A]">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 sm:mb-12 md:mb-16 gap-4">
          <div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 sm:mb-4">
              OUR <span className="text-gradient">FLEET</span>
            </h2>
            <div className="w-16 sm:w-24 h-1 bg-gradient-to-r from-[#F6C90E] to-transparent" />
          </div>

          <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
            {['COMPACT', 'SEDAN', 'SUV', 'VIEW ALL'].map((filter) => (
              <button
                key={filter}
                className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 bg-[#1A1A1A] text-[#B8B9BB] font-semibold rounded-lg hover:bg-[#F6C90E] hover:text-black transition-all text-xs sm:text-sm border border-[#F6C90E]/20"
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {vehicles.map((car, index) => (
            <div
              key={car.id}
              className="group bg-[#141414] rounded-2xl overflow-hidden border border-[#F6C90E]/10 hover:border-[#F6C90E]/50 transition-all duration-500 hover:shadow-2xl hover:shadow-[#F6C90E]/20"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A]">
                <img
                  src={car.images[0] || 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg'}
                  alt={`${car.brand} ${car.model}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />

                <div className="absolute top-2 right-2 sm:top-4 sm:right-4 px-3 py-1 sm:px-4 sm:py-2 bg-[#F6C90E] text-black font-bold text-xs sm:text-sm rounded-full">
                  AVAILABLE
                </div>
              </div>

              <div className="p-4 sm:p-6">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">
                  {car.brand} {car.model}
                </h3>

                <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6 text-xs sm:text-sm">
                  <div className="flex items-center gap-2 text-[#B8B9BB]">
                    <Settings className="w-4 h-4 text-[#F6C90E]" />
                    <span>{car.transmission}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#B8B9BB]">
                    <Fuel className="w-4 h-4 text-[#F6C90E]" />
                    <span>{car.fuel_type}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#B8B9BB]">
                    <Users className="w-4 h-4 text-[#F6C90E]" />
                    <span>{car.seats} Seats</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#B8B9BB]">
                    <DoorOpen className="w-4 h-4 text-[#F6C90E]" />
                    <span>{car.doors} Doors</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 sm:pt-6 border-t border-[#F6C90E]/20 gap-3 sm:gap-0">
                  <div>
                    <p className="text-xs text-[#B8B9BB] mb-1">PER DAY</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gradient">
                      € {car.price_per_day}
                    </p>
                  </div>
                  <button className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-[#F6C90E] to-[#C9A227] text-black font-bold rounded-lg hover:shadow-lg hover:shadow-[#F6C90E]/40 transition-all group text-sm sm:text-base">
                    RENT NOW
                    <ArrowRight className="inline-block ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-2 sm:gap-3 mt-8 sm:mt-12">
          <button className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#1A1A1A] border border-[#F6C90E]/20 flex items-center justify-center hover:bg-[#F6C90E] hover:text-black transition-all text-sm sm:text-base">
            ←
          </button>
          {[1, 2, 3, 4].map((page) => (
            <button
              key={page}
              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold transition-all text-sm sm:text-base ${
                page === 1
                  ? 'bg-[#F6C90E] text-black'
                  : 'bg-[#1A1A1A] border border-[#F6C90E]/20 text-white hover:bg-[#F6C90E] hover:text-black'
              }`}
            >
              {page}
            </button>
          ))}
          <button className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#1A1A1A] border border-[#F6C90E]/20 flex items-center justify-center hover:bg-[#F6C90E] hover:text-black transition-all text-sm sm:text-base">
            →
          </button>
        </div>
      </div>
    </section>
  );
}
