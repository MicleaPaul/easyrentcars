import { HeroSection } from '../components/HeroSection';
import { SearchFormNew } from '../components/SearchFormNew';
import { FleetSection } from '../components/FleetSection';
import { BenefitsSection } from '../components/BenefitsSection';
import { FAQSection } from '../components/FAQSection';
import { ContactSection } from '../components/ContactSection';

export function HomePage() {
  return (
    <>
      <HeroSection />
      <SearchFormNew />
      <FleetSection />
      <BenefitsSection />
      <FAQSection />
      <ContactSection />
    </>
  );
}
