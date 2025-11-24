import type { Metadata } from "next";
import { ColorSchemeScript, mantineHtmlProps } from "@mantine/core";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

// Metadata is now in [locale]/layout.tsx since it needs to be localized
export const metadata: Metadata = {
  metadataBase: new URL("https://meli-trends.carlosmonti.com"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body>
          {children}
          <Analytics />
        </body>
    </html>
  );
}
