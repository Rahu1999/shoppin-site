import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ReactQueryProvider } from "@/components/providers/ReactQueryProvider";
import { ConditionalShell } from "@/components/layout/ConditionalShell";
import { Suspense } from "react";
import { Toaster } from "sonner";
import { BRAND } from "@/config/brand";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: BRAND.siteTitle,
  description: BRAND.siteDescription,
  keywords: [
    "steel kitchen storage",
    "kitchen rack",
    "steel shelf",
    "kitchen organiser",
    "Rajesh Industries",
    "Mumbai",
  ],
  openGraph: {
    title: BRAND.siteTitle,
    description: BRAND.siteDescription,
    url: `https://${BRAND.domain}`,
    siteName: BRAND.name,
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased min-h-screen flex flex-col`}
        style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}
      >
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}');
              `}
            </Script>
          </>
        )}
        <Toaster position="top-right" richColors />
        <ReactQueryProvider>
          <Suspense fallback={null}>
            <ConditionalShell>{children}</ConditionalShell>
          </Suspense>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
