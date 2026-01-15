const fs = require('fs');
const path = require('path');

const pagesDir = '/tmp/cc-agent/59606994/project/src/pages';

// Define all replacements for each page
const replacements = {
  'CarRentalGrazPage.tsx': {
    // SEO Head
    'title="Car Rental Graz - Mietwagen Graz Austria | EasyRentCars"': 'title={t(\'carRental.seo.title\')}',
    'description="Professional car rental in Graz, Austria. Mietwagen Service mit großer Fahrzeugauswahl. Business and leisure rentals with flexible terms. Reserve your rental vehicle in Graz today!"': 'description={t(\'carRental.seo.description\')}',
    'ogTitle="Car Rental Graz - Professional Mietwagen Service"': 'ogTitle={t(\'carRental.seo.ogTitle\')}',
    'ogDescription="Reliable car rental service in Graz with a comprehensive fleet. Perfect for business trips and leisure travel."': 'ogDescription={t(\'carRental.seo.ogDescription\')}',
    // Hero
    'Car Rental Graz Austria': '{t(\'carRental.title\')}',
    'Mietwagen Service Graz': '{t(\'carRental.subtitle\')}',
    'Your trusted partner for car rental in Graz. From compact city cars to spacious SUVs,\n              find the perfect vehicle for your journey through Styria and beyond.': '{t(\'carRental.hero.description\')}',
    // CTA Buttons
    'Reserve Now': '{t(\'carRental.cta.reserveNow\')}',
    'Browse Vehicles': '{t(\'carRental.cta.browseVehicles\')}',
    // Main sections
    'Complete Car Rental Solutions in Graz': '{t(\'carRental.solution.title\')}',
    'Flexible Rental Options for Every Need': '{t(\'carRental.flexible.title\')}',
    'Perfect for Every Occasion': '{t(\'carRental.occasions.title\')}',
    'Explore Graz and Styria by Car': '{t(\'carRental.explore.title\')}',
    'City Attractions': '{t(\'carRental.attractions.title\')}',
    'Day Trip Destinations': '{t(\'carRental.dayTrips.title\')}',
    'More Rental Services': '{t(\'carRental.moreServices.title\')}',
    'Book Your Car Rental in Graz Today': '{t(\'carRental.finalCta.title\')}',
    'Experience professional service and quality vehicles at competitive rates.': '{t(\'carRental.finalCta.desc\')}',
    'Check Availability': '{t(\'carRental.finalCta.button\')}',
  },
  'CheapCarRentalGrazPage.tsx': {
    // SEO
    'title="Cheap Car Rental Graz - Günstige Autovermietung Graz | EasyRentCars"': 'title={t(\'cheapRental.seo.title\')}',
    'description="Cheap car rental in Graz with transparent pricing. Günstige Mietwagen in Graz ohne versteckte Kosten. Budget-friendly vehicles without compromising quality. Book affordable rentals today!"': 'description={t(\'cheapRental.seo.description\')}',
    'ogTitle="Cheap Car Rental Graz - Budget-Friendly Mietwagen"': 'ogTitle={t(\'cheapRental.seo.ogTitle\')}',
    'ogDescription="Affordable car rental in Graz with no hidden fees. Quality vehicles at competitive prices."': 'ogDescription={t(\'cheapRental.seo.ogDescription\')}',
    // Hero
    'Cheap Car Rental Graz': '{t(\'cheapRental.title\')}',
    'Günstige Autovermietung': '{t(\'cheapRental.subtitle\')}',
    'Affordable car rental in Graz without compromising on quality. Get the best rates\n              on reliable vehicles with transparent pricing and no hidden fees.': '{t(\'cheapRental.hero.description\')}',
    'Best Price Guarantee': '{t(\'cheapRental.pricePromise.title\')}',
    'We offer competitive rates with transparent pricing. What you see is what you pay - no surprises!': '{t(\'cheapRental.pricePromise.desc\')}',
    'Find Cheap Deals': '{t(\'cheapRental.cta.findDeals\')}',
    'View Budget Cars': '{t(\'cheapRental.cta.viewBudgetCars\')}',
    'Call for Quotes': '{t(\'cheapRental.cta.callForQuotes\')}',
    'Budget-Friendly Car Rental in Graz': '{t(\'cheapRental.budget.title\')}',
    'How to Save Money on Your Graz Rental': '{t(\'cheapRental.save.title\')}',
    'Tips for Finding the Cheapest Car Rental': '{t(\'cheapRental.tips.title\')}',
    'Budget Vehicle Categories': '{t(\'cheapRental.categories.title\')}',
    'Explore Other Rental Options': '{t(\'cheapRental.exploreOptions.title\')}',
    'Find Your Cheap Car Rental in Graz': '{t(\'cheapRental.finalCta.title\')}',
    'Quality vehicles at budget-friendly prices. Check our available cars and book today!': '{t(\'cheapRental.finalCta.desc\')}',
    'View Cheap Deals': '{t(\'cheapRental.finalCta.button\')}',
  },
  'PremiumCarRentalGrazPage.tsx': {
    // SEO
    'title="Premium Car Rental Graz - Luxury Mietwagen Graz | EasyRentCars"': 'title={t(\'premiumRental.seo.title\')}',
    'description="Premium car rental in Graz. Luxus Autovermietung mit hochwertigen Fahrzeugen. High-end vehicles for business and special occasions in Graz, Austria. Book luxury rentals today!"': 'description={t(\'premiumRental.seo.description\')}',
    'ogTitle="Premium Car Rental Graz - Luxury Vehicle Service"': 'ogTitle={t(\'premiumRental.seo.ogTitle\')}',
    'ogDescription="Experience premium car rental in Graz with high-end vehicles and exclusive service."': 'ogDescription={t(\'premiumRental.seo.ogDescription\')}',
    // Hero
    'Premium Car Rental Graz': '{t(\'premiumRental.title\')}',
    'Luxus Autovermietung': '{t(\'premiumRental.subtitle\')}',
    'Experience the finest in automotive luxury. Our premium car rental service in Graz\n              offers high-end vehicles perfect for business executives, special occasions, and\n              discerning travelers who demand excellence.': '{t(\'premiumRental.hero.description\')}',
    'Exclusive Fleet Experience': '{t(\'premiumRental.luxury.title\')}',
    'Meticulously maintained premium vehicles with concierge-level service': '{t(\'premiumRental.luxury.desc\')}',
    'Reserve Premium Vehicle': '{t(\'premiumRental.cta.reservePremium\')}',
    'View Luxury Fleet': '{t(\'premiumRental.cta.viewLuxuryFleet\')}',
    'Concierge Service': '{t(\'premiumRental.cta.concierge\')}',
    'Luxury Car Rental in Graz': '{t(\'premiumRental.experience.title\')}',
    'Exclusive Premium Service': '{t(\'premiumRental.service.title\')}',
    'Premium Rental Experience': '{t(\'premiumRental.features.title\')}',
    'Perfect for Special Occasions': '{t(\'premiumRental.occasions.title\')}',
    'Luxury Vehicle Selection': '{t(\'premiumRental.fleet.title\')}',
    'Other Rental Services': '{t(\'premiumRental.otherServices.title\')}',
    'Experience Premium Car Rental in Graz': '{t(\'premiumRental.finalCta.title\')}',
    'Reserve your luxury vehicle today and elevate your journey through Austria.': '{t(\'premiumRental.finalCta.desc\')}',
    'Book Premium Vehicle': '{t(\'premiumRental.finalCta.button\')}',
  }
};

// Function to update a file with replacements
function updateFile(filename, replacements) {
  const filePath = path.join(pagesDir, filename);
  let content = fs.readFileSync(filePath, 'utf8');

  // Apply each replacement
  for (const [oldText, newText] of Object.entries(replacements)) {
    // Escape special regex characters in the search text
    const escapedOld = oldText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedOld, 'g');
    content = content.replace(regex, newText);
  }

  // Write the updated content back
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✓ Updated ${filename}`);
}

// Update all pages
for (const [filename, fileReplacements] of Object.entries(replacements)) {
  try {
    updateFile(filename, fileReplacements);
  } catch (error) {
    console.error(`✗ Error updating ${filename}:`, error.message);
  }
}

console.log('\nAll pages updated successfully!');
