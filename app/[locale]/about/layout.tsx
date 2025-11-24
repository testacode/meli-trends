import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { generateSEOMetadata } from '@/utils/metadata';
import type { Locale } from '@/i18n/config';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'about.metadata' });

  return generateSEOMetadata({
    title: t('ogTitle'),
    description: t('ogDescription'),
    path: '/about',
    locale: locale as Locale,
  });
}

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
