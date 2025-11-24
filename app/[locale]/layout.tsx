import type { Metadata } from "next";
import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import "../globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { mantineTheme } from "@/lib/mantine-theme";
import QueryProvider from "@/components/providers/QueryProvider";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { locales } from '@/i18n/config';
import { notFound } from 'next/navigation';
import { KonamiEasterEgg } from "@/components/common/KonamiEasterEgg";

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

  return {
    title: {
      default: t('title'),
      template: t('titleTemplate'),
    },
    description: t('description'),
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

  return (
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
  );
}
