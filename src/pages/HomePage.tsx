import { HeroSection } from '../components/HeroSection';
import { SearchFormNew } from '../components/SearchFormNew';
import { FleetSection } from '../components/FleetSection';
import { BenefitsSection } from '../components/BenefitsSection';
import { FAQSection } from '../components/FAQSection';
import { ContactSection } from '../components/ContactSection';
import { SEOHead } from '../components/SEOHead';

export function HomePage() {
  return (
    <>
      <SEOHead
        title="Car Rental in Graz | EasyRentCars"
        description="Affordable and reliable car rental in Graz, Austria. Rent quality vehicles from EUR49/day with unlimited mileage, flexible pick-up locations, and 24/7 support."
        canonicalUrl="https://easyrentcars.rentals/"
      />
      <HeroSection />
      <SearchFormNew />
      <FleetSection />
      <BenefitsSection />
      <FAQSection />
      <ContactSection />
    </>
  );
}
