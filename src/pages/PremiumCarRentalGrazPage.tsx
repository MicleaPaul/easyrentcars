import { useNavigate } from 'react-router-dom';
import { Star, Crown, Shield, Sparkles, Phone, Calendar } from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { useLanguage } from '../contexts/LanguageContext';

export function PremiumCarRentalGrazPage() {
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
        title="Premium Car Rental Graz - Luxury Mietwagen Graz | EasyRentCars"
        description="Premium car rental in Graz. Luxus Autovermietung mit hochwertigen Fahrzeugen. High-end vehicles for business and special occasions in Graz, Austria. Book luxury rentals today!"
        ogTitle="Premium Car Rental Graz - Luxury Vehicle Service"
        ogDescription="Experience premium car rental in Graz with high-end vehicles and exclusive service."
        canonicalUrl="https://easyrentcars.rentals/premium-car-rental-graz"
      />

      <div className="min-h-screen bg-[#0B0C0F] pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-[1200px]">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="flex justify-center mb-6">
              <Crown className="w-16 h-16 text-[#D4AF37]" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Premium Car Rental Graz
              <span className="block text-[#D4AF37] mt-2">Luxus Autovermietung</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Experience the finest in automotive luxury. Our premium car rental service in Graz
              offers high-end vehicles perfect for business executives, special occasions, and
              discerning travelers who demand excellence.
            </p>
          </div>

          {/* Luxury Banner */}
          <div className="bg-gradient-to-r from-[#D4AF37]/20 via-[#D4AF37]/30 to-[#D4AF37]/20 border border-[#D4AF37]/50 p-6 rounded-lg mb-16 text-center">
            <Sparkles className="w-12 h-12 text-[#D4AF37] mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Exclusive Fleet Experience</h2>
            <p className="text-gray-300">
              Meticulously maintained premium vehicles with concierge-level service
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            <button
              onClick={() => handleScrollToSection('search')}
              className="btn-primary px-8 py-4 text-lg"
            >
              <Calendar className="w-5 h-5 mr-2 inline" />
              Reserve Premium Vehicle
            </button>
            <button
              onClick={() => handleScrollToSection('fleet')}
              className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-lg text-lg transition-all border border-[#D4AF37]/30"
            >
              <Star className="w-5 h-5 mr-2 inline" />
              View Luxury Fleet
            </button>
            <a
              href="tel:+436641584950"
              className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-lg text-lg transition-all inline-block border border-[#D4AF37]/30"
            >
              <Phone className="w-5 h-5 mr-2 inline" />
              Concierge Service
            </a>
          </div>

          {/* Main Content */}
          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-white">
                Luxury Car Rental in Graz
              </h2>
              <p className="text-gray-300 leading-relaxed">
                For those who appreciate the finer things in life, our premium car rental service in
                Graz delivers an unparalleled experience. Whether you're attending high-level business
                meetings, celebrating a special milestone, or simply want to explore Austria in style,
                our luxury fleet provides the perfect combination of performance, comfort, and prestige.
              </p>
              <p className="text-gray-300 leading-relaxed">
                Our Luxus Autovermietung in Graz features vehicles from world-renowned manufacturers,
                each selected for its exceptional quality, advanced technology, and refined aesthetics.
                Every premium vehicle in our collection represents the pinnacle of automotive engineering,
                offering superior performance, cutting-edge safety features, and luxurious appointments
                that transform every journey into a memorable experience.
              </p>
              <p className="text-gray-300 leading-relaxed">
                We understand that renting a premium vehicle is about more than just transportation -
                it's about making a statement. Whether you're arriving at the Graz Opera House, attending
                a corporate event, or exploring the scenic routes of Styria, our luxury vehicles ensure
                you travel with distinction and arrive in style.
              </p>
            </div>

            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-white">
                Exclusive Premium Service
              </h2>
              <p className="text-gray-300 leading-relaxed">
                Premium car rental in Graz means premium service. Our dedicated team provides
                white-glove treatment from reservation to return. We offer flexible delivery and
                collection services throughout Graz and the surrounding region, bringing your
                chosen vehicle directly to your preferred location - whether that's your hotel,
                the airport, or a specific address.
              </p>
              <p className="text-gray-300 leading-relaxed">
                Each premium rental includes comprehensive insurance coverage with elevated limits,
                24/7 concierge support, and priority roadside assistance. Our vehicles are meticulously
                detailed before every rental, ensuring they meet the highest standards of cleanliness
                and presentation. Interior and exterior perfection is guaranteed.
              </p>
              <p className="text-gray-300 leading-relaxed">
                Additional luxury amenities are available to enhance your experience. Professional
                chauffeur services, advanced GPS navigation with premium routing, child safety seats
                that meet the highest standards, and bespoke rental packages tailored to your specific
                requirements. We go beyond basic car rental to provide a truly premium experience.
              </p>
            </div>
          </div>

          {/* Premium Features Grid */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              Premium Rental Experience
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white/5 p-6 rounded-lg border border-[#D4AF37]/30">
                <Crown className="w-12 h-12 text-[#D4AF37] mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">Luxury Fleet</h3>
                <p className="text-gray-300">
                  High-end vehicles from premium manufacturers with latest features and technology.
                </p>
              </div>
              <div className="bg-white/5 p-6 rounded-lg border border-[#D4AF37]/30">
                <Shield className="w-12 h-12 text-[#D4AF37] mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">Premium Insurance</h3>
                <p className="text-gray-300">
                  Comprehensive coverage with elevated limits and reduced deductibles for peace of mind.
                </p>
              </div>
              <div className="bg-white/5 p-6 rounded-lg border border-[#D4AF37]/30">
                <Sparkles className="w-12 h-12 text-[#D4AF37] mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">Concierge Service</h3>
                <p className="text-gray-300">
                  Dedicated support team available 24/7 for assistance with any request.
                </p>
              </div>
              <div className="bg-white/5 p-6 rounded-lg border border-[#D4AF37]/30">
                <Star className="w-12 h-12 text-[#D4AF37] mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">Flexible Delivery</h3>
                <p className="text-gray-300">
                  Vehicle delivery and collection at your preferred location throughout Graz.
                </p>
              </div>
              <div className="bg-white/5 p-6 rounded-lg border border-[#D4AF37]/30">
                <Crown className="w-12 h-12 text-[#D4AF37] mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">Pristine Condition</h3>
                <p className="text-gray-300">
                  Every vehicle professionally detailed to perfection before your rental begins.
                </p>
              </div>
              <div className="bg-white/5 p-6 rounded-lg border border-[#D4AF37]/30">
                <Phone className="w-12 h-12 text-[#D4AF37] mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">VIP Treatment</h3>
                <p className="text-gray-300">
                  Personalized service with attention to every detail of your rental experience.
                </p>
              </div>
            </div>
          </div>

          {/* Premium Occasions */}
          <div className="bg-white/5 p-8 rounded-lg border border-[#D4AF37]/30 mb-16">
            <h2 className="text-2xl font-bold text-white mb-6">Perfect for Special Occasions</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-[#D4AF37] mb-3">Business Excellence</h3>
                <p className="text-gray-300 mb-2">
                  Arrive at corporate meetings, conferences, and business events with confidence.
                  Premium vehicles create the right impression for important occasions.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#D4AF37] mb-3">Weddings & Celebrations</h3>
                <p className="text-gray-300 mb-2">
                  Make your special day even more memorable with a luxury vehicle. Perfect for
                  weddings, anniversaries, and milestone celebrations.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#D4AF37] mb-3">Executive Travel</h3>
                <p className="text-gray-300 mb-2">
                  VIP transportation for executives and dignitaries visiting Graz. Discreet,
                  professional service with vehicles that match your status.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#D4AF37] mb-3">Luxury Tourism</h3>
                <p className="text-gray-300 mb-2">
                  Experience Austria's scenic beauty in premium comfort. Ideal for exploring
                  wine regions, Alpine routes, and cultural destinations.
                </p>
              </div>
            </div>
          </div>

          {/* Premium Fleet Categories */}
          <div className="bg-white/5 p-8 rounded-lg border border-[#D4AF37]/30 mb-16">
            <h2 className="text-2xl font-bold text-white mb-6">Luxury Vehicle Selection</h2>
            <div className="space-y-4 text-gray-300">
              <div className="p-4 bg-white/5 rounded-lg">
                <h3 className="text-lg font-semibold text-[#D4AF37] mb-2">Premium Sedans</h3>
                <p>
                  Elegant executive sedans combining sophisticated design with advanced technology.
                  Perfect for business travel and formal occasions.
                </p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <h3 className="text-lg font-semibold text-[#D4AF37] mb-2">Luxury SUVs</h3>
                <p>
                  Spacious, comfortable, and commanding. Ideal for families or groups who want to
                  travel in style with ample room for luggage.
                </p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <h3 className="text-lg font-semibold text-[#D4AF37] mb-2">High-Performance Vehicles</h3>
                <p>
                  Experience automotive excellence with vehicles that offer thrilling performance
                  combined with luxury appointments.
                </p>
              </div>
            </div>
          </div>

          {/* Internal Links Section */}
          <div className="bg-white/5 p-8 rounded-lg border border-[#D4AF37]/30 mb-16">
            <h2 className="text-2xl font-bold text-white mb-6">Other Rental Services</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={() => navigate('/rent-a-car-graz')}
                className="text-left p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
              >
                <h3 className="text-lg font-semibold text-[#D4AF37] mb-2">Rent a Car Graz</h3>
                <p className="text-gray-300 text-sm">Standard car rental options</p>
              </button>
              <button
                onClick={() => navigate('/car-rental-graz')}
                className="text-left p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
              >
                <h3 className="text-lg font-semibold text-[#D4AF37] mb-2">Car Rental Graz</h3>
                <p className="text-gray-300 text-sm">Complete rental services</p>
              </button>
              <button
                onClick={() => navigate('/cheap-car-rental-graz')}
                className="text-left p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
              >
                <h3 className="text-lg font-semibold text-[#D4AF37] mb-2">Budget Options</h3>
                <p className="text-gray-300 text-sm">Affordable vehicle rentals</p>
              </button>
              <button
                onClick={() => handleScrollToSection('contact')}
                className="text-left p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
              >
                <h3 className="text-lg font-semibold text-[#D4AF37] mb-2">Contact Concierge</h3>
                <p className="text-gray-300 text-sm">Personalized assistance</p>
              </button>
            </div>
          </div>

          {/* Final CTA */}
          <div className="text-center bg-gradient-to-r from-[#D4AF37]/20 to-[#D4AF37]/10 p-12 rounded-lg border border-[#D4AF37]/30">
            <h2 className="text-3xl font-bold text-white mb-4">
              Experience Premium Car Rental in Graz
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Reserve your luxury vehicle today and elevate your journey through Austria.
            </p>
            <button
              onClick={() => handleScrollToSection('search')}
              className="btn-primary px-10 py-4 text-lg"
            >
              Book Premium Vehicle
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
