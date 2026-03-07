import type { Metadata } from "next";
import { Space_Grotesk, Noto_Sans_Bengali } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/components/query-provider";
import { I18nProvider } from "@/lib/i18n";
import { Toaster } from "@/components/ui/sonner";
import { CartProvider } from "@/lib/CartContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  preload: false,
});

const notoSansBengali = Noto_Sans_Bengali({
  variable: "--font-noto-bengali",
  subsets: ["bengali"],
  preload: false,
});

export const metadata: Metadata = {
  title: "F-Manager | Facebook & Instagram Selling Simplified",
  description: "An all-in-one automated sales & logistics platform for F-commerce sellers in Bangladesh.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0d9488" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body
        className={`${spaceGrotesk.variable} ${notoSansBengali.variable} font-sans antialiased`}
      >
        <I18nProvider>
          <QueryProvider>
            <CartProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
              >
                <ErrorBoundary>
                  {children}
                </ErrorBoundary>
                <Toaster />
              </ThemeProvider>
            </CartProvider>
          </QueryProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
