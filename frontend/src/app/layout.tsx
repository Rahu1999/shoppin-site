import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { ReactQueryProvider } from "@/components/providers/ReactQueryProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Suspense } from "react";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ModernShop - Premium eCommerce Platform",
  description: "A production-grade scalable electronics and fashion storefront.",
};

import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${robotoMono.variable} antialiased min-h-screen flex flex-col`}>
        <Toaster position="top-right" richColors />
        <ReactQueryProvider>
          <Suspense fallback={null}>
            <Navbar />
          </Suspense>
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </ReactQueryProvider>
      </body>
    </html>
  );
}
