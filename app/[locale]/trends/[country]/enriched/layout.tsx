import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { generateSEOMetadata } from "@/utils/metadata";
import type { Locale } from "@/i18n/config";
import { COUNTRIES, type SiteId } from "@/utils/constants";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; country: string }>;
}): Promise<Metadata> {
  const { locale, country } = await params;
  const t = await getTranslations({ locale, namespace: "enriched" });
  const trendsT = await getTranslations({ locale, namespace: "trends" });

  const countryData = COUNTRIES[country as SiteId];
  const countryName = countryData?.name || country;

  return generateSEOMetadata({
    title: `${trendsT("enrichedTitle")} - ${countryName} | MeLi Trends`,
    description: t("description"),
    path: `/trends/${country}/enriched`,
    locale: locale as Locale,
  });
}

export default function EnrichedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
