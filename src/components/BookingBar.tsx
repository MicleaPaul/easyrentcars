import { Calendar, MapPin, Clock } from 'lucide-react';

export function BookingBar() {
  return (
    <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 w-[95%] sm:w-[90%] max-w-6xl z-20">
      <div className="bg-[#1A1A1A]/95 backdrop-blur-xl border border-[#F6C90E]/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          <div className="relative">
            <label className="block text-[#B8B9BB] text-xs mb-2 uppercase tracking-wide">
              Select Car
            </label>
            <select className="w-full bg-[#0A0A0A] text-white px-4 py-3 rounded-lg border border-[#F6C90E]/20 focus:border-[#F6C90E] focus:outline-none">
              <option>All Cars</option>
              <option>Economy</option>
              <option>Standard</option>
              <option>Premium</option>
            </select>
          </div>

          <div className="relative">
            <label className="block text-[#B8B9BB] text-xs mb-2 uppercase tracking-wide">
              Pick-up Date
            </label>
            <div className="relative">
              <input
                type="date"
                className="w-full bg-[#0A0A0A] text-white px-4 py-3 rounded-lg border border-[#F6C90E]/20 focus:border-[#F6C90E] focus:outline-none"
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#F6C90E] pointer-events-none" />
            </div>
          </div>

          <div className="relative">
            <label className="block text-[#B8B9BB] text-xs mb-2 uppercase tracking-wide">
              Drop-off Date
            </label>
            <div className="relative">
              <input
                type="date"
                className="w-full bg-[#0A0A0A] text-white px-4 py-3 rounded-lg border border-[#F6C90E]/20 focus:border-[#F6C90E] focus:outline-none"
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#F6C90E] pointer-events-none" />
            </div>
          </div>

          <div className="relative">
            <label className="block text-[#B8B9BB] text-xs mb-2 uppercase tracking-wide">
              Location
            </label>
            <div className="relative">
              <select className="w-full bg-[#0A0A0A] text-white px-4 py-3 rounded-lg border border-[#F6C90E]/20 focus:border-[#F6C90E] focus:outline-none appearance-none">
                <option>Graz Center</option>
                <option>Airport</option>
                <option>Train Station</option>
                <option>Custom (+20€)</option>
              </select>
              <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#F6C90E] pointer-events-none" />
            </div>
          </div>

          <div className="flex items-end sm:col-span-2 lg:col-span-1">
            <button className="w-full px-6 py-3 bg-gradient-to-r from-[#F6C90E] to-[#C9A227] text-black font-bold rounded-lg hover:shadow-xl hover:shadow-[#F6C90E]/40 transition-all uppercase text-sm sm:text-base">
              Search
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
