import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MeLi Trends - Tendencias de MercadoLibre',
    short_name: 'MeLi Trends',
    description:
      'Descubre los 50 productos más buscados en MercadoLibre para Argentina, Brasil, Chile, México, Colombia, Uruguay y Perú',
    start_url: '/',
    display: 'standalone',
    background_color: '#fff159',
    theme_color: '#fff159',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icon',
        sizes: '192x192',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icon',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
    categories: ['business', 'productivity', 'shopping'],
    lang: 'es',
    dir: 'ltr',
  };
}
