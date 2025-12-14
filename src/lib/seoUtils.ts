interface VehicleSEO {
  id: string;
  brand: string;
  model: string;
  year: number;
  category: string;
  price_per_day: number;
  images: string[];
}

export function getVehicleSEOData(vehicle: VehicleSEO) {
  const title = `${vehicle.brand} ${vehicle.model} ${vehicle.year} Rental - EUR${vehicle.price_per_day}/day | EasyRentCars`;
  const description = `Rent ${vehicle.brand} ${vehicle.model} ${vehicle.year} in Graz from EUR${vehicle.price_per_day} per day. ${vehicle.category} car with premium features. Book online in minutes with EasyRentCars.`;
  const ogTitle = `${vehicle.brand} ${vehicle.model} ${vehicle.year} - Premium Car Rental`;
  const ogDescription = `${vehicle.category} rental in Graz from EUR${vehicle.price_per_day}/day. Unlimited mileage, flexible delivery, 24/7 support.`;
  const ogImage = vehicle.images[0] || 'https://easyrentcars.rentals/og-image.jpg';

  return {
    title,
    description,
    ogTitle,
    ogDescription,
    ogImage,
    ogType: 'product',
  };
}

export function getHomePageSEO() {
  return {
    title: 'EasyRentCars - Premium Car Rental in Graz, Austria | Luxury Vehicle Hire',
    description: 'Premium car rental in Graz, Austria. Book luxury vehicles from EUR49/day. Unlimited mileage, flexible pick-up, 24/7 support. Simple online booking in under 2 minutes.',
    ogTitle: 'EasyRentCars - Premium Car Rental in Graz',
    ogDescription: 'Luxury lifestyle rentals in Graz. Premium cars from EUR49/day with unlimited mileage and flexible delivery.',
    ogImage: 'https://easyrentcars.rentals/og-image.jpg',
    ogType: 'website',
  };
}

export function getBookingPageSEO(vehicleName: string) {
  return {
    title: `Book ${vehicleName} - Secure Reservation | EasyRentCars`,
    description: `Complete your reservation for ${vehicleName}. Secure online booking with instant confirmation. Best rates guaranteed.`,
    ogTitle: `Book ${vehicleName} - EasyRentCars`,
    ogDescription: `Reserve ${vehicleName} now with EasyRentCars. Instant confirmation and best price guarantee.`,
    ogImage: 'https://easyrentcars.rentals/og-image.jpg',
    ogType: 'website',
  };
}

export function generateVehicleStructuredData(vehicle: VehicleSEO) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${vehicle.brand} ${vehicle.model} ${vehicle.year}`,
    description: `Rent ${vehicle.brand} ${vehicle.model} ${vehicle.year} in Graz. ${vehicle.category} car available for daily rental.`,
    image: vehicle.images,
    brand: {
      '@type': 'Brand',
      name: vehicle.brand,
    },
    offers: {
      '@type': 'Offer',
      price: vehicle.price_per_day,
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: vehicle.price_per_day,
        priceCurrency: 'EUR',
        referenceQuantity: {
          '@type': 'QuantitativeValue',
          value: '1',
          unitCode: 'DAY',
        },
      },
      seller: {
        '@type': 'AutoRental',
        name: 'EasyRentCars',
        url: 'https://easyrentcars.rentals',
      },
    },
    category: vehicle.category,
  };
}

export function generateBreadcrumbStructuredData(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateFAQStructuredData(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}
