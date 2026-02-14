import { useNavigate } from 'react-router-dom';
import { DollarSign, TrendingDown, Calendar, Car, Phone, CheckCircle } from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { useLanguage } from '../contexts/LanguageContext';

export function CheapCarRentalGrazPage() {
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
        title="Cheap Car Rental Graz - Günstige Autovermietung Graz | EasyRentCars"
        description="Cheap car rental in Graz with transparent pricing. Günstige Mietwagen in Graz ohne versteckte Kosten. Budget-friendly vehicles without compromising quality. Book affordable rentals today!"
        ogTitle="Cheap Car Rental Graz - Budget-Friendly Mietwagen"
        ogDescription="Affordable car rental in Graz with no hidden fees. Quality vehicles at competitive prices."
        canonicalUrl="https://easyrentcars.rentals/cheap-car-rental-graz"
      />

      <div className="min-h-screen bg-[#0B0C0F] pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-[1200px]">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Cheap Car Rental Graz
              <span className="block text-[#D4AF37] mt-2">Günstige Autovermietung</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Affordable car rental in Graz without compromising on quality. Get the best rates
              on reliable vehicles with transparent pricing and no hidden fees.
            </p>
          </div>

          {/* Price Promise Banner */}
          <div className="bg-gradient-to-r from-green-900/30 to-green-800/20 border border-green-500/30 p-6 rounded-lg mb-16 text-center">
            <DollarSign className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Best Price Guarantee</h2>
            <p className="text-gray-300">
              We offer competitive rates with transparent pricing. What you see is what you pay - no surprises!
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            <button
              onClick={() => handleScrollToSection('search')}
              className="btn-primary px-8 py-4 text-lg"
            >
              <Calendar className="w-5 h-5 mr-2 inline" />
              Find Cheap Deals
            </button>
            <button
              onClick={() => handleScrollToSection('fleet')}
              className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-lg text-lg transition-all"
            >
              <Car className="w-5 h-5 mr-2 inline" />
              View Budget Cars
            </button>
            <a
              href="tel:+436641584950"
              className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-lg text-lg transition-all inline-block"
            >
              <Phone className="w-5 h-5 mr-2 inline" />
              Call for Quotes
            </a>
          </div>

          {/* Main Content */}
          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-white">
                Budget-Friendly Car Rental in Graz
              </h2>
              <p className="text-gray-300 leading-relaxed">
                Looking for cheap car rental in Graz doesn't mean you have to sacrifice quality or service.
                At EasyRentCars, we believe everyone deserves access to reliable transportation at fair prices.
                Our budget-friendly vehicles are perfect for cost-conscious travelers, students, and anyone
                looking to explore Graz and Styria without breaking the bank.
              </p>
              <p className="text-gray-300 leading-relaxed">
                Our günstige Autovermietung in Graz offers the same high-quality service and well-maintained
                vehicles as premium options, just at prices that fit your budget. Every vehicle undergoes
                thorough safety checks and comes with comprehensive insurance, so you can drive with confidence
                knowing you're protected.
              </p>
              <p className="text-gray-300 leading-relaxed">
                We understand that when you're searching for cheap car rental options, transparency matters.
                That's why we display all costs upfront - no hidden fees, no surprise charges at the counter.
                Our daily rates include basic insurance, unlimited mileage within Austria, and 24/7 roadside
                assistance. Additional options like GPS or child seats are available at clear, affordable rates.
              </p>
            </div>

            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-white">
                How to Save Money on Your Graz Rental
              </h2>
              <p className="text-gray-300 leading-relaxed">
                Getting a cheap car rental in Graz is easier than you think. Book in advance to secure the
                best rates, especially during peak tourist seasons or major events. Our early bird specials
                can save you up to 30% compared to last-minute bookings. Flexible with your dates? Mid-week
                rentals typically offer better rates than weekend bookings.
              </p>
              <p className="text-gray-300 leading-relaxed">
                Choose the right vehicle size for your needs. A compact car is perfect for solo travelers or
                couples exploring Graz's city center and offers excellent fuel economy. For longer trips or
                more passengers, our economy sedans provide great value. We'll help you find the most
                cost-effective option for your specific requirements.
              </p>
              <p className="text-gray-300 leading-relaxed">
                Consider rental duration carefully. Our weekly rates offer significant savings compared to
                daily rentals. If you're staying in Graz for several days, a week-long rental often costs
                less per day than a three-day rental. For extended stays, ask about our monthly rates for
                even better value.
              </p>
            </div>
          </div>

          {/* Money-Saving Tips Grid */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              Tips for Finding the Cheapest Car Rental
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white/5 p-6 rounded-lg border border-[#D4AF37]/20">
                <Calendar className="w-12 h-12 text-[#D4AF37] mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">Book Early</h3>
                <p className="text-gray-300">
                  Reserve your vehicle weeks in advance for the best rates and widest selection.
                </p>
              </div>
              <div className="bg-white/5 p-6 rounded-lg border border-[#D4AF37]/20">
                <TrendingDown className="w-12 h-12 text-[#D4AF37] mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">Compare Options</h3>
                <p className="text-gray-300">
                  Review different vehicle categories to find the best value for your needs.
                </p>
              </div>
              <div className="bg-white/5 p-6 rounded-lg border border-[#D4AF37]/20">
                <CheckCircle className="w-12 h-12 text-[#D4AF37] mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">Long-Term Discounts</h3>
                <p className="text-gray-300">
                  Weekly and monthly rentals offer much better daily rates than short-term bookings.
                </p>
              </div>
              <div className="bg-white/5 p-6 rounded-lg border border-[#D4AF37]/20">
                <Car className="w-12 h-12 text-[#D4AF37] mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">Right Size Vehicle</h3>
                <p className="text-gray-300">
                  Choose compact or economy cars for city driving and better fuel efficiency.
                </p>
              </div>
              <div className="bg-white/5 p-6 rounded-lg border border-[#D4AF37]/20">
                <DollarSign className="w-12 h-12 text-[#D4AF37] mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">No Hidden Fees</h3>
                <p className="text-gray-300">
                  All costs clearly displayed upfront with no surprises at pickup or return.
                </p>
              </div>
              <div className="bg-white/5 p-6 rounded-lg border border-[#D4AF37]/20">
                <Phone className="w-12 h-12 text-[#D4AF37] mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">Ask About Deals</h3>
                <p className="text-gray-300">
                  Contact us directly for special promotions and seasonal discounts.
                </p>
              </div>
            </div>
          </div>

          {/* Budget Categories */}
          <div className="bg-white/5 p-8 rounded-lg border border-[#D4AF37]/20 mb-16">
            <h2 className="text-2xl font-bold text-white mb-6">Budget Vehicle Categories</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-[#D4AF37] mb-3">Compact Cars</h3>
                <p className="text-gray-300 mb-2">
                  Perfect for 2-3 passengers. Excellent fuel economy and easy to park in Graz's city center.
                  Ideal for short trips and urban exploration.
                </p>
                <p className="text-sm text-gray-400">Starting from competitive daily rates</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#D4AF37] mb-3">Economy Sedans</h3>
                <p className="text-gray-300 mb-2">
                  Comfortable for 4-5 passengers with luggage space. Great balance of affordability and comfort
                  for longer journeys.
                </p>
                <p className="text-sm text-gray-400">Best value for multi-day rentals</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#D4AF37] mb-3">Small SUVs</h3>
                <p className="text-gray-300 mb-2">
                  Extra space for families and luggage. Affordable option for exploring Styrian countryside
                  and mountain roads.
                </p>
                <p className="text-sm text-gray-400">Popular for weekend getaways</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#D4AF37] mb-3">Budget-Friendly Features</h3>
                <p className="text-gray-300 mb-2">
                  All vehicles include air conditioning, power steering, modern safety features, and full
                  insurance coverage.
                </p>
                <p className="text-sm text-gray-400">Quality doesn't cost extra</p>
              </div>
            </div>
          </div>

          {/* Internal Links Section */}
          <div className="bg-white/5 p-8 rounded-lg border border-[#D4AF37]/20 mb-16">
            <h2 className="text-2xl font-bold text-white mb-6">Explore Other Rental Options</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={() => navigate('/rent-a-car-graz')}
                className="text-left p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
              >
                <h3 className="text-lg font-semibold text-[#D4AF37] mb-2">Rent a Car Graz</h3>
                <p className="text-gray-300 text-sm">Complete car rental services in Graz</p>
              </button>
              <button
                onClick={() => navigate('/car-rental-graz')}
                className="text-left p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
              >
                <h3 className="text-lg font-semibold text-[#D4AF37] mb-2">Car Rental Graz</h3>
                <p className="text-gray-300 text-sm">Professional Mietwagen service</p>
              </button>
              <button
                onClick={() => navigate('/premium-car-rental-graz')}
                className="text-left p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
              >
                <h3 className="text-lg font-semibold text-[#D4AF37] mb-2">Premium Car Rental</h3>
                <p className="text-gray-300 text-sm">Upgrade to luxury vehicles</p>
              </button>
              <button
                onClick={() => handleScrollToSection('contact')}
                className="text-left p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
              >
                <h3 className="text-lg font-semibold text-[#D4AF37] mb-2">Contact Us</h3>
                <p className="text-gray-300 text-sm">Questions about pricing?</p>
              </button>
            </div>
          </div>

          {/* Final CTA */}
          <div className="text-center bg-gradient-to-r from-[#D4AF37]/20 to-[#D4AF37]/10 p-12 rounded-lg">
            <h2 className="text-3xl font-bold text-white mb-4">
              Find Your Cheap Car Rental in Graz
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Quality vehicles at budget-friendly prices. Check our available cars and book today!
            </p>
            <button
              onClick={() => handleScrollToSection('search')}
              className="btn-primary px-10 py-4 text-lg"
            >
              View Cheap Deals
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
