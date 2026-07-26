import type { Metadata } from 'next';
import { BRAND } from '@/config/brand';
import HomeClient from './HomeClient';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
const SITE_URL = `https://${BRAND.domain}`;

async function fetchProducts(query: string) {
  try {
    const res = await fetch(`${API_BASE}/products?${query}`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const json = await res.json();
    const data = json.data || json;
    return data.items || [];
  } catch {
    return [];
  }
}

async function getDisplayProducts() {
  const featured = await fetchProducts('isFeatured=true&limit=6');
  if (featured.length > 0) return featured;
  return fetchProducts('limit=6');
}

export const metadata: Metadata = {
  title: BRAND.siteTitle,
  description: BRAND.siteDescription,
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: BRAND.siteTitle,
    description: BRAND.siteDescription,
    url: SITE_URL,
    siteName: BRAND.name,
    type: 'website',
  },
};

export default async function Home() {
  const displayProducts = await getDisplayProducts();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE_URL}/#organization`,
    name: BRAND.name,
    description: BRAND.siteDescription,
    url: SITE_URL,
    telephone: BRAND.phone,
    email: BRAND.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Sonawala Road',
      addressLocality: 'Goregaon East, Mumbai',
      addressRegion: 'Maharashtra',
      postalCode: '400063',
      addressCountry: 'IN',
    },
    sameAs: [BRAND.whatsappBaseUrl],
  };

  return (
    <>
      {/* eslint-disable-next-line react/no-danger */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeClient displayProducts={displayProducts} />
    </>
  );
}
