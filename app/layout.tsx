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
  title: "Meli Trends",
  description: "Analyze Mercado Libre product trends with ease.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" {...mantineHtmlProps}>
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
