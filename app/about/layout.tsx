import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ayuda e Información',
  description:
    'Aprende cómo funcionan los trends de MercadoLibre y cómo usar esta información para tu negocio. Guía completa sobre métricas, estrategias y análisis de tendencias.',
  openGraph: {
    title: 'Ayuda e Información | MeLi Trends',
    description:
      'Guía completa sobre trends de MercadoLibre: tipos de métricas, estrategias de negocio y análisis de productos populares.',
    url: '/about',
  },
  twitter: {
    card: 'summary',
    title: 'Ayuda e Información | MeLi Trends',
    description:
      'Guía completa sobre trends de MercadoLibre y estrategias de e-commerce.',
  },
  alternates: {
    canonical: '/about',
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
