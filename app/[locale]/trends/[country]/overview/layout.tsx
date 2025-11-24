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
  const t = await getTranslations({ locale, namespace: "overview" });

  const countryData = COUNTRIES[country as SiteId];
  const countryName = countryData?.name || country;

  return generateSEOMetadata({
    title: `${t("title")} - ${countryName} | MeLi Trends`,
    description: t("description"),
    path: `/trends/${country}/overview`,
    locale: locale as Locale,
  });
}

export default function OverviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
