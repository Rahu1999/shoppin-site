import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ReactQueryProvider } from "@/components/providers/ReactQueryProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { Suspense } from "react";
import { Toaster } from "sonner";
import { BRAND } from "@/config/brand";

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
        <Toaster position="top-right" richColors />
        <ReactQueryProvider>
          <Suspense fallback={null}>
            <Navbar />
          </Suspense>
          <main className="flex-grow">{children}</main>
          <Footer />
          {/* Global floating WhatsApp button */}
          <WhatsAppButton />
        </ReactQueryProvider>
      </body>
    </html>
  );
}
