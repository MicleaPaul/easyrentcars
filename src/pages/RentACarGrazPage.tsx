import { useNavigate } from 'react-router-dom';
import { Car, Shield, Clock, MapPin, Phone, Calendar, CheckCircle } from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { useLanguage } from '../contexts/LanguageContext';

export function RentACarGrazPage() {
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
        title="Rent a Car Graz - Auto mieten Graz | EasyRentCars"
        description="Rent a car in Graz, Austria with EasyRentCars. Günstige Autovermietung in Graz mit flexiblen Abholzeiten. Wide selection of vehicles for rent at competitive prices. Book your rental car today!"
        ogTitle="Rent a Car Graz - Flexible Auto mieten in Graz"
        ogDescription="Professional car rental service in Graz with a wide selection of vehicles. Flexible pickup times and competitive rates."
        canonicalUrl="https://easyrentcars.rentals/rent-a-car-graz"
      />

      <div className="min-h-screen bg-[#0B0C0F] pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-[1200px]">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Rent a Car in Graz
              <span className="block text-[#D4AF37] mt-2">Auto mieten Graz</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Professional car rental service in the heart of Graz, Austria.
              Whether you need a vehicle for business or leisure, EasyRentCars offers
              the perfect solution for your mobility needs.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            <button
              onClick={() => handleScrollToSection('search')}
              className="btn-primary px-8 py-4 text-lg"
            >
              <Calendar className="w-5 h-5 mr-2 inline" />
              Book Now
            </button>
            <button
              onClick={() => handleScrollToSection('fleet')}
              className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-lg text-lg transition-all"
            >
              <Car className="w-5 h-5 mr-2 inline" />
              View Fleet
            </button>
            <a
              href="tel:+436643408887"
              className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-lg text-lg transition-all inline-block"
            >
              <Phone className="w-5 h-5 mr-2 inline" />
              Call Now
            </a>
          </div>

          {/* Main Content */}
          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-white">
                Why Rent a Car in Graz with EasyRentCars?
              </h2>
              <p className="text-gray-300 leading-relaxed">
                Graz, Austria's second-largest city and a UNESCO World Heritage site, deserves to be explored
                at your own pace. When you rent a car in Graz with EasyRentCars, you gain the freedom to
                discover not only the historic city center but also the stunning Styrian countryside,
                picturesque wine regions, and scenic Alpine routes.
              </p>
              <p className="text-gray-300 leading-relaxed">
                Our Autovermietung in Graz provides a seamless rental experience with flexible pickup and
                drop-off options. Whether you're visiting for business meetings, attending events at the
                Stadthalle, or exploring tourist attractions like Schlossberg and Murinsel, having your own
                rental car gives you complete independence.
              </p>
              <p className="text-gray-300 leading-relaxed">
                We understand that every traveler has different needs. That's why our fleet includes
                everything from compact city cars perfect for navigating Graz's narrow streets to spacious
                SUVs ideal for family trips to nearby attractions. All our vehicles are regularly maintained,
                fully insured, and equipped with modern safety features.
              </p>
            </div>

            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-white">
                Convenient Locations in Graz
              </h2>
              <p className="text-gray-300 leading-relaxed">
                EasyRentCars offers convenient pickup locations throughout Graz, making it easy to start
                your journey. Whether you're arriving at Graz Airport, the main train station (Hauptbahnhof),
                or need delivery to your hotel in the city center, we accommodate your schedule.
              </p>
              <p className="text-gray-300 leading-relaxed">
                Our flexible service means you can rent a car for just a few hours, a full day, or extended
                periods. We offer competitive daily rates with transparent pricing - no hidden fees or
                surprises at checkout. Additional services like GPS navigation, child seats, and comprehensive
                insurance options are available to make your rental experience worry-free.
              </p>
              <p className="text-gray-300 leading-relaxed">
                Booking your rental car in Graz is simple. Use our online reservation system to check
                availability, compare vehicle options, and secure your booking in minutes. Our multilingual
                customer support team is always ready to assist you with any questions about your car rental.
              </p>
            </div>
          </div>

          {/* Benefits Grid */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              Benefits of Renting a Car in Graz
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white/5 p-6 rounded-lg border border-[#D4AF37]/20">
                <Shield className="w-12 h-12 text-[#D4AF37] mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">Fully Insured</h3>
                <p className="text-gray-300">
                  All vehicles include comprehensive insurance coverage for your peace of mind.
                </p>
              </div>
              <div className="bg-white/5 p-6 rounded-lg border border-[#D4AF37]/20">
                <Clock className="w-12 h-12 text-[#D4AF37] mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">Flexible Hours</h3>
                <p className="text-gray-300">
                  Convenient pickup and return times that fit your schedule, including weekends.
                </p>
              </div>
              <div className="bg-white/5 p-6 rounded-lg border border-[#D4AF37]/20">
                <MapPin className="w-12 h-12 text-[#D4AF37] mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">Prime Locations</h3>
                <p className="text-gray-300">
                  Multiple pickup points across Graz for your convenience.
                </p>
              </div>
              <div className="bg-white/5 p-6 rounded-lg border border-[#D4AF37]/20">
                <Car className="w-12 h-12 text-[#D4AF37] mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">Modern Fleet</h3>
                <p className="text-gray-300">
                  Well-maintained vehicles with the latest safety and comfort features.
                </p>
              </div>
              <div className="bg-white/5 p-6 rounded-lg border border-[#D4AF37]/20">
                <CheckCircle className="w-12 h-12 text-[#D4AF37] mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">No Hidden Fees</h3>
                <p className="text-gray-300">
                  Transparent pricing with all costs clearly displayed upfront.
                </p>
              </div>
              <div className="bg-white/5 p-6 rounded-lg border border-[#D4AF37]/20">
                <Phone className="w-12 h-12 text-[#D4AF37] mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">24/7 Support</h3>
                <p className="text-gray-300">
                  Multilingual customer service available whenever you need assistance.
                </p>
              </div>
            </div>
          </div>

          {/* Internal Links Section */}
          <div className="bg-white/5 p-8 rounded-lg border border-[#D4AF37]/20 mb-16">
            <h2 className="text-2xl font-bold text-white mb-6">Explore More Car Rental Options</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={() => navigate('/car-rental-graz')}
                className="text-left p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
              >
                <h3 className="text-lg font-semibold text-[#D4AF37] mb-2">Car Rental Graz</h3>
                <p className="text-gray-300 text-sm">Discover our complete car rental services</p>
              </button>
              <button
                onClick={() => navigate('/cheap-car-rental-graz')}
                className="text-left p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
              >
                <h3 className="text-lg font-semibold text-[#D4AF37] mb-2">Cheap Car Rental Graz</h3>
                <p className="text-gray-300 text-sm">Budget-friendly rental options</p>
              </button>
              <button
                onClick={() => navigate('/premium-car-rental-graz')}
                className="text-left p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
              >
                <h3 className="text-lg font-semibold text-[#D4AF37] mb-2">Premium Car Rental Graz</h3>
                <p className="text-gray-300 text-sm">Luxury vehicles for special occasions</p>
              </button>
              <button
                onClick={() => handleScrollToSection('contact')}
                className="text-left p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
              >
                <h3 className="text-lg font-semibold text-[#D4AF37] mb-2">Contact Us</h3>
                <p className="text-gray-300 text-sm">Get in touch for personalized service</p>
              </button>
            </div>
          </div>

          {/* Final CTA */}
          <div className="text-center bg-gradient-to-r from-[#D4AF37]/20 to-[#D4AF37]/10 p-12 rounded-lg">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Rent a Car in Graz?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Book your vehicle today and experience the freedom of having your own car in Graz.
            </p>
            <button
              onClick={() => handleScrollToSection('search')}
              className="btn-primary px-10 py-4 text-lg"
            >
              Start Your Booking
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
