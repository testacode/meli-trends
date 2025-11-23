import { MetadataRoute } from 'next';
import { COUNTRIES_ARRAY } from '@/utils/constants';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://meli-trends.carlosmonti.com';

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];

  // Dynamic country pages
  const countryPages: MetadataRoute.Sitemap = COUNTRIES_ARRAY.map((country) => ({
    url: `${baseUrl}/trends/${country.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  return [...staticPages, ...countryPages];
}
