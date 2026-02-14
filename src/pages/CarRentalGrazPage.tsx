import { useNavigate } from 'react-router-dom';
import { Car, Users, Briefcase, MapPin, Phone, Calendar, Star } from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { useLanguage } from '../contexts/LanguageContext';

export function CarRentalGrazPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleScrollToSection = (sectionId: string) => {
    navigate('/');
    setTimeout(() => {
      const section = document.getElementById(sectionId);
      if (section) {
        const headerOffset = 100;
        const elementPosition = section.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }, 100);
  };

  return (
    <>
      <SEOHead
        title="Car Rental Graz - Mietwagen Graz Austria | EasyRentCars"
        description="Professional car rental in Graz, Austria. Mietwagen Service mit großer Fahrzeugauswahl. Business and leisure rentals with flexible terms. Reserve your rental vehicle in Graz today!"
        ogTitle="Car Rental Graz - Professional Mietwagen Service"
        ogDescription="Reliable car rental service in Graz with a comprehensive fleet. Perfect for business trips and leisure travel."
        canonicalUrl="https://easyrentcars.rentals/car-rental-graz"
      />

      <div className="min-h-screen bg-[#0B0C0F] pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-[1200px]">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Car Rental Graz Austria
              <span className="block text-[#D4AF37] mt-2">Mietwagen Service Graz</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Your trusted partner for car rental in Graz. From compact city cars to spacious SUVs,
              find the perfect vehicle for your journey through Styria and beyond.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            <button
              onClick={() => handleScrollToSection('search')}
              className="btn-primary px-8 py-4 text-lg"
            >
              <Calendar className="w-5 h-5 mr-2 inline" />
              Reserve Now
            </button>
            <button
              onClick={() => handleScrollToSection('fleet')}
              className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-lg text-lg transition-all"
            >
              <Car className="w-5 h-5 mr-2 inline" />
              Browse Vehicles
            </button>
            <a
              href="tel:+436641584950"
              className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-lg text-lg transition-all inline-block"
            >
              <Phone className="w-5 h-5 mr-2 inline" />
              +43 664 158 4950
            </a>
          </div>

          {/* Main Content */}
          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-white">
                Complete Car Rental Solutions in Graz
              </h2>
              <p className="text-gray-300 leading-relaxed">
                EasyRentCars is your premier car rental provider in Graz, Austria's cultural capital.
                Whether you're here for business at the Technical University, attending conferences,
                or exploring the beautiful Styrian region, our car rental service provides the mobility
                you need with the quality you deserve.
              </p>
              <p className="text-gray-300 leading-relaxed">
                Our Mietwagen service in Graz caters to all types of travelers. Business professionals
                appreciate our reliable vehicles and flexible rental terms, while families love our
                spacious options perfect for day trips to destinations like Riegersburg Castle or the
                Zotter Chocolate Factory. Solo travelers find our compact cars ideal for exploring Graz's
                historic old town and surrounding wine routes.
              </p>
              <p className="text-gray-300 leading-relaxed">
                Every vehicle in our fleet undergoes regular maintenance and safety checks. We ensure
                that when you rent a car from us, you're getting a vehicle that's clean, reliable, and
                ready for the road. Our modern fleet includes vehicles from trusted manufacturers, all
                equipped with essential features like air conditioning, power steering, and advanced
                safety systems.
              </p>
            </div>

            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-white">
                Flexible Rental Options for Every Need
              </h2>
              <p className="text-gray-300 leading-relaxed">
                We understand that travel plans vary, which is why our car rental service in Graz offers
                maximum flexibility. Rent for a few hours for quick errands, a day for a business meeting,
                a weekend for a getaway, or longer periods for extended stays. Our competitive rates and
                transparent pricing ensure you always know what you're paying for.
              </p>
              <p className="text-gray-300 leading-relaxed">
                Located conveniently in Graz, we serve customers arriving by air, train, or those already
                in the city. Our pickup and return process is streamlined for efficiency, getting you on
                the road quickly without unnecessary paperwork or delays. Digital documentation and
                contactless options are available for your convenience.
              </p>
              <p className="text-gray-300 leading-relaxed">
                Additional services enhance your rental experience. Need a GPS navigation system to explore
                Austria? Traveling with children and require car seats? Want additional insurance coverage
                for peace of mind? We provide everything you need to make your car rental in Graz comfortable
                and worry-free. Our team speaks multiple languages and is always ready to assist.
              </p>
            </div>
          </div>

          {/* Use Cases Grid */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              Perfect for Every Occasion
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white/5 p-6 rounded-lg border border-[#D4AF37]/20">
                <Briefcase className="w-12 h-12 text-[#D4AF37] mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">Business Travel</h3>
                <p className="text-gray-300">
                  Reliable vehicles for meetings, conferences, and corporate events throughout Graz and Styria.
                </p>
              </div>
              <div className="bg-white/5 p-6 rounded-lg border border-[#D4AF37]/20">
                <Users className="w-12 h-12 text-[#D4AF37] mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">Family Trips</h3>
                <p className="text-gray-300">
                  Spacious vehicles perfect for family excursions to attractions and scenic destinations.
                </p>
              </div>
              <div className="bg-white/5 p-6 rounded-lg border border-[#D4AF37]/20">
                <MapPin className="w-12 h-12 text-[#D4AF37] mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">Tourism & Sightseeing</h3>
                <p className="text-gray-300">
                  Explore Graz's UNESCO sites, wine regions, and Alpine routes at your own pace.
                </p>
              </div>
              <div className="bg-white/5 p-6 rounded-lg border border-[#D4AF37]/20">
                <Calendar className="w-12 h-12 text-[#D4AF37] mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">Event Attendance</h3>
                <p className="text-gray-300">
                  Convenient transportation for weddings, festivals, and special events in the region.
                </p>
              </div>
              <div className="bg-white/5 p-6 rounded-lg border border-[#D4AF37]/20">
                <Star className="w-12 h-12 text-[#D4AF37] mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">Weekend Getaways</h3>
                <p className="text-gray-300">
                  Short-term rentals ideal for spontaneous trips and weekend adventures.
                </p>
              </div>
              <div className="bg-white/5 p-6 rounded-lg border border-[#D4AF37]/20">
                <Car className="w-12 h-12 text-[#D4AF37] mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">Long-Term Rental</h3>
                <p className="text-gray-300">
                  Extended rental options with special rates for stays of several weeks or months.
                </p>
              </div>
            </div>
          </div>

          {/* Local Highlights */}
          <div className="bg-white/5 p-8 rounded-lg border border-[#D4AF37]/20 mb-16">
            <h2 className="text-2xl font-bold text-white mb-6">Explore Graz and Styria by Car</h2>
            <div className="grid md:grid-cols-2 gap-6 text-gray-300">
              <div>
                <h3 className="text-lg font-semibold text-[#D4AF37] mb-3">City Attractions</h3>
                <ul className="space-y-2">
                  <li>• Schlossberg and Clock Tower</li>
                  <li>• Historic Old Town (UNESCO World Heritage)</li>
                  <li>• Kunsthaus Graz modern art museum</li>
                  <li>• Murinsel artificial island</li>
                  <li>• Eggenberg Palace</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#D4AF37] mb-3">Day Trip Destinations</h3>
                <ul className="space-y-2">
                  <li>• South Styrian Wine Road</li>
                  <li>• Riegersburg Castle</li>
                  <li>• Zotter Chocolate Factory</li>
                  <li>• Lurgrotte cave system</li>
                  <li>• Austrian Open-Air Museum</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Internal Links Section */}
          <div className="bg-white/5 p-8 rounded-lg border border-[#D4AF37]/20 mb-16">
            <h2 className="text-2xl font-bold text-white mb-6">More Rental Services</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={() => navigate('/rent-a-car-graz')}
                className="text-left p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
              >
                <h3 className="text-lg font-semibold text-[#D4AF37] mb-2">Rent a Car Graz</h3>
                <p className="text-gray-300 text-sm">Flexible car rental options in Graz</p>
              </button>
              <button
                onClick={() => navigate('/cheap-car-rental-graz')}
                className="text-left p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
              >
                <h3 className="text-lg font-semibold text-[#D4AF37] mb-2">Cheap Car Rental Graz</h3>
                <p className="text-gray-300 text-sm">Affordable vehicles for budget travelers</p>
              </button>
              <button
                onClick={() => navigate('/premium-car-rental-graz')}
                className="text-left p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
              >
                <h3 className="text-lg font-semibold text-[#D4AF37] mb-2">Premium Car Rental Graz</h3>
                <p className="text-gray-300 text-sm">Luxury and high-end vehicle selection</p>
              </button>
              <button
                onClick={() => handleScrollToSection('faq')}
                className="text-left p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
              >
                <h3 className="text-lg font-semibold text-[#D4AF37] mb-2">FAQs</h3>
                <p className="text-gray-300 text-sm">Common questions about car rental</p>
              </button>
            </div>
          </div>

          {/* Final CTA */}
          <div className="text-center bg-gradient-to-r from-[#D4AF37]/20 to-[#D4AF37]/10 p-12 rounded-lg">
            <h2 className="text-3xl font-bold text-white mb-4">
              Book Your Car Rental in Graz Today
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Experience professional service and quality vehicles at competitive rates.
            </p>
            <button
              onClick={() => handleScrollToSection('search')}
              className="btn-primary px-10 py-4 text-lg"
            >
              Check Availability
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
