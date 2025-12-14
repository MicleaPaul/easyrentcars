import { ArrowRight } from 'lucide-react';

export function SplitBanner() {
  return (
    <section className="py-12 sm:py-16 md:py-24 bg-[#0A0A0A]">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            <div className="relative h-[300px] sm:h-[400px] lg:h-[500px] overflow-hidden">
              <img
                src="https://images.pexels.com/photos/3802508/pexels-photo-3802508.jpeg"
                alt="Luxury Car"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />

              <div className="absolute top-4 right-4 sm:top-8 sm:right-8 w-24 h-32 sm:w-32 sm:h-40 bg-gradient-to-br from-[#F6C90E] to-[#C9A227] rounded-xl sm:rounded-2xl flex items-center justify-center shadow-2xl shadow-[#F6C90E]/50 transform rotate-6">
                <div className="text-center -rotate-6">
                  <div className="text-3xl sm:text-4xl font-bold text-black">€49</div>
                  <div className="text-xs sm:text-sm text-black font-semibold">FROM/DAY</div>
                </div>
              </div>
            </div>

            <div className="relative h-[300px] sm:h-[400px] lg:h-[500px] overflow-hidden">
              <img
                src="https://images.pexels.com/photos/3764984/pexels-photo-3764984.jpeg"
                alt="Car Interior"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-black/80 to-transparent" />

              <div className="absolute inset-0 flex items-center justify-center text-center px-4 sm:px-8">
                <div>
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
                    RELIABLE CARS
                    <br />
                    <span className="text-gradient">GREAT PRICES</span>
                  </h3>
                  <button className="mt-4 sm:mt-6 px-6 py-3 sm:px-8 sm:py-4 bg-transparent border-2 border-[#F6C90E] text-[#F6C90E] font-bold rounded-lg hover:bg-[#F6C90E] hover:text-black transition-all group text-sm sm:text-base">
                    VIEW FLEET
                    <ArrowRight className="inline-block ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
