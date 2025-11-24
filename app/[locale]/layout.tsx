import type { Metadata } from "next";
import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import "../globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { mantineTheme } from "@/lib/mantine-theme";
import QueryProvider from "@/components/providers/QueryProvider";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { locales, type Locale } from '@/i18n/config';
import { notFound } from 'next/navigation';
import { KonamiEasterEgg } from "@/components/common/KonamiEasterEgg";
import { generateSEOMetadata } from "@/utils/metadata";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });

  // Generate SEO metadata with Open Graph, Twitter Cards, and hreflang
  const seoMetadata = generateSEOMetadata({
    title: t('title'),
    description: t('description'),
    path: '',
    locale: locale as Locale,
  });

  return {
    ...seoMetadata,
    title: {
      default: t('title'),
      template: t('titleTemplate'),
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate locale
  if (!locales.includes(locale as typeof locales[number])) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  // Get messages for this locale
  const messages = await getMessages();
  const t = await getTranslations({ locale, namespace: 'metadata' });

  // JSON-LD structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'MeLi Trends',
    description: t('description'),
    url: 'https://meli-trends.carlosmonti.com',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    author: {
      '@type': 'Person',
      name: 'Carlos Monti',
      url: 'https://carlosmonti.com',
    },
    inLanguage: ['es', 'en', 'pt-BR'],
    availableLanguage: [
      {
        '@type': 'Language',
        name: 'Spanish',
        alternateName: 'es',
      },
      {
        '@type': 'Language',
        name: 'English',
        alternateName: 'en',
      },
      {
        '@type': 'Language',
        name: 'Portuguese',
        alternateName: 'pt-BR',
      },
    ],
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <NextIntlClientProvider messages={messages}>
        <MantineProvider theme={mantineTheme} defaultColorScheme="auto">
          <QueryProvider>
            <AuthProvider>
              {children}
              <KonamiEasterEgg />
            </AuthProvider>
          </QueryProvider>
        </MantineProvider>
      </NextIntlClientProvider>
    </>
  );
}
