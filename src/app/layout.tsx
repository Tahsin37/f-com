import type { Metadata } from "next";
import { Space_Grotesk, Noto_Sans_Bengali } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/components/query-provider";
import { I18nProvider } from "@/lib/i18n";
import { Toaster } from "@/components/ui/sonner";
import { CartProvider } from "@/lib/CartContext";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const notoSansBengali = Noto_Sans_Bengali({
  variable: "--font-noto-bengali",
  subsets: ["bengali"],
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
                {children}
                <Toaster />
              </ThemeProvider>
            </CartProvider>
          </QueryProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
