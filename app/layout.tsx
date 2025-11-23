import type { Metadata } from "next";
import {
  ColorSchemeScript,
  MantineProvider,
  mantineHtmlProps,
} from "@mantine/core";

import "@mantine/core/styles.css";
import "./globals.css";

import { AuthProvider } from "@/contexts/AuthContext";
import { mantineTheme } from "@/lib/mantine-theme";

export const metadata: Metadata = {
  title: {
    default: "MeLi Trends - Tendencias de MercadoLibre en Tiempo Real",
    template: "%s | MeLi Trends",
  },
  description:
    "Descubre los 50 productos más buscados y vendidos en MercadoLibre. Trends actualizados semanalmente para Argentina, Brasil, Chile, México, Colombia, Uruguay y Perú.",
  keywords: [
    "mercadolibre",
    "trends",
    "tendencias",
    "productos populares",
    "ecommerce",
    "latinoamérica",
    "argentina",
    "brasil",
    "méxico",
    "chile",
    "colombia",
    "uruguay",
    "perú",
  ],
  authors: [{ name: "MeLi Trends" }],
  creator: "MeLi Trends",
  publisher: "MeLi Trends",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://meli-trends.carlosmonti.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "MeLi Trends - Tendencias de MercadoLibre",
    description:
      "Descubre los 50 productos más buscados en MercadoLibre. Trends de Argentina, Brasil, Chile, México, Colombia, Uruguay y Perú.",
    url: "https://meli-trends.carlosmonti.com",
    siteName: "MeLi Trends",
    locale: "es_LA",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "MeLi Trends - Tendencias de MercadoLibre",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MeLi Trends - Tendencias de MercadoLibre",
    description:
      "Descubre los productos más buscados en MercadoLibre para 7 países de Latinoamérica",
    images: ["/og-image.png"],
    creator: "@melitrends",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // google: 'tu-codigo-google-search-console',
    // yandex: 'tu-codigo-yandex',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body>
        <MantineProvider theme={mantineTheme} defaultColorScheme="auto">
          <AuthProvider>{children}</AuthProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
