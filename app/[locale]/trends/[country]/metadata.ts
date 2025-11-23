import type { Metadata } from 'next';
import { COUNTRIES, type SiteId } from '@/utils/constants';

interface GenerateMetadataProps {
  params: Promise<{ country: string }>;
}

export async function generateMetadata({
  params,
}: GenerateMetadataProps): Promise<Metadata> {
  const { country } = await params;
  const countryData = COUNTRIES[country as SiteId];

  if (!countryData) {
    return {
      title: 'País no encontrado',
    };
  }

  const title = `Tendencias en ${countryData.name} ${countryData.flag}`;
  const description = `Descubre los 50 productos más buscados y vendidos en MercadoLibre ${countryData.name}. Trends actualizados semanalmente.`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | MeLi Trends`,
      description,
      url: `/trends/${country}`,
      images: [
        {
          url: `/og-${country}.png`,
          width: 1200,
          height: 630,
          alt: `Trends de ${countryData.name}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | MeLi Trends`,
      description,
      images: [`/og-${country}.png`],
    },
    alternates: {
      canonical: `/trends/${country}`,
    },
  };
}
