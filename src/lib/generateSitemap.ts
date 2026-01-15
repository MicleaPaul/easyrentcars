import { supabase } from './supabase';

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export async function generateSitemap(): Promise<string> {
  const baseUrl = 'https://easyrentcars.rentals';
  const urls: SitemapUrl[] = [];

  urls.push({
    loc: `${baseUrl}/`,
    changefreq: 'weekly',
    priority: 1.0,
    lastmod: new Date().toISOString().split('T')[0]
  });

  urls.push({
    loc: `${baseUrl}/rent-a-car-graz`,
    changefreq: 'monthly',
    priority: 0.9
  });

  urls.push({
    loc: `${baseUrl}/car-rental-graz`,
    changefreq: 'monthly',
    priority: 0.9
  });

  urls.push({
    loc: `${baseUrl}/cheap-car-rental-graz`,
    changefreq: 'monthly',
    priority: 0.8
  });

  urls.push({
    loc: `${baseUrl}/premium-car-rental-graz`,
    changefreq: 'monthly',
    priority: 0.8
  });

  urls.push({
    loc: `${baseUrl}/agb`,
    changefreq: 'monthly',
    priority: 0.3
  });

  urls.push({
    loc: `${baseUrl}/privacy-policy`,
    changefreq: 'monthly',
    priority: 0.3
  });

  try {
    const { data: vehicles, error } = await supabase
      .from('vehicles')
      .select('id, updated_at')
      .eq('is_hidden', false);

    if (!error && vehicles) {
      vehicles.forEach(vehicle => {
        urls.push({
          loc: `${baseUrl}/car/${vehicle.id}`,
          changefreq: 'weekly',
          priority: 0.7,
          lastmod: vehicle.updated_at ? new Date(vehicle.updated_at).toISOString().split('T')[0] : undefined
        });
      });
    }
  } catch (error) {
    console.error('Error fetching vehicles for sitemap:', error);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>${url.lastmod ? `
    <lastmod>${url.lastmod}</lastmod>` : ''}${url.changefreq ? `
    <changefreq>${url.changefreq}</changefreq>` : ''}${url.priority ? `
    <priority>${url.priority}</priority>` : ''}
  </url>`).join('\n')}
</urlset>`;

  return xml;
}
