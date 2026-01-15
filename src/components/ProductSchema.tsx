import { useEffect } from 'react';

interface ProductSchemaProps {
  name: string;
  description: string;
  image: string[];
  brand: string;
  model: string;
  year: number;
  price: number;
  availability: 'InStock' | 'OutOfStock';
  url: string;
}

export function ProductSchema({
  name,
  description,
  image,
  brand,
  model,
  year,
  price,
  availability,
  url
}: ProductSchemaProps) {
  useEffect(() => {
    const schema = {
      '@context': 'https://schema.org/',
      '@type': 'Product',
      name: name,
      description: description,
      image: image,
      brand: {
        '@type': 'Brand',
        name: brand
      },
      model: model,
      productionDate: year.toString(),
      offers: {
        '@type': 'Offer',
        url: url,
        priceCurrency: 'EUR',
        price: price,
        priceValidUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        availability: `https://schema.org/${availability}`,
        seller: {
          '@type': 'Organization',
          name: 'EasyRentCars'
        }
      },
      category: 'Car Rental',
      itemCondition: 'https://schema.org/UsedCondition'
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    script.id = 'product-schema';

    const existingScript = document.getElementById('product-schema');
    if (existingScript) {
      existingScript.remove();
    }

    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.getElementById('product-schema');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [name, description, image, brand, model, year, price, availability, url]);

  return null;
}
