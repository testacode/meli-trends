import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { COUNTRIES, type SiteId } from '@/utils/constants';

interface GenerateMetadataProps {
  params: Promise<{ locale: string; country: string }>;
}

export async function generateMetadata({
  params,
}: GenerateMetadataProps): Promise<Metadata> {
  const { locale, country } = await params;
  const t = await getTranslations({ locale, namespace: 'trends' });
  const countryData = COUNTRIES[country as SiteId];

  if (!countryData) {
    return {
      title: t('countryNotFound'),
    };
  }

  const title = `${t('trendsIn')} ${countryData.name} ${countryData.flag}`;
  const description = t('countryDescription', { country: countryData.name });

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
          alt: t('countryImageAlt', { country: countryData.name }),
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
