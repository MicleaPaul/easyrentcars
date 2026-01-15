import { useEffect } from 'react';

interface StructuredDataProps {
  type?: 'organization' | 'vehicle' | 'breadcrumb' | 'faq';
  data?: any;
}

export function StructuredData({ type = 'organization', data }: StructuredDataProps) {
  useEffect(() => {
    let schema;

    if (type === 'vehicle' && data) {
      schema = data;
    } else if (type === 'breadcrumb' && data) {
      schema = data;
    } else if (type === 'faq' && data) {
      schema = data;
    } else {
      schema = getOrganizationSchema();
    }

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = `structured-data-${type}`;
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      const existingScript = document.getElementById(`structured-data-${type}`);
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, [type, data]);

  return null;
}

function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'AutoRental'],
    '@id': 'https://easyrentcars.rentals/#organization',
    name: 'EasyRentCars',
    alternateName: 'Easy Rent Cars Graz',
    description: 'Premium car rental service in Graz, Austria. Luxury lifestyle rentals with flexible booking and delivery. Rent vehicles from €49/day with unlimited mileage.',
    url: 'https://easyrentcars.rentals',
    logo: {
      '@type': 'ImageObject',
      url: 'https://easyrentcars.rentals/logosite.png',
      width: 250,
      height: 60,
    },
    image: [
      'https://easyrentcars.rentals/og-image.jpg',
      'https://images.pexels.com/photos/3764984/pexels-photo-3764984.jpeg'
    ],
    telephone: '+43-664-1584950',
    email: 'info@easyrentcars.rentals',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Alte Poststraße 152',
      addressLocality: 'Graz',
      addressRegion: 'Styria',
      postalCode: '8020',
      addressCountry: 'AT',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 47.0707,
      longitude: 15.4395,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '18:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday', 'Sunday'],
        opens: '10:00',
        closes: '16:00',
      },
    ],
    priceRange: '€49-€98',
    currenciesAccepted: 'EUR',
    paymentAccepted: 'Cash, Credit Card, Debit Card',
    areaServed: [
      {
        '@type': 'City',
        name: 'Graz',
      },
      {
        '@type': 'State',
        name: 'Styria',
      },
      {
        '@type': 'Country',
        name: 'Austria',
      },
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      bestRating: '5',
      worstRating: '1',
      ratingCount: '127',
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: '+43-664-1584950',
        contactType: 'Customer Service',
        email: 'info@easyrentcars.rentals',
        availableLanguage: ['de', 'en', 'ro'],
        areaServed: 'AT',
      },
      {
        '@type': 'ContactPoint',
        telephone: '+43-664-1584950',
        contactType: 'Reservations',
        availableLanguage: ['de', 'en', 'ro'],
        areaServed: 'AT',
      },
    ],
    sameAs: [
      'https://easyrentcars.rentals',
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Car Rental Services',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Product',
            name: 'Economy Car Rental',
            description: 'Affordable economy cars starting from €49/day',
            offers: {
              '@type': 'Offer',
              price: '49',
              priceCurrency: 'EUR',
              availability: 'https://schema.org/InStock',
              url: 'https://easyrentcars.rentals/',
            },
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Product',
            name: 'Premium Car Rental',
            description: 'Luxury premium vehicles for a superior driving experience',
            offers: {
              '@type': 'Offer',
              price: '89',
              priceCurrency: 'EUR',
              availability: 'https://schema.org/InStock',
              url: 'https://easyrentcars.rentals/',
            },
          },
        },
      ],
    },
  };
}
