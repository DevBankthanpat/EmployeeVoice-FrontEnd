import type { Metadata } from "next";
import { Inter, IBM_Plex_Sans_Thai } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getNow } from "next-intl/server";

import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const ibmPlexThai = IBM_Plex_Sans_Thai({
  variable: "--font-ibm-plex-thai",
  weight: ["400", "500", "600", "700"],
  subsets: ["thai", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Employee Voice — Organizational Signal Intelligence",
  description:
    "Share workplace signals safely. Your identity is always protected.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  const messages = await getMessages();
  const now = await getNow();

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${ibmPlexThai.variable} h-full antialiased`}
    >
      <body className="min-h-svh bg-background text-foreground">
        <NextIntlClientProvider locale={locale} messages={messages} now={now}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
