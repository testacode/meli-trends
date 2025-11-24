import type { Metadata } from "next";
import type { Locale } from "@/i18n/config";

type MetadataParams = {
  title: string;
  description: string;
  path: string;
  image?: string;
  locale: Locale;
  alternateLocales?: Locale[];
};

const BASE_URL = "https://meli-trends.carlosmonti.com";

/**
 * Generates comprehensive metadata for SEO including Open Graph, Twitter Cards, and alternates
 * @param params - Metadata configuration parameters
 * @returns Next.js Metadata object with SEO tags
 */
export function generateSEOMetadata(params: MetadataParams): Metadata {
  const {
    title,
    description,
    path,
    image = `${BASE_URL}/og-image.png`,
    locale,
    alternateLocales = ["es", "en", "pt-BR"] as Locale[],
  } = params;

  const url = `${BASE_URL}/${locale}${path}`;

  // Build alternate language URLs
  const languages: Record<string, string> = {};
  alternateLocales.forEach((loc) => {
    languages[loc] = `${BASE_URL}/${loc}${path}`;
  });

  return {
    title,
    description,
    metadataBase: new URL(BASE_URL),
    alternates: {
      canonical: url,
      languages,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "MeLi Trends",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

/**
 * Generates alternate links for hreflang tags
 * @param path - Current page path (without locale)
 * @param locales - Array of supported locales
 * @returns Array of alternate link objects
 */
export function generateAlternateLinks(
  path: string,
  locales: Locale[] = ["es", "en", "pt-BR"]
) {
  return locales.map((locale) => ({
    hrefLang: locale,
    href: `${BASE_URL}/${locale}${path}`,
  }));
}
